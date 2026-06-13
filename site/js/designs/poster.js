/* ============================================================
   POSTER design module — full-screen immersive scroll-snap panels
   with vintage travel-poster typography over full-bleed photos.
   Registers window.DESIGNS.poster with renderHome + renderCity.
   Builds DOM via ctx.h (XSS-safe). Class names prefixed "poster-".
   ES5-ish, no modules, no external libs. Works from file://.
   ============================================================ */
(function () {
  window.DESIGNS = window.DESIGNS || {};

  // ---- small local helpers ----------------------------------
  // Background style: a dark poster gradient over an optional photo.
  function bgPhoto(file, eager) {
    if (file) {
      return "background-image:" +
        "linear-gradient(180deg, rgba(11,38,44,0.30) 0%, rgba(11,38,44,0.10) 35%, rgba(11,38,44,0.78) 100%)," +
        "url('" + file + "')";
    }
    return ""; // empty → CSS supplies the fallback poster gradient
  }

  // Build a full-screen panel shell. opts: { photo, eager, tone, extraClass }
  // tone "solid" uses a flat poster-color background (no photo).
  function panel(ctx, opts, kids) {
    var h = ctx.h;
    var cls = "poster-panel" + (opts.extraClass ? " " + opts.extraClass : "");
    if (opts.tone === "solid") cls += " poster-panel--solid";
    if (!opts.photo && opts.tone !== "solid") cls += " poster-panel--nophoto";
    var attrs = { class: cls };
    var style = bgPhoto(opts.photo, opts.eager);
    if (style) attrs.style = style;
    if (opts.id) attrs.id = opts.id;

    var inner = h("div", { class: "poster-panel-inner" }, kids);
    return h("section", attrs, [
      opts.emoji && !opts.photo && opts.tone !== "solid"
        ? h("div", { class: "poster-bigmoji", text: opts.emoji, "aria-hidden": "true" }) : null,
      inner,
      opts.credit ? h("span", { class: "poster-credit", text: "Photo: " + opts.credit }) : null,
    ]);
  }

  // Find a representative photo for a category's panel header.
  function firstPhoto(pois) {
    for (var i = 0; i < pois.length; i++) {
      if (pois[i].photo && pois[i].photo.file) return pois[i].photo;
    }
    return null;
  }

  // Weather chip-set (Fahrenheit only).
  function weatherStats(ctx, w) {
    var stats = [
      ["High", w.high],
      ["Low", w.low],
      ["Rain", w.rain],
    ];
    if (w.sea) stats.push(["Sea", w.sea]);
    return stats.map(function (s) {
      return ctx.h("div", { class: "poster-stat" }, [
        ctx.h("span", { class: "poster-stat-v", text: s[1] }),
        ctx.h("span", { class: "poster-stat-k", text: s[0] }),
      ]);
    });
  }

  function scrollCue(ctx, label) {
    return ctx.h("div", { class: "poster-cue", "aria-hidden": "true" }, [
      ctx.h("span", { class: "poster-cue-txt", text: label || "Scroll" }),
      ctx.h("span", { class: "poster-cue-arrow", text: "↓" }),
    ]);
  }

  // ============================================================
  // HOME
  // ============================================================
  function renderHome(ctx) {
    var h = ctx.h;
    var cities = ctx.data.cities;
    var cover = cities[0];
    var scroll = h("div", { class: "poster-scroll" }, []);

    // ---- cover panel ----
    scroll.appendChild(panel(ctx, {
      photo: cover.hero ? cover.hero.file : null,
      eager: true,
      emoji: "🇮🇹",
      credit: cover.hero ? cover.hero.credit : null,
      extraClass: "poster-cover",
    }, [
      h("p", { class: "poster-kicker", text: "An Offline Travel Guide · October 2026" }),
      h("h1", { class: "poster-title poster-title--xl", text: "Southern Italy" }),
      h("p", { class: "poster-route", text: cities.map(function (c) { return c.name; }).join(" · ") }),
      scrollCue(ctx, "Begin"),
    ]));

    // ---- weather overview panel (Fahrenheit only) ----
    var wxCards = [];
    var years = null;
    cities.forEach(function (c) {
      var w = ctx.weather(c.weather);
      if (!w) return;
      if (!years) years = w.years;
      var rows = [["High", w.high], ["Low", w.low], ["Rain", w.rain]];
      if (w.sea) rows.push(["Sea", w.sea]);
      wxCards.push(h("div", { class: "poster-wx-card" }, [
        h("h3", { class: "poster-wx-city", text: c.name }),
        h("div", { class: "poster-wx-rows" }, rows.map(function (r) {
          return h("div", { class: "poster-wx-row" }, [
            h("span", { class: "k", text: r[0] }),
            h("span", { class: "v", text: r[1] }),
          ]);
        })),
      ]));
    });
    if (wxCards.length) {
      scroll.appendChild(panel(ctx, { tone: "solid", extraClass: "poster-wx-panel" }, [
        h("p", { class: "poster-kicker on-solid", text: "Early October" }),
        h("h2", { class: "poster-title", text: "Weather at a glance" }),
        h("div", { class: "poster-wx-grid" }, wxCards),
        h("p", { class: "poster-fineprint", text: "Average highs & lows, rain-day chance and sea temperature · " + (years || "recent years") + ". Fahrenheit." }),
      ]));
    }

    // ---- one panel per city ----
    cities.forEach(function (c, i) {
      var go = function () { ctx.navigate(ctx.cityHref(c.slug)); };
      scroll.appendChild(panel(ctx, {
        photo: c.hero ? c.hero.file : null,
        emoji: "📍",
        credit: c.hero ? c.hero.credit : null,
        extraClass: "poster-citypanel",
      }, [
        h("p", { class: "poster-kicker", text: "No. 0" + (i + 1) + " · " + c.region }),
        h("a", { class: "poster-citylink", href: ctx.cityHref(c.slug), onclick: function (e) { e.preventDefault(); go(); } }, [
          h("h2", { class: "poster-title poster-title--lg", text: c.name }),
        ]),
        h("p", { class: "poster-tagline", text: c.tagline }),
        h("a", {
          class: "poster-cta",
          href: ctx.cityHref(c.slug),
          onclick: function (e) { e.preventDefault(); go(); },
          text: "Explore " + c.name + " →",
        }),
      ]));
    });

    return scroll;
  }

  // ============================================================
  // CITY
  // ============================================================
  function renderCity(city, ctx) {
    var h = ctx.h;
    var scroll = h("div", { class: "poster-scroll" }, []);

    // ---- title panel ----
    scroll.appendChild(panel(ctx, {
      photo: city.hero ? city.hero.file : null,
      eager: true,
      emoji: "📍",
      credit: city.hero ? city.hero.credit : null,
      extraClass: "poster-cover",
    }, [
      h("p", { class: "poster-kicker", text: city.region }),
      h("h1", { class: "poster-title poster-title--xl", text: city.name }),
      h("p", { class: "poster-route", text: city.tagline }),
      scrollCue(ctx),
    ]));

    // ---- intro + weather + daylight panel ----
    var w = ctx.weather(city.weather);
    var sun = city.sun;
    var introKids = [
      h("p", { class: "poster-kicker on-solid", text: "At a glance" }),
      h("h2", { class: "poster-title", text: "Welcome to " + city.name }),
      city.intro ? h("p", { class: "poster-prose", text: city.intro }) : null,
    ];
    if (w) {
      introKids.push(h("div", { class: "poster-stats" }, weatherStats(ctx, w)));
      introKids.push(h("p", { class: "poster-fineprint", text: w.label + " averages · " + w.years + " · Fahrenheit" }));
    }
    if (sun) {
      var sunRows = [];
      if (sun.sunrise) sunRows.push(["Sunrise", sun.sunrise]);
      if (sun.goldenHourEvening) sunRows.push(["Golden hour", sun.goldenHourEvening]);
      if (sun.sunset) sunRows.push(["Sunset", sun.sunset]);
      introKids.push(h("div", { class: "poster-stats poster-stats--sun" }, sunRows.map(function (r) {
        return h("div", { class: "poster-stat" }, [
          h("span", { class: "poster-stat-v", text: r[1] }),
          h("span", { class: "poster-stat-k", text: r[0] }),
        ]);
      })));
    }
    scroll.appendChild(panel(ctx, { tone: "solid", extraClass: "poster-intro-panel" }, introKids));

    // ---- orientation: minimap + transport ----
    var mini = ctx.miniMap(city);
    var transport = (city.transport || []).map(function (t) { return h("li", { text: t }); });
    scroll.appendChild(panel(ctx, { tone: "solid", extraClass: "poster-orient-panel poster-panel--alt" }, [
      h("p", { class: "poster-kicker on-solid", text: "Getting around" }),
      h("h2", { class: "poster-title", text: "Find your bearings" }),
      h("div", { class: "poster-orient" }, [
        h("div", { class: "poster-orient-map" }, [
          mini || h("p", { class: "poster-prose", text: "Map view unavailable for this city." }),
        ]),
        h("div", { class: "poster-orient-list" }, [
          transport.length
            ? h("ul", { class: "poster-bullets" }, transport)
            : h("p", { class: "poster-prose", text: "Getting-around notes coming soon." }),
        ]),
      ]),
    ]));

    // ---- itinerary panel ----
    if (city.itinerary && city.itinerary.length) {
      var days = city.itinerary.map(function (d) {
        return h("div", { class: "poster-day" }, [
          h("div", { class: "poster-day-num" }, [
            h("span", { class: "lab", text: "Day" }),
            h("span", { class: "n", text: String(d.day) }),
          ]),
          h("div", { class: "poster-day-body" }, [
            h("h3", { class: "poster-day-title", text: d.title }),
            h("div", { class: "poster-day-items" }, (d.items || []).map(function (name) {
              return h("span", { class: "poster-chip", text: name });
            })),
          ]),
        ]);
      });
      scroll.appendChild(panel(ctx, { tone: "solid", extraClass: "poster-itin-panel" }, [
        h("p", { class: "poster-kicker on-solid", text: "The plan" }),
        h("h2", { class: "poster-title", text: "Three days, day by day" }),
        h("div", { class: "poster-days poster-scrollbody" }, days),
      ]));
    }

    // ---- food (+ coast) panel ----
    var foodPhoto = firstPhoto(city.pois.filter(function (p) { return p.category === "food" || p.category === "drink"; }));
    var foodCols = [
      h("div", { class: "poster-notecol" }, [
        h("h3", { class: "poster-subhead", text: "At the table" }),
        h("ul", { class: "poster-bullets" }, (city.foodNotes || []).map(function (t) { return h("li", { text: t }); })),
      ]),
    ];
    if (city.beachNotes && city.beachNotes.length) {
      foodCols.push(h("div", { class: "poster-notecol" }, [
        h("h3", { class: "poster-subhead", text: "Coast & beaches" }),
        h("ul", { class: "poster-bullets" }, city.beachNotes.map(function (t) { return h("li", { text: t }); })),
      ]));
    }
    scroll.appendChild(panel(ctx, {
      photo: foodPhoto ? foodPhoto.file : null,
      emoji: "🍝",
      credit: foodPhoto ? foodPhoto.credit : null,
      extraClass: "poster-food-panel",
    }, [
      h("p", { class: "poster-kicker", text: "Eat & drink" }),
      h("h2", { class: "poster-title poster-title--lg", text: city.beachNotes ? "Food & the coast" : "Where to eat" }),
      h("div", { class: "poster-notes poster-scrollbody" }, foodCols),
    ]));

    // ---- things to do — one panel per category ----
    (city.categories || []).forEach(function (catKey) {
      var pois = city.pois.filter(function (p) { return p.category === catKey; });
      if (!pois.length) return;
      var rep = firstPhoto(pois);
      var cards = pois.map(function (p) { return renderPoiCard(h, ctx, p, city); });
      scroll.appendChild(panel(ctx, {
        photo: rep ? rep.file : null,
        emoji: ctx.catIcon(catKey),
        credit: rep ? rep.credit : null,
        extraClass: "poster-cat-panel",
      }, [
        h("p", { class: "poster-kicker", text: ctx.catIcon(catKey) + "  Things to do" }),
        h("h2", { class: "poster-title poster-title--lg", text: ctx.catLabel(catKey) }),
        h("p", { class: "poster-catcount", text: pois.length + (pois.length === 1 ? " place" : " places") }),
        h("div", { class: "poster-poi-list poster-scrollbody" }, cards),
      ]));
    });

    return scroll;
  }

  // ---- POI card (used inside category panels) ----
  function renderPoiCard(h, ctx, p, city) {
    var media;
    if (p.photo && p.photo.file) {
      media = h("figure", { class: "poster-poi-media" }, [
        h("img", { src: p.photo.file, alt: p.name, loading: "lazy" }),
      ]);
    } else {
      media = h("figure", { class: "poster-poi-media is-emoji", text: ctx.catIcon(p.category), "aria-hidden": "true" });
    }
    return h("article", { class: "poster-poi", id: ctx.poiAnchorId(p) }, [
      media,
      h("div", { class: "poster-poi-body" }, [
        h("p", { class: "poster-poi-cat", text: ctx.catLabel(p.category) }),
        h("h4", { class: "poster-poi-name", text: p.name }),
        p.blurb ? h("p", { class: "poster-poi-blurb", text: p.blurb }) : null,
        h("a", {
          class: "poster-maplink",
          href: ctx.mapHref(p, city),
          target: "_blank",
          rel: "noopener",
          text: "Map ↗",
        }),
      ]),
    ]);
  }

  window.DESIGNS.poster = {
    label: "Poster",
    renderHome: renderHome,
    renderCity: renderCity,
  };
})();
