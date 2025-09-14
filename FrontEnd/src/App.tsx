import './App.css'
import Layout from './pages/layouts'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import Clients from './pages/Clients'
import Tickets from './pages/Tickets'
import Devs from './pages/Devs'
import PrivateRoute from './routes/PrivateRoute'
import PublicRoute from './routes/PublicRoute'
import NewTicketForm from './components/NewTicketForm'
import ProfilePage from './pages/ProfilePage'

function App() {
    return (
        <AuthProvider>
            <BrowserRouter>
                <Routes>
                    {/* Routes publiques (accessible seulement si pas connecté) */}
                    <Route element={<PublicRoute />}>
                        <Route path="/" element={<LoginPage />} />
                        <Route path="/register" element={<RegisterPage />} />
                    </Route>

                    {/* Routes privées (protégées, accessibles uniquement si connecté) */}
                    <Route element={<PrivateRoute />}>
                        <Route path="/dashboard" element={<Layout />}>
                            <Route path="tickets/new" element={<NewTicketForm />} />
                            <Route path="tickets" element={<Tickets />} />
                            <Route path="tickets/:filter" element={<Tickets />} />
                            <Route path="clients" element={<Clients />} />
                            <Route path="devs" element={<Devs />} />
                            <Route path="profile" element={<ProfilePage/>} />
                        </Route>
                    </Route>
                </Routes>
            </BrowserRouter>
        </AuthProvider>
    )
}

export default App
