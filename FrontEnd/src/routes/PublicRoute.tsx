// routes/PublicRoute.tsx
import { Navigate, Outlet } from "react-router-dom"
import { useAuth } from "../context/AuthContext"

export default function PublicRoute() {
  const { user } = useAuth()

  if (!user) return <Outlet />

  // Redirection selon rôle
  const role = user.role?.toLowerCase()
  if (role === "user") return <Navigate to="/dashboard/tickets" replace />
  if (role === "developer" || role === "admin")
    return <Navigate to="/dashboard/tickets/assignes" replace />

  return <Navigate to="/dashboard" replace />
}
