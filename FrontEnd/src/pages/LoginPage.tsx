import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import login3 from '../assets/login3.jpg'
import { AxiosError } from 'axios'
import { useAuth } from '../context/AuthContext'

const LoginPage = () => {
    const [username, setUsername] = useState<string>('')
    const [password, setPassword] = useState<string>('')
    const navigate = useNavigate()
    const { setUser } = useAuth()

   const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    try {
        const res = await axios.post('http://127.0.0.1:8000/api/auth/login/', {
            username,
            password,
        })

        localStorage.setItem('access', res.data.access)
        localStorage.setItem('refresh', res.data.refresh)

        const userRes = await axios.get('http://127.0.0.1:8000/api/auth/me/', {
            headers: { Authorization: `Bearer ${res.data.access}` },
        })

        const userData = userRes.data
        localStorage.setItem('user', JSON.stringify(userData))
        setUser(userData) // met à jour le contexte

        // 🔹 Redirection dynamique selon rôle
        const role = userData.role?.toLowerCase()
        if (role === 'user') {
            navigate('/dashboard/tickets')
        } else if (role === 'developer' || role === 'admin') {
            navigate('/dashboard/tickets/assignes')
        } else {
            navigate('/dashboard') // fallback
        }

    } catch (error) {
        if (axios.isAxiosError(error)) {
            console.error(error.response?.data)
        } else {
            console.error(error)
        }
        alert('Login failed! Check your username and password.')
    }
}


    return (
        <div className="flex h-screen items-center bg-gray-50">
            <img className="w-[60%] h-screen" src={login3} alt="" />
            <div className="w-[40%] flex justify-center items-center">
                <form className="w-[80%] p-5 rounded-2xl h-[60%]" onSubmit={handleLogin}>
                    <h1 className="text-3xl font-medium mb-2 text-blue-950">
                        Welcome back on Help-Desk
                    </h1>
                    <p className="text-sm mb-8 text-blue-950">Sign in your account</p>

                    <div className="flex flex-col">
                        <input
                            type="text"
                            placeholder="Username"
                            className="px-5 py-2 mb-3 text-blue-950 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500"
                            value={username}
                            onChange={e => setUsername(e.target.value)}
                        />

                        <input
                            type="password"
                            placeholder="Password"
                            className="focus:ring-blue-500 px-5 py-2 border border-gray-300 rounded-md shadow-sm mb-3 text-blue-950"
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                        />
                    </div>

                    <button className="w-full bg-blue-600 py-2 mt-6 rounded text-white font-medium cursor-pointer">
                        Login
                    </button>
                    <p className="mt-4 text-sm text-gray-400">
                        Vous n'avez pas encore de compte ?{' '}
                        <a href="/register" className="text-blue-600 underline">
                            Sign in
                        </a>{' '}
                    </p>
                </form>
            </div>
        </div>
    )
}

export default LoginPage
