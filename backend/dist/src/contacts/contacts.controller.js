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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ContactsController = void 0;
const common_1 = require("@nestjs/common");
const contacts_service_1 = require("./contacts.service");
const jwt_strategy_1 = require("../auth/jwt.strategy");
const platform_express_1 = require("@nestjs/platform-express");
let ContactsController = class ContactsController {
    constructor(contactsService) {
        this.contactsService = contactsService;
    }
    getSourcesReport(workspaceId) {
        return this.contactsService.getSourcesReport(workspaceId);
    }
    findAll(workspaceId, search, cursor, limit) {
        return this.contactsService.findAll(workspaceId, { search, cursor, limit: limit ? parseInt(limit) : 20 });
    }
    findOne(workspaceId, id) {
        return this.contactsService.findOne(workspaceId, id);
    }
    create(workspaceId, data) {
        return this.contactsService.create(workspaceId, data);
    }
    update(workspaceId, id, data, req) {
        return this.contactsService.update(workspaceId, id, data, req.user?.sub);
    }
    updateSource(workspaceId, id, data, req) {
        return this.contactsService.updateSource(workspaceId, id, data, req.user?.sub);
    }
    remove(workspaceId, id, req) {
        return this.contactsService.delete(workspaceId, id, req.user?.sub);
    }
    addTag(workspaceId, id, tagId) {
        return this.contactsService.addTag(workspaceId, id, tagId);
    }
    removeTag(workspaceId, id, tagId) {
        return this.contactsService.removeTag(workspaceId, id, tagId);
    }
    addNote(workspaceId, id, body) {
        return this.contactsService.addNote(workspaceId, id, body.userId, body.content);
    }
    importCsv(workspaceId, file) {
        return this.contactsService.importCsv(workspaceId, file);
    }
    bulkTagAction(workspaceId, data) {
        return this.contactsService.bulkTagAction(workspaceId, data);
    }
};
exports.ContactsController = ContactsController;
__decorate([
    (0, common_1.Get)('reports/sources'),
    __param(0, (0, common_1.Param)('workspaceId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], ContactsController.prototype, "getSourcesReport", null);
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Param)('workspaceId')),
    __param(1, (0, common_1.Query)('search')),
    __param(2, (0, common_1.Query)('cursor')),
    __param(3, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String]),
    __metadata("design:returntype", void 0)
], ContactsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('workspaceId')),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], ContactsController.prototype, "findOne", null);
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Param)('workspaceId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], ContactsController.prototype, "create", null);
__decorate([
    (0, common_1.Patch)(':id'),
    __param(0, (0, common_1.Param)('workspaceId')),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __param(3, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object, Object]),
    __metadata("design:returntype", void 0)
], ContactsController.prototype, "update", null);
__decorate([
    (0, common_1.Patch)(':id/source'),
    __param(0, (0, common_1.Param)('workspaceId')),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __param(3, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object, Object]),
    __metadata("design:returntype", void 0)
], ContactsController.prototype, "updateSource", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('workspaceId')),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", void 0)
], ContactsController.prototype, "remove", null);
__decorate([
    (0, common_1.Post)(':id/tags/:tagId'),
    __param(0, (0, common_1.Param)('workspaceId')),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Param)('tagId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", void 0)
], ContactsController.prototype, "addTag", null);
__decorate([
    (0, common_1.Delete)(':id/tags/:tagId'),
    __param(0, (0, common_1.Param)('workspaceId')),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Param)('tagId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", void 0)
], ContactsController.prototype, "removeTag", null);
__decorate([
    (0, common_1.Post)(':id/notes'),
    __param(0, (0, common_1.Param)('workspaceId')),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", void 0)
], ContactsController.prototype, "addNote", null);
__decorate([
    (0, common_1.Post)('import'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('file')),
    __param(0, (0, common_1.Param)('workspaceId')),
    __param(1, (0, common_1.UploadedFile)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], ContactsController.prototype, "importCsv", null);
__decorate([
    (0, common_1.Post)('bulk-tags'),
    __param(0, (0, common_1.Param)('workspaceId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], ContactsController.prototype, "bulkTagAction", null);
exports.ContactsController = ContactsController = __decorate([
    (0, common_1.Controller)('workspaces/:workspaceId/contacts'),
    (0, common_1.UseGuards)(jwt_strategy_1.JwtAuthGuard),
    __metadata("design:paramtypes", [contacts_service_1.ContactsService])
], ContactsController);
//# sourceMappingURL=contacts.controller.js.map