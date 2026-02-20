import { useDroppable } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { KanbanCard } from "./KanbanCard";
import { Column, Deal } from "@/types/kanban";

interface KanbanColumnProps {
    column: Column
}

export function KanbanColumn({ column }: KanbanColumnProps) {
    const { setNodeRef } = useDroppable({
        id: column.id,
        data: {
            type: "COLUMN",
            column
        }
    });

    return (
        <div
            ref={setNodeRef}
            className="bg-slate-50/50 rounded-lg p-2 min-w-[280px] w-[280px] h-full flex flex-col border border-dashed border-slate-200"
        >
            <div className="flex items-center justify-between px-2 py-3 mb-2 font-semibold text-sm text-slate-700">
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full shadow-sm" style={{ backgroundColor: column.color }} />
                    {column.title}
                    <span className="text-slate-400 font-normal ml-1 bg-white px-1.5 py-0.5 rounded-full text-xs shadow-sm border border-slate-100">
                        {column.items.length}
                    </span>
                </div>
                {/* Total Value if needed */}
                {column.items.some(d => d.value) && (
                    <div className="text-xs text-slate-500 font-normal">
                        R$ {column.items.reduce((acc, curr) => acc + (curr.value || 0), 0).toFixed(0)}
                    </div>
                )}
            </div>

            <div className="flex-1 flex flex-col gap-2 overflow-y-auto px-1 pb-2">
                <SortableContext items={column.items.map(d => d.id)} strategy={verticalListSortingStrategy}>
                    {column.items.map(deal => (
                        <KanbanCard key={deal.id} deal={deal} />
                    ))}
                </SortableContext>
            </div>
        </div>
    )
}
