"use client"

import { useEffect, useState } from "react"
import { api } from "@/lib/api"
import {
    Table, TableBody, TableCell, TableHead,
    TableHeader, TableRow
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import {
    ShieldCheck, ShieldAlert, UserPlus,
    Trash2, Search, User as UserIcon
} from "lucide-react"

export default function AdminsManagement() {
    const [admins, setAdmins] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [newAdminEmail, setNewAdminEmail] = useState("")
    const [searchResults, setSearchResults] = useState<any[]>([])
    const [searching, setSearching] = useState(false)

    useEffect(() => {
        loadAdmins()
    }, [])

    const loadAdmins = async () => {
        try {
            const { data } = await api.get('/super-admin/admins')
            setAdmins(data || [])
        } catch (error) {
            console.error("Failed to load admins", error)
        } finally {
            setLoading(false)
        }
    }

    const handleSearch = async (val: string) => {
        setNewAdminEmail(val)
        if (val.length < 3) {
            setSearchResults([])
            return
        }
        setSearching(true)
        try {
            const { data } = await api.get('/super-admin/users', { params: { search: val } })
            setSearchResults(data || [])
        } catch (error) {
            console.error("Search failed", error)
        } finally {
            setSearching(false)
        }
    }

    const promoteUser = async (user: any) => {
        try {
            await api.post(`/super-admin/admins/${user.id}`)
            setNewAdminEmail("")
            setSearchResults([])
            loadAdmins()
        } catch (error) {
            console.error("Promotion failed", error)
            alert("Erro ao promover usuário.")
        }
    }

    const revokeAdmin = async (id: string) => {
        if (!confirm("Tem certeza que deseja revogar os privilégios de Super Admin deste usuário?")) return
        try {
            await api.delete(`/super-admin/admins/${id}`)
            loadAdmins()
        } catch (error) {
            console.error("Revocation failed", error)
        }
    }

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                <div>
                    <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-3">
                        <ShieldCheck className="h-6 w-6 text-indigo-600" />
                        Corpo Administrativo
                    </h2>
                    <p className="text-sm text-slate-500 mt-1">Gerencie quem possui privilégios de Super Admin para operar este console.</p>
                </div>
                <div className="flex items-center gap-2 relative">
                    <div className="relative">
                        <Input
                            placeholder="Buscar por nome ou email..."
                            className="w-80 rounded-xl border-slate-200"
                            value={newAdminEmail}
                            onChange={(e) => handleSearch(e.target.value)}
                        />
                        {searchResults.length > 0 && (
                            <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-2xl border border-slate-100 z-50 overflow-hidden animate-in fade-in slide-in-from-top-2">
                                {searchResults.map(u => (
                                    <div
                                        key={u.id}
                                        onClick={() => promoteUser(u)}
                                        className="p-3 hover:bg-indigo-50 cursor-pointer flex items-center justify-between border-b border-slate-50 last:border-none group"
                                    >
                                        <div className="flex flex-col">
                                            <span className="text-sm font-bold text-slate-900 group-hover:text-indigo-600">{u.name}</span>
                                            <span className="text-xs text-slate-500">{u.email}</span>
                                        </div>
                                        {u.superAdmin ? (
                                            <Badge variant="ghost" className="text-indigo-400 text-[10px]">JÁ É ADMIN</Badge>
                                        ) : (
                                            <Button size="sm" variant="ghost" className="h-7 text-[10px] font-bold text-indigo-600 hover:bg-indigo-100">PROMOVER</Button>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                        {searching && (
                            <div className="absolute top-full left-0 right-0 mt-2 bg-white p-4 text-center text-xs text-slate-400 rounded-2xl shadow-lg">
                                Pesquisando base de usuários...
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                <Table>
                    <TableHeader className="bg-slate-50/50">
                        <TableRow>
                            <TableHead className="font-bold">Administrador</TableHead>
                            <TableHead className="font-bold">Nível de Acesso</TableHead>
                            <TableHead className="font-bold">Vínculo</TableHead>
                            <TableHead className="text-right font-bold text-slate-400 uppercase text-[10px] tracking-widest">Ações</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={4} className="text-center py-20 text-slate-400">
                                    Verificando permissões...
                                </TableCell>
                            </TableRow>
                        ) : admins.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={4} className="text-center py-20 text-slate-400">
                                    Nenhum administrador cadastrado.
                                </TableCell>
                            </TableRow>
                        ) : admins.map((admin) => (
                            <TableRow key={admin.id} className="hover:bg-slate-50 transition-colors">
                                <TableCell>
                                    <div className="flex items-center gap-3">
                                        <div className="h-10 w-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-500">
                                            <UserIcon className="h-5 w-5" />
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="font-bold text-slate-900">{admin.user?.name}</span>
                                            <span className="text-sm text-slate-500">{admin.user?.email}</span>
                                        </div>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <Badge className="bg-indigo-100 text-indigo-700 border-none font-black text-[10px] tracking-widest p-1 px-3">
                                        SUPER ADMIN
                                    </Badge>
                                </TableCell>
                                <TableCell className="text-slate-500 text-sm italic">
                                    Internal Team
                                </TableCell>
                                <TableCell className="text-right">
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-8 w-8 p-0 hover:bg-red-50 text-red-400 hover:text-red-500 rounded-lg"
                                        onClick={() => revokeAdmin(admin.id)}
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>

            <div className="bg-amber-50 border border-amber-100 rounded-2xl p-6 flex items-start gap-4">
                <div className="h-10 w-10 rounded-full bg-amber-100 flex items-center justify-center text-amber-600 flex-shrink-0">
                    <ShieldAlert className="h-5 w-5" />
                </div>
                <div>
                    <h4 className="font-bold text-amber-900">Atenção Crítica</h4>
                    <p className="text-sm text-amber-800 mt-1">
                        A revogação de privilégios é imediata. Um Super Admin possui controle total sobre Workspaces, Planos e Dados Financeiros.
                        Certifique-se da identidade do usuário antes de realizar promoções de nível de acesso.
                    </p>
                </div>
            </div>
        </div>
    )
}
