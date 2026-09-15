/* ==========================================================================
   animations.js - Masterclass Scroll Reveal & Entrance Animation Engine
   ========================================================================== */

(function () {
  let activeObserver = null;

  function initScrollAnimations() {
    const animatedElements = document.querySelectorAll("[data-reveal]");
    if (!animatedElements.length) return;

    if (!("IntersectionObserver" in window)) {
      // Fallback for browsers without IntersectionObserver
      animatedElements.forEach(el => el.classList.add("is-revealed"));
      return;
    }

    if (!activeObserver) {
      activeObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const el = entry.target;
            
            // Check custom delay attributes if inline style not already present
            const delay = el.getAttribute("data-delay") || el.getAttribute("data-reveal-delay");
            if (delay && !el.style.transitionDelay) {
              el.style.transitionDelay = delay.endsWith("ms") || delay.endsWith("s") ? delay : delay + "ms";
            }

            el.classList.add("is-revealed");
            observer.unobserve(el);
          }
        });
      }, {
        root: null,
        threshold: 0.05,
        rootMargin: "0px 0px -20px 0px"
      });
    }

    animatedElements.forEach(el => {
      // If already revealed or visible near top, trigger reveal immediately
      const rect = el.getBoundingClientRect();
      if (rect.top < window.innerHeight && rect.bottom > 0) {
        const delay = el.getAttribute("data-delay") || el.getAttribute("data-reveal-delay");
        if (delay && !el.style.transitionDelay) {
          el.style.transitionDelay = delay.endsWith("ms") || delay.endsWith("s") ? delay : delay + "ms";
        }
        el.classList.add("is-revealed");
      } else {
        activeObserver.observe(el);
      }
    });
  }

  // Global handle for dynamic re-initialization
  window.initScrollAnimations = initScrollAnimations;
  window.reinitScrollAnimations = initScrollAnimations;

  document.addEventListener("DOMContentLoaded", () => {
    initScrollAnimations();
    
    // Re-scan after short delay to capture dynamically rendered components (Header, Footer, Modals)
    setTimeout(initScrollAnimations, 200);
    setTimeout(initScrollAnimations, 600);
    setTimeout(initScrollAnimations, 1200);
  });

  // Listen to custom component loaded events from load-components.js
  document.addEventListener("componentsLoaded", initScrollAnimations);
})();
