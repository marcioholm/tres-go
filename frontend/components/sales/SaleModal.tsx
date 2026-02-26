"use client"

import React, { useState } from "react"
import {
    X,
    Plus,
    Trash2,
    DollarSign,
    CreditCard,
    Banknote,
    QrCode,
    ChevronRight,
    Save
} from "lucide-react"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { api } from "@/lib/api"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

interface SaleModalProps {
    isOpen: boolean
    onClose: () => void
    workspaceId: string
    contactId: string
    conversationId?: string
    onSuccess?: (sale: any) => void
}

const PAYMENT_METHODS = [
    { id: 'PIX', label: 'PIX', icon: QrCode },
    { id: 'CARTAO_CREDITO', label: 'Cartão de Crédito', icon: CreditCard },
    { id: 'CARTAO_DEBITO', label: 'Cartão de Débito', icon: CreditCard },
    { id: 'DINHEIRO', label: 'Dinheiro', icon: Banknote },
    { id: 'TRANSFERENCIA', label: 'Transferência', icon: DollarSign },
    { id: 'BOLETO', label: 'Boleto', icon: DollarSign },
]

export function SaleModal({ isOpen, onClose, workspaceId, contactId, conversationId, onSuccess }: SaleModalProps) {
    const [title, setTitle] = useState("")
    const [notes, setNotes] = useState("")
    const [paymentMethod, setPaymentMethod] = useState("PIX")
    const [items, setItems] = useState([{ name: "", quantity: 1, unitPrice: 0 }])
    const [isSubmitting, setIsSubmitting] = useState(false)

    const addItem = () => {
        setItems([...items, { name: "", quantity: 1, unitPrice: 0 }])
    }

    const removeItem = (index: number) => {
        if (items.length > 1) {
            setItems(items.filter((_, i) => i !== index))
        }
    }

    const updateItem = (index: number, field: string, value: any) => {
        const newItems = [...items]
        newItems[index] = { ...newItems[index], [field]: value }
        setItems(newItems)
    }

    const calculateTotal = () => {
        return items.reduce((acc, item) => acc + (item.quantity * item.unitPrice), 0)
    }

    const handleSubmit = async () => {
        if (!title.trim()) {
            toast.error("O título da venda é obrigatório")
            return
        }

        const validItems = items.filter(i => i.name.trim() && i.quantity > 0 && i.unitPrice > 0)
        if (validItems.length === 0) {
            toast.error("Adicione pelo menos um item válido à venda")
            return
        }

        setIsSubmitting(true)
        try {
            const res = await api.post(`/workspaces/${workspaceId}/sales`, {
                contactId,
                conversationId,
                title,
                notes,
                paymentMethod,
                paymentStatus: 'PAID', // Defaulting to PAID for manual registration
                items: validItems
            })

            toast.success("Venda registrada com sucesso!")
            if (onSuccess) onSuccess(res.data)
            onClose()
            // Reset form
            setTitle("")
            setNotes("")
            setItems([{ name: "", quantity: 1, unitPrice: 0 }])
        } catch (error) {
            console.error("Failed to register sale", error)
            toast.error("Erro ao registrar venda. Verifique os dados e tente novamente.")
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-2xl bg-white p-0 overflow-hidden border-none shadow-2xl">
                <DialogHeader className="p-6 bg-black text-white">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-lg bg-white/10 flex items-center justify-center">
                                <DollarSign className="h-5 w-5 text-white" />
                            </div>
                            <div>
                                <DialogTitle className="text-xl font-black">Registrar Venda</DialogTitle>
                                <p className="text-xs text-zinc-400 font-medium">Preencha os detalhes da transação abaixo</p>
                            </div>
                        </div>
                    </div>
                </DialogHeader>

                <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
                    {/* General Info */}
                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <Label className="text-[11px] font-bold text-[#6B6B6B] uppercase tracking-wider">Título da Venda</Label>
                                <Input
                                    placeholder="Ex: Consultoria Premium"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    className="h-10 border-[#F0F0F0] focus-visible:ring-black"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <Label className="text-[11px] font-bold text-[#6B6B6B] uppercase tracking-wider">Forma de Pagamento</Label>
                                <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                                    <SelectTrigger className="h-10 border-[#F0F0F0] focus-visible:ring-black">
                                        <SelectValue placeholder="Selecione" />
                                    </SelectTrigger>
                                    <SelectContent className="bg-white border-[#F0F0F0]">
                                        {PAYMENT_METHODS.map(m => (
                                            <SelectItem key={m.id} value={m.id} className="hover:bg-[#F5F5F5]">
                                                <div className="flex items-center gap-2">
                                                    <m.icon className="h-3.5 w-3.5 text-[#6B6B6B]" />
                                                    <span className="text-sm font-medium">{m.label}</span>
                                                </div>
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </div>

                    {/* Items Table */}
                    <div className="space-y-3">
                        <Label className="text-[11px] font-bold text-[#6B6B6B] uppercase tracking-wider">Itens da Venda</Label>
                        <div className="space-y-2">
                            {items.map((item, idx) => (
                                <div key={idx} className="flex items-center gap-2">
                                    <Input
                                        placeholder="Nome do produto/serviço"
                                        className="flex-1 h-10 border-[#F0F0F0] text-sm"
                                        value={item.name}
                                        onChange={(e) => updateItem(idx, 'name', e.target.value)}
                                    />
                                    <Input
                                        type="number"
                                        placeholder="Qtd"
                                        className="w-20 h-10 border-[#F0F0F0] text-sm text-center"
                                        value={item.quantity}
                                        min={1}
                                        onChange={(e) => updateItem(idx, 'quantity', parseInt(e.target.value))}
                                    />
                                    <div className="relative">
                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-[#6B6B6B]">R$</span>
                                        <Input
                                            type="number"
                                            placeholder="0,00"
                                            className="w-28 h-10 border-[#F0F0F0] text-sm pl-8"
                                            value={item.unitPrice}
                                            onChange={(e) => updateItem(idx, 'unitPrice', parseFloat(e.target.value))}
                                        />
                                    </div>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-10 w-10 text-[#6B6B6B] hover:text-[#E8202A] hover:bg-[#FFF5F5]"
                                        onClick={() => removeItem(idx)}
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            ))}
                        </div>
                        <Button
                            variant="outline"
                            size="sm"
                            className="mt-2 h-8 text-[11px] font-bold border-dashed border-[#D1D5DB] border-2 hover:border-black hover:bg-white"
                            onClick={addItem}
                        >
                            <Plus className="h-3.5 w-3.5 mr-1.5" />
                            ADICIONAR ITEM
                        </Button>
                    </div>

                    {/* Notes */}
                    <div className="space-y-1.5">
                        <Label className="text-[11px] font-bold text-[#6B6B6B] uppercase tracking-wider">Observações Internas</Label>
                        <Textarea
                            placeholder="Alguma informação adicional sobre esta venda?"
                            className="resize-none border-[#F0F0F0] min-h-[80px] text-sm focus-visible:ring-black"
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                        />
                    </div>
                </div>

                <div className="p-6 border-t border-[#F0F0F0] bg-[#FAFAFA] flex items-center justify-between">
                    <div>
                        <p className="text-[10px] text-[#6B6B6B] font-bold uppercase tracking-widest mb-0.5">Total da Venda</p>
                        <p className="text-2xl font-black text-[#0F0F0F]">
                            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(calculateTotal())}
                        </p>
                    </div>
                    <div className="flex items-center gap-3">
                        <Button variant="ghost" onClick={onClose} className="h-10 px-6 font-bold text-[#6B6B6B] hover:bg-zinc-100">
                            CANCELAR
                        </Button>
                        <Button
                            onClick={handleSubmit}
                            disabled={isSubmitting}
                            className="h-10 px-8 bg-black text-white hover:bg-zinc-800 font-bold gap-2 shadow-lg shadow-black/10"
                        >
                            {isSubmitting ? "REGISTRANDO..." : "CONFIRMAR VENDA"}
                            <Save className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}
