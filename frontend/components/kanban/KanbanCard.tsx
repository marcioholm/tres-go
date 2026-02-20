import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { Card, CardContent } from "@/components/ui/card"
import { User } from "lucide-react"
import { Deal } from "@/types/kanban"

interface KanbanCardProps {
    deal: Deal
}

export function KanbanCard({ deal }: KanbanCardProps) {
    const {
        setNodeRef,
        attributes,
        listeners,
        transform,
        transition,
        isDragging,
    } = useSortable({
        id: deal.id,
        data: {
            type: "DEAL",
            deal,
        },
    })

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    }

    if (isDragging) {
        return (
            <div
                ref={setNodeRef}
                style={style}
                className="opacity-30 bg-slate-100 border-2 border-dashed border-slate-300 rounded-lg h-[100px]"
            />
        )
    }

    return (
        <Card
            ref={setNodeRef}
            style={style}
            {...attributes}
            {...listeners}
            className="cursor-grab hover:shadow-md transition-shadow group bg-white border-slate-200"
        >
            <CardContent className="p-3 space-y-2">
                <div className="flex justify-between items-start gap-2">
                    <span className="font-medium text-sm line-clamp-2 text-slate-800 leading-tight">
                        {deal.title}
                    </span>
                </div>

                {deal.value && (
                    <div className="font-semibold text-green-600 text-sm">
                        R$ {deal.value.toFixed(2)}
                    </div>
                )}

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                    <div className="flex items-center gap-1.5">
                        <div className="h-5 w-5 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-bold text-slate-600">
                            {deal.contact.name.substring(0, 2).toUpperCase()}
                        </div>
                        <span className="truncate max-w-[80px]">{deal.contact.name}</span>
                    </div>
                    {deal.agent && (
                        <div className="flex items-center gap-1">
                            <User className="h-3 w-3" />
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    )
}
