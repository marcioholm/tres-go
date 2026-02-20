"use client"

import React, { useState, useEffect } from "react"
import { useLanguage } from "@/lib/language-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Plus, Trash2, ArrowLeft, Save, Edit2, Users, Briefcase, Star } from "lucide-react"
import { api } from "@/lib/api"
import { useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
// import { UserSelect } from "@/components/user-select" // Helper to select users (to be implemented/verified)

interface Sector {
    id: string
    name: string
    description?: string
    color: string
    isDefault: boolean
    isActive: boolean
    _count?: {
        members: number
        conversations: number
    }
}

const COLORS = [
    "#ef4444", "#f97316", "#eab308", "#22c55e", "#06b6d4",
    "#3b82f6", "#8b5cf6", "#ec4899", "#64748b"
]

export default function SectorsPage({ params: paramsPromise }: { params: Promise<{ workspaceId: string }> }) {
    const params = React.use(paramsPromise)
    const { t } = useLanguage()
    const router = useRouter()
    const [sectors, setSectors] = useState<Sector[]>([])
    const [loading, setLoading] = useState(true)
    const [isCreating, setIsCreating] = useState(false)
    const [editingId, setEditingId] = useState<string | null>(null)

    // Form state
    const [name, setName] = useState("")
    const [description, setDescription] = useState("")
    const [color, setColor] = useState(COLORS[5])
    const [isDefault, setIsDefault] = useState(false)

    const fetchSectors = async () => {
        try {
            const { data } = await api.get(`/workspaces/${params.workspaceId}/sectors`)
            setSectors(data)
        } catch (error) {
            console.error("Failed to fetch sectors", error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchSectors()
    }, [])

    const handleCreate = async () => {
        try {
            await api.post(`/workspaces/${params.workspaceId}/sectors`, {
                name, description, color, isDefault
            })
            fetchSectors()
            resetForm()
        } catch (error) {
            console.error("Failed to create sector", error)
        }
    }

    const handleUpdate = async () => {
        if (!editingId) return
        try {
            await api.patch(`/workspaces/${params.workspaceId}/sectors/${editingId}`, {
                name, description, color, isDefault
            })
            fetchSectors()
            resetForm()
        } catch (error) {
            console.error("Failed to update sector", error)
        }
    }

    const handleDelete = async (id: string) => {
        if (!confirm("Tem certeza? Isso pode afetar conversas e membros associados.")) return
        try {
            await api.delete(`/workspaces/${params.workspaceId}/sectors/${id}`)
            fetchSectors()
        } catch (error) {
            console.error("Failed to delete sector", error)
            alert("Não foi possível excluir. Verifique se existem conversas abertas neste setor.")
        }
    }

    const startEdit = (sector: Sector) => {
        setEditingId(sector.id)
        setName(sector.name)
        setDescription(sector.description || "")
        setColor(sector.color || COLORS[5])
        setIsDefault(sector.isDefault)
        setIsCreating(false)
    }

    const resetForm = () => {
        setName("")
        setDescription("")
        setColor(COLORS[5])
        setIsDefault(false)
        setEditingId(null)
        setIsCreating(false)
    }

    return (
        <div className="p-8 max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500">
            <div>
                <Button variant="ghost" className="mb-4 pl-0 hover:pl-0 hover:bg-transparent text-slate-500 hover:text-slate-900" onClick={() => router.back()}>
                    <ArrowLeft className="mr-2 h-4 w-4" /> Voltar
                </Button>
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-800">Gerenciar Setores</h1>
                        <p className="text-slate-500 mt-2">Organize sua equipe em departamentos (ex: Vendas, Suporte).</p>
                    </div>
                    <Button onClick={() => { setIsCreating(true); setEditingId(null); setName(""); }} disabled={isCreating || !!editingId}>
                        <Plus className="mr-2 h-4 w-4" /> Novo Setor
                    </Button>
                </div>
            </div>

            <Separator />

            {/* Create/Edit Form */}
            {(isCreating || editingId) && (
                <Card className="border-2 border-primary/20 bg-primary/5">
                    <CardHeader>
                        <CardTitle>{isCreating ? "Novo Setor" : "Editar Setor"}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid gap-4 md:grid-cols-2">
                            <div className="space-y-2">
                                <Label>Nome do Setor</Label>
                                <Input value={name} onChange={e => setName(e.target.value)} placeholder="Ex: Comercial, Suporte..." />
                            </div>
                            <div className="space-y-2">
                                <Label>Descrição (Opcional)</Label>
                                <Input value={description} onChange={e => setDescription(e.target.value)} placeholder="Breve descrição..." />
                            </div>
                            <div className="space-y-2">
                                <Label>Cor de Identificação</Label>
                                <div className="flex gap-2 flex-wrap">
                                    {COLORS.map(c => (
                                        <button
                                            key={c}
                                            onClick={() => setColor(c)}
                                            className={cn(
                                                "w-8 h-8 rounded-full transition-all hover:scale-110 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-400",
                                                color === c ? "ring-2 ring-offset-2 ring-slate-900 scale-110" : ""
                                            )}
                                            style={{ backgroundColor: c }}
                                        />
                                    ))}
                                </div>
                            </div>
                            <div className="flex items-center space-x-2 pt-8">
                                <input
                                    type="checkbox"
                                    id="isDefault"
                                    checked={isDefault}
                                    onChange={e => setIsDefault(e.target.checked)}
                                    className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                                />
                                <Label htmlFor="isDefault" className="cursor-pointer">Definir como Setor Padrão</Label>
                            </div>
                        </div>
                        <div className="flex justify-end gap-2">
                            <Button variant="ghost" onClick={resetForm}>Cancelar</Button>
                            <Button onClick={isCreating ? handleCreate : handleUpdate} disabled={!name} className="bg-slate-900 text-white">
                                <Save className="mr-2 h-4 w-4" /> Salvar
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Sectors List */}
            <div className="grid gap-4">
                {sectors.map(sector => (
                    <div key={sector.id} className="flex items-center justify-between p-4 bg-white rounded-lg border shadow-sm hover:shadow-md transition-all">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold" style={{ backgroundColor: sector.color || "#ccc" }}>
                                {sector.name.substring(0, 2).toUpperCase()}
                            </div>
                            <div>
                                <div className="flex items-center gap-2">
                                    <h3 className="font-semibold text-slate-900 text-lg">{sector.name}</h3>
                                    {sector.isDefault && (
                                        <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-0.5 rounded-full flex items-center gap-1">
                                            <Star className="w-3 h-3 fill-yellow-800" /> Padrão
                                        </span>
                                    )}
                                </div>
                                <p className="text-sm text-slate-500">{sector.description || "Sem descrição"}</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-6">
                            <div className="text-right hidden md:block">
                                <div className="text-sm text-slate-900 font-medium flex items-center gap-1 justify-end">
                                    <Users className="w-4 h-4 text-slate-400" />
                                    {sector._count?.members || 0} membros
                                </div>
                                <div className="text-xs text-slate-500 flex items-center gap-1 justify-end mt-1">
                                    <Briefcase className="w-3 h-3" />
                                    {sector._count?.conversations || 0} conversas
                                </div>
                            </div>

                            <div className="flex items-center gap-2 border-l pl-4">
                                <Button variant="ghost" size="icon" onClick={() => startEdit(sector)}>
                                    <Edit2 className="h-4 w-4 text-slate-500" />
                                </Button>
                                <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-700 hover:bg-red-50" onClick={() => handleDelete(sector.id)}>
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    </div>
                ))}

                {!loading && sectors.length === 0 && (
                    <div className="text-center py-12 text-slate-400">
                        <Briefcase className="h-12 w-12 mx-auto mb-4 opacity-20" />
                        <p>Nenhum setor encontrado. Crie o primeiro!</p>
                    </div>
                )}
            </div>
        </div>
    )
}
