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

  function getUserId() {
    const m = location.pathname.match(/\/users\/(\d+)\/profile/);
    return m ? m[1] : null;
  }

  function getProfileRoot() {
    return document.querySelector("main") || document.body;
  }

  async function fetchRAP(id) {
    const r = await fetch(API_BASE + id, { credentials: "include" });
    if (!r.ok) return null;
    const j = await r.json();
    return j.inventoryRap;
  }

  function getRAPNode(root) {
    for (const li of root.querySelectorAll("li")) {
      const h = li.querySelector("div");
      if (h && h.textContent.trim() === "RAP") {
        return li.querySelector("h3");
      }
    }
    return null;
  }

  async function apply() {
    const id = getUserId();
    if (!id) return;

    const root = getProfileRoot();
    const el = getRAPNode(root);
    if (!el) return;

    if (lastUserId !== id) {
      el.textContent = "...";
      lastUserId = id;
    }

    if (el.textContent !== "...") return;

    const rap = await fetchRAP(id);
    if (typeof rap !== "number") return;

    el.textContent = rap.toLocaleString();
  }

  apply();
  new MutationObserver(apply).observe(document.body, {
    childList: true,
    subtree: true
  });
})();
