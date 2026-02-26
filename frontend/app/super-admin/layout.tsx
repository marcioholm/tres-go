"use client"

import { usePathname, useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { api } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
    LayoutDashboard,
    Building2,
    CreditCard,
    ShieldAlert,
    Menu,
    LogOut,
    Activity,
    User,
    Settings as SettingsIcon,
    Users,
    DollarSign,
    FileText,
    Layers,
    ClipboardList,
    ShieldCheck,
    Rocket
} from "lucide-react"
import Link from "next/link"
import { UserStatusMenu } from "@/components/layout/UserStatusMenu"

export default function SuperAdminLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const pathname = usePathname()
    const router = useRouter()
    const [isAuthorized, setIsAuthorized] = useState(false)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const checkSuperAdmin = async () => {
            try {
                const storedUser = localStorage.getItem('user');
                if (!storedUser) {
                    router.push('/login');
                    return;
                }

                const user = JSON.parse(storedUser);

                // Se não for admin no localStorage, nem tenta a API, volta pro workspace
                if (!user.isSuperAdmin) {
                    router.push('/workspaces/default');
                    return;
                }

                // Se for admin, valida com o servidor
                await api.get('/super-admin/dashboard').catch((err) => {
                    console.error("Super Admin server validation failed", err);
                    throw new Error("unauthorized_on_server");
                });

                setIsAuthorized(true);
            } catch (e: any) {
                // Se o erro for do servidor sendo admin, ou erro de parse, vai pro login
                // Isso quebra o loop com o workspace layout
                console.error("Super Admin layout auth error:", e);
                router.push('/login');
            } finally {
                setLoading(false);
            }
        };
        checkSuperAdmin();
    }, [router]);

    const routes = [
        { name: "Dashboard", id: "dashboard", href: `/super-admin`, icon: LayoutDashboard },
        { name: "Workspaces", id: "workspaces", href: `/super-admin/workspaces`, icon: Building2 },
        { name: "Usuários", id: "users", href: `/super-admin/users`, icon: Users },
        { name: "Receita", id: "revenue", href: `/super-admin/revenue`, icon: DollarSign },
        { name: "Faturas", id: "invoices", href: `/super-admin/invoices`, icon: FileText },
        { name: "Planos", id: "plans", href: `/super-admin/plans`, icon: Layers },
        { name: "Audit Log", id: "audit", href: `/super-admin/audit`, icon: ClipboardList },
        { name: "Saúde", id: "health", href: `/super-admin/health`, icon: Activity },
        { name: "Admins", id: "admins", href: `/super-admin/admins`, icon: ShieldCheck },
        { name: "Implementações", id: "implementations", href: `/super-admin/implementations`, icon: Rocket },
    ]


    if (loading) {
        return <div className="flex items-center justify-center min-h-screen">Carregando painel administrativo...</div>;
    }

    if (!isAuthorized) {
        return null; // Será redirecionado
    }

    return (
        <div className="flex min-h-screen flex-col md:flex-row bg-slate-50">
            {/* Mobile Sidebar Trigger */}
            <Sheet>
                <SheetTrigger asChild>
                    <Button variant="ghost" className="md:hidden p-4 absolute top-2 left-2 z-50">
                        <Menu />
                    </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-64 p-0">
                    <Sidebar routes={routes} pathname={pathname} router={router} />
                </SheetContent>
            </Sheet>

            {/* Desktop Sidebar */}
            <div className="hidden md:flex w-72 flex-col transition-all duration-300 ease-in-out border-r border-slate-200 bg-slate-900 text-slate-100 shadow-xl">
                <Sidebar routes={routes} pathname={pathname} router={router} />
            </div>

            {/* Main Content */}
            <main className="flex-1 flex flex-col min-h-screen">
                {/* Header */}
                <header className="h-16 border-b border-slate-200 bg-white flex items-center justify-between px-8 sticky top-0 z-30 shadow-sm">
                    <div className="flex items-center gap-4">
                        <h1 className="text-lg font-semibold text-slate-800 hidden md:block">
                            {routes.find(r => pathname === r.href)?.name || "Painel Administrativo"}
                        </h1>
                    </div>
                    <div className="flex items-center gap-4">
                        <UserStatusMenu />
                    </div>
                </header>

                <div className="flex-1 overflow-y-auto px-4 py-8 md:px-8">
                    <div className="max-w-6xl mx-auto">
                        {children}
                    </div>
                </div>
            </main>
        </div>
    )
}

function Sidebar({ routes, pathname, router }: any) {
    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        router.push('/login');
    }

    return (
        <div className="flex h-full flex-col bg-slate-900 border-r border-slate-800">
            {/* Logo Section */}
            <div className="h-20 flex items-center px-6 border-b border-slate-800 bg-slate-950">
                <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
                        <ShieldAlert className="h-6 w-6 text-white" />
                    </div>
                    <div className="flex flex-col">
                        <span className="text-xl font-bold text-white tracking-tight leading-tight">NorthWay</span>
                        <span className="text-xs font-medium text-indigo-400">SUPER ADMIN</span>
                    </div>
                </div>
            </div>

            {/* Navigation */}
            <ScrollArea className="flex-1 py-6 px-4">
                <div className="text-xs font-semibold text-slate-500 tracking-wider mb-4 px-2">MENU PRINCIPAL</div>
                <nav className="space-y-1.5">
                    {routes.map((route: any) => {
                        const isActive = pathname === route.href || (pathname.startsWith(route.href) && route.href !== '/super-admin');
                        return (
                            <Link key={route.href} href={route.href}>
                                <Button
                                    variant="ghost"
                                    className={`w-full justify-start gap-3 h-11 px-4 rounded-xl font-medium transition-all ${isActive
                                        ? "bg-indigo-600 hover:bg-indigo-700 text-white shadow-md"
                                        : "text-slate-400 hover:bg-slate-800 hover:text-white"
                                        }`}
                                >
                                    <route.icon className={`h-5 w-5 ${isActive ? "text-white" : "text-slate-400"}`} />
                                    <span>{route.name}</span>
                                </Button>
                            </Link>
                        );
                    })}
                </nav>
            </ScrollArea>

            {/* Footer */}
            <div className="p-4 border-t border-slate-800 bg-slate-900">
                <Button
                    variant="ghost"
                    onClick={handleLogout}
                    className="w-full justify-start gap-3 text-slate-400 hover:text-red-400 hover:bg-red-400/10 transition-colors"
                >
                    <LogOut className="h-5 w-5" />
                    <span>Sair do Sistema</span>
                </Button>
            </div>
        </div>
    )
}
