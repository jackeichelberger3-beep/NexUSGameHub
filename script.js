/* =========================
   SimpleSite: script.js
   Edit pages below in the PAGES ARRAY.
   Use Ctrl+F for the tokens:
     - PAGES ARRAY
     - TEMPLATE: (in index.html)
   ========================= */

/* PAGES ARRAY — edit pages here
   Each page object:
     id: unique string
     title: shown in menu
     type: "text" | "url" | "raw"
     content fields:
       - text: for type "text" (string, HTML allowed)
       - subheader: optional
       - image: optional image URL
       - url: for type "url" (iframe target)
       - raw: for type "raw" (raw HTML injected)
     children: optional array for submenu (same structure)
*/
const PAGES = [
  {
    id: "home",
    title: "Home",
    type: "text",
    header: "Welcome to SimpleSite",
    subheader: "A dark, simple website manager",
    text: `<p>This is the home text page. You can add images and paragraphs here. To edit pages, open <code>script.js</code> and find the <strong>PAGES ARRAY</strong>.</p>
           <p>Use <em>type: "url"</em> to embed other pages, <em>type: "raw"</em> to paste raw HTML, or <em>type: "text"</em> for simple content.</p>`,
    image: "https://picsum.photos/seed/picsum/800/300"
  },
  {
    id: "external",
    title: "Example: URL page",
    type: "url",
    url: "templates/url-sample.html" // can be an absolute URL or a local file
  },
  {
    id: "raw",
    title: "Example: Raw HTML page",
    type: "raw",
    raw: `<!-- RAW PAGE START - edit me in script.js PAGES ARRAY -->
      <article>
        <h2 style="color:#4aa3ff">This is raw HTML</h2>
        <p>You can include any HTML here. It will be injected directly into the content area.</p>
        <p><strong>Tip:</strong> Paste full HTML snippets for widgets, forms, or embedded content.</p>
      </article>
    <!-- RAW PAGE END -->`
  },
  {
    id: "more",
    title: "More pages (has submenu)",
    children: [
      {
        id: "about",
        title: "About SimpleSite",
        type: "text",
        header: "About",
        subheader: "What this template provides",
        text: "<p>This template demonstrates how to build simple page types and menus that are easy to edit.</p>"
      },
      {
        id: "gallery",
        title: "Gallery (text with image)",
        type: "text",
        header: "Gallery",
        subheader: "Images and captions",
        text: "<p>Sample image below</p>",
        image: "https://picsum.photos/seed/gallery/900/500"
      }
    ]
  }
];

/* ---- end of PAGES ARRAY (search token above) ---- */

/* OWNER KEY: set this value to a secret string known only to the owner.
   Anyone who knows this key can unlock the in-browser editor. To make editing owner-only,
   change this constant to a secure value and share it with only the repository owner.
   Example: const OWNER_KEY = "my-secret-owner-key";
*/
const OWNER_KEY = "OWNER-REPLACE-ME";
let isOwner = false; // runtime flag indicating editor unlocked

const state = { current: PAGES[0].id };

/* Editable runtime copy (editor works on this) */
let editablePages = JSON.parse(JSON.stringify(PAGES));

function qs(sel, root = document) { return root.querySelector(sel) }
function qsa(sel, root = document) { return Array.from(root.querySelectorAll(sel)) }

function createMenuItem(page, level = 0) {
  const item = document.createElement("div");
  item.className = "menu-item";
  item.dataset.pageId = page.id || "";
  item.style.paddingLeft = `${8 + level * 8}px`;

  const title = document.createElement("div");
  title.className = "title";
  title.textContent = page.title || "(no title)";
  item.appendChild(title);

  if (page.children && page.children.length) {
    const toggle = document.createElement("button");
    toggle.className = "sub-toggle";
    toggle.textContent = "▸";
    toggle.title = "Expand submenu";
    toggle.addEventListener("click", (e) => {
      e.stopPropagation();
      const expanded = item.classList.toggle("expanded");
      toggle.textContent = expanded ? "▾" : "▸";
    });
    item.insertBefore(toggle, title);
  }

  item.addEventListener("click", (e) => {
    if (page.type || page.children == null) {
      // navigate to the page (only if it's a leaf or has a type)
      renderPage(page.id);
      document.getElementById("content").focus();
    } else {
      // toggle children open
      item.classList.toggle("expanded");
    }
  });

  return item;
}

