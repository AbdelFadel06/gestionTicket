import React, { use, useEffect, useState } from 'react'
import Stat from './stat'
import { Doughnut } from 'react-chartjs-2'
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js'
import api from '../services/api'
import { useAuth } from '../context/AuthContext'

ChartJS.register(ArcElement, Tooltip, Legend)

interface User {
  id: number
  username: string
  role: 'User' | 'Developer' | 'Admin'
}

interface Ticket {
  id: number
  status: 'new' | 'in_progress' | 'resolved' | 'closed'
  developer: User | null
  author: User
}

const StatsDashboard: React.FC = () => {
  const { user } = useAuth() as { user: User }
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [users, setUsers] = useState<User[]>([])



  const fetchData = async () => {
    try {
      const resTickets = await api.get<{ results: Ticket[] }>('api/ticket/')
      setTickets(resTickets.data.results)

      // if (user.role === 'admin') {
      //   const resUsers = await api.get<User[]>('api/users/')
      //   setUsers(resUsers.data)
      // }
    } catch (error) {
      console.error(error)
    }
  }

  useEffect(()=> {
    fetchData()
  }, [])


  // Stats de base
  const resolvedTickets = tickets.filter(t => t.status === 'resolved')
  const unassignedTickets = tickets.filter(t => !t.developer)
  const assignedTickets = tickets.filter(t => t.developer)

  // Donut data pour admin
  const ticketStatusCounts = {
    new: tickets.filter(t => t.status === 'new').length,
    in_progress: tickets.filter(t => t.status === 'in_progress').length,
    resolved: resolvedTickets.length,
    closed: tickets.filter(t => t.status === 'closed').length,
  }

  const donutData = {
    labels: ['New', 'In Progress', 'Resolved', 'Closed'],
    datasets: [
      {
        data: [
          ticketStatusCounts.new,
          ticketStatusCounts.in_progress,
          ticketStatusCounts.resolved,
          ticketStatusCounts.closed,
        ],
        backgroundColor: ['#facc15', '#3b82f6', '#22c55e', '#ef4444'],
        borderWidth: 1,
      },
    ],
  }

  return (
    <div className="grid gap-4 md:grid-cols-3 auto-rows-min">
      {user.role === 'User' && (
        <>
          <Stat count={tickets.length} label="Mes Tickets" />
          <Stat count={resolvedTickets.length} label="Résolus" />
        </>
      )}

      {user.role === 'Developer' && (
        <>
          <Stat count={tickets.length} label="Mes Tickets" />
          <Stat count={unassignedTickets.length} label="Non assignés" />
          <Stat count={resolvedTickets.length} label="Résolus" />
        </>
      )}

      {user.role === 'Admin' && (
        <>
          <Stat count={tickets.length} label="Total Tickets" />
          <Stat count={users.filter(u => u.role === 'Developer').length} label="Developers" />
          <Stat count={users.filter(u => u.role === 'User').length} label="Clients" />

          <div className="col-span-3 md:col-span-1 bg-white p-4 rounded-xl shadow">
            <h2 className="text-lg font-semibold mb-2">Répartition des tickets</h2>
            <Doughnut data={donutData} />
          </div>
        </>
      )}
    </div>
  )
}

export default StatsDashboard
