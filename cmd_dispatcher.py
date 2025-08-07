
import sys

def syncCodexToSite():
    print("Executing: syncCodexToSite")
    # Your command logic here

def renderTrustHeatmapPublic():
    print("Executing: renderTrustHeatmapPublic")
    # Your command logic here

def dispatcher(command):
    commands = {
        'cmd.syncCodexToSite': syncCodexToSite,
        'cmd.renderTrustHeatmapPublic': renderTrustHeatmapPublic,
    }
    if command in commands:
        commands[command]()
    else:
        print(f"Unknown command: {command}")

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python cmd_dispatcher.py <command>")
    else:
        dispatcher(sys.argv[1])
