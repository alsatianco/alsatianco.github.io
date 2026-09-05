// Highlight active nav link based on current page
document.addEventListener('DOMContentLoaded', function () {
  var path = window.location.pathname;
  var page = path.substring(path.lastIndexOf('/') + 1) || 'index.html';

  document.querySelectorAll('.nav-links a').forEach(function (a) {
    var href = a.getAttribute('href');
    // Normalize: strip leading ./
    var linkPage = href.replace(/^\.\//, '').replace(/^\.\.\//, '');
    if (linkPage === page || (page === 'index.html' && linkPage === 'index.html')) {
      a.classList.add('active');
    }
    // For detail pages inside software/ or games/ folders
    if (path.includes('/software/') && linkPage === 'software.html') {
      a.classList.add('active');
    }
    if (path.includes('/games/') && linkPage === 'games.html') {
      a.classList.add('active');
    }
    if (path.includes('/blog/') && linkPage === 'blog.html') {
      a.classList.add('active');
    }
  });

  // Hamburger menu toggle
  var hamburger = document.querySelector('.hamburger');
  var navLinks = document.querySelector('.nav-links');
  if (hamburger && navLinks) {
    hamburger.addEventListener('click', function () {
      hamburger.classList.toggle('open');
      navLinks.classList.toggle('open');
      hamburger.setAttribute('aria-expanded', navLinks.classList.contains('open'));
    });
  }

  var lastTrigger;
  function closeLightbox() {
    var lightbox = document.querySelector('.image-lightbox');
    if (!lightbox) return;
    lightbox.remove();
    document.body.style.overflow = '';
    if (lastTrigger) lastTrigger.focus();
  }

  document.querySelectorAll('.screenshot-trigger').forEach(function (trigger) {
    trigger.addEventListener('click', function () {
      var sourceImage = trigger.querySelector('img');
      if (!sourceImage) return;
      lastTrigger = trigger;
      var lightbox = document.createElement('button');
      var fullImage = document.createElement('img');
      lightbox.className = 'image-lightbox';
      lightbox.type = 'button';
      lightbox.setAttribute('aria-label', 'Close full-size image');
      fullImage.src = sourceImage.currentSrc || sourceImage.src;
      fullImage.alt = sourceImage.alt;
      lightbox.appendChild(fullImage);
      lightbox.addEventListener('click', function (event) {
        if (event.target === lightbox) closeLightbox();
      });
      document.body.appendChild(lightbox);
      document.body.style.overflow = 'hidden';
      lightbox.focus();
    });
  });

  document.addEventListener('keydown', function (event) {
    if (event.key === 'Escape') closeLightbox();
  });
});
