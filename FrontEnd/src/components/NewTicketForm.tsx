import { useState, useEffect } from 'react'
import { toast, Toaster } from 'react-hot-toast'
import api from '@/services/api'
import { Button } from '@/components/ui/button'
import { useNavigate } from 'react-router-dom'
import { X, Upload, FileText, Image, Download } from 'lucide-react'
import { useTheme } from 'next-themes'

interface Attachment {
  id?: number
  file: File
  title?: string
  preview?: string
}

const NewTicketForm: React.FC = () => {
    const [title, setTitle] = useState('')
    const [description, setDescription] = useState('')
    const [priority, setPriority] = useState('basse')
    const [priorityChoices, setPriorityChoices] = useState<[string, string][]>([])
    const [attachments, setAttachments] = useState<Attachment[]>([])
    const [uploading, setUploading] = useState(false)
    const navigate = useNavigate()
    const { theme } = useTheme()

    useEffect(() => {
        const getChoices = async () => {
            try {
                const res = await api.get<{ priority: [string, string][] }>(
                    'api/ticket/choices/'
                )
                setPriorityChoices(res.data.priority)
            } catch (error) {
                console.error(error)
                toast.error('Erreur de chargement des priorités')
            }
        }
        getChoices()
    }, [])

    // Gestion des fichiers
    const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
        const files = event.target.files
        if (!files) return

        const newAttachments: Attachment[] = []

        for (let i = 0; i < files.length; i++) {
            const file = files[i]

            // Vérification de la taille (10MB max)
            if (file.size > 10 * 1024 * 1024) {
                toast.error(`Le fichier "${file.name}" dépasse la taille maximale de 10MB`)
                continue
            }

            // Générer une prévisualisation pour les images
            let preview = undefined
            if (file.type.startsWith('image/')) {
                preview = URL.createObjectURL(file)
            }

            newAttachments.push({
                file,
                title: file.name,
                preview
            })
        }

        setAttachments(prev => [...prev, ...newAttachments])
        event.target.value = '' // Reset l'input
    }

    const removeAttachment = (index: number) => {
        setAttachments(prev => {
            const newAttachments = [...prev]
            // Libérer l'URL de prévisualisation si elle existe
            if (newAttachments[index].preview) {
                URL.revokeObjectURL(newAttachments[index].preview!)
            }
            newAttachments.splice(index, 1)
            return newAttachments
        })
    }

    // Upload des attachments après création du ticket
    const uploadAttachments = async (ticketId: number) => {
        if (attachments.length === 0) return

        const uploadPromises = attachments.map(async (attachment) => {
            const formData = new FormData()
            formData.append('file', attachment.file)
            if (attachment.title) {
                formData.append('title', attachment.title)
            }

            try {
                await api.post(`api/ticket/${ticketId}/attachments/`, formData, {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                })
            } catch (error) {
                console.error('Erreur upload attachment:', error)
                throw error
            }
        })

        await Promise.all(uploadPromises)
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!title || !description) {
            toast.error('Merci de remplir tous les champs')
            return
        }

        try {
            setUploading(true)

            // 1. Créer le ticket
            const ticketResponse = await api.post('api/ticket/', {
                title,
                description,
                priority
            })

            const ticketId = ticketResponse.data.id

            // 2. Uploader les attachments si il y en a
            if (attachments.length > 0) {
                await uploadAttachments(ticketId)
            }

            // 3. Reset et navigation
            setTitle('')
            setDescription('')
            setPriority('basse')
            setAttachments([])

            toast.success('Ticket créé avec succès' + (attachments.length > 0 ? ` avec ${attachments.length} pièce(s) jointe(s)` : ''))
            navigate('/dashboard/tickets')

        } catch (error) {
            console.error(error)
            toast.error("Erreur dans l'enregistrement du ticket")
        } finally {
            setUploading(false)
        }
    }

    // Nettoyer les URLs de prévisualisation
    useEffect(() => {
        return () => {
            attachments.forEach(attachment => {
                if (attachment.preview) {
                    URL.revokeObjectURL(attachment.preview)
                }
            })
        }
    }, [attachments])

    const getFileIcon = (file: File) => {
        if (file.type.startsWith('image/')) return <Image className="h-4 w-4" />
        if (file.type.includes('pdf')) return <FileText className="h-4 w-4" />
        return <FileText className="h-4 w-4" />
    }

    const formatFileSize = (bytes: number) => {
        if (bytes === 0) return '0 Bytes'
        const k = 1024
        const sizes = ['Bytes', 'KB', 'MB', 'GB']
        const i = Math.floor(Math.log(bytes) / Math.log(k))
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
    }

    // Classes CSS conditionnelles pour le thème
    const containerClass = `max-w-2xl mx-auto mt-10 p-8 rounded-lg shadow-md min-h-[500px] ${
        theme === 'dark' ? 'bg-gray-900 text-white' : 'bg-white text-gray-900'
    }`

    const inputClass = `w-full placeholder-gray-400 focus:outline-none focus:ring-0 bg-transparent ${
        theme === 'dark' ? 'text-white' : 'text-gray-800'
    }`

    const borderClass = theme === 'dark' ? 'border-gray-700' : 'border-gray-300'
    const placeholderClass = theme === 'dark' ? 'placeholder-gray-500' : 'placeholder-gray-400'

    const selectClass = `w-full focus:outline-none ${
        theme === 'dark'
            ? 'bg-gray-800 text-white border-gray-700'
            : 'bg-white text-gray-800 border-gray-300'
    }`

    const attachmentZoneClass = `border-2 border-dashed rounded-lg p-6 text-center transition-colors mb-4 ${
        theme === 'dark'
            ? 'border-gray-600 hover:border-gray-500 bg-gray-800'
            : 'border-gray-300 hover:border-gray-400 bg-gray-50'
    }`

    const attachmentItemClass = `flex items-center justify-between p-3 rounded-lg border ${
        theme === 'dark'
            ? 'bg-gray-800 border-gray-700'
            : 'bg-gray-50 border-gray-200'
    }`

    const textColorClass = theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
    const textColorDarkClass = theme === 'dark' ? 'text-gray-200' : 'text-gray-800'
    const textMutedClass = theme === 'dark' ? 'text-gray-500' : 'text-gray-600'

    return (
        <div className={containerClass}>
            <Toaster />
            <Button
                variant="outline"
                className={`mb-6 ${
                    theme === 'dark'
                        ? 'border-gray-700 text-white hover:bg-gray-800'
                        : 'border-gray-300 text-gray-900 hover:bg-gray-100'
                }`}
                onClick={() => navigate('/dashboard/tickets')}
            >
                ← Retour aux tickets
            </Button>

            <h2 className={`text-2xl font-semibold mb-6 ${textColorDarkClass}`}>
                Créer un nouveau ticket
            </h2>

            <form className="space-y-6" onSubmit={handleSubmit}>
                {/* Input Titre */}
                <div className={`border-b pb-2 ${borderClass}`}>
                    <input
                        type="text"
                        placeholder="Titre *"
                        value={title}
                        onChange={e => setTitle(e.target.value)}
                        className={`${inputClass} ${placeholderClass}`}
                        required
                    />
                </div>

                {/* Textarea Description */}
                <div className={`border-b pb-2 ${borderClass}`}>
                    <textarea
                        placeholder="Description *"
                        value={description}
                        onChange={e => setDescription(e.target.value)}
                        className={`${inputClass} ${placeholderClass} min-h-[150px] resize-vertical`}
                        required
                    />
                </div>

                {/* Select Priorité */}
                <div className={`border rounded-md p-2 ${borderClass}`}>
                    <select
                        value={priority}
                        onChange={e => setPriority(e.target.value)}
                        className={selectClass}
                    >
                        <option value="">-- Sélectionner une priorité --</option>
                        {priorityChoices.map(([value, label]) => (
                            <option key={value} value={value}>
                                {label}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Upload d'attachments */}
                <div className={`border rounded-lg p-4 ${borderClass}`}>
                    <label className={`block text-sm font-medium mb-3 ${textColorClass}`}>
                        Pièces jointes (optionnel)
                    </label>

                    {/* Zone de drop */}
                    <div className={attachmentZoneClass}>
                        <input
                            type="file"
                            multiple
                            onChange={handleFileSelect}
                            className="hidden"
                            id="file-upload"
                            accept="*/*"
                        />
                        <label
                            htmlFor="file-upload"
                            className="cursor-pointer flex flex-col items-center justify-center space-y-2"
                        >
                            <Upload className={`h-8 w-8 ${
                                theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                            }`} />
                            <div className="text-sm">
                                <span className={`font-medium ${
                                    theme === 'dark'
                                        ? 'text-blue-400 hover:text-blue-300'
                                        : 'text-blue-600 hover:text-blue-500'
                                }`}>
                                    Cliquez pour uploader
                                </span>
                                <span className={textMutedClass}> ou glissez-déposez</span>
                            </div>
                            <p className={`text-xs ${textMutedClass}`}>
                                Fichiers jusqu'à 10MB (images, PDF, documents, etc.)
                            </p>
                        </label>
                    </div>

                    {/* Liste des fichiers sélectionnés */}
                    {attachments.length > 0 && (
                        <div className="space-y-2">
                            <p className={`text-sm font-medium ${textColorClass}`}>
                                Fichiers sélectionnés ({attachments.length})
                            </p>
                            {attachments.map((attachment, index) => (
                                <div
                                    key={index}
                                    className={attachmentItemClass}
                                >
                                    <div className="flex items-center space-x-3 flex-1 min-w-0">
                                        <div className="flex-shrink-0">
                                            {attachment.preview ? (
                                                <img
                                                    src={attachment.preview}
                                                    alt="Preview"
                                                    className="h-10 w-10 object-cover rounded"
                                                />
                                            ) : (
                                                <div className={`h-10 w-10 rounded flex items-center justify-center ${
                                                    theme === 'dark'
                                                        ? 'bg-gray-700'
                                                        : 'bg-gray-200'
                                                }`}>
                                                    {getFileIcon(attachment.file)}
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className={`text-sm font-medium truncate ${textColorDarkClass}`}>
                                                {attachment.file.name}
                                            </p>
                                            <p className={`text-xs ${textMutedClass}`}>
                                                {formatFileSize(attachment.file.size)} • {attachment.file.type}
                                            </p>
                                        </div>
                                    </div>
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => removeAttachment(index)}
                                        className={`flex-shrink-0 ${
                                            theme === 'dark'
                                                ? 'text-gray-400 hover:text-red-400 hover:bg-red-900/50'
                                                : 'text-gray-400 hover:text-red-500 hover:bg-red-50'
                                        }`}
                                    >
                                        <X className="h-4 w-4" />
                                    </Button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <Button
                    type="submit"
                    className="w-full"
                    disabled={uploading || !title || !description}
                >
                    {uploading ? (
                        <div className="flex items-center justify-center space-x-2">
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                            <span>Création en cours...</span>
                        </div>
                    ) : (
                        'Créer le ticket'
                    )}
                </Button>
            </form>
        </div>
    )
}

export default NewTicketForm
