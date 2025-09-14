// context/AuthContext.tsx
import { createContext, useContext, useState, useEffect, type ReactNode } from 'react'
import { getCurrentUser } from '../services/auth'

interface User {
    id: number
    username: string
    email: string
    first_name: string
    last_name: string
    profile_picture: string | null
    role?: string
}

interface AuthContextType {
    user: User | null
    setUser: (user: User | null) => void
    logOut: () => void
}





const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<User | null>(null)

    // const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const data = await getCurrentUser()
                setUser(data)
            } catch {
                setUser(null)
            } finally {
                // setLoading(false)
            }
        }
        fetchUser()
    }, [])

    const logOut = () => {
        localStorage.removeItem('access')
        localStorage.removeItem('refresh')
        setUser(null)
    }

    return <AuthContext.Provider value={{ user, setUser, logOut }}>{children}</AuthContext.Provider>
}

export const useAuth = () => {
    const context = useContext(AuthContext)
    if (!context) {
        throw new Error('useAuth doit être utilisé dans un AuthProvider')
    }
    return context
}
