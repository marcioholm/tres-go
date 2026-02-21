"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const users_service_1 = require("../users/users.service");
const jwt_1 = require("@nestjs/jwt");
const bcrypt = require("bcrypt");
const workspaces_service_1 = require("../workspaces/workspaces.service");
let AuthService = class AuthService {
    constructor(usersService, jwtService, workspacesService) {
        this.usersService = usersService;
        this.jwtService = jwtService;
        this.workspacesService = workspacesService;
    }
    async validateUser(email, pass) {
        const user = await this.usersService.findOne(email);
        if (user && (await bcrypt.compare(pass, user.password))) {
            const { password, ...result } = user;
            return result;
        }
        return null;
    }
    async updateStatus(userId, status) {
        return this.usersService.update(userId, { status });
    }
    async getUserProfile(userId) {
        let user = await this.usersService.findOneById(userId);
        if (!user.workspaces || user.workspaces.length === 0) {
            await this.workspacesService.createDefaultWorkspace(userId);
            user = await this.usersService.findOneById(userId);
        }
        return {
            ...user,
            isSuperAdmin: !!user.superAdmin
        };
    }
    async login(user) {
        const payload = { email: user.email, sub: user.id };
        let userData = user;
        if (!userData.workspaces || userData.workspaces.length === 0) {
            try {
                await this.workspacesService.createDefaultWorkspace(userData.id);
                userData = await this.usersService.findOneById(userData.id);
            }
            catch (err) {
            }
        }
        const { password, ...safeUser } = userData;
        return {
            access_token: this.jwtService.sign(payload),
            user: {
                ...safeUser,
                isSuperAdmin: !!userData.superAdmin
            }
        };
    }
    async register(registerDto) {
        const { workspaceName, taxId, ...userData } = registerDto;
        const user = await this.usersService.create(userData);
        try {
            await this.workspacesService.createDefaultWorkspace(user.id, workspaceName, taxId);
        }
        catch (err) {
            console.error("Falha ao criar workspace no registro:", err);
        }
        return this.login(user);
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [users_service_1.UsersService,
        jwt_1.JwtService,
        workspaces_service_1.WorkspacesService])
], AuthService);
//# sourceMappingURL=auth.service.js.map