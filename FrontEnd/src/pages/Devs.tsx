import { useEffect, useState } from "react"
import api from "../services/api"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"

interface Developer {
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

const Devs = () => {
  const [devs, setDevs] = useState<Developer[]>([])
  const [selectedDev, setSelectedDev] = useState<Developer | null>(null)
  const [tickets, setTickets] = useState<Ticket[]>([])

  // Charger les développeurs
  useEffect(() => {
    const fetchDevs = async () => {
      try {
        const res = await api.get("api/users/")
        console.log("Réponse devs :", res.data)
        if (res.data && Array.isArray(res.data.developers)) {
          setDevs(res.data.developers)
        } else {
          setDevs([])
        }
      } catch (err) {
        console.error(err)
        setDevs([])
      }
    }
    fetchDevs()
  }, [])

  // Charger les tickets assignés à un dev
  const fetchTicketsByDev = async (developerId: number) => {
    try {
      const res = await api.get(`api/tickets/developer/${developerId}/`)
      setTickets(res.data)
    } catch (err) {
      console.error(err)
      setTickets([])
    }
  }

  return (
    <>
      {/* Stats */}
      <div className="grid auto-rows-min gap-4 md:grid-cols-3 mb-4">
        <div className="bg-muted/50 aspect-video rounded-xl flex items-center justify-center">
          <span>Total Devs : {devs.length}</span>
        </div>
        <div className="bg-red-400/50 aspect-video rounded-xl flex items-center justify-center">
          <span>Tickets assignés : {tickets.length}</span>
        </div>
        <div className="bg-muted/50 aspect-video rounded-xl flex items-center justify-center">
          <span>Dev sélectionné : {selectedDev ? selectedDev.username : "Aucun"}</span>
        </div>
      </div>

      {/* Tableau des développeurs */}
      <div className="bg-muted/50 p-4 rounded-xl">
        <h2 className="text-lg font-bold mb-2">Liste des Développeurs</h2>
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
            {devs.map((dev) => (
              <TableRow key={dev.id}>
                <TableCell>{dev.id}</TableCell>
                <TableCell>{dev.username}</TableCell>
                <TableCell>{dev.email}</TableCell>
                <TableCell>
                  <Button
                    onClick={() => {
                      setSelectedDev(dev)
                      fetchTicketsByDev(dev.id)
                    }}
                  >
                    Voir Tickets
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Tickets assignés au dev sélectionné */}
      {selectedDev && (
        <div className="bg-muted/50 p-4 mt-4 rounded-xl">
          <h2 className="text-lg font-bold mb-2">
            Tickets assignés à {selectedDev.username}
          </h2>
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
                {tickets.map((ticket) => (
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
            <p>Aucun ticket assigné à ce développeur.</p>
          )}
        </div>
      )}
    </>
  )
}

export default Devs
