/* neighbors: copy the page link, with an old-fashioned fallback */

(function () {
  "use strict";

  var button = document.getElementById("copy-link");
  if (!button) return;

  var resetTimer = 0;

  function report(text) {
    button.innerHTML = '<span aria-hidden="true">⧉</span> ' + text;
    window.clearTimeout(resetTimer);
    resetTimer = window.setTimeout(function () {
      button.innerHTML = '<span aria-hidden="true">⧉</span> copy this page link';
    }, 2200);
  }

  function fallbackCopy(text) {
    var field = document.createElement("textarea");
    field.value = text;
    field.style.position = "fixed";
    field.style.opacity = "0";
    document.body.appendChild(field);
    field.select();
    var success = false;
    try {
      success = document.execCommand("copy");
    } catch (error) {
      success = false;
    }
    field.remove();
    return success;
  }

  button.addEventListener("click", function () {
    var link = window.location.href.split("#")[0];

    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(link).then(
        function () {
          report("link copied!");
        },
        function () {
          report(fallbackCopy(link) ? "link copied!" : "please copy the address above");
        }
      );
    } else {
      report(fallbackCopy(link) ? "link copied!" : "please copy the address above");
    }
  });
})();
