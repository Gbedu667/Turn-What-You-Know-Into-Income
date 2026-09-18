/* =========================================================
   Turn What You Know Into Income — script.js
   No dependencies. Progressive enhancement only.
   ========================================================= */
(function () {
  "use strict";

  /* =========================================================
     CONFIG — edit this one line to point every CTA button at
     your real training/checkout URL.
     ========================================================= */
  var TRAINING_URL = "https://chat.whatsapp.com/IjO8Fppmw0WExaUjhsydwQ?s=hd&p=i&mlu=4&ilr=4";

  document.querySelectorAll("[data-training-cta]").forEach(function (el) {
    el.setAttribute("href", TRAINING_URL);
  });

  var prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- Mobile navigation ---------- */
  var navToggle = document.querySelector(".nav-toggle");
  var mobileMenu = document.querySelector(".mobile-menu");

  if (navToggle && mobileMenu) {
    navToggle.addEventListener("click", function () {
      var isOpen = navToggle.getAttribute("aria-expanded") === "true";
      navToggle.setAttribute("aria-expanded", String(!isOpen));
      mobileMenu.classList.toggle("is-open", !isOpen);
      if (!isOpen) {
        var firstLink = mobileMenu.querySelector("a");
        if (firstLink) firstLink.focus();
      }
    });

    // Close mobile menu after choosing a link, and on Escape
    mobileMenu.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", function () {
        navToggle.setAttribute("aria-expanded", "false");
        mobileMenu.classList.remove("is-open");
      });
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && mobileMenu.classList.contains("is-open")) {
        navToggle.setAttribute("aria-expanded", "false");
        mobileMenu.classList.remove("is-open");
        navToggle.focus();
      }
    });
  }

  /* ---------- Active nav link on scroll ---------- */
  var sections = document.querySelectorAll("main section[id]");
  var navAnchors = document.querySelectorAll(".nav-links a[href^='#'], .mobile-menu a[href^='#']");

  if (sections.length && navAnchors.length && "IntersectionObserver" in window) {
    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            var id = entry.target.getAttribute("id");
            navAnchors.forEach(function (a) {
              var match = a.getAttribute("href") === "#" + id;
              if (match) {
                a.setAttribute("aria-current", "page");
              } else {
                a.removeAttribute("aria-current");
              }
            });
          }
        });
      },
      { rootMargin: "-40% 0px -55% 0px", threshold: 0 }
    );
    sections.forEach(function (s) { observer.observe(s); });
  }

  /* ---------- FAQ accordion ---------- */
  var faqItems = document.querySelectorAll(".faq-item");
  faqItems.forEach(function (item) {
    var question = item.querySelector(".faq-question");
    var answer = item.querySelector(".faq-answer");
    if (!question || !answer) return;

    question.addEventListener("click", function () {
      var expanded = question.getAttribute("aria-expanded") === "true";

      // Close other open items for a cleaner single-open accordion
      faqItems.forEach(function (other) {
        if (other === item) return;
        var otherQ = other.querySelector(".faq-question");
        var otherA = other.querySelector(".faq-answer");
        if (otherQ && otherQ.getAttribute("aria-expanded") === "true") {
          otherQ.setAttribute("aria-expanded", "false");
          otherA.style.maxHeight = null;
        }
      });

      question.setAttribute("aria-expanded", String(!expanded));
      answer.style.maxHeight = expanded ? null : answer.scrollHeight + "px";
    });
  });

  /* ---------- Scroll reveal ---------- */
  var revealEls = document.querySelectorAll(".reveal");
  if (revealEls.length) {
    if (prefersReducedMotion || !("IntersectionObserver" in window)) {
      revealEls.forEach(function (el) { el.classList.add("is-visible"); });
    } else {
      var revealObserver = new IntersectionObserver(
        function (entries, obs) {
          entries.forEach(function (entry) {
            if (entry.isIntersecting) {
              entry.target.classList.add("is-visible");
              obs.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.15 }
      );
      revealEls.forEach(function (el) { revealObserver.observe(el); });
    }
  }

  /* ---------- Cookie consent banner ---------- */
  var COOKIE_CONSENT_KEY = "twyk_cookie_consent"; // 'accepted' | 'rejected'
  var banner = document.querySelector(".cookie-banner");

  function getStoredConsent() {
    try {
      return window.localStorage.getItem(COOKIE_CONSENT_KEY);
    } catch (e) {
      return null;
    }
  }
  function setStoredConsent(value) {
    try {
      window.localStorage.setItem(COOKIE_CONSENT_KEY, value);
    } catch (e) {
      /* localStorage unavailable (private mode etc.) — banner will just re-show next visit */
    }
  }

  if (banner) {
    var existing = getStoredConsent();
    if (!existing) {
      banner.classList.add("is-visible");
    }

    var acceptBtn = banner.querySelector("[data-cookie-accept]");
    var rejectBtn = banner.querySelector("[data-cookie-reject]");

    if (acceptBtn) {
      acceptBtn.addEventListener("click", function () {
        setStoredConsent("accepted");
        banner.classList.remove("is-visible");
        document.dispatchEvent(new CustomEvent("cookieconsent:accepted"));
      });
    }
    if (rejectBtn) {
      rejectBtn.addEventListener("click", function () {
        setStoredConsent("rejected");
        banner.classList.remove("is-visible");
        document.dispatchEvent(new CustomEvent("cookieconsent:rejected"));
      });
    }
  }

  /*
   * Analytics loading gate:
   * If/when you add an analytics or tracking script, only load it after
   * consent is accepted, e.g.:
   *
   * document.addEventListener("cookieconsent:accepted", function () {
   *   var s = document.createElement("script");
   *   s.src = "https://example-analytics.com/script.js";
   *   document.head.appendChild(s);
   * });
   *
   * Do not load any non-essential tracking script before this event fires.
   */

  /* ---------- Newsletter form (client-side validation + consent) ---------- */
  var newsletterForm = document.querySelector("#newsletter-form");
  if (newsletterForm) {
    var statusEl = newsletterForm.querySelector(".form-status");

    newsletterForm.addEventListener("submit", function (e) {
      e.preventDefault();

      var emailInput = newsletterForm.querySelector("#newsletter-email");
      var consentInput = newsletterForm.querySelector("#newsletter-consent");
      var email = emailInput ? emailInput.value.trim() : "";
      var consentGiven = consentInput ? consentInput.checked : false;

      var emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

      if (!emailValid) {
        showStatus("Please enter a valid email address.", "error");
        emailInput.focus();
        return;
      }
      if (!consentGiven) {
        showStatus("Please agree to the Privacy Policy to continue.", "error");
        consentInput.focus();
        return;
      }

      /*
       * NOTE: This is a front-end-only placeholder. Wire this up to your
       * actual email provider / form backend (e.g. Mailchimp, ConvertKit,
       * your own API) before going live. Do not store submitted emails
       * anywhere client-side beyond this session.
       */
      showStatus("Thanks please check your inbox to confirm your subscription.", "success");
      newsletterForm.reset();
    });

    function showStatus(message, state) {
      if (!statusEl) return;
      statusEl.textContent = message;
      statusEl.setAttribute("data-state", state);
      statusEl.setAttribute("role", state === "error" ? "alert" : "status");
    }
  }
/* =========================================================
   Testimonial Lightbox
   ========================================================= */

const testimonialImages = [
  "assets/images/photo_5868520816952152593_y.jpg",
  "assets/images/photo_5868520816952152591_y.jpg",
  "assets/images/photo_5868520816952152592_x.jpg",
  "assets/images/photo_5868520816952152594_y.jpg",
  "assets/images/photo_5868520816952152595_y.jpg",
  "assets/images/photo_5868520816952152589_y.jpg",
  "assets/images/photo_5868520816952152590_y.jpg"
];

const testimonialButtons = document.querySelectorAll(
  ".testimonial-image"
);

const testimonialLightbox = document.getElementById(
  "testimonialLightbox"
);

const lightboxImage = document.getElementById(
  "lightboxImage"
);

const lightboxClose = document.querySelector(
  ".lightbox-close"
);

const lightboxPrev = document.querySelector(
  ".lightbox-prev"
);

const lightboxNext = document.querySelector(
  ".lightbox-next"
);

let currentTestimonial = 0;


/* Open lightbox */
function openTestimonial(index) {
  currentTestimonial = index;

  lightboxImage.src = testimonialImages[currentTestimonial];
  lightboxImage.alt =
    `Testimonial screenshot ${currentTestimonial + 1}`;

  testimonialLightbox.classList.add("is-open");
  testimonialLightbox.setAttribute("aria-hidden", "false");

  document.body.classList.add("testimonial-modal-open");
}


/* Close lightbox */
function closeTestimonial() {
  testimonialLightbox.classList.remove("is-open");
  testimonialLightbox.setAttribute("aria-hidden", "true");

  document.body.classList.remove("testimonial-modal-open");

  lightboxImage.src = "";
}


/* Show previous image */
function showPreviousTestimonial() {
  currentTestimonial =
    (currentTestimonial - 1 + testimonialImages.length) %
    testimonialImages.length;

  lightboxImage.src = testimonialImages[currentTestimonial];

  lightboxImage.alt =
    `Testimonial screenshot ${currentTestimonial + 1}`;
}


/* Show next image */
function showNextTestimonial() {
  currentTestimonial =
    (currentTestimonial + 1) %
    testimonialImages.length;

  lightboxImage.src = testimonialImages[currentTestimonial];

  lightboxImage.alt =
    `Testimonial screenshot ${currentTestimonial + 1}`;
}


/* Thumbnail clicks */
testimonialButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const index = Number(
      button.dataset.testimonial
    );

    openTestimonial(index);
  });
});


