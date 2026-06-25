/**
 * @typedef { import('./types').ArticleSitelinksMap } ArticleSitelinksMap
 * @typedef { import('./types').ClaimsMap } ClaimsMap
 * @typedef { import('./types').ClaimEntry } ClaimEntry
 * @typedef { import('./types').DescriptionsMap } DescriptionsMap
 */
"use strict";

const Api = require("./api");

const WIKIDATA_SERVER = "www.wikidata.org";
const WIKIDATA_PATH = "/w";
const WIKIDATA_USER_AGENT = "nodemw";

/**
 * Get the object being the first key/value entry of a given object
 *
 * @param {Object} obj
 * @return {Object}
 */
function getFirstItem(obj) {
  const key = Object.keys(obj).shift();
  return obj[key];
}

/**
 * Bot public API
 */
class WikiData {
  constructor() {
    this.api = new Api({
      server: WIKIDATA_SERVER,
      protocol: "https",
      path: WIKIDATA_PATH,
      userAgent: WIKIDATA_USER_AGENT,
      debug: process.env.DEBUG === "1",
    });
  }

  /**
   * Promisified wrapper around Node.js-style callbacks from nodemw api class
   *
   * @param {Object} params
   * @param {string} method (default to GET)
   */
  async callApi(params, method) {
    return new Promise((resolve, reject) => {
      this.api.call(
        {
          ...params,
          format: "json",
        },
        (err, _info, _next, data) => {
          // console.log('callApi', err, data);
          if (err !== null) {
            reject(err);
          } else {
            resolve(data);
          }
        },
        method,
      );
    });
  }

  /**
   * @param {Object} params
   * @see https://www.wikidata.org/w/api.php?action=wbgetentities&sites=enwiki&titles=Saksun&normalize=&props=sitelinks&format=json
   * @return {Promise<{entities:Object}>}
   */
  async getEntities(params) {
    return await this.callApi({
      action: "wbgetentities",
      sites: "enwiki",
      ...params,
    });
  }

  /**
   * @param {string} article
   * @see https://www.wikidata.org/w/api.php?action=wbgetentities&sites=enwiki&titles=Saksun&normalize=&props=sitelinks&format=json
   * @return {Promise<ArticleSitelinksMap|null>}
   */
  async getArticleSitelinks(article) {
    const resp = await this.getEntities({
      titles: article,
      props: "sitelinks",
    });

    // for not existing article we're getting
    // entities: { '-1': { site: 'enwiki', title: 'FooBar39786123', missing: '' } }
    const entities = getFirstItem(resp.entities);
    return entities.sitelinks ?? null;
  }

  /**
   *
   * @param {string} article
   * @param {string} site
   * @see https://www.wikidata.org/w/api.php?action=wbgetentities&sites=enwiki&titles=Albert%20Einstein&props=claims
   * @return {Promise<ClaimsMap>}
   */
  async getArticleClaims(article, site = "enwiki") {
    const resp = await this.getEntities({
      sites: site,
      titles: article,
      props: "claims",
    });

    const entry = getFirstItem(resp.entities);
    return entry.claims ?? null;
  }

  /**
   * @param {string} article
   * @param {string} site
   * @see https://www.wikidata.org/w/api.php?action=wbgetentities&sites=enwiki&titles=Albert%20Einstein&props=descriptions&format=json
   * @return {Promise<DescriptionsMap>}
   */
  async getArticleDescriptions(article, site = "enwiki") {
    const resp = await this.getEntities({
      sites: site,
      titles: article,
      props: "descriptions",
    });

    const entry = getFirstItem(resp.entities);
    return entry.descriptions ?? null;
  }

  /**
   * @param {string} entity
   * @see https://www.wikidata.org/w/api.php?action=wbgetclaims&entity=Q928875&format=json
   * @return {Promise<ClaimsMap>}
   */
  async getEntityClaims(entity) {
    const resp = await this.callApi({
      action: "wbgetclaims",
      entity,
    });

    return resp.claims;
  }

  /**
   * @param {string} entity
   * @param {string} claim
   * @see https://www.wikidata.org/w/api.php?action=wbgetclaims&entity=Q928875&format=json
   * @return {Promise<ClaimEntry[]>}
   */
  async getEntityClaim(entity, claim) {
    const claims = await this.getEntityClaims(entity);
    return claims[claim] ?? null;
  }

  /**
   * @param {string} username
   * @param {string}  password
   * @returns {Promise<void>}
   */
  async logIn(username, password) {
    // username and password params can be omitted
    if (typeof username !== "string") {
      // use data from config
      username = this.options.username;
      password = this.options.password;
    }

    // First, we need to get a login token.
    // Fetching a token via "action=login" is deprecated. Use "action=query&meta=tokens&type=login" instead.
    const tokenResp = await this.callApi(
      { action: "query", meta: "tokens", type: "login" },
      "POST",
    );

    /**
     * token {
     *       batchcomplete: '',
     *       query: {
     *         tokens: { logintoken: 'foo-bar' }
     *       }
     *     }
     */
    const lgtoken = tokenResp?.query?.tokens?.logintoken || undefined;

    // Now, log in using a token
    const res = await this.callApi(
      { action: "login", lgname: username, lgpassword: password, lgtoken },
      "POST",
    );

    // { result: 'Success', lguserid: 2205543, lgusername: 'McBre' }
    if (res.login?.result !== "Success") {
      throw new Error(`Login failed: ${res.login?.result}`);
    }

    return res.login;
  }
}

module.exports = WikiData;
