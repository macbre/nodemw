/**
 * This file brings type hinting for bot.js file.
 * While this package is not written in TypeScript, this file will allow your IDE to provide you with auto-completion.
 *
 * @see https://www.typescriptlang.org/docs/handbook/declaration-files/templates/module-d-ts.html
 */
import {
  // code API types
  BotOptions,
  NodeJSCallback,
  NodeJSCallbackDouble,

  // responses typing
  ArticleInfo,
  ArticleProperties,
  PageEditedResult,
  PageInCategory,
  RedirectInfo,
  SearchResult,
  SiteInfo,
  SiteStatistics,
  UserContribution,
  UserInfo,
  WikiaUserInfo,
  WikiaWikiVariables,
} from "./types";

declare interface Wikia {
  // TODO: add proper types
  call(path: any, params: any, callback: NodeJSCallback<any>): void;
  getWikiVariables(callback: NodeJSCallback<WikiaWikiVariables>): void;
  getUser(ids: any, callback: NodeJSCallback<WikiaUserInfo>): void;
  getUsers(ids: any, callback: NodeJSCallback<WikiaUserInfo[]>): void;
}

declare class Bot {
  constructor(params: string | BotOptions);

  getConfig(key: any, def: any): void;
  log(...args: any[]): void;
  error(): void;

  append(
    title: string,
    content: string,
    summary: string,
    callback: NodeJSCallback<PageEditedResult>,
  ): void;
  doEdit(
    action: string,
    title: string,
    summary: string,
    params: Object,
    callback: NodeJSCallback<PageEditedResult>,
  ): void;
  edit(
    title: string,
    content: string,
    summary: string,
    callback: NodeJSCallback<PageEditedResult>,
  ): void;
  edit(
    title: string,
    content: string,
    summary: string,
    minor: boolean,
    callback: NodeJSCallback<PageEditedResult>,
  ): void;
  getArticle(article: string, callback: NodeJSCallback<string>): void;
  getArticle(
    article: string,
    followRedirect: boolean,
    callback: NodeJSCallbackDouble<string, RedirectInfo>,
  ): void;
  getArticleInfo(
    title: any,
    options: any,
    callback: NodeJSCallback<ArticleInfo[]>,
  ): void;
  getArticleProperties(
    title: string,
    callback: NodeJSCallback<ArticleProperties>,
  ): void;
  getMediaWikiVersion(callback: NodeJSCallback<string>): void;
  getPagesInCategory(
    category: string,
    callback: NodeJSCallback<PageInCategory[]>,
  ): void;
  getSiteInfo(props: string[], callback: NodeJSCallback<SiteInfo>): void;
  getSiteStats(callback: NodeJSCallback<SiteStatistics>): void;
  getUserContribs(
    options: { user: string },
    callback: NodeJSCallback<UserContribution[]>,
  ): void;
  logIn(callback: NodeJSCallback<any>): void;
  logIn(
    username: string,
    password: string,
    callback: NodeJSCallback<any>,
  ): void;
  prepend(
    title: string,
    content: string,
    summary: string,
    callback: NodeJSCallback<PageEditedResult>,
  ): void;
  search(keyword: string, callback: NodeJSCallback<SearchResult[]>): void;
  whois(username: string, callback: NodeJSCallback<UserInfo>): void;

  // TODO: add proper types for the rest of the methods
  // egrep '^\t[a-z]' bot.js  | sed 's/{/: void;/g' | sed 's/,/: any,/g' | sed 's/ )/: any )/g'
  addFlowTopic(
    title: any,
    subject: any,
    content: any,
    callback: NodeJSCallback<any>,
  ): void;
  createAccount(
    username: any,
    password: any,
    callback: NodeJSCallback<any>,
  ): void;
  diff(prev: any, current: any): void;
  expandTemplates(text: any, title: any, callback: NodeJSCallback<any>): void;
  fetchUrl(url: any, callback: NodeJSCallback<any>, encoding: any): void;
  getAll(params: any, key: any, callback: NodeJSCallback<any>): void;
  getAllPages(callback: NodeJSCallback<any>): void;
  getArticleCategories(title: any, callback: NodeJSCallback<any>): void;
  getArticleRevisions(title: any, callback: NodeJSCallback<any>): void;
  getBacklinks(title: any, callback: NodeJSCallback<any>): void;
  getCategories(prefix: any, callback: NodeJSCallback<any>): void;
  getExternalLinks(title: any, callback: NodeJSCallback<any>): void;
  getImageInfo(filename: any, callback: NodeJSCallback<any>): void;
  getImageUsage(filename: any, callback: NodeJSCallback<any>): void;
  getImages(start: any, callback: NodeJSCallback<any>): void;
  getImagesFromArticle(title: any, callback: NodeJSCallback<any>): void;
  getImagesFromArticleWithOptions(
    title: any,
    options: any,
    callback: NodeJSCallback<any>,
  ): void;
  getLog(type: any, start: any, callback: NodeJSCallback<any>): void;
  getPagesByPrefix(prefix: any, callback: NodeJSCallback<any>): void;
  getPagesInNamespace(namespace: any, callback: NodeJSCallback<any>): void;
  getPagesTranscluding(template: any, callback: NodeJSCallback<any>): void;
  getQueryPage(queryPage: any, callback: NodeJSCallback<any>): void;
  getRand(): void;
  getRecentChanges(start: any, callback: NodeJSCallback<any>): void;
  getTemplateParamFromXml(tmplXml: any, paramName: any): void;
  getToken(title: any, action: any, callback: NodeJSCallback<any>): void;
  getUsers(data: any, callback: NodeJSCallback<any>): void;
  move(from: any, to: any, summary: any, callback: NodeJSCallback<any>): void;
  parse(text: any, title: any, callback: NodeJSCallback<any>): void;
  protect(
    title: any,
    protections: any,
    options: any,
    callback: NodeJSCallback<any>,
  ): void;
  purge(titles: any, callback: NodeJSCallback<any>): void;
  sendEmail(
    username: any,
    subject: any,
    text: any,
    callback: NodeJSCallback<any>,
  ): void;
  setConfig(key: any, val: any): void;
  upload(
    filename: any,
    content: any,
    extraParams: any,
    callback: NodeJSCallback<any>,
  ): void;
  uploadByUrl(
    filename: any,
    url: any,
    summary: any,
    callback: NodeJSCallback<any>,
  ): void;
  uploadVideo(fileName: any, url: any, callback: NodeJSCallback<any>): void;
  whoami(callback: NodeJSCallback<any>): void;
  whoare(usernames: any, callback: NodeJSCallback<any>): void;
  logData(obj: any): void;

  wikia: Wikia;
}

export = Bot;
