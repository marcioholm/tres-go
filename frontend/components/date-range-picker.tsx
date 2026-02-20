"use client"

import * as React from "react"
import { CalendarIcon } from "lucide-react"
import { addDays, format } from "date-fns"
import { DateRange } from "react-day-picker"

import { cn } from "@/lib/utils"
// import { Button } from "@/components/ui/button"
// import { Calendar } from "@/components/ui/calendar"
// import {
//   Popover,
//   PopoverContent,
//   PopoverTrigger,
// } from "@/components/ui/popover"

// Mock component to avoid missing dependencies errors for now
export function CalendarDateRangePicker({
    className,
}: React.HTMLAttributes<HTMLDivElement>) {
    return (
        <div className={cn("grid gap-2", className)}>
            <button className="inline-flex items-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2 w-[260px] justify-start text-left font-normal">
                <CalendarIcon className="mr-2 h-4 w-4" />
                <span>Jan 20, 2024 - Feb 09, 2024</span>
            </button>
        </div>
    )
}
