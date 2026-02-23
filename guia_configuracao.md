# Guia de Configuração e Correção NorthWay Omni

Siga estes passos um por um para resolver os erros de login e de recebimento de mensagens.

## 1. Correção do Banco de Dados (Criação de Tabelas Faltantes)
Se você vir "Internal Server Error" ou se o SQL reclamar de tabelas faltantes, rode este bloco completo. Ele cria toda a estrutura de performance, sessões e logs que o sistema exige.

**Copie e rode este comando no SQL Editor da Supabase:**

```sql
-- 1. Criar Enums (Tipos) necessários
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'SessionEndReason') THEN
        CREATE TYPE "SessionEndReason" AS ENUM ('RESOLVED', 'TRANSFERRED', 'REASSIGNED');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'SaleAttribution') THEN
        CREATE TYPE "SaleAttribution" AS ENUM ('LAST_AGENT', 'FIRST_AGENT', 'EQUAL_SPLIT', 'MANUAL');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'TimeCalculation') THEN
        CREATE TYPE "TimeCalculation" AS ENUM ('TOTAL', 'ACTIVE_ONLY');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'ReportVisibility') THEN
        CREATE TYPE "ReportVisibility" AS ENUM ('ADMIN_ONLY', 'ALL_AGENTS');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'ReportPeriod') THEN
        CREATE TYPE "ReportPeriod" AS ENUM ('WEEKLY', 'MONTHLY', 'CUSTOM');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'SubscriptionStatus') THEN
        CREATE TYPE "SubscriptionStatus" AS ENUM ('TRIAL', 'ACTIVE', 'PAST_DUE', 'BLOCKED', 'CANCELLED', 'SUSPENDED');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'BillingCycle') THEN
        CREATE TYPE "BillingCycle" AS ENUM ('MONTHLY', 'YEARLY');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'InvoiceStatus') THEN
        CREATE TYPE "InvoiceStatus" AS ENUM ('PENDING', 'PAID', 'OVERDUE', 'CANCELLED', 'REFUNDED');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'SectorRole') THEN
        CREATE TYPE "SectorRole" AS ENUM ('SUPERVISOR', 'AGENT');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'AutoRuleType') THEN
        CREATE TYPE "AutoRuleType" AS ENUM ('KEYWORD', 'CHANNEL', 'TAG', 'BUSINESS_HOUR');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'TagType') THEN
        CREATE TYPE "TagType" AS ENUM ('GENERAL', 'REMARKETING', 'SEGMENT', 'STATUS');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'SaleStatus') THEN
        CREATE TYPE "SaleStatus" AS ENUM ('COMPLETED', 'PENDING', 'CANCELLED', 'REFUNDED');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'ScheduledStatus') THEN
        CREATE TYPE "ScheduledStatus" AS ENUM ('PENDING', 'SENT', 'FAILED', 'CANCELLED');
    END IF;
END $$;

-- 2. Criar Tabelas de Base
CREATE TABLE IF NOT EXISTS "Plan" (
    "id" TEXT PRIMARY KEY,
    "name" TEXT UNIQUE NOT NULL,
    "slug" TEXT UNIQUE NOT NULL,
    "description" TEXT,
    "priceMonthly" DOUBLE PRECISION NOT NULL,
    "priceYearly" DOUBLE PRECISION NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isPublic" BOOLEAN NOT NULL DEFAULT true,
    "trialDays" INTEGER NOT NULL DEFAULT 14,
    "maxAgents" INTEGER NOT NULL DEFAULT 2,
    "maxChannels" INTEGER NOT NULL DEFAULT 1,
    "maxConversationsPerMonth" INTEGER NOT NULL DEFAULT 500,
    "maxCampaigns" INTEGER NOT NULL DEFAULT 0,
    "maxStorage" INTEGER NOT NULL DEFAULT 1024,
    "maxSectors" INTEGER NOT NULL DEFAULT 1,
    "hasKanban" BOOLEAN NOT NULL DEFAULT false,
    "hasChatbot" BOOLEAN NOT NULL DEFAULT false,
    "hasAI" BOOLEAN NOT NULL DEFAULT false,
    "hasReports" BOOLEAN NOT NULL DEFAULT false,
    "hasAPI" BOOLEAN NOT NULL DEFAULT false,
    "hasWhiteLabel" BOOLEAN NOT NULL DEFAULT false,
    "hasMultiSectors" BOOLEAN NOT NULL DEFAULT false,
    "hasCampaigns" BOOLEAN NOT NULL DEFAULT false,
    "hasSalesHistory" BOOLEAN NOT NULL DEFAULT false,
    "hasScheduledMessages" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "SuperAdmin" (
    "id" TEXT PRIMARY KEY,
    "userId" TEXT NOT NULL UNIQUE REFERENCES "User"("id") ON DELETE CASCADE,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "LegalAcceptance" (
    "id" TEXT PRIMARY KEY,
    "userId" TEXT NOT NULL UNIQUE REFERENCES "User"("id") ON DELETE CASCADE,
    "termsVersion" TEXT NOT NULL DEFAULT '1.0',
    "privacyVersion" TEXT NOT NULL DEFAULT '1.0',
    "acceptedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ip" TEXT,
    "userAgent" TEXT
);

-- 3. Estrutura do Workspace e Configurações
CREATE TABLE IF NOT EXISTS "Subscription" (
    "id" TEXT PRIMARY KEY,
    "workspaceId" TEXT NOT NULL UNIQUE REFERENCES "Workspace"("id") ON DELETE CASCADE,
    "planId" TEXT NOT NULL REFERENCES "Plan"("id"),
    "status" "SubscriptionStatus" NOT NULL DEFAULT 'TRIAL',
    "billingCycle" "BillingCycle" NOT NULL DEFAULT 'MONTHLY',
    "asaasCustomerId" TEXT,
    "asaasSubscriptionId" TEXT,
    "trialEndsAt" TIMESTAMP(3),
    "currentPeriodStart" TIMESTAMP(3),
    "currentPeriodEnd" TIMESTAMP(3),
    "cancelledAt" TIMESTAMP(3),
    "blockedAt" TIMESTAMP(3),
    "priceOverride" DOUBLE PRECISION,
    "discountPercent" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "Invoice" (
    "id" TEXT PRIMARY KEY,
    "subscriptionId" TEXT NOT NULL REFERENCES "Subscription"("id") ON DELETE CASCADE,
    "asaasPaymentId" TEXT UNIQUE,
    "amount" DOUBLE PRECISION NOT NULL,
    "status" "InvoiceStatus" NOT NULL DEFAULT 'PENDING',
    "dueDate" TIMESTAMP(3) NOT NULL,
    "paidAt" TIMESTAMP(3),
    "paymentMethod" TEXT,
    "invoiceUrl" TEXT,
    "pixQrCode" TEXT,
    "pixCopiaECola" TEXT,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "BusinessHours" (
    "id" TEXT PRIMARY KEY,
    "workspaceId" TEXT NOT NULL REFERENCES "Workspace"("id") ON DELETE CASCADE,
    "dayOfWeek" INTEGER NOT NULL,
    "isOpen" BOOLEAN NOT NULL DEFAULT true,
    "openTime" TEXT NOT NULL,
    "closeTime" TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS "WorkspacePerformanceConfig" (
    "id" TEXT PRIMARY KEY,
    "workspaceId" TEXT NOT NULL UNIQUE REFERENCES "Workspace"("id") ON DELETE CASCADE,
    "saleAttribution" "SaleAttribution" NOT NULL DEFAULT 'LAST_AGENT',
    "manualAttribution" BOOLEAN NOT NULL DEFAULT false,
    "timeCalculation" "TimeCalculation" NOT NULL DEFAULT 'ACTIVE_ONLY',
    "inactivityThreshold" INTEGER NOT NULL DEFAULT 30,
    "resetTimerOnTransfer" BOOLEAN NOT NULL DEFAULT false,
    "transferCountsConversion" BOOLEAN NOT NULL DEFAULT false,
    "firstResponseGoal" INTEGER NOT NULL DEFAULT 5,
    "resolutionGoal" INTEGER NOT NULL DEFAULT 1440,
    "conversionRateGoal" DOUBLE PRECISION NOT NULL DEFAULT 30.0,
    "reportVisibility" "ReportVisibility" NOT NULL DEFAULT 'ADMIN_ONLY',
    "defaultReportPeriod" "ReportPeriod" NOT NULL DEFAULT 'MONTHLY',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 4. Auxiliares e Atendimento
CREATE TABLE IF NOT EXISTS "QuickReply" (
    "id" TEXT PRIMARY KEY,
    "workspaceId" TEXT NOT NULL REFERENCES "Workspace"("id") ON DELETE CASCADE,
    "shortcut" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "KnowledgeBase" (
    "id" TEXT PRIMARY KEY,
    "workspaceId" TEXT NOT NULL REFERENCES "Workspace"("id") ON DELETE CASCADE,
    "question" TEXT NOT NULL,
    "answer" TEXT NOT NULL,
    "tags" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "Tag" (
    "id" TEXT PRIMARY KEY,
    "name" TEXT NOT NULL,
    "color" TEXT,
    "workspaceId" TEXT,
    "type" "TagType" NOT NULL DEFAULT 'GENERAL'
);

CREATE TABLE IF NOT EXISTS "_ContactToTag" (
    "A" TEXT NOT NULL REFERENCES "Contact"("id") ON DELETE CASCADE,
    "B" TEXT NOT NULL REFERENCES "Tag"("id") ON DELETE CASCADE,
    PRIMARY KEY ("A", "B")
);

CREATE TABLE IF NOT EXISTS "_ConversationToTag" (
    "A" TEXT NOT NULL REFERENCES "Conversation"("id") ON DELETE CASCADE,
    "B" TEXT NOT NULL REFERENCES "Tag"("id") ON DELETE CASCADE,
    PRIMARY KEY ("A", "B")
);

-- 5. Setores e Kanban
CREATE TABLE IF NOT EXISTS "Sector" (
    "id" TEXT PRIMARY KEY,
    "workspaceId" TEXT NOT NULL REFERENCES "Workspace"("id") ON DELETE CASCADE,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "color" TEXT NOT NULL DEFAULT '#6366f1',
    "icon" TEXT NOT NULL DEFAULT 'business',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE("workspaceId", "name")
);

CREATE TABLE IF NOT EXISTS "SectorMember" (
    "id" TEXT PRIMARY KEY,
    "sectorId" TEXT NOT NULL REFERENCES "Sector"("id") ON DELETE CASCADE,
    "userId" TEXT NOT NULL REFERENCES "User"("id") ON DELETE CASCADE,
    "role" "SectorRole" NOT NULL DEFAULT 'AGENT',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE("sectorId", "userId")
);

CREATE TABLE IF NOT EXISTS "SectorSla" (
    "id" TEXT PRIMARY KEY,
    "sectorId" TEXT NOT NULL UNIQUE REFERENCES "Sector"("id") ON DELETE CASCADE,
    "firstResponseTime" INTEGER NOT NULL DEFAULT 5,
    "resolutionTime" INTEGER NOT NULL DEFAULT 120,
    "warningThreshold" INTEGER NOT NULL DEFAULT 80,
    "criticalThreshold" INTEGER NOT NULL DEFAULT 100
);

CREATE TABLE IF NOT EXISTS "SectorAutoRule" (
    "id" TEXT PRIMARY KEY,
    "sectorId" TEXT NOT NULL REFERENCES "Sector"("id") ON DELETE CASCADE,
    "type" "AutoRuleType" NOT NULL,
    "value" TEXT NOT NULL,
    "priority" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "KanbanBoard" (
    "id" TEXT PRIMARY KEY,
    "workspaceId" TEXT NOT NULL REFERENCES "Workspace"("id") ON DELETE CASCADE,
    "sectorId" TEXT UNIQUE REFERENCES "Sector"("id") ON DELETE CASCADE,
    "name" TEXT NOT NULL DEFAULT 'Funil de Vendas',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "KanbanColumn" (
    "id" TEXT PRIMARY KEY,
    "boardId" TEXT NOT NULL REFERENCES "KanbanBoard"("id") ON DELETE CASCADE,
    "name" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "color" TEXT NOT NULL DEFAULT '#6366f1',
    "isWon" BOOLEAN NOT NULL DEFAULT false,
    "isLost" BOOLEAN NOT NULL DEFAULT false
);

-- 6. Vendas, CRM e Automação
CREATE TABLE IF NOT EXISTS "Deal" (
    "id" TEXT PRIMARY KEY,
    "workspaceId" TEXT NOT NULL REFERENCES "Workspace"("id") ON DELETE CASCADE,
    "contactId" TEXT NOT NULL REFERENCES "Contact"("id") ON DELETE CASCADE,
    "columnId" TEXT NOT NULL REFERENCES "KanbanColumn"("id") ON DELETE CASCADE,
    "conversationId" TEXT REFERENCES "Conversation"("id"),
    "agentId" TEXT REFERENCES "User"("id"),
    "title" TEXT NOT NULL,
    "value" DOUBLE PRECISION,
    "order" INTEGER NOT NULL DEFAULT 0,
    "notes" TEXT,
    "expectedCloseAt" TIMESTAMP(3),
    "closedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "Sale" (
    "id" TEXT PRIMARY KEY,
    "workspaceId" TEXT NOT NULL REFERENCES "Workspace"("id") ON DELETE CASCADE,
    "contactId" TEXT NOT NULL REFERENCES "Contact"("id") ON DELETE CASCADE,
    "agentId" TEXT NOT NULL REFERENCES "User"("id") ON DELETE CASCADE,
    "conversationId" TEXT REFERENCES "Conversation"("id"),
    "title" TEXT NOT NULL,
    "description" TEXT,
    "amount" DOUBLE PRECISION NOT NULL,
    "status" "SaleStatus" NOT NULL DEFAULT 'COMPLETED',
    "saleDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "SaleItem" (
    "id" TEXT PRIMARY KEY,
    "saleId" TEXT NOT NULL REFERENCES "Sale"("id") ON DELETE CASCADE,
    "name" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "unitPrice" DOUBLE PRECISION NOT NULL,
    "total" DOUBLE PRECISION NOT NULL
);

CREATE TABLE IF NOT EXISTS "ScheduledMessage" (
    "id" TEXT PRIMARY KEY,
    "workspaceId" TEXT NOT NULL REFERENCES "Workspace"("id") ON DELETE CASCADE,
    "conversationId" TEXT NOT NULL REFERENCES "Conversation"("id") ON DELETE CASCADE,
    "channelId" TEXT NOT NULL REFERENCES "Channel"("id") ON DELETE CASCADE,
    "agentId" TEXT NOT NULL REFERENCES "User"("id") ON DELETE CASCADE,
    "type" TEXT NOT NULL DEFAULT 'TEXT',
    "content" JSONB NOT NULL,
    "scheduledAt" TIMESTAMP(3) NOT NULL,
    "status" "ScheduledStatus" NOT NULL DEFAULT 'PENDING',
    "sentAt" TIMESTAMP(3),
    "errorMessage" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 7. Sessões, Conversões e Auditoria
CREATE TABLE IF NOT EXISTS "ConversationSession" (
    "id" TEXT PRIMARY KEY,
    "conversationId" TEXT NOT NULL REFERENCES "Conversation"("id") ON DELETE CASCADE,
    "agentId" TEXT NOT NULL REFERENCES "User"("id"),
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endedAt" TIMESTAMP(3),
    "endReason" "SessionEndReason",
    "durationMinutes" INTEGER,
    "messagesSent" INTEGER NOT NULL DEFAULT 0,
    "messagesReceived" INTEGER NOT NULL DEFAULT 0,
    "firstResponseAt" TIMESTAMP(3),
    "firstResponseMinutes" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "ConversationConversion" (
    "id" TEXT PRIMARY KEY,
    "conversationId" TEXT NOT NULL UNIQUE REFERENCES "Conversation"("id") ON DELETE CASCADE,
    "workspaceId" TEXT NOT NULL REFERENCES "Workspace"("id") ON DELETE CASCADE,
    "primaryAgentId" TEXT,
    "allAgentIds" TEXT[],
    "value" DOUBLE PRECISION,
    "convertedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "convertedById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "ConversationTransfer" (
    "id" TEXT PRIMARY KEY,
    "conversationId" TEXT NOT NULL REFERENCES "Conversation"("id") ON DELETE CASCADE,
    "fromSectorId" TEXT REFERENCES "Sector"("id"),
    "toSectorId" TEXT NOT NULL REFERENCES "Sector"("id"),
    "fromAgentId" TEXT REFERENCES "User"("id"),
    "toAgentId" TEXT REFERENCES "User"("id"),
    "reason" TEXT,
    "note" TEXT,
    "transferredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "MediaUpload" (
    "id" TEXT PRIMARY KEY,
    "workspaceId" TEXT NOT NULL REFERENCES "Workspace"("id") ON DELETE CASCADE,
    "uploadedBy" TEXT NOT NULL REFERENCES "User"("id"),
    "url" TEXT NOT NULL,
    "filename" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "size" INTEGER NOT NULL,
    "mediaType" TEXT NOT NULL,
    "isPtt" BOOLEAN NOT NULL DEFAULT false,
    "duration" INTEGER,
    "waveform" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "AuditLog" (
    "id" TEXT PRIMARY KEY,
    "workspaceId" TEXT REFERENCES "Workspace"("id") ON DELETE CASCADE,
    "userId" TEXT REFERENCES "User"("id"),
    "actionType" TEXT NOT NULL,
    "entityType" TEXT,
    "entityId" TEXT,
    "target" TEXT,
    "metadata" JSONB,
    "ip" TEXT,
    "oldValue" JSONB,
    "newValue" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 8. Fluxos (Chatbot)
CREATE TABLE IF NOT EXISTS "Flow" (
    "id" TEXT PRIMARY KEY,
    "name" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL REFERENCES "Workspace"("id") ON DELETE CASCADE,
    "nodes" JSONB NOT NULL,
    "edges" JSONB NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 9. Índices Extras
CREATE INDEX IF NOT EXISTS "Subscription_workspaceId_idx" ON "Subscription"("workspaceId");
CREATE INDEX IF NOT EXISTS "Sector_workspaceId_isActive_idx" ON "Sector"("workspaceId", "isActive");
CREATE INDEX IF NOT EXISTS "AuditLog_workspaceId_createdAt_idx" ON "AuditLog"("workspaceId", "createdAt");
CREATE INDEX IF NOT EXISTS "WorkspaceUsage_workspaceId_year_month_idx" ON "WorkspaceUsage"("workspaceId", "year", "month");
CREATE INDEX IF NOT EXISTS "SectorMember_userId_idx" ON "SectorMember"("userId");
CREATE INDEX IF NOT EXISTS "Deal_columnId_idx" ON "Deal"("columnId");
CREATE INDEX IF NOT EXISTS "ScheduledMessage_status_idx" ON "ScheduledMessage"("status");
```

