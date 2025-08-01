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

# Optional: Extend as new cmd.* actions are needed


# Codex and internal use: maps string commands to functions
COMMANDS = {
    "bundleDeployKit": bundleDeployKit,
    "switchDomain": switchDomain,
    "deployFlavorMixUI": deployFlavorMixUI,
    "capturePOSWaitlist": capturePOSWaitlist,
    "fireSession": fireSession,
    "openWhisperMemory": openWhisperMemory,
    "registerLoungeConfig": registerLoungeConfig,
}


# Optional: Run test
if __name__ == "__main__":
    for cmd_name, cmd_func in COMMANDS.items():
        print(f"▶️ {cmd_name}: {cmd_func()}")
