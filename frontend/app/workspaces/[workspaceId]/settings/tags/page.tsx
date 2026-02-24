"use client"

import React, { useState, useEffect } from "react"
import { useLanguage } from "@/lib/language-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Plus, Trash2, Tag as TagIcon, ArrowLeft, Save, Edit2, X } from "lucide-react"
import { api } from "@/lib/api"
import { useRouter } from "next/navigation"
import { cn } from "@/lib/utils"

interface Tag {
    id: string
    name: string
    color: string
    _count?: {
        ContactToTag: number
    }
}

const COLORS = [
    "#ef4444", // red-500
    "#f97316", // orange-500
    "#eab308", // yellow-500
    "#22c55e", // green-500
    "#06b6d4", // cyan-500
    "#3b82f6", // blue-500
    "#8b5cf6", // violet-500
    "#ec4899", // pink-500
    "#64748b", // slate-500
]

export default function TagsSettingsPage({ params: paramsPromise }: { params: Promise<{ workspaceId: string }> }) {
    const params = React.use(paramsPromise)
    const { t } = useLanguage()
    const router = useRouter()
    const [tags, setTags] = useState<Tag[]>([])
    const [loading, setLoading] = useState(true)
    const [isCreating, setIsCreating] = useState(false)
    const [editingId, setEditingId] = useState<string | null>(null)

    // Form state
    const [name, setName] = useState("")
    const [color, setColor] = useState(COLORS[5])

    const fetchTags = async () => {
        try {
            const { data } = await api.get(`/workspaces/${params.workspaceId}/tags`)
            setTags(data)
        } catch (error) {
            console.error("Failed to fetch tags", error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchTags()
    }, [])

    const handleCreate = async () => {
        try {
            await api.post(`/workspaces/${params.workspaceId}/tags`, { name, color })
            fetchTags()
            setIsCreating(false)
            resetForm()
        } catch (error) {
            console.error("Failed to create tag", error)
        }
    }

    const handleUpdate = async () => {
        if (!editingId) return
        try {
            await api.patch(`/workspaces/${params.workspaceId}/tags/${editingId}`, { name, color })
            fetchTags()
            setEditingId(null)
            resetForm()
        } catch (error) {
            console.error("Failed to update tag", error)
        }
    }

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure? This will remove the tag from all contacts.")) return
        try {
            await api.delete(`/workspaces/${params.workspaceId}/tags/${id}`)
            fetchTags()
        } catch (error) {
            console.error("Failed to delete tag", error)
        }
    }

    const startEdit = (tag: Tag) => {
        setEditingId(tag.id)
        setName(tag.name)
        setColor(tag.color || COLORS[5])
        setIsCreating(false)
    }

    const resetForm = () => {
        setName("")
        setColor(COLORS[5])
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
                        <h1 className="text-3xl font-bold text-slate-800">Gerenciar Tags</h1>
                        <p className="text-slate-500 mt-2">Crie tags para segmentar seus contatos e organizar seu fluxo de trabalho.</p>
                    </div>
                    <Button onClick={() => { setIsCreating(true); setEditingId(null); setName(""); }} disabled={isCreating || !!editingId}>
                        <Plus className="mr-2 h-4 w-4" /> Criar Tag
                    </Button>
                </div>
            </div>

            <Separator />

            {/* Create/Edit Form */}
            {(isCreating || editingId) && (
                <Card className="border-2 border-primary/20 bg-primary/5">
                    <CardHeader>
                        <CardTitle>{isCreating ? "Nova Tag" : "Editar Tag"}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid gap-4 md:grid-cols-2">
                            <div className="space-y-2">
                                <Label>Nome da Tag</Label>
                                <Input value={name} onChange={e => setName(e.target.value)} placeholder="Ex: Cliente VIP, Lead Quente..." />
                            </div>
                            <div className="space-y-2">
                                <Label>Cor</Label>
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

            {/* Tags List */}
            <div className="grid gap-4">
                {tags.map(tag => (
                    <div key={tag.id} className="flex items-center justify-between p-4 bg-white rounded-lg border shadow-sm hover:shadow-md transition-all">
                        <div className="flex items-center gap-4">
                            <div className="w-4 h-4 rounded-full" style={{ backgroundColor: tag.color || "#ccc" }} />
                            <div>
                                <h3 className="font-semibold text-slate-900">{tag.name}</h3>
                                {/* <p className="text-xs text-slate-500">Used in {tag._count?.ContactToTag || 0} contacts</p> */}
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <Button variant="ghost" size="icon" onClick={() => startEdit(tag)}>
                                <Edit2 className="h-4 w-4 text-slate-500" />
                            </Button>
                            <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-700 hover:bg-red-50" onClick={() => handleDelete(tag.id)}>
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                ))}

                {!loading && tags.length === 0 && (
                    <div className="text-center py-12 text-slate-400">
                        <TagIcon className="h-12 w-12 mx-auto mb-4 opacity-20" />
                        <p>Nenhuma tag encontrada. Crie a primeira!</p>
                    </div>
                )}
            </div>
        </div>
    )
}
