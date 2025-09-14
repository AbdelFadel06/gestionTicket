// import { useEffect, useState } from 'react'
// import api from '../services/api'
// import { toast, Toaster } from 'react-hot-toast'
// import { useAuth } from '../context/AuthContext'
// import Stat from '@/components/stat'
// import {
//     Table,
//     TableBody,
//     TableCell,
//     TableHead,
//     TableHeader,
//     TableRow,
// } from '@/components/ui/table'
// import { Button } from '@/components/ui/button'
// import StatsDashboard from '@/components/StatsDashboard'

// import {
//     Dialog,
//     DialogContent,
//     DialogHeader,
//     DialogTitle,
//     DialogDescription,
//     DialogFooter,
//     DialogTrigger,
// } from '@/components/ui/dialog'
// import { Outlet } from 'react-router-dom'

// interface User {
//     id: number
//     username: string
//     role: 'user' | 'developer' | 'admin'
//     full_name?: string
// }

// interface Comment {
//     id: number
//     content: string
//     author: User
//     created_at: string
// }

// interface Ticket {
//     id: number
//     title: string
//     description: string
//     priority: string
//     status: 'new' | 'in_progress' | 'resolved' | 'closed'
//     developer: User | null
//     author: User
//     comments: Comment[]
// }

// const Tickets: React.FC = () => {
//     const [tickets, setTickets] = useState<Ticket[]>([])
//     const [newComment, setNewComment] = useState<string>('')
//     const [loading, setLoading] = useState<boolean>(false)
//     const [priorityChoices, setPriorityChoices] = useState<[string, string][]>([])
//     const [title, setTitle] = useState<string>('')
//     const [description, setDescription] = useState<string>('')
//     const [priority, setPriority] = useState<string>('basse')
//     const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null)

//     const [dialogOpen, setDialogOpen] = useState(false)
//     const [addDialogOpen, setAddDialogOpen] = useState(false)

//     const { user } = useAuth() as { user: User }

//     const resolvedTickets = tickets.filter(t => t.status === 'resolved')
//     const unassignedTickets = tickets.filter(t => !t.developer)
//     const assignedTickets = tickets.filter(t => t.developer)

//     useEffect(() => {
//         getTickets()
//         getChoices()
//     }, [])

//     const getChoices = async () => {
//         try {
//             const res = await api.get<{ priority: [string, string][] }>('api/ticket/choices/')
//             setPriorityChoices(res.data.priority)
//         } catch (error) {
//             console.error(error)
//             toast.error('Erreur de chargement des choix ...')
//         }
//     }

//     const getTickets = async () => {
//         try {
//             const res = await api.get<{ results: Ticket[] }>('api/ticket/')
//             setTickets(res.data.results)
//         } catch (error) {
//             console.error(error)
//             toast.error('Erreur de chargement ...')
//         }
//     }

//     const addTicket = async () => {
//         if (!title || !description) {
//             toast.error('Merci de remplir tous les champs')
//             return
//         }
//         try {
//             await api.post('api/ticket/', { title, description, priority })
//             getTickets()
//             setAddDialogOpen(false)
//             setTitle('')
//             setDescription('')
//             setPriority('basse')
//             toast.success('Ticket enregistré avec succès')
//         } catch (error) {
//             console.error(error)
//             toast.error("Erreur dans l'enregistrement du ticket")
//         }
//     }

//     const handleAddComment = async () => {
//         if (!newComment.trim() || !selectedTicket) {
//             toast.error('Le commentaire ne peut pas être vide')
//             return
//         }

//         try {
//             setLoading(true)
//             await api.post(`api/ticket/${selectedTicket.id}/comment/`, { content: newComment })
//             const res = await api.get<Ticket>(`api/ticket/${selectedTicket.id}/`)
//             setSelectedTicket(res.data)
//             setNewComment('')
//             toast.success('Commentaire ajouté avec succès')
//         } catch (error) {
//             console.error(error)
//             toast.error("Erreur lors de l'ajout du commentaire")
//         } finally {
//             setLoading(false)
//         }
//     }

