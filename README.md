# moe moe kyun~ after dark

The violet-gray secret room, split into real, separately addressable pages. Plain HTML, one CSS file, and a handful of small JavaScript files. No Node.js, no npm, no build step, no frameworks.

## What's in here

| Page             | Contents                                                |
| ---------------- | ------------------------------------------------------- |
| `index.html`     | Entrance, welcome message, and room directory           |
| `about.html`     | Webmaster introduction, profile, and inventory          |
| `journal.html`   | Changelog and currently card                            |
| `music.html`     | Original browser-synth playlist and audio controls      |
| `shrine.html`    | Game recommendations, genre filters, and surprise pick  |
| `gallery.html`   | Scrapbook and keyboard-accessible image viewer          |
| `guestbook.html` | Private, browser-local notes                            |
| `links.html`     | Neighbor buttons, inspirations, and credits             |

Plus:

```text
style.css      all of the styling
script.js      the menu, clock, visit counter, and display settings
js/music.js    the little Web Audio radio
js/shrine.js   genre filters and the surprise pick
js/gallery.js  the image viewer
js/guestbook.js
js/journal.js
js/links.js
```

Every page is a complete HTML file with its own title, description, sidebar, and footer. The links between pages are ordinary relative `.html` links, so everything works on Neocities, Neocities subdirectories, and even by opening the files straight from your computer.

## Uploading to Neocities

Drag all of the `.html` files, `style.css`, and the whole `js` folder into your Neocities dashboard. Keep the `js` folder next to the HTML files. That's it — nothing has to be compiled or previewed locally.

If you already had an older version uploaded, remove the old `assets` folder and other leftovers so they don't linger on your site.

## How it works (for editing later)

- **Sidebar / footer / pagination** are copied into each `.html` file, the classic Neocities way. If you add a page, add it to each sidebar and to the previous/next links.
- **Display settings** (CRT glass, motion) and the volume are remembered with `localStorage`.
- **Music** is synthesized in the browser with the Web Audio API. It never autoplays and stops when you leave the page.
- **The guestbook is local to each visitor's browser**, not shared. A shared guestbook needs an external service; none has been added.
- **Browser visits** are a local counter, not analytics.
- No cookies, no tracking, no server.

## Credits

The artwork, buttons, favicon, cursor, and font are linked from their original hosts, so they need those hosts to stay online. They are not copied into this project. The neighbors page keeps the source links.

## Notes

- The site works without JavaScript for reading: the sidebar, all page content, and links are plain HTML. Only the interactive extras (viewer, filters, radio, guestbook) need it.
- Keyboard users can tab through every control; the mobile menu closes with Escape.
