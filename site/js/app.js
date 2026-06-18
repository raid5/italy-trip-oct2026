/* Core renderer. Loads window.__ITALY__ (from data.js) and dispatches the Home
   and City views to the ACTIVE DESIGN (window.DESIGNS[id]). Each design owns the
   full layout of those views; the shared credits page is styled by each
   design's CSS. No build step, no network: plain
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

  // ---------- itineraries (hand-authored, WIP) ----------
  // Optional draft routes through the cities, leaning toward long coastal
  // stretches and food-town stays. Nights are deliberately loose first drafts —
  // these are starting points to react to, not fixed plans. Each stop is a city
  // slug from the data; unknown slugs are skipped gracefully at render time.
  var ITINERARIES = [
    {
      id: "grand-south",
      name: "The Grand Southern Tour",
      tag: "Classic overland route",
      blurb: "The headline run: a couple of days in Rome, then straight down into the Bay of Naples and along the Amalfi Coast. Ancient streets, long seafront lunches, and a fresh stretch of coastline every few days.",
      stops: [
        { slug: "rome", nights: 2 },
        { slug: "naples", nights: 2 },
        { slug: "sorrento", nights: 3 },
        { slug: "positano", nights: 2 },
        { slug: "amalfi", nights: 1 },
        { slug: "capri", nights: 2 },
      ],
    },
    {
      id: "amalfi-slow",
      name: "Amalfi Coast, Slowly",
      tag: "Coastal & unhurried",
      blurb: "No rushing. Four bases strung along the most dramatic coastline in Italy, with enough time in each to find the good swimming coves, the unmarked trattorias, and a favourite spot for the evening passeggiata.",
      stops: [
        { slug: "sorrento", nights: 3 },
        { slug: "positano", nights: 3 },
        { slug: "amalfi", nights: 2 },
        { slug: "capri", nights: 2 },
      ],
    },
    {
      id: "deep-south",
      name: "Calabria & Sicily: The Deep South",
      tag: "Off the beaten track",
      blurb: "The toe of the boot and across to Sicily — turquoise water, fishing-village seafood, and the looming presence of Etna. Quieter, cheaper, and more local than the Amalfi circuit.",
      stops: [
        { slug: "tropea", nights: 3 },
        { slug: "scilla", nights: 2 },
        { slug: "bagnara", nights: 1 },
        { slug: "catania", nights: 3 },
      ],
    },
    {
      id: "sardinia",
      name: "Sardinia: Sea & Stone",
      tag: "Island beaches & culture",
      blurb: "An island of its own. Caribbean-clear beaches around Villasimius, the lived-in capital at Cagliari, and Catalan-flavoured Alghero in the northwest — with some of the best seafood and pecorino anywhere.",
      stops: [
        { slug: "cagliari", nights: 3 },
        { slug: "villasimius", nights: 3 },
        { slug: "alghero", nights: 3 },
      ],
    },
    {
      id: "islands-bay",
      name: "Islands of the Bay",
      tag: "Island-hopping",
      blurb: "A tighter loop built around the Bay of Naples islands: gritty, brilliant Naples for the food, pastel Procida, and glamorous Capri, with Sorrento as a mainland base. Lots of ferries, lots of swimming.",
      stops: [
        { slug: "naples", nights: 2 },
        { slug: "procida", nights: 2 },
        { slug: "capri", nights: 3 },
        { slug: "sorrento", nights: 2 },
      ],
    },
  ];
  function itineraryById(id) {
    return ITINERARIES.filter(function (it) { return it.id === id; })[0];
  }
  function itineraryNights(it) {
    return it.stops.reduce(function (s, st) { return s + (st.nights || 0); }, 0);
  }

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

  // One rough, trip-wide weather estimate: min/max of the per-city October
  // averages across every stop. Deliberately approximate — weather isn't the
  // point, it's just a "pack-for-this" hint. Returns null if no city has data.
  function roughWeather() {
    var hi = [], lo = [], sea = [], rain = [], years = null;
    DATA.cities.forEach(function (c) {
      var w = weather(c.weather);
      if (!w) return;
      hi.push(w.highNum); lo.push(w.lowNum); rain.push(w.rainNum);
      if (w.seaNum != null) sea.push(w.seaNum);
      if (!years) years = w.years;
    });
    if (!hi.length) return null;
    var range = function (a) { return { lo: Math.min.apply(null, a), hi: Math.max.apply(null, a) }; };
    var avg = function (a) { return Math.round(a.reduce(function (s, n) { return s + n; }, 0) / a.length); };
    return {
      high: range(hi), low: range(lo),
      sea: sea.length ? range(sea) : null,
      rain: avg(rain), years: years,
    };
  }
  // Format a {lo,hi} range in °F, collapsing to one number when they coincide.
  function degRange(r) { return r.lo === r.hi ? r.lo + "°F" : r.lo + "–" + r.hi + "°F"; }

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
    roughWeather: roughWeather,
    degRange: degRange,
    miniMap: function (city) { return window.renderMiniMap(city); },
    cssId: window.__cssId,
    poiAnchorId: poiAnchorId,
    navigate: function (hash) { location.hash = hash; },
  };

  // ---------- shared helper-page renderers ----------
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

  // ---------- itinerary pages (shared, design-agnostic) ----------
  // Schematic route map: plot each stop by lat/lon and connect them in order.
  // No base tiles — just relative position, so it reads as "the shape of the
  // trip." Built as an SVG markup string to sidestep SVG-namespace creation.
  function routeMapSVG(stops) {
    var pts = [];
    stops.forEach(function (st, i) {
      var c = cityBySlug(st.slug);
      if (c && c.lat != null && c.lon != null) {
        pts.push({ lat: +c.lat, lon: +c.lon, name: c.name, nights: st.nights, n: i + 1 });
      }
    });
    if (!pts.length) return "";

    var lats = pts.map(function (p) { return p.lat; });
    var lons = pts.map(function (p) { return p.lon; });
    var minLat = Math.min.apply(null, lats), maxLat = Math.max.apply(null, lats);
    var minLon = Math.min.apply(null, lons), maxLon = Math.max.apply(null, lons);
    var latSpan = Math.max(maxLat - minLat, 0.5);
    var lonSpan = Math.max(maxLon - minLon, 0.5);
    // Longitude degrees compress away from the equator — correct for it so the
    // shape isn't stretched east-west.
    var lonScale = Math.cos(((minLat + maxLat) / 2) * Math.PI / 180) || 1;

    var MX = 70, MY = 32;
    var innerW = 240;
    var innerH = Math.max(70, Math.min(380, innerW * latSpan / (lonSpan * lonScale)));
    var vbW = innerW + MX * 2, vbH = innerH + MY * 2;
    function X(lon) { return MX + ((lon - minLon) / lonSpan) * innerW; }
    function Y(lat) { return MY + ((maxLat - lat) / latSpan) * innerH; }
    function esc(s) { return ("" + s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;"); }

    var line = "M " + pts.map(function (p) { return X(p.lon).toFixed(1) + " " + Y(p.lat).toFixed(1); }).join(" L ");
    var nodes = pts.map(function (p) {
      var x = X(p.lon), y = Y(p.lat);
      var right = x < vbW / 2;
      var lx = right ? x + 10 : x - 10;
      var anchor = right ? "start" : "end";
      var nightTxt = p.nights + (p.nights === 1 ? " night" : " nights");
      return (
        '<circle class="route-dot" cx="' + x.toFixed(1) + '" cy="' + y.toFixed(1) + '" r="7"/>' +
        '<text class="route-num" x="' + x.toFixed(1) + '" y="' + (y + 3).toFixed(1) + '" text-anchor="middle">' + p.n + '</text>' +
        '<text class="route-label" x="' + lx.toFixed(1) + '" y="' + (y - 1.5).toFixed(1) + '" text-anchor="' + anchor + '">' + esc(p.name) + '</text>' +
        '<text class="route-sub" x="' + lx.toFixed(1) + '" y="' + (y + 9).toFixed(1) + '" text-anchor="' + anchor + '">' + nightTxt + '</text>'
      );
    }).join("");

    return (
      '<svg class="route-map" viewBox="0 0 ' + vbW.toFixed(0) + ' ' + vbH.toFixed(0) + '" ' +
      'preserveAspectRatio="xMidYMid meet" role="img" aria-label="Schematic route map of the itinerary">' +
      '<path class="route-line" d="' + line + '"/>' + nodes + '</svg>'
    );
  }

  function viewItineraries() {
    var cards = ITINERARIES.map(function (it) {
      var routeText = it.stops.map(function (st) {
        var c = cityBySlug(st.slug); return c ? c.name : st.slug;
      }).join(" → ");
      return h("a", { class: "itin-card", href: "#/itinerary/" + it.id }, [
        h("div", { class: "itin-card-map", html: routeMapSVG(it.stops) }),
        h("div", { class: "itin-card-body" }, [
          h("p", { class: "itin-tag", text: it.tag }),
          h("h2", { class: "itin-card-name", text: it.name }),
          h("p", { class: "itin-meta", text: itineraryNights(it) + " nights · " + it.stops.length + " stops" }),
          h("p", { class: "itin-route", text: routeText }),
          h("span", { class: "itin-go", text: "View route →" }),
        ]),
      ]);
    });
    return h("section", { class: "page page-itineraries" }, [h("div", { class: "page-wrap" }, [
      h("p", { class: "eyebrow", text: "Routes · work in progress" }),
      h("h1", {}, ["Itineraries"]),
      h("p", { class: "lead", text: "A handful of optional ways to thread these cities together. These are rough first drafts — the order, the bases, and especially the number of nights are all still up for debate. Nothing here is booked." }),
      h("div", { class: "itin-grid" }, cards),
    ])]);
  }

  function viewItinerary(it) {
    var rows = it.stops.map(function (st, i) {
      var c = cityBySlug(st.slug);
      var name = c ? c.name : st.slug;
      var nightTxt = st.nights + (st.nights === 1 ? " night" : " nights");
      return h("li", { class: "itin-stop" }, [
        h("span", { class: "itin-stop-num", text: String(i + 1) }),
        h("div", { class: "itin-stop-main" }, [
          c ? h("a", { class: "itin-stop-name", href: ctx.cityHref(c.slug), text: name })
            : h("span", { class: "itin-stop-name", text: name }),
          c && c.region ? h("span", { class: "itin-stop-region", text: c.region }) : null,
        ]),
        h("span", { class: "itin-stop-nights", text: nightTxt }),
      ]);
    });
    return h("section", { class: "page page-itinerary" }, [h("div", { class: "page-wrap" }, [
      h("p", { class: "eyebrow", text: "Itinerary · work in progress" }),
      h("h1", {}, [it.name]),
      h("p", { class: "lead", text: it.blurb }),
      h("p", { class: "itin-wip", text: "⚠ Draft route — the stops, order, and nights are rough ideas to react to, not bookings." }),
      h("div", { class: "itin-detail-map", html: routeMapSVG(it.stops) }),
      h("ol", { class: "itin-stops" }, rows),
      h("p", { class: "itin-total", text: "Total: " + itineraryNights(it) + " nights across " + it.stops.length + " stops" }),
      h("p", { class: "itin-back" }, [h("a", { href: "#/itineraries", text: "← All itineraries" })]),
    ])]);
  }

  // ---------- active design ----------
  function activeDesign() {
    var id = document.documentElement.getAttribute("data-design");
    return DESIGNS[id] || DESIGNS.poster || DESIGNS[DESIGN_IDS[0]];
  }

  // ---------- nav + router ----------
  // Group cities by region, preserving the itinerary order they appear in the
  // data (region order = first appearance). Keeps a 15-city menu scannable
  // without hardcoding any region names here.
  function citiesByRegion() {
    var order = [], groups = {};
    DATA.cities.forEach(function (c) {
      var r = c.region || "Elsewhere";
      if (!groups[r]) { groups[r] = []; order.push(r); }
      groups[r].push(c);
    });
    return order.map(function (r) { return { region: r, cities: groups[r] }; });
  }

  // A self-contained dropdown (button + panel) with open/close, outside-click,
  // and Escape handling. Used for both the Destinations and Itineraries menus
  // so the header stays one tidy row no matter how long the lists get.
  function makeDropdown(opts) {
    var panelId = opts.id + "-panel";
    var panel = h("div", { class: "nav-menu-panel " + (opts.panelClass || ""), id: panelId, hidden: "hidden" }, opts.panelChildren);
    var btnKids = [h("span", { class: "nav-menu-label", id: opts.id + "-label" }, [opts.label])];
    if (opts.badge) btnKids.push(h("span", { class: "nav-menu-badge", text: opts.badge }));
    btnKids.push(h("span", { class: "nav-menu-chev", "aria-hidden": "true" }, ["▾"]));
    var btn = h("button", {
      class: "nav-menu-btn", id: opts.id + "-btn", type: "button",
      "aria-haspopup": "true", "aria-expanded": "false", "aria-controls": panelId,
    }, btnKids);
    var menu = h("div", { class: "nav-menu", id: opts.id }, [btn, panel]);

    var open = false;
    function setOpen(v) {
      open = v;
      menu.classList.toggle("open", open);
      btn.setAttribute("aria-expanded", open ? "true" : "false");
      if (open) panel.removeAttribute("hidden"); else panel.setAttribute("hidden", "hidden");
    }
    btn.addEventListener("click", function (e) { e.stopPropagation(); setOpen(!open); });
    document.addEventListener("click", function (e) { if (!menu.contains(e.target)) setOpen(false); });
    document.addEventListener("keydown", function (e) { if (e.key === "Escape") setOpen(false); });
    panel.addEventListener("click", function (e) { if (e.target.closest && e.target.closest("a")) setOpen(false); });
    return menu;
  }

  function buildNav() {
    var nav = document.getElementById("main-nav");
    nav.innerHTML = "";

    // Destinations — every city, grouped by region.
    var destPanel = citiesByRegion().map(function (g) {
      return h("div", { class: "nav-menu-group" }, [h("p", { class: "nav-menu-region" }, [g.region])]
        .concat(g.cities.map(function (c) {
          return h("a", { href: "#/city/" + c.slug, "data-nav": "" }, [c.name]);
        })));
    });
    nav.appendChild(makeDropdown({ id: "nav-dest", label: "Destinations", panelChildren: destPanel }));

    // Itineraries — optional WIP draft routes.
    var itinLinks = ITINERARIES.map(function (it) {
      return h("a", { href: "#/itinerary/" + it.id }, [
        it.name,
        h("span", { class: "nav-menu-sub", text: " · " + itineraryNights(it) + "n" }),
      ]);
    });
    itinLinks.push(h("a", { class: "nav-menu-all", href: "#/itineraries" }, ["All itineraries →"]));
    var itinPanel = [h("div", { class: "nav-menu-group" }, [
      h("p", { class: "nav-menu-region", text: "Draft routes · work in progress" }),
    ].concat(itinLinks))];
    nav.appendChild(makeDropdown({ id: "nav-itin", label: "Itineraries", badge: "WIP", panelChildren: itinPanel, panelClass: "nav-menu-panel--itin" }));
  }

  // Highlight the current entry in each menu and surface it on the button so the
  // collapsed nav still tells you where you are.
  function setActive(hash) {
    var destLabel = document.getElementById("nav-dest-label");
    var city = null;
    document.querySelectorAll("#nav-dest-panel a").forEach(function (a) {
      var on = a.getAttribute("href") === hash;
      a.classList.toggle("active", on);
      if (on) city = a.textContent;
    });
    if (destLabel) destLabel.textContent = city || "Destinations";

    var itinLabel = document.getElementById("nav-itin-label");
    var itName = null;
    document.querySelectorAll("#nav-itin-panel a").forEach(function (a) {
      var href = a.getAttribute("href");
      var on = href === hash;
      a.classList.toggle("active", on);
      if (on && href.indexOf("#/itinerary/") === 0) {
        var it = itineraryById(href.slice("#/itinerary/".length));
        if (it) itName = it.name;
      }
    });
    if (itinLabel) itinLabel.textContent = itName || "Itineraries";
  }

  function render() {
    var hash = location.hash || "#/";
    var design = activeDesign();
    view.innerHTML = "";
    var node;
    if (hash.indexOf("#/city/") === 0) {
      var city = cityBySlug(hash.slice("#/city/".length));
      node = city ? design.renderCity(city, ctx) : design.renderHome(ctx);
    } else if (hash.indexOf("#/itinerary/") === 0) {
      var it = itineraryById(hash.slice("#/itinerary/".length));
      node = it ? viewItinerary(it) : viewItineraries();
    } else if (hash === "#/itineraries") node = viewItineraries();
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
