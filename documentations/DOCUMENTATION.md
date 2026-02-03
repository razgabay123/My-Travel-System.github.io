# תיעוד טכני - מערכת הסעות

## תוכן עניינים
1. [סקירת ארכיטקטורה](#סקירת-ארכיטקטורה)
2. [מחסנית טכנולוגיות](#מחסנית-טכנולוגיות)
3. [מבני נתונים](#מבני-נתונים)
4. [ניהול מצב](#ניהול-מצב)
5. [שכבת אחסון](#שכבת-אחסון)
6. [API פונקציות ליבה](#api-פונקציות-ליבה)
7. [רכיבי תצוגה](#רכיבי-תצוגה)
8. [מערכת מודלים](#מערכת-מודלים)
9. [טיפול באירועים](#טיפול-באירועים)
10. [תלויות חיצוניות](#תלויות-חיצוניות)
11. [נקודות הרחבה](#נקודות-הרחבה)

---

## סקירת ארכיטקטורה

### סוג האפליקציה
Single Page Application (SPA) בנויה ב-vanilla JavaScript, HTML5, ו-CSS3. אין צורך בתהליך בנייה - רצה ישירות בדפדפן.

### תבנית ארכיטקטורה
- **דמוי MVC**: הפרדה בין נתונים (models), תצוגות (components), ובקרים (event handlers)
- **מבוסס רכיבים**: כל מסך הוא פונקציית תצוגה עצמאית
- **רינדור מונע מצב**: משתני מצב גלובליים שולטים ברינדור ה-UI
- **מונע אירועים**: אינטראקציות משתמש מפעילות שינויי מצב ורינדור מחדש

### מבנה קבצים
```
omri_project/
├── transport-system.html      # קובץ המערכת הראשי (כל הקוד)
├── index.html                 # קובץ איפוס סיסמה (קובץ נפרד קטן ומהיר)
└── documentations/
    ├── DOCUMENTATION.md       # תיעוד טכני מפורט
    ├── README.md              # README כללי
    └── תיעוד_שימוש.md        # מדריך שימוש למשתמשים

transport-system.html
├── מבנה HTML
├── סגנונות CSS (Tailwind CSS + מותאם אישית)
└── JavaScript
    ├── הגדרות
    ├── מודלי נתונים
    ├── משתני מצב
    ├── פונקציות אחסון
    ├── לוגיקה עסקית
    ├── רכיבי תצוגה
    ├── רכיבי מודל
    └── מטפלי אירועים

index.html (קובץ איפוס סיסמה)
├── מבנה HTML מינימלי
├── סגנונות CSS (Tailwind CSS)
└── JavaScript
    ├── טעינת עובדים מ-localStorage
    ├── אימות טוקן איפוס סיסמה
    ├── מסך איפוס סיסמה
    └── שמירת סיסמה חדשה
```

---

## מחסנית טכנולוגיות

### טכנולוגיות ליבה
- **HTML5**: סימון סמנטי, תמיכה ב-RTL (`dir="rtl"`)
- **JavaScript (ES6+)**: תכונות JavaScript מודרניות (arrow functions, template literals, destructuring)
- **CSS3**: משתנים מותאמים אישית, flexbox, grid

### ספריות חיצוניות
- **Tailwind CSS** (CDN): מסגרת CSS מבוססת utility-first
- **Font Awesome 6.4.0** (CDN): ספריית אייקונים
- **SheetJS (XLSX) 0.18.5** (CDN): טיפול בקבצי Excel/ODS
- **Leaflet.js 1.9.4** (CDN): מפות אינטראקטיביות (OpenStreetMap)
- **EmailJS Browser SDK 4** (CDN): שירות שליחת אימיילים (אופציונלי)

### ממשקי API של הדפדפן בשימוש
- **localStorage**: אחסון נתונים מתמיד
- **FileReader API**: קריאת קבצי Excel/ODS
- **Geolocation API**: פונקציונליות מפה (דרך Leaflet)
- **Drag & Drop API**: ממשק סידור עובדים

---

## מבני נתונים

### אובייקט Employee (עובד)
```javascript
{
    id: number,                    // מזהה ייחודי
    name: string,                  // שם מלא (עברית)
    address: string,               // כתובת רחוב
    city: string,                  // שם עיר
    phone: string,                 // מספר טלפון (פורמט: XXX-XXX-XXXX)
    email?: string,                 // כתובת אימייל (אופציונלי)
    route: string,                  // שם מסלול (למשל: "מסלול א")
    time: string,                  // שעת איסוף (פורמט: HH:MM)
    department?: string,            // שם מחלקה (אופציונלי)
    company?: string,              // שם חברה (אופציונלי)
    active: boolean,               // סטטוס פעיל
    username?: string,             // שם משתמש להתחברות (אופציונלי)
    password?: string              // סיסמה להתחברות (מוצפנת/פשוטה)
}
```

### אובייקט Driver (נהג)
```javascript
{
    id: number,                    // מזהה ייחודי
    name: string,                  // שם נהג
    phone: string,                 // מספר טלפון
    route: string,                 // מסלול מוקצה
    city: string,                  // שם עיר
    vehicle: string,               // תיאור רכב
    passengers: number             // מספר נוסעים נוכחי
}
```

### אובייקט Alert (התראה)
```javascript
{
    id: number,                    // מזהה מבוסס timestamp
    text: string,                  // תוכן הודעת התראה
    date: string                   // מחרוזת תאריך ISO
}
```

### אובייקט Route (מסלול)
```javascript
{
    name: string,                  // שם מסלול
    locations: Array<{             // מערך אובייקטי מיקום
        key: string,               // מפתח ייחודי (city:address)
        city: string,
        address: string,
        fullAddress: string,       // "address, city"
        lat?: number,             // קו רוחב (אופציונלי)
        lng?: number             // קו אורך (אופציונלי)
    }>,
    driver?: string,               // שם נהג (אופציונלי)
    employees?: Array<Employee>   // עובדים במסלול (אופציונלי)
}
```

### סטטוס הסעות יומי
```javascript
{
    [dateString: string]: {        // מפתח: "YYYY-MM-DD"
        [employeeId: number]: boolean  // true = מגיע, false = לא מגיע
    }
}
```

### עובדים שהוסרו
```javascript
{
    [employeeId: number]: string   // מפתח: מזהה עובד, ערך: מחרוזת תאריך "YYYY-MM-DD"
}
```

### ביטולים מתוזמנים
```javascript
{
    [employeeId: number]: string[]  // מפתח: מזהה עובד, ערך: מערך מחרוזות תאריכים
}
```

### הקצאות מסלול זמניות
```javascript
{
    [dateString: string]: {        // מפתח: "YYYY-MM-DD"
        [driverId: number]: number[]  // מפתח: מזהה נהג, ערך: מערך מזההי עובדים
    }
}
```

---

## ניהול מצב

### משתני מצב גלובליים

```javascript
// סקציה/תצוגה פעילה נוכחית
let currentSection = 'login';  // ערכים: 'dashboard', 'employees', 'routes', וכו'

// מצב UI
let sidebarOpen = window.innerWidth >= 1024;  // נראות סרגל צד

// מצב מודל
let modalState = {
    show: boolean,
    type: string,              // 'confirm', 'success', 'error', 'info', 'edit', וכו'
    message: string,
    onConfirm: function|null,
    workerId: number|null,
    workerName: string|null,
    editEmployee: Employee|null,
    driverName: string|null
};

// מצב מודל מסלול
let routeModalState = {
    show: boolean,
    routeName: string,
    selectedLocations: Array<Location>,
    map: Leaflet.Map|null,
    autocomplete: object|null,
    markers: Array<Leaflet.Marker>
};

// מצב אימות
let loggedInUserId: number|null;  // מזהה משתמש מחובר נוכחי

// מצבי טפסים
let registerModalState = { show: boolean };
let forgotPasswordModalState = {
    show: boolean,
    step: 'verify'|'reset',
    verifiedEmployee: Employee|null
};
let smsModalState = {
    show: boolean,
    employee: Employee|null,
    verificationToken: string|null
};
let alertsModalState = { show: boolean };
let addEmployeeModalState = { show: boolean };

// מצב אינטראקציה UI
let selectedCancellationDates = new Set<string>();  // בחירת תאריכים מרובים
let draggedEmployeeId: number|null;  // מצב גרירה ושחרור
let isGeocoding: boolean;  // מניעת geocoding מקביל
```

### זרימת מצב
1. אינטראקציית משתמש מפעילה מטפל אירועים
2. מטפל אירועים מעדכן משתני מצב
3. פונקציה `render()` נקראת
4. `render()` קורא מצב ויוצר HTML
5. DOM מתעדכן עם HTML חדש
6. מאזיני אירועים מחוברים מחדש לאלמנטים חדשים

---

## שכבת אחסון

### מפתחות localStorage

| מפתח | סוג נתונים | תיאור |
|-----|-----------|-------------|
| `employees` | JSON Array | כל רשומות העובדים |
| `alerts` | JSON Array | התראות/הודעות מערכת |
| `removedWorkers` | JSON Object | עובדים שהוסרו לתאריכים ספציפיים |
| `dailyTransportationStatus` | JSON Object | סטטוס מגיע/לא מגיע יומי |
| `scheduledCancellations` | JSON Object | ביטולי תאריכים עתידיים |
| `tempRouteAssignments` | JSON Object | הקצאות מסלול זמניות |
| `routes` | JSON Array | הגדרות מסלול עם מיקומים |
| `passwordResetTokens` | JSON Object | טוקנים לאיפוס סיסמה (מפתח: טוקן, ערך: {employeeId, email, timestamp, expiresIn}) |

### פונקציות אחסון

#### `loadEmployees()`
- טוען עובדים מ-localStorage
- מחליף את מערך `employees` בזיכרון
- נקרא בטעינת דף

#### `saveEmployees()`
- שומר את מערך `employees` הנוכחי ל-localStorage
- נקרא אחרי כל שינוי עובד

#### `getAlerts()` / `saveAlerts(alerts)`
- מנהל אחסון התראות
- מנקה אוטומטית התראות ישנות מ-4 ימים

#### `getRemovedWorkers()` / `saveRemovedWorkers(removedWorkers)`
- מנהל הסרת עובד זמנית (אותו יום)

#### `getDailyTransportationStatus()` / `saveDailyTransportationStatus(status)`
- מנהל סטטוס הסעות יומי

#### `getScheduledCancellations()` / `saveScheduledCancellations(cancellations)`
- מנהל ביטולי תאריכים עתידיים

#### `getRoutes()` / `saveRoute()` / `deleteRoute()`
- מנהל הגדרות מסלול

---

## API פונקציות ליבה

### אימות

#### `handleLogin()`
- מאמת שם משתמש/סיסמה
- מגדיר `loggedInUserId`
- מפנה לדשבורד
- **פרמטרים**: אין (קורא מ-DOM)
- **מחזיר**: void

#### `handleRegister()`
- מאמת טופס רישום
- יוצר עובד חדש
- שומר ב-localStorage
- **פרמטרים**: אין (קורא מ-DOM)
- **מחזיר**: void

#### `verifyForgotPassword()`
- מאמת זהות משתמש (שם משתמש/מזהה + טלפון/אימייל)
- שולח אימייל איפוס סיסמה דרך EmailJS (אם מוגדר)
- יוצר טוקן איפוס סיסמה עם email hash ו-timestamp (פורמט: `TOKEN_TIMESTAMP_EMAILHASH`)
- שומר טוקן ב-localStorage תחת `passwordResetTokens`
- **פרמטרים**: אין (קורא מ-DOM)
- **מחזיר**: void

#### `sendEmail(emailAddress, userName, verificationToken, employee)`
- שולח אימייל איפוס סיסמה דרך EmailJS
- יוצר קישור איפוס סיסמה: `{baseUrl}/?reset={token}`
- שולח פרטי עובד נוספים לתבנית (worker_id, worker_phone, worker_route, וכו')
- **פרמטרים**:
  - `emailAddress`: כתובת אימייל של העובד
  - `userName`: שם העובד
  - `verificationToken`: טוקן איפוס סיסמה (כולל email hash ו-timestamp)
  - `employee`: אובייקט עובד (אופציונלי)
- **מחזיר**: Promise

#### `resetPassword()` (ב-transport-system.html)
- מעדכן סיסמת עובד (במודל)
- שומר ב-localStorage
- **פרמטרים**: אין (קורא מ-DOM)
- **מחזיר**: void

#### `checkPasswordResetToken()` (ב-index.html)
- בודק טוקן איפוס סיסמה מה-URL (`?reset=TOKEN`)
- מאמת טוקן מול localStorage או email hash (תמיכה בדומיינים שונים)
- בודק תוקף טוקן (שעה)
- פותח מסך איפוס סיסמה אם תקין
- **פרמטרים**: אין (קורא מ-URL)
- **מחזיר**: void

#### `resetPassword()` (ב-index.html)
- מעדכן סיסמת עובד (בקובץ נפרד)
- שומר סיסמה חדשה ב-localStorage
- מפנה חזרה ל-transport-system.html
- **פרמטרים**: אין (קורא מ-DOM)
- **מחזיר**: void

### ניהול עובדים

#### `getActiveEmployees()`
- מחזיר מערך עובדים פעילים
- מסנן לפי `active: true`
- **מחזיר**: `Array<Employee>`

#### `getRemovedEmployees()`
- מחזיר עובדים שהוסרו להיום
- בודק `removedWorkers` ו-`scheduledCancellations`
- **מחזיר**: `Array<Employee>`

#### `removeWorkerForToday(workerId)`
- מסמן עובד כלא מגיע היום
- מעדכן אחסון `removedWorkers`
- **פרמטרים**: `workerId: number`
- **מחזיר**: void

#### `restoreWorker(workerId)`
- משחזר עובד להיום
- מסיר מ-`removedWorkers`
- **פרמטרים**: `workerId: number`
- **מחזיר**: void

#### `isWorkerRemoved(workerId)`
- בודק אם עובד הוסר היום
- **פרמטרים**: `workerId: number`
- **מחזיר**: `boolean`

#### `isWorkerScheduledAbsent(workerId, date)`
- בודק אם עובד מתוזמן להיעדר בתאריך
- **פרמטרים**: `workerId: number`, `date: string` (YYYY-MM-DD)
- **מחזיר**: `boolean`

#### `deleteEmployeePermanently(employeeId)`
- מוחק עובד לצמיתות
- מטפל במחיקה עצמית (מתנתק משתמש)
- **פרמטרים**: `employeeId: number`
- **מחזיר**: void

#### `handleEdit(employeeId)`
- פותח מודל עריכה לעובד
- **פרמטרים**: `employeeId: number`
- **מחזיר**: void

#### `saveEmployeeEdit()`
- שומר נתוני עובד שעודכנו
- מאמת קלט
- מעדכן localStorage
- **פרמטרים**: אין (קורא מ-DOM)
- **מחזיר**: void

### ייבוא/ייצוא

#### `importEmployeesFromExcel()`
- קורא קובץ Excel/ODS
- מנתח נתוני עובדים
- מזהה כותרות אוטומטית
- מעדכן עובדים קיימים או יוצר חדשים
- **פרמטרים**: אין (משתמש בקלט קובץ)
- **מחזיר**: void

#### `exportEmployeesToExcel()`
- מייצא את כל העובדים לקובץ Excel
- כולל כותרות עברית
- מגדיר רוחב עמודות
- **פרמטרים**: אין
- **מחזיר**: void

#### `generateMonthlyTransportReport(year, month)`
- מחשב סטטיסטיקות חודשיות
- **פרמטרים**: `year: number`, `month: number` (1-12)
- **מחזיר**: `{
    totalTrips: number,
    avgPassengersPerTrip: number,
    mostUsedRoute: string,
    cancellationRate: number,
    routeUsage: Object,
    totalPassengers: number,
    totalCancellations: number,
    totalScheduled: number
}`

#### `exportMonthlyReportToExcel(year, month, reportData)`
- מייצא דוח חודשי ל-Excel
- **פרמטרים**: `year: number`, `month: number`, `reportData: Object`
- **מחזיר**: void

### ניהול מסלולים

#### `getRoutes()`
- טוען מסלולים מ-localStorage
- מאתחל מעובדים אם ריק
- **מחזיר**: `Array<Route>`

#### `saveRoute(routeName, locations, departureTime)`
- שומר או מעדכן מסלול
- **פרמטרים**: `routeName: string`, `locations: Array<Location>`, `departureTime: string`
- **מחזיר**: void

#### `deleteRoute(routeName)`
- מוחק מסלול מאחסון
- **פרמטרים**: `routeName: string`
- **מחזיר**: void

#### `initRouteMap()`
- מאתחל מפת Leaflet במודל מסלול
- מגדיר geocoding
- **פרמטרים**: אין
- **מחזיר**: void

#### `addLocationToRoute()`
- מוסיף מיקום למסלול ממפה/קלט
- **פרמטרים**: אין (קורא מ-DOM)
- **מחזיר**: void

#### `removeLocationFromRoute(index)`
- מסיר מיקום ממסלול
- **פרמטרים**: `index: number`
- **מחזיר**: void

### התראות

#### `getAlerts()`
- טוען התראות מאחסון
- מסיר אוטומטית התראות ישנות מ-4 ימים
- **מחזיר**: `Array<Alert>`

#### `saveAlerts(alerts)`
- שומר התראות באחסון
- **פרמטרים**: `alerts: Array<Alert>`
- **מחזיר**: void

#### `publishAlert()`
- יוצר התראה חדשה
- מוסיף לאחסון
- **פרמטרים**: אין (קורא מ-DOM)
- **מחזיר**: void

#### `deleteAlert(alertId)`
- מוחק התראה לפי מזהה
- **פרמטרים**: `alertId: number`
- **מחזיר**: void

### פונקציות UI

#### `render()`
- פונקציית רינדור ראשית
- קורא משתני מצב
- יוצר HTML
- מעדכן DOM
- **פרמטרים**: אין
- **מחזיר**: void

#### `showSection(section)`
- משנה סקציה פעילה
- מפעיל רינדור מחדש
- **פרמטרים**: `section: string`
- **מחזיר**: void

#### `showModal(type, message, onConfirm, workerId, workerName)`
- מציג דיאלוג מודל
- **פרמטרים**: 
  - `type: string` - סוג מודל
  - `message: string` - טקסט הודעה
  - `onConfirm: function|null` - callback אישור
  - `workerId: number|null` - מזהה עובד אופציונלי
  - `workerName: string|null` - שם עובד אופציונלי
- **מחזיר**: void

#### `hideModal()`
- מסתיר מודל נוכחי
- **פרמטרים**: אין
- **מחזיר**: void

#### `toggleSidebar()`
- מחליף נראות סרגל צד
- **פרמטרים**: אין
- **מחזיר**: void

---

## רכיבי תצוגה

כל פונקציות התצוגה מחזירות מחרוזות HTML ונקראות על ידי `render()`.

### `LoginView()`
- טופס התחברות
- קישור רישום
- קישור שכחתי סיסמה
- **מחזיר**: `string` (HTML)

### `DashboardView()`
- סטטיסטיקות סקירה
- התראות פעילות
- עובדים נעדרים היום
- **מחזיר**: `string` (HTML)

### `EmployeesView()`
- טבלת רשימת עובדים
- סינון לפי מסלול/מחלקה
- פעולות עריכה/הסרה
- כפתורי ייבוא/ייצוא
- **מחזיר**: `string` (HTML)

### `EmployeeManagementView()`
- רשימת עובדים עם כפתורי מחיקה
- כפתור הוספת עובד
- **מחזיר**: `string` (HTML)

### `EmployeeArrangementView()`
- ממשק גרירה ושחרור
- כרטיסי נהגים
- רשימת עובדים לא מוקצים
- **מחזיר**: `string` (HTML)

### `TransportManagerView()`
- תצוגת סידור יומי
- כפתור שליחה לנהגים
- פונקציונליות הדפסה
- **מחזיר**: `string` (HTML)

### `DriverView()`
- מידע נהג
- רשימת נוסעים עם כתובות
- שעות איסוף
- טיפים לנהג
- **מחזיר**: `string` (HTML)

### `RoutesView()`
- רשימת מסלולים
- יצירה/עריכה/מחיקת מסלולים
- אינטגרציה מפה
- **מחזיר**: `string` (HTML)

### `EmployeePortalView()`
- בקשות עובד
- לוח שנה ביטולים
- היסטוריית בקשות
- **מחזיר**: `string` (HTML)

### `AlertsView()`
- רשימת התראות
- כפתור יצירת התראה
- מחיקת התראות
- **מחזיר**: `string` (HTML)

### `ReportsView()`
- בחירת חודש/שנה
- תצוגת סטטיסטיקות
- ייצוא ל-Excel
- **מחזיר**: `string` (HTML)

---

## מערכת מודלים

### סוגי מודלים

| סוג | מטרה | מאפיינים בשימוש |
|------|---------|----------------|
| `confirm` | דיאלוג אישור | `message`, `workerId`, `workerName` |
| `success` | הודעת הצלחה | `message` |
| `error` | הודעת שגיאה | `message` |
| `info` | הודעת מידע | `message` |
| `edit` | טופס עריכת עובד | `editEmployee` |
| `confirm-delete-route` | אישור מחיקת מסלול | `onConfirm` |
| `confirm-delete-employee` | אישור מחיקת עובד | `onConfirm` |

### רכיבי מודל

#### `ModalComponent()`
- עטיפת מודל גנרית
- מטפל בכל סוגי המודלים
- רקע עם טשטוש
- **מחזיר**: `string` (HTML)

#### `RouteModalComponent()`
- מודל יצירה/עריכת מסלול
- אינטגרציה מפה
- ניהול מיקומים
- **מחזיר**: `string` (HTML)

#### `RegisterModalComponent()`
- טופס רישום משתמש
- אימות
- **מחזיר**: `string` (HTML)

#### `ForgotPasswordModalComponent()`
- איפוס סיסמה דו-שלבי
- טפסי אימות ואיפוס
- **מחזיר**: `string` (HTML)

#### `SMSModalComponent()`
- אימות SMS (מדומה)
- **מחזיר**: `string` (HTML)

#### `AlertsModalComponent()`
- יצירת התראה חדשה
- לא ניתן לסגירה (חייב לפרסם או לבטל)
- **מחזיר**: `string` (HTML)

#### `AddEmployeeModalComponent()`
- טופס הוספת עובד
- פרטי עובד מלאים
- **מחזיר**: `string` (HTML)

---

## טיפול באירועים

### מטפלי אירועים מובנים
רוב האירועים משתמשים במטפלי `onclick` מובנים במחרוזות HTML:
```javascript
onclick="showSection('dashboard')"
onclick="handleLogin()"
onclick="toggleSidebar()"
```

### אירועי גרירה ושחרור
- `handleDragStart(e, employeeId)` - התחלת גרירת עובד
- `handleDragEnd(e)` - סיום פעולת גרירה
- `handleDragOver(e)` - אפשר שחרור
- `handleDrop(e, targetRoute)` - טיפול בשחרור על מסלול

### אירועי טפסים
- הגשות טפסים משתמשות במטפלי `onsubmit`
- אימות קלט בהגשה
- מניעת ברירת מחדל אם אימות נכשל

### אירועי חלון
- `resize` - מתאים סרגל צד בשינוי גודל חלון
- `load` - מאתחל אפליקציה בטעינת דף

### התפשטות אירועים
- רקעי מודל: לחיצה מחוץ למודל סוגרת מודל (חוץ ממודלים שלא ניתן לסגור)
- תוכן מודל: `event.stopPropagation()` מונע סגירה

---

## תלויות חיצוניות

### Tailwind CSS
- **גרסה**: אחרונה (CDN)
- **שימוש**: מחלקות utility לעיצוב
- **התאמה אישית**: אובייקט `COLORS` לצבעי ערכת נושא

### Font Awesome
- **גרסה**: 6.4.0
- **שימוש**: אייקונים ברחבי UI
- **מחלקות**: `fas fa-{icon-name}`

### SheetJS (XLSX)
- **גרסה**: 0.18.5
- **שימוש**: ייבוא/ייצוא Excel/ODS
- **פונקציות מפתח**:
  - `XLSX.read(data, { type: 'array' })` - קריאת קובץ
  - `XLSX.utils.sheet_to_json(sheet)` - המרה ל-JSON
  - `XLSX.utils.json_to_sheet(data)` - המרה לגיליון
  - `XLSX.writeFile(wb, filename)` - כתיבת קובץ

### Leaflet.js
- **גרסה**: 1.9.4
- **שימוש**: מפות אינטראקטיביות למסלולים
- **אובייקטים מפתח**:
  - `L.map('element-id')` - יצירת מפה
  - `L.tileLayer()` - הוספת שכבת אריחים
  - `L.marker([lat, lng])` - הוספת סמן
  - `L.popup()` - הוספת חלון קופץ

### EmailJS
- **גרסה**: Browser SDK 4
- **שימוש**: שליחת אימיילי איפוס סיסמה
- **תכונות**:
  - חינמי עד 200 אימיילים בחודש
  - תמיכה ב-Gmail, Outlook, וספקי אימייל אחרים
  - תבניות אימייל מותאמות אישית
- **הגדרה**:
  ```javascript
  const EMAIL_CONFIG = {
      enabled: true,
      serviceId: 'your_service_id',
      templateId: 'your_template_id',
      publicKey: 'your_public_key',
      baseUrl: 'https://your-domain.com'
  };
  ```
- **פונקציות מפתח**:
  - `emailjs.init(publicKey)` - אתחול EmailJS
  - `emailjs.send(serviceId, templateId, templateParams)` - שליחת אימייל

### EmailJS (אופציונלי)
- **גרסה**: 4.x
- **שימוש**: שליחת אימיילי איפוס סיסמה
- **הגדרה**: אובייקט `EMAIL_CONFIG`
- **סטטוס**: מושבת כברירת מחדל (דורש הגדרה)

---

## נקודות הרחבה

### הוספת סקציות חדשות
1. הוסף פריט תפריט למערך `menuItems` ב-`render()`
2. צור פונקציית תצוגה (למשל, `NewSectionView()`)
3. הוסף case למשפט switch ב-`render()`
4. הוסף מטפל ניווט אם נדרש

### הוספת סוגי מודלים חדשים
1. הוסף סוג לטיפול ב-`modalState.type` ב-`ModalComponent()`
2. צור פונקציית רכיב מודל אם מורכב
3. הוסף ניהול מצב אם נדרש

### הוספת מפתחות אחסון חדשים
1. צור פונקציות getter/setter
2. עקוב אחר תבנית קיימת (טעינה באתחול, שמירה בשינוי)
3. הוסף לאתחול אם נדרש

### הוספת מערכת הרשאות
הקוד כולל מבנה הרשאות אך לא מיושם במלואו:
- `getCurrentUserRole()` - מחזיר תפקיד משתמש
- `hasPermission(permission)` - בודק הרשאה
- `isCurrentUserEmployee()` - בודק אם עובד
- `canModifyEmployee(employeeId)` - בודק הרשאת עריכה

ליישום:
1. הוסף שדה `role` לאובייקט Employee
2. הגדר מיפוי `PERMISSIONS`
3. הוסף בדיקות הרשאה לפונקציות תצוגה
4. סנן פריטי תפריט לפי הרשאות

### הוספת אינטגרציה API
1. החלף קריאות localStorage בקריאות API
2. הוסף async/await לפונקציות
3. הוסף טיפול בשגיאות
4. הוסף מצבי טעינה

### התאמה אישית עיצוב
- שנה אובייקט `COLORS` לצבעי ערכת נושא
- עדכן הגדרת Tailwind (אם משתמש בתהליך בנייה)
- הוסף CSS מותאם אישית בתג `<style>`

---

## ארגון קוד

### סדר פונקציות (נוכחי)
1. קבועי הגדרות
2. מערכי נתונים
3. משתני מצב
4. פונקציות אחסון
5. פונקציות לוגיקה עסקית
6. פונקציות תצוגה
7. רכיבי מודל
8. מטפלי אירועים
9. אתחול

### שיטות עבודה מומלצות
- פונקציות הן טהורות ככל האפשר (ללא תופעות לוואי)
- מוטציות מצב מרוכזות
- פעולות אחסון מופשטות
- פונקציות תצוגה מחזירות מחרוזות HTML
- מטפלי אירועים מעדכנים מצב ואז קוראים `render()`

### מוסכמות שמות
- **פונקציות**: `camelCase` (למשל, `handleLogin`)
- **משתנים**: `camelCase` (למשל, `currentSection`)
- **קבועים**: `UPPER_SNAKE_CASE` (למשל, `COLORS`)
- **פונקציות תצוגה**: `{Name}View()` (למשל, `DashboardView()`)
- **פונקציות מודל**: `{Name}ModalComponent()` (למשל, `RegisterModalComponent()`)

---

## שיקולי ביצועים

### רינדור
- רינדור מלא בכל שינוי מצב
- אין virtual DOM או diffing
- נחשב מקובל לקנה מידה נוכחי (<1000 עובדים)

### אחסון
- כל הנתונים ב-localStorage (מוגבל ל-~5-10MB)
- אין דפדוף לסטי נתונים גדולים
- שקול IndexedDB לקנה מידה גדול יותר

### ביצועי מפה
- מפת Leaflet נוצרת מחדש בפתיחת מודל
- סמנים נמחקים ונוצרים מחדש
- שקול שימוש חוזר במופע מפה

### הזדמנויות אופטימיזציה
1. **רינדור מצטבר**: עדכן רק חלקי DOM שהשתנו
2. **Debouncing**: Debounce קלטי חיפוש/סינון
3. **טעינה עצלה**: טען מסלולים/מפות לפי דרישה
4. **מטמון**: שמור ערכים מחושבים (למשל, עובדים פעילים)

---

## תאימות דפדפנים

### דפדפנים נתמכים
- Chrome/Edge (אחרון)
- Firefox (אחרון)
- Safari (אחרון)
- Opera GX (אחרון)

### תכונות נדרשות
- תמיכה ב-JavaScript ES6+
- ממשק API של localStorage
- ממשק API של FileReader
- ממשק API של Drag & Drop
- CSS Grid & Flexbox

### בעיות ידועות
- פריסת RTL עלולה להיות בעייתית בדפדפנים ישנים יותר
- Leaflet דורש דפדפן מודרני
- ממשק API של קבצים דורש דפדפן מודרני

---

## שיקולי אבטחה

### מצב נוכחי
- **סיסמאות**: מאוחסנות בטקסט פשוט (localStorage)
- **אימות**: רק בצד הלקוח
- **נתונים**: כל הנתונים ב-localStorage של הדפדפן

### המלצות
1. **הצפנת סיסמאות**: יישם bcrypt או דומה
2. **אימות בצד שרת**: העבר אימות ל-backend
3. **HTTPS**: השתמש ב-HTTPS בייצור
4. **אימות קלט**: כבר מיושם בצד הלקוח
5. **מניעת XSS**: נקה קלט משתמש (כרגע מינימלי)

### פרטיות נתונים
- כל הנתונים מאוחסנים מקומית בדפדפן
- אין נתונים נשלחים לשרתים חיצוניים (חוץ ממפות/geocoding)
- EmailJS דורש הסכמת משתמש לשליחת אימייל

---

## בדיקות

### רשימת בדיקה ידנית
- [ ] התחברות/התנתקות
- [ ] פעולות CRUD עובדים
- [ ] ייבוא/ייצוא Excel
- [ ] ניהול מסלולים
- [ ] יצירה/מחיקת התראות
- [ ] יצירת דוחות
- [ ] סידור גרירה ושחרור
- [ ] עיצוב רספונסיבי (נייד/שולחן עבודה)

### נתוני בדיקה
- עובדים לדוגמה כלולים בקוד
- נהגים לדוגמה כלולים
- ניתן לייבא מ-Excel לבדיקה

---

## פריסה

### הגדרה נוכחית
- קובץ HTML יחיד
- אין תהליך בנייה
- תלויות CDN
- יכול לרוץ ממערכת קבצים או שרת אינטרנט

### פריסת ייצור
1. **שרת אינטרנט**: הגש דרך HTTP/HTTPS (לא file://)
2. **HTTPS**: נדרש לחלק מממשקי API (geolocation)
3. **CDN**: תלויות כבר ב-CDN
4. **גיבוי**: ייצא עובדים באופן קבוע
5. **ניטור**: הוסף רישום שגיאות אם נדרש

### אסטרטגיית גיבוי
- ייצא עובדים ל-Excel באופן קבוע
- גבה נתוני localStorage (תוסף דפדפן)
- שקול גיבוי בצד שרת לייצור

---

## שיפורים עתידיים

### תכונות מתוכננות
- יישום מלא של מערכת הרשאות
- אינטגרציה API בצד שרת
- עדכונים בזמן אמת (WebSockets)
- אפליקציה ניידת (PWA)
- דיווח מתקדם
- התראות אימייל

### חוב טכני
- שדרוג למבנה מודולרי
- הוסף תהליך בנייה (אופציונלי)
- יישם ספריית ניהול מצב נכונה
- הוסף בדיקות יחידה
- הוסף TypeScript לבטיחות טיפוסים

---

## תמיכה ותחזוקה

### תחזוקת קוד
- מבנה קובץ יחיד (קל לשינוי)
- הפרדת פונקציות ברורה
- הערות בעברית/אנגלית מעורבות

### דיבוג
- יומני קונסולה בפונקציות מפתח
- כלי פיתוח דפדפן לדיבוג
- בדיקת localStorage דרך כלי פיתוח

### בקרת גרסאות
- עקוב אחר שינויים בקובץ HTML
- שקול פיצול למודולים ל-diff טוב יותר

---

**גרסת מסמך**: 0.9 (Beta)  
**עודכן לאחרונה**: 2026  
**מתחזק על ידי**: צוות פיתוח
