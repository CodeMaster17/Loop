#!/bin/zsh
# Build Rasoi (Release) and install it on the connected iPhone.
# Use it for the weekly reinstall (free Apple ID apps expire after 7 days) or after
# native changes. The phone must be unlocked and on the cable or the same Wi-Fi.
#
# Builds go to Xcode's standard DerivedData folder (not ios/build), so regenerating
# the iOS project never throws compiled work away, and ccache reuses C/C++ results.
set -euo pipefail
cd "$(dirname "$0")/../ios"

export LANG=en_US.UTF-8 LC_ALL=en_US.UTF-8

# First connected physical iPhone (hardware UDID).
DEVICE=$(xcrun devicectl list devices --json-output /tmp/rasoi-devices.json >/dev/null 2>&1; python3 -I -c '
import json
d = json.load(open("/tmp/rasoi-devices.json"))["result"]["devices"]
phones = [x for x in d if x.get("hardwareProperties", {}).get("reality") == "physical"
          and x.get("hardwareProperties", {}).get("platform") == "iOS"]
print(phones[0]["hardwareProperties"]["udid"] if phones else "")
')
rm -f /tmp/rasoi-devices.json
if [[ -z "$DEVICE" ]]; then
  echo "No iPhone found. Plug it in (or join the same Wi-Fi) and unlock it." >&2
  exit 1
fi

echo "Building Rasoi (Release)…"
xcodebuild -workspace Rasoi.xcworkspace -scheme Rasoi -configuration Release \
  -destination "id=$DEVICE" -allowProvisioningUpdates -allowProvisioningDeviceRegistration \
  build -quiet

APP=$(xcodebuild -workspace Rasoi.xcworkspace -scheme Rasoi -configuration Release \
  -destination "id=$DEVICE" -showBuildSettings 2>/dev/null \
  | awk -F' = ' '/ CODESIGNING_FOLDER_PATH = /{print $2; exit}')

echo "Installing on the iPhone…"
xcrun devicectl device install app --device "$DEVICE" "$APP"
echo "Done. Rasoi is installed."
