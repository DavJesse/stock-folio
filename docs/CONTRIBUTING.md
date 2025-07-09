# Contributing Guidelines

Thank you for your interest in contributing to the Stock Portfolio Tracker project! To maintain code quality and a smooth workflow, please follow these guidelines.

## Branching Strategy

- Use feature branches for all work. Branch names should follow this pattern:
  ```
  <type>/<issue-number>-<short-description>
  ```
  - **type:** The area of the project (e.g., `feature`, `bugfix`, `docs`, `refactor`, `test`).
  - **issue-number:** The related GitHub issue number (e.g., `3`).
  - **short-description:** Brief, kebab-case summary of the change.
  - **Example:**
    - `feature/12-add-portfolio-table`
    - `docs/3-create-readme`
    - `bugfix/7-fix-api-error`

## Commit Message Style

- Use clear, descriptive commit messages. The preferred format is:
  ```
  <type>: <short summary> (#<issue-number>)
  ```
  - **type:** Area of change (e.g., `feature`, `fix`, `docs`, `refactor`, `test`).
  - **short summary:** Brief description of the change (imperative mood, lower case).
  - **issue-number:** Reference to the related GitHub issue.
  - **Examples:**
    - `docs: add README (#3)`
    - `feature: implement buy stock flow (#12)`
    - `fix: handle API error on search (#7)`

## Pull Requests

- Reference the related issue in your PR description (e.g., `Closes #3`).
- Provide a clear summary of your changes and any relevant context.
- Ensure your branch is up to date with `main` before opening a PR.
- Request a review from a project maintainer.

## Code Style & Quality

- Follow the existing code style and formatting (see `.eslintrc` and Prettier config if available).
- Run `npm run lint` before pushing.
- Write clear, maintainable, and well-documented code.
- Add or update tests as appropriate.

## Issue Reporting

- Search existing issues before opening a new one.
- Provide a clear, descriptive title and detailed information.
- Include steps to reproduce, expected behavior, and screenshots if relevant.

## Documentation

- Update documentation (e.g., `README.md`, `docs/`) as needed for your changes.
- Use clear, concise language and provide examples where helpful.

---

Thank you for helping make this project better!
