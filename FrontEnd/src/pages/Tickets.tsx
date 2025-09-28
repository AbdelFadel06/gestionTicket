import { useTheme } from 'next-themes'

import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import api from '../services/api'
import { useAuth } from '../context/AuthContext'
import { toast, Toaster } from 'react-hot-toast'
import TicketsTable from '@/components/TicketsTable'
import { PieChart, Pie, Cell, Tooltip as ReTooltip, Legend, ResponsiveContainer } from 'recharts'

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
    const { theme } = useTheme()
    const [tickets, setTickets] = useState<Ticket[]>([])
    const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null)
    const [dialogOpen, setDialogOpen] = useState(false)
    const [newComment, setNewComment] = useState('')
    const [loadingComment, setLoadingComment] = useState(false)

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
    }
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

    const navigate = useNavigate()
    const handleFilterChange = (newFilter: string) => {
        if (newFilter === '') {
            navigate('/dashboard/tickets')
        } else {
            navigate(`/dashboard/tickets/${newFilter}`)
        }
    }

    const [filterStatus, setFilterStatus] = useState<string>('')
    const [filterPriority, setFilterPriority] = useState<string>('')
    const [searchTitle, setSearchTitle] = useState<string>('')

    const totalTickets = tickets.length
    const unassignedTickets = tickets.filter(t => !t.developer).length
    const resolvedTickets = tickets.filter(t => t.status === 'resolved').length

    const [devs, setDevs] = useState<User[]>([])

    const filteredTickets = tickets.filter(ticket => {
        const matchesAssignment =
            filter === 'assignes'
                ? ticket.developer !== null
                : filter === 'non-assignes'
                ? ticket.developer === null
                : filter === 'resolus'
                ? ticket.status === 'resolved'
                : true

        const matchesStatus = filterStatus ? ticket.status === filterStatus : true
        const matchesPriority = filterPriority ? ticket.priority === filterPriority : true
        const matchesTitle = searchTitle
            ? ticket.title.toLowerCase().includes(searchTitle.toLowerCase())
            : true

        return matchesAssignment && matchesStatus && matchesPriority && matchesTitle
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

    const COLORS = ['#2563eb', '#f59e0b', '#22c55e', '#ef4444', '#9333ea']

    return (
        <div
            className={`p-4 space-y-6 ${
                theme === 'dark' ? 'bg-gray-900 text-white' : 'bg-white text-gray-900'
            }`}
        >
            <Toaster />

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div
                    className={`aspect-video rounded-xl flex flex-col items-center justify-center bg-yellow-100 dark:bg-yellow-900 text-black dark:text-yellow-200`}
                >
                    <p className="text-2xl font-bold">{totalTickets}</p>
                    <p className={theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}>Total</p>
                </div>
                <div
                    className={`aspect-video rounded-xl flex flex-col items-center justify-center bg-green-100 dark:bg-green-900 text-black dark:text-green-200`}
                >
                    <p className="text-2xl font-bold">{unassignedTickets}</p>
                    <p className={theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}>
                        Non assignés
                    </p>
                </div>
                <div
                    className={`aspect-video rounded-xl flex flex-col items-center justify-center bg-muted/50 dark:bg-gray-800 text-black dark:text-white`}
                >
                    <p className="text-2xl font-bold">{resolvedTickets}</p>
                    <p className={theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}>Résolus</p>
                </div>
            </div>

            {user?.role?.toLowerCase() === 'admin' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div
                        className={`shadow rounded-xl p-4 flex flex-col items-center ${
                            theme === 'dark' ? 'bg-gray-800' : 'bg-white'
                        }`}
                    >
                        <h2
                            className={`text-sm font-medium mb-2 ${
                                theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                            }`}
                        >
                            Tickets par statut
                        </h2>
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
                    <div
                        className={`shadow rounded-xl p-4 flex flex-col items-center ${
                            theme === 'dark' ? 'bg-gray-800' : 'bg-white'
                        }`}
                    >
                        <h2
                            className={`text-sm font-medium mb-2 ${
                                theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                            }`}
                        >
                            Tickets par priorité
                        </h2>
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
                    className={`border rounded px-2 py-1 ${
                        theme === 'dark'
                            ? 'bg-gray-800 border-gray-700 text-white'
                            : 'bg-white border-gray-300 text-gray-900'
                    }`}
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
                    className={`border rounded px-2 py-1 ${
                        theme === 'dark'
                            ? 'bg-gray-800 border-gray-700 text-white'
                            : 'bg-white border-gray-300 text-gray-900'
                    }`}
                >
                    <option value="">Toutes les priorités</option>
                    {Object.entries(priorityLabels).map(([value, label]) => (
                        <option key={value} value={value}>
                            {label}
                        </option>
                    ))}
                </select>

                <select
                    value={filter || ''}
                    onChange={e => handleFilterChange(e.target.value)}
                    className={`border rounded px-2 py-1 ${
                        theme === 'dark'
                            ? 'bg-gray-800 border-gray-700 text-white'
                            : 'bg-white border-gray-300 text-gray-900'
                    }`}
                >
                    <option value="">Tous les tickets</option>
                    <option value="assignes">Assignés</option>
                    <option value="non-assignes">Non assignés</option>
                    <option value="resolus">Résolus</option>
                </select>

                {/* Recherche par titre */}
                <input
                    type="text"
                    placeholder="Rechercher par titre..."
                    value={searchTitle}
                    onChange={e => setSearchTitle(e.target.value)}
                    className={`border rounded px-2 py-1 ml-auto w-64 ${
                        theme === 'dark'
                            ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-400'
                            : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                    }`}
                />

                <Button
                    variant="outline"
                    onClick={() => {
                        setFilterStatus('')
                        setFilterPriority('')
                        setSearchTitle('')
                        navigate('/dashboard/tickets')
                    }}
                    className={`${
                        theme === 'dark'
                            ? 'border-gray-700 text-white hover:bg-gray-800'
                            : 'border-gray-300 text-gray-900 hover:bg-gray-100'
                    }`}
                >
                    Réinitialiser
                </Button>
            </div>

            {/* Tableau */}
            <div
                className={`rounded-md border ${
                    theme === 'dark' ? 'border-gray-700' : 'border-gray-200'
                }`}
            >
                

                <TicketsTable
                    tickets={filteredTickets} // ← Correction : utiliser filteredTickets
                    theme={theme || 'light'}
                    user={user}
                    devs={devs}
                    statusLabels={statusLabels}
                    priorityLabels={priorityLabels}
                    onView={ticket => {
                        setSelectedTicket(ticket)
                        setDialogOpen(true)
                    }}
                    onDelete={deleteTicket}
                    onAssignDev={handleAssignDev}
                    onAssignToMe={handleAssignToMe}
                    onChangeStatus={handleChangeStatus}
                    itemsPerPage={10}
                />
            </div>

            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogContent
                    className={`max-w-2xl ${
                        theme === 'dark'
                            ? 'bg-gray-900 text-white border-gray-700'
                            : 'bg-white text-gray-900'
                    }`}
                >
                    {selectedTicket ? (
                        <>
                            <DialogHeader>
                                <DialogTitle className="flex items-center justify-between mt-5">
                                    {' '}
                                    <p className="underline text-xl">Titre :</p>{' '}
                                    {selectedTicket.title}
                                </DialogTitle>
                                <DialogDescription
                                    className={`flex justify-between mt-2 font-medium ${
                                        theme === 'dark' ? 'text-gray-300' : 'text-gray-900'
                                    }`}
                                >
                                    <div className="flex space-x-5 items-center">
                                        <p className="underline">Priorité : </p>
                                        <span
                                            className={`inline-flex items-center justify-center h-8 w-24 rounded text-sm font-medium ${
                                                selectedTicket.priority === 'critique'
                                                    ? theme === 'dark'
                                                        ? 'text-red-300 bg-red-900/30 px-3 py-2 rounded'
                                                        : 'text-red-600 bg-red-100 px-3 py-2 rounded'
                                                    : selectedTicket.priority === 'haute'
                                                    ? theme === 'dark'
                                                        ? 'text-orange-300 bg-orange-900/30 px-3 py-2 rounded'
                                                        : 'text-orange-500 bg-orange-100 px-3 py-2 rounded'
                                                    : selectedTicket.priority === 'moyenne'
                                                    ? theme === 'dark'
                                                        ? 'text-yellow-300 bg-yellow-900/30 px-3 py-2 rounded'
                                                        : 'text-yellow-400 bg-yellow-100 px-3 py-2 rounded'
                                                    : theme === 'dark'
                                                    ? 'text-green-300 bg-green-900/30 px-3 py-2 rounded'
                                                    : 'text-green-500 bg-green-100 px-3 py-2 rounded'
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
                                                    ? theme === 'dark'
                                                        ? 'text-blue-300'
                                                        : 'text-blue-400'
                                                    : selectedTicket.status === 'in_progress'
                                                    ? theme === 'dark'
                                                        ? 'text-gray-300'
                                                        : 'text-gray-700'
                                                    : selectedTicket.status === 'resolved'
                                                    ? theme === 'dark'
                                                        ? 'text-green-300'
                                                        : 'text-green-600'
                                                    : theme === 'dark'
                                                    ? 'text-yellow-300'
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
                                <p
                                    className={`mt-4 text-sm ${
                                        theme === 'dark' ? 'text-gray-300' : 'text-gray-800'
                                    }`}
                                >
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
                                                className={`p-3 border rounded-lg ${
                                                    theme === 'dark'
                                                        ? 'bg-gray-800 border-gray-700'
                                                        : 'bg-gray-50 border-gray-200'
                                                }`}
                                            >
                                                <div className="flex items-center space-x-2 mb-1">
                                                    <div
                                                        className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                                                            theme === 'dark'
                                                                ? 'bg-blue-900 text-blue-200'
                                                                : 'bg-blue-200 text-blue-700'
                                                        }`}
                                                    >
                                                        {comment.author.first_name
                                                            ?.charAt(0)
                                                            .toUpperCase() || '?'}
                                                    </div>
                                                    <div>
                                                        <p
                                                            className={`text-sm font-medium ${
                                                                theme === 'dark'
                                                                    ? 'text-gray-300'
                                                                    : 'text-gray-800'
                                                            }`}
                                                        >
                                                            {comment.author.username}
                                                        </p>
                                                        <p
                                                            className={`text-xs ${
                                                                theme === 'dark'
                                                                    ? 'text-gray-500'
                                                                    : 'text-gray-500'
                                                            }`}
                                                        >
                                                            {new Date(
                                                                comment.created_at
                                                            ).toLocaleString()}
                                                        </p>
                                                    </div>
                                                </div>
                                                <p
                                                    className={`ml-10 ${
                                                        theme === 'dark'
                                                            ? 'text-gray-300'
                                                            : 'text-gray-700'
                                                    }`}
                                                >
                                                    {comment.content}
                                                </p>
                                            </div>
                                        ))
                                    ) : (
                                        <p
                                            className={`italic ${
                                                theme === 'dark' ? 'text-gray-500' : 'text-gray-500'
                                            }`}
                                        >
                                            Aucun commentaire
                                        </p>
                                    )}
                                </div>

                                {(user?.id === selectedTicket.author?.id ||
                                    user?.id === selectedTicket.developer?.id) && (
                                    <div className="mt-4">
                                        <textarea
                                            className={`w-full p-2 border rounded ${
                                                theme === 'dark'
                                                    ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-400'
                                                    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                                            }`}
                                            placeholder="Ajouter un commentaire..."
                                            value={newComment}
                                            onChange={e => setNewComment(e.target.value)}
                                        />
                                        <Button
                                            type="button"
                                            onClick={handleAddComment}
                                            disabled={loadingComment}
                                            className="mt-2 bg-blue-600 hover:bg-blue-700 text-white"
                                        >
                                            {loadingComment ? 'Envoi...' : 'Ajouter un commentaire'}
                                        </Button>
                                    </div>
                                )}
                            </div>

                            <DialogFooter className="mt-4">
                                <Button
                                    variant="outline"
                                    onClick={() => setDialogOpen(false)}
                                    className={
                                        theme === 'dark'
                                            ? 'border-gray-700 text-white hover:bg-gray-800'
                                            : ''
                                    }
                                >
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
