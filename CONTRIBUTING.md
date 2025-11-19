# Contributing to RepoWise

Thank you for your interest in RepoWise! We welcome contributions of all kinds—bug fixes, documentation improvements, feature requests, and more. This guide explains how to set up your environment, follow our coding conventions, and collaborate effectively with the team.

## Table of Contents
1. [Code of Conduct](#code-of-conduct)
2. [Project Setup](#project-setup)
3. [Development Workflow](#development-workflow)
4. [Coding Standards](#coding-standards)
5. [Testing](#testing)
6. [Pull Request Process](#pull-request-process)
7. [Issue Reporting](#issue-reporting)
8. [Community and Support](#community-and-support)

## Code of Conduct
By participating in this project you agree to uphold a welcoming, inclusive environment. Be respectful, use constructive language, and assume positive intent from fellow contributors. Harassment or discrimination of any kind is not tolerated.

## Project Setup
1. **Fork and Clone**
   ```bash
   git clone https://github.com/<your-username>/RepoWise-website.git
   cd RepoWise-website
   ```
2. **Install Dependencies**
   RepoWise is a static site. To preview it locally, install a lightweight HTTP server such as `serve`, `http-server`, or use Python's built-in module:
   ```bash
   python3 -m http.server 8080
   ```
   Then visit `http://localhost:8080` in your browser.
3. **Branching**
   Create a descriptive feature branch for your changes:
   ```bash
   git checkout -b feat/add-contribution-guide
   ```

## Development Workflow
- Keep your fork up to date by syncing with `upstream` (`git remote add upstream https://github.com/RepoWise/RepoWise-website.git`).
- Rebase or merge frequently so your branch contains the latest main-branch updates.
- Commit small, logical changes with clear commit messages (e.g., `feat: add link to contribution guide`).
- When addressing an open issue, reference it in your commit and PR descriptions.

## Coding Standards
- **HTML/CSS**: Prefer semantic HTML5 elements. Keep inline styles minimal and rely on the existing Bulma/Bulma Carousel styles when possible. Run your HTML through a validator if you make structural changes.
- **JavaScript**: Use modern ES6+ features and keep scripts modular. Lint your code (e.g., with `eslint`) if you have it configured locally.
- **Accessibility**: Provide descriptive `aria` labels, alt text, and keyboard-accessible interactions.
- **Documentation**: Update `README.md` or relevant docs when behavior changes or new instructions are required.

## Testing
Because RepoWise is a static site, testing usually involves manual verification:
1. Start your local HTTP server.
2. Confirm the affected pages render correctly on desktop and mobile breakpoints.
3. Run automated checks (linters, formatters, link checkers) if available in your environment.
4. Ensure there are no console errors or broken links.

## Pull Request Process
1. Ensure your branch builds and looks correct locally.
2. Re-read your changes for clarity and remove any debugging logs or unused assets.
3. Update documentation and screenshots when applicable.
4. Push your branch to your fork and open a PR against `RepoWise/RepoWise-website`'s `main` branch.
5. Fill out the PR template thoroughly, summarizing the motivation, screenshots (if UI changes), and testing steps.
6. Respond to reviewer feedback promptly. If you make follow-up changes, leave a short comment summarizing what changed since the previous review round.

## Issue Reporting
When filing an issue:
- Search existing issues to avoid duplicates.
- Use a clear, descriptive title (e.g., `Navbar links wrap incorrectly on mobile`).
- Provide reproduction steps, screenshots, and browser/OS information if relevant.
- If you have suggestions for fixes, include them! Even partial context is helpful.

## Community and Support
- Discussions happen in GitHub Issues and PRs. Keep the conversation on-topic and respectful.
- If you discover a security vulnerability, do **not** open a public issue. Instead, email the maintainers listed in `README.md` so we can coordinate a responsible disclosure.

We appreciate every contribution—thank you for helping make RepoWise better!
