# Generated documentation output

This folder and [`../word/`](../word/) contain **generated** files. Do not edit them by hand — they are rebuilt from the Markdown sources.

## What is here

| Folder | Contents |
| --- | --- |
| `docs/html/` | One standalone HTML page per Markdown document, plus `index.html` (the landing page). Open it directly in a browser — no server required. |
| `docs/word/` | Two combined Word documents: `QREX-User-Manual` and `QREX-Technical-Documentation`, each in `.docx` (modern) and `.doc` (legacy) format. |

## Navigation

Every HTML page carries a documentation menu on the left:

- **Collapsible groups** — *User Manual* and *Technical Documentation*. The group containing the current page is expanded automatically; click a group heading to collapse or expand it.
- **Search box** — type to filter the document list live; matching groups expand, non-matching entries hide.
- **Active highlight** — the current page is highlighted in the list.
- **Home link** — "All documentation" at the top returns to `index.html`.
- **Downloads** — direct links to the generated Word documents.
- **Mobile** — a ☰ button toggles the menu in a slide-in drawer on narrow screens.

Prev/next links at the foot of each page walk through the documents in order.

## Sources

Every page is generated from:

- `docs/*.md` → `tech-*.html` (Technical Documentation)
- `docs/user-manual/*.md` → `manual-*.html` (User Manual)

## Regenerating

```sh
npm run docs:html   # Markdown -> HTML only
npm run docs:doc    # Markdown -> HTML + Word (.docx and .doc)
```

The Word step requires **LibreOffice** (`soffice`) on the PATH. The HTML step requires only the `marked` dev dependency.

Internal links and heading anchors are rewritten so the HTML pages cross-link correctly. Files under `docs/html/_combined/` and `docs/html/_lo-profile/` are build scratch and are git-ignored.
