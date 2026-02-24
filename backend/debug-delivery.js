
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const workspaceId = 'cmlwejv8q000177q7hfuwe66j';

    console.log(`--- Checking Recent Messages for Workspace: ${workspaceId} ---`);
    const messages = await prisma.message.findMany({
        where: {
            conversation: { workspaceId }
        },
        take: 10,
        orderBy: { createdAt: 'desc' },
        include: {
            conversation: {
                include: {
                    channel: true,
                    contact: true
                }
            }
        }
    });

    messages.forEach(m => {
        console.log(`[${m.createdAt.toISOString()}] Msg: ${m.id} | Status: ${m.status} | Type: ${m.type} | FromAgent: ${m.fromAgent}`);
        console.log(`    Conv: ${m.conversationId} | Channel: ${m.conversation.channel.name} (${m.conversation.channel.type})`);
        console.log(`    Contact: ${m.conversation.contact.name} (${m.conversation.contact.phone || m.conversation.contact.externalId})`);
        if (m.status === 'FAILED') {
            console.log(`    FAIL DETECTED`);
        }
    });

    console.log('\n--- Checking Channel Configs ---');
    const channels = await prisma.channel.findMany({
        where: { workspaceId }
    });

    channels.forEach(c => {
        console.log(`Channel: ${c.name} (${c.type}) | ID: ${c.id}`);
        console.log(`    Status: ${c.status}`);
        console.log(`    Has AccessToken: ${!!c.accessToken}`);
        console.log(`    PhoneNumberId: ${c.phoneNumberId}`);
        console.log(`    PageId: ${c.pageId}`);
        console.log(`    IG Account ID: ${c.igAccountId}`);
    });
}

main().catch(err => {
    console.error(err);
    process.exit(1);
});
