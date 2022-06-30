/**
 * This file brings type hinting for bot.js file.
 * While this package is not written in TypeScript, this file will allow your IDE to provide you with auto-completion.
 * 
 * @see https://www.typescriptlang.org/docs/handbook/declaration-files/templates/module-d-ts.html
 */
import { BotOptions, NodeJSCallback, PageEditedResult, PageInCategory } from './types';

declare class Bot {
    constructor(params: string | BotOptions);

    log(...args: any[]): void;

    logIn( callback: NodeJSCallback<any>): void;
    logIn( username: string, password: string, callback: NodeJSCallback<any>): void;

    append( title: string, content: string, summary: string, callback: NodeJSCallback<PageEditedResult> ): void;

    getPagesInCategory( category: string, callback: NodeJSCallback<PageInCategory[]>): void;
    getMediaWikiVersion( callback: NodeJSCallback<string> ): void;
    getArticle( article: string, callback: NodeJSCallback<string> ): void;
}

export = Bot
