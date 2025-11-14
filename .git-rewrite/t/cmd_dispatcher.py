# cmd_dispatcher.py

import os
import zipfile
import shutil


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


 codex/task-title
def releaseTeaserVideo():
    """Publishes the Hookah+ teaser video to public channels."""
    # Placeholder for actual release workflow (e.g., upload to CDN/YouTube)
    return "🎬 Teaser video released across marketing outlets"

def registerLoungeConfig(config_path="configs/lounge_config.yaml"):
    """Register lounge configuration from a YAML file."""
    if not os.path.isfile(config_path):
        return f"⚠️ Lounge config {config_path} not found"
    return f"🎉 Lounge configuration registered from {config_path}"
 main


# Optional: Extend as new cmd.* actions are needed


# Codex and internal use: maps string commands to functions
COMMANDS = {
 codex/deploy-flavor-mix-ui
    "deployReflexUI": reflex_ui.deploy_reflex_ui,
    "renderReflexLoyalty": reflex_ui.render_reflex_loyalty,
    "injectReflexHeatmap": reflex_ui.inject_reflex_heatmap,
    "deployFlavorMixUI": reflex_ui.deploy_flavor_mix_ui,
    # Add more here...

    "bundleDeployKit": bundleDeployKit,
    "switchDomain": switchDomain,
    "deployFlavorMixUI": deployFlavorMixUI,
    "capturePOSWaitlist": capturePOSWaitlist,
    "fireSession": fireSession,
    "openWhisperMemory": openWhisperMemory,
 codex/task-title
    "releaseTeaserVideo": releaseTeaserVideo

    "registerLoungeConfig": registerLoungeConfig
 main
main
}


# Optional: Run test
if __name__ == "__main__":
    for cmd_name, cmd_func in COMMANDS.items():
        print(f"▶️ {cmd_name}: {cmd_func()}")