function buildMenu(listEl, pages, level = 0) {
  pages.forEach(p => {
    const item = createMenuItem(p, level);
    listEl.appendChild(item);
    if (p.children && p.children.length) {
      const sub = document.createElement("div");
      sub.className = "submenu";
      listEl.appendChild(sub);
      buildMenu(sub, p.children, level + 1);
    }
  });
}

function findPageById(id, pages = editablePages) {
  for (const p of pages) {
    if (p.id === id) return p;
    if (p.children) {
      const found = findPageById(id, p.children);
      if (found) return found;
    }
  }
  return null;
}

function renderPage(id) {
  const page = findPageById(id);
  if (!page) {
    showError("Page not found: " + id);
    return;
  }
  state.current = id;
  const container = qs("#page-container");
  container.innerHTML = "";
  // breadcrumb / header
  const card = document.createElement("div");
  card.className = "page-card";

  if (page.type === "url") {
    const iframe = document.createElement("iframe");
    iframe.className = "content-frame";
    iframe.src = page.url;
    iframe.title = page.title || "Embedded page";
    card.appendChild(iframe);
  } else if (page.type === "raw") {
    // raw HTML injection (trusted)
    const div = document.createElement("div");
    div.innerHTML = page.raw || "";
    card.appendChild(div);
  } else {
    // default: "text" type (safe HTML strings allowed)
    if (page.header) {
      const h = document.createElement("h2");
      h.className = "page-title";
      h.textContent = page.header;
      card.appendChild(h);
    }
    if (page.subheader) {
      const sub = document.createElement("div");
      sub.className = "page-sub";
      sub.textContent = page.subheader;
      card.appendChild(sub);
    }
    if (page.image) {
      const img = document.createElement("img");
      img.src = page.image;
      img.alt = page.title || "";
      img.style.width = "100%";
      img.style.borderRadius = "6px";
      img.style.margin = "10px 0";
      card.appendChild(img);
    }
    if (page.text) {
      const p = document.createElement("div");
      p.innerHTML = page.text;
      card.appendChild(p);
    }
  }

  container.appendChild(card);
  highlightMenuItem(id);
}

function highlightMenuItem(id) {
  qsa(".menu-item").forEach(mi => {
    mi.classList.toggle("active", mi.dataset.pageId === id);
  });
}

function showError(msg) {
  const container = qs("#page-container");
  container.innerHTML = `<div class="page-card"><strong>Error</strong><div>${msg}</div></div>`;
}

/* Build the menu and init */
function rebuildMenu() {
  const pagesList = qs("#pages-list");
  pagesList.innerHTML = "";
  buildMenu(pagesList, editablePages);
  highlightMenuItem(state.current);
}

