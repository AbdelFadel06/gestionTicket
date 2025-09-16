'use client'

import * as React from 'react'
import { Link, NavLink } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { useLocation, useNavigate } from 'react-router-dom'
import { useTheme } from 'next-themes'

type MenuItem = {
    label: string
    path?: string
    children?: MenuItem[]
}

import {
    Sidebar,
    SidebarContent,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar'

// ✅ Config des menus par rôle
const sidebarConfig = {
    user: [
        {
            label: 'Tickets',
            children: [
                { label: 'Mes tickets', path: '/dashboard/tickets' },
                { label: 'Créer un ticket', path: '/dashboard/tickets/new' },
            ],
        },
    ],

    developer: [
        {
            label: 'Tickets',
            children: [
                { label: 'Mes tickets', path: '/dashboard/tickets/assignes' },
                { label: 'Tickets non assignés', path: '/dashboard/tickets/non-assignes' },
            ],
        },
        {
            label: 'Utilisateurs',
            children: [{ label: 'Clients', path: '/dashboard/clients' }],
        },
    ],

    admin: [
        {
            label: 'Tickets',
            children: [
                { label: 'Tickets déjà assignés', path: '/dashboard/tickets/assignes' },
                { label: 'Tickets non assignés', path: '/dashboard/tickets/non-assignes' },
            ],
        },
        {
            label: 'Utilisateurs',
            children: [
                { label: 'Clients', path: '/dashboard/clients' },
                { label: 'Développeurs', path: '/dashboard/devs' },
            ],
        },
    ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
    const { user } = useAuth()
    const location = useLocation()
    const navigate = useNavigate()
    const { theme } = useTheme()

    // Sélection des menus selon le rôle
    let items: any[] = []
    if (user?.role === 'Admin') {
        items = sidebarConfig.admin
    } else if (user?.role === 'Developer') {
        items = sidebarConfig.developer
    } else {
        items = sidebarConfig.user
    }

    // ✅ Définir le premier lien par défaut après connexion
    React.useEffect(() => {
        // Si on est exactement sur /dashboard, on redirige vers le 1er lien du rôle
        if (location.pathname === '/dashboard') {
            const firstItem = items[0]?.children?.[0] || items[0]
            if (firstItem?.path) {
                navigate(firstItem.path, { replace: true })
            }
        }
    }, [items, location.pathname, navigate])

    return (
        <Sidebar variant="inset" {...props} className={theme === 'dark' ? 'dark bg-gray-900 text-white' : 'bg-white text-gray-900'}>
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link to="/dashboard/tickets/assignes">
                                <div className="flex aspect-square size-16 items-center justify-center rounded-lg">
                                    <img
                                        src="/logo.png"
                                        alt="Help Desk Logo"
                                        className="w-full h-full"
                                    />
                                </div>
                                <div className="grid flex-1 text-left text-sm leading-tight">
                                    <span className="truncate font-medium">Help Desk</span>
                                    <span className="truncate text-xs">Company</span>
                                </div>
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <div className={`text-sm mx-4 my-10 space-y-3 flex flex-col ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    {items.map((item, idx) =>
                        item.children ? (
                            <div key={idx} className="space-y-2">
                                <p className={`font-semibold ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{item.label}</p>
                                <div className="ml-3 flex flex-col space-y-2">
                                    {item.children.map((sub: MenuItem, subIdx: number) => (
                                        <NavLink
                                            key={subIdx}
                                            to={sub.path ?? '#'}
                                            end
                                            className={({ isActive }) =>
                                                `px-3 py-1 rounded transition-colors ${
                                                    isActive
                                                        ? theme === 'dark'
                                                            ? 'bg-blue-600 text-white'
                                                            : 'bg-black text-white'
                                                        : theme === 'dark'
                                                        ? 'text-gray-300 hover:bg-gray-700 hover:text-white'
                                                        : 'text-gray-700 hover:bg-gray-200 hover:text-gray-800'
                                                }`
                                            }
                                        >
                                            {sub.label}
                                        </NavLink>
                                    ))}
                                </div>
                            </div>
                        ) : (
                            <NavLink
                                key={idx}
                                to={item.path ?? '#'}
                                end
                                className={({ isActive }) =>
                                    `px-4 py-2 rounded transition-colors ${
                                        isActive
                                            ? theme === 'dark'
                                                ? 'bg-blue-600 text-white'
                                                : 'bg-black text-white'
                                            : theme === 'dark'
                                            ? 'text-gray-300 hover:bg-gray-700 hover:text-white'
                                            : 'text-gray-700 hover:bg-gray-200 hover:text-gray-800'
                                    }`
                                }
                            >
                                {item.label}
                            </NavLink>
                        )
                    )}
                </div>
            </SidebarContent>
        </Sidebar>
    )
}
