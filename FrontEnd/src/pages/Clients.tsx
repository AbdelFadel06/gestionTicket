import { useEffect, useState } from 'react'
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
    const [clients, setClients] = useState<User[]>([])
    const [selectedClient, setSelectedClient] = useState<User | null>(null)
    const [tickets, setTickets] = useState<Ticket[]>([])

    // Charger les clients
    useEffect(() => {
        const fetchClients = async () => {
            try {
                const res = await api.get('api/users/')
                console.log('Données reçues :', res.data) // ⚡ debug
                setClients(res.data.users || []) // sécuriser
            } catch (error) {
                console.error('Erreur récupération clients :', error)
            }
        }

        fetchClients()
    }, [])

    // Charger les tickets d’un client
    const fetchTicketsByClient = async (userId: number) => {
        const res = await api.get(`api/tickets/user/${userId}/`)
        setTickets(res.data)
    }

    return (
        <>
            {/* Stats fictives pour l’instant */}
            <div className="grid auto-rows-min gap-4 md:grid-cols-3 mb-4">
                <div className="bg-muted/50 aspect-video rounded-xl flex items-center justify-center">
                    <span>Total Clients : {clients.length}</span>
                </div>
                <div className="bg-muted/50 aspect-video rounded-xl flex items-center justify-center">
                    <span>Tickets totaux : {tickets.length}</span>
                </div>
                <div className="bg-muted/50 aspect-video rounded-xl flex items-center justify-center">
                    <span>
                        Client sélectionné : {selectedClient ? selectedClient.username : 'Aucun'}
                    </span>
                </div>
            </div>

            {/* Tableau des clients */}
            <div className="bg-muted/50 p-4 rounded-xl">
                <h2 className="text-lg font-bold mb-2">Liste des Clients</h2>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>ID</TableHead>
                            <TableHead>Nom</TableHead>
                            <TableHead>Email</TableHead>
                            <TableHead>Action</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {clients.length > 0 ? (
                            clients.map(client => (
                                <TableRow key={client.id}>
                                    <TableCell>{client.id}</TableCell>
                                    <TableCell>{client.username}</TableCell>
                                    <TableCell>{client.email}</TableCell>
                                    <TableCell>
                                        <Button
                                            onClick={() => {
                                                setSelectedClient(client)
                                                fetchTicketsByClient(client.id)
                                            }}
                                        >
                                            Voir Tickets
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={4} className="text-center">
                                    Aucun client trouvé
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* Liste des tickets du client sélectionné */}
            {selectedClient && (
                <div className="bg-muted/50 p-4 mt-4 rounded-xl">
                    <h2 className="text-lg font-bold mb-2">Tickets de {selectedClient.username}</h2>
                    {tickets.length > 0 ? (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>ID</TableHead>
                                    <TableHead>Titre</TableHead>
                                    <TableHead>Statut</TableHead>
                                    <TableHead>Priorité</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {tickets.map(ticket => (
                                    <TableRow key={ticket.id}>
                                        <TableCell>{ticket.id}</TableCell>
                                        <TableCell>{ticket.title}</TableCell>
                                        <TableCell>{ticket.status}</TableCell>
                                        <TableCell>{ticket.priority}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    ) : (
                        <p>Aucun ticket trouvé pour ce client.</p>
                    )}
                </div>
            )}
        </>
    )
}

export default Clients
