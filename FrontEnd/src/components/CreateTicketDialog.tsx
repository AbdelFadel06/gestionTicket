// src/components/CreateTicketDialog.tsx
import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { toast } from 'react-hot-toast'
import api from '../services/api'

interface CreateTicketDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onTicketCreated?: () => void // callback après création
}

export default function CreateTicketDialog({
  open,
  onOpenChange,
  onTicketCreated,
}: CreateTicketDialogProps) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [priority, setPriority] = useState('basse')
  const [priorityChoices, setPriorityChoices] = useState<[string, string][]>([])

  useEffect(() => {
    getChoices()
  }, [])

  const getChoices = async () => {
    try {
      const res = await api.get<{ priority: [string, string][] }>('api/ticket/choices/')
      setPriorityChoices(res.data.priority)
    } catch (error) {
      toast.error('Erreur de chargement des choix ...')
    }
  }

  const addTicket = async () => {
    if (!title || !description) {
      toast.error('Merci de remplir tous les champs')
      return
    }
    try {
      await api.post('api/ticket/', { title, description, priority })
      setTitle('')
      setDescription('')
      setPriority('basse')
      toast.success('Ticket enregistré avec succès')
      onOpenChange(false)
      onTicketCreated?.()
    } catch (error) {
      toast.error("Erreur dans l'enregistrement du ticket")
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Créer un ticket</DialogTitle>
          <DialogDescription>
            Remplissez les informations ci-dessous pour ajouter un nouveau ticket.
          </DialogDescription>
        </DialogHeader>

        <form
          onSubmit={e => {
            e.preventDefault()
            addTicket()
          }}
          className="space-y-5 mt-4"
        >
          <input
            name="title"
            type="text"
            placeholder="Titre"
            value={title}
            onChange={e => setTitle(e.target.value)}
            className="input input-bordered w-full"
          />
          <input
            name="description"
            type="text"
            value={description}
            placeholder="Description ..."
            onChange={e => setDescription(e.target.value)}
            className="input input-bordered w-full"
          />
          <select
            onChange={e => setPriority(e.target.value)}
            value={priority}
            name="priority"
            className="select select-bordered w-full"
          >
            <option value="">-- Sélectionner une priorité --</option>
            {priorityChoices.map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>

          <DialogFooter>
            <Button type="submit" variant="default" className="w-full">
              Ajouter
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
