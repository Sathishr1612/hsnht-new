/* animations.js - Custom lightweight scroll reveal and cinematic transitions */

document.addEventListener("DOMContentLoaded", () => {
  initScrollAnimations();
});

/* Simple intersection observer to add scroll slide/fade classes */
function initScrollAnimations() {
  const animatedElements = document.querySelectorAll("[data-reveal]");
  if (!animatedElements.length) return;

  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const el = entry.target;
        const animationType = el.getAttribute("data-reveal") || "fade-up";
        
        // Map data attribute to css style/transition triggers
        applyRevealStyle(el, animationType);
        
        observer.unobserve(el);
      }
    });
  }, {
    root: null,
    threshold: 0.15,
    rootMargin: "0px"
  });

  // Setup initial off-screen states
  animatedElements.forEach(el => {
    setupInitialState(el);
    revealObserver.observe(el);
  });
}

function setupInitialState(el) {
  const type = el.getAttribute("data-reveal");
  el.style.transition = "opacity 1.2s cubic-bezier(0.16, 1, 0.3, 1), transform 1.2s cubic-bezier(0.16, 1, 0.3, 1)";
  
  if (type === "fade-up") {
    el.style.opacity = "0";
    el.style.transform = "translateY(40px)";
  } else if (type === "fade-in") {
    el.style.opacity = "0";
  } else if (type === "slide-left") {
    el.style.opacity = "0";
    el.style.transform = "translateX(50px)";
  } else if (type === "slide-right") {
    el.style.opacity = "0";
    el.style.transform = "translateX(-50px)";
  } else if (type === "zoom-in") {
    el.style.opacity = "0";
    el.style.transform = "scale(0.95)";
  }
}

function applyRevealStyle(el, type) {
  el.style.opacity = "1";
  el.style.transform = "translate(0, 0) scale(1)";
}
