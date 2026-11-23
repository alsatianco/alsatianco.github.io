// play.alsatian.co: small progressive enhancements. Every page works without this file.
(function () {
  'use strict';

  // Screenshots: a full-screen viewer. It fits the image to the screen, shows it at actual size on request,
  // and steps through every screenshot on the page. Without JavaScript the link opens the image file.
  var zoomLinks = Array.prototype.slice.call(document.querySelectorAll('a[data-zoom]'));
  if (zoomLinks.length && typeof HTMLDialogElement === 'function') {
    var make = function (tag, className, text) {
      var el = document.createElement(tag);
      if (className) el.className = className;
      if (text) el.textContent = text;
      return el;
    };
    var button = function (className, text) {
      var b = make('button', 'viewer-button ' + className, text);
      b.type = 'button';
      return b;
    };
    var dialog = make('dialog', 'viewer');
    var bar = make('div', 'viewer-bar');
    var count = make('p', 'viewer-count');
    count.setAttribute('aria-live', 'polite');
    var caption = make('p', 'viewer-caption');
    var tools = make('div', 'viewer-tools');
    // Previous and Next show an arrow and a word. On small screens only the arrow is visible; the word stays for screen readers.
    var stepButton = function (className, arrow, label) {
      var b = button(className, '');
      b.appendChild(make('span', 'viewer-arrow', arrow)).setAttribute('aria-hidden', 'true');
      b.appendChild(make('span', 'viewer-label', label));
      return b;
    };
    var prevButton = stepButton('viewer-prev', '←', 'Previous');
    var nextButton = stepButton('viewer-next', '→', 'Next');
    var sizeButton = button('viewer-size', 'Actual size');
    var closeButton = button('viewer-close', 'Close');
    var stage = make('div', 'viewer-stage');
    var image = make('img', 'viewer-image');
    var problem = make('p', 'viewer-problem', 'This image could not be loaded. Close the viewer and try the link again.');
    problem.hidden = true;
    tools.appendChild(prevButton);
    tools.appendChild(nextButton);
    tools.appendChild(sizeButton);
    tools.appendChild(closeButton);
    bar.appendChild(count);
    bar.appendChild(caption);
    bar.appendChild(tools);
    stage.appendChild(image);
    stage.appendChild(problem);
    dialog.appendChild(bar);
    dialog.appendChild(stage);
    document.body.appendChild(dialog);

    var current = 0;
    var opener = null;

    var describe = function (link) {
      var thumb = link.querySelector('img');
      var figure = link.closest('figure');
      var cap = figure && figure.querySelector('figcaption');
      return { alt: thumb ? thumb.alt : '', caption: cap ? cap.textContent : (thumb ? thumb.alt : '') };
    };

    // Actual size is offered only when the image is bigger than the space it is fitted into.
    var updateSizeButton = function () {
      var fits = image.naturalWidth <= image.clientWidth + 1 && image.naturalHeight <= image.clientHeight + 1;
      sizeButton.hidden = !dialog.classList.contains('is-actual') && fits;
      sizeButton.textContent = dialog.classList.contains('is-actual') ? 'Fit to screen' : 'Actual size';
      image.classList.toggle('can-zoom', !sizeButton.hidden);
    };

    var setActual = function (on) {
      dialog.classList.toggle('is-actual', on);
      stage.scrollTop = 0;
      stage.scrollLeft = 0;
      updateSizeButton();
    };

    var show = function (index) {
      current = (index + zoomLinks.length) % zoomLinks.length;
      var link = zoomLinks[current];
      var info = describe(link);
      dialog.classList.remove('is-actual');
      dialog.classList.add('is-loading');
      problem.hidden = true;
      image.alt = info.alt;
      image.src = link.href;
      caption.textContent = info.caption;
      dialog.setAttribute('aria-label', info.alt || 'Screenshot');
      count.textContent = zoomLinks.length > 1 ? (current + 1) + ' of ' + zoomLinks.length : '';
      // Load the neighbours early, so Next and Previous feel instant.
      if (zoomLinks.length > 1) {
        new Image().src = zoomLinks[(current + 1) % zoomLinks.length].href;
        new Image().src = zoomLinks[(current - 1 + zoomLinks.length) % zoomLinks.length].href;
      }
    };

    image.addEventListener('load', function () {
      dialog.classList.remove('is-loading');
      updateSizeButton();
    });
    image.addEventListener('error', function () {
      dialog.classList.remove('is-loading');
      problem.hidden = false;
      sizeButton.hidden = true;
    });

    prevButton.hidden = nextButton.hidden = zoomLinks.length < 2;
    prevButton.addEventListener('click', function () { show(current - 1); });
    nextButton.addEventListener('click', function () { show(current + 1); });
    sizeButton.addEventListener('click', function () { setActual(!dialog.classList.contains('is-actual')); });
    closeButton.addEventListener('click', function () { dialog.close(); });
    image.addEventListener('click', function () {
      if (!sizeButton.hidden) setActual(!dialog.classList.contains('is-actual'));
    });
    // A click on the empty area around the image closes the viewer.
    stage.addEventListener('click', function (event) {
      if (event.target === stage) dialog.close();
    });
    dialog.addEventListener('keydown', function (event) {
      if (event.key === 'ArrowRight' && zoomLinks.length > 1) { event.preventDefault(); show(current + 1); }
      if (event.key === 'ArrowLeft' && zoomLinks.length > 1) { event.preventDefault(); show(current - 1); }
    });
    window.addEventListener('resize', function () { if (dialog.open) updateSizeButton(); });
    dialog.addEventListener('close', function () {
      image.removeAttribute('src');
      dialog.classList.remove('is-actual', 'is-loading');
      document.documentElement.classList.remove('viewer-open');
      if (opener) opener.focus();
    });

    zoomLinks.forEach(function (link, index) {
      link.addEventListener('click', function (event) {
        if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
        event.preventDefault();
        opener = link;
        show(index);
        document.documentElement.classList.add('viewer-open');
        dialog.showModal();
        closeButton.focus();
      });
    });
  }

  // Commands: add a Copy button. The button says what happened.
  if (navigator.clipboard && window.isSecureContext) {
    Array.prototype.forEach.call(document.querySelectorAll('pre[data-copy]'), function (pre) {
      var code = pre.querySelector('code');
      if (!code) return;
      var button = document.createElement('button');
      button.type = 'button';
      button.className = 'copy-button';
      button.textContent = 'Copy';
      button.setAttribute('aria-label', 'Copy command');
      var timer = null;
      button.addEventListener('click', function () {
        navigator.clipboard.writeText(code.textContent.trim()).then(function () {
          button.textContent = 'Copied';
        }, function () {
          button.textContent = 'Select and copy';
        }).then(function () {
          clearTimeout(timer);
          timer = setTimeout(function () { button.textContent = 'Copy'; }, 2000);
        });
      });
      var block = document.createElement('div');
      block.className = 'code-block';
      var bar = document.createElement('div');
      bar.className = 'code-bar';
      bar.appendChild(button);
      pre.parentNode.insertBefore(block, pre);
      block.appendChild(bar);
      block.appendChild(pre);
    });
  }
  // The design menu in the footer: close it with Escape or a click outside it. Without JavaScript it opens and closes with its button.
  var designMenu = document.querySelector('details.design-switch');
  if (designMenu) {
    document.addEventListener('click', function (event) {
      if (designMenu.open && !designMenu.contains(event.target)) designMenu.open = false;
    });
    designMenu.addEventListener('keydown', function (event) {
      if (event.key === 'Escape' && designMenu.open) {
        designMenu.open = false;
        designMenu.querySelector('summary').focus();
      }
    });
  }
})();
