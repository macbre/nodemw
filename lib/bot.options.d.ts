export interface BotOptions {
    server: string;
    protocol?: string;
    port?: number;
    path?: string;
    proxy?: string;
    userAgent?: string;
    concurrency?: number;
    debug?: boolean;
}