# הוראות בניית APK למערכת הסעות

## דרישות מוקדמות
1. **Node.js** (גרסה 16 ומעלה) - [הורדה](https://nodejs.org/)
2. **Android Studio** - [הורדה](https://developer.android.com/studio)
3. **Java JDK** (מותקן עם Android Studio)

## שלב 1: יצירת אייקונים
1. פתח את הקובץ `generate-icons.html` בדפדפן
2. לחץ על "צור אייקונים"
3. העלה את הקבצים `icon-192.png` ו-`icon-512.png` לתיקיית הפרויקט

## שלב 2: התקנת תלויות
```bash
npm install
```

## שלב 3: הוספת פלטפורמת Android
```bash
npx cap add android
```

## שלב 4: סנכרון קבצים
```bash
npx cap sync
```

## שלב 5: פתיחת פרויקט ב-Android Studio
```bash
npx cap open android
```

## שלב 6: בניית APK ב-Android Studio
1. ב-Android Studio, לחץ על **Build** → **Build Bundle(s) / APK(s)** → **Build APK(s)**
2. המתן לסיום הבנייה
3. לחץ על **locate** או מצא את הקובץ ב: `android/app/build/outputs/apk/release/app-release.apk`
4. העתק את הקובץ לתיקיית הפרויקט ושנה את שמו ל-`transport-system.apk`

## שלב 7: העלאת APK לשרת
העלה את הקובץ `transport-system.apk` לתיקיית הפרויקט ב-GitHub Pages או Netlify.

## חלופה: שימוש ב-PWABuilder (קל יותר!)
1. היכנס ל-[PWABuilder](https://www.pwabuilder.com/)
2. הזן את כתובת האתר שלך
3. לחץ על "Build My PWA"
4. בחר "Android" → "Download"
5. העלה את הקובץ `transport-system.apk` לתיקיית הפרויקט

## הערות
- המשתמשים יצטרכו לאפשר "התקנה ממקור לא ידוע" באנדרואיד שלהם
- ה-APK לא יהיה חתום, כך ש-Android יציג אזהרה בעת התקנה
- לחתימה (מומלץ): צור keystore והגדר אותו ב-`capacitor.config.json`
