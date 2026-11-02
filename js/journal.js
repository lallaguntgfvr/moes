/* the change log: show or hide the older notes */

(function () {
  "use strict";

  var button = document.getElementById("toggle-updates");
  var list = document.getElementById("update-list");
  if (!button || !list) return;

  var older = list.querySelectorAll(".older");
  var open = false;

  function render() {
    for (var i = 0; i < older.length; i += 1) {
      older[i].hidden = !open;
    }
    button.setAttribute("aria-expanded", String(open));
    button.innerHTML = open
      ? '<span aria-hidden="true">▴</span> fold the log away'
      : '<span aria-hidden="true">▾</span> read ' + older.length + " older notes";
  }

  button.addEventListener("click", function () {
    open = !open;
    render();
  });

  render();
})();
