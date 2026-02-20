import { Injectable } from '@nestjs/common';

@Injectable()
export class QueueService {
    // Placeholder for Bull/Redis queue logic
    async add(jobName: string, data: any) {
        console.log(`Adding job ${jobName} to queue`, data);
        return { id: Date.now() };
    }
}
