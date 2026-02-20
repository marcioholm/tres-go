
import { NestFactory } from '@nestjs/core';
import { AppModule } from './src/app.module';
import { AuthService } from './src/auth/auth.service';
import { UsersService } from './src/users/users.service';

async function bootstrap() {
    const app = await NestFactory.createApplicationContext(AppModule);
    const authService = app.get(AuthService);
    const usersService = app.get(UsersService);

    console.log("\n--- Debugging AuthService Login Flow ---");

    // 1. Get a specific user (or list one)
    const users = await usersService.findAll('some-ws-id'); // findAll takes workspaceId, might return empty if logic depends on it.
    // Let's just use Prisma directly or usersService.findOne if we know email.
    // Actually, let's find the user from the previous debug script output: marciogholmm@gmail.com

    const email = "marciogholmm@gmail.com";
    console.log(`Fetching user: ${email}`);

    const user = await usersService.findOne(email);
    console.log("User found via usersService.findOne:", JSON.stringify(user, null, 2));

    if (!user) {
        console.error("User not found!");
        await app.close();
        return;
    }

    // 2. Call login check
    console.log("\nSimulating login call...");
    const loginResult = await authService.login(user);

    console.log("\nLogin Result User:", JSON.stringify(loginResult.user, null, 2));

    if (!loginResult.user.workspaces || loginResult.user.workspaces.length === 0) {
        console.error("FAIL: Login returned user with NO workspaces!");
    } else {
        console.log("SUCCESS: Login returned user WITH workspaces. First ID:", loginResult.user.workspaces[0].workspaceId);
    }

    await app.close();
}

bootstrap();
