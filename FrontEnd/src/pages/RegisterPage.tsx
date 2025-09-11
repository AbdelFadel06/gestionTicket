import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import login3 from '../assets/login3.jpg'
import { AxiosError } from 'axios'

const RegisterPage = () => {
    const [username, setUsername] = useState('')
    const [firstName, setFirstName] = useState('')
    const [lastName, setLastName] = useState('')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [confirmation, setConfirmation] = useState('')
    const [role, setRole] = useState('user') // "user" ou "developer"
    const navigate = useNavigate()

    const handleRegister = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()

        if (password !== confirmation) {
            alert('Passwords do not match!')
            return
        }

        try {
            const url =
                role === 'developer'
                    ? 'http://127.0.0.1:8000/api/auth/register/developer/'
                    : 'http://127.0.0.1:8000/api/auth/register/'

            await axios.post(url, {
                username,
                first_name: firstName,
                last_name: lastName,
                email,
                password,
                confirmation,
            })

            alert('Account created successfully!')
            navigate('/')
        } catch (error) {
            if (error instanceof AxiosError) {
                console.error(error.response?.data || error.message)
            } else {
                console.error(error)
            }
            alert('Registration failed!')
        }
    }

    return (
        <div className="flex h-screen items-center bg-gray-50">
            <img className="w-[60%] h-screen" src={login3} alt="" />
            <div className="w-[40%] flex justify-center items-center">
                <form
                    className="w-[80%]  p-5 rounded-2xl h-[90%] overflow-y-auto"
                    onSubmit={handleRegister}
                >
                    <h1 className="text-3xl font-medium mb-2 text-blue-950">Create your account</h1>
                    <p className="text-sm mb-8 text-blue-950">Sign up to get started</p>

                    <div className="flex flex-col">
                        <input
                            type="text"
                            placeholder="Username"
                            className="px-5 py-2 mb-3 text-blue-950 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500"
                            value={username}
                            onChange={e => setUsername(e.target.value)}
                        />
                        <input
                            type="text"
                            placeholder="First Name"
                            className="px-5 py-2 mb-3 text-blue-950 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500"
                            value={firstName}
                            onChange={e => setFirstName(e.target.value)}
                        />
                        <input
                            type="text"
                            placeholder="Last Name"
                            className="px-5 py-2 mb-3 text-blue-950 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500"
                            value={lastName}
                            onChange={e => setLastName(e.target.value)}
                        />
                        <input
                            type="email"
                            placeholder="Email"
                            className="px-5 py-2 mb-3 text-blue-950 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500"
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                        />
                        <input
                            type="password"
                            placeholder="Password"
                            className="px-5 py-2 mb-3 text-blue-950 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500"
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                        />
                        <input
                            type="password"
                            placeholder="Confirm Password"
                            className="px-5 py-2 mb-3 text-blue-950 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500"
                            value={confirmation}
                            onChange={e => setConfirmation(e.target.value)}
                        />

                        <select
                            value={role}
                            onChange={e => setRole(e.target.value)}
                            className="px-5 py-2 mb-3 text-blue-950 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500"
                        >
                            <option value="user">Utilisateur</option>
                            <option value="developer">Développeur</option>
                        </select>
                    </div>

                    <button className="w-full bg-blue-600 py-2 mt-6 rounded text-white font-medium cursor-pointer">
                        Register
                    </button>
                    <p className="mt-4 text-sm text-gray-400">
                        Vous avez déjà un compte ?{' '}
                        <a href="/" className="text-blue-600 underline">
                            Login
                        </a>
                    </p>
                </form>
            </div>
        </div>
    )
}

export default RegisterPage
