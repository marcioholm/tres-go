"use client"

import { useEffect, useState } from "react"
import { api } from "@/lib/api"
import {
    Table, TableBody, TableCell, TableHead,
    TableHeader, TableRow
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Search, Filter, Download, ExternalLink, Clock } from "lucide-react"

export default function InvoicesList() {
    const [invoices, setInvoices] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        loadInvoices()
    }, [])

    const loadInvoices = async () => {
        try {
            const { data } = await api.get('/super-admin/reports/financial')
            setInvoices(data.items || [])
        } catch (error) {
            console.error("Failed to load invoices", error)
        } finally {
            setLoading(false)
        }
    }

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value || 0)
    }

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'PAID':
                return <Badge className="bg-emerald-100 text-emerald-700 border-none font-bold">PAGO</Badge>
            case 'PENDING':
                return <Badge className="bg-amber-100 text-amber-700 border-none font-bold">PENDENTE</Badge>
            case 'OVERDUE':
                return <Badge className="bg-red-100 text-red-700 border-none font-bold">ATRASADO</Badge>
            default:
                return <Badge variant="outline">{status}</Badge>
        }
    }

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                <div>
                    <h2 className="text-2xl font-bold text-slate-900">Histórico de Faturas</h2>
                    <p className="text-sm text-slate-500 mt-1">Auditoria de pagamentos e status de cobranças Asaas.</p>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" className="rounded-xl border-slate-200 gap-2">
                        <Download className="h-4 w-4" />
                        Exportar CSV
                    </Button>
                </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                <Table>
                    <TableHeader className="bg-slate-50/50">
                        <TableRow>
                            <TableHead className="font-bold">Fatura / Cliente</TableHead>
                            <TableHead className="font-bold">Valor</TableHead>
                            <TableHead className="font-bold">Vencimento</TableHead>
                            <TableHead className="font-bold">Status</TableHead>
                            <TableHead className="text-right font-bold text-slate-400 uppercase text-[10px] tracking-widest">Ações</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={5} className="text-center py-20 text-slate-400">
                                    Carregando histórico financeiro...
                                </TableCell>
                            </TableRow>
                        ) : invoices.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} className="text-center py-20 text-slate-400">
                                    Nenhuma fatura encontrada.
                                </TableCell>
                            </TableRow>
                        ) : invoices.map((inv) => (
                            <TableRow key={inv.id} className="hover:bg-slate-50 transition-colors">
                                <TableCell>
                                    <div className="flex flex-col">
                                        <span className="font-bold text-slate-900 uppercase">#{inv.id.slice(-8)}</span>
                                        <span className="text-xs text-slate-500">{inv.workspace?.name || 'Workspace Removido'}</span>
                                    </div>
                                </TableCell>
                                <TableCell className="font-semibold text-slate-700">
                                    {formatCurrency(inv.amount)}
                                </TableCell>
                                <TableCell className="text-slate-500 text-sm">
                                    <div className="flex items-center gap-1.5">
                                        <Clock className="h-3.5 w-3.5 text-slate-300" />
                                        {new Date(inv.dueDate).toLocaleDateString('pt-BR')}
                                    </div>
                                </TableCell>
                                <TableCell>
                                    {getStatusBadge(inv.status)}
                                </TableCell>
                                <TableCell className="text-right">
                                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0 hover:bg-slate-100 rounded-lg">
                                        <ExternalLink className="h-4 w-4 text-slate-400" />
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
