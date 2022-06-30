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

export declare interface PageEditedResult {
    result: string;
    pageid: number;
    title: string;
    contentmodel: string;
    oldrevid: number;
    newrevid: number;
    newtimestamp: string;
}

export declare interface UserInfo {
    userid: number;
    name: string;
    editcount: number;
    registration: string;
    groups: string[];
    implicitgroups: string[];
    rights: string[];
    emailable: string;
    gender: string;
}
