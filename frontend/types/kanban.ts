export interface Contact {
    id: string
    name: string
}

export interface Agent {
    id: string
    name: string
}

export interface Deal {
    id: string
    title: string
    value?: number
    contact: Contact
    agent?: Agent
    createdAt: string
    columnId: string
    order: number
}

export interface Column {
    id: string
    title: string
    color: string
    items: Deal[]
}
