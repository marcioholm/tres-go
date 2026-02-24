"use client"

import { useLanguage } from "@/lib/language-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { BarChart3 } from "lucide-react"

export default function SettingsPage({ params }: { params: { workspaceId: string } }) {
    const { t } = useLanguage()

    return (
        <div className="p-8 max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500">
            <div>
                <h1 className="text-3xl font-bold text-slate-800">Configurações</h1>
                <p className="text-slate-500 mt-2">Gerencie as preferências do seu workspace e configurações gerais.</p>
            </div>

            <Separator />

            <div className="grid gap-8">
                <Card>
                    <CardHeader>
                        <CardTitle>Perfil do Workspace</CardTitle>
                        <CardDescription>Atualize o nome e a identidade da sua empresa.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="ws-name">Nome do Workspace</Label>
                            <Input id="ws-name" defaultValue="NorthWay Marketing" />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="ws-slug">URL do Workspace</Label>
                            <div className="flex rounded-md shadow-sm">
                                <span className="flex items-center px-3 rounded-l-md border border-r-0 border-input bg-muted text-muted-foreground text-sm">
                                    northway.omni/
                                </span>
                                <Input id="ws-slug" defaultValue="marketing" className="rounded-l-none" />
                            </div>
                        </div>
                        <Button className="mt-4 bg-red-600 hover:bg-red-700 font-bold">Salvar Alterações</Button>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Membros da Equipe</CardTitle>
                        <CardDescription>Gerencie quem tem acesso a este workspace.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Button variant="outline">Gerenciar Equipe</Button>
                    </CardContent>
                </Card>

                <Card className="cursor-pointer hover:bg-slate-50 transition-colors" onClick={() => {
                    const wsId = params?.workspaceId;
                    if (wsId) window.location.href = `/workspaces/${wsId}/settings/sectors`;
                }}>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            Setores (Departamentos)
                        </CardTitle>
                        <CardDescription>Gerencie departamentos, regras de roteamento e membros.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Button variant="secondary" className="w-full">Gerenciar Setores</Button>
                    </CardContent>
                </Card>

                <Card className="cursor-pointer hover:bg-slate-50 transition-colors" onClick={() => {
                    const wsId = params?.workspaceId;
                    if (wsId) window.location.href = `/workspaces/${wsId}/settings/performance`;
                }}>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-indigo-600">
                            <BarChart3 className="h-5 w-5" />
                            Performance e Métricas
                        </CardTitle>
                        <CardDescription>Configure metas, regras de atribuição e KPIs da equipe.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Button variant="secondary" className="w-full">Configurar Performance</Button>
                    </CardContent>
                </Card>

                <Card className="cursor-pointer hover:bg-slate-50 transition-colors" onClick={() => {
                    const wsId = params?.workspaceId;
                    if (wsId) window.location.href = `/workspaces/${wsId}/settings/tags`;
                }}>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            Etiquetas (Tags)
                        </CardTitle>
                        <CardDescription>Crie e gerencie etiquetas para segmentar seus contatos.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Button variant="secondary" className="w-full">Gerenciar Tags</Button>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
// Fix types for params if needed, but for now standard Next.js component
interface SettingsPageProps {
    params: { workspaceId: string }
}
