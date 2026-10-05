(function () {
  "use strict";

  var header = document.querySelector(".site-header");
  var toggle = document.querySelector(".nav-toggle");
  var nav = document.querySelector("#site-nav");
  var year = document.querySelector("#year");
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (year) year.textContent = String(new Date().getFullYear());

  if (header) {
    var ticking = false;
    var updateHeader = function () {
      header.classList.toggle("is-scrolled", window.scrollY > 12);
      ticking = false;
    };
    updateHeader();
    window.addEventListener("scroll", function () {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(updateHeader);
      }
    }, { passive: true });
  }

  if (toggle && nav) {
    var closeNav = function () {
      nav.classList.remove("is-open");
      toggle.setAttribute("aria-expanded", "false");
      toggle.setAttribute("aria-label", "Abrir menú");
    };
    toggle.addEventListener("click", function () {
      var open = nav.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
      toggle.setAttribute("aria-label", open ? "Cerrar menú" : "Abrir menú");
    });
    nav.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", closeNav);
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") closeNav();
    });
  }

  if (!reduceMotion) {
    document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
      anchor.addEventListener("click", function (e) {
        var id = anchor.getAttribute("href");
        if (!id || id === "#") return;
        var target = document.querySelector(id);
        if (!target) return;
        e.preventDefault();
        target.scrollIntoView({ behavior: "smooth", block: "start" });
        if (history.pushState) history.pushState(null, "", id);
      });
    });
  }

  // Lazy-load non-critical images (logo stays eager)
  var lazyImgs = document.querySelectorAll("img[data-src], img.lazy");
  if (lazyImgs.length) {
    var loadImg = function (img) {
      if (img.dataset.src) {
        img.src = img.dataset.src;
        img.removeAttribute("data-src");
      }
      if (img.dataset.srcset) {
        img.srcset = img.dataset.srcset;
        img.removeAttribute("data-srcset");
      }
      img.classList.remove("lazy");
    };
    if ("IntersectionObserver" in window) {
      var imgIo = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            loadImg(entry.target);
            imgIo.unobserve(entry.target);
          }
        });
      }, { rootMargin: "200px 0px" });
      lazyImgs.forEach(function (img) { imgIo.observe(img); });
    } else {
      lazyImgs.forEach(loadImg);
    }
  }

  // Native lazy as progressive enhancement for any future images
  document.querySelectorAll("img:not([fetchpriority='high'])").forEach(function (img) {
    if (!img.hasAttribute("loading") && !img.closest(".logo")) {
      img.setAttribute("loading", "lazy");
      img.setAttribute("decoding", "async");
    }
  });

  var reveals = document.querySelectorAll(".reveal");
  if (!reveals.length) return;
  if (reduceMotion || !("IntersectionObserver" in window)) {
    reveals.forEach(function (el) { el.classList.add("is-in"); });
    return;
  }
  var io = new IntersectionObserver(function (entries) {
    for (var i = 0; i < entries.length; i++) {
      if (entries[i].isIntersecting) {
        entries[i].target.classList.add("is-in");
        io.unobserve(entries[i].target);
      }
    }
  }, { rootMargin: "0px 0px -6% 0px", threshold: 0.08 });
  for (var j = 0; j < reveals.length; j++) io.observe(reveals[j]);
})();
