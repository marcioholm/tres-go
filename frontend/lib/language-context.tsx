"use client"

import React, { createContext, useContext, useState, useEffect } from "react"

type Language = "pt" | "en" | "es"

interface LanguageContextType {
    language: Language
    setLanguage: (lang: Language) => void
    t: (key: string) => string
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

export const translations = {
    pt: {
        dashboard: "Dashboard",
        inbox: "Inbox",
        integrations: "Integrações",
        contacts: "Contatos",
        settings: "Configurações",
        reports: "Relatórios",
        performance: "Performance",
        welcome: "Bem-vindo de volta, Time!",
        welcome_sub: "Seu workspace está pronto. Aqui está o que está acontecendo hoje.",
        total_conversations: "Total de Conversas",
        active_contacts: "Contatos Ativos",
        campaigns: "Campanhas",
        kanban: "Kanban",
        response_rate: "Taxa de Resposta",
        growth: "Crescimento",
        select_workspace: "Selecionar Workspace",
        create_new: "Criar Novo",
        from_last_month: "vs mês anterior",
        activity_placeholder: "Gráfico de Atividade",
        recent_contacts: "Contatos Recentes",
        connect_channels: "Conecte seus canais de comunicação.",
        connect_new_api: "Conectar Nova API",
        active: "Ativo",
        provider: "Provedor",
        configure: "Configurar",
        add_connection: "Adicionar Conexão",
        connection_types: "Z-API, API Oficial ou Instagram",
        workspace_preferences: "Gerencie as preferências e configurações gerais do seu workspace.",
        workspace_profile: "Perfil do Workspace",
        update_branding: "Atualize o nome e a marca do seu workspace.",
        workspace_name: "Nome do Workspace",
        url_slug: "URL Personalizada",
        save_changes: "Salvar Alterações",
        team_members: "Membros da Equipe",
        manage_access: "Gerencie quem tem acesso a este workspace.",
        active_members: "membros ativos",
        manage_team: "Gerenciar Equipe"
    },
    en: {
        dashboard: "Dashboard",
        inbox: "Inbox",
        integrations: "Integrations",
        contacts: "Contacts",
        settings: "Settings",
        reports: "Reports",
        performance: "Performance",
        welcome: "Welcome back, Team!",
        welcome_sub: "Your workspace is ready. Here's what is happening today.",
        total_conversations: "Total Conversations",
        active_contacts: "Active Contacts",
        campaigns: "Campaigns",
        kanban: "Kanban",
        response_rate: "Response Rate",
        growth: "Growth",
        select_workspace: "Select Workspace",
        create_new: "Create New",
        from_last_month: "from last month",
        activity_placeholder: "Activity Chart",
        recent_contacts: "Recent Contacts",
        connect_channels: "Connect your communication channels.",
        connect_new_api: "Connect New API",
        active: "Active",
        provider: "Provider",
        configure: "Configure",
        add_connection: "Add Connection",
        connection_types: "Z-API, Official API, or Instagram",
        workspace_preferences: "Manage your workspace preferences and general settings.",
        workspace_profile: "Workspace Profile",
        update_branding: "Update your workspace name and branding.",
        workspace_name: "Workspace Name",
        url_slug: "URL Slug",
        save_changes: "Save Changes",
        team_members: "Team Members",
        manage_access: "Manage who has access to this workspace.",
        active_members: "active members",
        manage_team: "Manage Team"
    },
    es: {
        dashboard: "Panel",
        inbox: "Bandeja",
        integrations: "Integraciones",
        contacts: "Contactos",
        settings: "Ajustes",
        reports: "Reportes",
        performance: "Performance",
        welcome: "¡Bienvenido de nuevo, Equipo!",
        welcome_sub: "Tu espacio de trabajo está listo. Aquí está lo que sucede hoy.",
        total_conversations: "Conversaciones Totales",
        active_contacts: "Contactos Activos",
        campaigns: "Campañas",
        kanban: "Kanban",
        response_rate: "Tasa de Respuesta",
        growth: "Crecimiento",
        select_workspace: "Seleccionar Espacio",
        create_new: "Crear Nuevo",
        from_last_month: "vs mês anterior",
        activity_placeholder: "Gráfico de Atividade",
        recent_contacts: "Contactos Recientes",
        connect_channels: "Conecta tus canales de comunicación.",
        connect_new_api: "Conectar Nueva API",
        active: "Ativo",
        provider: "Proveedor",
        configure: "Configurar",
        add_connection: "Añadir Conexión",
        connection_types: "Z-API, API Oficial o Instagram",
        workspace_preferences: "Administra las preferencias y configuraciones generales.",
        workspace_profile: "Perfil del Espacio",
        update_branding: "Actualiza el nombre y la marca de tu espacio.",
        workspace_name: "Nombre del Espacio",
        url_slug: "URL Personalizada",
        save_changes: "Guardar Cambios",
        team_members: "Miembros del Equipo",
        manage_access: "Administra quién tiene acceso a este espacio.",
        active_members: "miembros activos",
        manage_team: "Administrar Equipo"
    }
}

export function LanguageProvider({ children }: { children: React.ReactNode }) {
    const [language, setLanguage] = useState<Language>("pt")

    const t = (key: string) => {
        return translations[language][key as keyof typeof translations["pt"]] || key
    }

    return (
        <LanguageContext.Provider value={{ language, setLanguage, t }}>
            {children}
        </LanguageContext.Provider>
    )
}

export function useLanguage() {
    const context = useContext(LanguageContext)
    if (context === undefined) {
        throw new Error("useLanguage must be used within a LanguageProvider")
    }
    return context
}
