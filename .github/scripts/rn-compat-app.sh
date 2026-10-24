#!/usr/bin/env bash
# Creates a fresh React Native app at a given version, installs the packed
# library into it and wires a capture into App.tsx. The JS checks and native
# builds are run by the caller (.github/workflows/rn-compat.yml).
#
# Usage: rn-compat-app.sh <react-native version> <library .tgz> <app dir>
set -euo pipefail

RN_VERSION="$1"
TARBALL="$(cd "$(dirname "$2")" && pwd)/$(basename "$2")"
APP_DIR="$3"

npx --yes @react-native-community/cli@latest init RNCompat \
  --version "$RN_VERSION" \
  --directory "$APP_DIR" \
  --skip-git-init \
  --install-pods false \
  --pm npm

cd "$APP_DIR"
# Prereleases (RCs, nightlies) never satisfy the `>=0.80.0` peer range; for a
# stable release a peer conflict is a real finding, so keep npm strict.
peer_flags=()
if [[ "$RN_VERSION" == *-* ]]; then
  peer_flags=(--legacy-peer-deps)
fi
npm install --no-audit --no-fund ${peer_flags[@]+"${peer_flags[@]}"} "$TARBALL"

# Use the public API so the bundle and type-check exercise it.
cat > App.tsx <<'EOF'
import React, { useRef } from 'react';
import { Button, Text, View } from 'react-native';
import ViewShot, { captureRef, captureScreen } from 'react-native-view-shot';

export default function App(): React.JSX.Element {
  const ref = useRef<React.ComponentRef<typeof View>>(null);
  return (
    <ViewShot style={{ flex: 1 }} options={{ format: 'png' }}>
      <View ref={ref} collapsable={false}>
        <Text>react-native-view-shot compat</Text>
      </View>
      <Button
        title="capture"
        onPress={async () => {
          console.log(await captureRef(ref, { format: 'png', width: 100 }));
          console.log(await captureScreen({ format: 'jpg' }));
        }}
      />
    </ViewShot>
  );
}
EOF

# Surface javac deprecation details (by default it only prints a one-line
# "Note: Some input files use or override a deprecated API.").
if [ -f android/build.gradle ]; then
  cat >> android/build.gradle <<'EOF'

allprojects {
  tasks.withType(JavaCompile).configureEach {
    options.compilerArgs += ["-Xlint:deprecation", "-Xlint:unchecked"]
  }
}
EOF
else
  echo "android/build.gradle not found (Kotlin DSL template?): javac deprecation details won't be listed" >&2
fi
