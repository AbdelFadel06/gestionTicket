import { Card } from "@/components/ui/card"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { Pencil, Camera } from "lucide-react"
import { useState } from "react"

interface User {
  id: number
  username: string
  email: string
  first_name?: string
  last_name?: string
  profile_picture?: string | null
  role?: string
  location?: string
}

export default function ProfileCard({ user }: { user: User }) {
  const [editing, setEditing] = useState<string | null>(null)
  const [profilePic, setProfilePic] = useState(user.profile_picture)

  // simulation pour changer la photo
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      const reader = new FileReader()
      reader.onloadend = () => {
        setProfilePic(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  return (
    <Card className="w-full max-w-4xl mx-auto rounded-2xl shadow-lg overflow-hidden">
      {/* Bandeau */}
      <div className="relative h-40 bg-black">
        {/* Avatar */}
        <div className="absolute -bottom-16 left-20">
          <div className="relative">
            <Avatar className="w-32 h-32 border-4 border-white shadow-md">
              <AvatarImage src={profilePic || "https://github.com/shadcn.png"} alt={user.username} />
              <AvatarFallback>
                {user.first_name?.charAt(0)}
                {user.last_name?.charAt(0)}
              </AvatarFallback>
            </Avatar>

            {/* Icône caméra pour changer photo */}
            <label className="absolute bottom-2 right-2 bg-gray-800 text-white p-2 rounded-full cursor-pointer hover:bg-gray-700">
              <Camera size={16} />
              <input type="file" className="hidden" accept="image/*" onChange={handleImageChange} />
            </label>
          </div>
        </div>
      </div>

      {/* Contenu */}
      <div className="pt-20 pb-8 px-6 space-y-4">
        {/* Firstname */}
        <div className="flex items-center justify-between">
          {editing === "first_name" ? (
            <Input
              defaultValue={user.first_name}
              className="max-w-md"
              onBlur={() => setEditing(null)}
              autoFocus
            />
          ) : (
            <p className="text-lg">
              <strong className="pr-2">First name:</strong> {user.first_name}
            </p>
          )}
          <Pencil
            size={18}
            className="text-gray-500 cursor-pointer hover:text-black"
            onClick={() => setEditing("first_name")}
          />
        </div>

        {/* Lastname */}
        <div className="flex items-center justify-between">
          {editing === "last_name" ? (
            <Input
              defaultValue={user.last_name}
              className="max-w-md"
              onBlur={() => setEditing(null)}
              autoFocus
            />
          ) : (
            <p className="text-lg">
              <strong className="pr-2">Last name:</strong> {user.last_name}
            </p>
          )}
          <Pencil
            size={18}
            className="text-gray-500 cursor-pointer hover:text-black"
            onClick={() => setEditing("last_name")}
          />
        </div>

        {/* Email */}
        <div className="flex items-center justify-between">
          <p className="text-lg">
            <strong className="pr-2">Email:</strong> {user.email}
          </p>
        </div>

        {/* Username */}
        <div className="flex items-center justify-between">
          <p className="text-lg text-gray-500">@{user.username}</p>
        </div>
      </div>
    </Card>
  )
}
