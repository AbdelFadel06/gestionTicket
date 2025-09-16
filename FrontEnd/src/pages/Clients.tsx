import { useEffect, useState, useRef } from 'react'
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
}

interface Ticket {
    id: number
    title: string
    status: string
    priority: string
}

const Clients = () => {
    const { theme } = useTheme()
    const [clients, setClients] = useState<User[]>([])
    const [selectedClient, setSelectedClient] = useState<User | null>(null)
    const [tickets, setTickets] = useState<Ticket[]>([])
    const [totalTickets, setTotalTickets] = useState<number>(0)
    const ticketsRef = useRef<HTMLDivElement | null>(null)

    const [statusLabels, setStatusLabels] = useState<Record<string, string>>({})
    const [priorityLabels, setPriorityLabels] = useState<Record<string, string>>({})

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

    useEffect(() => {
        const fetchClients = async () => {
            try {
                const res = await api.get('api/users/')
                setClients(res.data.users || [])
            } catch (error) {
                console.error('Erreur récupération clients :', error)
            }
        }

        const fetchTotalTickets = async () => {
            try {
                const res = await api.get('api/ticket/')
                setTotalTickets(res.data.results?.length || 0)
            } catch (error) {
                console.error('Erreur récupération total tickets :', error)
                setTotalTickets(0)
            }
        }

        fetchClients()
        fetchTotalTickets()
        getChoices()
    }, [])

    const fetchTicketsByClient = async (userId: number) => {
        const res = await api.get(`api/tickets/user/${userId}/`)
        setTickets(res.data)
    }

    const handleViewTickets = (client: User) => {
        setSelectedClient(client)
        fetchTicketsByClient(client.id)
        setTimeout(() => {
            ticketsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
        }, 300)
    }

    return (
        <>
            {/* Stats */}
            <div className="grid auto-rows-min gap-4 md:grid-cols-3 mb-4">
                <div className="aspect-video rounded-xl flex items-center justify-center bg-yellow-100 dark:bg-yellow-900 text-black dark:text-yellow-200">
                    <span>Total Clients : {clients.length}</span>
                </div>
                <div className="aspect-video rounded-xl flex items-center justify-center bg-green-100 dark:bg-green-900 text-black dark:text-green-200">
                    <span>Tickets totaux : {totalTickets}</span>
                </div>
                <div className="aspect-video rounded-xl flex flex-col items-center justify-center bg-muted/50 dark:bg-gray-800 text-black dark:text-white">
                    <span>
                        Client sélectionné : {selectedClient ? selectedClient.username : 'Aucun'}
                    </span>
                    {selectedClient && (
                        <span className="text-sm text-gray-600 dark:text-gray-300">
                            Tickets : {tickets.length}
                        </span>
                    )}
                </div>
            </div>

            {/* Tableau des clients */}
            <div className="p-4 rounded-xl bg-muted/50 dark:bg-gray-800">
                <h2 className="text-lg font-bold mb-2 text-black dark:text-white">
                    Liste des Clients
                </h2>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>#</TableHead>
                            <TableHead>Nom</TableHead>
                            <TableHead>Email</TableHead>
                            <TableHead>Action</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {clients.length > 0 ? (
                            clients.map((client, item) => (
                                <TableRow key={client.id}>
                                    <TableCell>{item + 1}</TableCell>
                                    <TableCell>{client.username}</TableCell>
                                    <TableCell>{client.email}</TableCell>
                                    <TableCell>
                                        <Button
                                            onClick={() => handleViewTickets(client)}
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
                                <TableCell
                                    colSpan={4}
                                    className="text-center text-black dark:text-white"
                                >
                                    Aucun client trouvé
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* Tickets du client sélectionné */}
            {selectedClient && (
                <div ref={ticketsRef} className="p-4 mt-4 rounded-xl bg-muted/50 dark:bg-gray-800">
                    <h2 className="text-lg font-bold mb-2 text-black dark:text-white">
                        Tickets de {selectedClient.username}
                    </h2>
                    {tickets.length > 0 ? (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>#</TableHead>
                                    <TableHead>Titre</TableHead>
                                    <TableHead>Statut</TableHead>
                                    <TableHead>Priorité</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {tickets.map((ticket, item) => (
                                    <TableRow key={ticket.id}>
                                        <TableCell>{item + 1}</TableCell>
                                        <TableCell>{ticket.title}</TableCell>
                                        <TableCell>
                                            <span
                                                className={
                                                    ticket.status === 'new'
                                                        ? 'text-blue-400 dark:text-blue-300'
                                                        : ticket.status === ' in_progress'
                                                        ? 'text-gray-700 dark:text-gray-300'
                                                        : ticket.status === 'resolved'
                                                        ? 'text-green-600 dark:text-green-400'
                                                        : 'text-yellow-500 dark:text-yellow-300'
                                                }
                                            >
                                                {statusLabels[ticket.status] ?? ticket.status}
                                            </span>
                                        </TableCell>
                                        <TableCell>
                                            <span
                                                className={`inline-flex items-center justify-center h-8 w-24 rounded text-sm font-medium ${
                                                    ticket.priority === 'critique'
                                                        ? 'text-red-600 bg-red-100 dark:text-red-300 dark:bg-red-900 px-3 py-2'
                                                        : ticket.priority === 'haute'
                                                        ? 'text-orange-500 bg-orange-100 dark:text-orange-300 dark:bg-orange-900 px-3 py-2'
                                                        : ticket.priority === 'moyenne'
                                                        ? 'text-yellow-400 bg-yellow-100 dark:text-yellow-300 dark:bg-yellow-900 px-3 py-2'
                                                        : 'text-green-500 bg-green-100 dark:text-green-300 dark:bg-green-900 px-3 py-2'
                                                }`}
                                            >
                                                {priorityLabels[ticket.priority] ?? ticket.priority}
                                            </span>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    ) : (
                        <p className="text-black dark:text-white">
                            Aucun ticket trouvé pour ce client.
                        </p>
                    )}
                </div>
            )}
        </>
    )
}

export default Clients
