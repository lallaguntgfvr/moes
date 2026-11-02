/* tiny letters: a guestbook that only lives in your own browser */

(function () {
  "use strict";

  var form = document.getElementById("guestbook-form");
  var list = document.getElementById("guestbook-list");
  var empty = document.getElementById("empty-notes");
  var status = document.getElementById("form-status");
  var nameField = document.getElementById("guest-name");
  var messageField = document.getElementById("guest-message");
  var counter = document.getElementById("note-counter");
  if (!form || !list) return;

  var storageKey = "kurarin-after-dark-guestbook";
  var entries = [];

  function load() {
    try {
      var saved = JSON.parse(localStorage.getItem(storageKey) || "[]");
      if (!Array.isArray(saved)) return [];
      return saved.filter(function (entry) {
        return (
          entry &&
          typeof entry.id === "string" &&
          typeof entry.name === "string" &&
          typeof entry.message === "string" &&
          typeof entry.createdAt === "string"
        );
      });
    } catch (error) {
      return [];
    }
  }

  function save() {
    try {
      localStorage.setItem(storageKey, JSON.stringify(entries));
    } catch (error) {
      /* the notes still show on this page if storage is blocked */
    }
  }

  function formatDate(value) {
    var date = new Date(value);
    if (isNaN(date.getTime())) return "";
    return date.toLocaleDateString();
  }

  function render() {
    list.innerHTML = "";
    empty.hidden = entries.length > 0;

    entries.forEach(function (entry) {
      var item = document.createElement("li");

      var meta = document.createElement("div");
      meta.className = "note-meta";

      var name = document.createElement("b");
      name.textContent = entry.name;

      var time = document.createElement("time");
      time.dateTime = entry.createdAt;
      time.textContent = formatDate(entry.createdAt);

      var remove = document.createElement("button");
      remove.type = "button";
      remove.setAttribute("aria-label", "Delete note by " + entry.name);
      remove.title = "Delete this local note";
      remove.innerHTML = '<span aria-hidden="true">✕</span>';
      remove.addEventListener("click", function () {
        entries = entries.filter(function (item) {
          return item.id !== entry.id;
        });
        save();
        render();
        if (status) status.textContent = "your local note was removed.";
      });

      meta.appendChild(name);
      meta.appendChild(time);
      meta.appendChild(remove);

      var text = document.createElement("p");
      text.textContent = entry.message;

      item.appendChild(meta);
      item.appendChild(text);
      list.appendChild(item);
    });
  }

  function updateCounter() {
    if (counter && messageField) {
      counter.textContent = messageField.value.length + "/300";
    }
  }

  form.addEventListener("submit", function (event) {
    event.preventDefault();

    var name = nameField.value.trim();
    var message = messageField.value.trim();

    if (!name || !message) {
      if (status) status.textContent = "please write both a name and a tiny note.";
      return;
    }

    entries.unshift({
      id: String(Date.now()) + "-" + Math.random().toString(16).slice(2),
      name: name,
      message: message,
      createdAt: new Date().toISOString()
    });

    save();
    render();
    messageField.value = "";
    updateCounter();
    if (status) {
      status.textContent =
        "your note is saved in this browser. thank you for stopping by!";
    }
  });

  if (messageField) messageField.addEventListener("input", updateCounter);

  entries = load();
  render();
  updateCounter();
})();
