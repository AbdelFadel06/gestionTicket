import { useAuth } from "@/context/AuthContext"
import ProfileCard from "@/components/ProfileCard"
import { Navigate } from "react-router-dom"

export default function ProfilePage() {
  const { user } = useAuth()

  if (!user) {
    return <Navigate to="/login" />
  }

  return (
    <div className="flex justify-center items-center min-h-screen dark:bg-gray-950 bg-gray-100">
      <ProfileCard user={user} />
    </div>
  )
}
