"""Surge Add-On logic for quarterly rotations."""


def run_quarterly_surge_rotation():
    """Evaluate the quarterly Surge Add-On rotation."""
    rotation = {
        "Peach + Mint": "Active",
        "Strawberry + Lemon": "In Review",
        "Apple + Grape": "Pending",
    }
    print("🔁 Surge rotation processed for the quarter.")
    return rotation
