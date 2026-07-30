/* ============================================================
   SAFI SISTEMAS — main.js
   Interacciones: header, menú móvil, reveals, contadores,
   FAQ, formulario de contacto y marquesinas.
   ============================================================ */
(function () {
  "use strict";

  /* ---------- Header: ocultar al bajar, mostrar al subir ---------- */
  var header = document.querySelector(".site-header");
  var lastY = window.scrollY;
  function onScroll() {
    var y = window.scrollY;
    if (!header) return;
    if (y > 140 && y > lastY && !document.body.classList.contains("menu-open")) {
      header.classList.add("is-hidden");
    } else {
      header.classList.remove("is-hidden");
    }
    lastY = y;
  }
  window.addEventListener("scroll", onScroll, { passive: true });

  /* ---------- Menú móvil ---------- */
  var toggle = document.querySelector(".menu-toggle");
  if (toggle) {
    toggle.addEventListener("click", function () {
      var open = document.body.classList.toggle("menu-open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
      document.documentElement.style.overflow = open ? "hidden" : "";
    });
    document.querySelectorAll(".mobile-nav a").forEach(function (a) {
      a.addEventListener("click", function () {
        document.body.classList.remove("menu-open");
        document.documentElement.style.overflow = "";
      });
    });
  }

  /* ---------- Aparición al hacer scroll (reveal) ---------- */
  var revealEls = document.querySelectorAll(".reveal, .reveal-img");
  if ("IntersectionObserver" in window && revealEls.length) {
    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("in");
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -8% 0px" }
    );
    revealEls.forEach(function (el) { io.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add("in"); });
  }

  /* ---------- Contadores animados ---------- */
  function animateCounter(el) {
    var target = parseFloat(el.dataset.count);
    var prefix = el.dataset.prefix || "";
    var suffix = el.dataset.suffix || "";
    var decimals = (el.dataset.decimals && parseInt(el.dataset.decimals, 10)) || 0;
    var duration = 1600;
    var start = null;
    function step(ts) {
      if (!start) start = ts;
      var p = Math.min((ts - start) / duration, 1);
      var eased = 1 - Math.pow(1 - p, 3);
      var val = target * eased;
      el.textContent = prefix + val.toFixed(decimals) + suffix;
      if (p < 1) requestAnimationFrame(step);
      else el.textContent = prefix + target.toFixed(decimals) + suffix;
    }
    requestAnimationFrame(step);
  }
  var counters = document.querySelectorAll("[data-count]");
  if ("IntersectionObserver" in window && counters.length) {
    var ioC = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            animateCounter(entry.target);
            ioC.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.5 }
    );
    counters.forEach(function (el) { ioC.observe(el); });
  } else {
    counters.forEach(animateCounter);
  }

  /* ---------- Filas desplegables (acc-rows) ---------- */
  document.querySelectorAll(".acc-rows").forEach(function (rows) {
    var items = rows.querySelectorAll(".acc-item");
    function setItem(item, open) {
      var body = item.querySelector(".acc-body");
      var head = item.querySelector(".acc-head");
      item.classList.toggle("open", open);
      head.setAttribute("aria-expanded", String(open));
      body.style.maxHeight = open ? body.scrollHeight + "px" : null;
    }
    items.forEach(function (item) {
      var head = item.querySelector(".acc-head");
      head.addEventListener("click", function () {
        var willOpen = !item.classList.contains("open");
        items.forEach(function (other) { setItem(other, false); });
        if (willOpen) setItem(item, true);
      });
    });
    // Abrir uno a uno al hacer scroll (solo si el usuario no ha interactuado)
    var userTouched = false;
    rows.addEventListener("pointerdown", function () { userTouched = true; }, { once: true });
    if ("IntersectionObserver" in window && items.length) {
      var ioA = new IntersectionObserver(
        function (entries) {
          entries.forEach(function (entry) {
            if (entry.isIntersecting) {
              var item = entry.target;
              ioA.unobserve(item);
              if (userTouched) return;
              setTimeout(function () {
                if (userTouched) return;
                items.forEach(function (other) { setItem(other, false); });
                setItem(item, true);
              }, 350);
            }
          });
        },
        { threshold: 0.65 }
      );
      items.forEach(function (item) { ioA.observe(item); });
    }
  });

  /* ---------- Galería vertical (hero servicios) ---------- */
  document.querySelectorAll(".vslider").forEach(function (root) {
    var viewport = root.querySelector(".vslider-viewport");
    var track = root.querySelector(".vslider-track");
    var prev = root.querySelector(".vslider-prev");
    var next = root.querySelector(".vslider-next");
    if (!viewport || !track || !prev || !next) return;
    var index = 0;
    function maxIndex() {
      return Math.max(0, track.scrollHeight - viewport.clientHeight);
    }
    function gapSize() {
      var g = parseFloat(getComputedStyle(track).rowGap || getComputedStyle(track).gap) || 0;
      return g;
    }
    function step() {
      var first = track.querySelector("figure");
      return first ? first.getBoundingClientRect().height + gapSize() : 0;
    }
    function apply() {
      var max = maxIndex();
      if (index > max) index = max;
      if (index < 0) index = 0;
      track.style.transform = "translateY(" + -index + "px)";
      prev.disabled = index <= 0;
      next.disabled = index >= max - 1;
    }
    prev.addEventListener("click", function () { index -= step(); apply(); });
    next.addEventListener("click", function () { index += step(); apply(); });
    window.addEventListener("resize", apply);
    apply();
  });

  /* ---------- Popup de imagen (certificados y similares) ---------- */
  var zoomables = document.querySelectorAll("[data-full]");
  if (zoomables.length) {
    var modal = document.createElement("div");
    modal.className = "img-modal";
    modal.setAttribute("role", "dialog");
    modal.setAttribute("aria-label", "Imagen ampliada");
    modal.innerHTML = '<figure><button class="img-modal-close" aria-label="Cerrar">×</button><img src="" alt=""></figure>';
    document.body.appendChild(modal);
    var modalImg = modal.querySelector("img");
    var modalClose = modal.querySelector(".img-modal-close");
    function openModal(src, alt) {
      modalImg.src = src;
      modalImg.alt = alt || "";
      modal.classList.add("is-open");
      document.documentElement.style.overflow = "hidden";
    }
    function closeModal() {
      modal.classList.remove("is-open");
      document.documentElement.style.overflow = "";
    }
    zoomables.forEach(function (el) {
      var src = el.getAttribute("data-full");
      var alt = (el.querySelector("img") || {}).alt || "";
      el.addEventListener("click", function () { openModal(src, alt); });
      el.addEventListener("keydown", function (e) {
        if (e.key === "Enter" || e.key === " ") { e.preventDefault(); openModal(src, alt); }
      });
    });
    modalClose.addEventListener("click", closeModal);
    modal.addEventListener("click", function (e) { if (e.target === modal) closeModal(); });
    document.addEventListener("keydown", function (e) { if (e.key === "Escape") closeModal(); });
  }

  /* ---------- FAQ (acordeón) ---------- */
  document.querySelectorAll(".faq-item").forEach(function (item) {
    var q = item.querySelector(".faq-q");
    var a = item.querySelector(".faq-a");
    if (!q || !a) return;
    q.addEventListener("click", function () {
      var isOpen = item.classList.contains("open");
      // Cerrar los demás dentro del mismo bloque FAQ
      var parent = item.closest(".faq");
      if (parent) {
        parent.querySelectorAll(".faq-item.open").forEach(function (other) {
          if (other !== item) {
            other.classList.remove("open");
            other.querySelector(".faq-a").style.maxHeight = null;
            other.querySelector(".faq-q").setAttribute("aria-expanded", "false");
          }
        });
      }
      item.classList.toggle("open", !isOpen);
      q.setAttribute("aria-expanded", String(!isOpen));
      a.style.maxHeight = !isOpen ? a.scrollHeight + "px" : null;
    });
  });

  /* ---------- Formulario de contacto (demo sin backend) ---------- */
  var form = document.querySelector("#contact-form");
  if (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      if (!form.checkValidity()) {
        form.reportValidity();
        return;
      }
      var success = form.querySelector(".form-success");
      var btn = form.querySelector("button[type='submit']");
      if (btn) {
        btn.disabled = true;
        btn.textContent = "Enviando…";
      }
      // Simulación de envío. Sustituir por fetch() al endpoint real.
      setTimeout(function () {
        form.reset();
        if (success) {
          success.classList.add("visible");
          success.setAttribute("tabindex", "-1");
          success.focus();
        }
        if (btn) {
          btn.disabled = false;
          btn.innerHTML = 'Enviar mensaje <span class="arrow">→</span>';
        }
      }, 900);
    });
  }

  /* ---------- Año actual en el footer ---------- */
  document.querySelectorAll("[data-year]").forEach(function (el) {
    el.textContent = new Date().getFullYear();
  });

  /* ---------- Enlace activo en la navegación ---------- */
  var path = location.pathname.split("/").pop() || "index.html";
  document.querySelectorAll(".main-nav a").forEach(function (a) {
    var href = a.getAttribute("href");
    if (href === path) a.setAttribute("aria-current", "page");
  });
})();
