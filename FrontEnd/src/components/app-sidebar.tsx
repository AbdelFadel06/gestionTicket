'use client'

import * as React from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'



type MenuItem = {
  label: string
  path?: string
  children?: MenuItem[]
}

import {
    Sidebar,
    SidebarContent,
    // SidebarFooter,
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
            children: [
                {
                    label: 'Clients',
                    path: '/dashboard/clients', // liste → clic = tous les tickets du client
                },
            ],
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
                {
                    label: 'Clients',
                    path: '/dashboard/clients', // liste → clic = tous les tickets du client
                },
                {
                    label: 'Développeurs',
                    path: '/dashboard/devs', // liste → clic = tickets d’un dev
                },
            ],
        },
    ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
    const { user } = useAuth()

    // Sélection des menus selon le rôle
    let items: any[] = []
    if (user?.role === 'Admin') {
        items = sidebarConfig.admin
    } else if (user?.role === 'Developer') {
        items = sidebarConfig.developer
    } else {
        items = sidebarConfig.user
    }

    return (
        <Sidebar variant="inset" {...props}>
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <a href="#">
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
                            </a>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <div className="text-sm mx-4 my-10 text-gray-700 space-y-3 flex flex-col">
                    {items.map((item, idx) =>
                        item.children ? (
                            <div key={idx} className="space-y-2">
                                <p className="font-semibold text-gray-600">{item.label}</p>
                                <div className="ml-3 flex flex-col space-y-2">
                                    {item.children.map((sub: MenuItem, subIdx: number) => (
                                        <Link
                                            key={subIdx}
                                            className="text-gray-700 hover:bg-black hover:text-white px-3 py-1 rounded"
                                            to={sub.path ?? "#"}
                                        >
                                            {sub.label}
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        ) : (
                            <Link
                                key={idx}
                                className="text-gray-700 hover:bg-black hover:text-white px-4 py-2 rounded"
                                to={item.path}
                            >
                                {item.label}
                            </Link>
                        )
                    )}
                </div>
            </SidebarContent>
        </Sidebar>
    )
}
