"use client"

import React, { useState, useEffect } from "react"
import { useLanguage } from "@/lib/language-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, UserPlus, Shield, User, Mail, Trash2 } from "lucide-react"
import { api } from "@/lib/api"
import { useRouter, useParams } from "next/navigation"
import { Skeleton } from "@/components/ui/skeleton"

interface WorkspaceUser {
    id: string
    role: "ADMIN" | "AGENT" | "SUPER_ADMIN"
    user: {
        id: string
        name: string
        email: string
    }
}

export default function TeamPage() {
    const { t } = useLanguage()
    const router = useRouter()
    const params = useParams()
    const workspaceId = params?.workspaceId as string

    const [members, setMembers] = useState<WorkspaceUser[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        if (workspaceId) {
            api.get(`/workspaces/${workspaceId}/users`)
                .then(res => {
                    setMembers(res.data)
                })
                .catch(err => {
                    console.error("Erro ao carregar membros", err)
                })
                .finally(() => {
                    setLoading(false)
                })
        }
    }, [workspaceId])

    const getRoleBadge = (role: string) => {
        switch (role) {
            case "ADMIN":
                return <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100 border-amber-200"><Shield className="w-3 h-3 mr-1" /> Admin</Badge>
            case "SUPER_ADMIN":
                return <Badge className="bg-purple-100 text-purple-700 hover:bg-purple-100 border-purple-200"><Shield className="w-3 h-3 mr-1" /> Super Admin</Badge>
            default:
                return <Badge variant="secondary" className="bg-slate-100 text-slate-600 hover:bg-slate-100"><User className="w-3 h-3 mr-1" /> Agente</Badge>
        }
    }

    return (
        <div className="p-8 max-w-5xl mx-auto space-y-8 animate-in fade-in duration-500">
            <div>
                <Button variant="ghost" className="mb-4 pl-0 hover:pl-0 hover:bg-transparent text-slate-500 hover:text-slate-900" onClick={() => router.back()}>
                    <ArrowLeft className="mr-2 h-4 w-4" /> Voltar
                </Button>
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-800">Membros da Equipe</h1>
                        <p className="text-slate-500 mt-2">Gerencie os usuários e permissões deste workspace.</p>
                    </div>
                    <Button className="bg-red-600 hover:bg-red-700 font-bold gap-2">
                        <UserPlus className="h-4 w-4" /> CONVIDAR MEMBRO
                    </Button>
                </div>
            </div>

            <Card className="border-none shadow-sm overflow-hidden">
                <Table>
                    <TableHeader className="bg-slate-50">
                        <TableRow>
                            <TableHead className="w-[300px]">Usuário</TableHead>
                            <TableHead>Nível de Acesso</TableHead>
                            <TableHead>Email</TableHead>
                            <TableHead className="text-right">Ações</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                            [1, 2, 3].map(i => (
                                <TableRow key={i}>
                                    <TableCell><Skeleton className="h-10 w-[200px]" /></TableCell>
                                    <TableCell><Skeleton className="h-6 w-[100px]" /></TableCell>
                                    <TableCell><Skeleton className="h-6 w-[150px]" /></TableCell>
                                    <TableCell className="text-right"><Skeleton className="h-8 w-8 ml-auto" /></TableCell>
                                </TableRow>
                            ))
                        ) : members.length > 0 ? (
                            members.map((member) => (
                                <TableRow key={member.id} className="hover:bg-slate-50/50 transition-colors">
                                    <TableCell>
                                        <div className="flex items-center gap-3">
                                            <div className="h-9 w-9 rounded-full bg-red-100 text-red-600 flex items-center justify-center font-bold text-xs">
                                                {(member.user.name || "?").substring(0, 2).toUpperCase()}
                                            </div>
                                            <div>
                                                <p className="font-semibold text-slate-900">{member.user.name}</p>
                                                <p className="text-[10px] text-slate-400 uppercase font-bold tracking-tight">ID: {member.user.id.substring(0, 8)}</p>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        {getRoleBadge(member.role)}
                                    </TableCell>
                                    <TableCell className="text-slate-600">
                                        <div className="flex items-center gap-1.5">
                                            <Mail className="w-3.5 h-3.5 text-slate-400" />
                                            {member.user.email}
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <Button variant="ghost" size="icon" className="text-slate-400 hover:text-red-600 hover:bg-red-50">
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={4} className="h-32 text-center text-slate-500">
                                    Nenhum membro encontrado neste workspace.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </Card>

            <div className="bg-blue-50 border border-blue-100 rounded-xl p-6 flex gap-4">
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 shrink-0">
                    <Shield className="w-5 h-5" />
                </div>
                <div>
                    <h4 className="font-bold text-blue-900 text-sm">Sobre as Permissões</h4>
                    <p className="text-blue-800/70 text-xs mt-1 leading-relaxed">
                        <b>Admins</b> podem gerenciar canais, setores e performance. <b>Agentes</b> têm acesso apenas ao Inbox e CRM de contatos.
                        Alterações em permissões globais devem ser solicitadas ao Super Admin.
                    </p>
                </div>
            </div>
        </div>
    )
}
