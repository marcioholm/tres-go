"use client"

import { useState } from "react"
import { useLanguage } from "@/lib/language-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Link from "next/link"
import { useRouter } from "next/navigation"

export default function RegisterPage() {
    const { t } = useLanguage()
    const router = useRouter()
    const [loading, setLoading] = useState(false)

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        // Simulate API call
        setTimeout(() => {
            setLoading(false)
            router.push('/login')
        }, 1500)
    }

    return (
        <div className="min-h-screen bg-[#F4F5F7] flex flex-col items-center justify-center p-4">
            <div className="mb-8 flex items-center gap-3">
                <div className="h-10 w-10 rounded bg-red-600 flex items-center justify-center shadow-lg shadow-red-200">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        <path d="M2 17L12 22L22 17" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        <path d="M2 12L12 17L22 12" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                </div>
                <span className="text-2xl font-bold text-slate-900 tracking-tight">NORTHWAY<span className="text-red-600">OMNI</span></span>
            </div>

            <div className="w-full max-w-md bg-white rounded-xl shadow-sm border border-slate-200 p-8 space-y-6">
                <div className="space-y-1 text-center">
                    <h1 className="text-xl font-bold text-slate-900">Crie sua conta</h1>
                    <p className="text-slate-500 text-sm">Comece seu teste gratuito de 7 dias.</p>
                </div>

                <form onSubmit={handleRegister} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="name">Nome Completo</Label>
                        <Input id="name" placeholder="Seu nome" required className="bg-slate-50 border-slate-200 focus:border-red-300 focus:ring-red-100" />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="workspace">Nome da Empresa</Label>
                        <Input id="workspace" placeholder="Sua empresa" required className="bg-slate-50 border-slate-200 focus:border-red-300 focus:ring-red-100" />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="email">Email Corporativo</Label>
                        <Input id="email" type="email" placeholder="nome@empresa.com" required className="bg-slate-50 border-slate-200 focus:border-red-300 focus:ring-red-100" />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="password">Senha</Label>
                        <Input id="password" type="password" placeholder="••••••••" required className="bg-slate-50 border-slate-200 focus:border-red-300 focus:ring-red-100" />
                    </div>

                    <Button type="submit" className="w-full bg-red-600 hover:bg-red-700 text-white font-bold h-11" disabled={loading}>
                        {loading ? "Criando conta..." : "CRIAR CONTA"}
                    </Button>
                </form>

                <div className="pt-2 text-center text-sm text-slate-500">
                    Já tem uma conta? <Link href="/login" className="text-red-600 font-bold hover:underline">Fazer login</Link>
                </div>
            </div>
        </div>
    )
}