/* INIT and UI wiring */
function init() {
  // initial menu rendered from editablePages
  rebuildMenu();

  // search input
  const search = qs("#search-pages");
  search.addEventListener("input", () => {
    const term = search.value.trim().toLowerCase();
    qsa(".menu-item").forEach(mi => {
      const t = mi.querySelector(".title")?.textContent?.toLowerCase() || "";
      mi.style.display = t.includes(term) ? "" : "none";
    });
  });

  // menu toggle for small screens
  const menuToggle = qs("#menu-toggle");
  menuToggle.addEventListener("click", () => {
    const sb = qs("#sidebar");
    sb.classList.toggle("open");
  });

  // top help
  qs("#help-btn").addEventListener("click", () => {
    alert("To edit pages: open script.js, find the PAGES ARRAY, or use the Editor (🔒). Save changes by downloading the updated script.js or ZIP.");
  });

  // Editor toggle
  qs("#editor-toggle").addEventListener("click", () => openEditor());
  qs("#editor-close").addEventListener("click", () => closeEditor());

  // Editor controls
  qs("#add-page").addEventListener("click", () => addPageAt([]));
  qs("#add-subpage").addEventListener("click", () => {
    const path = qs("#editor-path").value;
    if (!path) return alert("Select a parent page in the left list first.");
    addPageAt(path.split(".").map(s => parseInt(s)));
  });

  qs("#download-script").addEventListener("click", () => downloadScript());
  qs("#download-zip").addEventListener("click", () => downloadZip());

  // form actions
  qs("#save-page").addEventListener("click", () => saveEditorForm());
  qs("#delete-page").addEventListener("click", () => deleteCurrentEditorPage());
  qs("#move-up").addEventListener("click", () => moveCurrent(-1));
  qs("#move-down").addEventListener("click", () => moveCurrent(1));
  qs("#preview-page").addEventListener("click", () => {
    const path = qs("#editor-path").value;
    if (!path) return alert("Select a page to preview.");
    const page = getPageByPathString(path);
    if (page && page.id) renderPage(page.id);
  });

  // type field change show/hide subfields
  qs("#field-type").addEventListener("change", () => {
    const t = qs("#field-type").value;
    qsa(".type-fields").forEach(el => el.style.display = "none");
    if (t === "text") qs("#type-text-fields").style.display = "";
    if (t === "url") qs("#type-url-fields").style.display = "";
    if (t === "raw") qs("#type-raw-fields").style.display = "";
  });

  // initial page
  renderPage(state.current);
  // init editor list (hidden until opened)
  renderEditorList();
}

/* ======================
   Editor: helper functions
   Pages are referenced in the editor by a path string like "2" or "3.1" (index path)
   ====================== */

function renderEditorList() {
  const container = qs("#editor-pages-list");
  container.innerHTML = "";
  function walk(pages, prefix = []) {
    pages.forEach((p, i) => {
      const path = prefix.concat(i);
      const row = document.createElement("div");
      row.className = "editor-page-row";
      row.dataset.path = path.join(".");
      row.tabIndex = 0;
      row.innerHTML = `<div style="flex:1"><strong>${p.title || "(no title)"}</strong><div style="font-size:12px;color:var(--muted)">${p.id || ""} • ${p.type || "group"}</div></div>`;
      row.addEventListener("click", () => {
        selectEditorPage(path);
      });
      row.addEventListener("keydown", (e) => {
        if (e.key === "Enter") selectEditorPage(path);
      });
      container.appendChild(row);
      if (p.children && p.children.length) {
        walk(p.children, path);
      }
    });
  }
  walk(editablePages, []);
  // clear selection
  qs("#editor-path").value = "";
  qs("#add-subpage").disabled = true;
  updateEditorSelection();
}

function selectEditorPage(pathArray) {
  const pathStr = pathArray.join(".");
  qs("#editor-path").value = pathStr;
  qs("#add-subpage").disabled = false;
  const page = getPageByPath(pathArray);
  populateEditorFormWith(page);
  updateEditorSelection();
}

function updateEditorSelection() {
  qsa(".editor-page-row").forEach(r => r.classList.toggle("active", r.dataset.path === qs("#editor-path").value));
}

function getPageByPath(pathArray) {
  if (typeof pathArray === "string") pathArray = pathArray.split(".").map(s => parseInt(s));
  let cur = editablePages;
  for (let i = 0; i < pathArray.length; i++) {
    const idx = pathArray[i];
    if (!Array.isArray(cur) || !cur[idx]) return null;
    if (i === pathArray.length - 1) return cur[idx];
    cur = cur[idx].children || (cur[idx].children = []);
  }
  return null;
}

function getPageByPathString(pathStr) {
  if (!pathStr) return null;
  return getPageByPath(pathStr.split(".").map(s => parseInt(s)));
}

function populateEditorFormWith(page) {
  if (!page) return;
  qs("#field-id").value = page.id || "";
  qs("#field-title").value = page.title || "";
  qs("#field-type").value = page.type || "text";
  qs("#field-header").value = page.header || "";
  qs("#field-subheader").value = page.subheader || "";
  qs("#field-image").value = page.image || "";
  qs("#field-text").value = page.text || "";
  qs("#field-url").value = page.url || "";
  qs("#field-raw").value = page.raw || "";
  qs("#field-type").dispatchEvent(new Event('change'));
}

