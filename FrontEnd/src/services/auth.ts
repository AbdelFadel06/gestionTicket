import api from './api'
import { type AxiosResponse } from 'axios'

// === Types ===
export interface LoginResponse {
  access: string
  refresh: string
}

export interface RegisterResponse {
  id: number
  username: string
  email: string
  first_name: string
  last_name: string
  profile_picture: string | null
  role?: string
}

export interface User {
  id: number
  username: string
  email: string
  first_name: string
  last_name: string
  profile_picture: string | null
  role?: string
}

// === Fonctions ===

// 👉 Login
export const loginUser = async (
  username: string,
  password: string
): Promise<LoginResponse> => {
  const res: AxiosResponse<LoginResponse> = await api.post('api/auth/login/', {
    username,
    password,
  })

  if (res.data.access) {
    localStorage.setItem('access', res.data.access)
    localStorage.setItem('refresh', res.data.refresh)
  }
  return res.data
}

// 👉 Register
export const registerUser = async (
  username: string,
  first_name: string,
  last_name: string,
  email: string,
  password: string,
  confirmation: string
): Promise<RegisterResponse> => {
  const res: AxiosResponse<RegisterResponse> = await api.post(
    'api/auth/register/',
    {
      username,
      first_name,
      last_name,
      email,
      password,
      confirmation,
    }
  )
  return res.data
}

// 👉 Logout
export const logoutUser = (): void => {
  localStorage.removeItem('access')
  localStorage.removeItem('refresh')
}

// 👉 Récupérer le user connecté
export const getCurrentUser = async (): Promise<User | null> => {
  try {
    const res: AxiosResponse<User> = await api.get('api/auth/me/')
    return res.data
  } catch (err) {
    console.error('Erreur récupération user :', err)
    return null
  }
}
