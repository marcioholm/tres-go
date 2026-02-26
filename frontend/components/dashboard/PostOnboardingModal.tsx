"use client"

import React from "react"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { CheckCircle2, Rocket, Zap, ShieldCheck, Headphones } from "lucide-react"
import { useRouter } from "next/navigation"

interface PostOnboardingModalProps {
    isOpen: boolean
    onClose: () => void
    workspaceId: string
}

export function PostOnboardingModal({ isOpen, onClose, workspaceId }: PostOnboardingModalProps) {
    const router = useRouter()

    const handleGoToWelcome = () => {
        onClose()
        router.push(`/workspaces/${workspaceId}/welcome`)
    }

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-2xl border-none bg-zinc-950 text-white shadow-2xl">
                <div className="absolute inset-0 -z-10 bg-gradient-to-br from-blue-600/10 via-transparent to-purple-600/10 opacity-50" />

                <DialogHeader className="pt-6">
                    <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blue-600/20 text-blue-500 shadow-[0_0_20px_rgba(37,99,235,0.3)]">
                        <CheckCircle2 className="h-10 w-10" />
                    </div>
                    <DialogTitle className="text-center text-3xl font-bold tracking-tight text-white">
                        Configuração Inicial Concluída!
                    </DialogTitle>
                    <DialogDescription className="text-center text-lg text-zinc-400">
                        Seu workspace está pronto para as primeiras conversas.
                    </DialogDescription>
                </DialogHeader>

                <div className="grid grid-cols-1 gap-4 py-8 md:grid-cols-2">
                    <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4 transition-all hover:border-blue-500/50 hover:bg-zinc-900">
                        <div className="mb-2 flex items-center gap-2 text-blue-400">
                            <Rocket className="h-5 w-5" />
                            <span className="font-semibold">Primeiros Passos</span>
                        </div>
                        <p className="text-sm text-zinc-500">
                            Você já pode conectar seu WhatsApp e começar a gerenciar seus leads.
                        </p>
                    </div>
                    <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4 transition-all hover:border-purple-500/50 hover:bg-zinc-900">
                        <div className="mb-2 flex items-center gap-2 text-purple-400">
                            <ShieldCheck className="h-5 w-5" />
                            <span className="font-semibold">Segurança Total</span>
                        </div>
                        <p className="text-sm text-zinc-500">
                            Todos os seus dados estão protegidos com criptografia de ponta a ponta.
                        </p>
                    </div>
                </div>

                <div className="rounded-2xl bg-gradient-to-r from-blue-600/10 to-purple-600/10 p-6 text-center shadow-inner">
                    <h4 className="mb-2 flex items-center justify-center gap-2 font-bold text-white">
                        <Zap className="h-5 w-5 text-yellow-500" />
                        Acelere seu Resultado
                    </h4>
                    <p className="mb-4 text-sm text-zinc-300">
                        Quer que nossos especialistas configurem seus funis e setores profissionalmente?
                    </p>
                    <Button
                        onClick={handleGoToWelcome}
                        className="w-full bg-white text-black hover:bg-zinc-200"
                    >
                        Conhecer Implementação NorthWay
                    </Button>
                </div>

                <DialogFooter className="sm:justify-center">
                    <Button variant="link" onClick={onClose} className="text-zinc-500 hover:text-white">
                        Explorar por conta própria
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
