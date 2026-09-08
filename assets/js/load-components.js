
(function () {
  'use strict';

  /**
   * Fetch an HTML file and inject its content into a placeholder element.
   * @param {string} url - Path to the HTML component file
   * @param {string} placeholderId - ID of the placeholder div
   * @returns {Promise<void>}
   */
  function loadComponent(url, placeholderId) {
    var placeholder = document.getElementById(placeholderId);
    if (!placeholder) return Promise.resolve();

    return fetch(url)
      .then(function (response) {
        if (!response.ok) throw new Error('Failed to load ' + url);
        return response.text();
      })
      .then(function (html) {
        placeholder.outerHTML = html;
      });
  }

  /**
   * Detect the current page filename and add 'active' class
   * to matching nav links in both desktop and mobile menus.
   */
  function setActiveNavLinks() {
    var path = window.location.pathname;
    var currentPage = path.substring(path.lastIndexOf('/') + 1) || 'index.html';

    // Handle root URL (no filename) as index.html
    if (currentPage === '' || currentPage === '/') {
      currentPage = 'index.html';
    }

    // Desktop navbar links
    var desktopLinks = document.querySelectorAll('#main-navbar .nav-link');
    desktopLinks.forEach(function (link) {
      var href = link.getAttribute('href');
      if (!href) return;

      // Direct page match
      if (href === currentPage) {
        link.classList.add('active');
      }

      // For service sub-pages, mark Services dropdown as active
      var servicePages = [
        'hair-restoration.html',
        'facial-hair-restoration.html', 'scalp-cosmetic-treatments.html',
        'dermatology-services.html'
      ];
      if (href === '#' && link.textContent.trim().startsWith('Services') && servicePages.indexOf(currentPage) !== -1) {
        link.classList.add('active');
      }

      // For results sub-pages, mark Results dropdown as active
      var resultsPages = ['before-after.html', 'testimonials.html', 'video-gallery.html'];
      if (href === '#' && link.textContent.trim().startsWith('Results') && resultsPages.indexOf(currentPage) !== -1) {
        link.classList.add('active');
      }
    });

    // Mobile drawer links
    var mobileLinks = document.querySelectorAll('.mobile-nav-panel .nav-link');
    mobileLinks.forEach(function (link) {
      var href = link.getAttribute('href');
      if (!href) return;

      if (href === currentPage) {
        link.classList.add('active');
      }
    });

    // Mobile dropdown items
    var mobileDropdownItems = document.querySelectorAll('.mobile-nav-panel .mobile-dropdown-item');
    mobileDropdownItems.forEach(function (link) {
      var href = link.getAttribute('href');
      if (href === currentPage) {
        link.classList.add('active');
      }
    });
  }

  // Load both components, then re-initialize everything
  Promise.all([
    loadComponent('header.html', 'header-placeholder'),
    loadComponent('footer.html', 'footer-placeholder')
  ]).then(function () {
    // 1. Mark the correct nav link as active
    setActiveNavLinks();

    // 2. Re-initialize Lucide icons on injected content
    if (typeof lucide !== 'undefined') {
      lucide.createIcons();
    }

    // 3. Re-initialize mobile navigation (mirrors initMobileNav from main.js)
    initMobileNavFromComponent();

    // 4. Re-initialize consultation modal (mirrors initConsultationModal from main.js)
    initConsultationModalFromComponent();

    // 5. Re-initialize testimonial video modal
    initTestimonialModalFromComponent();

    // 6. Re-initialize scroll progress / navbar scroll state
    initNavbarScrollState();

    // 7. Dispatch custom event for any page-specific scripts to hook into
    document.dispatchEvent(new CustomEvent('components-loaded'));

    // 8. If URL contains a hash, ensure smooth scroll after DOM is populated
    if (window.location.hash) {
      try {
        var hashTarget = document.querySelector(window.location.hash);
        if (hashTarget) {
          setTimeout(function () {
            hashTarget.scrollIntoView({ behavior: 'smooth' });
          }, 150);
        }
      } catch (e) {
        // invalid selector ignore
      }
    }
  }).catch(function (error) {
    console.error('Component loading error:', error);
  });

  /**
   * Mobile nav drawer open/close functionality
   */
  function initMobileNavFromComponent() {
    var toggleBtn = document.getElementById('mobile-menu-toggle');
    var closeBtn = document.getElementById('mobile-menu-close');
    var panel = document.getElementById('mobile-nav-panel');
    var backdrop = document.getElementById('mobile-nav-backdrop');
    var links = document.querySelectorAll('.mobile-nav-panel .nav-link, .mobile-nav-panel .mobile-dropdown-item');
    var actionButtons = document.querySelectorAll('.mobile-nav-panel button, .mobile-nav-panel a');

    if (!toggleBtn || !panel || !backdrop) return;

    function openMenu() {
      panel.classList.add('open');
      backdrop.classList.add('open');
      document.body.style.overflow = 'hidden';
    }

    function closeMenu() {
      panel.classList.remove('open');
      backdrop.classList.remove('open');
      document.body.style.overflow = '';
    }

    toggleBtn.addEventListener('click', openMenu);

    if (closeBtn) {
      closeBtn.addEventListener('click', closeMenu);
    }

    backdrop.addEventListener('click', closeMenu);

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && panel.classList.contains('open')) {
        closeMenu();
      }
    });

    links.forEach(function (link) {
      link.addEventListener('click', function () {
        if (link.hasAttribute('data-bs-toggle') && link.getAttribute('data-bs-toggle') === 'collapse') {
          return;
        }
        closeMenu();
      });
    });

    actionButtons.forEach(function (btn) {
      if (btn.getAttribute('data-bs-toggle') === 'modal' || btn.id === 'drawer-cta-book') {
        btn.addEventListener('click', function () {
          closeMenu();
        });
      }
    });
  }

  /**
   * Consultation booking modal multi-step form logic
   */
  function initConsultationModalFromComponent() {
    var formStep1 = document.getElementById('booking-form-step-1');
    var formStep2 = document.getElementById('booking-form-step-2');
    var step1Panel = document.getElementById('booking-step-1-panel');
    var step2Panel = document.getElementById('booking-step-2-panel');
    var successPanel = document.getElementById('booking-success-panel');
    var modalEl = document.getElementById('consultationModal');
    var timeSlotButtons = document.querySelectorAll('.time-slot-btn');
    var selectedTime = '';

    timeSlotButtons.forEach(function (btn) {
      btn.addEventListener('click', function () {
        timeSlotButtons.forEach(function (b) { b.classList.remove('active'); });
        btn.classList.add('active');
        selectedTime = btn.getAttribute('data-time');
      });
    });

    var bookingData = {
      name: '', phone: '', email: '', service: '',
      date: '', time: '', notes: ''
    };

    if (formStep1) {
      formStep1.addEventListener('submit', function (e) {
        e.preventDefault();
        bookingData.name = document.getElementById('booking-name').value;
        bookingData.phone = document.getElementById('booking-phone').value;
        bookingData.email = document.getElementById('booking-email').value;
        bookingData.service = document.getElementById('booking-service').value;

        if (!bookingData.name || !bookingData.phone || !bookingData.email) {
          alert('Please complete all fields to proceed.');
          return;
        }

        step1Panel.style.display = 'none';
        step2Panel.style.display = 'block';
      });
    }

    if (formStep2) {
      formStep2.addEventListener('submit', function (e) {
        e.preventDefault();
        bookingData.date = document.getElementById('booking-date').value;
        bookingData.time = selectedTime;
        bookingData.notes = document.getElementById('booking-notes').value;

        if (!bookingData.date) {
          alert('Please choose an available appointment date.');
          return;
        }
        if (!bookingData.time) {
          alert('Please pick an available private suite timeslot.');
          return;
        }

        document.getElementById('success-summary-name').textContent = bookingData.name;
        document.getElementById('success-summary-service').textContent = bookingData.service;
        document.getElementById('success-summary-date').textContent = bookingData.date;
        document.getElementById('success-summary-time').textContent = bookingData.time;

        step2Panel.style.display = 'none';
        successPanel.style.display = 'block';
      });
    }

    var resetBtn = document.getElementById('booking-success-return');
    function resetBookingForm() {
      if (formStep1) formStep1.reset();
      if (formStep2) formStep2.reset();
      timeSlotButtons.forEach(function (b) { b.classList.remove('active'); });
      selectedTime = '';
      if (step1Panel) step1Panel.style.display = 'block';
      if (step2Panel) step2Panel.style.display = 'none';
      if (successPanel) successPanel.style.display = 'none';
    }

    if (resetBtn) {
      resetBtn.addEventListener('click', function () {
        resetBookingForm();
        var bsModal = bootstrap.Modal.getInstance(modalEl);
        if (bsModal) bsModal.hide();
      });
    }

    if (modalEl) {
      modalEl.addEventListener('hidden.bs.modal', function () {
        resetBookingForm();
      });
    }

    // Handle direct modal booking setup for a selected service card
    var bookTherapyBtns = document.querySelectorAll('.book-therapy-trigger, .service-card, [data-service]');
    bookTherapyBtns.forEach(function (btn) {
      btn.addEventListener('click', function () {
        var serviceName = btn.getAttribute('data-service');
        if (serviceName) {
          var serviceSelect = document.getElementById('booking-service');
          if (serviceSelect) {
            serviceSelect.value = serviceName;
          }
        }
      });
    });
  }

  /**
   * Testimonial video modal play/stop logic
   */
  function initTestimonialModalFromComponent() {
    var playButtons = document.querySelectorAll('.play-btn-circle, .testimonial-video-box');
    var videoIframe = document.getElementById('testimonial-iframe');
    var modalElement = document.getElementById('videoReviewModal');

    if (!modalElement || !videoIframe) return;

    playButtons.forEach(function (btn) {
      btn.addEventListener('click', function () {
        var videoUrl = btn.getAttribute('data-video') ||
          (btn.closest('.testimonial-video-box') ? btn.closest('.testimonial-video-box').getAttribute('data-video') : null);
        if (videoUrl) {
          var embedUrl = videoUrl;
          if (videoUrl.indexOf('watch?v=') !== -1) {
            embedUrl = videoUrl.replace('watch?v=', 'embed/');
          }
          videoIframe.src = embedUrl;
        }
      });
    });

    modalElement.addEventListener('hidden.bs.modal', function () {
      videoIframe.src = '';
    });
  }

  /**
   * Navbar scroll state (add scrolled class on scroll)
   */
  function initNavbarScrollState() {
    var navbar = document.getElementById('main-navbar');
    if (!navbar) return;

    function updateNavbar() {
      if (window.scrollY > 50) {
        navbar.classList.add('navbar-scrolled');
      } else {
        navbar.classList.remove('navbar-scrolled');
      }
    }

    // Apply immediately in case page is already scrolled
    updateNavbar();

    window.addEventListener('scroll', updateNavbar);
  }
})();
