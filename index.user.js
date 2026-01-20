// ==UserScript==
// @name         Korone.zip Inventory RAP Fix
// @namespace    korone-rap-fix
// @version      1.0
// @match        https://www.pekora.zip/users/*/profile
// @description  Replaces "..." with real inventory RAP
// @run-at       document-idle
// @icon         https://files.catbox.moe/cyolc9.png
// @grant        none
// ==/UserScript==

(function () {
  "use strict";

  const API_BASE = "https://www.pekora.zip/apisite/users/v1/users/";

  function getUserId() {
    const m = location.pathname.match(/\/users\/(\d+)\/profile/);
    return m ? m[1] : null;
  }

  async function fetchRAP(id) {
    const r = await fetch(API_BASE + id, { credentials: "include" });
    if (!r.ok) return null;
    const j = await r.json();
    return j.inventoryRap;
  }

  function getRAPNode() {
    for (const li of document.querySelectorAll("li")) {
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

    const el = getRAPNode();
    if (!el || el.dataset.done) return;

    const rap = await fetchRAP(id);
    if (typeof rap !== "number") return;

    el.textContent = rap.toLocaleString();
    el.dataset.done = "1";
  }

  apply();
  new MutationObserver(apply).observe(document.body, {
    childList: true,
    subtree: true
  });
})();
