# מערכת Backend - מערכת הסעות

## התקנה

### שלב 1: התקן Node.js
אם עדיין לא התקנת, הורד והתקן Node.js מ: https://nodejs.org/

### שלב 2: התקן תלויות
```bash
cd backend
npm install
```

### שלב 3: העבר נתונים מ-JSON למסד נתונים
```bash
npm run migrate
```

זה יצור את מסד הנתונים `travel-system.db` ויעביר את כל הנתונים מ-`workers.json`.

## הרצה

### הפעלה רגילה
```bash
npm start
```

### הפעלה עם auto-reload (פיתוח)
```bash
npm run dev
```

השרת יפעל על `http://localhost:3000`

## API Endpoints

### אימות (Authentication)

**התחברות:**
```
POST /api/auth/login
Body: { "username": "בן אליהו", "password": "204272645" }
```

**שינוי סיסמה:**
```
POST /api/auth/change-password
Body: { "employeeId": 2, "newPassword": "newpass123" }
```

### עובדים (Employees)

**קבל את כל העובדים:**
```
GET /api/employees
```

**קבל עובד לפי ID:**
```
GET /api/employees/:id
```

**צור עובד חדש:**
```
POST /api/employees
Body: {
  "workerCode": "8229",
  "username": "משפחה",
  "password": "1234",
  "name": "שם מלא",
  "address": "כתובת",
  "city": "מודיעין",
  "phone": "050-123-4567",
  "route": "מסלול א",
  "time": "07:00",
  "department": "מחלקה",
  "active": true
}
```

**עדכן עובד:**
```
PUT /api/employees/:id
Body: { "name": "שם חדש", ... }
```

**מחק עובד:**
```
DELETE /api/employees/:id
```

### נהגים (Drivers)

**קבל את כל הנהגים:**
```
GET /api/drivers
```

**צור נהג חדש:**
```
POST /api/drivers
Body: {
  "name": "שמוליק",
  "phone": "050-123-4567",
  "route": "מסלול א",
  "city": "מודיעין",
  "vehicle": "מרצדס ספרינטר",
  "passengers": 4
}
```

**עדכן נהג:**
```
PUT /api/drivers/:id
```

**מחק נהג:**
```
DELETE /api/drivers/:id
```

### בדיקת תקינות
```
GET /api/health
```

## מבנה מסד הנתונים

### טבלת employees
- `id` - מזהה ייחודי
- `workerCode` - קוד עובד (אופציונלי, ייחודי)
- `username` - שם משתמש להתחברות (ייחודי)
- `password` - סיסמה מוצפנת (bcrypt)
- `name` - שם מלא
- `address` - כתובת
- `city` - עיר
- `phone` - טלפון
- `route` - מסלול
- `time` - שעת איסוף
- `department` - מחלקה
- `company` - חברה
- `active` - פעיל (1) או לא (0)
- `createdAt` - תאריך יצירה
- `updatedAt` - תאריך עדכון אחרון

### טבלת drivers
- `id` - מזהה ייחודי
- `name` - שם נהג
- `phone` - טלפון
- `route` - מסלול
- `city` - עיר
- `vehicle` - רכב
- `passengers` - מספר נוסעים
- `createdAt` - תאריך יצירה
- `updatedAt` - תאריך עדכון אחרון

## אבטחה

- כל הסיסמאות מוצפנות עם bcrypt (10 rounds)
- סיסמאות לעולם לא נשלחות בחזרה מה-API
- CORS מופעל לכל המקורות (שנה בייצור!)

## הערות

- מסד הנתונים: SQLite (קובץ `travel-system.db`)
- כל השינויים נשמרים אוטומטית במסד הנתונים
- שינויי סיסמאות מתעדכנים מיד במסד הנתונים
- אין צורך לעדכן ידנית קבצי JSON

## פתרון בעיות

**השרת לא עולה:**
- בדוק ש-Node.js מותקן: `node --version`
- בדוק שכל התלויות הותקנו: `npm install`
- בדוק שהפורט 3000 פנוי

**שגיאת מסד נתונים:**
- מחק את `travel-system.db` והרץ `npm run migrate` מחדש

**שגיאת CORS:**
- בדוק שה-frontend פונה ל-`http://localhost:3000`
