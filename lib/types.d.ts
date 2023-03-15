export interface BotOptions {
  server: string;
  protocol?: string;
  port?: number;
  path?: string;
  proxy?: string;
  userAgent?: string;
  concurrency?: number;
  debug?: boolean;
  username?: string;
  password?: string;
  domain?: string;
}

// Node.js style callbacks
export interface NodeJSCallback<T> {
  (err: Error | null, arg?: T): void;
}

export interface NodeJSCallbackDouble<T1, T2> {
  (err: Error | null, arg?: T1, arg2?: T2): void;
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

export interface SiteStatistics {
  pages: number;
  articles: number;
  edits: number;
  images: number;
  users: number;
  activeusers: number;
  admins: number;
  jobs: number;
}

export interface WikiaWikiVariables {
  vertical: string;
  appleTouchIcon: object;
  articlePath: string;
  basePath: string;
  dbName: string;
  favicon: string;
  id: number;
  isClosed: boolean;
  htmlTitle: object;
  language: object;
  scriptPath: string;
  siteName: string;
  specialRobotPolicy: object;
  surrogateKey: string;
  tracking: object;
  enableCommunityData: boolean;
  mainPageTitle: string;
  siteMessage: string;
  cookieDomain: string;
  wgPerformanceMonitoringSamplingFactor: number;
  wgPerformanceMonitoringEndpointUrl: string;
  wgPerformanceMonitoringSoftwareVersion: string;
}

export interface SiteInfoGeneral {
  mainpage: string;
  base: string;
  sitename: string;
  logo: string;
  generator: string;
  phpversion: string;
  phpsapi: string;
  dbtype: string;
  dbversion: string;
  externalimages: object;
  langconversion: string;
  linkconversion: string;
  titleconversion: string;
  linkprefixcharset: string;
  linkprefix: string;
  linktrail: string;
  legaltitlechars: string;
  invalidusernamechars: string;
  fixarabicunicode: string;
  fixmalayalamunicode: string;
  case: string;
  lang: string;
  fallback: object;
  fallback8bitEncoding: string;
  writeapi: string;
  maxarticlesize: number;
  timezone: string;
  timeoffset: number;
  articlepath: string;
  scriptpath: string;
  script: string;
  variantarticlepath: boolean;
  server: string;
  servername: string;
  wikiid: string;
  time: string;
  misermode: string;
  uploadsenabled: string;
  maxuploadsize: number;
  minuploadchunksize: number;
  galleryoptions: object;
  thumblimits: object;
  imagelimits: object;
  favicon: string;
  centralidlookupprovider: string;
  allcentralidlookupproviders: object;
  interwikimagic: string;
  magiclinks: object;
  categorycollation: string;
  anonwallpost: string;
  gamepedia: string;
  mobileserver: string;
  citeresponsivereferences: string;
}

export interface SiteInfo {
  general?: SiteInfoGeneral;
  namespaces?: object;
  dbrepllag?: object;
}

export interface WikiaUserInfo {
  user_id: number;
  title: string;
  name: string;
  url: string;
  numberofedits: number;
  is_subject_to_ccpa: boolean | null;
  avatar: string;
}

export interface RedirectInfo {
  from: string;
  to: string;
}

export interface ArticleInfo {
  pageid: number;
  ns: number;
  title: string;
  contentmodel: string;
  pagelanguage: string;
  pagelanguagehtmlcode: string;
  pagelanguagedir: string;
  touched: string;
  lastrevid: number;
  length: number;
  protection: string[];
  restrictiontypes: string[];
  notificationtimestamp: string;
  associatedpage: string;
  fullurl: string;
  editurl: string;
  canonicalurl: string;
  preload: string;
  displaytitle: string;
  varianttitles: Map<string, string>;
}

export interface ArticleProperties {
  page_image_free: string;
  "wikibase-shortdesc": string;
  wikibase_item: string;
}

export interface UserContribution {
  userid: number;
  user: string;
  pageid: number;
  revid: number;
  parentid: number;
  ns: number;
  title: string;
  timestamp: string;
  top: string;
  comment: string;
  size: number;
}

export interface SearchResult {
  ns: number;
  title: string;
  pageid: number;
  timestamp: string;
}

// WikiData
export interface ArticleSitelinks {
  site: string;
  title: string;
  badges: string[];
}

export type ArticleSitelinksMap = {
  [wikiname: string]: ArticleSitelinks;
};

export type ClaimEntry = {
  mainsnak: {
    datavalue: {
      value: any;
    };
    datatype: string;
    snaktype: string;
  };
  type: string;
  id: string;
  rank: string;
};

export type ClaimsMap = {
  [claim: string]: ClaimEntry[];
};

export type DescriptionsMap = {
  [lang: string]: {
    language: string;
    value: string;
  };
};
