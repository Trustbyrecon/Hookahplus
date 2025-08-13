import sys
import os
try:
    import yaml
except ImportError:  # pragma: no cover
    yaml = None


def syncCodexToSite():
    print("Executing: syncCodexToSite")
    # Your command logic here


def renderTrustHeatmapPublic():
    print("Executing: renderTrustHeatmapPublic")
    # Your command logic here


def wrapOneClickWithPlanner(
    yaml_path: str = "SimForecast_ATL_7D.yaml",
    image_path: str = "public/assets/qr.png",
):
    """Simulate the AgentPlanner pipeline around OneClickFlow."""

    if yaml is None:
        return "PyYAML not installed."
    if not os.path.exists(yaml_path):
        return "YAML file not found."
    if not os.path.exists(image_path):
        return "Image not found."

    with open(yaml_path, "r") as f:
        session_data = yaml.safe_load(f)

    print("🧭 AgentPlanner analyzing YAML and image...")
    print("⚙️ OneClickFlow session established.")
    print("✍️ WriterAgent drafting pull request and Codex entry...")
    print("🛡️ ReviewerAgent validating flow and assigning Reflex Score...")
    print("📘 ReflexLog updated. CodexUpdate complete.")

    return {"session": session_data, "image": image_path, "reflex_score": 85}


def simulateReflexScoreDelta():
    """Simulate Reflex Score gains for pilot lounges."""

    lounges = [
        {
            "id": "Lounge #001",
            "current": 63,
            "projected": 82,
            "notes": "Manual YAML had missing margins config",
        },
        {
            "id": "Lounge #002",
            "current": 74,
            "projected": 88,
            "notes": "Added Whisper log for SessionNotes adaptation",
        },
        {
            "id": "Lounge #003",
            "current": 58,
            "projected": 83,
            "notes": "Detected drift in layout vs YAML image",
        },
        {
            "id": "Lounge #004",
            "current": 80,
            "projected": 91,
            "notes": "Codex self-heal triggered flavor badge fix",
        },
        {
            "id": "Lounge #005",
            "current": 65,
            "projected": 87,
            "notes": "Enabled auto PR + rollback preview with Reviewer agent",
        },
    ]

    for lounge in lounges:
        lounge["delta"] = lounge["projected"] - lounge["current"]

    avg_delta = sum(l["delta"] for l in lounges) / len(lounges)
    print(f"📊 Reflex Delta Average: {avg_delta:.1f}")
    return {"lounges": lounges, "average_delta": avg_delta}


def deployLandingPatch():
    import importlib.util
    import pathlib

    module_path = pathlib.Path("cmd/modules/deployLandingPatch.py")
    spec = importlib.util.spec_from_file_location("deployLandingPatch", module_path)
    module = importlib.util.module_from_spec(spec)
    assert spec.loader is not None
    spec.loader.exec_module(module)
    module.run()


def dispatcher(command):
    commands = {
        "cmd.syncCodexToSite": syncCodexToSite,
        "cmd.renderTrustHeatmapPublic": renderTrustHeatmapPublic,
        "cmd.wrapOneClickWithPlanner": wrapOneClickWithPlanner,
        "cmd.simulateReflexScoreDelta": simulateReflexScoreDelta,
        "cmd.deployLandingPatch": deployLandingPatch,
    }
    if command in commands:
        result = commands[command]()
        if result is not None:
            print(result)
    else:
        print(f"Unknown command: {command}")


if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python cmd_dispatcher.py <command>")
    else:
        dispatcher(sys.argv[1])
