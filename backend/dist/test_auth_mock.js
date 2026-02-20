"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const testing_1 = require("@nestjs/testing");
const auth_service_1 = require("./src/auth/auth.service");
const users_service_1 = require("./src/users/users.service");
const workspaces_service_1 = require("./src/workspaces/workspaces.service");
const jwt_1 = require("@nestjs/jwt");
const prisma_service_1 = require("./src/prisma/prisma.service");
const mockUsersService = {
    findOne: jest.fn(),
    findOneById: jest.fn(),
    update: jest.fn(),
    create: jest.fn(),
};
const mockWorkspacesService = {
    createDefaultWorkspace: jest.fn(),
};
const mockJwtService = {
    sign: jest.fn(() => 'mock_token'),
};
const mockPrismaService = {};
async function runTest() {
    console.log("Starting AuthService Test...");
    const module = await testing_1.Test.createTestingModule({
        providers: [
            auth_service_1.AuthService,
            { provide: users_service_1.UsersService, useValue: mockUsersService },
            { provide: workspaces_service_1.WorkspacesService, useValue: mockWorkspacesService },
            { provide: jwt_1.JwtService, useValue: mockJwtService },
            { provide: prisma_service_1.PrismaService, useValue: mockPrismaService },
        ],
    }).compile();
    const authService = module.get(auth_service_1.AuthService);
    console.log("\n--- Scenario 1: User with NO workspaces ---");
    const userNoWorkspace = {
        id: "user1",
        email: "test@example.com",
        password: "hashed_password",
        workspaces: []
    };
    mockUsersService.findOne.mockResolvedValue(userNoWorkspace);
    mockUsersService.findOneById.mockResolvedValue({
        ...userNoWorkspace,
        workspaces: [{ id: "ws1", userId: "user1", workspaceId: "ws_default_1", role: "ADMIN" }]
    });
    const validatedUser = await authService.validateUser("test@example.com", "password");
    console.log("Calling login with user having empty workspaces...");
    const result1 = await authService.login(userNoWorkspace);
    console.log("Result 1 User Workspaces:", JSON.stringify(result1.user.workspaces));
    console.log("createDefaultWorkspace called?", mockWorkspacesService.createDefaultWorkspace.mock.calls.length > 0);
    console.log("findOneById called?", mockUsersService.findOneById.mock.calls.length > 0);
    console.log("\n--- Scenario 2: User WITH workspaces ---");
    const userWithWorkspace = {
        id: "user2",
        email: "test2@example.com",
        workspaces: [{ id: "ws2", userId: "user2", workspaceId: "ws_real_2", role: "ADMIN" }]
    };
    mockWorkspacesService.createDefaultWorkspace.mockClear();
    mockUsersService.findOneById.mockClear();
    console.log("Calling login with user having workspaces...");
    const result2 = await authService.login(userWithWorkspace);
    console.log("Result 2 User Workspaces:", JSON.stringify(result2.user.workspaces));
    console.log("createDefaultWorkspace called?", mockWorkspacesService.createDefaultWorkspace.mock.calls.length > 0);
}
//# sourceMappingURL=test_auth_mock.js.map