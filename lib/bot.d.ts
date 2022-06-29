/**
 * This file brings type hinting for bot.js file.
 *
 * While this package is not written in TypeScript, this file will allow your IDE to provide you with auto-completion.
 */
declare interface BotOptions {
    server: string;
    protocol?: string;
    port?: number;
    path?: string;
    proxy?: string;
    userAgent?: string;
    concurrency?: number;
    debug?: boolean;
}

declare class BotInstance {
}

/**
 * The main entry-point to analyze a given css
 */
export function Bot (params: string | BotOptions): BotInstance;
