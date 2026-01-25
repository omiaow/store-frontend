# React Architecture Guidelines

This document defines the **mandatory architectural rules** for this React project. All new code and refactors must follow these rules to keep the codebase clean, scalable, and maintainable.

---

## 1. Routing Rules

* **Every page must be handled by `react-router-dom`.**
* ❌ Do NOT use `useState`, conditional rendering, or flags to simulate navigation.
* ✅ All navigation must go through:

  * `<Routes>` / `<Route>`
  * `useNavigate()`
  * `Link` or `NavLink`

**Example:**

```
/pages
  HomePage.jsx
  ProfilePage.jsx
/routes
  AppRoutes.jsx
```

---

## 2. Styling Rules

* ❌ Do NOT write CSS inline inside JSX (no `style={{ ... }}`).
* ❌ Do NOT write CSS directly inside components.
* ✅ Use **separate CSS / SCSS / CSS Modules / Tailwind classes** only.

**Allowed:**

* `.css`, `.scss`, `.module.css`
* Styled files imported into components

---

## 3. API & HTTP Requests

* **All API requests must go through `/http.hook.js`.**
* ❌ Do NOT use `fetch`, `axios`, or API logic directly inside components.
* ❌ Do NOT duplicate API logic across files.

**Rules:**

* `http.hook.js` is the single source of truth for:

  * Base URL
  * Headers
  * Tokens / Authorization
  * Error handling

Components may only **call exposed methods** from the hook.

---

## 4. Page & Component Structure

### Page Size Rule

* If a page becomes **large or complex**, it must be split into smaller components.
* A page component should:

  * Handle layout & data flow
  * NOT contain large UI blocks

### Folder Structure Rule

* Each page must have its **own folder**.
* Page logic and child components must be separated.

**Example:**

```
/pages
  Profile
    ProfilePage.jsx
    components
      ProfileHeader.jsx
      ProfileStats.jsx
      ProfileTabs.jsx
```

---

## 5. Single Responsibility Rule

* **One component = one responsibility.**
* ❌ Do NOT mix:

  * Routing logic
  * API logic
  * UI rendering
  * Business logic

Split responsibilities into:

* Pages
* Components
* Hooks
* Services

---

## 6. State Management Rules

* ❌ Do NOT lift state unnecessarily.
* ❌ Do NOT use global state for page-only logic.
* ✅ Local state → component
* ✅ Shared state → context / store
* ✅ Server state → API hooks

---

## 7. Side Effects & Hooks

* ❌ No side effects inside render.
* ❌ No API calls outside `useEffect` or custom hooks.
* ✅ Complex logic must be extracted into **custom hooks**.

**Example:**

```
/hooks
  useProfile.js
```

---

## 8. Imports & File Organization

* Use **absolute imports** where possible.
* Keep imports ordered:

  1. External libraries
  2. Hooks
  3. Components
  4. Styles

---

## 9. Code Quality & Linting

* ESLint rules must be respected.
* No unused variables or imports.
* No commented-out dead code.

---

## 10. Growth Rule (Future-Proofing)

* If something feels hard to reuse — it is probably structured wrong.
* If a file exceeds reasonable size — split it.
* Optimize for **readability first**, performance second.

---

## Final Rule (Most Important)

> **Consistency beats cleverness.**

Follow the rules even if your solution seems faster. A predictable codebase scales better than a smart one.
