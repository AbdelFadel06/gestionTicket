import './App.css'
import Layout from './pages/layouts'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import Clients from './pages/Clients'
import Tickets from './pages/Tickets'
import Devs from './pages/Devs'


function App() {
    return (
        <AuthProvider>
            <BrowserRouter>
                <Routes>
                    <Route path="/" element={<LoginPage />} />
                    <Route path="/register" element={<RegisterPage />} />
                    {/* <Route path="/dashboard" element={<Layout />} /> */}

                    <Route path="/dashboard" element={<Layout />}>
                        <Route index element={<Tickets />} />
                        <Route path="clients" element={<Clients />} />
                        <Route path="devs" element={<Devs />} />
                    </Route>

                </Routes>
            </BrowserRouter>
        </AuthProvider>
    )
}

export default App
