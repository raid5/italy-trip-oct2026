/* ============================================================
   FIELD GUIDE / ATLAS design module.
   Registers window.DESIGNS.fieldguide with renderHome + renderCity.
   Dense printed-reference layout: sticky left sidebar TOC + two-column
   main area. Built via ctx.h (XSS-safe). Class names prefixed "fg-".
   In-page TOC jumps use scrollIntoView (NOT location.hash); city links
   use ctx.cityHref (real routing).
   ============================================================ */
(function () {
  window.DESIGNS = window.DESIGNS || {};

  // ---- helpers ------------------------------------------------
  function pad2(n) { return (n < 10 ? "0" : "") + n; }

  function scrollTo(id) {
    return function () {
      var t = document.getElementById(id);
      if (t) t.scrollIntoView({ behavior: "smooth", block: "start" });
    };
  }

  // A sidebar in-page link (button → smooth scroll, no hash change).
  function tocLink(ctx, num, label, targetId) {
    return ctx.h("li", {}, [
      ctx.h("span", { class: "fg-toc-num", text: num || "" }),
      ctx.h("button", { type: "button", text: label, onclick: scrollTo(targetId) }),
    ]);
  }

  function sectionHead(ctx, num, title, meta) {
    return ctx.h("div", { class: "fg-sec-head" }, [
      ctx.h("span", { class: "fg-sec-num", text: num }),
      ctx.h("h2", { class: "fg-sec-title", text: title }),
      meta ? ctx.h("span", { class: "fg-sec-meta", text: meta }) : null,
    ]);
  }

  function coordStr(lat, lon) {
    if (lat == null || lon == null) return "";
    var ns = (lat >= 0 ? "N" : "S"), ew = (lon >= 0 ? "E" : "W");
    return Math.abs(lat).toFixed(3) + "° " + ns + " · " + Math.abs(lon).toFixed(3) + "° " + ew;
  }

  // ============================================================
  // HOME
  // ============================================================
  function renderHome(ctx) {
    var h = ctx.h;
    var cities = ctx.data.cities;

    // ----- sidebar TOC -----
    var cityItems = cities.map(function (c) {
      return h("li", {}, [
        h("a", { class: "fg-toc-city", href: ctx.cityHref(c.slug) }, [c.name]),
      ]);
    });
    var sections = [
      ["§1", "Rough weather", "fg-home-weather"],
      ["§2", "Region Index", "fg-home-index"],
      ["§3", "About this guide", "fg-home-about"],
    ];
    var sidebar = h("aside", { class: "fg-sidebar" }, [
      h("div", { class: "fg-toc-group" }, [
        h("p", { class: "fg-toc-title", text: "Destinations" }),
        h("ul", { class: "fg-toc-list" }, cityItems),
      ]),
      h("div", { class: "fg-toc-group" }, [
        h("p", { class: "fg-toc-title", text: "Front matter" }),
        h("ul", { class: "fg-toc-list" }, sections.map(function (s) {
          return tocLink(ctx, s[0], s[1], s[2]);
        })),
      ]),
    ]);

    // ----- masthead -----
    var masthead = h("section", { class: "fg-masthead" }, [
      h("p", { class: "fg-masthead-kicker" }, [
        h("span", { text: "Field Guide / Atlas" }),
        h("span", { text: "Sep 30 – Oct 16, 2026" }),
      ]),
      h("h1", { class: "fg-title", text: "Southern Italy" }),
      h("p", { class: "fg-subtitle", text: cities.map(function (c) { return c.name; }).join(" · ") }),
      h("p", { class: "fg-masthead-note", text:
        "A compact early-October reference to the cities of the Italian south — " +
        "their climate, how to get around, food, and a numbered " +
        "catalogue of things to see. The dates and destinations here are proposed " +
        "ideas to react to, not a booked itinerary. Temperatures in Fahrenheit; distances by foot, " +
        "ferry, and rail. Select a destination from the table of contents at left." }),
    ]);

    // ----- §1 rough weather (one trip-wide estimate; weather isn't the point) -----
    var rw = ctx.roughWeather();
    var roughDefs = rw ? [
      ["Daytime high", ctx.degRange(rw.high)],
      ["Overnight low", ctx.degRange(rw.low)],
    ] : [];
    if (rw && rw.sea) roughDefs.push(["Sea", ctx.degRange(rw.sea)]);
    if (rw) roughDefs.push(["Rain", "~" + rw.rain + "% of days"]);

    var climate = h("section", { class: "fg-section", id: "fg-home-weather" }, [
      sectionHead(ctx, "§1", "Rough weather", "Sep 30 – Oct 16 · °F"),
      rw
        ? h("table", { class: "fg-datatable fg-rough" }, [
            h("caption", { text: "Very rough averages across all stops" + (rw.years ? " · " + rw.years : "") + " — early autumn in the south: warm days, mild evenings." }),
            h("tbody", {}, roughDefs.map(function (d) {
              return h("tr", {}, [
                h("td", { class: "fg-city-cell", text: d[0] }),
                h("td", { class: "fg-num", text: d[1] }),
              ]);
            })),
          ])
        : h("p", { class: "fg-prose", text: "Weather estimate unavailable." }),
    ]);

    // ----- §2 region index -----
    var index = h("section", { class: "fg-section", id: "fg-home-index" }, [
      sectionHead(ctx, "§2", "Region Index", cities.length + " entries"),
      h("div", { class: "fg-cityindex" }, cities.map(function (c) {
        return h("a", { class: "fg-index-card", href: ctx.cityHref(c.slug) }, [
          h("span", { class: "fg-region", text: c.region }),
          h("h3", { text: c.name }),
          h("p", { text: c.tagline }),
        ]);
      })),
    ]);

    // ----- §3 about -----
    var about = h("section", { class: "fg-section", id: "fg-home-about" }, [
      sectionHead(ctx, "§3", "About this guide", null),
      h("div", { class: "fg-cols" }, [
        h("p", { class: "fg-prose", text:
          "Entries are compiled from Wikivoyage and Wikipedia (CC BY-SA); photographs " +
          "are openly licensed images from Wikimedia Commons. Each city page carries a " +
          "schematic locator map plotting points of interest by relative position." }),
        h("p", { class: "fg-prose", text:
          "This is a static, offline document: every link to an external street map " +
          "opens in a new tab and requires a connection, but the guide itself needs none. " +
          "All measurements assume an early-October visit." }),
      ]),
    ]);

    var main = h("div", { class: "fg-main" }, [masthead, climate, index, about]);
    return h("div", { class: "fg-doc" }, [sidebar, main]);
  }

  // ============================================================
  // CITY
  // ============================================================
  function renderCity(city, ctx) {
    var h = ctx.h;
    var w = ctx.weather(city.weather);
    var hasMap = ctx.miniMap(city);

    // ---- build section registry so sidebar + content stay in sync ----
    var secNum = 0;
    function nextNum() { secNum += 1; return "§" + secNum; }

    var sections = [];     // DOM nodes
    var tocEntries = [];    // {num, label, id}

    // ----- header block -----
    var header = h("header", { class: "fg-cityhead", id: "fg-overview" }, [
      h("div", { class: "fg-cityhead-top" }, [
        h("span", { class: "fg-region", text: city.region }),
        h("span", { class: "fg-coords", text: coordStr(city.lat, city.lon) }),
      ]),
      h("h1", { class: "fg-cityname", text: city.name }),
      h("p", { class: "fg-tagline", text: city.tagline }),
      city.hero ? h("figure", { class: "fg-figure" }, [
        h("img", { src: city.hero.file, alt: city.name, loading: "lazy" }),
        h("figcaption", { class: "fg-caption", text: "Photo: " + city.hero.credit }),
      ]) : null,
      city.intro ? h("p", { class: "fg-prose", text: city.intro }) : null,
    ]);
    // overview section is the header itself
    sections.push(header);
    tocEntries.push({ num: nextNum(), label: "Overview", id: "fg-overview" });

    // ----- weather + daylight -----
    if (w || city.sun) {
      var wxNum = nextNum();
      var wxNode = h("section", { class: "fg-section", id: "fg-weather" }, [
        sectionHead(ctx, wxNum, "Weather & Daylight", w ? (w.label + " · °F") : null),
        h("div", { class: "fg-wx-grid" }, [
          w ? buildWeatherTable(ctx, w) : null,
          city.sun ? buildSunBlock(ctx, city.sun) : null,
        ]),
      ]);
      tocEntries.push({ num: wxNum, label: "Weather", id: "fg-weather" });
      sections.push(wxNode);
    }

    // ----- orientation -----
    var orientNum = nextNum();
    var transportList = (city.transport || []).map(function (t) { return h("li", { text: t }); });
    var orientNode = h("section", { class: "fg-section", id: "fg-orientation" }, [
      sectionHead(ctx, orientNum, "Find your way", "Locator + transit"),
      h("div", { class: "fg-orient" }, [
        hasMap ? h("figure", { class: "fg-figure" }, [hasMap]) : h("p", { class: "fg-prose", text: "No mappable points for this city." }),
        h("div", {}, [
          h("p", { class: "fg-cat-title", text: "Getting around" }),
          h("ul", { class: "fg-list" }, transportList.length ? transportList : [h("li", { text: "—" })]),
        ]),
      ]),
    ]);
    tocEntries.push({ num: orientNum, label: "Find your way", id: "fg-orientation" });
    sections.push(orientNode);

    // ----- itinerary -----
    if (city.itinerary && city.itinerary.length) {
      var itinNum = nextNum();
      var days = city.itinerary.map(function (d) {
        return h("div", { class: "fg-day" }, [
          h("span", { class: "fg-day-no", text: "Day " + d.day }),
          h("p", { class: "fg-day-title", text: d.title }),
          h("ol", {}, (d.items || []).map(function (it) { return h("li", { text: it }); })),
        ]);
      });
      var itinNode = h("section", { class: "fg-section", id: "fg-itinerary" }, [
        sectionHead(ctx, itinNum, "Itinerary", city.itinerary.length + " days"),
        h("div", { class: "fg-itin" }, days),
      ]);
      tocEntries.push({ num: itinNum, label: "Itinerary", id: "fg-itinerary" });
      sections.push(itinNode);
    }

    // ----- food (+ beaches) -----
    var foodNum = nextNum();
    var foodChildren = [];
    foodChildren.push(h("p", { class: "fg-cat-title", text: "Local notes" }));
    foodChildren.push(h("ul", { class: "fg-list" }, (city.foodNotes || []).map(function (n) { return h("li", { text: n }); })));
    if (city.beachNotes && city.beachNotes.length) {
      foodChildren.push(h("p", { class: "fg-cat-title", text: "Coast & beaches" }));
      foodChildren.push(h("ul", { class: "fg-list" }, city.beachNotes.map(function (n) { return h("li", { text: n }); })));
    }
    var foodNode = h("section", { class: "fg-section", id: "fg-food" }, [
      sectionHead(ctx, foodNum, "Food & Coast", null),
      h("div", { class: "fg-cols" }, foodChildren),
    ]);
    tocEntries.push({ num: foodNum, label: city.beachNotes ? "Food & Coast" : "Food", id: "fg-food" });
    sections.push(foodNode);

    // ----- things to do, by category -----
    // Number the "Things to do" parent first, then each category sub-entry,
    // so TOC numbers match document order.
    var thingsNum = nextNum();
    var thingsHead = h("div", { class: "fg-sec-head", id: "fg-things" }, [
      h("span", { class: "fg-sec-num", text: thingsNum }),
      h("h2", { class: "fg-sec-title", text: "Things to Do" }),
      h("span", { class: "fg-sec-meta", text: city.pois.length + " points of interest" }),
    ]);
    tocEntries.push({ num: thingsNum, label: "Things to do", id: "fg-things" });

    var poiCounter = 0;
    var catBlocks = (city.categories || []).map(function (cat) {
      var pois = city.pois.filter(function (p) { return p.category === cat; });
      if (!pois.length) return null;
      var secId = "fg-cat-" + ctx.cssId(cat);
      var entries = pois.map(function (p) {
        poiCounter += 1;
        var visual = p.photo
          ? h("img", { class: "fg-poi-thumb", src: p.photo.file, alt: p.name, loading: "lazy" })
          : h("div", { class: "fg-poi-marker", text: ctx.catIcon(cat) });
        return h("article", { class: "fg-poi", id: ctx.poiAnchorId(p) }, [
          h("span", { class: "fg-poi-num", text: pad2(poiCounter) }),
          visual,
          h("div", {}, [
            h("h4", { class: "fg-poi-name", text: p.name }),
            h("p", { class: "fg-poi-cat", text: ctx.catLabel(p.category) }),
            p.blurb ? h("p", { class: "fg-poi-blurb", text: p.blurb }) : null,
            h("a", { class: "fg-maplink", href: ctx.mapHref(p, city), target: "_blank", rel: "noopener", text: "Map ↗" }),
          ]),
        ]);
      });
      var block = h("section", { class: "fg-catblock fg-section", id: secId }, [
        h("div", { class: "fg-cat-head" }, [
          h("span", { class: "fg-cat-marker", text: ctx.catIcon(cat) }),
          h("h3", { class: "fg-cat-title", text: ctx.catLabel(cat) }),
          h("span", { class: "fg-cat-count", text: pois.length + " entries" }),
        ]),
        h("div", { class: "fg-pois" }, entries),
      ]);
      tocEntries.push({ num: nextNum(), label: "· " + ctx.catLabel(cat), id: secId, sub: true });
      return block;
    }).filter(Boolean);

    var thingsWrap = h("section", { class: "fg-section" }, [thingsHead].concat(catBlocks));
    sections.push(thingsWrap);

    // ----- assemble sidebar -----
    var citySwitch = ctx.data.cities.map(function (c) {
      return h("li", {}, [
        h("a", {
          class: "fg-toc-city" + (c.slug === city.slug ? " is-current" : ""),
          href: ctx.cityHref(c.slug),
        }, [c.name]),
      ]);
    });

    var tocItems = tocEntries.map(function (e) {
      return ctx.h("li", {}, [
        ctx.h("span", { class: "fg-toc-num", text: e.num }),
        ctx.h("button", { type: "button", text: e.label, onclick: scrollTo(e.id) }),
      ]);
    });

    var sidebar = h("aside", { class: "fg-sidebar" }, [
      h("div", { class: "fg-toc-group" }, [
        h("p", { class: "fg-toc-title", text: city.name + " · Contents" }),
        h("ul", { class: "fg-toc-list" }, tocItems),
      ]),
      h("div", { class: "fg-toc-group" }, [
        h("p", { class: "fg-toc-title", text: "Other destinations" }),
        h("ul", { class: "fg-toc-list" }, citySwitch),
      ]),
    ]);

    var main = h("div", { class: "fg-main" }, sections);
    return h("div", { class: "fg-doc" }, [sidebar, main]);
  }

  function buildWeatherTable(ctx, w) {
    var h = ctx.h;
    var rows = [["High", w.high], ["Low", w.low], ["Rain days", w.rain]];
    if (w.sea) rows.push(["Sea temp", w.sea]);
    return h("table", { class: "fg-datatable" }, [
      h("caption", { text: "Climate — " + w.years }),
      h("tbody", {}, rows.map(function (r) {
        return h("tr", {}, [h("th", { text: r[0] }), h("td", { class: "fg-num", text: r[1] })]);
      })),
    ]);
  }

  function buildSunBlock(ctx, sun) {
    var h = ctx.h;
    var items = [];
    if (sun.sunrise) items.push(["Sunrise", sun.sunrise]);
    if (sun.sunset) items.push(["Sunset", sun.sunset]);
    if (sun.goldenHourEvening) items.push(["Golden hr", sun.goldenHourEvening]);
    return h("div", {}, [
      h("p", { class: "fg-cat-title", text: "Daylight" }),
      h("div", { class: "fg-kv" }, items.map(function (it) {
        return h("div", {}, [
          h("span", { class: "k", text: it[0] }),
          h("span", { class: "v", text: it[1] }),
        ]);
      })),
    ]);
  }

  window.DESIGNS.fieldguide = {
    label: "Field Guide",
    renderHome: renderHome,
    renderCity: renderCity,
  };
})();
