"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { api } from "@/lib/api"
import { cn } from "@/lib/utils"

import { useRouter } from "next/navigation"

export function UserStatusMenu() {
    const router = useRouter()
    const [status, setStatus] = useState<"ONLINE" | "BUSY" | "OFFLINE">("ONLINE")
    const [user, setUser] = useState<any>(null)

    useEffect(() => {
        fetchProfile()
    }, [])

    const fetchProfile = async () => {
        try {
            const { data } = await api.get('/auth/profile')
            setUser(data)
            // Sincroniza com localStorage para que outros componentes (como sidebar) vejam as mudanças
            localStorage.setItem('user', JSON.stringify(data))
            // Dispara um evento para notificar que o usuário foi atualizado (reatividade entre layouts)
            window.dispatchEvent(new Event('userUpdated'))
            if (data.status) setStatus(data.status)
        } catch (error) {
            console.error("Failed to fetch profile", error)
        }
    }

    const handleStatusChange = async (newStatus: "ONLINE" | "BUSY" | "OFFLINE") => {
        setStatus(newStatus)
        try {
            await api.patch('/auth/profile/status', { status: newStatus })
        } catch (error) {
            console.error("Failed to update status", error)
        }
    }

    const getStatusColor = (s: string) => {
        switch (s) {
            case "ONLINE": return "bg-emerald-500"
            case "BUSY": return "bg-red-500"
            case "OFFLINE": return "bg-slate-400"
            default: return "bg-slate-400"
        }
    }

    const getStatusLabel = (s: string) => {
        switch (s) {
            case "ONLINE": return "Online"
            case "BUSY": return "Ocupado"
            case "OFFLINE": return "Offline"
            default: return "Offline"
        }
    }

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                    <Avatar className="h-10 w-10 border-2 border-slate-100">
                        <AvatarImage src="/avatars/me.png" alt="@usuario" />
                        <AvatarFallback>EU</AvatarFallback>
                    </Avatar>
                    <span className={cn("absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-white", getStatusColor(status))} />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none">{user?.name || "Usuário"}</p>
                        <p className="text-xs leading-none text-muted-foreground">
                            {user?.email || "usuario@exemplo.com"}
                        </p>
                    </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="cursor-pointer" onClick={() => window.location.href = `/profile`}>
                    Meu Perfil
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuLabel>Status</DropdownMenuLabel>
                <DropdownMenuItem onClick={() => handleStatusChange("ONLINE")}>
                    <span className="flex h-2 w-2 rounded-full bg-emerald-500 mr-2" />
                    Online
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleStatusChange("BUSY")}>
                    <span className="flex h-2 w-2 rounded-full bg-red-500 mr-2" />
                    Ocupado
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleStatusChange("OFFLINE")}>
                    <span className="flex h-2 w-2 rounded-full bg-slate-400 mr-2" />
                    Offline
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                    className="text-red-600 focus:text-red-600 cursor-pointer"
                    onClick={() => {
                        localStorage.removeItem('token');
                        localStorage.removeItem('user');
                        router.push('/login');
                    }}
                >
                    Sair
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}
