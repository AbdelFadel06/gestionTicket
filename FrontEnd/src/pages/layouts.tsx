import { AppSidebar } from '@/components/app-sidebar'
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
} from '@/components/ui/breadcrumb'
import { Separator } from '@/components/ui/separator'
import { SidebarInset, SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar'
import { useEffect, useState } from 'react'
import { getCurrentUser, type User } from '../services/auth'
import { Toaster, } from 'react-hot-toast'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Outlet } from 'react-router-dom'

// import { useNavigate } from 'react-router-dom'


export default function Layout() {

    const [user, setUser] = useState<User | null>(null)

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const data = await getCurrentUser()
                setUser(data)
            } catch (err) {
                console.error('Erreur récupération utilisateur :', err)
            }
        }
        fetchUser()
    }, [])

    // const navigate = useNavigate()

    // const LogOut = async () => {
    //     try {
    //         localStorage.removeItem('access')
    //         localStorage.removeItem('refresh')
    //         toast.success('Déconnexion réussie ✅')
    //         navigate('/')
    //     } catch (error) {
    //         console.error(error)
    //         toast.error('Erreur lors de la déconnexion ❌')
    //     }
    // }

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
                        <Avatar className='size-10'>
                            <AvatarImage src="https://github.com/shadcn.png" alt="@shadcn" />
                            <AvatarFallback>CN</AvatarFallback>
                        </Avatar>
                        <div>
                            <h3 className="text-blue-950">{user?.username}</h3>
                            <p className="text-sm text-gray-400">{user?.email}</p>
                        </div>

                        {/* <button
                            className="items-center flex bg-red-300 hover:bg-red-500 p-3 rounded-2xl"
                            onClick={LogOut}
                        >
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                                strokeWidth="1.5"
                                stroke="currentColor"
                                className="size-6"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M8.25 9V5.25A2.25 2.25 0 0 1 10.5 3h6a2.25 2.25 0 0 1 2.25 2.25v13.5A2.25 2.25 0 0 1 16.5 21h-6a2.25 2.25 0 0 1-2.25-2.25V15m-3 0-3-3m0 0 3-3m-3 3H15"
                                />
                            </svg>
                        </button> */}
                    </div>
                </header>

                <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
                    {/* <div className="grid auto-rows-min gap-4 md:grid-cols-3">
                        <div className="bg-muted/50 aspect-video rounded-xl" >stat</div>
                        <div className="bg-red-400/50 aspect-video rounded-xl" >stat2</div>
                        <div className="bg-muted/50 aspect-video rounded-xl" >stat3</div>
                    </div>
                    <div className="bg-muted/50 min-h-[100vh] flex-1 rounded-xl md:min-h-min" >list</div> */}

                    <Outlet/>
                </div>
            </SidebarInset>
        </SidebarProvider>
    )
}
