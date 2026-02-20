"use client"

import { useState } from "react"
import { useLanguage } from "@/lib/language-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { api } from "@/lib/api"
import { toast } from "sonner"

export default function LoginPage() {
    const { t } = useLanguage()
    const router = useRouter()
    const [loading, setLoading] = useState(false)

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        const email = (e.target as any).email.value;
        const password = (e.target as any).password.value;

        try {
            const { data } = await api.post('/auth/login', { email, password });

            if (data.access_token) {
                console.log("Login success, token received");
                localStorage.setItem('token', data.access_token);
                // Also store user info if needed for context
                if (data.user) {
                    console.log("User data received:", data.user);
                    localStorage.setItem('user', JSON.stringify(data.user));
                }

                let targetWorkspaceId = 'default';
                if (data.user && data.user.workspaces && data.user.workspaces.length > 0) {
                    // Pick the first workspace
                    targetWorkspaceId = data.user.workspaces[0].workspaceId;
                    console.log("Target workspace:", targetWorkspaceId);
                }

                toast.success("Login realizado com sucesso!");

                // Validate token storage
                if (!localStorage.getItem('token')) {
                    console.error("Token failed to save in localStorage");
                    toast.error("Erro: Token não salvo localmente.");
                    return;
                }

                // Prioritize Super Admin redirection
                console.log("IsSuperAdmin:", data.user?.isSuperAdmin);
                if (data.user?.isSuperAdmin) {
                    console.log("Redirecting to /super-admin");
                    router.push('/super-admin');
                    return;
                }

                console.log("Redirecting to workspace inbox");
                router.push(`/workspaces/${targetWorkspaceId}/inbox`);
            }
        } catch (error) {
            console.error("Login failed", error);
            toast.error("Falha no login. Verifique suas credenciais.");
            setLoading(false);
        }
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
                    <h1 className="text-xl font-bold text-slate-900">Bem-vindo de volta!</h1>
                    <p className="text-slate-500 text-sm">Insira suas credenciais para acessar a plataforma.</p>
                </div>

                <form onSubmit={handleLogin} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="email">Email Corporativo</Label>
                        <Input id="email" type="email" placeholder="nome@empresa.com" required className="bg-slate-50 border-slate-200 focus:border-red-300 focus:ring-red-100" />
                    </div>
                    <div className="space-y-2">
                        <div className="flex justify-between">
                            <Label htmlFor="password">Senha</Label>
                            <Link href="#" className="text-xs text-red-600 font-medium hover:underline">Esqueceu a senha?</Link>
                        </div>
                        <Input id="password" type="password" placeholder="••••••••" required className="bg-slate-50 border-slate-200 focus:border-red-300 focus:ring-red-100" />
                    </div>

                    <Button type="submit" className="w-full bg-red-600 hover:bg-red-700 text-white font-bold h-11" disabled={loading}>
                        {loading ? "Entrando..." : "ENTRAR NA PLATAFORMA"}
                    </Button>
                </form>

                <div className="pt-2 text-center text-sm text-slate-500">
                    Ainda não tem uma conta? <Link href="/register" className="text-red-600 font-bold hover:underline">Criar conta</Link>
                </div>
            </div>

            <p className="mt-8 text-xs text-slate-400">© 2024 NorthWay Omni. Todos os direitos reservados.</p>
        </div>
    )
}
