import os
import json
from datetime import datetime

import yaml

try:
    import qrcode
except ImportError:  # pragma: no cover
    qrcode = None

# Paths for logged data
BASE_DIR = os.path.join(os.path.dirname(__file__), "..", "..")
FLAVOR_LOG_PATH = os.path.join(BASE_DIR, "StripeFlavorLog.yaml")
CHECKOUT_METADATA_PATH = os.path.join(BASE_DIR, "checkout_session_metadata.json")
LOYALTY_VAULT_PATH = os.path.join(BASE_DIR, "ReflexLoyalty_Vault.yaml")
SURGE_PRICING_PATH = os.path.join(BASE_DIR, "StripeSurgePricing.json")
SURGE_LOG_PATH = os.path.join(BASE_DIR, "SurgeLog_WeekendPeachMint.yaml")


def _load_yaml(path, default):
    if os.path.exists(path):
        with open(path, "r") as f:
            data = yaml.safe_load(f) or default
    else:
        data = default
    return data


def _write_yaml(path, data):
    with open(path, "w") as f:
        yaml.safe_dump(data, f)


def inject_flavor_metadata_stripe(flavor_combo: str, surge_active: bool = False):
    """Inject flavor combo metadata into a Stripe Checkout session."""
    metadata = {
        "flavor_combo": flavor_combo,
        "surge_active": str(surge_active).lower(),
    }
    with open(CHECKOUT_METADATA_PATH, "w") as f:
        json.dump(metadata, f, indent=2)

    log = _load_yaml(FLAVOR_LOG_PATH, [])
    log.append(
        {
            "timestamp": datetime.utcnow().isoformat(),
            "flavor_combo": flavor_combo,
            "surge_active": surge_active,
        }
    )
    _write_yaml(FLAVOR_LOG_PATH, log)
    return f"Metadata injected for {flavor_combo} (surge_active={surge_active})"


def attach_loyalty_to_stripe_events(
    user_id: str, amount: float, trust_arc: float, surge_active: bool = False
):
    """Attach loyalty gain to a Stripe payment event."""
    if trust_arc < 6.0:
        return "TrustArc below threshold; no loyalty delta applied."

    loyalty_gain = round(amount * 0.1 + (0.5 if surge_active else 0), 2)
    data = _load_yaml(LOYALTY_VAULT_PATH, {})
    transactions = data.get("transactions", [])
    transactions.append(
        {
            "user": user_id,
            "amount": amount,
            "trust_arc": trust_arc,
            "loyalty_gain": loyalty_gain,
        }
    )
    data["transactions"] = transactions
    _write_yaml(LOYALTY_VAULT_PATH, data)

    msg = f"Loyalty +{loyalty_gain} attached for user {user_id}"
    if loyalty_gain >= 1.0:
        msg += " | Whisper milestone triggered"
    return msg


def add_surge_addon_to_stripe_price(flavor: str, base_price: float):
    """Adjust flavor price with weekend surge add-on."""
    is_weekend = datetime.utcnow().weekday() >= 5
    surge_price = base_price + 3 if is_weekend else base_price

    pricing = {}
    if os.path.exists(SURGE_PRICING_PATH):
        with open(SURGE_PRICING_PATH, "r") as f:
            pricing = json.load(f)
    pricing[flavor] = surge_price
    with open(SURGE_PRICING_PATH, "w") as f:
        json.dump(pricing, f, indent=2)

    log = _load_yaml(SURGE_LOG_PATH, [])
    log.append(
        {
            "flavor": flavor,
            "base_price": base_price,
            "surge_price": surge_price,
            "weekend": is_weekend,
            "timestamp": datetime.utcnow().isoformat(),
        }
    )
    _write_yaml(SURGE_LOG_PATH, log)

    display = "🔥 Trending Mix +$3" if is_weekend else "No surge pricing applied"
    return f"{display} | {flavor} price: ${surge_price}"


def generate_stripe_qr(lounge_id: str, session_id: str, checkout_url: str):
    """Generate a QR code pointing to a Stripe Checkout session."""
    if qrcode is None:
        return "qrcode library not installed"

    qr_dir = os.path.join(BASE_DIR, "public", "qr")
    os.makedirs(qr_dir, exist_ok=True)
    file_path = os.path.join(qr_dir, f"{lounge_id}_{session_id}.png")
    img = qrcode.make(checkout_url)
    img.save(file_path)
    return f"QR code generated at {file_path}"


def link_stripe_to_whisper(user_id: str, message: str = None):
    """Trigger a Whisper prompt after checkout success."""
    if not message:
        message = "Want to save this mix for next time? Loyalty bonus unlocked."
    return f"Whisper to {user_id}: {message}"
