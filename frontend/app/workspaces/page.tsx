"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus } from "lucide-react"

export default function WorkspacesPage() {
    const router = useRouter()
    // Mock data
    const workspaces = [
        { id: "1", name: "NorthWay Marketing" },
        { id: "2", name: "NorthWay Sales" },
    ]

    const handleSelectWorkspace = (id: string) => {
        console.log("Selected workspace:", id)
        router.push(`/workspaces/${id}`)
    }

    return (
        <div className="flex items-center justify-center min-h-screen bg-slate-50">
            <Card className="w-full max-w-2xl">
                <CardHeader>
                    <CardTitle className="text-2xl font-bold text-center">Select Workspace</CardTitle>
                    <CardDescription className="text-center">Choose a workspace to continue</CardDescription>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {workspaces.map((ws) => (
                        <Button
                            key={ws.id}
                            variant="outline"
                            className="h-32 text-lg font-medium hover:border-primary hover:text-primary transition-colors"
                            onClick={() => handleSelectWorkspace(ws.id)}
                        >
                            {ws.name}
                        </Button>
                    ))}
                    <Button
                        variant="ghost"
                        className="h-32 border-2 border-dashed border-muted-foreground/20 hover:border-primary/50 hover:bg-primary/5 text-muted-foreground hover:text-primary"
                    >
                        <Plus className="mr-2 h-6 w-6" />
                        Create New
                    </Button>
                </CardContent>
            </Card>
        </div>
    )
}
