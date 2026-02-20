"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const app_module_1 = require("./src/app.module");
const auth_service_1 = require("./src/auth/auth.service");
const users_service_1 = require("./src/users/users.service");
async function bootstrap() {
    const app = await core_1.NestFactory.createApplicationContext(app_module_1.AppModule);
    const authService = app.get(auth_service_1.AuthService);
    const usersService = app.get(users_service_1.UsersService);
    console.log("\n--- Debugging AuthService Login Flow ---");
    const users = await usersService.findAll('some-ws-id');
    const email = "marciogholmm@gmail.com";
    console.log(`Fetching user: ${email}`);
    const user = await usersService.findOne(email);
    console.log("User found via usersService.findOne:", JSON.stringify(user, null, 2));
    if (!user) {
        console.error("User not found!");
        await app.close();
        return;
    }
    console.log("\nSimulating login call...");
    const loginResult = await authService.login(user);
    console.log("\nLogin Result User:", JSON.stringify(loginResult.user, null, 2));
    if (!loginResult.user.workspaces || loginResult.user.workspaces.length === 0) {
        console.error("FAIL: Login returned user with NO workspaces!");
    }
    else {
        console.log("SUCCESS: Login returned user WITH workspaces. First ID:", loginResult.user.workspaces[0].workspaceId);
    }
    await app.close();
}
bootstrap();
//# sourceMappingURL=debug_auth_live.js.map