# RepoWise Website

This repository contains the static marketing site for **RepoWise**, a tool for automatically analysing pull requests. The project is built with vanilla HTML, CSS, and JavaScript and is intended to be served as a static site (for example with GitHub Pages, Netlify, or Vercel).

## Project structure

```
.
├── index.html            # Landing page markup
├── static/
│   ├── css/              # Stylesheets (Bulma, Font Awesome, and custom styles)
│   ├── js/               # Small JavaScript helpers (carousel, slider, counter)
│   └── diagrams/         # Architecture and workflow diagrams displayed on the site
```

## Getting started

Because the site is static, you can open `index.html` directly in your browser or serve it with any simple HTTP server.

### Option 1: Open in a browser

Double-click `index.html` (or right-click and choose *Open With → Browser*). Some browsers restrict local file access for fonts or scripts; if anything looks off, use the local server option below.

### Option 2: Run a local development server

Any static server will work. Here are a few common choices:

- **Python 3**
  ```bash
  python3 -m http.server 8000
  ```
  Then visit <http://localhost:8000>.

- **Node.js (http-server)**
  ```bash
  npx http-server . -p 8000
  ```

## Deployment

Upload the repository contents to your preferred static hosting provider. Be sure to include the `static/` directory so that styles, scripts, and diagrams load correctly.

## Contributing

1. Fork the repository and create a feature branch.
2. Make your changes.
3. Commit your changes and open a pull request describing the modifications.

## License

This project is licensed under the [MIT License](LICENSE), permitting reuse, modification, and distribution with appropriate attribution.
