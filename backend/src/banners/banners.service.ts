import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { BannerPosition } from '@prisma/client';
import { subDays } from 'date-fns';

@Injectable()
export class BannersService {
    constructor(private prisma: PrismaService) { }

    async getAvailableBanners(workspaceId: string, userId: string, position: BannerPosition) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            include: {
                workspaces: {
                    where: { workspaceId },
                    include: { workspace: { include: { subscription: { include: { plan: true } } } } },
                },
            },
        });

        if (!user) return [];

        const workspaceUser = user.workspaces[0];
        if (!workspaceUser) return [];

        const workspace = workspaceUser.workspace;
        const planName = workspace.subscription?.plan?.name;
        const trialDays = this.getTrialDays(workspace.subscription?.trialEndsAt);

        // Fetch active banners for this position
        const activeBanners = await this.prisma.smartBanner.findMany({
            where: {
                position,
                isActive: true,
            },
            orderBy: { priority: 'desc' },
        });

        // Get dismissed banners for this user in the last 7 days
        const sevenDaysAgo = subDays(new Date(), 7);
        const dismissedBannerIds = await this.prisma.bannerDismissal.findMany({
            where: {
                userId,
                dismissedAt: { gte: sevenDaysAgo },
            },
            select: { bannerId: true },
        }).then(d => d.map(item => item.bannerId));

        const eligibleBanners = [];

        for (const banner of activeBanners) {
            if (dismissedBannerIds.includes(banner.id)) continue;

            // Filtering by niche/plan
            if (banner.targetNiche && banner.targetNiche !== user.niche) continue;
            if (banner.targetPlan && banner.targetPlan !== planName) continue;

            // Trial days filtering
            if (banner.minTrialDays !== null && (trialDays === null || trialDays < banner.minTrialDays)) continue;
            if (banner.maxTrialDays !== null && (trialDays === null || trialDays > banner.maxTrialDays)) continue;

            // Trigger Conditions Logic
            if (banner.triggerCondition) {
                const isTriggered = await this.checkTrigger(workspaceId, banner.triggerCondition);
                if (!isTriggered) continue;
            }

            eligibleBanners.push(banner);
        }

        return eligibleBanners;
    }

    async dismissBanner(bannerId: string, userId: string) {
        return this.prisma.bannerDismissal.upsert({
            where: { bannerId_userId: { bannerId, userId } },
            create: { bannerId, userId },
            update: { dismissedAt: new Date() },
        });
    }

    async trackClick(bannerId: string) {
        return this.prisma.smartBanner.update({
            where: { id: bannerId },
            data: { clicks: { increment: 1 } },
        });
    }

    async trackView(bannerId: string) {
        return this.prisma.smartBanner.update({
            where: { id: bannerId },
            data: { views: { increment: 1 } },
        });
    }

    private getTrialDays(trialEndsAt: Date | null): number | null {
        if (!trialEndsAt) return null;
        const now = new Date();
        const diffTime = trialEndsAt.getTime() - now.getTime();
        return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    }

    private async checkTrigger(workspaceId: string, trigger: string): Promise<boolean> {
        const sevenDaysAgo = subDays(new Date(), 7);

        switch (trigger) {
            case 'LOW_CONVERSATIONS': {
                const count = await this.prisma.conversation.count({
                    where: { workspaceId, createdAt: { gte: sevenDaysAgo } },
                });
                return count < 10;
            }
            case 'LOW_CONVERSION': {
                const total = await this.prisma.conversation.count({ where: { workspaceId } });
                if (total === 0) return false;
                const resolved = await this.prisma.conversation.count({
                    where: { workspaceId, status: 'RESOLVED' },
                });
                return (resolved / total) < 0.3;
            }
            case 'CHANNEL_NO_TRAFFIC': {
                const activeChannel = await this.prisma.channel.findFirst({
                    where: { workspaceId, status: 'ACTIVE' },
                });
                if (!activeChannel) return false;
                const recentConversations = await this.prisma.conversation.count({
                    where: { workspaceId, createdAt: { gte: sevenDaysAgo } },
                });
                return recentConversations === 0;
            }
            case 'NO_CHANNELS': {
                const count = await this.prisma.channel.count({ where: { workspaceId } });
                return count === 0;
            }
            default:
                return true;
        }
    }
}