/* Controls */
lightboxClose.addEventListener(
  "click",
  closeTestimonial
);

lightboxPrev.addEventListener(
  "click",
  showPreviousTestimonial
);

lightboxNext.addEventListener(
  "click",
  showNextTestimonial
);


/* Click outside image to close */
testimonialLightbox.addEventListener("click", (event) => {
  if (event.target === testimonialLightbox) {
    closeTestimonial();
  }
});


/* Keyboard controls */
document.addEventListener("keydown", (event) => {
  if (!testimonialLightbox.classList.contains("is-open")) {
    return;
  }

  if (event.key === "Escape") {
    closeTestimonial();
  }

  if (event.key === "ArrowLeft") {
    showPreviousTestimonial();
  }

  if (event.key === "ArrowRight") {
    showNextTestimonial();
  }
});
  /* ---------- Smooth-scroll focus management for accessibility ----------
     Native CSS scroll-behavior handles the motion; this ensures keyboard/
     screen reader focus lands on the target section after navigation. */
  document.querySelectorAll("a[href^='#']").forEach(function (link) {
    link.addEventListener("click", function () {
      var id = link.getAttribute("href").slice(1);
      var target = id ? document.getElementById(id) : null;
      if (target) {
        window.setTimeout(function () {
          target.setAttribute("tabindex", "-1");
          target.focus({ preventScroll: true });
        }, prefersReducedMotion ? 0 : 400);
      }
    });
  });
})();
