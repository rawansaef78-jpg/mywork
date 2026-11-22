/* ==========================================================================
   معرض الأعمال — الحركات والتفاعلات
   ========================================================================== */
(function () {
  "use strict";

  var doc = document;
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ------------------------------------------------- 1. قائمة الجوال */
  function initNav() {
    var toggle = doc.querySelector(".nav-toggle");
    var links = doc.querySelector(".nav-links");
    if (!toggle || !links) return;

    function setState(open) {
      links.classList.toggle("open", open);
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
      toggle.setAttribute("aria-label", open ? "إغلاق القائمة" : "فتح القائمة");
    }

    toggle.addEventListener("click", function () {
      setState(!links.classList.contains("open"));
    });

    links.addEventListener("click", function (e) {
      if (e.target.closest("a")) setState(false);
    });

    doc.addEventListener("keydown", function (e) {
      if (e.key === "Escape") setState(false);
    });

    doc.addEventListener("click", function (e) {
      if (!links.classList.contains("open")) return;
      if (!links.contains(e.target) && !toggle.contains(e.target)) setState(false);
    });

    window.addEventListener("resize", function () {
      if (window.innerWidth > 760) setState(false);
    });
  }

  /* ------------------------------------------- 2. الرابط النشط في القائمة */
  function initActiveLink() {
    var current = (doc.body.getAttribute("data-page") || "").trim();
    if (!current) return;
    var links = doc.querySelectorAll(".nav-links a[href]");
    Array.prototype.forEach.call(links, function (link) {
      var href = link.getAttribute("href") || "";
      if (href === current) {
        link.classList.add("active");
        link.setAttribute("aria-current", "page");
      }
    });
  }

  /* ------------------------------------------- 3. هيدر عند التمرير + زر أعلى */
  function initScrollUI() {
    var header = doc.querySelector(".site-header");
    var toTop = doc.querySelector(".to-top");

    function onScroll() {
      var y = window.scrollY || doc.documentElement.scrollTop;
      if (header) header.classList.toggle("scrolled", y > 12);
      if (toTop) toTop.classList.toggle("show", y > 420);
    }

    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();

    if (toTop) {
      toTop.addEventListener("click", function () {
        window.scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "smooth" });
      });
    }
  }

  /* ----------------------------------------------- 4. ظهور العناصر تدريجيًا */
  function initReveal() {
    var items = doc.querySelectorAll(".reveal");
    if (!items.length) return;

    if (reduceMotion || !("IntersectionObserver" in window)) {
      Array.prototype.forEach.call(items, function (el) { el.classList.add("visible"); });
      return;
    }

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -60px 0px" });

    Array.prototype.forEach.call(items, function (el) { observer.observe(el); });
  }

  /* ------------------------------------------- 8. تأخير متزايد عند ظهور البطاقات */
  function initStaggeredGrid() {
    var grids = doc.querySelectorAll(".grid");
    Array.prototype.forEach.call(grids, function (grid) {
      var cards = grid.querySelectorAll(":scope > .card");
      Array.prototype.forEach.call(cards, function (card, i) {
        if (card.classList.contains("reveal")) card.style.transitionDelay = (i * 0.07) + "s";
      });
    });
  }

  /* ------------------------------------------------- 9. سنة الفوتر + أرقام التعداد */
  function initYear() {
    var slots = doc.querySelectorAll("[data-year]");
    var year = String(new Date().getFullYear());
    Array.prototype.forEach.call(slots, function (el) { el.textContent = year; });
  }

  function initStats() {
    var stats = doc.querySelectorAll(".hero-stats strong");
    Array.prototype.forEach.call(stats, function (el) {
      var text = el.textContent;
      var m = text.match(/(\d+)/);
      if (!m) return;
      var target = parseInt(m[1], 10);
      var suffix = text.replace(/[0-9]/g, "").trim();
      var duration = 1600;
      var startAt = 0;

      if (reduceMotion || !("IntersectionObserver" in window)) {
        el.textContent = String(target) + suffix;
        return;
      }

      var io = new IntersectionObserver(function (entries, obs) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          obs.unobserve(el);
          var start = null;
          function tick(t) {
            if (start === null) start = t;
            var p = Math.min(1, (t - start) / duration);
            var eased = p === 1 ? 1 : 1 - Math.pow(2, -10 * p);
            el.textContent = String(Math.round(startAt + (target - startAt) * eased)) + suffix;
            if (p < 1) requestAnimationFrame(tick);
          }
          requestAnimationFrame(tick);
        });
      }, { threshold: 0.4 });

      io.observe(el);
    });
  }

  /* --------------------------------- 6. نموذج التواصل (إرسال عبر واتساب) */
  function initContactForm() {
    var form = doc.querySelector("[data-contact-form]");
    if (!form) return;

    var phone = form.getAttribute("data-phone") || "";
    var status = doc.querySelector("[data-form-status]");

    function showError(field, message) {
      var wrap = field.closest(".field");
      var box = wrap ? wrap.querySelector(".field-error") : null;
      if (wrap) wrap.classList.add("invalid");
      if (box) box.textContent = message;
    }

    function clearErrors() {
      Array.prototype.forEach.call(form.querySelectorAll(".field"), function (f) {
        f.classList.remove("invalid");
        var box = f.querySelector(".field-error");
        if (box) box.textContent = "";
      });
    }

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      clearErrors();

      var name = form.querySelector("[name='name']");
      var email = form.querySelector("[name='email']");
      var message = form.querySelector("[name='message']");
      var valid = true;

      if (!name || !name.value.trim()) {
        showError(name, "اكتب اسمك من فضلك.");
        valid = false;
      }
      if (email && email.value.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.value.trim())) {
        showError(email, "صيغة البريد الإلكتروني غير صحيحة.");
        valid = false;
      }
      if (!message || !message.value.trim()) {
        showError(message, "اكتب رسالتك أولاً.");
        valid = false;
      }
      if (!valid) return;

      var lines = [
        "السلام عليكم، أنا " + name.value.trim() + ".",
        email && email.value.trim() ? "البريد: " + email.value.trim() : "",
        "الرسالة: " + message.value.trim()
      ].filter(Boolean);

      var url = "https://wa.me/" + phone.replace(/\D/g, "") + "?text=" + encodeURIComponent(lines.join("\n"));
      window.open(url, "_blank", "noopener");

      if (status) {
        status.textContent = "تم تجهيز رسالتك — أرسلناها إلى واتساب في نافذة جديدة.";
        status.hidden = false;
      }
      form.reset();
    });
  }

  /* ------------------------------------------- 10. مودال تفاصيل المشروع */
  function initProjectModal() {
    var overlay = doc.querySelector(".modal-overlay");
    var cards = doc.querySelectorAll(".card[data-project]");
    if (!overlay || !cards.length) return;

    var trigger = null;

    function setContent(card) {
      overlay.querySelector("[data-modal-img]").src = card.getAttribute("data-image");
      overlay.querySelector("[data-modal-img]").alt = card.getAttribute("data-project");
      overlay.querySelector("[data-modal-title]").textContent = card.getAttribute("data-project");
      overlay.querySelector("[data-modal-desc]").textContent = card.getAttribute("data-desc");
      overlay.querySelector("[data-modal-link]").href = card.getAttribute("data-link");
    }

    function open(card) {
      trigger = card;
      setContent(card);
      overlay.classList.add("open");
      overlay.setAttribute("aria-hidden", "false");
      doc.body.style.overflow = "hidden";
      var closeBtn = overlay.querySelector(".modal-close");
      if (closeBtn) closeBtn.focus();
    }

    function close() {
      overlay.classList.remove("open");
      overlay.setAttribute("aria-hidden", "true");
      doc.body.style.overflow = "";
      if (trigger) { trigger.focus(); trigger = null; }
    }

    Array.prototype.forEach.call(cards, function (card) {
      card.addEventListener("click", function (e) {
        if (e.target.closest("a")) return;
        open(card);
      });
      card.addEventListener("keydown", function (e) {
        if ((e.key === "Enter" || e.key === " ") && !e.target.closest("a")) {
          e.preventDefault();
          open(card);
        }
      });
    });

    overlay.addEventListener("click", function (e) {
      if (e.target === overlay) close();
    });

    doc.addEventListener("keydown", function (e) {
      if (e.key === "Escape") close();
    });
  }

  /* ------------------------------------------------------- 7. التشغيل */
  function init() {
    initNav();
    initActiveLink();
    initScrollUI();
    initReveal();
    initStaggeredGrid();
    initStats();
    initYear();
    initContactForm();
    initProjectModal();
  }

  if (doc.readyState === "loading") {
    doc.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
