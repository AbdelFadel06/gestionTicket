import { AppSidebar } from '@/components/app-sidebar'
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
} from '@/components/ui/breadcrumb'
import { Separator } from '@/components/ui/separator'
import { SidebarInset, SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar'

import { Toaster, toast } from 'react-hot-toast'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { ModeToggle } from '@/components/mode-toggle'
import { getCorrectImageUrl } from '@/utils/image'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

export default function Layout() {
    const { user, logOut } = useAuth()
    const navigate = useNavigate()

    const handleLogout = () => {
        logOut()
        toast.success('Déconnexion réussie ✅')
        navigate('/')
    }
    return (
        <SidebarProvider>
            <AppSidebar />
            <SidebarInset>
                <header className="flex h-16 shrink-0 items-center gap-2">
                    <div className="flex items-center gap-2 px-4">
                        <SidebarTrigger className="-ml-1" />
                        <Separator
                            orientation="vertical"
                            className="mr-2 data-[orientation=vertical]:h-4"
                        />
                        <Breadcrumb>
                            <BreadcrumbList>
                                <BreadcrumbItem className="hidden md:block">
                                    <Toaster />
                                    <BreadcrumbLink href="#">
                                        {user ? `Welcome Dear ${user.role}` : 'Loading...'}
                                    </BreadcrumbLink>
                                </BreadcrumbItem>
                            </BreadcrumbList>
                        </Breadcrumb>
                    </div>

                    <div className="flex justify-end space-x-5 right-10 absolute items-center">
                        <ModeToggle /> {/* bouton pour changer le thème */}
                        {/* Dropdown déclenché par l'avatar + infos */}
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <div className="flex items-center space-x-3 cursor-pointer">
                                    <Avatar className="size-10">
                                        <AvatarImage
                                            src={getCorrectImageUrl(user?.profile_picture)}
                                            alt={user?.first_name || 'user'}
                                            onError={e => {
                                                e.currentTarget.src =
                                                    'https://github.com/shadcn.png'
                                            }}
                                        />
                                        <AvatarFallback>
                                            {user?.first_name?.charAt(0)}
                                            {user?.last_name?.charAt(0)}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="hidden sm:block text-left">
                                        <h3 className="text-blue-950 dark:text-white">
                                            {user?.username}
                                        </h3>
                                        <p className="text-sm text-gray-400">{user?.email}</p>
                                    </div>
                                </div>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className="w-48" align="end">
                                <DropdownMenuLabel>Mon compte</DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={() => navigate('/dashboard/profile')}>
                                    Profil
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={handleLogout}>
                                    Déconnexion
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </header>

                <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
                    <Outlet />
                </div>
            </SidebarInset>
        </SidebarProvider>
    )
}
