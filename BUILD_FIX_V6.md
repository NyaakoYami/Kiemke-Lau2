# V6 Build Fix — Sync Button & Cabin Inventory UI

## 1. JSX build error

The sync `Button` had the same JSX property declared twice:

- `disabled={!isAdmin || isSyncing}`
- `disabled={isSyncing}`

The second declaration was removed. The final component is:

```jsx
<Button
  disabled={!isAdmin || isSyncing}
  label={isSyncing ? "Đang lưu..." : "Lưu Cloud"}
  icon="pi pi-cloud-upload"
  severity="success"
  className="toolbar-button primary"
  onClick={syncOnline}
/>
```

`isSyncing` is declared in component scope with `useState(false)`, and `syncOnline` is declared in the same component scope. The sync handler still guards non-admin users and resets `isSyncing` in `finally`.

## 2. Cabin quantity layout

Inventory items now use a two-region CSS Grid:

- left region: checkbox + full asset label, with wrapping enabled
- right region: dedicated `SL` + quantity input area

The quantity area has a fixed compact width and a separating border. The chip itself no longer clips the label. On small screens the inventory grid collapses to one column while retaining the dedicated quantity region.

Laptop keeps its dedicated full-width second row for the two required package configurations.

## Validation note

The source-level duplicate JSX attribute causing the reported compiler error has been removed. A full `vite build` could not be executed in the current sandbox because dependency installation timed out before `node_modules` became available.
