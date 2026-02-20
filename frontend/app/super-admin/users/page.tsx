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
import { Search, User as UserIcon, ShieldGroup, ShieldCheck } from "lucide-react"

export default function UsersGlobalManagement() {
    const [users, setUsers] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState("")

    useEffect(() => {
        loadUsers()
    }, [])

    const loadUsers = async () => {
        try {
            const { data } = await api.get('/super-admin/users', { params: { search } })
            setUsers(data || [])
        } catch (error) {
            console.error("Failed to load users", error)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                <div>
                    <h2 className="text-2xl font-bold text-slate-900">Busca Global de Usuários</h2>
                    <p className="text-sm text-slate-500 mt-1">Identifique usuários e seus respectivos workspaces vinculados.</p>
                </div>
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input
                        placeholder="Email ou nome..."
                        className="pl-10 w-80 rounded-xl border-slate-200"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && loadUsers()}
                    />
                </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                <Table>
                    <TableHeader className="bg-slate-50/50">
                        <TableRow>
                            <TableHead className="font-bold">Usuário</TableHead>
                            <TableHead className="font-bold">Privilégios</TableHead>
                            <TableHead className="font-bold">Workspaces</TableHead>
                            <TableHead className="font-bold text-right text-slate-400 uppercase text-[10px] tracking-widest">Ações</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={4} className="text-center py-20 text-slate-400">
                                    Buscando base de usuários...
                                </TableCell>
                            </TableRow>
                        ) : users.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={4} className="text-center py-20 text-slate-400">
                                    Nenhum usuário encontrado.
                                </TableCell>
                            </TableRow>
                        ) : users.map((u) => (
                            <TableRow key={u.id} className="hover:bg-slate-50 transition-colors">
                                <TableCell>
                                    <div className="flex items-center gap-3">
                                        <div className="h-9 w-9 rounded-full bg-slate-100 flex items-center justify-center text-slate-500">
                                            <UserIcon className="h-4 w-4" />
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="font-bold text-slate-900">{u.name}</span>
                                            <span className="text-sm text-slate-500">{u.email}</span>
                                        </div>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    {u.superAdmin ? (
                                        <Badge className="bg-indigo-600 text-white border-none gap-1 py-1">
                                            <ShieldCheck className="h-3 w-3" />
                                            SUPER ADMIN
                                        </Badge>
                                    ) : (
                                        <Badge variant="outline" className="text-slate-400 border-slate-200">
                                            USUÁRIO
                                        </Badge>
                                    )}
                                </TableCell>
                                <TableCell>
                                    <div className="flex flex-wrap gap-1 max-w-[300px]">
                                        {u.workspaces?.length > 0 ? (
                                            u.workspaces.map((wu: any) => (
                                                <Badge key={wu.workspace.id} variant="outline" className="text-[10px] font-medium bg-slate-50">
                                                    {wu.workspace.name}
                                                </Badge>
                                            ))
                                        ) : (
                                            <span className="text-xs text-slate-300">Nenhum vínculo</span>
                                        )}
                                    </div>
                                </TableCell>
                                <TableCell className="text-right">
                                    <Button variant="ghost" size="sm" className="text-xs text-indigo-600 font-semibold hover:bg-indigo-50">
                                        GERENCIAR
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </div>
    )
}
