/**
 * This file brings type hinting for bot.js file.
 * While this package is not written in TypeScript, this file will allow your IDE to provide you with auto-completion.
 * 
 * @see https://www.typescriptlang.org/docs/handbook/declaration-files/templates/module-d-ts.html
 */
import { BotOptions, NodeJSCallback, PageEditedResult, PageInCategory, UserInfo } from './types';

declare interface Wikia {
    // TODO: add proper types
    call( path: any, params: any, callback: any ) : void;
    getWikiVariables( callback: any ) : void;
    getUser( ids: any, callback: any ) : void;
    getUsers( ids: any, callback: any ) : void;
}

declare class Bot {
    constructor(params: string | BotOptions);

    log(...args: any[]): void;

    append( title: string, content: string, summary: string, callback: NodeJSCallback<PageEditedResult> ): void;
    doEdit( action: string, title: string, summary: string, params: Object, callback: NodeJSCallback<PageEditedResult> ): void;
    edit( title: string, content: string, summary: string, minor: NodeJSCallback<PageEditedResult> ): void;
    edit( title: string, content: string, summary: string, minor: boolean, callback: NodeJSCallback<PageEditedResult> ): void;
    getArticle( article: string, callback: NodeJSCallback<string> ): void;
    getMediaWikiVersion( callback: NodeJSCallback<string> ): void;
    getPagesInCategory( category: string, callback: NodeJSCallback<PageInCategory[]>): void;
    logIn( callback: NodeJSCallback<any>): void;
    logIn( username: string, password: string, callback: NodeJSCallback<any>): void;
    prepend( title: string, content: string, summary: string, callback: NodeJSCallback<PageEditedResult> ): void;
    whois( username: string, callback: NodeJSCallback<UserInfo> ): void;

    // TODO: add proper types for the rest of the methods
    // egrep '^\t[a-z]' bot.js  | sed 's/{/: void;/g' | sed 's/,/: any,/g' | sed 's/ )/: any )/g'
	addFlowTopic( title: any, subject: any, content: any, callback: any ) : void;
	createAccount( username: any, password: any, callback: any ) : void;
	diff( prev: any, current: any ) : void;
	error() : void;
	expandTemplates( text: any, title: any, callback: any ) : void;
	fetchUrl( url: any, callback: any, encoding: any ) : void;
	getAll( params: any, key: any, callback: any ) : void;
	getAllPages( callback: any ) : void;
	getArticleCategories( title: any, callback: any ) : void;
	getArticleInfo( title: any, options: any, callback: any ) : void;
	getArticleRevisions( title: any, callback: any ) : void;
	getBacklinks( title: any, callback: any ) : void;
	getCategories( prefix: any, callback: any ) : void;
	getConfig( key: any, def: any ) : void;
	getExternalLinks( title: any, callback: any ) : void;
	getImageInfo( filename: any, callback: any ) : void;
	getImageUsage( filename: any, callback: any ) : void;
	getImages( start: any, callback: any ) : void;
	getImagesFromArticle( title: any, callback: any ) : void;
	getImagesFromArticleWithOptions( title: any, options: any, callback: any ) : void;
	getLog( type: any, start: any, callback: any ) : void;
	getPagesByPrefix( prefix: any, callback: any ) : void;
	getPagesInNamespace( namespace: any, callback: any ) : void;
	getPagesTranscluding( template: any, callback: any ) : void;
	getQueryPage( queryPage: any, callback: any ) : void;
	getRand() : void;
	getRecentChanges( start: any, callback: any ) : void;
	getSiteInfo( props: any, callback: any ) : void;
	getSiteStats( callback: any ) : void;
	getTemplateParamFromXml( tmplXml: any, paramName: any ) : void;
	getToken( title: any, action: any, callback: any ) : void;
	getUserContribs( options: any, callback: any ) : void;
	getUsers( data: any, callback: any ) : void;
	move( from: any, to: any, summary: any, callback: any ) : void;
	parse( text: any, title: any, callback: any ) : void;
	protect( title: any, protections: any, options: any, callback: any ) : void;
	purge( titles: any, callback: any ) : void;
	search( keyword: any, callback: any ) : void;
	sendEmail( username: any, subject: any, text: any, callback: any ) : void;
	setConfig( key: any, val: any ) : void;
	upload( filename: any, content: any, extraParams: any, callback: any ) : void;
	uploadByUrl( filename: any, url: any, summary: any, callback: any ) : void;
	uploadVideo( fileName: any, url: any, callback: any ) : void;
	whoami( callback: any ) : void;
	whoare( usernames: any, callback: any ) : void;
    logData( obj: any ) : void;

    wikia: Wikia

}

export = Bot
