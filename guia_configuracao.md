# Guia de Configuração e Correção NorthWay Omni

Este guia contém as ações manuais necessárias para estabilizar o sistema e resolver os erros de envio e conexão.

## 1. Correção do Banco de Dados (Crash das Mensagens)
Como o sistema está crashando por falta de tabelas, você deve executar o SQL abaixo diretamente no seu **Dashboard da Supabase** (SQL Editor):

### SQL para Criar Tabelas Faltantes
```sql
-- CreateEnum
DO $$ BEGIN
    CREATE TYPE "SessionEndReason" AS ENUM ('RESOLVED', 'TRANSFERRED', 'REASSIGNED');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- CreateTable ConversationSession
CREATE TABLE IF NOT EXISTS "ConversationSession" (
    "id" TEXT NOT NULL,
    "conversationId" TEXT NOT NULL,
    "agentId" TEXT NOT NULL,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endedAt" TIMESTAMP(3),
    "endReason" "SessionEndReason",
    "durationMinutes" INTEGER,
    "messagesSent" INTEGER NOT NULL DEFAULT 0,
    "messagesReceived" INTEGER NOT NULL DEFAULT 0,
    "firstResponseAt" TIMESTAMP(3),
    "firstResponseMinutes" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ConversationSession_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "ConversationSession_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "Conversation"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "ConversationSession_agentId_fkey" FOREIGN KEY ("agentId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable ConversationConversion
CREATE TABLE IF NOT EXISTS "ConversationConversion" (
    "id" TEXT NOT NULL,
    "conversationId" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "primaryAgentId" TEXT,
    "allAgentIds" TEXT[],
    "value" DOUBLE PRECISION,
    "convertedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "convertedById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ConversationConversion_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "ConversationConversion_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "Conversation"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "ConversationConversion_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE INDEX IF NOT EXISTS "ConversationSession_agentId_idx" ON "ConversationSession"("agentId");
CREATE INDEX IF NOT EXISTS "ConversationSession_conversationId_idx" ON "ConversationSession"("conversationId");
CREATE UNIQUE INDEX IF NOT EXISTS "ConversationConversion_conversationId_key" ON "ConversationConversion"("conversationId");
```

---

## 2. Meta API: Permissão "Advanced Access"
A falha no envio do Instagram ("Meta API Error #200") indica que o App está em modo de desenvolvimento ou sem acesso avançado.
1. Vá para o [Painel da Meta for Developers](https://developers.facebook.com/).
2. Selecione o seu App.
3. No menu lateral: **App Settings** > **Permissions and Features**.
4. Procure por `instagram_manage_messages` e clique em **Request Advanced Access**.
5. Faça o mesmo para `pages_manage_metadata` e `pages_messaging`.

---

## 3. Acesso Super Admin (Aumentar Limite de Canais)
Para se tornar Super Admin e aumentar os limites do seu workspace:
1. No SQL Editor da Supabase, execute (substitua pelo seu e-mail):
```sql
INSERT INTO "SuperAdmin" ("id", "userId")
SELECT gen_random_uuid()::text, id FROM "User" WHERE email = 'SEU_EMAIL_AQUI'
ON CONFLICT ("userId") DO NOTHING;
```
2. Após isso, acesse a URL: `https://seu-dominio.com/super-admin`
3. Vá em **Workspaces** ou **Plans** e aumente o limite de canais.

---

## 4. WhatsApp Z-API
O código do sistema foi atualizado para garantir que, ao salvar a conexão Z-API, a tela mude corretamente para "Sucesso". Basta recarregar a aplicação após o próximo deploy.
