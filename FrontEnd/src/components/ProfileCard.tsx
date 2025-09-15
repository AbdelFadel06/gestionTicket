import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"

interface User {
  id: number
  username: string
  email: string
  first_name?: string
  last_name?: string
  profile_picture?: string | null
  role?: string
}

export default function ProfileCard({ user }: { user: User }) {
  return (
    <Card className="w-[400px] shadow-lg">
      <CardHeader className="flex flex-col items-center">
        <Avatar className="w-24 h-24 mb-2">
          <AvatarImage src={user.profile_picture || ""} alt={user.username} />

          <AvatarFallback>{user.first_name?.charAt(0)}
            {user.last_name?.charAt(0)}
          </AvatarFallback>
        </Avatar>
        <CardTitle>{user.first_name} {user.last_name}</CardTitle>
        <p className="text-gray-500">@{user.username}</p>
      </CardHeader>
      <CardContent className=" space-y-4">
        <p><strong className="underline pr-3">Email:</strong> {user.email}</p>
        {user.role && <p><strong className="underline pr-5">Role:</strong> {user.role}</p>}
      </CardContent>
    </Card>
  )
}
