import { Trash2, Eye } from 'lucide-react'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'

import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import api from '../services/api'
import { useAuth } from '../context/AuthContext'
import { toast, Toaster } from 'react-hot-toast'

import { PieChart, Pie, Cell, Tooltip as ReTooltip, Legend, ResponsiveContainer } from 'recharts'

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
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

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

    const [filterStatus, setFilterStatus] = useState<string>('') // '' = tous
    const [filterPriority, setFilterPriority] = useState<string>('') // '' = toutes
    const [searchTitle, setSearchTitle] = useState<string>('') // recherche par titre

    const totalTickets = tickets.length
    const unassignedTickets = tickets.filter(t => !t.developer).length
    const resolvedTickets = tickets.filter(t => t.status === 'resolved').length

    const [devs, setDevs] = useState<User[]>([]) // liste des devs pour admin

    const filteredTickets = tickets.filter(ticket => {
        const matchesStatus = filterStatus ? ticket.status === filterStatus : true
        const matchesPriority = filterPriority ? ticket.priority === filterPriority : true
        const matchesTitle = searchTitle
            ? ticket.title.toLowerCase().includes(searchTitle.toLowerCase())
            : true

        return matchesStatus && matchesPriority && matchesTitle
    })



    const statusData = Object.entries(
        tickets.reduce((acc: Record<string, number>, t) => {
            acc[t.status] = (acc[t.status] || 0) + 1
            return acc
        }, {})
    ).map(([status, count]) => ({
        name: statusLabels[status] ?? status,
        value: count,
    }))

    const priorityData = Object.entries(
        tickets.reduce((acc: Record<string, number>, t) => {
            if (t.priority) {
                acc[t.priority] = (acc[t.priority] || 0) + 1
            }
            return acc
        }, {})
    ).map(([priority, count]) => ({
        name: priorityLabels[priority] ?? priority,
        value: count,
    }))

    // Couleurs (tu peux adapter)
    const COLORS = ['#2563eb', '#f59e0b', '#22c55e', '#ef4444', '#9333ea']

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

            {/* Stats + Donuts (admin only) */}
            {user?.role?.toLowerCase() === 'admin' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Donut par statut */}
                    <div className="bg-white shadow rounded-xl p-4 flex flex-col items-center">
                        <h2 className="text-sm font-medium mb-2">Tickets par statut</h2>
                        <ResponsiveContainer width="100%" height={200}>
                            <PieChart>
                                <Pie
                                    data={statusData}
                                    dataKey="value"
                                    nameKey="name"
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={50}
                                    outerRadius={80}
                                    label
                                >
                                    {statusData.map((_, index) => (
                                        <Cell
                                            key={`cell-${index}`}
                                            fill={COLORS[index % COLORS.length]}
                                        />
                                    ))}
                                </Pie>
                                <ReTooltip />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>

                    {/* Donut par priorité */}
                    <div className="bg-white shadow rounded-xl p-4 flex flex-col items-center">
                        <h2 className="text-sm font-medium mb-2">Tickets par priorité</h2>
                        <ResponsiveContainer width="100%" height={200}>
                            <PieChart>
                                <Pie
                                    data={priorityData}
                                    dataKey="value"
                                    nameKey="name"
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={50}
                                    outerRadius={80}
                                    label
                                >
                                    {priorityData.map((_, index) => (
                                        <Cell
                                            key={`cell-${index}`}
                                            fill={COLORS[index % COLORS.length]}
                                        />
                                    ))}
                                </Pie>
                                <ReTooltip />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            )}

            {/* Titre */}
            <h1 className="text-xl font-bold">
                {filter === 'assignes' && 'Tickets assignés'}
                {filter === 'non-assignes' && 'Tickets non assignés'}
                {filter === 'resolus' && 'Tickets résolus'}
                {!filter && 'Tous les tickets'}
            </h1>

            <div className="flex flex-wrap gap-4 mb-4">
                {/* Filtrer par statut */}
                <select
                    value={filterStatus}
                    onChange={e => setFilterStatus(e.target.value)}
                    className="border rounded px-2 py-1"
                >
                    <option value="">Tous les statuts</option>
                    {Object.entries(statusLabels).map(([value, label]) => (
                        <option key={value} value={value}>
                            {label}
                        </option>
                    ))}
                </select>

                {/* Filtrer par priorité */}
                <select
                    value={filterPriority}
                    onChange={e => setFilterPriority(e.target.value)}
                    className="border rounded px-2 py-1"
                >
                    <option value="">Toutes les priorités</option>
                    {Object.entries(priorityLabels).map(([value, label]) => (
                        <option key={value} value={value}>
                            {label}
                        </option>
                    ))}
                </select>

                {/* Recherche par titre */}
                <input
                    type="text"
                    placeholder="Rechercher par titre..."
                    value={searchTitle}
                    onChange={e => setSearchTitle(e.target.value)}
                    className="border rounded px-2 py-1 ml-auto w-64 "
                />
            </div>

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
                    {filteredTickets.map((ticket, i) => (
                        <TableRow key={ticket.id}>
                            <TableCell>{i + 1}</TableCell>
                            <TableCell>{ticket.title}</TableCell>
                            <TableCell>
                                <span
                                    className={` inline-flex items-center justify-center h-8 w-24 rounded text-sm font-medium ${
                                        ticket.priority === 'critique'
                                            ? 'text-red-600 bg-red-100 px-3 py-2 rounded '
                                            : ticket.priority === 'haute'
                                            ? 'text-orange-500  bg-orange-100 px-3 py-2 rounded'
                                            : ticket.priority === 'moyenne'
                                            ? 'text-yellow-400  bg-yellow-100 px-3 py-2 rounded'
                                            : 'text-green-500  bg-green-100 px-3 py-2 rounded'
                                    }`}
                                >
                                    {ticket.priority
                                        ? priorityLabels[ticket.priority] ?? ticket.priority
                                        : 'N/A'}
                                </span>
                            </TableCell>
                            {/* status → modifiable si dev */}
                            <TableCell>
                                <span
                                    className={
                                        ticket.status === 'new'
                                            ? 'text-blue-400'
                                            : ticket.status === ' in_progress'
                                            ? 'text-gray-700'
                                            : ticket.status === 'resolved'
                                            ? ' text-green-600'
                                            : 'text-yellow-500'
                                    }
                                >
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
                                </span>
                            </TableCell>
                            <TableCell className="font-medium">
                                {ticket.developer ? (
                                    <div className="flex items-center space-x-4">
                                        <Avatar>
                                            <AvatarImage
                                                src={
                                                    ticket.developer.profile_picture
                                                        ? ticket.developer.profile_picture
                                                        : 'https://github.com/shadcn.png'
                                                }
                                            />
                                            <AvatarFallback className="font-medium text-gray-600 text-sm">
                                                {' '}
                                                {ticket.developer.first_name.charAt(0)}
                                                {ticket.developer.last_name.charAt(0)}{' '}
                                            </AvatarFallback>
                                        </Avatar>
                                        <p className="text-gray-700">{ticket.developer.username}</p>
                                    </div>
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
                                        {/* <p className="text-red-400 text-sm">Non assigné</p> */}
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
                                <DialogTitle className="flex items-center justify-between mt-5">
                                    {' '}
                                    <p className="underline text-xl">Titre :</p>{' '}
                                    {selectedTicket.title}
                                </DialogTitle>
                                <DialogDescription className="flex justify-between mt-2 font-medium text-gray-900">
                                    <div className="flex space-x-5 items-center">
                                        <p className="underline">Priorité : </p>
                                        <span
                                            className={` inline-flex items-center justify-center h-8 w-24 rounded text-sm font-medium ${
                                                selectedTicket.priority === 'critique'
                                                    ? 'text-red-600 bg-red-100 px-3 py-2 rounded '
                                                    : selectedTicket.priority === 'haute'
                                                    ? 'text-orange-500  bg-orange-100 px-3 py-2 rounded'
                                                    : selectedTicket.priority === 'moyenne'
                                                    ? 'text-yellow-400  bg-yellow-100 px-3 py-2 rounded'
                                                    : 'text-green-500  bg-green-100 px-3 py-2 rounded'
                                            }`}
                                        >
                                            {' '}
                                            {priorityLabels[selectedTicket.priority] ?? '—'}
                                        </span>{' '}
                                    </div>

                                    <div className="flex space-x-5 items-center">
                                        <p className="underline">Status : </p>
                                        <span
                                            className={
                                                selectedTicket.status === 'new'
                                                    ? 'text-blue-400'
                                                    : selectedTicket.status === ' in_progress'
                                                    ? 'text-gray-700'
                                                    : selectedTicket.status === 'resolved'
                                                    ? ' text-green-600'
                                                    : 'text-yellow-500'
                                            }
                                        >
                                            {' '}
                                            {statusLabels[selectedTicket.status]}
                                        </span>
                                    </div>
                                </DialogDescription>
                            </DialogHeader>
                            <div>
                                <p className="underline font-medium text-xl">Description:</p>
                                <p className="mt-4 text-gray-800 text-sm">
                                    {selectedTicket.description}
                                </p>
                            </div>
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