//     const handleAssignToMe = async (ticketId: number) => {
//         try {
//             await api.patch(`api/ticket/${ticketId}/accepted/`)
//             toast.success('Ticket pris en charge !')
//             getTickets()
//         } catch (error) {
//             console.error(error)
//             toast.error('Impossible de prendre en charge ce ticket')
//         }
//     }

//     const deleteTicket = async (id: number) => {
//         try {
//             await api.delete(`api/ticket/${id}/`)
//             getTickets()
//             toast.success('Ticket supprimé avec succès')
//         } catch (error) {
//             console.error(error)
//             toast.error('Erreur lors de la suppression')
//         }
//     }

//     return (
//         <>
//             <Toaster />
//             {/* Header + Bouton Ajouter */}
//             <div className="flex justify-between items-center mb-6">
//                 <div></div>

//                 <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
//                     <DialogTrigger asChild>
//                         <Button className="rounded mt-10">+ Ajouter un ticket</Button>
//                     </DialogTrigger>

//                     <DialogContent className="max-w-lg">
//                         <DialogHeader>
//                             <DialogTitle>Créer un ticket</DialogTitle>
//                             <DialogDescription>
//                                 Remplissez les informations ci-dessous pour ajouter un nouveau
//                                 ticket.
//                             </DialogDescription>
//                         </DialogHeader>

//                         <form
//                             onSubmit={e => {
//                                 e.preventDefault()
//                                 addTicket()
//                             }}
//                             className="space-y-5 mt-4"
//                         >
//                             <input
//                                 name="title"
//                                 type="text"
//                                 placeholder="Titre"
//                                 value={title}
//                                 onChange={e => setTitle(e.target.value)}
//                                 className="input input-bordered w-full"
//                             />
//                             <input
//                                 name="description"
//                                 type="text"
//                                 value={description}
//                                 placeholder="Description ..."
//                                 onChange={e => setDescription(e.target.value)}
//                                 className="input input-bordered w-full"
//                             />
//                             <select
//                                 onChange={e => setPriority(e.target.value)}
//                                 value={priority}
//                                 name="priority"
//                                 className="select select-bordered w-full"
//                             >
//                                 <option value="">-- Sélectionner une priorité --</option>
//                                 {priorityChoices.map(([value, label]) => (
//                                     <option key={value} value={value}>
//                                         {label}
//                                     </option>
//                                 ))}
//                             </select>

//                             <DialogFooter>
//                                 <Button type="submit" variant="default" className="w-full">
//                                     Ajouter
//                                 </Button>
//                             </DialogFooter>
//                         </form>
//                     </DialogContent>
//                 </Dialog>
//             </div>
//             {/* Statistiques */}
//             {/* <div className="grid auto-rows-min gap-4 md:grid-cols-3 mb-6">
//                 <div className="bg-muted/50 aspect-video rounded-xl">
//                     <Stat count={tickets.length} label="Mes Tickets" />
//                 </div>
//                 <div className="bg-red-400/50 aspect-video rounded-xl">
//                     <Stat count={unassignedTickets.length} label="Non assigné" />
//                 </div>
//                 <div className="bg-muted/50 aspect-video rounded-xl">
//                     <Stat count={resolvedTickets.length} label="Résolu" />
//                 </div>
//             </div> */}

//             <StatsDashboard />

//             {/* Tableau */}

