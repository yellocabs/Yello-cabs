#!/bin/bash

# --- React Native Full Clean Script ---
echo "🧹 Cleaning Metro cache..."
watchman watch-del-all 2>/dev/null
rm -rf $TMPDIR/metro-* 
rm -rf $TMPDIR/react-*

# echo "🧹 Cleaning node_modules..."
# rm -rf node_modules
# rm -f package-lock.json

# echo "📦 Installing dependencies..."
# npm install

echo "🧹 Cleaning Android build..."
cd android
chmod +x gradlew
./gradlew clean
cd ..

if [ -d "ios" ]; then
  echo "🧹 Cleaning iOS Pods..."
  cd ios
  pod deintegrate
  pod install
  cd ..
fi

echo "🚀 Starting Metro with reset cache..."
npx react-native start --reset-cache