---

## 2. Fix Total: Login e Estrutura (RODE ESTE SE O LOGIN FALHAR)
Identifiquei que o erro 500 (Internal Server Error) no login acontece por falta de registros de planos e vínculos no banco. Este comando limpa e recria a estrutura básica necessária para o Admin funcionar.

**Copie e rode este comando no SQL Editor da Supabase:**

```sql
-- 1. Garantir que os Planos básicos existem
INSERT INTO "Plan" ("id", "name", "slug", "description", "priceMonthly", "priceYearly", "trialDays", "maxAgents", "maxChannels", "maxConversationsPerMonth", "maxSectors", "maxCampaigns", "hasKanban", "hasReports", "hasChatbot", "createdAt", "updatedAt")
VALUES 
('plan-starter-id', 'Starter', 'starter', 'Plano inicial', 97, 890, 7, 3, 2, 1000, 3, 5, true, true, true, NOW(), NOW()),
('plan-free-id', 'Free', 'FREE', 'Plano Grátis', 0, 0, 0, 1, 1, 100, 1, 0, false, true, false, NOW(), NOW())
ON CONFLICT ("slug") DO UPDATE SET "name" = EXCLUDED.name, "updatedAt" = NOW();

-- 2. Criar ou Atualizar Usuário Admin (Senha: admin)
INSERT INTO "User" ("id", "email", "password", "name", "status", "createdAt", "updatedAt")
VALUES (
  'admin-user-id', 
  'admin@northway.com', 
  '$2b$10$v/ofRg5Vx2drCXFxFKcwdOa7.0N4lEdFsbqc6q7bilBznkqP4UXWS', -- Senha: admin
  'Super Admin', 
  'ONLINE',
  NOW(), 
  NOW()
) ON CONFLICT ("email") DO UPDATE SET "name" = 'Super Admin', "updatedAt" = NOW();

-- 3. Criar Workspace com o campo 'plan' obrigatório
INSERT INTO "Workspace" ("id", "name", "plan", "createdAt", "updatedAt")
VALUES (
  'main-workspace-id', 
  'NorthWay Admin', 
  'starter',
  NOW(), 
  NOW()
) ON CONFLICT ("id") DO UPDATE SET "plan" = 'starter', "updatedAt" = NOW();

-- 4. Vincular o usuário ao Workspace como ADMIN (Usa busca dinâmica por e-mail)
INSERT INTO "WorkspaceUser" ("id", "userId", "workspaceId", "role")
SELECT 'link-admin-id', id, 'main-workspace-id', 'ADMIN' 
FROM "User" WHERE email = 'admin@northway.com'
ON CONFLICT ("userId", "workspaceId") DO NOTHING;

-- 5. Criar Assinatura (Usa ID do Plano Starter)
INSERT INTO "Subscription" ("id", "workspaceId", "planId", "status", "createdAt", "updatedAt")
SELECT 'sub-admin-id', 'main-workspace-id', id, 'ACTIVE', NOW(), NOW()
FROM "Plan" WHERE slug = 'starter'
ON CONFLICT ("workspaceId") DO NOTHING;

-- 6. Criar Configurações de Performance
INSERT INTO "WorkspacePerformanceConfig" ("id", "workspaceId", "saleAttribution", "timeCalculation", "createdAt", "updatedAt")
VALUES (
  'perf-admin-id',
  'main-workspace-id',
  'LAST_AGENT',
  'ACTIVE_ONLY',
  NOW(),
  NOW()
) ON CONFLICT ("workspaceId") DO NOTHING;

-- 7. Confirmar poder de Super Admin (Usa ID real do usuário)
INSERT INTO "SuperAdmin" ("id", "userId")
SELECT 'super-admin-id', id 
FROM "User" WHERE email = 'admin@northway.com'
ON CONFLICT ("userId") DO NOTHING;
```

---

## Troubleshooting (Se não logar)
Se mesmo após rodar o SQL acima o erro persistir:
1. Revise se o script da **Seção 1** (criação de tabelas) foi executado com sucesso e sem erros.
2. Certifique-se de usar `admin@northway.com` e a senha `admin`.
3. Verifique se a URL acessada é `https://tres-go.vercel.app/login`.
