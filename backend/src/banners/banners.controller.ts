import {
    Controller,
    Get,
    Post,
    Patch,
    Param,
    Query,
    UseGuards,
    Request,
} from '@nestjs/common';
import { BannersService } from './banners.service';
import { JwtAuthGuard } from '../auth/jwt.strategy';
import { BannerPosition } from '@prisma/client';

@Controller('workspaces/:workspaceId/banners')
@UseGuards(JwtAuthGuard)
export class BannersController {
    constructor(private readonly bannersService: BannersService) { }

    @Get()
    getBanners(
        @Param('workspaceId') workspaceId: string,
        @Query('position') position: BannerPosition,
        @Request() req: any,
    ) {
        return this.bannersService.getAvailableBanners(workspaceId, req.user.userId, position);
    }

    @Post(':bannerId/dismiss')
    dismiss(
        @Param('bannerId') bannerId: string,
        @Request() req: any,
    ) {
        return this.bannersService.dismissBanner(bannerId, req.user.userId);
    }

    @Patch(':bannerId/view')
    trackView(@Param('bannerId') bannerId: string) {
        return this.bannersService.trackView(bannerId);
    }

    @Patch(':bannerId/click')
    trackClick(@Param('bannerId') bannerId: string) {
        return this.bannersService.trackClick(bannerId);
    }
}
