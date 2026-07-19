(function () {
  "use strict";

  // Footer year
  var yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  // Mobile nav toggle
  var hamburger = document.getElementById("hamburger");
  var mobileNav = document.getElementById("mobileNav");

  function closeMobileNav() {
    if (!hamburger || !mobileNav) return;
    hamburger.setAttribute("aria-expanded", "false");
    mobileNav.classList.remove("is-open");
  }

  if (hamburger && mobileNav) {
    hamburger.addEventListener("click", function () {
      var isOpen = hamburger.getAttribute("aria-expanded") === "true";
      hamburger.setAttribute("aria-expanded", String(!isOpen));
      mobileNav.classList.toggle("is-open", !isOpen);
    });

    mobileNav.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", closeMobileNav);
    });
  }

  // Smooth-scroll offset for sticky header (native scroll-behavior handles the rest)
  document.querySelectorAll('a[href^="#"]').forEach(function (link) {
    link.addEventListener("click", function (e) {
      var id = link.getAttribute("href");
      if (!id || id === "#") return;
      var target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      var headerOffset = 90;
      var top = target.getBoundingClientRect().top + window.pageYOffset - headerOffset;
      window.scrollTo({ top: top, behavior: "smooth" });
      closeMobileNav();
    });
  });

  // Accordion (FAQ)
  var accordion = document.getElementById("accordion");
  if (accordion) {
    accordion.querySelectorAll(".accordion-item__head").forEach(function (head) {
      head.addEventListener("click", function () {
        var item = head.closest(".accordion-item");
        var body = item.querySelector(".accordion-item__body");
        var isOpen = head.getAttribute("aria-expanded") === "true";

        accordion.querySelectorAll(".accordion-item__head").forEach(function (otherHead) {
          if (otherHead !== head) {
            otherHead.setAttribute("aria-expanded", "false");
            otherHead.closest(".accordion-item").querySelector(".accordion-item__body").style.maxHeight = null;
          }
        });

        head.setAttribute("aria-expanded", String(!isOpen));
        body.style.maxHeight = isOpen ? null : body.scrollHeight + "px";
      });
    });
  }

  // Contact form -> Supabase (public "inquiries" table, insert-only via publishable key)
  var sbClient = null;
  if (window.supabase && window.SUPABASE_URL && window.SUPABASE_ANON_KEY) {
    sbClient = window.supabase.createClient(window.SUPABASE_URL, window.SUPABASE_ANON_KEY);
  }

  var form = document.getElementById("contactForm");
  var status = document.getElementById("formStatus");
  if (form && status) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      if (!form.checkValidity()) {
        form.reportValidity();
        return;
      }

      var name = document.getElementById("name").value.trim();
      var payload = {
        name: name,
        phone: document.getElementById("phone").value.trim(),
        topic: document.getElementById("topic").value,
        message: document.getElementById("message").value.trim()
      };

      var submitBtn = form.querySelector('button[type="submit"]');
      if (submitBtn) submitBtn.disabled = true;
      status.textContent = "접수 중입니다...";

      if (!sbClient) {
        status.textContent = "상담 신청 접수에 실패했습니다. 잠시 후 다시 시도해 주시거나 전화로 문의해 주세요.";
        if (submitBtn) submitBtn.disabled = false;
        return;
      }

      sbClient
        .from("inquiries")
        .insert([payload])
        .then(function (result) {
          if (submitBtn) submitBtn.disabled = false;
          if (result.error) {
            status.textContent = "상담 신청 접수에 실패했습니다. 잠시 후 다시 시도해 주시거나 전화로 문의해 주세요.";
            return;
          }
          status.textContent = name
            ? name + "님, 상담 신청이 접수되었습니다. 빠르게 연락드리겠습니다."
            : "상담 신청이 접수되었습니다. 빠르게 연락드리겠습니다.";
          form.reset();
        });
    });
  }

  // Scroll reveal
  var revealEls = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window && revealEls.length) {
    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15 }
    );
    revealEls.forEach(function (el) { observer.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add("is-visible"); });
  }

  // Back-to-top button visibility
  var toTop = document.getElementById("toTop");
  if (toTop) {
    window.addEventListener("scroll", function () {
      toTop.classList.toggle("is-visible", window.scrollY > 480);
    });
  }
})();
