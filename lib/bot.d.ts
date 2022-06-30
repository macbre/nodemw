/**
 * This file brings type hinting for bot.js file.
 * While this package is not written in TypeScript, this file will allow your IDE to provide you with auto-completion.
 * 
 * @see https://www.typescriptlang.org/docs/handbook/declaration-files/templates/module-d-ts.html
 */
import { BotOptions, NodeJSCallback, PageEditedResult, PageInCategory, UserInfo } from './types';

declare class Bot {
    constructor(params: string | BotOptions);

    log(...args: any[]): void;

    logIn( callback: NodeJSCallback<any>): void;
    logIn( username: string, password: string, callback: NodeJSCallback<any>): void;

    append( title: string, content: string, summary: string, callback: NodeJSCallback<PageEditedResult> ): void;
    prepend( title: string, content: string, summary: string, callback: NodeJSCallback<PageEditedResult> ): void;
    edit( title: string, content: string, summary: string, minor: NodeJSCallback<PageEditedResult> ): void;
    edit( title: string, content: string, summary: string, minor: boolean, callback: NodeJSCallback<PageEditedResult> ): void;
    doEdit( action: string, title: string, summary: string, params: Object, callback: NodeJSCallback<PageEditedResult> ): void;

    getPagesInCategory( category: string, callback: NodeJSCallback<PageInCategory[]>): void;
    getMediaWikiVersion( callback: NodeJSCallback<string> ): void;
    getArticle( article: string, callback: NodeJSCallback<string> ): void;

    whois( username: string, callback: NodeJSCallback<UserInfo> ): void;
}

export = Bot