function saveEditorForm() {
  if (!isOwner) return alert("Only the owner can save changes. Open the editor and enter the owner key to unlock.");
  const pathStr = qs("#editor-path").value;
  if (!pathStr) return alert("Select a page first.");
  const page = getPageByPathString(pathStr);
  if (!page) return alert("Page not found.");
  // read form
  const id = qs("#field-id").value.trim();
  if (!id) return alert("id is required and must be unique.");
  // ensure uniqueness (except current)
  if (!isIdUnique(id, pathStr)) return alert("id must be unique across pages.");
  page.id = id;
  page.title = qs("#field-title").value;
  page.type = qs("#field-type").value;
  // clear type-specific fields first
  delete page.text; delete page.header; delete page.subheader; delete page.image;
  delete page.url; delete page.raw;
  if (page.type === "text") {
    page.header = qs("#field-header").value;
    page.subheader = qs("#field-subheader").value;
    page.image = qs("#field-image").value;
    page.text = qs("#field-text").value;
  } else if (page.type === "url") {
    page.url = qs("#field-url").value;
  } else if (page.type === "raw") {
    page.raw = qs("#field-raw").value;
  }
  // refresh UI
  renderEditorList();
  rebuildMenu();
  alert("Saved in editor (in-memory). To persist: click Download script.js or Download Site ZIP.");
}

function isIdUnique(id, currentPathStr) {
  let found = false;
  function walk(pages, path = []) {
    for (let i = 0; i < pages.length; i++) {
      const p = pages[i];
      const pathStr = path.concat(i).join(".");
      if (p.id === id && pathStr !== currentPathStr) found = true;
      if (p.children) walk(p.children, path.concat(i));
    }
  }
  walk(editablePages, []);
  return !found;
}

function addPageAt(pathArray) {
  if (!isOwner) return alert("Only the owner can add pages.");
  // If pathArray is empty -> add to root
  if (typeof pathArray === "string") pathArray = pathArray.split(".").map(s => parseInt(s));
  let target = editablePages;
  if (pathArray.length > 0) {
    // add as child of that page
    const parent = getPageByPath(pathArray);
    if (!parent) return alert("Parent not found.");
    parent.children = parent.children || [];
    parent.children.push({
      id: `new-page-${Date.now()}`,
      title: "New page",
      type: "text",
      header: "New page",
      text: "<p>Edit this page.</p>"
    });
  } else {
    // root push
    editablePages.push({
      id: `new-page-${Date.now()}`,
      title: "New page",
      type: "text",
      header: "New page",
      text: "<p>Edit this page.</p>"
    });
  }
  renderEditorList();
  rebuildMenu();
}

function deleteCurrentEditorPage() {
  if (!isOwner) return alert("Only the owner can delete pages.");
  const path = qs("#editor-path").value;
  if (!path) return alert("Select a page first.");
  if (!confirm("Delete this page? This cannot be undone in the editor session.")) return;
  const parts = path.split(".").map(s => parseInt(s));
  if (parts.length === 1) {
    editablePages.splice(parts[0], 1);
  } else {
    const parent = getPageByPath(parts.slice(0, -1));
    if (!parent || !parent.children) return;
    parent.children.splice(parts[parts.length - 1], 1);
  }
  qs("#editor-path").value = "";
  renderEditorList();
  rebuildMenu();
}

function moveCurrent(direction) {
  if (!isOwner) return alert("Only the owner can reorder pages.");
  const path = qs("#editor-path").value;
  if (!path) return alert("Select a page first.");
  const parts = path.split(".").map(s => parseInt(s));
  if (parts.length === 1) {
    const idx = parts[0];
    const arr = editablePages;
    const newIdx = idx + direction;
    if (newIdx < 0 || newIdx >= arr.length) return;
    const [item] = arr.splice(idx,1);
    arr.splice(newIdx,0,item);
  } else {
    const parent = getPageByPath(parts.slice(0,-1));
    const arr = parent.children;
    const idx = parts[parts.length - 1];
    const newIdx = idx + direction;
    if (newIdx < 0 || newIdx >= arr.length) return;
    const [item] = arr.splice(idx,1);
    arr.splice(newIdx,0,item);
  }
  renderEditorList();
  rebuildMenu();
}

