import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, ChevronLeft, ChevronRight } from 'lucide-react'
import api from '../services/api'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { useTheme } from 'next-themes'

interface User {
    id: number
    username: string
    email: string
    first_name: string
    last_name: string
}

interface Ticket {
    id: number
    title: string
    status: string
    priority: string
    description?: string
    created_at?: string
}

const ClientTickets = () => {
    const { id } = useParams<{ id: string }>()
    const navigate = useNavigate()
    const { theme } = useTheme()
    const [tickets, setTickets] = useState<Ticket[]>([])
    const [client, setClient] = useState<User | null>(null)
    const [loading, setLoading] = useState(true)

    // États pour les filtres
    const [filterStatus, setFilterStatus] = useState<string>('')
    const [filterPriority, setFilterPriority] = useState<string>('')
    const [searchTitle, setSearchTitle] = useState<string>('')

    // États pour la pagination
    const [currentPage, setCurrentPage] = useState(1)
    const [itemsPerPage, setItemsPerPage] = useState(10)

    // Dictionnaires pour les labels
    const [statusLabels, setStatusLabels] = useState<Record<string, string>>({})
    const [priorityLabels, setPriorityLabels] = useState<Record<string, string>>({})

    // Récupérer les choix depuis l'API
    const getChoices = async () => {
        try {
            const res = await api.get('api/ticket/choices/')
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

    useEffect(() => {
        if (id) {
            const fetchData = async () => {
                try {
                    setLoading(true)
                    // Récupérer les infos du client
                    const clientRes = await api.get(`api/users/${id}/`)
                    setClient(clientRes.data)

                    // Récupérer les tickets du client
                    const ticketsRes = await api.get(`api/tickets/user/${id}/`)
                    setTickets(ticketsRes.data)

                    await getChoices()
                } catch (err) {
                    console.error('Erreur récupération données:', err)
                } finally {
                    setLoading(false)
                }
            }

            fetchData()
        }
    }, [id])

    // Filtrer les tickets
    const filteredTickets = tickets.filter(ticket => {
        const matchesStatus = filterStatus ? ticket.status === filterStatus : true
        const matchesPriority = filterPriority ? ticket.priority === filterPriority : true
        const matchesTitle = searchTitle
            ? ticket.title.toLowerCase().includes(searchTitle.toLowerCase())
            : true

        return matchesStatus && matchesPriority && matchesTitle
    })

    // Calcul de la pagination
    const totalPages = Math.ceil(filteredTickets.length / itemsPerPage)
    const startIndex = (currentPage - 1) * itemsPerPage
    const endIndex = startIndex + itemsPerPage
    const currentTickets = filteredTickets.slice(startIndex, endIndex)

    // Fonctions de navigation
    const goToPage = (page: number) => {
        setCurrentPage(page)
    }

    const goToPreviousPage = () => {
        setCurrentPage(prev => Math.max(prev - 1, 1))
    }

    const goToNextPage = () => {
        setCurrentPage(prev => Math.min(prev + 1, totalPages))
    }

    const getPageNumbers = () => {
        const pages = []
        const maxVisiblePages = 5

        let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2))
        let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1)

        if (endPage - startPage + 1 < maxVisiblePages) {
            startPage = Math.max(1, endPage - maxVisiblePages + 1)
        }

        for (let i = startPage; i <= endPage; i++) {
            pages.push(i)
        }

        return pages
    }

    // Réinitialiser la pagination quand les filtres changent
    useEffect(() => {
        setCurrentPage(1)
    }, [filterStatus, filterPriority, searchTitle])

    if (loading) {
        return (
            <div className={`p-6 ${theme === 'dark' ? 'bg-gray-900 text-white' : 'bg-white text-gray-900'}`}>
                <div className="flex items-center mb-6">
                    <Button
                        onClick={() => navigate(-1)}
                        variant="outline"
                        className="flex items-center gap-2"
                    >
                        <ArrowLeft size={16} />
                        Retour
                    </Button>
                </div>
                <div className="text-center">Chargement...</div>
            </div>
        )
    }

    return (
        <div className={`p-6 ${theme === 'dark' ? 'bg-gray-900 text-white' : 'bg-white text-gray-900'}`}>
            {/* Header avec bouton retour stylisé */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                    <Button
                        onClick={() => navigate(-1)}
                        variant="outline"
                        className={`flex items-center gap-2 ${
                            theme === 'dark'
                                ? 'border-gray-700 text-white hover:bg-gray-800'
                                : 'border-gray-300 text-gray-900 hover:bg-gray-100'
                        }`}
                    >
                        <ArrowLeft size={16} />
                        Retour
                    </Button>
                    <h1 className="text-2xl font-bold">
                        Tickets de {client?.username || `Client #${id}`}
                    </h1>
                </div>
                <div className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                    {filteredTickets.length} ticket(s) trouvé(s) sur {tickets.length} total
                </div>
            </div>

            {/* Filtres */}
            <div className="flex flex-wrap gap-4 mb-6 p-4 bg-muted/50 dark:bg-gray-800 rounded-lg">
                {/* Filtre par statut */}
                <div className="flex flex-col gap-2">
                    <label className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                        Statut
                    </label>
                    <select
                        value={filterStatus}
                        onChange={e => setFilterStatus(e.target.value)}
                        className={`border rounded px-3 py-2 ${
                            theme === 'dark'
                                ? 'bg-gray-700 border-gray-600 text-white'
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
                </div>

                {/* Filtre par priorité */}
                <div className="flex flex-col gap-2">
                    <label className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                        Priorité
                    </label>
                    <select
                        value={filterPriority}
                        onChange={e => setFilterPriority(e.target.value)}
                        className={`border rounded px-3 py-2 ${
                            theme === 'dark'
                                ? 'bg-gray-700 border-gray-600 text-white'
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
                </div>

                {/* Recherche par titre */}
                <div className="flex flex-col gap-2">
                    <label className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                        Recherche
                    </label>
                    <input
                        type="text"
                        placeholder="Rechercher par titre..."
                        value={searchTitle}
                        onChange={e => setSearchTitle(e.target.value)}
                        className={`border rounded px-3 py-2 ${
                            theme === 'dark'
                                ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                                : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                        }`}
                    />
                </div>

                {/* Bouton réinitialiser */}
                <div className="flex flex-col gap-2">
                    <label className="text-sm font-medium opacity-0">Réinitialiser</label>
                    <Button
                        variant="outline"
                        onClick={() => {
                            setFilterStatus('')
                            setFilterPriority('')
                            setSearchTitle('')
                        }}
                        className={`${
                            theme === 'dark'
                                ? 'border-gray-600 text-white hover:bg-gray-700'
                                : 'border-gray-300 text-gray-900 hover:bg-gray-100'
                        }`}
                    >
                        Réinitialiser
                    </Button>
                </div>
            </div>

            {/* Statistiques rapides */}
            {tickets.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-6">
                    <div className={`aspect-video rounded-xl flex flex-col items-center justify-center bg-yellow-100 dark:bg-yellow-900 text-black dark:text-yellow-200`}>
                        <p className="text-2xl font-bold">{tickets.length}</p>
                        <p className={theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}>Total</p>
                    </div>
                    <div className={`aspect-video rounded-xl flex flex-col items-center justify-center bg-green-100 dark:bg-green-900 text-black dark:text-green-200`}>
                        <p className="text-2xl font-bold">{tickets.filter(t => t.status === 'resolved').length}</p>
                        <p className={theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}>Résolus</p>
                    </div>
                    <div className={`aspect-video rounded-xl flex flex-col items-center justify-center bg-blue-100 dark:bg-blue-900 text-black dark:text-blue-200`}>
                        <p className="text-2xl font-bold">{tickets.filter(t => t.status === 'in_progress').length}</p>
                        <p className={theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}>En cours</p>
                    </div>
                    <div className={`aspect-video rounded-xl flex flex-col items-center justify-center bg-gray-100 dark:bg-gray-800 text-black dark:text-gray-200`}>
                        <p className="text-2xl font-bold">{tickets.filter(t => t.status === 'new').length}</p>
                        <p className={theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}>Nouveaux</p>
                    </div>
                </div>
            )}

            {/* Tableau des tickets */}
            <div className={`rounded-lg border ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
                <Table>
                    <TableHeader className={theme === 'dark' ? 'bg-gray-800' : 'bg-gray-100'}>
                        <TableRow>
                            <TableHead className={theme === 'dark' ? 'text-gray-300' : 'text-gray-900'}>
                                #
                            </TableHead>
                            <TableHead className={theme === 'dark' ? 'text-gray-300' : 'text-gray-900'}>
                                Titre
                            </TableHead>
                            <TableHead className={theme === 'dark' ? 'text-gray-300' : 'text-gray-900'}>
                                Statut
                            </TableHead>
                            <TableHead className={theme === 'dark' ? 'text-gray-300' : 'text-gray-900'}>
                                Priorité
                            </TableHead>
                            <TableHead className={theme === 'dark' ? 'text-gray-300' : 'text-gray-900'}>
                                Description
                            </TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {currentTickets.length > 0 ? (
                            currentTickets.map((ticket, index) => (
                                <TableRow key={ticket.id} className={theme === 'dark' ? 'border-gray-700' : ''}>
                                    <TableCell className={theme === 'dark' ? 'text-gray-300' : ''}>
                                        {startIndex + index + 1}
                                    </TableCell>
                                    <TableCell className={`font-medium ${theme === 'dark' ? 'text-gray-300' : ''}`}>
                                        {ticket.title}
                                    </TableCell>
                                    <TableCell>
                                        <span className={
                                            ticket.status === 'new'
                                                ? theme === 'dark'
                                                    ? 'text-blue-300'
                                                    : 'text-blue-400'
                                                : ticket.status === 'in_progress'
                                                ? theme === 'dark'
                                                    ? 'text-gray-300'
                                                    : 'text-gray-700'
                                                : ticket.status === 'resolved'
                                                ? theme === 'dark'
                                                    ? 'text-green-300'
                                                    : 'text-green-600'
                                                : theme === 'dark'
                                                ? 'text-yellow-300'
                                                : 'text-yellow-500'
                                        }>
                                            {statusLabels[ticket.status] ?? ticket.status}
                                        </span>
                                    </TableCell>
                                    <TableCell>
                                        <span className={`inline-flex items-center justify-center h-8 w-24 rounded text-sm font-medium ${
                                            ticket.priority === 'critique'
                                                ? theme === 'dark'
                                                    ? 'text-red-300 bg-red-900/30 px-3 py-2 rounded'
                                                    : 'text-red-600 bg-red-100 px-3 py-2 rounded'
                                                : ticket.priority === 'haute'
                                                ? theme === 'dark'
                                                    ? 'text-orange-300 bg-orange-900/30 px-3 py-2 rounded'
                                                    : 'text-orange-500 bg-orange-100 px-3 py-2 rounded'
                                                : ticket.priority === 'moyenne'
                                                ? theme === 'dark'
                                                    ? 'text-yellow-300 bg-yellow-900/30 px-3 py-2 rounded'
                                                    : 'text-yellow-400 bg-yellow-100 px-3 py-2 rounded'
                                                : theme === 'dark'
                                                ? 'text-green-300 bg-green-900/30 px-3 py-2 rounded'
                                                : 'text-green-500 bg-green-100 px-3 py-2 rounded'
                                        }`}>
                                            {ticket.priority
                                                ? priorityLabels[ticket.priority] ?? ticket.priority
                                                : 'N/A'}
                                        </span>
                                    </TableCell>
                                    <TableCell className={`max-w-xs truncate ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                                        {ticket.description || 'Aucune description'}
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={5} className="text-center py-8">
                                    <div className={`text-lg ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                                        {tickets.length === 0
                                            ? 'Aucun ticket trouvé pour ce client'
                                            : 'Aucun ticket ne correspond aux filtres'
                                        }
                                    </div>
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* Pagination */}
            {filteredTickets.length > 0 && (
                <div className={`flex items-center justify-between px-4 py-3 mt-4 ${
                    theme === 'dark' ? 'bg-gray-800 text-gray-300' : 'bg-gray-100 text-gray-700'
                } rounded-md`}>
                    {/* Informations */}
                    <div className="text-sm">
                        Affichage de {startIndex + 1} à {Math.min(endIndex, filteredTickets.length)} sur {filteredTickets.length} tickets
                    </div>

                    {/* Contrôles de pagination */}
                    <div className="flex items-center space-x-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={goToPreviousPage}
                            disabled={currentPage === 1}
                            className={theme === 'dark' ? 'border-gray-600' : ''}
                        >
                            <ChevronLeft className="h-4 w-4" />
                        </Button>

                        <div className="flex space-x-1">
                            {getPageNumbers().map((page) => (
                                <Button
                                    key={page}
                                    variant={page === currentPage ? "default" : "outline"}
                                    size="sm"
                                    onClick={() => goToPage(page)}
                                    className={`min-w-[40px] ${
                                        page === currentPage
                                            ? theme === 'dark'
                                                ? 'bg-blue-600 text-white'
                                                : 'bg-black text-white'
                                            : theme === 'dark'
                                                ? 'border-gray-600 text-gray-300'
                                                : 'border-gray-300 text-gray-700'
                                    }`}
                                >
                                    {page}
                                </Button>
                            ))}
                        </div>

                        <Button
                            variant="outline"
                            size="sm"
                            onClick={goToNextPage}
                            disabled={currentPage === totalPages}
                            className={theme === 'dark' ? 'border-gray-600' : ''}
                        >
                            <ChevronRight className="h-4 w-4" />
                        </Button>
                    </div>

                    {/* Sélecteur d'éléments par page */}
                    <div className="flex items-center space-x-2 text-sm">
                        <span>Par page:</span>
                        <select
                            value={itemsPerPage}
                            onChange={(e) => {
                                setCurrentPage(1)
                                setItemsPerPage(Number(e.target.value))
                            }}
                            className={`border rounded px-2 py-1 text-sm ${
                                theme === 'dark'
                                    ? 'bg-gray-700 border-gray-600 text-white'
                                    : 'bg-white border-gray-300 text-gray-900'
                            }`}
                        >
                            <option value={5}>5</option>
                            <option value={10}>10</option>
                            <option value={20}>20</option>
                            <option value={50}>50</option>
                        </select>
                    </div>
                </div>
            )}
        </div>
    )
}

export default ClientTickets
