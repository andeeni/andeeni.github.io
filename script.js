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

  // Carousels: each ".carousel" has a ".carousel-track" and optional
  // prev/next buttons with data-carousel-prev / data-carousel-next
  document.querySelectorAll(".carousel").forEach(function (carousel) {
    var track = carousel.querySelector(".carousel-track");
    var prev = carousel.querySelector("[data-carousel-prev]");
    var next = carousel.querySelector("[data-carousel-next]");
    if (!track) return;
    var scrollAmount = 260;
    if (prev) prev.addEventListener("click", function () {
      track.scrollBy({ left: -scrollAmount, behavior: "smooth" });
    });
    if (next) next.addEventListener("click", function () {
      track.scrollBy({ left: scrollAmount, behavior: "smooth" });
    });
  });

  // Process nav: numbered buttons that smooth-scroll to a section id
  // given in their data-target attribute
  document.querySelectorAll(".process-nav button").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var target = document.getElementById(btn.getAttribute("data-target"));
      if (target) target.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  });

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