//             <div className="space-y-8">
//                 {/* Tickets non assignés */}
//                 <div className="bg-yellow-50 p-4 rounded-xl">
//                     <h2 className="text-xl font-semibold mb-2">Tickets non assignés</h2>
//                     <Table className="min-w-[700px]">
//                         <TableHeader>
//                             <TableRow>
//                                 <TableHead>#</TableHead>
//                                 <TableHead>Title</TableHead>
//                                 <TableHead className="hidden sm:table-cell">Priority</TableHead>
//                                 <TableHead className="text-right">Status</TableHead>
//                                 <TableHead className="hidden md:table-cell text-right">
//                                     Assigned
//                                 </TableHead>
//                                 <TableHead className="text-right">Action</TableHead>
//                             </TableRow>
//                         </TableHeader>
//                         <TableBody>
//                             {unassignedTickets.length > 0 ? (
//                                 unassignedTickets.map((ticket, index) => (
//                                     <TableRow key={ticket.id}>
//                                         <TableCell>{index + 1}</TableCell>
//                                         <TableCell>{ticket.title}</TableCell>
//                                         <TableCell className="hidden sm:table-cell">
//                                             {ticket.priority}
//                                         </TableCell>
//                                         <TableCell className="text-right">
//                                             {ticket.status}
//                                         </TableCell>
//                                         <TableCell className="hidden md:table-cell text-right">
// {!ticket.developer &&
// user.role.toLowerCase() === 'developer' ? (
//     <Button
//         onClick={() => handleAssignToMe(ticket.id)}
//         className="btn btn-xs btn-outline btn-primary"
//     >
//         Prendre en charge
//     </Button>
// ) : (
//     <span className="text-gray-400">__</span>
// )}
//                                         </TableCell>

//                                         <TableCell className="text-right">
//                                             <div className="flex flex-col sm:flex-row sm:space-x-2 gap-2 justify-end">
//                                                 {ticket.author?.id === user.id && (
//                                                     <Button onClick={() => deleteTicket(ticket.id)}>
//                                                         Supprimer
//                                                     </Button>
//                                                 )}
//                                                 <Button
//                                                     onClick={() => {
//                                                         setSelectedTicket(ticket)
//                                                         setDialogOpen(true)
//                                                     }}
//                                                 >
//                                                     Voir Plus
//                                                 </Button>
//                                             </div>
//                                         </TableCell>
//                                     </TableRow>
//                                 ))
//                             ) : (
//                                 <TableRow>
//                                     <TableCell colSpan={6} className="text-center">
//                                         Aucun ticket non assigné
//                                     </TableCell>
//                                 </TableRow>
//                             )}
//                         </TableBody>
//                     </Table>
//                 </div>

//                 {/* Tickets assignés */}
//                 <div className="bg-green-50 p-4 rounded-xl">
//                     <h2 className="text-xl font-semibold mb-2">Tickets assignés</h2>
//                     <Table className="min-w-[700px]">
//                         <TableHeader>
//                             <TableRow>
//                                 <TableHead>#</TableHead>
//                                 <TableHead>Title</TableHead>
//                                 <TableHead className="hidden sm:table-cell">Priority</TableHead>
//                                 <TableHead className="text-right">Status</TableHead>
//                                 <TableHead className="hidden md:table-cell text-right">
//                                     Assigned
//                                 </TableHead>
//                                 <TableHead className="text-right">Action</TableHead>
//                             </TableRow>
//                         </TableHeader>
//                         <TableBody>
//                             {assignedTickets.length > 0 ? (
//                                 assignedTickets.map((ticket, index) => (
//                                     <TableRow key={ticket.id}>
//                                         <TableCell>{index + 1}</TableCell>
//                                         <TableCell>{ticket.title}</TableCell>
//                                         <TableCell className="hidden sm:table-cell">
//                                             {ticket.priority}
//                                         </TableCell>
//                                         <TableCell className="text-right">
//                                             {ticket.status}
//                                         </TableCell>
//                                         <TableCell className="hidden md:table-cell text-right">
//                                             {ticket.developer?.username}
//                                         </TableCell>
//                                         <TableCell className="text-right">
//                                             <div className="flex flex-col sm:flex-row sm:space-x-2 gap-2 justify-end">
//                                                 {ticket.author?.id === user.id && (
//                                                     <Button onClick={() => deleteTicket(ticket.id)}>
//                                                         Supprimer
//                                                     </Button>
//                                                 )}
//                                                 <Button
//                                                     onClick={() => {
//                                                         setSelectedTicket(ticket)
//                                                         setDialogOpen(true)
//                                                     }}
//                                                 >
//                                                     Voir Plus
//                                                 </Button>
//                                             </div>
//                                         </TableCell>
//                                     </TableRow>
//                                 ))
//                             ) : (
//                                 <TableRow>
//                                     <TableCell colSpan={6} className="text-center">
//                                         Aucun ticket assigné
//                                     </TableCell>
//                                 </TableRow>
//                             )}
//                         </TableBody>
//                     </Table>
//                 </div>
//             </div>

