import { Controller, Post, Body, UseGuards, Request, Get, Patch } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthGuard } from '@nestjs/passport';

@Controller('auth')
export class AuthController {
    constructor(private authService: AuthService) { }

    @Post('login')
    async login(@Body() req) {
        // Fix: req contains { email, password }, we must validate and get full user object first
        const validUser = await this.authService.validateUser(req.email, req.password);
        if (!validUser) {
            throw new Error("Invalid credentials"); // Or HttpException
        }
        return this.authService.login(validUser);
    }

    @Post('register')
    async register(@Body() registerDto: any) {
        return this.authService.register(registerDto);
    }

    @UseGuards(AuthGuard('jwt'))
    @Get('profile')
    async getProfile(@Request() req) {
        return this.authService.getUserProfile(req.user.sub);
    }

    @UseGuards(AuthGuard('jwt'))
    @Patch('profile/status')
    updateStatus(@Request() req, @Body('status') status: string) {
        return this.authService.updateStatus(req.user.sub, status);
    }
}
