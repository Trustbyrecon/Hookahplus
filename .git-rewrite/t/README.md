# Hookahplus

Hookahplus aggregates several repositories for the Hookah+ project using Git submodules. The `backend`, `netlify` and future modules are linked as submodules so they remain separate repos while sharing a common root.

## Initializing Submodules
After cloning this repository, pull in the linked modules with:

```bash
git submodule update --init --recursive
```

This command fetches each submodule (for example `backend` and `netlify`) and checks out the appropriate commit.

## Command Dispatcher
Utility tasks can be run via `cmd_dispatcher.py`. Invoke it with a command name to call the corresponding helper in `cmd/modules/reflex_ui.py`:

```bash
python cmd_dispatcher.py <command>
```

Available commands:
- `deployReflexUI` – trigger a Netlify deploy
- `renderReflexLoyalty <user_id>` – generate a loyalty heatmap for the given user
- `injectReflexHeatmap` – insert the heatmap into the dashboard

More commands can be added by extending `cmd/modules/reflex_ui.py` and updating the `COMMANDS` table in `cmd_dispatcher.py`.
