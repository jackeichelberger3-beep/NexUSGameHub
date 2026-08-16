# Editor usage & Owner-key README

This short README explains how to unlock and use the in-browser editor added on branch `feature/add-in-browser-editor`.

Files updated

- `index.html` — includes the Editor UI (toggle button in the header).
- `script.js` — contains the `OWNER_KEY` constant and editor logic. The in-memory pages live in the `PAGES` array.

Quick steps — unlock & use the editor

1. Open the site (locally or hosted) and load `index.html` in your browser.
2. Click the Editor button (🔒 Editor) in the header.
3. You will be prompted for the owner key. Enter the correct owner key to unlock editor features.
4. Once unlocked the editor actions become enabled:
   - Add Page / Add Subpage
   - Edit page fields (id, title, type, header, body, image, raw HTML)
   - Save (in-memory) changes
   - Reorder pages
   - Delete pages
   - Download `script.js` (export with current PAGES ARRAY)
   - Download full site ZIP (index.html, styles.css, script.js, templates/)
5. After editing, persist by either:
   - Downloading `script.js` and replacing the file in the repo, or
   - Downloading the ZIP and deploying/uploading the files, or
   - Committing the changes to the repository (recommended workflow: open a PR from `feature/add-in-browser-editor`).

How to edit the Owner key (OWNER_KEY)

- Open `script.js` in a text editor and find the constant near the top:

```js
// OWNER KEY: set this value to a secret string known only to the owner.
// Example: const OWNER_KEY = "my-secret-owner-key";
const OWNER_KEY = "OWNER-REPLACE-ME";
```

- Replace the placeholder string `OWNER-REPLACE-ME` with a secret value only you know (e.g. `s3cure-r4nd0m-string-xyz`).
- Save and commit the changed `script.js` to the branch. When users open the Editor UI they must enter this value to unlock editing features.

Important security notes (read!)

- Client-side only: This owner-key mechanism is purely client-side (in JavaScript). The value is stored in `script.js` and is visible to anyone who can read the branch or the deployed files. It is NOT secure against determined users.
- For production security: use a server-side authentication or an edit-backend that verifies credentials before allowing edits or commits. If you want, I can help design or implement a safer backend flow (e.g., GitHub OAuth + a server that commits changes via a GitHub App or personal access token).

Recommended workflow

1. Set a strong OWNER_KEY in `script.js` locally (do not share it publicly).
2. Commit the change to the branch `feature/add-in-browser-editor` and push.
3. Use the editor to prototype, then download `script.js` or ZIP and either commit those exported files or open a PR to merge into your main branch.

If you'd like

- I can commit a specific OWNER_KEY value you choose to the branch (you must provide it here), or
- I can create a secure backend flow using GitHub authentication so edits result in PRs (recommended for real multi-user scenarios).

---
This file was added to branch `feature/add-in-browser-editor` to document how to use the owner-locked in-browser editor. If you want the README added as `README.md` instead, tell me and I will replace or add it.