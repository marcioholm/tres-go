
import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './src/auth/auth.service';
import { UsersService } from './src/users/users.service';
import { WorkspacesService } from './src/workspaces/workspaces.service';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from './src/prisma/prisma.service';
import * as bcrypt from 'bcrypt';

// Mock Services
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

    const module: TestingModule = await Test.createTestingModule({
        providers: [
            AuthService,
            { provide: UsersService, useValue: mockUsersService },
            { provide: WorkspacesService, useValue: mockWorkspacesService },
            { provide: JwtService, useValue: mockJwtService },
            { provide: PrismaService, useValue: mockPrismaService },
        ],
    }).compile();

    const authService = module.get<AuthService>(AuthService);

    // Scenario 1: User with NO workspaces
    console.log("\n--- Scenario 1: User with NO workspaces ---");
    const userNoWorkspace = {
        id: "user1",
        email: "test@example.com",
        password: "hashed_password",
        workspaces: []
    };

    // Setup Mocks
    mockUsersService.findOne.mockResolvedValue(userNoWorkspace);
    // After createDefaultWorkspace, findOneById returns user WITH workspace
    mockUsersService.findOneById.mockResolvedValue({
        ...userNoWorkspace,
        workspaces: [{ id: "ws1", userId: "user1", workspaceId: "ws_default_1", role: "ADMIN" }]
    });

    // Test validateUser
    const validatedUser = await authService.validateUser("test@example.com", "password");
    // Note: bcrypt.compare needs to be mocked or we assume password match logic 
    // Actually validateUser calls bcrypt. Let's skip validateUser and test login directly with the user object validateUser WOULD return.

    console.log("Calling login with user having empty workspaces...");
    const result1 = await authService.login(userNoWorkspace);

    console.log("Result 1 User Workspaces:", JSON.stringify(result1.user.workspaces));

    // Verify calls
    console.log("createDefaultWorkspace called?", mockWorkspacesService.createDefaultWorkspace.mock.calls.length > 0);
    console.log("findOneById called?", mockUsersService.findOneById.mock.calls.length > 0);


    // Scenario 2: User WITH workspaces
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
// We can't easily run jest mocks in a standalone script without jest runner. 
// Let's make a simpler script connecting to REAL DB to test real logic.
