"use client"

import { useEffect, useState } from "react"
import { api } from "@/lib/api"
import {
    Table, TableBody, TableCell, TableHead,
    TableHeader, TableRow
} from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
    Search, Filter, MoreVertical,
    Ban, CheckCircle2, Trash2, ExternalLink
} from "lucide-react"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export default function WorkspacesManagement() {
    const [workspaces, setWorkspaces] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState("")

    useEffect(() => {
        loadWorkspaces()
    }, [])

    const loadWorkspaces = async () => {
        try {
            const { data } = await api.get('/super-admin/workspaces', { params: { search } })
            setWorkspaces(data.items || [])
        } catch (error) {
            console.error("Failed to load workspaces", error)
        } finally {
            setLoading(false)
        }
    }

    const toggleBlock = async (id: string, currentlyBlocked: boolean) => {
        try {
            if (currentlyBlocked) {
                await api.post(`/super-admin/workspaces/${id}/unblock`)
            } else {
                await api.post(`/super-admin/workspaces/${id}/block`, { reason: "Administrativo" })
            }
            loadWorkspaces()
        } catch (error) {
            console.error("Action failed", error)
        }
    }

    const deleteWorkspace = async (id: string) => {
        if (!confirm("Tem certeza que deseja deletar (soft-delete) este workspace?")) return
        try {
            await api.delete(`/super-admin/workspaces/${id}`)
            loadWorkspaces()
        } catch (error) {
            console.error("Delete failed", error)
        }
    }

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                <div>
                    <h2 className="text-2xl font-bold text-slate-900">Gestão de Workspaces</h2>
                    <p className="text-sm text-slate-500 mt-1">Gerencie acessos, planos e status de todos os clientes.</p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <Input
                            placeholder="Buscar workspace..."
                            className="pl-10 w-64 rounded-xl border-slate-200 focus:ring-indigo-500"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && loadWorkspaces()}
                        />
                    </div>
                    <Button variant="outline" className="rounded-xl border-slate-200 gap-2">
                        <Filter className="h-4 w-4" />
                        Filtros
                    </Button>
                </div>
            </div>

            <Card className="border-none shadow-sm bg-white overflow-hidden rounded-2xl">
                <Table>
                    <TableHeader className="bg-slate-50/50">
                        <TableRow>
                            <TableHead className="font-bold text-slate-700">Workspace</TableHead>
                            <TableHead className="font-bold text-slate-700">Plano</TableHead>
                            <TableHead className="font-bold text-slate-700">Status</TableHead>
                            <TableHead className="font-bold text-slate-700">Criado em</TableHead>
                            <TableHead className="text-right font-bold text-slate-700">Ações</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={5} className="text-center py-20 text-slate-400">
                                    Carregando workspaces...
                                </TableCell>
                            </TableRow>
                        ) : workspaces.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} className="text-center py-20 text-slate-400">
                                    Nenhum workspace encontrado.
                                </TableCell>
                            </TableRow>
                        ) : workspaces.map((w) => (
                            <TableRow key={w.id} className="hover:bg-slate-50 transition-colors group">
                                <TableCell>
                                    <div className="flex flex-col">
                                        <span className="font-bold text-slate-900">{w.name}</span>
                                        <span className="text-xs text-slate-400 font-mono tracking-tighter uppercase">{w.id.slice(-8)}</span>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <Badge variant="outline" className="bg-indigo-50 text-indigo-700 border-indigo-100 rounded-md">
                                        {w.subscription?.plan?.name || 'FREE / TRIAL'}
                                    </Badge>
                                </TableCell>
                                <TableCell>
                                    {w.isBlocked ? (
                                        <Badge className="bg-red-100 text-red-700 hover:bg-red-200 border-none font-bold">BLOQUEADO</Badge>
                                    ) : (
                                        <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-200 border-none font-bold">ATIVO</Badge>
                                    )}
                                </TableCell>
                                <TableCell className="text-slate-500 text-sm">
                                    {new Date(w.createdAt).toLocaleDateString('pt-BR')}
                                </TableCell>
                                <TableCell className="text-right">
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" className="h-8 w-8 p-0 hover:bg-slate-100 rounded-lg">
                                                <MoreVertical className="h-4 w-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end" className="w-48 rounded-xl p-1 shadow-lg border-slate-100">
                                            <DropdownMenuItem className="gap-2 focus:bg-slate-50 cursor-pointer p-2 rounded-lg">
                                                <ExternalLink className="h-4 w-4 text-slate-400" />
                                                <span>Ver Detalhes</span>
                                            </DropdownMenuItem>
                                            <DropdownMenuItem
                                                className="gap-2 focus:bg-slate-50 cursor-pointer p-2 rounded-lg"
                                                onClick={() => toggleBlock(w.id, w.isBlocked)}
                                            >
                                                {w.isBlocked ? (
                                                    <><CheckCircle2 className="h-4 w-4 text-emerald-500" /> <span>Desbloquear</span></>
                                                ) : (
                                                    <><Ban className="h-4 w-4 text-orange-500" /> <span>Bloquear</span></>
                                                )}
                                            </DropdownMenuItem>
                                            <DropdownMenuItem
                                                className="gap-2 focus:bg-red-50 text-red-600 cursor-pointer p-2 rounded-lg"
                                                onClick={() => deleteWorkspace(w.id)}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                                <span>Excluir</span>
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </Card>
        </div>
    )
}

function Card({ children, className }: any) {
    return <div className={`rounded-lg border bg-card text-card-foreground shadow-sm ${className}`}>{children}</div>
}
