"use client"

import React, { useState, useEffect } from "react"
import { Check, Rocket, Zap, Shield, Headphones, ArrowRight, Loader2, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { api } from "@/lib/api"
import { useRouter } from "next/navigation"

export default function WelcomePage({ params: paramsPromise }: { params: Promise<{ workspaceId: string }> }) {
    const params = React.use(paramsPromise)
    const router = useRouter()
    const [isLoading, setIsLoading] = useState(false)
    const [isAcknowledgeLoading, setIsAcknowledgeLoading] = useState(false)

    // Acknowledge welcome on mount
    useEffect(() => {
        const acknowledge = async () => {
            try {
                await api.patch(`/workspaces/${params.workspaceId}/users/me/acknowledge-welcome`)
            } catch (error) {
                console.error("Failed to acknowledge welcome", error)
            }
        }
        acknowledge()
    }, [params.workspaceId])

    const handlePurchase = async () => {
        setIsLoading(true)
        try {
            const res = await api.post(`/implementation/workspaces/${params.workspaceId}/order`)
            if (res.data.asaasPaymentUrl) {
                window.open(res.data.asaasPaymentUrl, '_blank')
                router.push(`/workspaces/${params.workspaceId}`)
            }
        } catch (error) {
            console.error("Failed to create implementation order", error)
        } finally {
            setIsLoading(false)
        }
    }

    const handleSkip = () => {
        router.push(`/workspaces/${params.workspaceId}`)
    }

    const features = [
        {
            icon: <Rocket className="h-6 w-6 text-blue-500" />,
            title: "Funis de Vendas",
            description: "Configuramos seus funis de acordo com o seu nicho de mercado."
        },
        {
            icon: <Shield className="h-6 w-6 text-purple-500" />,
            title: "Setores e Fluxos",
            description: "Estruturação completa de departamentos e filas de atendimento."
        },
        {
            icon: <Headphones className="h-6 w-6 text-green-500" />,
            title: "Treinamento VIP",
            description: "Uma call exclusiva para treinar sua equipe no uso da plataforma."
        }
    ]

    return (
        <div className="min-h-screen bg-black text-white selection:bg-blue-500/30">
            {/* Background Effects */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-[25%] -left-[10%] w-[70%] h-[70%] bg-blue-600/10 blur-[120px] rounded-full" />
                <div className="absolute -bottom-[25%] -right-[10%] w-[70%] h-[70%] bg-purple-600/10 blur-[120px] rounded-full" />
            </div>

            <main className="relative z-10 mx-auto max-w-5xl px-6 py-20 lg:py-32">
                <div className="mb-16 text-center">
                    <Badge variant="outline" className="mb-6 border-blue-500/30 bg-blue-500/10 px-4 py-1 text-blue-400">
                        <Sparkles className="mr-2 h-3 w-3" />
                        Oferta de Boas-vindas
                    </Badge>
                    <h1 className="mb-6 text-4xl font-extrabold tracking-tight lg:text-6xl">
                        Deixe o trabalho pesado <br />
                        <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                            com nossos especialistas
                        </span>
                    </h1>
                    <p className="mx-auto max-w-2xl text-lg text-zinc-400 lg:text-xl">
                        Já configuramos sua estrutura básica. Agora, que tal uma implementação profissional
                        para extrair o máximo do NorthWay Omni desde o primeiro dia?
                    </p>
                </div>

                <div className="grid gap-8 lg:grid-cols-3">
                    {features.map((feature, i) => (
                        <Card key={i} className="border-zinc-800 bg-zinc-900/40 p-8 backdrop-blur-md transition-all hover:border-zinc-700 hover:bg-zinc-900/60">
                            <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-2xl bg-zinc-800/50 shadow-inner">
                                {feature.icon}
                            </div>
                            <h3 className="mb-3 text-xl font-bold">{feature.title}</h3>
                            <p className="text-zinc-400 leading-relaxed text-sm">
                                {feature.description}
                            </p>
                        </Card>
                    ))}
                </div>

                <div className="mt-20 overflow-hidden rounded-3xl border border-zinc-800 bg-zinc-900/50 p-8 shadow-2xl backdrop-blur-xl lg:p-12">
                    <div className="flex flex-col items-center justify-between gap-8 lg:flex-row">
                        <div className="space-y-4 text-center lg:text-left">
                            <h2 className="text-3xl font-bold text-white">Implementação Premium</h2>
                            <div className="flex items-center justify-center gap-4 lg:justify-start">
                                <span className="text-4xl font-black text-white">R$ 497,00</span>
                                <Badge className="bg-green-500/20 text-green-400 hover:bg-green-500/30">Taxa Única</Badge>
                            </div>
                            <ul className="space-y-2">
                                {[
                                    "Configuração de até 5 funis",
                                    "Estruturação de Setores e Permissões",
                                    "Suporte VIP prioritário por 30 dias",
                                    "Treinamento ao vivo (Google Meet)"
                                ].map((item, i) => (
                                    <li key={i} className="flex items-center gap-2 text-zinc-400 text-sm">
                                        <Check className="h-4 w-4 text-green-500" />
                                        {item}
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <div className="flex w-full flex-col gap-4 lg:w-auto">
                            <Button
                                onClick={handlePurchase}
                                disabled={isLoading}
                                className="h-14 min-w-[280px] bg-white px-8 text-lg font-bold text-black transition-transform hover:scale-105 hover:bg-zinc-100"
                            >
                                {isLoading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Zap className="mr-2 h-5 w-5 fill-current" />}
                                Quero Implementação VIP
                            </Button>
                            <Button
                                variant="ghost"
                                onClick={handleSkip}
                                className="text-zinc-500 hover:text-white"
                            >
                                Talvez mais tarde <ArrowRight className="ml-2 h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                </div>

                <p className="mt-8 text-center text-sm text-zinc-500">
                    * Pagamento realizado com segurança via Asaas. Acesso imediato ao agendamento após confirmação.
                </p>
            </main>
        </div>
    )
}
