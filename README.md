# STUDIO_7 — Podcast Escape Room 🎙️

משחק חדר בריחה אינטראקטיבי ללימוד הפקת פודקאסט.

## מבנה הפרויקט

```
studio7/
├── index.html          ← מבנה ה-HTML בלבד (מסכי intro / game / result)
├── css/
│   └── styles.css      ← כל עיצוב ה-UI (CRT theme, RTL, responsive)
├── js/
│   ├── audio.js        ← Web Audio API: מוזיקה + 8 אפקטי קול
│   ├── questions.js    ← 50 שאלות ב-5 קטגוריות + SVG props
│   ├── game.js         ← לוגיקת המשחק: state, timer, ניקוד, rounds
│   ├── pdf.js          ← ייצוא תוצאות ל-PDF (jsPDF)
│   └── main.js         ← אתחול + bridge גלובלי בין HTML למודולים
└── README.md
```

## סדר טעינת קבצים (חשוב!)

```
audio.js → questions.js → game.js → pdf.js → main.js
```

כל מודול תלוי במה שלפניו:
- `game.js` משתמש ב-`Audio7` (audio.js) ו-`BANKS / CAT_CONFIG` (questions.js)
- `pdf.js` משתמש ב-`Game` (game.js) ו-`CAT_CONFIG` (questions.js)
- `main.js` מחבר את כולם ל-DOM

## קטגוריות (50 שאלות)

| קטגוריה | מזהה | צבע | שאלות |
|---------|------|-----|-------|
| אקוסטיקה של אולפן | `acoustic` | סגול | 10 |
| סוגי מיקרופונים | `mic` | ירוק | 10 |
| תפעול מיקסר | `mixer` | כתום | 10 |
| מיקום ושימוש במיק | `mic_placement` | ורוד | 10 |
| וידאוקאסט קרוס | `video` | תכלת | 10 |

## ספריות חיצוניות

- **Google Fonts** — Heebo, VT323, Courier Prime
- **jsPDF 2.5.1** — ייצוא PDF (CDN, ללא התקנה)

## הרצה מקומית

```bash
# כל שרת HTTP סטטי יעבוד, למשל:
npx serve .
# או:
python3 -m http.server 8080
```

> ⚠️ לא לפתוח ישירות כ-file:// — הדפדפן חוסם טעינת JS מודולים.

## הוספת שאלות

ב-`js/questions.js`, הוסיפו אובייקט ל-BANKS המתאים:

```js
{ cat: '// CAT_XX :: כותרת',
  flavor: 'תרחיש...',
  prop: SVG.mic,          // אחד מ: mic, wave, room, mixer, cam, cross, acoustic
  text: 'השאלה?',
  opts: ['א', 'ב', 'ג', 'ד'],
  correct: 0,             // אינדקס התשובה הנכונה (0-3)
  explain: 'הסבר...' },
```
