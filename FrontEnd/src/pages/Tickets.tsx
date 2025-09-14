import { Trash2, Eye } from 'lucide-react'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'

import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import api from '../services/api'
import { useAuth } from '../context/AuthContext'
import { toast, Toaster } from 'react-hot-toast'

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from '@/components/ui/dialog'

interface User {
    id: number
    username: string
    email: string
    first_name: string
    last_name: string
    profile_picture: string | null
    role?: string
}

interface Comment {
    id: number
    content: string
    author: User
    created_at: string
}

interface Ticket {
    id: number
    title: string
    description: string
    status: string
    priority?: string
    developer?: User | null
    author?: User
    comments?: Comment[]
}

export default function Tickets() {
    const { filter } = useParams<{ filter?: string }>()
    const { user } = useAuth()
    const [tickets, setTickets] = useState<Ticket[]>([])
    const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null)
    const [dialogOpen, setDialogOpen] = useState(false)
    const [newComment, setNewComment] = useState('')
    const [loadingComment, setLoadingComment] = useState(false)

    // dictionnaire des labels
    const [statusLabels, setStatusLabels] = useState<Record<string, string>>({})
    const [priorityLabels, setPriorityLabels] = useState<Record<string, string>>({})

    useEffect(() => {
        getTickets()
        getChoices()
        fetchDevs()
    }, [filter])

    const fetchDevs = async () => {
        try {
            const res = await api.get('/api/users/')
            if (res.data && Array.isArray(res.data.developers)) setDevs(res.data.developers)
        } catch (err) {
            console.error(err)
            setDevs([])
        }
    }

    const handleAssignDev = async (ticketId: number, devId: number) => {
        try {
            await api.patch(`api/ticket/${ticketId}/accepted/`, { developer: devId })
            toast.success('Développeur assigné')
            getTickets()
        } catch {
            toast.error("Erreur d'assignation")
        }
    }

    const handleChangeStatus = async (ticketId: number, newStatus: string) => {
        try {
            await api.patch(`api/ticket/${ticketId}/status/`, { status: newStatus })
            toast.success('Statut mis à jour')
            getTickets()
        } catch {
            toast.error('Erreur lors du changement de statut')
        }
    }

    const getTickets = async () => {
        try {
            const res = await api.get<{ results: Ticket[] }>('api/ticket/')
            let data: Ticket[] = res.data.results

            if (filter === 'assignes') {
                data = data.filter(t => t.developer)
            } else if (filter === 'non-assignes') {
                data = data.filter(t => !t.developer)
            } else if (filter === 'resolus') {
                data = data.filter(t => t.status === 'resolved')
            }

            setTickets(data)
        } catch (error) {
            console.error(error)
            toast.error('Erreur lors du chargement des tickets')
        }
    }

    const handleAssignToMe = async (ticketId: number) => {
        try {
            await api.patch(`api/ticket/${ticketId}/accepted/`)
            toast.success('Ticket pris en charge !')
            getTickets()
        } catch (error) {
            console.error(error)
            toast.error('Impossible de prendre en charge ce ticket')
        }
    }

    const deleteTicket = async (id: number) => {
        try {
            await api.delete(`api/ticket/${id}/`)
            toast.success('Ticket supprimé avec succès')
            getTickets()
        } catch (error) {
            console.error(error)
            toast.error('Erreur lors de la suppression')
        }
    }

    const handleAddComment = async () => {
        if (!newComment.trim() || !selectedTicket) {
            toast.error('Le commentaire ne peut pas être vide')
            return
        }
        try {
            setLoadingComment(true)
            await api.post(`api/ticket/${selectedTicket.id}/comment/`, { content: newComment })
            const res = await api.get<Ticket>(`api/ticket/${selectedTicket.id}/`)
            setSelectedTicket(res.data)
            setNewComment('')
            toast.success('Commentaire ajouté avec succès')
        } catch (error) {
            console.error(error)
            toast.error("Erreur lors de l'ajout du commentaire")
        } finally {
            setLoadingComment(false)
        }
    } // Récupérer les choix depuis l’API
    const getChoices = async () => {
        try {
            const res = await api.get('/api/ticket/choices/')
            const { status, priority } = res.data

            setStatusLabels(
                Object.fromEntries(status.map(([value, label]: [string, string]) => [value, label]))
            )
            setPriorityLabels(
                Object.fromEntries(
                    priority.map(([value, label]: [string, string]) => [value, label])
                )
            )
        } catch (err) {
            console.error('Erreur récupération choices', err)
        }
    }

    const totalTickets = tickets.length
    const unassignedTickets = tickets.filter(t => !t.developer).length
    const resolvedTickets = tickets.filter(t => t.status === 'resolved').length

    const [devs, setDevs] = useState<User[]>([]) // liste des devs pour admin

    return (
        <div className="p-4 space-y-6">
            <Toaster />

            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-muted/50 aspect-video rounded-xl flex flex-col items-center justify-center">
                    <p className="text-2xl font-bold">{totalTickets}</p>
                    <p className="text-gray-600">Total</p>
                </div>
                <div className="bg-yellow-100 aspect-video rounded-xl flex flex-col items-center justify-center">
                    <p className="text-2xl font-bold">{unassignedTickets}</p>
                    <p className="text-gray-600">Non assignés</p>
                </div>
                <div className="bg-green-100 aspect-video rounded-xl flex flex-col items-center justify-center">
                    <p className="text-2xl font-bold">{resolvedTickets}</p>
                    <p className="text-gray-600">Résolus</p>
                </div>
            </div>

            {/* Titre */}
            <h1 className="text-xl font-bold">
                {filter === 'assignes' && 'Tickets assignés'}
                {filter === 'non-assignes' && 'Tickets non assignés'}
                {filter === 'resolus' && 'Tickets résolus'}
                {!filter && 'Tous les tickets'}
            </h1>

            {/* Tableau */}

            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>#</TableHead>
                        <TableHead>Titre</TableHead>
                        <TableHead>Priorite</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Assigné à</TableHead>
                        <TableHead className="text-center">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {tickets.map((ticket, i) => (
                        <TableRow key={ticket.id}>
                            <TableCell>{i + 1}</TableCell>
                            <TableCell>{ticket.title}</TableCell>
                            <TableCell>
                                {ticket.priority ? priorityLabels[ticket.priority] ?? ticket.priority : "N/A"}

                            </TableCell>
                            {/* status → modifiable si dev */}
                            <TableCell>
                                {user?.role?.toLowerCase() === 'developer' &&
                                ticket.developer?.id === user.id ? (
                                    <select
                                        value={ticket.status}
                                        onChange={e =>
                                            handleChangeStatus(ticket.id, e.target.value)
                                        }
                                        className="border rounded px-2 py-1"
                                    >
                                        {Object.entries(statusLabels).map(([value, label]) => (
                                            <option key={value} value={value}>
                                                {label}
                                            </option>
                                        ))}
                                    </select>
                                ) : (
                                    statusLabels[ticket.status] ?? ticket.status
                                )}
                            </TableCell>
                            <TableCell className="font-bold">
                                {ticket.developer ? (
                                    ticket.developer.username
                                ) : user?.role?.toLowerCase() === 'admin' ? (
                                    <select
                                        onChange={e =>
                                            handleAssignDev(ticket.id, parseInt(e.target.value))
                                        }
                                        defaultValue=""
                                        className="border rounded px-2 py-1"
                                    >
                                        <option value="">-- Choisir dev --</option>
                                        {devs.map(dev => (
                                            <option key={dev.id} value={dev.id}>
                                                {dev.username}
                                            </option>
                                        ))}
                                    </select>
                                ) : (
                                    <>
                                        <p className="text-red-400 text-sm">Non assigné</p>
                                        {user?.role?.toLowerCase() === 'developer' && (
                                            <Button
                                                size="sm"
                                                onClick={() => handleAssignToMe(ticket.id)}
                                                className="mt-1"
                                            >
                                                Prendre en charge
                                            </Button>
                                        )}
                                    </>
                                )}
                            </TableCell>
                            <TableCell>
                                <div className="grid grid-cols-2 gap-1">
                                    {/* Voir plus */}
                                    <TooltipProvider>
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <Button
                                                    size="icon"
                                                    variant="outline"
                                                    onClick={() => {
                                                        setSelectedTicket(ticket)
                                                        setDialogOpen(true)
                                                    }}
                                                    className="h-10 w-12"
                                                >
                                                    <Eye className="h-4 w-4" />
                                                </Button>
                                            </TooltipTrigger>
                                            <TooltipContent>
                                                <p>Voir plus</p>
                                            </TooltipContent>
                                        </Tooltip>
                                    </TooltipProvider>

                                    {/* Supprimer (uniquement si auteur) */}
                                    {ticket.author?.id === user?.id && (
                                        <TooltipProvider>
                                            <Tooltip>
                                                <TooltipTrigger asChild>
                                                    <Button
                                                        size="icon"
                                                        variant="destructive"
                                                        onClick={() => deleteTicket(ticket.id)}
                                                        className="h-10 w-12"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </TooltipTrigger>
                                                <TooltipContent>
                                                    <p>Supprimer</p>
                                                </TooltipContent>
                                            </Tooltip>
                                        </TooltipProvider>
                                    )}
                                </div>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>

            {/* Dialog voir plus */}
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogContent className="max-w-2xl">
                    {selectedTicket ? (
                        <>
                            <DialogHeader>
                                <DialogTitle>{selectedTicket.title}</DialogTitle>
                                <DialogDescription>
                                    Priorité : {selectedTicket.priority ?? '—'} | Status :{' '}
                                    {selectedTicket.status}
                                </DialogDescription>
                            </DialogHeader>

                            <p className="mt-4 text-gray-800">{selectedTicket.description}</p>

                            <div className="mt-6">
                                <h2 className="font-medium mb-2">Commentaires</h2>
                                <div className="space-y-4 max-h-64 overflow-y-auto">
                                    {selectedTicket.comments &&
                                    selectedTicket.comments.length > 0 ? (
                                        selectedTicket.comments.map(comment => (
                                            <div
                                                key={comment.id}
                                                className="p-3 border rounded-lg bg-gray-50"
                                            >
                                                <div className="flex items-center space-x-2 mb-1">
                                                    <div className="w-8 h-8 rounded-full bg-blue-200 flex items-center justify-center text-sm font-bold text-blue-700">
                                                        {comment.author.first_name
                                                            ?.charAt(0)
                                                            .toUpperCase() || '?'}
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-medium text-gray-800">
                                                            {comment.author.username}
                                                        </p>
                                                        <p className="text-xs text-gray-500">
                                                            {new Date(
                                                                comment.created_at
                                                            ).toLocaleString()}
                                                        </p>
                                                    </div>
                                                </div>
                                                <p className="text-gray-700 ml-10">
                                                    {comment.content}
                                                </p>
                                            </div>
                                        ))
                                    ) : (
                                        <p className="text-gray-500 italic">Aucun commentaire</p>
                                    )}
                                </div>

                                {/* Ajouter commentaire si author ou developer */}
                                {(user?.id === selectedTicket.author?.id ||
                                    user?.id === selectedTicket.developer?.id) && (
                                    <div className="mt-4">
                                        <textarea
                                            className="textarea textarea-bordered w-full"
                                            placeholder="Ajouter un commentaire..."
                                            value={newComment}
                                            onChange={e => setNewComment(e.target.value)}
                                        />
                                        <Button
                                            type="button"
                                            onClick={handleAddComment}
                                            disabled={loadingComment}
                                            className="mt-2"
                                        >
                                            {loadingComment ? 'Envoi...' : 'Ajouter un commentaire'}
                                        </Button>
                                    </div>
                                )}
                            </div>

                            <DialogFooter className="mt-4">
                                <Button variant="outline" onClick={() => setDialogOpen(false)}>
                                    Fermer
                                </Button>
                            </DialogFooter>
                        </>
                    ) : (
                        <p>Aucun ticket sélectionné</p>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    )
}
