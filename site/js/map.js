/* Orientation minimap. When the city has a bundled OSM basemap (city.map), it
   shows the real map and overlays pins by reprojecting each POI's lat/lon into
   the same Web-Mercator window — fully offline, no tiles fetched at runtime.
   Falls back to a schematic relative-position scatter when no basemap exists.
   For turn-by-turn, each POI card links out to Google/Apple Maps (needs net).

   Interactivity (all vanilla, file://-safe, no libs/build step):
   - drag-to-pan (mouse + touch), wheel-zoom-toward-cursor, two-finger pinch
   - on-screen + / − / reset buttons
   - "Fullscreen" expand into a large overlay (Fullscreen API with a CSS-overlay
     fallback for file:// where the API is blocked)
   The basemap <img> and all pins live inside one transformed `.minimap-stage`,
   so pins stay locked to the map; pins are counter-scaled by 1/s to keep a
   roughly constant on-screen size at any zoom. */
(function () {
  var TILE = 256;
  function lonToPx(lon, z) { return ((lon + 180) / 360) * Math.pow(2, z) * TILE; }
  function latToPx(lat, z) {
    var r = lat * Math.PI / 180;
    return ((1 - Math.log(Math.tan(r) + 1 / Math.cos(r)) / Math.PI) / 2) * Math.pow(2, z) * TILE;
  }

  function cssId(s) { return String(s).replace(/[^a-z0-9_-]/gi, "-"); }
  window.__cssId = cssId;

  var MIN_SCALE = 1;
  var MAX_SCALE = 5;

  function clamp(v, lo, hi) { return v < lo ? lo : (v > hi ? hi : v); }

  function makePin(poi, leftPct, topPct) {
    var pin = document.createElement("button");
    pin.className = "mpin";
    pin.type = "button";
    pin.style.left = leftPct + "%";
    pin.style.top = topPct + "%";
    pin.innerHTML = '<span class="lbl"></span><span class="dot"></span>';
    pin.querySelector(".lbl").textContent = poi.name;
    // Scroll to the card; do NOT change the hash (a reload on #poi- would render
    // no city view → blank page).
    pin.addEventListener("click", function (e) {
      // If a drag just happened, the stage swallows the click via a flag.
      e.preventDefault();
      var t = document.getElementById("poi-" + cssId(poi.id));
      if (t) t.scrollIntoView({ behavior: "smooth", block: "center" });
    });
    return pin;
  }

  /* ---------------------------------------------------------------------------
     MapInteraction — owns pan/zoom state for one .minimap--base box. The box
     holds: .minimap-viewport > .minimap-stage (img + pins), plus controls and
     legend as siblings of the viewport. Reusable for both inline and fullscreen.
  --------------------------------------------------------------------------- */
  function MapInteraction(box) {
    this.box = box;
    this.viewport = box.querySelector(".minimap-viewport");
    this.stage = box.querySelector(".minimap-stage");
    this.pins = Array.prototype.slice.call(box.querySelectorAll(".mpin"));
    this.scale = 1;
    this.tx = 0;
    this.ty = 0;
    this.dragging = false;
    this.moved = false;
    this.pointers = {};      // active pointers by id (for pinch)
    this.pinchStart = null;  // {dist, scale, cx, cy}
    this._bound = false;
    this.bind();
    this.apply();
  }

  MapInteraction.prototype.size = function () {
    var r = this.viewport.getBoundingClientRect();
    return { w: r.width, h: r.height, left: r.left, top: r.top };
  };

  // Clamp the pan so the (scaled) map always covers the viewport — you can never
  // drag empty space into view. At scale 1 this pins tx/ty to 0.
  MapInteraction.prototype.clampPan = function () {
    var s = this.size();
    var maxX = (this.scale - 1) * s.w;
    var maxY = (this.scale - 1) * s.h;
    // translate is applied before scale (transform-origin 0 0), and the stage is
    // viewport-sized, so the scaled content spans [tx, tx + scale*w].
    this.tx = clamp(this.tx, -maxX, 0);
    this.ty = clamp(this.ty, -maxY, 0);
  };

  MapInteraction.prototype.apply = function () {
    this.clampPan();
    this.stage.style.transform =
      "translate(" + this.tx + "px," + this.ty + "px) scale(" + this.scale + ")";
    // Counter-scale pins so they keep a constant on-screen size & stay tappable.
    var inv = 1 / this.scale;
    for (var i = 0; i < this.pins.length; i++) {
      this.pins[i].style.transform = "translate(-50%, -50%) scale(" + inv + ")";
    }
    this.box.classList.toggle("is-zoomed", this.scale > 1.001);
  };

  // Zoom toward a viewport-relative anchor point (px from viewport top-left),
  // keeping that point stationary on screen.
  MapInteraction.prototype.zoomTo = function (newScale, ax, ay) {
    newScale = clamp(newScale, MIN_SCALE, MAX_SCALE);
    if (newScale === this.scale) return;
    // world point under the anchor before zoom
    var wx = (ax - this.tx) / this.scale;
    var wy = (ay - this.ty) / this.scale;
    this.scale = newScale;
    this.tx = ax - wx * this.scale;
    this.ty = ay - wy * this.scale;
    this.apply();
  };

  MapInteraction.prototype.zoomBy = function (factor, ax, ay) {
    var s = this.size();
    if (ax == null) { ax = s.w / 2; ay = s.h / 2; }
    this.zoomTo(this.scale * factor, ax, ay);
  };

  MapInteraction.prototype.reset = function () {
    this.scale = 1; this.tx = 0; this.ty = 0; this.apply();
  };

  MapInteraction.prototype.bind = function () {
    if (this._bound) return;
    this._bound = true;
    var self = this;
    var vp = this.viewport;

    function dist(a, b) {
      var dx = a.x - b.x, dy = a.y - b.y;
      return Math.sqrt(dx * dx + dy * dy);
    }
    function mid(a, b) { return { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 }; }

    // Pointer Events cover mouse + touch + pen uniformly.
    this.onDown = function (e) {
      vp.setPointerCapture && vp.setPointerCapture(e.pointerId);
      self.pointers[e.pointerId] = { x: e.clientX, y: e.clientY };
      var ids = Object.keys(self.pointers);
      if (ids.length === 1) {
        self.dragging = true;
        self.moved = false;
        self.lastX = e.clientX;
        self.lastY = e.clientY;
      } else if (ids.length === 2) {
        // begin pinch
        var p = self.pointers;
        var a = p[ids[0]], b = p[ids[1]];
        var s = self.size();
        var m = mid(a, b);
        self.pinchStart = {
          dist: dist(a, b),
          scale: self.scale,
          cx: m.x - s.left,
          cy: m.y - s.top
        };
        self.dragging = false;
      }
    };

    this.onMove = function (e) {
      if (!self.pointers[e.pointerId]) return;
      self.pointers[e.pointerId] = { x: e.clientX, y: e.clientY };
      var ids = Object.keys(self.pointers);

      if (ids.length === 2 && self.pinchStart) {
        e.preventDefault();
        var p = self.pointers;
        var a = p[ids[0]], b = p[ids[1]];
        var d = dist(a, b);
        if (self.pinchStart.dist > 0) {
          var factor = d / self.pinchStart.dist;
          self.zoomTo(self.pinchStart.scale * factor, self.pinchStart.cx, self.pinchStart.cy);
        }
        self.moved = true;
        return;
      }

      if (self.dragging) {
        var dx = e.clientX - self.lastX;
        var dy = e.clientY - self.lastY;
        if (Math.abs(dx) > 2 || Math.abs(dy) > 2) self.moved = true;
        self.lastX = e.clientX;
        self.lastY = e.clientY;
        // Only meaningful when zoomed in (clampPan pins to 0 at scale 1).
        self.tx += dx;
        self.ty += dy;
        self.apply();
        if (self.scale > 1.001) e.preventDefault();
      }
    };

    this.onUp = function (e) {
      delete self.pointers[e.pointerId];
      vp.releasePointerCapture && vp.releasePointerCapture(e.pointerId);
      var ids = Object.keys(self.pointers);
      if (ids.length < 2) self.pinchStart = null;
      if (ids.length === 0) self.dragging = false;
      else if (ids.length === 1) {
        // one finger lifted after pinch → resume panning with the remaining one
        self.dragging = true;
        var rem = self.pointers[ids[0]];
        self.lastX = rem.x; self.lastY = rem.y;
      }
    };

    this.onWheel = function (e) {
      e.preventDefault();
      var s = self.size();
      var ax = e.clientX - s.left;
      var ay = e.clientY - s.top;
      var factor = Math.pow(1.0015, -e.deltaY); // smooth, direction-correct
      self.zoomTo(self.scale * factor, ax, ay);
    };

    // Swallow click if it was actually a drag (prevents accidental pin jumps).
    this.onClickCapture = function (e) {
      if (self.moved) {
        e.stopPropagation();
        e.preventDefault();
        self.moved = false;
      }
    };

    vp.addEventListener("pointerdown", this.onDown);
    vp.addEventListener("pointermove", this.onMove);
    vp.addEventListener("pointerup", this.onUp);
    vp.addEventListener("pointercancel", this.onUp);
    vp.addEventListener("wheel", this.onWheel, { passive: false });
    vp.addEventListener("click", this.onClickCapture, true);
  };

  /* ---------------------------------------------------------------------------
     Fullscreen handling — Fullscreen API when available, CSS overlay fallback
     otherwise (file:// commonly blocks requestFullscreen()). Either way the SAME
     box (and its live MapInteraction) is moved into a fixed overlay; on close we
     return it to its original parent. No re-binding needed because handlers live
     on the viewport element, which travels with the box.
  --------------------------------------------------------------------------- */
  function setupFullscreen(box, controller) {
    var overlay = null;
    var placeholder = null;
    var originalParent = null;
    var usingApi = false;

    function onKey(e) {
      if (e.key === "Escape" || e.keyCode === 27) close();
    }
    function onFsChange() {
      // API-driven exit (Esc handled by browser) → tear down our wrapper.
      var fsEl = document.fullscreenElement || document.webkitFullscreenElement;
      if (usingApi && !fsEl) cleanup();
    }

    function mountOverlay() {
      originalParent = box.parentNode;
      placeholder = document.createComment("minimap-placeholder");
      originalParent.insertBefore(placeholder, box);

      overlay = document.createElement("div");
      overlay.className = "minimap-overlay";
      var closeBtn = document.createElement("button");
      closeBtn.type = "button";
      closeBtn.className = "minimap-overlay-close";
      closeBtn.setAttribute("aria-label", "Close fullscreen map");
      closeBtn.innerHTML = "&#x2715;"; // ✕
      closeBtn.addEventListener("click", close);
      overlay.appendChild(box);
      overlay.appendChild(closeBtn);
      document.body.appendChild(overlay);
      box.classList.add("minimap--fs");
      document.addEventListener("keydown", onKey);
      // Layout changed (bigger viewport) → re-clamp pan.
      controller.apply();
    }

    function cleanup() {
      box.classList.remove("minimap--fs");
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("fullscreenchange", onFsChange);
      document.removeEventListener("webkitfullscreenchange", onFsChange);
      if (placeholder && placeholder.parentNode === originalParent) {
        originalParent.insertBefore(box, placeholder);
        originalParent.removeChild(placeholder);
      } else if (originalParent) {
        originalParent.appendChild(box);
      }
      if (overlay && overlay.parentNode) overlay.parentNode.removeChild(overlay);
      overlay = null; placeholder = null; usingApi = false;
      controller.reset();
      controller.apply();
    }

    function open() {
      if (overlay) return;
      mountOverlay();
      // Try the real Fullscreen API on the overlay; if it throws or is missing,
      // the CSS overlay already provides a working fallback.
      var req = overlay.requestFullscreen || overlay.webkitRequestFullscreen;
      if (req) {
        usingApi = true;
        document.addEventListener("fullscreenchange", onFsChange);
        document.addEventListener("webkitfullscreenchange", onFsChange);
        try {
          var p = req.call(overlay);
          if (p && p.catch) p.catch(function () { usingApi = false; });
        } catch (err) {
          usingApi = false;
        }
      }
    }

    function close() {
      var fsEl = document.fullscreenElement || document.webkitFullscreenElement;
      if (usingApi && fsEl) {
        // Let the API exit; onFsChange → cleanup().
        var exit = document.exitFullscreen || document.webkitExitFullscreen;
        try { exit && exit.call(document); } catch (e) { cleanup(); }
      } else {
        cleanup();
      }
    }

    return { open: open, close: close };
  }

  function makeControls(box) {
    var controls = document.createElement("div");
    controls.className = "minimap-controls";

    function btn(cls, label, html) {
      var b = document.createElement("button");
      b.type = "button";
      b.className = "mm-btn " + cls;
      b.setAttribute("aria-label", label);
      b.title = label;
      b.innerHTML = html;
      return b;
    }
    var zoomIn = btn("mm-zoom-in", "Zoom in", "+");
    var zoomOut = btn("mm-zoom-out", "Zoom out", "&#x2212;"); // −
    var reset = btn("mm-reset", "Reset map", "&#x21bb;");     // ↻
    controls.appendChild(zoomIn);
    controls.appendChild(zoomOut);
    controls.appendChild(reset);

    var expand = btn("mm-expand", "Fullscreen map", "&#x2922;"); // ⤢

    box.appendChild(controls);
    box.appendChild(expand);
    return { zoomIn: zoomIn, zoomOut: zoomOut, reset: reset, expand: expand };
  }

  // Real bundled basemap with Mercator-projected pins + pan/zoom/fullscreen.
  function withBasemap(city) {
    var m = city.map;
    var box = document.createElement("div");
    box.className = "minimap minimap--base";

    var viewport = document.createElement("div");
    viewport.className = "minimap-viewport";

    var stage = document.createElement("div");
    stage.className = "minimap-stage";

    var img = document.createElement("img");
    img.className = "minimap-base";
    img.src = m.file;
    img.alt = city.name + " map";
    img.decoding = "async";
    img.draggable = false;
    stage.appendChild(img);

    (city.pois || []).forEach(function (p) {
      if (typeof p.lat !== "number" || typeof p.lon !== "number") return;
      var x = (lonToPx(p.lon, m.z) - m.worldLeft) / m.w * 100;
      var y = (latToPx(p.lat, m.z) - m.worldTop) / m.h * 100;
      if (x < -2 || x > 102 || y < -2 || y > 102) return; // outside the frame
      stage.appendChild(makePin(p, x, y));
    });

    viewport.appendChild(stage);
    box.appendChild(viewport);

    var legend = document.createElement("div");
    legend.className = "legend";
    legend.textContent = (m.attribution ? m.attribution + " · " : "") + "tap a pin to jump to it";
    box.appendChild(legend);

    var ctrls = makeControls(box);

    // Wire up after the box is in the DOM so getBoundingClientRect works; defer
    // the controller until first paint. Handlers attach to the viewport, which
    // exists now, so we can bind immediately and just re-apply on insert.
    var controller = new MapInteraction(box);
    var fs = setupFullscreen(box, controller);

    ctrls.zoomIn.addEventListener("click", function () { controller.zoomBy(1.5); });
    ctrls.zoomOut.addEventListener("click", function () { controller.zoomBy(1 / 1.5); });
    ctrls.reset.addEventListener("click", function () { controller.reset(); });
    ctrls.expand.addEventListener("click", function () { fs.open(); });

    // Re-apply once the image has dimensions / box is laid out.
    img.addEventListener("load", function () { controller.apply(); });

    return box;
  }

  // Fallback: relative-position scatter on a blank grid (no geography). No raster
  // here, so no pan/zoom — just static pins (unchanged behavior).
  function schematic(pois) {
    var pts = (pois || []).filter(function (p) {
      return typeof p.lat === "number" && typeof p.lon === "number";
    });
    if (pts.length < 2) return null;
    var lats = pts.map(function (p) { return p.lat; });
    var lons = pts.map(function (p) { return p.lon; });
    var minLat = Math.min.apply(null, lats), maxLat = Math.max.apply(null, lats);
    var minLon = Math.min.apply(null, lons), maxLon = Math.max.apply(null, lons);
    var padLat = (maxLat - minLat) * 0.12 || 0.01;
    var padLon = (maxLon - minLon) * 0.12 || 0.01;
    minLat -= padLat; maxLat += padLat; minLon -= padLon; maxLon += padLon;
    var box = document.createElement("div");
    box.className = "minimap";
    pts.forEach(function (p) {
      var x = ((p.lon - minLon) / (maxLon - minLon)) * 100;
      var y = (1 - (p.lat - minLat) / (maxLat - minLat)) * 100; // north up
      box.appendChild(makePin(p, x, y));
    });
    var legend = document.createElement("div");
    legend.className = "legend";
    legend.textContent = "Relative locations · tap a pin to jump to it";
    box.appendChild(legend);
    return box;
  }

  window.renderMiniMap = function (city) {
    if (!city) return null;
    if (city.map && city.map.file) return withBasemap(city);
    return schematic(city.pois || []);
  };
})();
