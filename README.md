# Mutah Admission Form – V7 (GitHub Pages)

## Changes
- Maintains the editable form and A4 printing/PDF generation.
- No archive receipt number, archive success messages, or archive consent checkbox.
- Emphasizes that a student must submit the signed printed application in person.
- Displays a concise notice of electronic retention; the fact of retention must not be concealed from students whose sensitive data is collected.
- Cloudflare Turnstile uses `appearance: interaction-only` and `execution: execute`; this minimizes friction, but Cloudflare may still request human interaction if needed.
- Archive errors do not stop printing or downloading. **This means archiving is best-effort, not guaranteed**, so an administrator must monitor the private GitHub repo and Worker logs.

## Publishing
1. Extract and upload all files to the root of the `std_form_helpr` public GitHub repository.
2. Keep `GITHUB_TOKEN` and `TURNSTILE_SECRET` only in Cloudflare Worker secrets, never in the repository.
3. No Worker code change is required if V6 worker is configured correctly.
4. On a test application, verify the file in the private repository.

## Important
The web application collects personal data, including religion and parent contact details. Follow university policy and applicable personal-data law; provide an accessible privacy notice and appropriate retention/access controls.


## تحديث V7.1 — خدمة العلم
- أُضيف مربع اختيار تحت الإقرار النهائي: «يجب مراجعة مكتب خدمة العلم لتوقيع وختم الطلب للطلاب الذكور الأردنيين».
- يظهر ويصبح إجباريًا عندما يختار الطالب «ذكر» ويكتب جنسية أردنية/أردني/الأردن (أو Jordanian). ويُخفى عن غيرهم.
- لا يغيّر تصميم ورقة A4 أو ملف PDF؛ النموذج المطبوع يتضمن أصلًا خانتي ختم وتوقيع مكتب خدمة العلم.
