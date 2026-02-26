"use client"

import React, { useState, useEffect } from "react"
import { useRouter, usePathname, useParams } from "next/navigation"
import { api } from "@/lib/api"
import { useLanguage } from "@/lib/language-context"
import { Button } from "@/components/ui/button"
import { GlobalSearch } from "@/components/layout/GlobalSearch"
import { UserStatusMenu } from "@/components/layout/UserStatusMenu"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger
} from "@/components/ui/dropdown-menu"
import {
    LayoutGrid,
    MessageSquare,
    Radio,
    Users,
    Settings,
    Menu,
    Globe,
    SquareKanban,
    Megaphone,
    AlertTriangle,
    CreditCard,
    ShieldCheck,
    BarChart3,
    Award
} from "lucide-react"
import Link from "next/link"
import { MessageNotificationProvider } from "@/components/layout/MessageNotificationProvider"

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const pathname = usePathname()
    const params = useParams()
    const router = useRouter()
    const workspaceId = params.workspaceId as string
    const [workspace, setWorkspace] = useState<any>(null)
    const [implementation, setImplementation] = useState<any>(null)

    useEffect(() => {
        if (workspaceId && workspaceId !== 'default' && workspaceId !== 'undefined') {
            api.get(`/workspaces/${workspaceId}`).then(res => {
                setWorkspace(res.data)
            }).catch(err => {
                console.error("Erro ao carregar workspace", err)
            })
        }
    }, [workspaceId])

    useEffect(() => {
        if (workspaceId && workspaceId !== 'default' && workspaceId !== 'undefined') {
            api.get(`/implementation/workspaces/${workspaceId}/order`).then(res => {
                setImplementation(res.data)
            }).catch(err => {
                // Ignore 404
            })
        }
    }, [workspaceId])

    useEffect(() => {
        if (workspaceId === 'default' || workspaceId === 'undefined') {
            const checkWorkspace = async () => {
                try {
                    // Try to get from local storage first (fastest)
                    const storedUser = localStorage.getItem('user');
                    if (storedUser && storedUser !== "undefined") {
                        try {
                            const user = JSON.parse(storedUser);
                            if (user.workspaces?.length > 0) {
                                const realId = user.workspaces[0].workspaceId;

                                // Super Admin redirection
                                if (user.isSuperAdmin) {
                                    router.replace('/super-admin');
                                    return;
                                }

                                const currentPath = window.location.pathname;
                                const newPath = currentPath.replace(`/workspaces/${workspaceId}`, `/workspaces/${realId}`);
                                router.replace(newPath);
                                return;
                            }
                        } catch (e) {
                            console.error("Error parsing user from storage", e);
                            localStorage.removeItem('user'); // Clear bad data
                        }
                    }

                    // Fallback to API
                    const { data: user } = await api.get('/auth/profile');
                    if (user.workspaces?.length > 0) {
                        // Super Admin redirection
                        if (user.isSuperAdmin) {
                            router.replace('/super-admin');
                            return;
                        }

                        const ws = user.workspaces[0];
                        const newPath = `/workspaces/${ws.workspaceId}/inbox`;

                        // Update storage
                        localStorage.setItem('user', JSON.stringify(user));

                        router.replace(newPath);
                    } else {
                        router.push('/login');
                    }
                } catch (e) {
                    console.error("Redirect failed", e);
                    // alert("Debug: Redirect failed in layout: " + e);
                    router.push('/login');
                }
            };
            checkWorkspace();
        }
    }, [workspaceId, router]);

    // List of all navigation routes
    const allRoutes = (workspaceId && workspaceId !== 'undefined') ? [
        { name: "Dashboard", id: "dashboard", href: `/workspaces/${workspaceId}`, icon: LayoutGrid },
        { name: "Inbox", id: "inbox", href: `/workspaces/${workspaceId}/inbox`, icon: MessageSquare },
        { name: "Campanhas", id: "campaigns", href: `/workspaces/${workspaceId}/campaigns`, icon: Megaphone },
        { name: "Kanban", id: "kanban", href: `/workspaces/${workspaceId}/kanban`, icon: SquareKanban },
        { name: "Integrations", id: "integrations", href: `/workspaces/${workspaceId}/integrations`, icon: Radio },
        { name: "Contacts", id: "contacts", href: `/workspaces/${workspaceId}/contacts`, icon: Users },
        { name: "Relatórios", id: "reports", href: `/workspaces/${workspaceId}/reports`, icon: BarChart3 },
        { name: "Performance", id: "performance", href: `/workspaces/${workspaceId}/reports/performance`, icon: Award },
        { name: "Settings", id: "settings", href: `/workspaces/${workspaceId}/settings`, icon: Settings },
    ] : []

    // Estado reativo do usuário para filtragem de rotas
    const [user, setUser] = useState<any>(null)

    const updateUserData = () => {
        const storedUser = localStorage.getItem('user')
        if (storedUser) {
            try {
                setUser(JSON.parse(storedUser))
            } catch (e) {
                setUser(null)
            }
        }
    }

    useEffect(() => {
        updateUserData()
        window.addEventListener('userUpdated', updateUserData)
        return () => window.removeEventListener('userUpdated', updateUserData)
    }, [])
    // Cálculo das rotas visíveis baseado no perfil
    const routes = allRoutes.filter(r => {
        // Se for Super Admin, esconde abas operacionais
        if (user?.isSuperAdmin) {
            return ['dashboard', 'settings'].includes(r.id)
        }
        return true
    })

    // Redirecionamento forçado para Super Admin (Prioridade Máxima)
    useEffect(() => {
        // Checagem imediata no mount
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            try {
                const parsed = JSON.parse(storedUser);
                if (parsed.isSuperAdmin) {
                    router.replace('/super-admin');
                }
            } catch (e) {
                // Ignore parse errors
            }
        }
    }, [router]);

    // Reatividade para mudanças em tempo real
    useEffect(() => {
        if (user?.isSuperAdmin) {
            router.replace('/super-admin');
        }
    }, [user, router]);

    return (
        <MessageNotificationProvider>
            <div className="flex min-h-screen flex-col md:flex-row">
                {/* Mobile Sidebar Trigger */}
                <Sheet>
                    <SheetTrigger asChild>
                        <Button variant="ghost" className="md:hidden p-4">
                            <Menu />
                        </Button>
                    </SheetTrigger>
                    <SheetContent side="left" className="w-64 p-0">
                        <Sidebar routes={routes} pathname={pathname} user={user} implementation={implementation} />
                    </SheetContent>
                </Sheet>

                {/* Desktop Sidebar */}
                <div className="hidden md:flex w-56 flex-col transition-all duration-300 ease-in-out border-r border-[#F0F0F0] bg-white text-[#6B6B6B]">
                    <Sidebar routes={routes} pathname={pathname} user={user} workspace={workspace} implementation={implementation} />
                </div>

                {/* Main Content */}
                <main className="flex-1 overflow-y-auto bg-[#FAFAFA] flex flex-col">
                    {/* Global Header */}
                    <header className="h-14 border-b border-[#F0F0F0] bg-white flex items-center justify-between px-6 sticky top-0 z-30">
                        <div className="flex-1 max-w-xl">
                            <GlobalSearch />
                        </div>
                        <div className="flex items-center gap-4">
                            <UserStatusMenu />
                        </div>
                    </header>

                    {workspace?.isBlocked && (
                        <div className="bg-red-600 text-white px-4 py-2 flex items-center justify-between shadow-md z-40">
                            <div className="flex items-center gap-2 text-sm font-medium">
                                <AlertTriangle className="h-4 w-4" />
                                <span>Sua conta está suspensa por falta de pagamento. Regularize para reativar todos os serviços.</span>
                            </div>
                            <Button
                                variant="outline"
                                size="sm"
                                className="bg-white/10 hover:bg-white/20 border-white/20 text-white h-8"
                                asChild
                            >
                                <Link href={`/workspaces/${workspaceId}/settings/billing`}>
                                    <CreditCard className="mr-2 h-3 w-3" />
                                    Ver Faturas
                                </Link>
                            </Button>
                        </div>
                    )}
                    <div className="flex-1">
                        {children}
                    </div>
                </main>
            </div>
        </MessageNotificationProvider>
    )
}

