"use client"

import { useEffect, useState } from "react"
import { api } from "@/lib/api"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Loader2, Download, ExternalLink } from "lucide-react"

export default function SuperAdminFinancials() {
    const [invoices, setInvoices] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        loadInvoices()
    }, [])

    const loadInvoices = async () => {
        setLoading(true)
        try {
            const { data } = await api.get('/super-admin/reports/financial?limit=50')
            setInvoices(data.items || [])
        } catch (error) {
            console.error("Failed to load financials", error)
        } finally {
            setLoading(false)
        }
    }

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value || 0)
    }

    const translateStatus = (status: string) => {
        switch (status) {
            case 'PENDING': return { label: 'Pendente', color: 'bg-orange-100 text-orange-800' }
            case 'PAID': return { label: 'Pago', color: 'bg-emerald-100 text-emerald-800' }
            case 'OVERDUE': return { label: 'Atrasado', color: 'bg-red-100 text-red-800' }
            case 'CANCELED': return { label: 'Cancelado', color: 'bg-slate-100 text-slate-800' }
            default: return { label: status, color: 'bg-slate-100 text-slate-800' }
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight text-slate-900">Relatórios Financeiros</h2>
                    <p className="text-muted-foreground mt-1">Acompanhe as faturas geradas no Asaas e seu status atual.</p>
                </div>
                <Button variant="outline" className="text-slate-700">
                    <Download className="mr-2 h-4 w-4" />
                    Exportar CSV
                </Button>
            </div>

            <div className="border rounded-lg bg-white overflow-hidden shadow-sm">
                <Table>
                    <TableHeader className="bg-slate-50">
                        <TableRow>
                            <TableHead>Fatura (Asaas)</TableHead>
                            <TableHead>Workspace</TableHead>
                            <TableHead>Valor</TableHead>
                            <TableHead>Vencimento</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Ações</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={6} className="h-24 text-center">
                                    <Loader2 className="h-6 w-6 animate-spin mx-auto text-indigo-600" />
                                </TableCell>
                            </TableRow>
                        ) : invoices.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} className="h-24 text-center text-slate-500">
                                    Nenhuma fatura encontrada.
                                </TableCell>
                            </TableRow>
                        ) : (
                            invoices.map((inv) => (
                                <TableRow key={inv.id}>
                                    <TableCell className="font-medium text-slate-900">
                                        {inv.asaasPaymentId || "N/D"}
                                    </TableCell>
                                    <TableCell className="text-slate-600">
                                        {inv.subscription?.workspace?.name || "Desconhecido"}
                                    </TableCell>
                                    <TableCell className="font-semibold text-slate-800">
                                        {formatCurrency(inv.amount)}
                                    </TableCell>
                                    <TableCell className="text-slate-600">
                                        {new Date(inv.dueDate).toLocaleDateString('pt-BR')}
                                    </TableCell>
                                    <TableCell>
                                        <Badge className={`${translateStatus(inv.status).color} border-none`}>
                                            {translateStatus(inv.status).label}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        {inv.invoiceUrl && (
                                            <Button variant="ghost" size="sm" asChild>
                                                <a href={inv.invoiceUrl} target="_blank" rel="noopener noreferrer">
                                                    <ExternalLink className="h-4 w-4 text-slate-500 hover:text-indigo-600" />
                                                </a>
                                            </Button>
                                        )}
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    )
}
