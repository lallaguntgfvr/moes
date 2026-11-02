/* the media shrine: genre filters, show more, and the surprise pick */

(function () {
  "use strict";

  var grid = document.getElementById("recommendation-grid");
  var filterRow = document.getElementById("filter-row");
  var countLabel = document.getElementById("filter-count");
  var surprise = document.getElementById("surprise-me");
  var showMore = document.getElementById("show-more");
  if (!grid || !filterRow) return;

  var cards = Array.prototype.slice.call(
    grid.querySelectorAll(".recommendation-card")
  );
  var buttons = Array.prototype.slice.call(
    filterRow.querySelectorAll("button[data-filter]")
  );
  var genre = "all";
  var limit = 6;
  var selectedTitle = "";
  var selectedCard = null;

  function matching() {
    return cards.filter(function (card) {
      if (genre === "all") return true;
      return card.getAttribute("data-genres").split("|").indexOf(genre) !== -1;
    });
  }

  function render() {
    var visible = matching();

    for (var i = 0; i < cards.length; i += 1) {
      cards[i].hidden = true;
      cards[i].classList.remove("selected");
      var badge = cards[i].querySelector(".cover-wrap > span");
      if (badge) badge.hidden = true;
    }

    for (var j = 0; j < visible.length && j < limit; j += 1) {
      visible[j].hidden = false;
      if (visible[j].getAttribute("data-title") === selectedTitle) {
        visible[j].classList.add("selected");
        var pick = visible[j].querySelector(".cover-wrap > span");
        if (pick) pick.hidden = false;
      }
    }

    if (countLabel) countLabel.textContent = visible.length + " found";

    if (showMore) {
      var remaining = visible.length - limit;
      showMore.hidden = remaining <= 0;
      showMore.innerHTML =
        '<span aria-hidden="true">▾</span> open the rest of the shelf (' +
        Math.max(remaining, 0) +
        ")";
    }

    for (var k = 0; k < buttons.length; k += 1) {
      var active = buttons[k].getAttribute("data-filter") === genre;
      buttons[k].classList.toggle("active", active);
      buttons[k].setAttribute("aria-pressed", String(active));
    }
  }

  filterRow.addEventListener("click", function (event) {
    var button = event.target.closest("button[data-filter]");
    if (!button) return;
    genre = button.getAttribute("data-filter");
    limit = 6;
    selectedTitle = "";
    selectedCard = null;
    render();
  });

  if (showMore) {
    showMore.addEventListener("click", function () {
      limit = matching().length;
      render();
    });
  }

  if (surprise) {
    surprise.addEventListener("click", function () {
      var pool = matching();
      if (!pool.length) return;
      var choices = pool.filter(function (card) {
        return card.getAttribute("data-title") !== selectedTitle;
      });
      if (!choices.length) choices = pool;
      selectedCard = choices[Math.floor(Math.random() * choices.length)];
      selectedTitle = selectedCard.getAttribute("data-title");
      limit = pool.length;
      render();

      var reduced = document.getElementById("site").classList.contains("reduce-motion");
      selectedCard.scrollIntoView({
        behavior: reduced ? "auto" : "smooth",
        block: "center"
      });
    });
  }

  render();
})();
