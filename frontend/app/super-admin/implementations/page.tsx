"use client"

import React, { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
    Calendar,
    CheckCircle2,
    Clock,
    User,
    MoreHorizontal,
    Check,
    AlertCircle,
    ArrowUpRight,
    Search
} from "lucide-react"
import { api } from "@/lib/api"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

export default function AdminImplementationsPage() {
    const [orders, setOrders] = useState<any[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [filter, setFilter] = useState("ALL")

    const fetchOrders = async () => {
        setIsLoading(true)
        try {
            const res = await api.get(`/implementation/admin?status=${filter === "ALL" ? "" : filter}`)
            setOrders(res.data)
        } catch (error) {
            console.error("Failed to fetch implementation orders", error)
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        fetchOrders()
    }, [filter])

    const handleSchedule = async (id: string) => {
        const date = prompt("Digite a data e hora do agendamento (YYYY-MM-DD HH:mm):")
        if (!date) return

        try {
            await api.patch(`/implementation/admin/${id}/schedule`, { scheduledAt: date })
            fetchOrders()
        } catch (error) {
            alert("Erro ao agendar")
        }
    }

    const handleComplete = async (id: string) => {
        const notes = prompt("Notas conclusivas (opcional):")
        try {
            await api.patch(`/implementation/admin/${id}/complete`, { notes })
            fetchOrders()
        } catch (error) {
            alert("Erro ao concluir")
        }
    }

    return (
        <div className="p-8 space-y-8 bg-[#FAFAFA] min-h-screen">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-zinc-950">Gestão de Implementações</h1>
                    <p className="text-zinc-500">Acompanhe e agende o setup dos novos clientes VIP.</p>
                </div>
                <div className="flex gap-2">
                    {["ALL", "PAID", "SCHEDULED", "IN_PROGRESS", "COMPLETED"].map((s) => (
                        <Button
                            key={s}
                            variant={filter === s ? "default" : "outline"}
                            size="sm"
                            onClick={() => setFilter(s)}
                            className="text-xs font-bold"
                        >
                            {s}
                        </Button>
                    ))}
                </div>
            </div>

            {isLoading ? (
                <div className="flex h-64 items-center justify-center">
                    <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent" />
                </div>
            ) : (
                <div className="grid gap-4">
                    {orders.length === 0 ? (
                        <Card className="p-12 text-center text-zinc-500">Nenhuma implementação encontrada.</Card>
                    ) : (
                        orders.map((order) => (
                            <Card key={order.id} className="p-6 transition-all hover:shadow-md">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className={cn(
                                            "h-12 w-12 rounded-full flex items-center justify-center",
                                            order.status === 'PAID' ? "bg-green-100 text-green-600" :
                                                order.status === 'SCHEDULED' ? "bg-blue-100 text-blue-600" : "bg-zinc-100 text-zinc-600"
                                        )}>
                                            <GearIcon className="h-6 w-6" />
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-zinc-950">{order.workspace?.name}</h3>
                                            <p className="text-sm text-zinc-500">
                                                ID: {order.id.substring(0, 8)}... | Valor: R$ {order.amount.toFixed(2)}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-6">
                                        <div className="text-right">
                                            <p className="text-[10px] text-zinc-400 font-bold uppercase">STATUS</p>
                                            <Badge className={cn(
                                                "mt-1",
                                                order.status === 'PAID' ? "bg-green-500" :
                                                    order.status === 'SCHEDULED' ? "bg-blue-500" : "bg-zinc-500"
                                            )}>
                                                {order.status}
                                            </Badge>
                                        </div>

                                        <div className="flex gap-2">
                                            {order.status === 'PAID' && (
                                                <Button size="sm" className="bg-blue-600 hover:bg-blue-700" onClick={() => handleSchedule(order.id)}>
                                                    Agendar Call
                                                </Button>
                                            )}
                                            {(order.status === 'SCHEDULED' || order.status === 'IN_PROGRESS') && (
                                                <Button size="sm" variant="outline" className="text-green-600 border-green-200 hover:bg-green-50" onClick={() => handleComplete(order.id)}>
                                                    Marcar Concluído
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </Card>
                        ))
                    )}
                </div>
            )}
        </div>
    )
}

function GearIcon(props: any) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.1a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
            <circle cx="12" cy="12" r="3" />
        </svg>
    )
}
