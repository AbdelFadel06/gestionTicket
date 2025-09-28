import { useEffect, useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
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
import { useNavigate } from 'react-router-dom'

interface User {
    id: number
    username: string
    email: string
    ticketCount?: number
}

interface Ticket {
    id: number
    author: number | null
}

const Clients = () => {
    const { theme } = useTheme()
    const navigate = useNavigate()
    const [clients, setClients] = useState<User[]>([])
    const [totalTickets, setTotalTickets] = useState<number>(0)
    const [loading, setLoading] = useState(true)

    // État pour la pagination
    const [currentPage, setCurrentPage] = useState(1)
    const [itemsPerPage, setItemsPerPage] = useState(10)

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true)

                // Récupérer les clients
                const clientsRes = await api.get('api/users/')
                const clientsData = clientsRes.data?.users || []
                console.log('Clients récupérés:', clientsData)

                // Récupérer tous les tickets
                const ticketsRes = await api.get('api/ticket/')
                const allTickets: Ticket[] = ticketsRes.data?.results || []
                console.log('Tickets récupérés:', allTickets)

                // Debug: Voir la structure des tickets
                allTickets.forEach((ticket, index) => {
                    if (ticket.author) {
                        console.log(`Ticket ${index + 1} - Author ID:`, ticket.author, 'Type:', typeof ticket.author)
                    }
                })

                // Compter les tickets par client
                const ticketCountByClient: Record<number, number> = {}

                allTickets.forEach(ticket => {
                    if (ticket.author && typeof ticket.author === 'number') {
                        ticketCountByClient[ticket.author] = (ticketCountByClient[ticket.author] || 0) + 1
                    }
                    // Si l'auteur est un objet, essayer de récupérer l'ID
                    else if (ticket.author && typeof ticket.author === 'object') {
                        const authorId = (ticket.author as any).id
                        if (authorId) {
                            ticketCountByClient[authorId] = (ticketCountByClient[authorId] || 0) + 1
                        }
                    }
                })

                console.log('Compteur tickets par client:', ticketCountByClient)

                // Ajouter le compteur à chaque client
                const clientsWithTicketCount = clientsData.map((client: User) => {
                    const count = ticketCountByClient[client.id] || 0
                    console.log(`Client ${client.username} (ID: ${client.id}) -> ${count} tickets`)
                    return {
                        ...client,
                        ticketCount: count
                    }
                })

                setClients(clientsWithTicketCount)
                setTotalTickets(allTickets.length)

            } catch (error) {
                console.error('Erreur récupération données:', error)
                setClients([])
                setTotalTickets(0)
            } finally {
                setLoading(false)
            }
        }

        fetchData()
    }, [])

    // Calcul de la pagination
    const totalPages = Math.ceil(clients.length / itemsPerPage)
    const startIndex = (currentPage - 1) * itemsPerPage
    const endIndex = startIndex + itemsPerPage
    const currentClients = clients.slice(startIndex, endIndex)

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

    const handleViewTickets = (clientId: number) => {
        navigate(`${clientId}/tickets`)
    }

    if (loading) {
        return (
            <div className="p-6 flex justify-center items-center h-64">
                <div className={`text-lg ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                    Chargement des clients...
                </div>
            </div>
        )
    }

    return (
        <div className="p-6 space-y-6">
            {/* Stats */}
            <div className="grid auto-rows-min gap-4 md:grid-cols-2">
                <div className="bg-yellow-100 dark:bg-yellow-900 text-black dark:text-yellow-200 aspect-video rounded-xl flex items-center justify-center">
                    <div className="text-center">
                        <div className="text-2xl font-bold">{clients.length}</div>
                        <div>Total Clients</div>
                    </div>
                </div>
                <div className="bg-green-100 dark:bg-green-900 text-black dark:text-green-200 aspect-video rounded-xl flex items-center justify-center">
                    <div className="text-center">
                        <div className="text-2xl font-bold">{totalTickets}</div>
                        <div>Tickets Créés</div>
                    </div>
                </div>
            </div>

            {/* Tableau des clients */}
            <div className="bg-muted/50 dark:bg-gray-800 p-4 rounded-xl">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-lg font-bold text-black dark:text-white">
                        Liste des Clients
                    </h2>
                    <div className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                        {clients.length} client(s) au total
                    </div>
                </div>

                <Table>
                    <TableHeader className={theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}>
                        <TableRow>
                            <TableHead className={theme === 'dark' ? 'text-gray-300' : 'text-gray-900'}>
                                #
                            </TableHead>
                            <TableHead className={theme === 'dark' ? 'text-gray-300' : 'text-gray-900'}>
                                Nom
                            </TableHead>
                            <TableHead className={theme === 'dark' ? 'text-gray-300' : 'text-gray-900'}>
                                Email
                            </TableHead>
                            <TableHead className={theme === 'dark' ? 'text-gray-300' : 'text-gray-900'}>
                                Tickets Créés
                            </TableHead>
                            <TableHead className={theme === 'dark' ? 'text-gray-300' : 'text-gray-900'}>
                                Action
                            </TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {currentClients.length > 0 ? (
                            currentClients.map((client, index) => (
                                <TableRow key={client.id} className={theme === 'dark' ? 'border-gray-700' : ''}>
                                    <TableCell className={theme === 'dark' ? 'text-gray-300' : ''}>
                                        {startIndex + index + 1}
                                    </TableCell>
                                    <TableCell className={`font-medium ${theme === 'dark' ? 'text-gray-300' : ''}`}>
                                        {client.username}
                                    </TableCell>
                                    <TableCell className={theme === 'dark' ? 'text-gray-300' : ''}>
                                        {client.email}
                                    </TableCell>
                                    <TableCell>
                                        <span className={`inline-flex items-center justify-center px-3 py-1 rounded-full text-sm font-medium ${
                                            client.ticketCount === 0
                                                ? 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300'
                                                : client.ticketCount <= 3
                                                ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                                                : client.ticketCount <= 7
                                                ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                                                : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                                        }`}>
                                            {client.ticketCount} ticket(s)
                                        </span>
                                    </TableCell>
                                    <TableCell>
                                        <Button
                                            onClick={() => handleViewTickets(client.id)}
                                            className={
                                                theme === 'dark'
                                                    ? 'bg-blue-600 hover:bg-blue-700 text-white'
                                                    : 'bg-black hover:bg-gray-800 text-white'
                                            }
                                        >
                                            Voir Tickets
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={5} className="text-center py-8">
                                    <div className={theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}>
                                        Aucun client trouvé
                                    </div>
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>

                {/* Pagination */}
                {clients.length > 0 && (
                    <div className={`flex items-center justify-between px-4 py-3 mt-4 ${
                        theme === 'dark' ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-700'
                    } rounded-md`}>
                        <div className="text-sm">
                            Affichage de {startIndex + 1} à {Math.min(endIndex, clients.length)} sur {clients.length} clients
                        </div>

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
                                        ? 'bg-gray-600 border-gray-500 text-white'
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
        </div>
    )
}

export default Clients
