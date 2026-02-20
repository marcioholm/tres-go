"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Calculator, Calendar, CreditCard, Settings, User, Smile, Search } from "lucide-react"

import {
    CommandDialog,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
    CommandSeparator,
    CommandShortcut,
} from "@/components/ui/command"

export function GlobalSearch() {
    const [open, setOpen] = useState(false)
    const router = useRouter()

    useEffect(() => {
        const down = (e: KeyboardEvent) => {
            if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
                e.preventDefault()
                setOpen((open) => !open)
            }
        }

        document.addEventListener("keydown", down)
        return () => document.removeEventListener("keydown", down)
    }, [])

    return (
        <>
            <button
                onClick={() => setOpen(true)}
                className="w-full relative justify-start text-sm text-muted-foreground sm:pr-12 md:w-full lg:w-96 rounded-md border border-input bg-transparent px-3 py-2 shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 flex items-center gap-2"
            >
                <Search className="h-4 w-4" />
                <span className="inline-flex">Buscar...</span>
                <kbd className="pointer-events-none absolute right-1.5 top-2 hidden h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100 sm:flex">
                    <span className="text-xs">⌘</span>K
                </kbd>
            </button>
            <CommandDialog open={open} onOpenChange={setOpen}>
                <CommandInput placeholder="Type a command or search..." />
                <CommandList>
                    <CommandEmpty>No results found.</CommandEmpty>
                    <CommandGroup heading="Suggestions">
                        <CommandItem onSelect={() => { setOpen(false); router.push('inbox?compose=true') }}>
                            <Calendar className="mr-2 h-4 w-4" />
                            <span>New Message</span>
                        </CommandItem>
                        <CommandItem onSelect={() => { setOpen(false); router.push('contacts') }}>
                            <Smile className="mr-2 h-4 w-4" />
                            <span>Search Contacts</span>
                        </CommandItem>
                        <CommandItem onSelect={() => { setOpen(false); router.push('kanban') }}>
                            <Calculator className="mr-2 h-4 w-4" />
                            <span>Go to Kanban</span>
                        </CommandItem>
                    </CommandGroup>
                    <CommandSeparator />
                    <CommandGroup heading="Settings">
                        <CommandItem onSelect={() => { setOpen(false); router.push('settings') }}>
                            <User className="mr-2 h-4 w-4" />
                            <span>Profile</span>
                            <CommandShortcut>⌘P</CommandShortcut>
                        </CommandItem>
                        <CommandItem onSelect={() => { setOpen(false); router.push('settings') }}>
                            <CreditCard className="mr-2 h-4 w-4" />
                            <span>Billing</span>
                            <CommandShortcut>⌘B</CommandShortcut>
                        </CommandItem>
                        <CommandItem onSelect={() => { setOpen(false); router.push('settings') }}>
                            <Settings className="mr-2 h-4 w-4" />
                            <span>Settings</span>
                            <CommandShortcut>⌘S</CommandShortcut>
                        </CommandItem>
                    </CommandGroup>
                </CommandList>
            </CommandDialog>
        </>
    )
}
