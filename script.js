// Toggles the mobile navigation menu open/closed.
// This runs on every page because each page loads this same file.
document.addEventListener("DOMContentLoaded", function () {
  var toggle = document.querySelector(".nav-toggle");
  var links = document.querySelector(".nav-links");

  if (toggle && links) {
    toggle.addEventListener("click", function () {
      links.classList.toggle("open");
    });

    // Close the menu automatically when a link is tapped (nice on mobile)
    links.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", function () {
        links.classList.remove("open");
      });
    });
  }

  // ---- Dark mode toggle ----
  // The page's <head> script has already set data-theme (the visitor's
  // choice this visit, otherwise the device setting). This adds the toggle
  // as the last item in the nav: top right on desktop, bottom of the
  // mobile menu.
  var root = document.documentElement;
  if (links) {
    var themeItem = document.createElement("li");
    themeItem.className = "nav-theme-item";
    themeItem.innerHTML =
      '<button class="theme-toggle" type="button">' +
        '<svg class="icon-moon" viewBox="0 0 24 24" aria-hidden="true"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>' +
        '<svg class="icon-sun" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"/></svg>' +
        '<span class="theme-toggle-label"></span>' +
      "</button>";
    links.appendChild(themeItem);

    var themeBtn = themeItem.querySelector(".theme-toggle");
    var themeLabel = themeItem.querySelector(".theme-toggle-label");

    var syncThemeButton = function () {
      var next = root.getAttribute("data-theme") === "dark" ? "light" : "dark";
      var text = next === "dark" ? "Dark mode" : "Light mode";
      themeLabel.textContent = text;
      themeBtn.setAttribute("aria-label", "Switch to " + text.toLowerCase());
      themeBtn.title = "Switch to " + text.toLowerCase();
    };
    syncThemeButton();

    themeBtn.addEventListener("click", function () {
      var theme = root.getAttribute("data-theme") === "dark" ? "light" : "dark";
      root.setAttribute("data-theme", theme);
      try { sessionStorage.setItem("theme", theme); } catch (e) {}
      syncThemeButton();
    });

    // Follow live changes to the device setting until the visitor picks one
    if (window.matchMedia) {
      var mq = window.matchMedia("(prefers-color-scheme: dark)");
      var onSystemChange = function (e) {
        var chosen = null;
        try { chosen = sessionStorage.getItem("theme"); } catch (err) {}
        if (chosen) return;
        root.setAttribute("data-theme", e.matches ? "dark" : "light");
        syncThemeButton();
      };
      if (mq.addEventListener) mq.addEventListener("change", onSystemChange);
      else if (mq.addListener) mq.addListener(onSystemChange);
    }
  }

  // Carousels: each ".carousel" has a ".carousel-track" of slides and
  // prev/next buttons with data-carousel-prev / data-carousel-next.
  // One slide shows at a time; the buttons wrap around at either end.
  document.querySelectorAll(".carousel").forEach(function (carousel) {
    var track = carousel.querySelector(".carousel-track");
    var prev = carousel.querySelector("[data-carousel-prev]");
    var next = carousel.querySelector("[data-carousel-next]");
    if (!track) return;
    var slides = track.querySelectorAll(".placeholder-img");
    var count = slides.length;
    var index = 0;

    var counter = document.createElement("span");
    counter.className = "carousel-counter";
    counter.setAttribute("aria-live", "polite");
    if (prev && next && prev.parentNode === next.parentNode) {
      next.parentNode.insertBefore(counter, next);
    }

    function updateCounter() {
      counter.textContent = (index + 1) + " / " + count;
    }

    function goTo(i) {
      index = (i + count) % count;
      track.scrollTo({ left: index * track.clientWidth, behavior: "smooth" });
      updateCounter();
    }

    if (prev) prev.addEventListener("click", function () { goTo(index - 1); });
    if (next) next.addEventListener("click", function () { goTo(index + 1); });

    // Keep the counter right when the visitor swipes instead
    var scrollTimer;
    track.addEventListener("scroll", function () {
      clearTimeout(scrollTimer);
      scrollTimer = setTimeout(function () {
        index = Math.round(track.scrollLeft / track.clientWidth);
        updateCounter();
      }, 80);
    });

    // Stay on the same slide when the window is resized
    window.addEventListener("resize", function () {
      track.scrollTo({ left: index * track.clientWidth });
    });

    updateCounter();
  });

  // Process nav: numbered buttons that smooth-scroll to a section id
  // given in their data-target attribute
  function scrollToStep(id) {
    var target = document.getElementById(id);
    if (target) target.scrollIntoView({ behavior: "smooth", block: "start" });
  }
  document.querySelectorAll(".process-nav button").forEach(function (btn) {
    btn.addEventListener("click", function () {
      scrollToStep(btn.getAttribute("data-target"));
    });
  });

  // ---- Sticky process steps bar ----
  // Once "The process" buttons scroll out of view, a copy of them sticks
  // just below the main nav, highlighting the step currently being read.
  // If the steps don't fit the screen width it collapses into a dropdown.
  var header = document.querySelector(".site-header");
  var processNav = document.querySelector(".process-nav");
  if (header && processNav) {
    var stepButtons = Array.prototype.slice.call(processNav.querySelectorAll("button"));
    var steps = stepButtons.map(function (btn) {
      return {
        id: btn.getAttribute("data-target"),
        num: btn.querySelector(".step-num").textContent,
        name: btn.textContent.replace(btn.querySelector(".step-num").textContent, "").trim()
      };
    });

    var subnav = document.createElement("div");
    subnav.className = "process-subnav";
    subnav.innerHTML =
      '<div class="container process-subnav-inner">' +
        '<span class="process-subnav-title">The process</span>' +
        '<button class="process-subnav-toggle" type="button" aria-expanded="false">' +
          '<span class="step-num"></span><span class="process-subnav-current"></span>' +
          '<span class="chevron" aria-hidden="true">&#9662;</span>' +
        "</button>" +
        '<nav class="process-subnav-list" aria-label="Process steps"></nav>' +
      "</div>";
    header.appendChild(subnav);

    var list = subnav.querySelector(".process-subnav-list");
    var toggleBtn = subnav.querySelector(".process-subnav-toggle");
    var subButtons = steps.map(function (step) {
      var b = document.createElement("button");
      b.type = "button";
      b.innerHTML = '<span class="step-num">' + step.num + "</span> " + step.name;
      b.addEventListener("click", function () {
        subnav.classList.remove("expanded");
        toggleBtn.setAttribute("aria-expanded", "false");
        scrollToStep(step.id);
      });
      list.appendChild(b);
      return b;
    });

    toggleBtn.addEventListener("click", function () {
      var open = subnav.classList.toggle("expanded");
      toggleBtn.setAttribute("aria-expanded", open ? "true" : "false");
    });

    var activeIndex = -1;
    function setActive(i) {
      if (i === activeIndex) return;
      activeIndex = i;
      subButtons.forEach(function (b, j) {
        b.classList.toggle("active", j === i);
        if (j === i) b.setAttribute("aria-current", "step");
        else b.removeAttribute("aria-current");
      });
      var step = steps[Math.max(i, 0)];
      toggleBtn.querySelector(".step-num").textContent = step.num;
      toggleBtn.querySelector(".process-subnav-current").textContent = step.name;
    }

    // Collapse to a dropdown only when the full row would overflow
    function fitSubnav() {
      var wasExpanded = subnav.classList.contains("expanded");
      subnav.classList.remove("compact", "expanded");
      if (list.scrollWidth > list.clientWidth + 1) {
        subnav.classList.add("compact");
        if (wasExpanded) subnav.classList.add("expanded");
      }
      root.style.setProperty("--scroll-offset", (header.offsetHeight + subnavHeight() + 12) + "px");
    }
    function subnavHeight() {
      // Collapsed height, so jumping to a step lines up under the bar
      return subnav.querySelector(".process-subnav-inner").offsetHeight -
        (subnav.classList.contains("expanded") ? list.offsetHeight : 0);
    }

    var ticking = false;
    function onScroll() {
      ticking = false;
      var headerH = header.offsetHeight;
      var show = processNav.getBoundingClientRect().bottom < headerH;
      subnav.classList.toggle("visible", show);
      if (!show) {
        subnav.classList.remove("expanded");
        toggleBtn.setAttribute("aria-expanded", "false");
      }

      var line = headerH + subnavHeight() + 40;
      var current = -1;
      steps.forEach(function (step, i) {
        var el = document.getElementById(step.id);
        if (el && el.getBoundingClientRect().top <= line) current = i;
      });
      setActive(current);
    }
    function requestUpdate() {
      if (!ticking) { ticking = true; requestAnimationFrame(onScroll); }
    }

    window.addEventListener("scroll", requestUpdate, { passive: true });
    window.addEventListener("resize", function () { fitSubnav(); requestUpdate(); });
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(fitSubnav);
    fitSubnav();
    onScroll();
  }

  // ---- Back-to-top button (case study pages) ----
  if (document.body.classList.contains("case-study-page")) {
    var toTop = document.createElement("button");
    toTop.type = "button";
    toTop.className = "back-to-top";
    toTop.setAttribute("aria-label", "Back to top");
    toTop.title = "Back to top";
    toTop.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 19V5M5 12l7-7 7 7"/></svg>';
    document.body.appendChild(toTop);
    toTop.addEventListener("click", function () {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
    var updateToTop = function () {
      toTop.classList.toggle("visible", window.scrollY > window.innerHeight * 0.6);
    };
    window.addEventListener("scroll", updateToTop, { passive: true });
    updateToTop();
  }

  // ---- Lightbox: click any placeholder image to view it larger ----
  // Images inside a link (e.g. the homepage cover image that links to a
  // case study) are skipped here, so clicking them just follows the link.
  var overlay = document.createElement("div");
  overlay.className = "lightbox-overlay";
  overlay.innerHTML =
    '<button class="lightbox-close" aria-label="Close">&times;</button>' +
    '<button class="lightbox-prev" aria-label="Previous image">&larr;</button>' +
    '<div class="lightbox-content"></div>' +
    '<button class="lightbox-next" aria-label="Next image">&rarr;</button>';
  document.body.appendChild(overlay);

  var contentEl = overlay.querySelector(".lightbox-content");
  var prevBtn = overlay.querySelector(".lightbox-prev");
  var nextBtn = overlay.querySelector(".lightbox-next");
  var closeBtn = overlay.querySelector(".lightbox-close");
  var currentGroup = [];
  var currentIndex = 0;

  function showIndex(i) {
    if (!currentGroup.length) return;
    currentIndex = (i + currentGroup.length) % currentGroup.length;
    contentEl.innerHTML = "";
    contentEl.appendChild(currentGroup[currentIndex].cloneNode(true));
    var multi = currentGroup.length > 1;
    prevBtn.style.display = multi ? "flex" : "none";
    nextBtn.style.display = multi ? "flex" : "none";
  }

  function openLightbox(group, index) {
    currentGroup = group;
    showIndex(index);
    overlay.classList.add("open");
    document.body.style.overflow = "hidden";
  }

  function closeLightbox() {
    overlay.classList.remove("open");
    document.body.style.overflow = "";
  }

  overlay.addEventListener("click", function (e) {
    if (e.target === overlay) closeLightbox();
  });
  closeBtn.addEventListener("click", closeLightbox);
  prevBtn.addEventListener("click", function () { showIndex(currentIndex - 1); });
  nextBtn.addEventListener("click", function () { showIndex(currentIndex + 1); });
  document.addEventListener("keydown", function (e) {
    if (!overlay.classList.contains("open")) return;
    if (e.key === "Escape") closeLightbox();
    if (e.key === "ArrowLeft") showIndex(currentIndex - 1);
    if (e.key === "ArrowRight") showIndex(currentIndex + 1);
  });

  // Carousel images: clicking one opens the lightbox on that whole
  // carousel's set, so visitors can step through with the same arrows.
  document.querySelectorAll(".carousel-track").forEach(function (track) {
    var items = Array.prototype.slice.call(track.querySelectorAll(".placeholder-img"));
    items.forEach(function (item, idx) {
      item.addEventListener("click", function () {
        openLightbox(items, idx);
      });
    });
  });

  // Any other standalone placeholder image (not in a carousel, and not
  // sitting inside a link) opens the lightbox on just itself.
  document.querySelectorAll(".placeholder-img").forEach(function (item) {
    if (item.closest(".carousel-track") || item.closest("a")) return;
    item.addEventListener("click", function () {
      openLightbox([item], 0);
    });
  });
});