function openEditor() {
  // Owner-only gate: require OWNER_KEY to unlock editor actions
  if (!isOwner) {
    const provided = prompt("Enter owner key to unlock the editor (owner-only):");
    if (provided === null) return; // cancelled
    if (provided !== OWNER_KEY) {
      alert("Owner key incorrect — editor locked.");
      return;
    }
    isOwner = true;
    // update UI to reflect owner
    qs('#editor-toggle').textContent = '✎ Editor (owner)';
    setEditorOwnerState(true);
  }
  qs("#editor-panel").setAttribute("aria-hidden", "false");
  renderEditorList();
}
function closeEditor() {
  qs("#editor-panel").setAttribute("aria-hidden", "true");
}

function setEditorOwnerState(state) {
  // enable/disable owner actions in the editor UI
  qs('#download-script').disabled = !state;
  qs('#download-zip').disabled = !state;
  qs('#add-page').disabled = !state;
  qs('#add-subpage').disabled = !state;
  qs('#save-page').disabled = !state;
  qs('#delete-page').disabled = !state;
  qs('#move-up').disabled = !state;
  qs('#move-down').disabled = !state;
}

/* ======================
   Export / Download helpers
   - downloadScript() generates a new script.js content containing the current editablePages as the PAGES ARRAY
   - downloadZip() packages index.html, styles.css, script.js, templates/url-sample.html into a .zip
   ====================== */

function createScriptFileContent() {
  if (!isOwner) return alert('Only owner can export files.');
  // Note: keep the PAGES ARRAY search token so users can find it in the downloaded file
  const header = `/* =========================
   SimpleSite: script.js
   This script was exported by the in-browser editor.
   Use Ctrl+F for token: PAGES ARRAY
   ========================= */\n\n`;
  const pagesJson = JSON.stringify(editablePages, null, 2);
  const pagesBlock = `/* PAGES ARRAY — edit pages here */\nconst PAGES = ${pagesJson};\n\n/* ---- end of PAGES ARRAY (search token above) ---- */\n\n`;
  // Append the rest of the runtime functions (we include a minimal runtime that mirrors this file)
  // For brevity we attach a compact runtime loader that reuses the exported functions via eval at runtime.
  // (This approach ensures the downloaded script.js is self-contained.)
  const runtime = `const state = { current: PAGES[0] && PAGES[0].id };\n\n${createRuntimeAsString()}\n`;
  return header + pagesBlock + runtime;
}

function createRuntimeAsString() {
  // We provide a compact runtime (same rendering logic used here). Keep it readable for beginners.
  return `/* Compact runtime (auto-generated) */
function qs(sel, root = document) { return root.querySelector(sel) }
function qsa(sel, root = document) { return Array.from(root.querySelectorAll(sel)) }

function findPageById(id, pages = PAGES) {
  for (const p of pages) {
    if (p.id === id) return p;
    if (p.children) {
      const found = findPageById(id, p.children);
      if (found) return found;
    }
  }
  return null;
}

function renderPage(id) {
  const page = findPageById(id);
  if (!page) {
    document.getElementById('page-container').innerHTML = '<div class="page-card"><strong>Error</strong><div>Page not found</div></div>';
    return;
  }
  const container = qs('#page-container');
  container.innerHTML = '';
  const card = document.createElement('div');
  card.className = 'page-card';
  if (page.type === 'url') {
    const iframe = document.createElement('iframe');
    iframe.className = 'content-frame';
    iframe.src = page.url;
    card.appendChild(iframe);
  } else if (page.type === 'raw') {
    const div = document.createElement('div');
    div.innerHTML = page.raw || '';
    card.appendChild(div);
  } else {
    if (page.header) {
      const h = document.createElement('h2');
      h.className = 'page-title';
      h.textContent = page.header;
      card.appendChild(h);
    }
    if (page.subheader) {
      const sub = document.createElement('div');
      sub.className = 'page-sub';
      sub.textContent = page.subheader;
      card.appendChild(sub);
    }
    if (page.image) {
      const img = document.createElement('img');
      img.src = page.image;
      img.style.width = '100%';
      img.style.borderRadius = '6px';
      img.style.margin = '10px 0';
      card.appendChild(img);
    }
    if (page.text) {
      const p = document.createElement('div');
      p.innerHTML = page.text;
      card.appendChild(p);
    }
  }
  container.appendChild(card);
}

/* Build sidebar menu */
function buildMenu() {
  const listEl = qs('#pages-list');
  listEl.innerHTML = '';
  function createMenuItem(p, level = 0) {
    const item = document.createElement('div');
    item.className = 'menu-item';
    item.style.paddingLeft = (8 + level*8) + 'px';
    const title = document.createElement('div');
    title.className = 'title';
    title.textContent = p.title || '(no title)';
    item.appendChild(title);
    item.addEventListener('click', () => {
      if (p.type) {
        renderPage(p.id);
      }
    });
    return item;
  }
  function walk(pages, level) {
    pages.forEach(p => {
      listEl.appendChild(createMenuItem(p, level));
      if (p.children) walk(p.children, level+1);
    });
  }
  walk(PAGES, 0);
}

/* Init */
window.addEventListener('DOMContentLoaded', () => {
  buildMenu();
  if (state.current) renderPage(state.current);
});`;
}

