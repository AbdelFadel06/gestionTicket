import { useEffect, useRef, useState } from "react"
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
  const [totalTickets, setTotalTickets] = useState<number>(0)

  const ticketsSectionRef = useRef<HTMLDivElement | null>(null)

  const [statusLabels, setStatusLabels] = useState<Record<string, string>>({})
  const [priorityLabels, setPriorityLabels] = useState<Record<string, string>>({})

  const getChoices = async () => {
    try {
      const res = await api.get("/api/ticket/choices/")
      const { status, priority } = res.data

      setStatusLabels(
        Object.fromEntries(status.map(([value, label]: [string, string]) => [value, label]))
      )
      setPriorityLabels(
        Object.fromEntries(priority.map(([value, label]: [string, string]) => [value, label]))
      )
    } catch (err) {
      console.error("Erreur récupération choices", err)
    }
  }

  // Charger les développeurs + total tickets
  useEffect(() => {
    const fetchDevs = async () => {
      try {
        const res = await api.get("api/users/")
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

    const fetchTotalTickets = async () => {
      try {
        const res = await api.get("api/ticket/") // ⚡ endpoint qui retourne tous les tickets
        if (res.data.results && Array.isArray(res.data.results)) {
          setTotalTickets(res.data.results.length)
        } else {
          setTotalTickets(0)
        }
      } catch (err) {
        console.error("Erreur récupération total tickets :", err)
        setTotalTickets(0)
      }
    }

    fetchDevs()
    fetchTotalTickets()
    getChoices()
  }, [])

  // Charger les tickets assignés à un dev
  const fetchTicketsByDev = async (developerId: number) => {
    try {
      const res = await api.get(`api/tickets/developer/${developerId}/`)
      setTickets(res.data)

      setTimeout(() => {
        ticketsSectionRef.current?.scrollIntoView({ behavior: "smooth" })
      }, 100)
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
          <span>Tickets assignés (tous devs) : {totalTickets}</span>
        </div>
        <div className="bg-muted/50 aspect-video rounded-xl flex flex-col items-center justify-center">
          <span>Dev sélectionné : {selectedDev ? selectedDev.username : "Aucun"}</span>
          {selectedDev && (
            <span className="text-sm text-gray-600">
              Tickets assignés : {tickets.length}
            </span>
          )}
        </div>
      </div>

      {/* Tableau des développeurs */}
      <div className="bg-muted/50 p-4 rounded-xl">
        <h2 className="text-lg font-bold mb-2">Liste des Développeurs</h2>
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
            {devs.map((dev, item) => (
              <TableRow key={dev.id}>
                <TableCell>{item + 1}</TableCell>
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

      {/* Tickets du dev sélectionné */}
      {selectedDev && (
        <div ref={ticketsSectionRef} className="bg-muted/50 p-4 mt-4 rounded-xl">
          <h2 className="text-lg font-bold mb-2">
            Tickets assignés à {selectedDev.username}
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
                    <TableCell>{statusLabels[ticket.status] ?? ticket.status}</TableCell>
                    <TableCell>{priorityLabels[ticket.priority] ?? ticket.priority}</TableCell>
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