// <Outlet/>

//             {/* Dialog Voir Plus */}
//             <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
//                 <DialogContent className="max-w-2xl">
//                     {selectedTicket ? (
//                         <>
//                             <DialogHeader>
//                                 <DialogTitle>{selectedTicket.title}</DialogTitle>
//                                 <DialogDescription>
//                                     Priorité : {selectedTicket.priority} | Status :{' '}
//                                     {selectedTicket.status}
//                                 </DialogDescription>
//                             </DialogHeader>

//                             <p className="mt-4 text-gray-800">{selectedTicket.description}</p>

//                             <div className="mt-6">
//                                 <h2 className="font-medium mb-2">Commentaires</h2>
//                                 <div className="space-y-4 max-h-64 overflow-y-auto">
//                                     {selectedTicket.comments.length > 0 ? (
//                                         selectedTicket.comments.map(comment => (
//                                             <div
//                                                 key={comment.id}
//                                                 className="p-3 border rounded-lg bg-gray-50"
//                                             >
//                                                 <div className="flex items-center space-x-2 mb-1">
//                                                     <div className="w-8 h-8 rounded-full bg-blue-200 flex items-center justify-center text-sm font-bold text-blue-700">
//                                                         {comment.author.full_name
//                                                             ?.charAt(0)
//                                                             .toUpperCase() || '?'}
//                                                     </div>
//                                                     <div>
//                                                         <p className="text-sm font-medium text-gray-800">
//                                                             {comment.author.full_name ||
//                                                                 'Utilisateur'}
//                                                         </p>
//                                                         <p className="text-xs text-gray-500">
//                                                             {new Date(
//                                                                 comment.created_at
//                                                             ).toLocaleString()}
//                                                         </p>
//                                                     </div>
//                                                 </div>
//                                                 <p className="text-gray-700 ml-10">
//                                                     {comment.content}
//                                                 </p>
//                                             </div>
//                                         ))
//                                     ) : (
//                                         <p className="text-gray-500 italic">Aucun commentaire</p>
//                                     )}
//                                 </div>

//                                 {/* Seul author ou developer peut ajouter un commentaire */}
//                                 {(user.id === selectedTicket.author.id ||
//                                     user.id === selectedTicket.developer?.id) && (
//                                     <div className="mt-4">
//                                         <textarea
//                                             className="textarea textarea-bordered w-full"
//                                             placeholder="Ajouter un commentaire..."
//                                             value={newComment}
//                                             onChange={e => setNewComment(e.target.value)}
//                                         />
//                                         <Button
//                                             type="button"
//                                             onClick={handleAddComment}
//                                             disabled={loading}
//                                             className="mt-2"
//                                         >
//                                             {loading ? 'Envoi...' : 'Ajouter un commentaire'}
//                                         </Button>
//                                     </div>
//                                 )}
//                             </div>

//                             <DialogFooter className="mt-4">
//                                 <Button variant="outline" onClick={() => setDialogOpen(false)}>
//                                     Fermer
//                                 </Button>
//                             </DialogFooter>
//                         </>
//                     ) : (
//                         <p>Aucun ticket sélectionné</p>
//                     )}
//                 </DialogContent>
//             </Dialog>
//         </>
//     )
// }

// export default Tickets
