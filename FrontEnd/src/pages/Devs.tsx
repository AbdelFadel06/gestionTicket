import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
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

interface Developer {
    id: number
    username: string
    email: string
    ticketCount?: number
}

interface Ticket {
    id: number
    developer: User | null
}

const Devs = () => {
    const [devs, setDevs] = useState<Developer[]>([])
    const [totalTickets, setTotalTickets] = useState<number>(0)
    const { theme } = useTheme()


    const [currentPage, setCurrentPage] = useState(1)
    const [itemsPerPage, setItemsPerPage] = useState(10)

    useEffect(() => {
        const fetchData = async () => {
            try {

                const devsRes = await api.get('api/users/')
                const developers = devsRes.data?.developers || []

                const ticketsRes = await api.get('api/ticket/')
                const allTickets: Ticket[] = ticketsRes.data?.results || []

                const ticketCountByDev: Record<number, number> = {}
                allTickets.forEach(ticket => {
                    if (ticket.developer) {
                        ticketCountByDev[ticket.developer.id] = (ticketCountByDev[ticket.developer.id] || 0) + 1
                    }
                })

                const devsWithTicketCount = developers.map((dev: Developer) => ({
                    ...dev,
                    ticketCount: ticketCountByDev[dev.id] || 0
                }))

                setDevs(devsWithTicketCount)

                const assignedTicketsCount = allTickets.filter(ticket => ticket.developer !== null).length
                setTotalTickets(assignedTicketsCount)

            } catch (err) {
                console.error('Erreur récupération données:', err)
                setDevs([])
                setTotalTickets(0)
            }
        }

        fetchData()
    }, [])

    const totalPages = Math.ceil(devs.length / itemsPerPage)
    const startIndex = (currentPage - 1) * itemsPerPage
    const endIndex = startIndex + itemsPerPage
    const currentDevs = devs.slice(startIndex, endIndex)

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

    return (
        <div className="p-6 space-y-6">
            <div className="grid auto-rows-min gap-4 md:grid-cols-2">
                <div className="bg-yellow-100 dark:bg-yellow-900 text-black dark:text-yellow-200 aspect-video rounded-xl flex items-center justify-center">
                    <div className="text-center">
                        <div className="text-2xl font-bold">{devs.length}</div>
                        <div>Total Devs</div>
                    </div>
                </div>
                <div className="bg-green-100 dark:bg-green-900 text-black dark:text-green-200 aspect-video rounded-xl flex items-center justify-center">
                    <div className="text-center">
                        <div className="text-2xl font-bold">{totalTickets}</div>
                        <div>Tickets Assignés</div>
                    </div>
                </div>
            </div>

            <div className="bg-muted/50 dark:bg-gray-800 p-4 rounded-xl">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-lg font-bold text-black dark:text-white">
                        Liste des Développeurs
                    </h2>
                    <div className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                        {devs.length} développeur(s) au total
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
                                Tickets Assignés
                            </TableHead>
                            <TableHead className={theme === 'dark' ? 'text-gray-300' : 'text-gray-900'}>
                                Action
                            </TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {currentDevs.length > 0 ? (
                            currentDevs.map((dev, index) => (
                                <TableRow key={dev.id} className={theme === 'dark' ? 'border-gray-700' : ''}>
                                    <TableCell className={theme === 'dark' ? 'text-gray-300' : ''}>
                                        {startIndex + index + 1}
                                    </TableCell>
                                    <TableCell className={`font-medium ${theme === 'dark' ? 'text-gray-300' : ''}`}>
                                        {dev.username}
                                    </TableCell>
                                    <TableCell className={theme === 'dark' ? 'text-gray-300' : ''}>
                                        {dev.email}
                                    </TableCell>
                                    <TableCell>
                                        <span className={`inline-flex items-center justify-center px-3 py-1 rounded-full text-sm font-medium ${
                                            dev.ticketCount === 0
                                                ? 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300'
                                                : dev.ticketCount <= 3
                                                ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                                                : dev.ticketCount <= 7
                                                ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                                                : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                                        }`}>
                                            {dev.ticketCount} ticket(s)
                                        </span>
                                    </TableCell>
                                    <TableCell>
                                        <Link to={`/dashboard/devs/${dev.id}/tickets`}>
                                            <Button className={
                                                theme === 'dark'
                                                    ? 'bg-blue-600 hover:bg-blue-700 text-white'
                                                    : 'bg-black hover:bg-gray-800 text-white'
                                            }>
                                                Voir Tickets
                                            </Button>
                                        </Link>
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={5} className="text-center py-8">
                                    <div className={theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}>
                                        Aucun développeur trouvé
                                    </div>
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>

                {devs.length > 0 && (
                    <div className={`flex items-center justify-between px-4 py-3 mt-4 ${
                        theme === 'dark' ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-700'
                    } rounded-md`}>
                        <div className="text-sm">
                            Affichage de {startIndex + 1} à {Math.min(endIndex, devs.length)} sur {devs.length} développeurs
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

export default Devs
