// TicketStats.tsx
import React from 'react'
import Stat from '@/components/stat'

interface Props {
  userRole: 'user' | 'developer' | 'admin'
  tickets: any[]
}

const TicketStats: React.FC<Props> = ({ userRole, tickets }) => {
  const resolvedTickets = tickets.filter(t => t.status === 'resolved')
  const unassignedTickets =
    userRole === 'developer' ? tickets.filter(t => !t.developer) : []

  return (
    <div className="grid auto-rows-min gap-4 md:grid-cols-3 mb-6">
      <div className="bg-muted/50 aspect-video rounded-xl">
        <Stat count={tickets.length} label="Mes Tickets" />
      </div>
      {userRole === 'developer' && (
        <div className="bg-red-400/50 aspect-video rounded-xl">
          <Stat count={unassignedTickets.length} label="Non assigné" />
        </div>
      )}
      <div className="bg-muted/50 aspect-video rounded-xl">
        <Stat count={resolvedTickets.length} label="Résolu" />
      </div>
    </div>
  )
}

export default TicketStats
