# ملف النشر التلقائي

`docs/deploy-workflow.yml` هو ملف GitHub Actions الذي يبني الموقع وينشره.
لم يُكتب في مكانه مباشرة لأن الأدوات لا تسمح بالكتابة في مجلد `.github` عن بُعد
(حماية معقولة: من يعدّل ملفات الـ workflow يعدّل ما يعمل على حسابك).

**انقله بنفسك مرة واحدة قبل أول رفع:**

```powershell
cd "E:\elmagd_githap"
mkdir .github\workflows
move docs\deploy-workflow.yml .github\workflows\deploy.yml
```

أو من مستكشف الملفات: أنشئ مجلد `.github` وبداخله `workflows`، وانقل الملف إليه
باسم `deploy.yml`.

بعدها كل `git push` على فرع `main` يبني الموقع وينشره تلقائيًا.
