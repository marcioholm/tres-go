export declare class QueueService {
    add(jobName: string, data: any): Promise<{
        id: number;
    }>;
}
