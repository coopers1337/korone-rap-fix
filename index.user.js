// ==UserScript==
// @name         Korone.zip Inventory RAP Fix
// @namespace    korone-rap-fix
// @version      1.1
// @match        https://*.pekora.zip/users/*/profile
// @match        https://*.korone.zip/users/*/profile
// @description  Replaces "..." with real inventory RAP
// @run-at       document-idle
// @icon         https://files.catbox.moe/cyolc9.png
// @author       cooper (coollarper45)
// @grant        none
// ==/UserScript==

(function () {
  "use strict";

  const API_BASE = "https://www.pekora.zip/apisite/users/v1/users/";
  let lastUserId = null;
  let inflight = null;

  function getUserId() {
    const m = location.pathname.match(/\/users\/(\d+)\/profile/);
    return m ? m[1] : null;
  }

  function getProfileRoot() {
    return document.querySelector("main") || document.body;
  }

  function getRAPNode(root) {
    for (const li of root.querySelectorAll("li")) {
      const h = li.querySelector("div");
      if (h && h.textContent.trim() === "RAP") return li.querySelector("h3");
    }
    return null;
  }

  function parseShownNumber(text) {
    const n = Number(String(text).replace(/[^\d]/g, ""));
    return Number.isFinite(n) ? n : null;
  }

  async function fetchRAP(id) {
    const r = await fetch(API_BASE + id, { credentials: "include" });
    if (!r.ok) return null;
    const j = await r.json();
    return typeof j.inventoryRap === "number" ? j.inventoryRap : null;
  }

  async function apply() {
    const id = getUserId();
    if (!id) return;

    const root = getProfileRoot();
    const el = getRAPNode(root);
    if (!el) return;

    if (lastUserId !== id) {
      lastUserId = id;
      inflight = null;
    }

    if (inflight) return;

    inflight = (async () => {
      const rap = await fetchRAP(id);
      if (rap == null) return;

      const shown = parseShownNumber(el.textContent);
      if (shown !== rap) el.textContent = rap.toLocaleString();
    })().finally(() => {
      inflight = null;
    });
  }

  apply();
  new MutationObserver(apply).observe(document.body, { childList: true, subtree: true });
})();
