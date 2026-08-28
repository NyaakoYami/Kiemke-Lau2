# V11 — Cabin Hover + Agent Rename Fix

## Changes
- Cabin cards now use the Team color tint in the default state.
- Hover reverses the surface to white while retaining the Team-colored border/accent/shadow.
- Reworked the cabin content wrapper from a nested `<button>` to an accessible `<div role="button">`, avoiding invalid nested interactive content.
- Restored direct inline name editing for Agent/Lead via `InlineEdit`.
- Name editing now stops click/pointer propagation so opening the cabin and long-press drag do not interfere with the input.
- Enter saves, Escape cancels, and blur saves the new name.
- `updateProp()` persists the name through the existing `updateState()` flow, so LocalStorage/cloud sync behavior remains unchanged.
