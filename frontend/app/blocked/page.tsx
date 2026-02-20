"use client"

import { useEffect, useState } from "react"
import { api } from "@/lib/api"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ShieldAlert, ExternalLink, RefreshCw, LogOut } from "lucide-react"

export default function BlockedWorkspacePage() {
    const router = useRouter()
    const [loading, setLoading] = useState(false)

    // Em um cenário completo, faríamos um endpopint para me() retornar também a última fatura pendente
    // Aqui, instruiremos o usuário a buscar a fatura por email ou entrar em contato com o suporte.

    const handleCheckStatus = async () => {
        setLoading(true)
        try {
            // Tenta acessar um endpoint protegido para ver se o bloqueio saiu
            await api.get('/workspaces/default')
            router.push('/workspaces/default') // Se der 200, ele foi desbloqueado
        } catch (e: any) {
            if (e.response?.status === 402) {
                alert("O workspace continua bloqueado. Por favor, regularize o pagamento.")
            } else {
                router.push('/workspaces/default')
            }
        } finally {
            setLoading(false)
        }
    }

    const handleLogout = () => {
        localStorage.removeItem("token")
        localStorage.removeItem("user")
        router.push("/login")
    }

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
            <div className="max-w-md w-full bg-white rounded-2xl shadow-xl overflow-hidden border border-red-100">
                <div className="bg-red-50 p-6 flex justify-center">
                    <div className="h-20 w-20 bg-red-100 rounded-full flex items-center justify-center">
                        <ShieldAlert className="h-10 w-10 text-red-600" />
                    </div>
                </div>

                <div className="p-8 text-center space-y-6">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Workspace Bloqueado</h1>
                        <p className="text-slate-500 mt-2 text-sm leading-relaxed">
                            O acesso ao sistema foi temporariamente interrompido devido a faturas em aberto.
                            Para restaurar os serviços (mensagens, bots, CRM), por favor regularize a pendência.
                        </p>
                    </div>

                    <div className="space-y-3 pt-4">
                        <Button
                            className="w-full bg-red-600 hover:bg-red-700 text-white"
                            onClick={() => alert("Consulte seu e-mail para acessar o link de pagamento do Asaas ou acesse o Portal do Cliente.")}
                        >
                            <ExternalLink className="mr-2 h-4 w-4" />
                            Visualizar Fatura Pendente
                        </Button>

                        <Button
                            variant="outline"
                            className="w-full text-slate-600"
                            onClick={handleCheckStatus}
                            disabled={loading}
                        >
                            {loading ? <RefreshCw className="mr-2 h-4 w-4 animate-spin" /> : <RefreshCw className="mr-2 h-4 w-4" />}
                            Já paguei, verificar acesso
                        </Button>
                    </div>
                </div>

                <div className="bg-slate-50 p-4 border-t border-slate-100 text-center">
                    <Button variant="ghost" size="sm" onClick={handleLogout} className="text-slate-500 hover:text-slate-700">
                        <LogOut className="mr-2 h-4 w-4" />
                        Sair do sistema
                    </Button>
                </div>
            </div>
        </div>
    )
}
