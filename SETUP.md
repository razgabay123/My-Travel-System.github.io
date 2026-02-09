# מדריך התקנה - מערכת הסעות עם מסד נתונים

## מה השתנה?

המערכת עברה משימוש ב-JSON פשוט למסד נתונים SQLite עם שרת backend:

### יתרונות:
✅ **שינויי סיסמה מתעדכנים במסד הנתונים** - לא רק ב-localStorage
✅ **הצפנת סיסמאות** - bcrypt במקום טקסט פשוט
✅ **קוד עובד נפרד** - `workerCode` + `username`
✅ **אבטחה משופרת** - אימות מול שרת
✅ **נתונים מרכזיים** - כל השינויים נשמרים במסד נתונים אחד

## דרישות מקדימות

### 1. התקן Node.js
אם עדיין לא מותקן:
1. עבור ל: https://nodejs.org/
2. הורד את הגרסה ה-LTS (מומלץ)
3. התקן עם ברירות המחדל

בדוק התקנה:
```bash
node --version
npm --version
```

## התקנה - שלב אחר שלב

### שלב 1: התקן תלויות Backend
```bash
cd backend
npm install
```

זה יתקין:
- Express (שרת web)
- SQLite (מסד נתונים)
- bcrypt (הצפנת סיסמאות)
- CORS (אבטחה)

### שלב 2: העבר נתונים למסד הנתונים
```bash
npm run migrate
```

זה יבצע:
- ✅ יצירת מסד הנתונים `travel-system.db`
- ✅ העברת כל העובדים מ-`workers.json`
- ✅ העברת כל הנהגים
- ✅ הצפנת כל הסיסמאות
- ✅ הוספת קוד עובד לעמרי (8228)

### שלב 3: הפעל את השרת
```bash
npm start
```

אתה אמור לראות:
```
╔══════════════════════════════════════════════╗
║   🚀 Travel System Backend Server           ║
║   Port: 3000                                ║
║   Database: SQLite (travel-system.db)       ║
║   Status: ✅ Running                         ║
╚══════════════════════════════════════════════╝
```

**השאר את החלון הזה פתוח!** השרת חייב לרוץ כדי שהאפליקציה תעבוד.

### שלב 4: פתח את האפליקציה
1. פתח חלון/טאב חדש בטרמינל
2. בתיקייה הראשית (`d:\omri_project`), הרץ שרת מקומי:

**אופציה א: עם Python (אם מותקן)**
```bash
python -m http.server 8000
```

**אופציה ב: עם Node.js**
```bash
npx http-server -p 8000
```

**אופציה ג: עם Live Server ב-VS Code**
- התקן סיומת "Live Server"
- לחץ ימני על `index.html` → "Open with Live Server"

3. פתח דפדפן: http://localhost:8000

## בדיקה

### התחבר עם הנתונים הבאים:

**עמרי (עם קוד עובד):**
- שם משתמש: `בן אליהו` או `8228`
- סיסמה: `204272645`

**עובדים אחרים:**
- שם משתמש: `[שם משפחה]` (למשל: `גרסיוטה`)
- סיסמה: `1234`

### בדוק שינוי סיסמה:
1. לחץ "שכחת סיסמה?"
2. הזן שם משתמש
3. הזן סיסמה חדשה
4. התנתק והתחבר עם הסיסמה החדשה
5. ✅ **זה אמור לעבוד!** הסיסמה שונתה במסד הנתונים

## מבנה הפרויקט

```
omri_project/
├── index.html              # Frontend (האפליקציה הראשית)
├── workers.json            # JSON ישן (לא בשימוש יותר)
├── backend/
│   ├── server.js          # שרת Express
│   ├── database.js        # חיבור למסד נתונים
│   ├── migrate.js         # סקריפט העברת נתונים
│   ├── travel-system.db   # מסד הנתונים (נוצר אוטומטית)
│   └── package.json       # תלויות Node.js
└── SETUP.md               # הקובץ הזה
```

