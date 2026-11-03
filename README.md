# مساعد تعبئة نموذج طلب الالتحاق - V6

هذه الملفات مهيّأة للرفع إلى المستودع العام `mosab-glitch/std_form_helpr` على GitHub Pages.

- ارفع **محتويات المجلد** إلى جذر المستودع، ومنها index.html، وليس المجلد نفسه.
- `config.js` يحتوي فقط على رابط Cloudflare Worker وTurnstile Site Key العام.
- تأكد من إعداد Cloudflare Worker Variables and Secrets:
  - GITHUB_OWNER = mosab-glitch
  - GITHUB_REPO = mutah-admissions-private-data
  - GITHUB_BRANCH = main
  - ALLOWED_ORIGIN = https://mosab-glitch.github.io
  - TURNSTILE_HOSTNAME = mosab-glitch.github.io
  - GITHUB_TOKEN (Secret)
  - TURNSTILE_SECRET (Secret)
- جرّب اختبارًا ببيانات وهمية فقط قبل استقبال بيانات الطلاب.
- تحقق من ظهور ملف JSON داخل مستودع GitHub الخاص، ثم اختبر PDF والطباعة.
- صفحة /health تثبت فقط أن Worker يعمل، ولا تثبت نجاح الأرشفة.
- لا تضع قيمة GitHub Token أو Turnstile Secret Key في الموقع العام أو المحادثة.
