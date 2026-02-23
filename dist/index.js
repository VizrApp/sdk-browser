"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getOwnPropSymbols = Object.getOwnPropertySymbols;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __propIsEnum = Object.prototype.propertyIsEnumerable;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __spreadValues = (a, b) => {
  for (var prop in b || (b = {}))
    if (__hasOwnProp.call(b, prop))
      __defNormalProp(a, prop, b[prop]);
  if (__getOwnPropSymbols)
    for (var prop of __getOwnPropSymbols(b)) {
      if (__propIsEnum.call(b, prop))
        __defNormalProp(a, prop, b[prop]);
    }
  return a;
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/index.ts
var index_exports = {};
__export(index_exports, {
  VizrClient: () => VizrClient,
  default: () => index_default,
  identify: () => identify,
  init: () => init,
  page: () => page,
  reset: () => reset,
  track: () => track
});
module.exports = __toCommonJS(index_exports);
var VizrClient = class {
  constructor(config) {
    this.queue = [];
    this.initialized = false;
    this.config = __spreadValues({
      host: "https://vizr.app",
      debug: false,
      autoPageview: true,
      sessionTimeout: 30
    }, config);
  }
  log(...args) {
    if (this.config.debug) console.log("[Vizr]", ...args);
  }
  getAnonymousId() {
    const key = "__vzr_anon";
    let id = localStorage.getItem(key);
    if (!id) {
      id = "anon_" + Math.random().toString(36).slice(2) + Date.now().toString(36);
      localStorage.setItem(key, id);
    }
    return id;
  }
  getSessionId() {
    var _a;
    const key = "__vzr_sess";
    const tsKey = "__vzr_sess_ts";
    const now = Date.now();
    const existing = sessionStorage.getItem(key);
    const lastTs = parseInt((_a = sessionStorage.getItem(tsKey)) != null ? _a : "0", 10);
    if (existing && now - lastTs < this.config.sessionTimeout * 60 * 1e3) {
      sessionStorage.setItem(tsKey, String(now));
      return existing;
    }
    const id = "sess_" + Math.random().toString(36).slice(2) + now.toString(36);
    sessionStorage.setItem(key, id);
    sessionStorage.setItem(tsKey, String(now));
    return id;
  }
  getUserId() {
    return localStorage.getItem("__vzr_uid");
  }
  async send(payload) {
    const body = JSON.stringify(__spreadValues({
      site_id: this.config.siteId,
      anonymous_id: this.getAnonymousId(),
      session_id: this.getSessionId(),
      user_id: this.getUserId(),
      url: window.location.href,
      referrer: document.referrer || void 0,
      user_agent: navigator.userAgent,
      received_at: (/* @__PURE__ */ new Date()).toISOString()
    }, payload));
    const url = `${this.config.host}/api/v1/ingest`;
    this.log("track", payload);
    try {
      if (navigator.sendBeacon) {
        const blob = new Blob([body], { type: "application/json" });
        if (navigator.sendBeacon(url, blob)) return;
      }
      await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body,
        keepalive: true
      });
    } catch (err) {
      this.log("send error", err);
    }
  }
  /**
   * Track a custom event.
   * @example vizr.track('upgrade_clicked', { plan: 'pro', source: 'header' })
   */
  track(eventName, properties = {}) {
    this.send({ event_name: eventName, properties });
  }
  /**
   * Identify the current user.
   * @example vizr.identify('user_123', { name: 'Emma Wilson', email: 'emma@example.com', plan: 'pro' })
   */
  identify(userId, traits = {}) {
    localStorage.setItem("__vzr_uid", String(userId));
    this.send({ event_name: "$identify", user_id: String(userId), properties: traits });
  }
  /**
   * Track a page view. Called automatically on init and SPA navigation.
   * @example vizr.page({ section: 'pricing' })
   */
  page(properties = {}) {
    this.send({
      event_name: "$page_viewed",
      properties: __spreadValues({
        path: window.location.pathname,
        title: document.title,
        search: window.location.search || void 0,
        hash: window.location.hash || void 0
      }, properties)
    });
  }
  /**
   * Clear the current user and session (e.g. on logout).
   */
  reset() {
    localStorage.removeItem("__vzr_uid");
    localStorage.removeItem("__vzr_anon");
    sessionStorage.removeItem("__vzr_sess");
    sessionStorage.removeItem("__vzr_sess_ts");
    this.log("reset");
  }
  /** @internal */
  init() {
    if (this.initialized) return;
    this.initialized = true;
    this.queue.forEach((fn) => fn());
    this.queue = [];
    if (this.config.autoPageview) {
      this.page();
      const orig = history.pushState.bind(history);
      history.pushState = (...args) => {
        orig(...args);
        this.page();
      };
      window.addEventListener("popstate", () => this.page());
    }
  }
};
var instance = null;
function init(config) {
  instance = new VizrClient(config);
  instance.init();
  return instance;
}
function track(eventName, properties) {
  instance == null ? void 0 : instance.track(eventName, properties);
}
function identify(userId, traits) {
  instance == null ? void 0 : instance.identify(userId, traits);
}
function page(properties) {
  instance == null ? void 0 : instance.page(properties);
}
function reset() {
  instance == null ? void 0 : instance.reset();
}
var index_default = { init, track, identify, page, reset };
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  VizrClient,
  identify,
  init,
  page,
  reset,
  track
});
