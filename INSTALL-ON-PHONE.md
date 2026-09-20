# Install Rasoi on your Android phone

You have a **standalone APK** — the whole app (voice included) is inside it. No computer or dev server needed once it's on your phone.

File: `android/app/build/outputs/apk/release/app-release.apk`

## Option A — Sideload the APK (simplest)
1. Get `app-release.apk` onto your phone — send it to yourself on WhatsApp/Telegram/email/Google Drive, or copy via USB.
2. On the phone, tap the file. Android will say "For your security…" — allow **Install unknown apps** for the app you're installing from (Files / WhatsApp / Chrome), then tap **Install**.
3. Open **Rasoi** from your app drawer.
4. First time you tap the 🎤, Android asks for the **microphone** — tap **While using the app**. Then just speak.

## Option B — Install over USB (from this Mac)
1. On the phone: Settings → About phone → tap **Build number** 7× to enable Developer options. Then Settings → System → Developer options → turn on **USB debugging**.
2. Plug the phone into the Mac, tap **Allow** on the "Allow USB debugging?" prompt.
3. In this project folder run:
   ```
   ~/Library/Android/sdk/platform-tools/adb install -r android/app/build/outputs/apk/release/app-release.apk
   ```
4. Open **Rasoi** on the phone.

## Notes
- This release build runs **standalone** — it does **not** need Metro or a computer.
- **Voice** works on a real phone (needs Google speech services, which your phone has; an emulator doesn't).
- Everything is saved **on the phone only** (AsyncStorage). Set your cook's name + WhatsApp number in ⚙️.
- Meal plans currently come from the built-in library; **Stage 3 (AI)** adds natural-language understanding and smarter plans via a small backend.

## Rebuilding later (after code changes)
```
cd ~/Documents/rasoi-planner/android
ANDROID_HOME="$HOME/Library/Android/sdk" ./gradlew assembleRelease
```
New APK appears at `app/build/outputs/apk/release/app-release.apk`.