/* Download helpers */
function downloadScript() {
  if (!isOwner) return alert('Only the owner can export files.');
  const content = createScriptFileContent();
  const blob = new Blob([content], { type: 'text/javascript' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'script.js';
  a.click();
  URL.revokeObjectURL(url);
}

function downloadZip() {
  if (!isOwner) return alert('Only the owner can export files.');
  const zip = new JSZip();
  // index.html template (we include a simple version that points to script.js and styles.css)
  const indexContent = createIndexTemplate();
  const cssContent = createCSSTemplate();
  const scriptContent = createScriptFileContent();
  const urlTemplateContent = createURLTemplate();

  zip.file('index.html', indexContent);
  zip.file('styles.css', cssContent);
  zip.file('script.js', scriptContent);
  zip.folder('templates').file('url-sample.html', urlTemplateContent);

  zip.generateAsync({type: "blob"}).then(function(blob) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'SimpleSite.zip';
    a.click();
    URL.revokeObjectURL(url);
  });
}

function createIndexTemplate() {
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <title>SimpleSite — Dark Template Manager</title>
  <link rel="stylesheet" href="styles.css">
</head>
<body>
  <header id="site-header"><button id="menu-toggle">☰</button><h1 id="site-title">SimpleSite</h1></header>
  <aside id="sidebar" role="navigation"><nav id="pages-list"></nav></aside>
  <main id="content"><div id="page-container"></div></main>
  <!-- TEMPLATE: MAIN_CONTENT_START -->
  <script src="script.js"></script>
  <!-- TEMPLATE: MAIN_CONTENT_END -->
</body>
</html>`;
}

function createCSSTemplate() {
  // Minimal CSS (keeps dark theme)
  return `:root{
  --bg: #0b0f12;
  --panel: #0f1417;
  --muted: #8b98a4;
  --text: #e6eef3;
  --accent: #4aa3ff;
}
body{background:var(--bg); color:var(--text); font-family:system-ui,Arial;}
#site-header{height:56px; display:flex; align-items:center; padding:8px 16px; border-bottom:1px solid rgba(255,255,255,0.03)}
#sidebar{position:fixed; top:56px; bottom:0; width:300px; background:var(--panel); padding:12px; overflow:auto}
#content{margin-top:56px; margin-left:300px; padding:24px}
.page-card{background:rgba(255,255,255,0.02); padding:16px; border-radius:8px}`;
}

function createURLTemplate() {
  return `<!doctype html>
<html>
<head>
  <meta charset="utf-8">
  <title>URL Template (sample)</title>
  <style>body{font-family:system-ui,Arial; background:#fff; color:#111; padding:22px} h1{color:#4aa3ff}</style>
</head>
<body>
  <h1>Embedded URL Sample</h1>
  <p>This is a simple page that demonstrates the <code>type: "url"</code> iframe embedding.</p>
</body>
</html>`;
}

/* TEMPLATE: SCRIPT_END - search token for Ctrl+F */
window.addEventListener("DOMContentLoaded", init);
