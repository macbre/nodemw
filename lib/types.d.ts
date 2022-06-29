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

// Node.js style callbacks
export interface NodeJSCallback<T> {
    (err: Error | null, arg?: T): void
}

// {"pageid":5282710,"ns":0,"title":"Westfield XTR2"}
export declare interface PageInCategory {
    pageid: number;
    ns: number;
    title: string;
}
