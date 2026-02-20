"use client"

import { useEffect, useState } from "react"
import { api } from "@/lib/api"
import {
    Table, TableBody, TableCell, TableHead,
    TableHeader, TableRow
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
    ClipboardList, Info, Calendar,
    User, HardDrive
} from "lucide-react"

export default function AuditLog() {
    const [logs, setLogs] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        loadLogs()
    }, [])

    const loadLogs = async () => {
        try {
            const { data } = await api.get('/super-admin/audit-logs')
            setLogs(data || [])
        } catch (error) {
            console.error("Failed to load logs", error)
        } finally {
            setLoading(false)
        }
    }

    const getActionBadge = (action: string) => {
        const styleMap: any = {
            'CREATE': 'bg-emerald-50 text-emerald-700 border-emerald-100',
            'UPDATE': 'bg-amber-50 text-amber-700 border-amber-100',
            'DELETE': 'bg-red-50 text-red-700 border-red-100',
            'LOGIN': 'bg-indigo-50 text-indigo-700 border-indigo-100',
        }
        return (
            <Badge variant="outline" className={`font-bold ${styleMap[action] || 'bg-slate-50 text-slate-500 border-slate-200'}`}>
                {action}
            </Badge>
        )
    }

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                <div>
                    <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-3">
                        <ClipboardList className="h-6 w-6 text-indigo-600" />
                        Trilha de Auditoria
                    </h2>
                    <p className="text-sm text-slate-500 mt-1">Monitoramento de todas as ações administrativas e sistêmicas críticas.</p>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" className="rounded-xl border-slate-200 gap-2">
                        <Calendar className="h-4 w-4" />
                        Histórico Completo
                    </Button>
                </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                <Table>
                    <TableHeader className="bg-slate-50/50">
                        <TableRow>
                            <TableHead className="font-bold">Ação</TableHead>
                            <TableHead className="font-bold">Entidade / Detalhes</TableHead>
                            <TableHead className="font-bold">Executor</TableHead>
                            <TableHead className="font-bold">Data/Hora</TableHead>
                            <TableHead className="text-right font-bold text-slate-400">INFO</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={5} className="text-center py-20 text-slate-400">
                                    Recuperando logs de segurança...
                                </TableCell>
                            </TableRow>
                        ) : logs.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} className="text-center py-20 text-slate-400">
                                    Nenhum log registrado recentemente.
                                </TableCell>
                            </TableRow>
                        ) : logs.map((log) => (
                            <TableRow key={log.id} className="hover:bg-slate-50 transition-colors">
                                <TableCell>
                                    {getActionBadge(log.action)}
                                </TableCell>
                                <TableCell>
                                    <div className="flex flex-col">
                                        <div className="flex items-center gap-1.5 font-bold text-slate-900">
                                            <HardDrive className="h-3.5 w-3.5 text-slate-400" />
                                            {log.entityType}
                                        </div>
                                        <span className="text-xs text-slate-500 truncate max-w-[400px]">
                                            {JSON.stringify(log.metadata || {})}
                                        </span>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <div className="flex items-center gap-2">
                                        <div className="h-7 w-7 rounded-md bg-slate-100 flex items-center justify-center">
                                            <User className="h-3.5 w-3.5 text-slate-500" />
                                        </div>
                                        <span className="text-sm font-medium text-slate-700">{log.user?.email || 'Sistema'}</span>
                                    </div>
                                </TableCell>
                                <TableCell className="text-slate-500 text-sm">
                                    {new Date(log.createdAt).toLocaleString('pt-BR')}
                                </TableCell>
                                <TableCell className="text-right">
                                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0 rounded-lg">
                                        <Info className="h-4 w-4 text-slate-300" />
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
