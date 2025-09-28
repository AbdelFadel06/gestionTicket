import { Eye, Trash2, ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useState } from "react"

interface TicketsTableProps {
  tickets: Ticket[]
  theme: string
  user: User | null
  devs: User[]
  statusLabels: Record<string, string>
  priorityLabels: Record<string, string>
  onView: (ticket: Ticket) => void
  onDelete: (id: number) => void
  onAssignDev: (ticketId: number, devId: number) => void
  onAssignToMe: (ticketId: number) => void
  onChangeStatus: (ticketId: number, newStatus: string) => void
  itemsPerPage?: number // Optionnel : nombre d'éléments par page
}

export interface Ticket {
    id: number
    title: string
    description: string
    status: string
    priority?: string
    developer?: User | null
    author?: User
    comments?: Comment[]
}

export interface User {
    id: number
    username: string
    email: string
    first_name: string
    last_name: string
    profile_picture: string | null
    role?: string
}

export interface Comment {
    id: number
    content: string
    author: User
    created_at: string
}

export default function TicketsTable({
  tickets,
  theme,
  user,
  devs,
  statusLabels,
  priorityLabels,
  onView,
  onDelete,
  onAssignDev,
  onAssignToMe,
  onChangeStatus,
  itemsPerPage = 10, // Valeur par défaut : 10 tickets par page
}: TicketsTableProps) {
  const [currentPage, setCurrentPage] = useState(1)

  // Calcul de la pagination
  const totalPages = Math.ceil(tickets.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentTickets = tickets.slice(startIndex, endIndex)

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

  // Générer les numéros de page à afficher
  const getPageNumbers = () => {
    const pages = []
    const maxVisiblePages = 5

    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2))
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1)

    // Ajuster si on est près de la fin
    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1)
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i)
    }

    return pages
  }

  return (
    <div className="space-y-4">
      {/* Tableau */}
      <div className={`rounded-md border ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
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
                Priorité
              </TableHead>
              <TableHead className={theme === 'dark' ? 'text-gray-300' : 'text-gray-900'}>
                Statut
              </TableHead>
              <TableHead className={theme === 'dark' ? 'text-gray-300' : 'text-gray-900'}>
                Assigné à
              </TableHead>
              <TableHead className={`text-center ${theme === 'dark' ? 'text-gray-300' : 'text-gray-900'}`}>
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {currentTickets.length > 0 ? (
              currentTickets.map((ticket, i) => (
                <TableRow key={ticket.id} className={theme === 'dark' ? 'border-gray-700' : ''}>
                  <TableCell className={theme === 'dark' ? 'text-gray-300' : ''}>
                    {startIndex + i + 1}
                  </TableCell>
                  <TableCell className={theme === 'dark' ? 'text-gray-300' : ''}>
                    {ticket.title}
                  </TableCell>

                  {/* Priorité avec style */}
                  <TableCell>
                    <span
                      className={`inline-flex items-center justify-center h-8 w-24 rounded text-sm font-medium ${
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
                      }`}
                    >
                      {ticket.priority
                        ? priorityLabels[ticket.priority] ?? ticket.priority
                        : 'N/A'}
                    </span>
                  </TableCell>

                  {/* Statut avec style */}
                  <TableCell>
                    <span
                      className={
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
                      }
                    >
                      {user?.role?.toLowerCase() === 'developer' &&
                      ticket.developer?.id === user.id ? (
                        <select
                          value={ticket.status}
                          onChange={(e) => onChangeStatus(ticket.id, e.target.value)}
                          className={`border rounded px-2 py-1 ${
                            theme === 'dark'
                              ? 'bg-gray-800 border-gray-700 text-white'
                              : 'bg-white border-gray-300 text-gray-900'
                          }`}
                        >
                          {Object.entries(statusLabels).map(([value, label]) => (
                            <option key={value} value={value}>
                              {label}
                            </option>
                          ))}
                        </select>
                      ) : (
                        statusLabels[ticket.status] ?? ticket.status
                      )}
                    </span>
                  </TableCell>

                  {/* Assigné à avec style */}
                  <TableCell className="font-medium">
                    {ticket.developer ? (
                      <div className="flex items-center space-x-4">
                        <Avatar>
                          <AvatarImage
                            src={
                              ticket.developer.profile_picture
                                ? ticket.developer.profile_picture
                                : 'https://github.com/shadcn.png'
                            }
                          />
                          <AvatarFallback
                            className={`font-medium text-sm ${
                              theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                            }`}
                          >
                            {ticket.developer.first_name.charAt(0)}
                            {ticket.developer.last_name.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <p className={theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}>
                          {ticket.developer.username}
                        </p>
                      </div>
                    ) : user?.role?.toLowerCase() === 'admin' ? (
                      <select
                        onChange={(e) => onAssignDev(ticket.id, parseInt(e.target.value))}
                        defaultValue=""
                        className={`border rounded px-2 py-1 ${
                          theme === 'dark'
                            ? 'bg-gray-800 border-gray-700 text-white'
                            : 'bg-white border-gray-300 text-gray-900'
                        }`}
                      >
                        <option value="">-- Choisir dev --</option>
                        {devs.map((dev) => (
                          <option key={dev.id} value={dev.id}>
                            {dev.username}
                          </option>
                        ))}
                      </select>
                    ) : user?.role?.toLowerCase() === 'developer' ? (
                      <Button
                        size="sm"
                        onClick={() => onAssignToMe(ticket.id)}
                        className={`mt-1 ${
                          theme === 'dark'
                            ? 'bg-blue-600 hover:bg-blue-700 text-white'
                            : 'bg-black hover:bg-gray-800 text-white'
                        }`}
                      >
                        Prendre en charge
                      </Button>
                    ) : (
                      <span
                        className={`mx-auto text-red-500  ${
                          theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                        }`}
                      >
                        _ _
                      </span>
                    )}
                  </TableCell>

                  {/* Actions avec style */}
                  <TableCell>
                    <div className="grid grid-cols-2 gap-1">
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              size="icon"
                              onClick={() => onView(ticket)}
                              className={`h-10 w-12 ${
                                theme === 'dark'
                                  ? 'bg-blue-600 hover:bg-blue-700 text-white'
                                  : 'bg-black hover:bg-gray-800 text-white'
                              }`}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Voir plus</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>

                      {ticket.author?.id === user?.id && (
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                size="icon"
                                variant="destructive"
                                onClick={() => onDelete(ticket.id)}
                                className="h-10 w-12"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Supprimer</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8">
                  <div className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                    Aucun ticket trouvé
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {tickets.length > 0 && (
        <div className={`flex items-center justify-between px-4 py-3 ${
          theme === 'dark' ? 'bg-gray-800 text-gray-300' : 'bg-gray-100 text-gray-700'
        } rounded-md`}>
          {/* Informations */}
          <div className="text-sm">
            Affichage de {startIndex + 1} à {Math.min(endIndex, tickets.length)} sur {tickets.length} tickets
          </div>

          {/* Contrôles de pagination */}
          <div className="flex items-center space-x-2">
            {/* Bouton précédent */}
            <Button
              variant="outline"
              size="sm"
              onClick={goToPreviousPage}
              disabled={currentPage === 1}
              className={theme === 'dark' ? 'border-gray-600' : ''}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>

            {/* Numéros de page */}
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

            {/* Bouton suivant */}
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
            <span>Éléments par page:</span>
            <select
              value={itemsPerPage}
              onChange={(e) => {
                setCurrentPage(1)
                // Note: Vous devrez gérer ce changement depuis le parent
              }}
              className={`border rounded px-2 py-1 text-sm ${
                theme === 'dark'
                  ? 'bg-gray-700 border-gray-600 text-white'
                  : 'bg-white border-gray-300 text-gray-900'
              }`}
              disabled // Temporairement désactivé car besoin de gestion depuis le parent
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
