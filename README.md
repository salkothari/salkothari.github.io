# salkothari.github.io

Personal website for Saloni Kothari — I build design solutions to healthcare problems.

Plain HTML/CSS/JS. No build step.

## Local preview

Open `index.html` in a browser, or run a tiny server:

```bash
python3 -m http.server
```

Then visit http://localhost:8000

## Deploy (GitHub Pages)

1. Create a repo named **`salkothari.github.io`** on GitHub.
2. Push this folder to it:
   ```bash
   git remote add origin https://github.com/salkothari/salkothari.github.io.git
   git add -A
   git commit -m "Initial personal site"
   git branch -M main
   git push -u origin main
   ```
3. On GitHub: **Settings → Pages → Source: Deploy from branch → `main` / root**.

Live at https://salkothari.github.io

## Editing

- `index.html` — all content (edit the text directly)
- `styles.css` — colors, fonts, layout (theme tokens at the top)
- `script.js` — theme toggle + footer year
