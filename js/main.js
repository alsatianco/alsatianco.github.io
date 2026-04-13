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
});
