// TicketTable.tsx
import React from 'react'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Button } from '@/components/ui/button'

interface User {
  id: number
  username: string
  role: 'user' | 'developer' | 'admin'
  full_name?: string
}

interface Ticket {
  id: number
  title: string
  description: string
  priority: string
  status: 'new' | 'in_progress' | 'resolved' | 'closed'
  developer: User | null
  author: User
}

interface Props {
  tickets: Ticket[]
  currentUser: User
  showAssignButton?: boolean
  showDeleteButtonForUserId?: number
  onAssign?: (ticketId: number) => void
  onDelete?: (ticketId: number) => void
  onView?: (ticket: Ticket) => void
  bgColor?: string
  title?: string
}

const TicketTable: React.FC<Props> = ({
  tickets,
  // currentUser,
  showAssignButton = false,
  showDeleteButtonForUserId,
  onAssign,
  onDelete,
  onView,
  bgColor = 'bg-white',
  title
}) => (
  <div className={`${bgColor} p-4 rounded-xl`}>
    {title && <h2 className="text-xl font-semibold mb-2">{title}</h2>}
    <Table className="min-w-[700px]">
      <TableHeader>
        <TableRow>
          <TableHead>#</TableHead>
          <TableHead>Title</TableHead>
          <TableHead className="hidden sm:table-cell">Priority</TableHead>
          <TableHead className="text-right">Status</TableHead>
          <TableHead className="hidden md:table-cell text-right">Assigned</TableHead>
          <TableHead className="text-right">Action</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {tickets.length > 0 ? (
          tickets.map((ticket, index) => (
            <TableRow key={ticket.id}>
              <TableCell>{index + 1}</TableCell>
              <TableCell>{ticket.title}</TableCell>
              <TableCell className="hidden sm:table-cell">{ticket.priority}</TableCell>
              <TableCell className="text-right">{ticket.status}</TableCell>
              <TableCell className="hidden md:table-cell text-right">
                {!ticket.developer && showAssignButton ? (
                  <Button
                    onClick={() => onAssign?.(ticket.id)}
                    className="btn btn-xs btn-outline btn-primary"
                  >
                    Prendre en charge
                  </Button>
                ) : (
                  ticket.developer?.username || <span className="text-gray-400">__</span>
                )}
              </TableCell>
              <TableCell className="text-right">
                <div className="flex flex-col sm:flex-row sm:space-x-2 gap-2 justify-end">
                  {ticket.author.id === showDeleteButtonForUserId && (
                    <Button onClick={() => onDelete?.(ticket.id)}>Supprimer</Button>
                  )}
                  <Button onClick={() => onView?.(ticket)}>Voir Plus</Button>
                </div>
              </TableCell>
            </TableRow>
          ))
        ) : (
          <TableRow>
            <TableCell colSpan={6} className="text-center">
              Aucun ticket
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  </div>
)

export default TicketTable
