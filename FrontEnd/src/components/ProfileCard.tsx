
import { Card } from "@/components/ui/card"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Pencil, Camera, Save, X, User, Mail, AtSign } from "lucide-react"
import { useState, useEffect } from "react"
import { useTheme } from "next-themes"
import api from "@/services/api"
import { toast } from "react-hot-toast"

interface User {
  id: number
  username: string
  email: string
  first_name?: string
  last_name?: string
  profile_picture?: string | null
  role?: string
}

export default function ProfileCard({ user: initialUser }: { user: User }) {
  const { theme } = useTheme()
  const [user, setUser] = useState<User>(initialUser)
  const [editing, setEditing] = useState<string | null>(null)
  const [editedValue, setEditedValue] = useState("")
  const [profilePic, setProfilePic] = useState<string>("https://github.com/shadcn.png")
  const [isSaving, setIsSaving] = useState(false)

  // Fonction pour obtenir l'URL correcte de l'image
  const getCorrectImageUrl = (url: string | null | undefined): string => {
    if (!url) return " "

    // Si c'est déjà une URL complète
    if (url.startsWith('http')) {
      return url
    }

    // Si c'est un chemin relatif, construire l'URL complète
    // REMARQUE : Changez le port 8000 si votre Django tourne sur un autre port
    const baseURL = 'http://127.0.0.1:8000'

    // Nettoyer le chemin (enlever les slashs doubles)
    let cleanPath = url.startsWith('/') ? url : `/${url}`
    cleanPath = cleanPath.replace(/\/+/g, '/')

    return `${baseURL}${cleanPath}`
  }

  // Charger l'image initiale
  useEffect(() => {
    if (initialUser.profile_picture) {
      const imageUrl = getCorrectImageUrl(initialUser.profile_picture)
      console.log("URL de l'image:", imageUrl)

      // Tester si l'image est accessible
      const img = new Image()
      img.onload = () => {
        setProfilePic(imageUrl)
      }
      img.onerror = () => {
        console.warn("Image non accessible, utilisation du fallback")
        setProfilePic("")
      }
      img.src = imageUrl
    }
  }, [initialUser.profile_picture])

  const handleSave = async (field: string) => {
    if (!editedValue.trim()) {
      toast.error("La valeur ne peut pas être vide")
      return
    }

    setIsSaving(true)
    try {
      const updatedData = { [field]: editedValue }
      const response = await api.patch(`/api/users/${user.id}/`, updatedData)

      setUser(prev => ({ ...prev, [field]: editedValue }))
      setEditing(null)
      toast.success("Informations mises à jour avec succès")
    } catch (error: any) {
      console.error("Erreur lors de la mise à jour:", error)
      const errorMessage = error.response?.data?.detail || "Erreur lors de la mise à jour"
      toast.error(errorMessage)
    } finally {
      setIsSaving(false)
    }
  }

  const handleCancel = () => {
    setEditing(null)
    setEditedValue("")
  }

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      const formData = new FormData()
      formData.append('profile_picture', file)

      try {
        // Aperçu immédiat avec l'image locale
        const reader = new FileReader()
        reader.onload = (e) => {
          setProfilePic(e.target?.result as string)
        }
        reader.readAsDataURL(file)

        const response = await api.patch(`/api/users/${user.id}/`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        })

        // Mettre à jour avec la nouvelle URL
        if (response.data.profile_picture) {
          const newImageUrl = getCorrectImageUrl(response.data.profile_picture)
          // Ajouter un timestamp pour forcer le rechargement
          const timestamp = new Date().getTime()
          const uniqueUrl = `${newImageUrl}${newImageUrl.includes('?') ? '&' : '?'}t=${timestamp}`

          setProfilePic(uniqueUrl)
          setUser(prev => ({ ...prev, profile_picture: response.data.profile_picture }))
        }

        toast.success("Photo de profil mise à jour avec succès")
      } catch (error: any) {
        console.error("Erreur lors du changement de photo:", error)
        // Revenir à l'ancienne image en cas d'erreur
        setProfilePic(getCorrectImageUrl(user.profile_picture))
        const errorMessage = error.response?.data?.detail ||
                            error.response?.data?.profile_picture?.[0] ||
                            "Erreur lors du changement de photo"
        toast.error(errorMessage)
      }
    }
  }

  return (
    <div className={`min-h-screen p-4 flex items-center justify-center ${theme === 'dark' ? 'bg-gray-950' : 'bg-gray-50'}`}>
      <Card className={`w-2xl rounded-xl shadow-xl overflow-hidden ${theme === 'dark' ? 'bg-gray-900 border-gray-800' : 'bg-white'}`}>

        <div className={`relative h-32 ${theme === 'dark' ? 'bg-blue-600' : 'bg-blue-500'}`}>
          <div className="absolute -bottom-16 left-6 md:left-8">
            <div className="relative">
              <Avatar className="w-28 h-28 border-4 border-white shadow-lg">
                <AvatarImage
                  src={profilePic}
                  alt={user.username}
                  className="object-cover"
                  onError={(e) => {
                    // Fallback en cas d'erreur
                    e.currentTarget.src = ""
                  }}
                />
                <AvatarFallback className="text-xl font-medium">
                  {user.first_name?.charAt(0)}{user.last_name?.charAt(0)}
                </AvatarFallback>
              </Avatar>

              <label className={`absolute bottom-1 right-1 p-2 rounded-full cursor-pointer shadow-md ${
                theme === 'dark' ? 'bg-gray-800 text-white hover:bg-gray-700' : 'bg-white text-gray-800 hover:bg-gray-100'
              }`}>
                <Camera size={16} />
                <input
                  type="file"
                  className="hidden"
                  accept="image/*"
                  onChange={handleImageChange}
                />
              </label>
            </div>
          </div>
        </div>

        <div className="pt-20 pb-8 px-6 space-y-6">
                    {/* Badge de rôle */}
                    {user.role && (
                        <div className="flex justify-end">
                            <span
                                className={`px-3 py-1 rounded-full text-xs font-medium ${
                                    theme === 'dark'
                                        ? 'bg-blue-900/30 text-blue-300'
                                        : 'bg-blue-100 text-blue-800'
                                }`}
                            >
                                {user.role}
                            </span>
                        </div>
                    )}

                    {/* Informations utilisateur */}
                    <div className="space-y-4">
                        {/* First Name */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-lg border">
                            <div className="flex items-center gap-3">
                                <User
                                    size={20}
                                    className={theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}
                                />
                                <div>
                                    <p
                                        className={`text-sm font-medium ${
                                            theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                                        }`}
                                    >
                                        Prénom
                                    </p>
                                    {editing === 'first_name' ? (
                                        <Input
                                            value={editedValue}
                                            onChange={e => setEditedValue(e.target.value)}
                                            className="mt-1 max-w-xs"
                                            autoFocus
                                        />
                                    ) : (
                                        <p
                                            className={
                                                theme === 'dark' ? 'text-white' : 'text-gray-900'
                                            }
                                        >
                                            {user.first_name || 'Non renseigné'}
                                        </p>
                                    )}
                                </div>
                            </div>

                            {editing === 'first_name' ? (
                                <div className="flex gap-2">
                                    <Button
                                        size="sm"
                                        onClick={() => handleSave('first_name')}
                                        disabled={isSaving}
                                        className={
                                            theme === 'dark'
                                                ? 'bg-blue-600 hover:bg-blue-700'
                                                : 'bg-black hover:bg-gray-800 text-white'
                                        }
                                    >
                                        <Save size={16} className="mr-1" />
                                        {isSaving ? '...' : 'Save'}
                                    </Button>
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={handleCancel}
                                        className={theme === 'dark' ? 'border-gray-700' : ''}
                                    >
                                        <X size={16} className="mr-1" />
                                        Cancel
                                    </Button>
                                </div>
                            ) : (
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => {
                                        setEditing('first_name')
                                        setEditedValue(user.first_name || '')
                                    }}
                                    className={
                                        theme === 'dark'
                                            ? 'text-gray-400 hover:text-white'
                                            : 'text-gray-500 hover:text-black'
                                    }
                                >
                                    <Pencil size={16} />
                                </Button>
                            )}
                        </div>

                        {/* Last Name */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-lg border">
                            <div className="flex items-center gap-3">
                                <User
                                    size={20}
                                    className={theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}
                                />
                                <div>
                                    <p
                                        className={`text-sm font-medium ${
                                            theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                                        }`}
                                    >
                                        Nom
                                    </p>
                                    {editing === 'last_name' ? (
                                        <Input
                                            value={editedValue}
                                            onChange={e => setEditedValue(e.target.value)}
                                            className="mt-1 max-w-xs"
                                        />
                                    ) : (
                                        <p
                                            className={
                                                theme === 'dark' ? 'text-white' : 'text-gray-900'
                                            }
                                        >
                                            {user.last_name || 'Non renseigné'}
                                        </p>
                                    )}
                                </div>
                            </div>

                            {editing === 'last_name' ? (
                                <div className="flex gap-2">
                                    <Button
                                        size="sm"
                                        onClick={() => handleSave('last_name')}
                                        disabled={isSaving}
                                        className={
                                            theme === 'dark'
                                                ? 'bg-blue-600 hover:bg-blue-700'
                                                : 'bg-black hover:bg-gray-800 text-white'
                                        }
                                    >
                                        <Save size={16} className="mr-1" />
                                        {isSaving ? '...' : 'Save'}
                                    </Button>
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={handleCancel}
                                        className={theme === 'dark' ? 'border-gray-700' : ''}
                                    >
                                        <X size={16} className="mr-1" />
                                        Cancel
                                    </Button>
                                </div>
                            ) : (
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => {
                                        setEditing('last_name')
                                        setEditedValue(user.last_name || '')
                                    }}
                                    className={
                                        theme === 'dark'
                                            ? 'text-gray-400 hover:text-white'
                                            : 'text-gray-500 hover:text-black'
                                    }
                                >
                                    <Pencil size={16} />
                                </Button>
                            )}
                        </div>

                        {/* Email */}
                        <div className="flex items-center justify-between gap-3 p-4 rounded-lg border">
                            <div className="flex items-center gap-3">
                                <Mail
                                    size={20}
                                    className={theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}
                                />
                                <div>
                                    <p
                                        className={`text-sm font-medium ${
                                            theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                                        }`}
                                    >
                                        Email
                                    </p>
                                    <p
                                        className={
                                            theme === 'dark' ? 'text-white' : 'text-gray-900'
                                        }
                                    >
                                        {user.email}
                                    </p>
                                </div>
                            </div>
                            <div className="w-9"></div> {/* Espaceur pour l'alignement */}
                        </div>

                        {/* Username */}
                        <div className="flex items-center justify-between gap-3 p-4 rounded-lg border">
                            <div className="flex items-center gap-3">
                                <AtSign
                                    size={20}
                                    className={theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}
                                />
                                <div>
                                    <p
                                        className={`text-sm font-medium ${
                                            theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                                        }`}
                                    >
                                        Nom d'utilisateur
                                    </p>
                                    <p
                                        className={
                                            theme === 'dark' ? 'text-white' : 'text-gray-900'
                                        }
                                    >
                                        @{user.username}
                                    </p>
                                </div>
                            </div>
                            <div className="w-9"></div> {/* Espaceur pour l'alignement */}
                        </div>
                    </div>
                </div>
      </Card>
    </div>
  )
}

