/**
 * This file brings type hinting for bot.js file.
 * While this package is not written in TypeScript, this file will allow your IDE to provide you with auto-completion.
 * 
 * @see https://www.typescriptlang.org/docs/handbook/declaration-files/templates/module-d-ts.html
 */
import { BotOptions, NodeJSCallback, PageInCategory } from './types';

declare class Bot {
    constructor(params: string | BotOptions);

    log(...args: any[]): void;

    getPagesInCategory( category: string, callback: NodeJSCallback<PageInCategory[]>): void;
    getMediaWikiVersion( callback: NodeJSCallback<string> ): void;
    getArticle( article: string, callback: NodeJSCallback<string> ): void;
}

export = Bot
