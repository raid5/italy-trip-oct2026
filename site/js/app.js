/* Core renderer. Loads window.__ITALY__ (from data.js) and dispatches the Home
   and City views to the ACTIVE DESIGN (window.DESIGNS[id]). Each design owns the
   full layout of those views; the helper pages (phrasebook, packing, credits)
   are shared and styled by each design's CSS. No build step, no network: plain
   DOM, works from file://. No favorites. */
(function () {
  var DATA = window.__ITALY__;

  if (!DATA || !DATA.cities || !DATA.cities.length) {
    document.getElementById("no-data").hidden = false;
    return;
  }

  var DESIGNS = window.DESIGNS || {};
  var DESIGN_IDS = ["poster", "fieldguide"];
  var view = document.getElementById("view");

  var CAT = {
    history: { label: "History & Landmarks", icon: "🏛" },
    art: { label: "Art & Museums", icon: "🎨" },
    culture: { label: "Culture & Squares", icon: "⛲" },
    coastal: { label: "Coast & Beaches", icon: "🏖" },
    outdoors: { label: "Outdoors & Views", icon: "🌿" },
    food: { label: "Food & Drink", icon: "🍝" },
    drink: { label: "Bars & Cafés", icon: "🍷" },
  };

  // ---------- DOM builder ----------
  function h(tag, attrs, kids) {
    var e = document.createElement(tag);
    if (attrs) Object.keys(attrs).forEach(function (k) {
      if (k === "class") e.className = attrs[k];
      else if (k === "html") e.innerHTML = attrs[k];
      else if (k === "text") e.textContent = attrs[k];
      else if (k.indexOf("on") === 0 && typeof attrs[k] === "function") e.addEventListener(k.slice(2), attrs[k]);
      else if (attrs[k] != null) e.setAttribute(k, attrs[k]);
    });
    (kids || []).forEach(function (c) {
      if (c == null || c === false) return;
      e.appendChild(typeof c === "string" ? document.createTextNode(c) : c);
    });
    return e;
  }

  // ---------- shared helpers exposed to designs ----------
  function cityBySlug(slug) {
    return DATA.cities.filter(function (c) { return c.slug === slug; })[0];
  }
  function mapHref(poi, city) {
    var q = (poi.lat != null && poi.lon != null)
      ? poi.lat + "," + poi.lon
      : poi.name + " " + city.name + " Italy";
    return "https://www.google.com/maps/search/?api=1&query=" + encodeURIComponent(q);
  }
  // Fahrenheit-only weather summary. Returns null if no weather on the city.
  function weather(w) {
    if (!w) return null;
    return {
      high: Math.round(w.avgHighF) + "°F",
      low: Math.round(w.avgLowF) + "°F",
      highNum: Math.round(w.avgHighF),
      lowNum: Math.round(w.avgLowF),
      rain: w.rainDayPct + "%",
      rainNum: w.rainDayPct,
      sea: w.seaTempF != null ? Math.round(w.seaTempF) + "°F" : null,
      seaNum: w.seaTempF != null ? Math.round(w.seaTempF) : null,
      years: w.sampleYears,
      label: w.label || "Early October",
    };
  }
  function poiAnchorId(poi) { return "poi-" + window.__cssId(poi.id); }

  var ctx = {
    data: DATA,
    h: h,
    cat: CAT,
    catLabel: function (c) { return (CAT[c] && CAT[c].label) || c; },
    catIcon: function (c) { return (CAT[c] && CAT[c].icon) || "📍"; },
    cityBySlug: cityBySlug,
    cityHref: function (slug) { return "#/city/" + slug; },
    mapHref: mapHref,
    weather: weather,
    miniMap: function (city) { return window.renderMiniMap(city); },
    cssId: window.__cssId,
    poiAnchorId: poiAnchorId,
    navigate: function (hash) { location.hash = hash; },
  };

  // ---------- shared helper-page renderers ----------
  function viewPhrases() {
    var groups = DATA.phrases.map(function (g) {
      var rows = g.items.map(function (p) {
        return h("tr", {}, [h("td", { class: "it" }, [p.it]), h("td", {}, [p.en]), h("td", { class: "say" }, [p.say])]);
      });
      return h("div", { class: "phrase-group" }, [
        h("h3", {}, [g.group]),
        h("table", { class: "phrase-table" }, [
          h("thead", {}, [h("tr", {}, [h("th", {}, ["Italian"]), h("th", {}, ["English"]), h("th", {}, ["Say it"])])]),
          h("tbody", {}, rows),
        ]),
      ]);
    });
    return h("section", { class: "page page-phrases" }, [h("div", { class: "page-wrap" }, [
      h("p", { class: "eyebrow" }, ["Parla un po' d'italiano"]),
      h("h1", {}, ["Phrasebook"]),
      h("p", { class: "lead" }, ["A handful of phrases goes a long way. Pronunciations are rough but friendly."]),
    ].concat(groups))]);
  }

  function viewPacking() {
    return h("section", { class: "page page-packing" }, [h("div", { class: "page-wrap" }, [
      h("p", { class: "eyebrow" }, ["Before you zip the bag"]),
      h("h1", {}, ["Packing list"]),
      h("p", { class: "lead" }, ["Tuned for early-October Southern Italy: warm days, cooler coastal evenings, a chance of a shower."]),
      h("ul", { class: "packing-list" }, DATA.packingList.map(function (t) { return h("li", {}, [t]); })),
    ])]);
  }

  function viewCredits() {
    var entries = [];
    DATA.cities.forEach(function (c) {
      if (c.hero) entries.push({ where: c.name + " (hero)", photo: c.hero });
      c.pois.forEach(function (p) { if (p.photo) entries.push({ where: c.name + " · " + p.name, photo: p.photo }); });
    });
    var list = h("div", { class: "credit-list" }, entries.map(function (e) {
      return h("div", { class: "credit-row" }, [
        h("strong", {}, [e.where]), document.createElement("br"),
        h("a", { href: e.photo.sourceUrl, target: "_blank", rel: "noopener" }, [e.photo.author]),
        " — ",
        e.photo.licenseUrl ? h("a", { href: e.photo.licenseUrl, target: "_blank", rel: "noopener" }, [e.photo.license]) : document.createTextNode(e.photo.license),
      ]);
    }));
    return h("section", { class: "page page-credits" }, [h("div", { class: "page-wrap" }, [
      h("p", { class: "eyebrow" }, ["With thanks"]),
      h("h1", {}, ["Photo credits & licenses"]),
      h("p", { class: "lead" }, ["Every photo is a real, openly-licensed image from Wikimedia Commons. Text is from Wikivoyage & Wikipedia under CC BY-SA."]),
      list,
    ])]);
  }

  // ---------- active design ----------
  function activeDesign() {
    var id = document.documentElement.getAttribute("data-design");
    return DESIGNS[id] || DESIGNS.poster || DESIGNS[DESIGN_IDS[0]];
  }

  // ---------- nav + router ----------
  function buildNav() {
    var nav = document.getElementById("main-nav");
    nav.innerHTML = "";
    DATA.cities.forEach(function (c) {
      nav.appendChild(h("a", { href: "#/city/" + c.slug, "data-nav": "" }, [c.name]));
    });
    nav.appendChild(h("a", { href: "#/phrases", "data-nav": "" }, ["Phrasebook"]));
    nav.appendChild(h("a", { href: "#/packing", "data-nav": "" }, ["Packing"]));
  }
  function setActive(hash) {
    document.querySelectorAll("#main-nav a").forEach(function (a) {
      a.classList.toggle("active", a.getAttribute("href") === hash);
    });
  }

  function render() {
    var hash = location.hash || "#/";
    var design = activeDesign();
    view.innerHTML = "";
    var node;
    if (hash.indexOf("#/city/") === 0) {
      var city = cityBySlug(hash.slice("#/city/".length));
      node = city ? design.renderCity(city, ctx) : design.renderHome(ctx);
    } else if (hash === "#/phrases") node = viewPhrases();
    else if (hash === "#/packing") node = viewPacking();
    else if (hash === "#/credits") node = viewCredits();
    else node = design.renderHome(ctx);
    view.appendChild(node);
    setActive(hash);
    window.scrollTo(0, 0);
  }
  window.addEventListener("hashchange", render);

  // ---------- design switch ----------
  function initDesign() {
    var saved = null;
    try { saved = localStorage.getItem("italy_design"); } catch (e) {}
    if (saved && DESIGNS[saved]) document.documentElement.setAttribute("data-design", saved);
    syncDesignButtons();
    document.querySelectorAll("[data-design-pick]").forEach(function (b) {
      b.addEventListener("click", function () {
        var d = b.getAttribute("data-design-pick");
        document.documentElement.setAttribute("data-design", d);
        try { localStorage.setItem("italy_design", d); } catch (e) {}
        syncDesignButtons();
        render();
      });
    });
  }
  function syncDesignButtons() {
    var cur = document.documentElement.getAttribute("data-design");
    document.querySelectorAll("[data-design-pick]").forEach(function (b) {
      b.classList.toggle("active", b.getAttribute("data-design-pick") === cur);
    });
  }

  // ---------- boot ----------
  buildNav();
  initDesign();
  render();
})();
