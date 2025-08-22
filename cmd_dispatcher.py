# cmd_dispatcher.py

import os
import sys
import zipfile
import shutil

# Ensure modules in ./cmd/modules can be imported without installing as a package
MODULE_PATH = os.path.join(os.path.dirname(__file__), "cmd", "modules")
if MODULE_PATH not in sys.path:
    sys.path.insert(0, MODULE_PATH)

import reflex_ui


def bundleDeployKit():
    """
    Bundles the Hookah+ deploy kit: React UI, YAML configs, and Netlify-ready build.
    Returns path to generated ZIP.
    """
    bundle_name = "hookahplus_deploy_kit.zip"
    output_dir = "dist"
    bundle_path = os.path.join(output_dir, bundle_name)
    os.makedirs(output_dir, exist_ok=True)

    files_to_include = [
        "dashboard/ui_component_pack/",
        "preorder/web_companion/",
        "configs/session_config.yaml",
        "netlify.toml",
        "README.md"
    ]

    with zipfile.ZipFile(bundle_path, 'w', zipfile.ZIP_DEFLATED) as zipf:
        for item in files_to_include:
            if os.path.isdir(item):
                for root, _, files in os.walk(item):
                    for file in files:
                        full_path = os.path.join(root, file)
                        arcname = os.path.relpath(full_path, os.path.dirname(item))
                        zipf.write(full_path, arcname)
            elif os.path.isfile(item):
                zipf.write(item, os.path.basename(item))

    return f"✅ Deploy kit bundled at: {bundle_path}"


def switchDomain(domain_name="hookahplus.net"):
    """
    Simulates domain switch for deployment.
    """
    # Placeholder logic — in production, update Netlify config or DNS.
    return f"🌐 Domain switched to: https://{domain_name}"


def deployFlavorMixUI():
    """
    Deploys Flavor Mix History Tracker UI.
    """
    # Simulate deployment steps
    return "📦 Flavor Mix UI deployed to /flavor-mix-history"


def capturePOSWaitlist():
    """
    Activates POS Plugin Waitlist capture form.
    """
    return "📝 POS waitlist form now live at /waitlist"


def fireSession():
    """
    Simulates full Hookah+ session with QR + pricing.
    """
    return "🔥 Session launched with QR tracking + dynamic pricing enabled"


def openWhisperMemory():
    """
    Opens the Whisper Log Memory view.
    """
    return "📖 Whisper Memory Panel opened — review recent Reflex signals"


def markCodexPRResolved():
    """Mark the current Codex pull request as resolved."""
    # In this minimal implementation we just return a success message.
    # A real deployment could update PR status via an API call.
    return "✅ Codex pull request marked as resolved"



def lockTrustDeploy(phase: str = "Phase1"):
    """Simulates locking the deployment pipeline for a given phase."""
    print(f"🔒 Locking Trust deploy at {phase}...")
    # Placeholder logic that would trigger any CI/CD lock mechanisms
    return f"Deployment locked for {phase}"



def alignMainPortalUI():
    """
    Syncs the main portal landing screen with links to key dashboards and
    panels. Generates a styled HTML page at ``dashboard/pages/index.html`` with
    navigation buttons.
    """
    output_dir = "dashboard/pages"
    index_html_path = os.path.join(output_dir, "index.html")
    os.makedirs(output_dir, exist_ok=True)

    html = """
<!DOCTYPE html>
<html lang=\"en\">
<head>
  <meta charset=\"UTF-8\">
  <title>Hookah+ Portal</title>
  <style>
    body {
      background-color: #000;
      color: #f5f5f5;
      font-family: 'Segoe UI', sans-serif;
      display: flex;
      flex-direction: column;
      align-items: center;
      padding-top: 10vh;
    }
    h1 {
      font-size: 2.25rem;
      margin-bottom: 1.5rem;
    }
    .button-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1.5rem;
      margin-top: 2rem;
    }
    a {
      padding: 1rem 2rem;
      text-decoration: none;
      color: #000;
      background: gold;
      border-radius: 12px;
      font-weight: bold;
      box-shadow: 0 4px 12px rgba(255, 215, 0, 0.3);
      transition: background 0.3s ease;
      text-align: center;
    }
    a:hover {
      background: orange;
    }
  </style>
</head>
<body>
  <h1>Hookah+ — Select Your Operational Mode</h1>
  <div class=\"button-grid\">
    <a href=\"/lounge\">Lounge Dashboard</a>
    <a href=\"/preorder\">QR Pre-Order Gateway</a>
    <a href=\"/admin\">Admin Intelligence Hub</a>
    <a href=\"/operator\">Main Operator Panel</a>
  </div>
</body>
</html>
""".strip()

    try:
        with open(index_html_path, "w") as f:
            f.write(html)
        return f"✅ Main portal UI written to {index_html_path}"
    except Exception as e:
        return f"❌ Failed to write main portal HTML: {str(e)}"


