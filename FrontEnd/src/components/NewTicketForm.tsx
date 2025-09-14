import { useState, useEffect } from 'react'
import { toast, Toaster } from 'react-hot-toast'
import api from '@/services/api'
import { Button } from '@/components/ui/button'
import { useNavigate } from 'react-router-dom'

const NewTicketForm: React.FC = () => {
    const [title, setTitle] = useState('')
    const [description, setDescription] = useState('')
    const [priority, setPriority] = useState('basse')
    const [priorityChoices, setPriorityChoices] = useState<[string, string][]>([])
    const navigate = useNavigate()

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

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!title || !description) {
            toast.error('Merci de remplir tous les champs')
            return
        }

        try {
            await api.post('api/ticket/', { title, description, priority })
            setTitle('')
            setDescription('')
            setPriority('basse')
            toast.success('Ticket enregistré avec succès')
            navigate('/dashboard/tickets')
        } catch (error) {
            console.error(error)
            toast.error("Erreur dans l'enregistrement du ticket")
        }
    }

    return (
        <div className="max-w-xl mx-auto mt-10 p-8 bg-white rounded-lg shadow-md min-h-[500px]">
            <Toaster />
            <Button
                variant="outline"
                className="mb-6"
                onClick={() => navigate('/dashboard/tickets')}
            >
                ← Retour aux tickets
            </Button>

            <h2 className="text-2xl font-semibold mb-6 w-sm">Créer un nouveau ticket</h2>

            <form className="space-y-6" onSubmit={handleSubmit}>
                {/* Input Titre */}
                <div className="border-b border-gray-300 pb-2">
                    <input
                        type="text"
                        placeholder="Titre"
                        value={title}
                        onChange={e => setTitle(e.target.value)}
                        className="w-full text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-0 bg-transparent"
                    />
                </div>

                {/* Textarea Description */}
                <div className="border-b border-gray-300 pb-2">
                    <textarea
                        placeholder="Description"
                        value={description}
                        onChange={e => setDescription(e.target.value)}
                        className="w-full min-h-[150px] text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-0 bg-transparent"
                    />
                </div>

                {/* Select Priorité */}
                <div className="border border-gray-300 rounded-md p-2">
                    <select
                        value={priority}
                        onChange={e => setPriority(e.target.value)}
                        className="w-full text-gray-800 bg-white focus:outline-none"
                    >
                        <option value="">-- Sélectionner une priorité --</option>
                        {priorityChoices.map(([value, label]) => (
                            <option key={value} value={value}>
                                {label}
                            </option>
                        ))}
                    </select>
                </div>

                <Button type="submit" className="w-full">
                    Ajouter
                </Button>
            </form>
        </div>
    )
}

export default NewTicketForm
