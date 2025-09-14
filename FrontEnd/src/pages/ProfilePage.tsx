import { useAuth } from "@/context/AuthContext"
import ProfileCard from "@/components/ProfileCard"

export default function ProfilePage() {
  const { user } = useAuth() // récupère l'utilisateur connecté

  if (!user) {
    return <p className="text-center mt-10">Veuillez vous connecter pour voir votre profil.</p>
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6 text-center">Mon Profil</h1>
      <ProfileCard profile={user} />
    </div>
  )
}