function Sidebar({ routes, pathname, user, workspace, implementation }: any) {
    const { t, setLanguage, language } = useLanguage()

    return (
        <div className="flex h-full flex-col bg-white">
            {/* Logo Section */}
            <div className="h-14 flex items-center px-6 mb-4">
                <img
                    src="/logo-northway.png"
                    alt="NorthWay Omni"
                    className="h-8 object-contain"
                />
            </div>

            {/* Navigation */}
            <ScrollArea className="flex-1 px-3">
                <nav className="space-y-0.5">
                    {routes.map((route: any, idx: number) => {
                        const isActive = pathname === route.href;
                        // Add separator before integrations (index 7 if order is Dashboard, Inbox, Contatos, Campanhas, Kanban, Relatórios, Performance)
                        const showSeparator = route.id === 'integrations';

                        return (
                            <React.Fragment key={route.href}>
                                {showSeparator && <div className="my-4 mx-4 border-t border-[#F0F0F0]" />}
                                <Link href={route.href} prefetch={true} className="block">
                                    <div
                                        className={cn(
                                            "group flex items-center gap-3 h-10 px-4 transition-all duration-150 relative",
                                            isActive
                                                ? "bg-[#F5F5F5] text-[#0F0F0F]"
                                                : "text-[#6B6B6B] hover:bg-[#FAFAFA] hover:text-[#0F0F0F]"
                                        )}
                                    >
                                        {isActive && <div className="absolute left-0 top-0 bottom-0 w-[2px] bg-[#E8202A]" />}
                                        <route.icon className={cn("h-4 w-4 stroke-[1.5px]", isActive ? "text-[#0F0F0F]" : "text-[#9CA3AF] group-hover:text-[#0F0F0F]")} />
                                        <span className="text-[13px] font-medium">{t(route.id)}</span>
                                        {route.id === 'inbox' && (
                                            <span className="ml-auto bg-[#E8202A] text-white text-[10px] px-1.5 py-0.5 rounded-full font-bold">3</span>
                                        )}
                                    </div>
                                </Link>
                            </React.Fragment>
                        );
                    })}
                </nav>
            </ScrollArea>

            {/* Footer */}
            <div className="p-4 border-t border-[#F0F0F0] space-y-3">
                {/* Plan Badge */}
                {workspace?.plan && (
                    <div className="px-3 py-2 bg-[#F5F5F5] rounded-lg">
                        <p className="text-[10px] text-[#6B6B6B] uppercase font-bold tracking-wider mb-1">PLANO ATUAL</p>
                        <div className="flex items-center justify-between">
                            <span className="text-[12px] font-semibold text-[#0F0F0F]">{workspace.plan.name}</span>
                            <Link href={`/workspaces/${workspace?.id}/settings/billing`} className="text-[10px] text-[#E8202A] font-bold hover:underline">UPGRADE</Link>
                        </div>
                    </div>
                )}

                {/* Implementation Status */}
                {implementation && implementation.status !== 'COMPLETED' && (
                    <div className="px-3 py-3 bg-blue-50 border border-blue-100 rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                            <div className="h-2 w-2 rounded-full bg-blue-500 animate-pulse" />
                            <span className="text-[10px] font-bold text-blue-600 uppercase tracking-tight">Status Implementação</span>
                        </div>
                        <p className="text-[12px] font-semibold text-blue-900 mb-1">
                            {implementation.status === 'PENDING_PAYMENT' && 'Aguardando Pagamento'}
                            {implementation.status === 'PAID' && 'Aguardando Agendamento'}
                            {implementation.status === 'SCHEDULED' && 'Agendado'}
                            {implementation.status === 'IN_PROGRESS' && 'Em Andamento'}
                        </p>
                        {implementation.status === 'PENDING_PAYMENT' && (
                            <Button size="sm" variant="outline" className="w-full h-7 text-[10px] border-blue-200 text-blue-600 font-bold" onClick={() => window.open(implementation.asaasPaymentUrl)}>
                                PAGAR AGORA
                            </Button>
                        )}
                        {implementation.status === 'PAID' && (
                            <p className="text-[10px] text-blue-600">Nossa equipe entrará em contato.</p>
                        )}
                    </div>
                )}

                {/* Agent Profile */}
                <div className="flex items-center gap-3 px-2">
                    <div className="relative">
                        <div className="h-8 w-8 rounded-full bg-[#F5F5F5] flex items-center justify-center text-[10px] font-bold text-[#0F0F0F] border border-[#F0F0F0]">
                            {user?.name?.substring(0, 2).toUpperCase() || "AG"}
                        </div>
                        <div className="absolute -right-0.5 -bottom-0.5 h-2.5 w-2.5 rounded-full border-2 border-white bg-[#16A34A]" />
                    </div>
                    <div className="flex flex-col min-w-0">
                        <span className="text-[13px] font-semibold text-[#0F0F0F] truncate">{user?.name || "Agente"}</span>
                        <span className="text-[11px] text-[#6B6B6B] truncate">{user?.email || "online"}</span>
                    </div>
                </div>

                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="w-full h-8 px-2 justify-between border-[#F0F0F0] hover:bg-[#FAFAFA]">
                            <div className="flex items-center gap-2">
                                <Globe className="h-3.5 w-3.5 text-[#9CA3AF]" />
                                <span className="uppercase text-[11px] text-[#6B6B6B] font-bold">{language}</span>
                            </div>
                            <span className="text-[10px] text-[#9CA3AF]">▼</span>
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48 bg-white border-[#F0F0F0] shadow-sm">
                        <DropdownMenuItem onClick={() => setLanguage('pt')} className="text-xs hover:bg-[#F5F5F5]">Português</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setLanguage('en')} className="text-xs hover:bg-[#F5F5F5]">English</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setLanguage('es')} className="text-xs hover:bg-[#F5F5F5]">Español</DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </div>
    )
}
