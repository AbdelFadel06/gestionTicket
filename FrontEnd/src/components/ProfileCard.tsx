import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

interface ProfileCardProps {
  profile: {
    username: string
    first_name: string
    last_name: string
    email: string
    role?: string
    profile_picture?: string | null
  }
}

export default function ProfileCard({ profile }: ProfileCardProps) {
  return (
    <Card className="max-w-md mx-auto shadow-lg rounded-2xl p-6">
      <CardContent className="flex flex-col items-center space-y-4">
        {/* Avatar */}
        <Avatar className="w-24 h-24">
          <AvatarImage src={profile.profile_picture || undefined} alt={profile.username} />
          <AvatarFallback>
            {profile.first_name?.charAt(0)}
            {profile.last_name?.charAt(0)}
          </AvatarFallback>
        </Avatar>

        {/* Infos utilisateur */}
        <div className="text-center space-y-1">
          <h2 className="text-xl font-bold">{profile.username}</h2>
          <p className="text-gray-600">{profile.first_name} {profile.last_name}</p>
          <p className="text-gray-500">{profile.email}</p>
          <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm">
            {profile.role}
          </span>
        </div>
      </CardContent>
    </Card>
  )
}
