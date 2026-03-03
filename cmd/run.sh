#!/usr/bin/env bash
set -euo pipefail
BUILD_HOOK="https://api.netlify.com/build_hooks/688ce1aa50d8ebe645ce2720"
case "${1:-}" in
  cmd.deployToNetlify) echo "Triggering Netlify build…"; curl -s -X POST "$BUILD_HOOK" && echo " done";;
  cmd.fireSession)
    AMOUNT="${2:-3000}"; MIX_RAW="${3:-Mint,Blue Mist}"; REF="${4:-CLI-TEST}";
    IFS=',' read -ra FL_ARR <<< "$MIX_RAW"; FL_JSON="$(printf '"%s",' "${FL_ARR[@]}")"; FL_JSON="[${FL_JSON%,}]";
    PAYLOAD=$(cat <<JSON
{"sessionId":"hp_$(date +%s)","loungeId":"demo-lounge-001","flavorMix":$FL_JSON,"basePrice":$AMOUNT,"addOns":[{"name":"Premium Flavor","amount":500}],"notes":"cli fireSession","ref":"$REF"}
JSON
)
    RES=$(curl -s https://hookahplus.net/.netlify/functions/createCheckout -H "Content-Type: application/json" -d "$PAYLOAD");
    echo "$RES"; URL=$(echo "$RES"|sed -n 's/.*"url":"\([^"]*\)".*/\1/p'); [ -n "$URL" ] && { command -v xdg-open && xdg-open "$URL" >/dev/null 2>&1 || command -v open && open "$URL" || cmd.exe /c start "" "$URL" >/dev/null 2>&1 || true; };
    ;;
  *) echo "Usage: bash cmd/run.sh cmd.deployToNetlify | cmd.fireSession [amount] 'Flavor1,Flavor2' [ref]"; exit 1;;
esac
