/* the scrapbook: a simple image viewer (no library) */

(function () {
  "use strict";

  var items = Array.prototype.slice.call(
    document.querySelectorAll(".gallery-item")
  );
  var lightbox = document.getElementById("lightbox");
  if (!items.length || !lightbox) return;

  var image = document.getElementById("lightbox-image");
  var title = document.getElementById("lightbox-title");
  var captionTitle = document.getElementById("lightbox-caption-title");
  var captionText = document.getElementById("lightbox-caption-text");
  var source = document.getElementById("lightbox-source");
  var closeButton = document.getElementById("lightbox-close");
  var prevButton = document.getElementById("lightbox-prev");
  var nextButton = document.getElementById("lightbox-next");
  var index = 0;
  var opener = null;

  function photoAt(number) {
    var thumb = items[number].querySelector("img");
    return {
      src: thumb.getAttribute("src"),
      title: thumb.getAttribute("alt"),
      caption: items[number].getAttribute("data-caption"),
      source: items[number].getAttribute("data-source")
    };
  }

  function pad(number) {
    return number < 10 ? "0" + number : String(number);
  }

  function show(number) {
    index = (number + items.length) % items.length;
    var photo = photoAt(index);
    image.src = photo.src;
    image.alt = photo.title;
    title.textContent = "viewer / " + pad(index + 1) + " of " + pad(items.length);
    captionTitle.textContent = photo.title;
    captionText.textContent = photo.caption;
    source.href = photo.source;
  }

  function open(number, trigger) {
    opener = trigger || null;
    show(number);
    lightbox.hidden = false;
    document.body.classList.add("menu-open");
    if (closeButton) closeButton.focus();
  }

  function close() {
    lightbox.hidden = true;
    document.body.classList.remove("menu-open");
    if (opener) opener.focus();
  }

  for (var i = 0; i < items.length; i += 1) {
    (function (number) {
      items[number].addEventListener("click", function () {
        open(number, items[number]);
      });
    })(i);
  }

  if (closeButton) closeButton.addEventListener("click", close);
  if (prevButton)
    prevButton.addEventListener("click", function () {
      show(index - 1);
    });
  if (nextButton)
    nextButton.addEventListener("click", function () {
      show(index + 1);
    });

  lightbox.addEventListener("click", function (event) {
    if (event.target === lightbox) close();
  });

  document.addEventListener("keydown", function (event) {
    if (lightbox.hidden) return;
    if (event.key === "Escape") close();
    if (event.key === "ArrowRight") {
      event.preventDefault();
      show(index + 1);
    }
    if (event.key === "ArrowLeft") {
      event.preventDefault();
      show(index - 1);
    }
  });
})();
