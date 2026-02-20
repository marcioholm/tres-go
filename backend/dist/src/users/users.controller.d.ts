import { UsersService } from './users.service';
export declare class UsersController {
    private readonly usersService;
    constructor(usersService: UsersService);
    findAll(workspaceId: string): Promise<{
        id: string;
        email: string;
        name: string;
    }[]>;
}
