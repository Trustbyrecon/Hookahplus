# Hookahplus

Hookahplus aggregates several repositories for the Hookah+ project using Git submodules. Currently only the `netlify` site is linked as a submodule so it remains a separate repo while sharing a common root.

## Initializing Submodules
After cloning this repository, pull in the linked modules with:

```bash
git submodule update --init --recursive
```

This command fetches the `netlify` submodule and checks out the appropriate commit.

## Global Styles

Ensure every Next.js entry point (`pages/_app.tsx`, custom `_document.tsx`, or `app/layout.tsx`) imports `styles/globals.css`. For standalone sub-apps like `app/dashboard`, include the global import or copy the moodbook variables so styling stays consistent.

## Command Dispatcher
Utility tasks can be run via `cmd_dispatcher.py`. Invoke it with a command name to call the corresponding helper in `cmd/modules/reflex_ui.py`:

```bash
python cmd_dispatcher.py <command>
```

Available commands:
- `deployReflexUI` – trigger a Netlify deploy
- `renderReflexLoyalty <user_id>` – generate a loyalty heatmap for the given user
- `injectReflexHeatmap` – insert the heatmap into the dashboard
- `fireSession` – launch a simulated session with QR tracking and dynamic pricing

More commands can be added by extending `cmd/modules/reflex_ui.py` and updating the `COMMANDS` table in `cmd_dispatcher.py`.

## Design Guidelines

Refer to [design-guidelines.md](design-guidelines.md) for Moodbook styling rules and the approved color palette.

## Owner Data Points

For a smoother onboarding experience, lounge owners should be prepared to provide:

- Lounge name and address
- Seating capacity and table identifiers
- Operating hours and contact information
- Default session duration and pricing
- Preferred flavor inventory and top sellers
- Staff roster for assignment and loyalty tracking

Collecting these details allows the dashboard to preload sessions, track revenue, and surface loyalty notes without friction.
