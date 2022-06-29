/**
 * This file brings type hinting for bot.js file.
 * While this package is not written in TypeScript, this file will allow your IDE to provide you with auto-completion.
 * 
 * @see https://www.typescriptlang.org/docs/handbook/declaration-files/templates/module-d-ts.html
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

// @see https://stackoverflow.com/questions/42603810/typescript-error-first-callback-typing-noimplicitany-strictnullchecks
interface Callback<T> {
    (err: undefined, result: T): void;
    (err: Error, result: undefined): void;
}

// {"pageid":5282710,"ns":0,"title":"Westfield XTR2"}
declare interface WikiPage {
    pageid: number;
    ns: number;
    title: string;
}

export class Bot {
    constructor(params: string | BotOptions);

    getPagesInCategory( category: string, callback: Callback<WikiPage>): void;
}
