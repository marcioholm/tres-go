"use client"

import { useState, useEffect } from "react"
import {
    DndContext,
    DragOverlay,
    useSensor,
    useSensors,
    PointerSensor,
    closestCorners,
    DragStartEvent,
    DragEndEvent,
    DragOverEvent
} from "@dnd-kit/core"
import { arrayMove } from "@dnd-kit/sortable"
import { KanbanColumn } from "./KanbanColumn"
import { KanbanCard } from "./KanbanCard"
import { Column, Deal } from "@/types/kanban"
import { api } from "@/lib/api"
import { createPortal } from "react-dom"

import { io } from "socket.io-client"

interface KanbanBoardProps {
    workspaceId: string
}

export function KanbanBoard({ workspaceId }: KanbanBoardProps) {
    const [columns, setColumns] = useState<Column[]>([])
    const [activeDeal, setActiveDeal] = useState<Deal | null>(null)

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 5
            }
        })
    )

    const fetchBoard = async () => {
        try {
            const { data } = await api.get(`/workspaces/${workspaceId}/kanban`)
            if (data && data.columns) {
                const cols = data.columns.map((col: any) => ({
                    id: col.id,
                    title: col.name,
                    color: col.color,
                    items: col.deals.map((deal: any) => ({
                        ...deal,
                        columnId: col.id
                    }))
                }))
                setColumns(cols)
            }
        } catch (error) {
            console.error("Failed to fetch kanban board", error)
        }
    }

    useEffect(() => {
        fetchBoard()

        const socket = io(process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001", {
            query: { workspaceId }
        });

        socket.on("board_updated", () => {
            fetchBoard();
        });

        return () => {
            socket.disconnect();
        }
    }, [workspaceId])

    const findColumn = (id: string) => {
        const col = columns.find(c => c.id === id)
        if (col) return col
        return columns.find(c => c.items.some(i => i.id === id))
    }

    const onDragStart = (event: DragStartEvent) => {
        if (event.active.data.current?.type === "DEAL") {
            setActiveDeal(event.active.data.current.deal as Deal)
        }
    }

    const onDragOver = (event: DragOverEvent) => {
        const { active, over } = event
        if (!over) return

        const activeId = String(active.id)
        const overId = String(over.id)

        const activeColumn = findColumn(activeId)
        const overColumn = findColumn(overId)

        if (!activeColumn || !overColumn) return

        if (activeColumn !== overColumn) {
            setColumns((prev) => {
                const activeItems = activeColumn.items
                const overItems = overColumn.items
                const activeIndex = activeItems.findIndex(i => i.id === activeId)
                const overIndex = overItems.findIndex(i => i.id === overId)

                let newIndex;
                if (over.data.current?.type === 'COLUMN') {
                    newIndex = overItems.length + 1
                } else {
                    const isBelowOverItem = over &&
                        active.rect.current.translated &&
                        active.rect.current.translated.top > over.rect.top + over.rect.height;
                    const modifier = isBelowOverItem ? 1 : 0;
                    newIndex = overIndex >= 0 ? overIndex + modifier : overItems.length + 1;
                }

                return prev.map(col => {
                    if (col.id === activeColumn.id) {
                        return { ...col, items: activeItems.filter(i => i.id !== activeId) }
                    } else if (col.id === overColumn.id) {
                        const newItems = [
                            ...overItems.slice(0, newIndex),
                            activeItems[activeIndex],
                            ...overItems.slice(newIndex, overItems.length)
                        ]
                        // Ensure unique items
                        const uniqueItems = Array.from(new Set(newItems.map(i => i.id)))
                            .map(id => newItems.find(i => i.id === id)!)

                        return {
                            ...col,
                            items: uniqueItems
                        }
                    }
                    return col
                })
            })
        }
    }

    const onDragEnd = async (event: DragEndEvent) => {
        const { active, over } = event
        if (!over) {
            setActiveDeal(null)
            return
        }

        const activeId = String(active.id)
        const overId = String(over.id)

        const activeColumn = findColumn(activeId)
        const overColumn = findColumn(overId)

        if (!activeColumn || !overColumn) {
            setActiveDeal(null)
            return
        }

        const activeIndex = activeColumn.items.findIndex(i => i.id === activeId)
        const overIndex = overColumn.items.findIndex(i => i.id === overId)

        if (activeColumn === overColumn) {
            // Reorder in same column
            if (activeIndex !== overIndex) {
                const newItems = arrayMove(activeColumn.items, activeIndex, overIndex)
                setColumns(prev => prev.map(col =>
                    col.id === activeColumn.id ? { ...col, items: newItems } : col
                ))
                // Persist reorder
                await api.patch(`/workspaces/${workspaceId}/kanban/deals/${activeId}`, {
                    columnId: activeColumn.id,
                    order: overIndex
                })
            }
        } else {
            // Moved to different column (already handled visually in onDragOver)
            // Need to persist the final position
            // But wait, onDragOver moved it in state, so now activeColumn should be the new column?
            // No, findColumn looks at current state. If state updated in dragOver, active item IS in overColumn now.

            // Let's verify.
            // After drop, we find the item in the NEW column.
            // So activeColumn logic finding by item ID will find it in the new column.

            // We just need to persist the new columnId and index.
            const column = findColumn(activeId)
            if (column) {
                const index = column.items.findIndex(i => i.id === activeId)
                await api.patch(`/workspaces/${workspaceId}/kanban/deals/${activeId}`, {
                    columnId: column.id,
                    order: index
                })
            }
        }

        setActiveDeal(null)
    }

    return (
        <DndContext
            sensors={sensors}
            collisionDetection={closestCorners}
            onDragStart={onDragStart}
            onDragOver={onDragOver}
            onDragEnd={onDragEnd}
        >
            <div className="flex gap-4 h-full overflow-x-auto pb-4 items-start">
                {columns.map(col => (
                    <KanbanColumn key={col.id} column={col} />
                ))}
            </div>
            {typeof document !== 'undefined' && createPortal(
                <DragOverlay>
                    {activeDeal && <KanbanCard deal={activeDeal} />}
                </DragOverlay>,
                document.body
            )}
        </DndContext>
    )
}