## קודי עובדים (Worker Codes)

כרגע רק לעמרי יש קוד עובד: `8228`

### להוספת קודי עובד לעובדים אחרים:

**אופציה 1: דרך SQLite Browser**
1. הורד "DB Browser for SQLite": https://sqlitebrowser.org/
2. פתח את `backend/travel-system.db`
3. עבור לטבלת `employees`
4. ערוך את עמודת `workerCode` לכל עובד

**אופציה 2: דרך הקוד**
```bash
cd backend
node
```

```javascript
const { db } = require('./database');
db.prepare('UPDATE employees SET workerCode = ? WHERE id = ?').run('8229', 3);
```

## הוספת עובד חדש

### דרך האפליקציה:
1. התחבר כמנהל
2. לחץ "הוסף עובד"
3. מלא את כל השדות (כולל קוד עובד אופציונלי)
4. ✅ העובד נוסף למסד הנתונים עם סיסמה מוצפנת

### דרך ה-API:
```bash
curl -X POST http://localhost:3000/api/employees \
  -H "Content-Type: application/json" \
  -d '{
    "workerCode": "8230",
    "username": "כהן",
    "password": "1234",
    "name": "דוד כהן",
    "address": "רחוב הרצל 5",
    "city": "מודיעין",
    "phone": "050-123-4567",
    "route": "מסלול א",
    "time": "07:00",
    "department": "הפצה",
    "active": true
  }'
```

## פתרון בעיות

### שגיאה: "שגיאה בהתחברות לשרת"
**פתרון:**
1. ודא שהשרת Backend רץ (בתיקיית `backend` הרץ `npm start`)
2. בדוק ש-URL הוא `http://localhost:3000`
3. בדוק שאין חומת אש שחוסמת את הפורט 3000

### שגיאה: "Failed to fetch employees"
**פתרון:**
1. בדוק שמסד הנתונים קיים: `backend/travel-system.db`
2. הרץ שוב את ה-migration: `cd backend && npm run migrate`

### סיסמה לא מתעדכנת
**פתרון:**
- ודא שהשרת Backend רץ
- בדוק ב-console של הדפדפן (F12) אם יש שגיאות
- הסיסמה צריכה להתעדכן במסד הנתונים, לא ב-localStorage

### רוצה לאפס הכל?
```bash
cd backend
rm travel-system.db
npm run migrate
npm start
```

## הרצה בייצור (Production)

בשביל להריץ את המערכת בשרת אמיתי:

1. **שנה את `API_CONFIG.baseUrl` ב-`index.html`:**
   ```javascript
   const API_CONFIG = {
       baseUrl: 'https://your-domain.com/api'
   };
   ```

2. **הוסף משתני סביבה לשרת:**
   ```bash
   export NODE_ENV=production
   export PORT=3000
   ```

3. **השתמש ב-Process Manager:**
   ```bash
   npm install -g pm2
   cd backend
   pm2 start server.js --name travel-system
   ```

4. **הגדר CORS נכון:**
   בקובץ `server.js`, שנה:
   ```javascript
   app.use(cors({
       origin: 'https://your-frontend-domain.com'
   }));
   ```

## תמיכה

יש בעיה? בדוק:
1. קונסולת הדפדפן (F12)
2. לוגים של הש��ת (בטרמינל שבו רץ `npm start`)
3. קובץ `backend/README.md` לתיעוד API

## סיכום

✅ Backend עם SQLite מותקן ופועל
✅ כל הסיסמאות מוצפנות
✅ שינויי סיסמה נשמרים במסד הנתונים
✅ קוד עובד נפרד משם המשתמש
✅ מערכת מאובטחת ומקצועית

**כל שצריך לעשות מעכשיו:**
1. `cd backend && npm start` (כל פעם שמפעילים את המחשב)
2. פתח את `index.html` בדפדפן
3. תהנה! 🎉