def registerLoungeConfig(
    lounge_name="Midnight Ember Lounge",
    session_price=30,
    flavor_addons=None,
    seat_count=10,
    section_names=None,
    slug=None
):
    """Registers a YAML config for a new Hookah+ lounge."""
    import yaml
    import os
    from slugify import slugify

    if flavor_addons is None:
        flavor_addons = {
            "Mint Blast": 2,
            "Double Apple": 3,
            "Blue Ice": 1
        }

    if section_names is None:
        section_names = ["Main", "VIP"]

    if not slug:
        slug = slugify(lounge_name)

    config = {
        "lounge_name": lounge_name,
        "slug": slug,
        "session_price": session_price,
        "flavor_addons": flavor_addons,
        "sections": section_names,
        "seat_count": seat_count,
        "reflex_enabled": True
    }

    output_dir = "configs/lounges"
    os.makedirs(output_dir, exist_ok=True)
    config_path = os.path.join(output_dir, f"{slug}.yaml")

    try:
        with open(config_path, "w") as f:
            yaml.dump(config, f)
        return f"\u2705 Lounge config registered: {config_path}"
    except Exception as e:
        return f"\u274c Failed to write config: {str(e)}"

def pushPressKit():
    """Simulates pushing the latest press kit assets."""
    # Placeholder for real sync logic
    return "📣 Press kit pushed to /press-kit"

def releaseTeaserVideo():
    """Publishes the Hookah+ teaser video to public channels."""
    # Placeholder for actual release workflow (e.g., upload to CDN/YouTube)
    return "🎬 Teaser video released across marketing outlets"



# Optional: Extend as new cmd.* actions are needed


# Codex and internal use: maps string commands to functions
COMMANDS = {
    "deployReflexUI": reflex_ui.deploy_reflex_ui,
    "renderReflexLoyalty": reflex_ui.render_reflex_loyalty,
    "injectReflexHeatmap": reflex_ui.inject_reflex_heatmap,
    "deployFlavorMixUI": reflex_ui.deploy_flavor_mix_ui,
    # Add more here...

    "deployToNetlify": reflex_ui.deploy_to_netlify,

    "bundleDeployKit": bundleDeployKit,
    "switchDomain": switchDomain,
    "deployFlavorMixUI": deployFlavorMixUI,
    "capturePOSWaitlist": capturePOSWaitlist,
    "fireSession": fireSession,
    "openWhisperMemory": openWhisperMemory,
    "markCodexPRResolved": markCodexPRResolved,
    "lockTrustDeploy": lockTrustDeploy,
    "alignMainPortalUI": alignMainPortalUI,
    "registerLoungeConfig": registerLoungeConfig,
    "pushPressKit": pushPressKit,
    "releaseTeaserVideo": releaseTeaserVideo
}


# Optional: Run command from CLI
if __name__ == "__main__":
    if len(sys.argv) < 2:
        available = ", ".join(COMMANDS.keys())
        print(f"Usage: python {sys.argv[0]} <command> [args...]\nAvailable commands: {available}")
        sys.exit(1)

    cmd_name = sys.argv[1]
    args = sys.argv[2:]
    cmd_func = COMMANDS.get(cmd_name)

    if not cmd_func:
        print(f"Unknown command: {cmd_name}")
        print("Available commands:")
        for name in COMMANDS.keys():
            print(f"  - {name}")
        sys.exit(1)

    result = cmd_func(*args)
    print(result)
