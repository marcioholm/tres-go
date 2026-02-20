import { UploadsService } from './uploads.service';
export declare class UploadsController {
    private readonly uploadsService;
    constructor(uploadsService: UploadsService);
    uploadFile(file: Express.Multer.File, workspaceId?: string, uploadedBy?: string, isPtt?: string): Promise<import("./uploads.service").MediaUploadResult | {
        url: string;
        filename: string;
        originalname: string;
    }>;
}
