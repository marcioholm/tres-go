"use client"

import { useRouter, usePathname, useParams } from "next/navigation"
import { useEffect } from "react"
import { api } from "@/lib/api"
import { useLanguage } from "@/lib/language-context"
import { Button } from "@/components/ui/button"
import { GlobalSearch } from "@/components/layout/GlobalSearch"
import { UserStatusMenu } from "@/components/layout/UserStatusMenu"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { ScrollArea } from "@/components/ui/scroll-area"
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
import { useState } from "react"

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

    useEffect(() => {
        if (workspaceId && workspaceId !== 'default') {
            api.get(`/workspaces/${workspaceId}`).then(res => {
                setWorkspace(res.data)
            }).catch(err => {
                console.error("Erro ao carregar workspace", err)
            })
        }
    }, [workspaceId])

    useEffect(() => {
        if (workspaceId === 'default') {
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
                                const newPath = currentPath.replace('/workspaces/default', `/workspaces/${realId}`);
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
    const allRoutes = [
        { name: "Dashboard", id: "dashboard", href: `/workspaces/${workspaceId}`, icon: LayoutGrid },
        { name: "Inbox", id: "inbox", href: `/workspaces/${workspaceId}/inbox`, icon: MessageSquare },
        { name: "Campanhas", id: "campaigns", href: `/workspaces/${workspaceId}/campaigns`, icon: Megaphone },
        { name: "Kanban", id: "kanban", href: `/workspaces/${workspaceId}/kanban`, icon: SquareKanban },
        { name: "Integrations", id: "integrations", href: `/workspaces/${workspaceId}/integrations`, icon: Radio },
        { name: "Contacts", id: "contacts", href: `/workspaces/${workspaceId}/contacts`, icon: Users },
        { name: "Relatórios", id: "reports", href: `/workspaces/${workspaceId}/reports`, icon: BarChart3 },
        { name: "Performance", id: "performance", href: `/workspaces/${workspaceId}/reports/performance`, icon: Award },
        { name: "Settings", id: "settings", href: `/workspaces/${workspaceId}/settings`, icon: Settings },
    ]

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
        <div className="flex min-h-screen flex-col md:flex-row">
            {/* Mobile Sidebar Trigger */}
            <Sheet>
                <SheetTrigger asChild>
                    <Button variant="ghost" className="md:hidden p-4">
                        <Menu />
                    </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-64 p-0">
                    <Sidebar routes={routes} pathname={pathname} user={user} />
                </SheetContent>
            </Sheet>

            {/* Desktop Sidebar */}
            <div className="hidden md:flex w-72 flex-col transition-all duration-300 ease-in-out border-r border-[hsl(var(--sidebar-border))] bg-[hsl(var(--sidebar-background))] text-[hsl(var(--sidebar-foreground))]">
                <Sidebar routes={routes} pathname={pathname} user={user} />
            </div>

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto bg-slate-50 flex flex-col">
                {/* Global Header */}
                <header className="h-16 border-b bg-white flex items-center justify-between px-6 sticky top-0 z-30">
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
    )
}

function Sidebar({ routes, pathname, user }: any) {
    const { t, setLanguage, language } = useLanguage()

    return (
        <div className="flex h-full flex-col bg-white border-r">
            {/* Logo Section */}
            <div className="h-16 flex items-center px-6 border-b">
                <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded bg-red-600 flex items-center justify-center">
                        {/* Simple Logo Icon */}
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            <path d="M2 17L12 22L22 17" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            <path d="M2 12L12 17L22 12" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                    </div>
                    <span className="text-xl font-bold text-slate-800 tracking-tight">NORTHWAY<span className="text-red-600">OMNI</span></span>
                </div>
            </div>

            {/* Navigation */}
            <ScrollArea className="flex-1 py-6 px-3">
                <nav className="space-y-1">
                    {routes.map((route: any) => {
                        const isActive = pathname === route.href;
                        return (
                            <Button
                                asChild
                                variant="ghost"
                                className={`w-full justify-start gap-3 h-10 px-4 rounded-lg font-medium transition-colors ${isActive
                                    ? "bg-red-50 text-red-600"
                                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                                    }`}
                            >
                                <Link key={route.href} href={route.href}>
                                    <route.icon className={`h-5 w-5 ${isActive ? "text-red-600" : "text-slate-400"}`} />
                                    <span>{t(route.id)}</span>
                                </Link>
                            </Button>
                        );
                    })}
                </nav>
            </ScrollArea>

            {/* Language Switcher and User Status Footer */}
            <div className="p-4 border-t flex items-center justify-between gap-2">
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="outline" className="flex-1 justify-between">
                            <div className="flex items-center gap-2">
                                <Globe className="h-4 w-4 text-slate-500" />
                                <span className="uppercase text-slate-600">{language}</span>
                            </div>
                            <span className="text-xs text-muted-foreground">▼</span>
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => setLanguage('pt')}>Português</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setLanguage('en')}>English</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setLanguage('es')}>Español</DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </div>
    )
}
