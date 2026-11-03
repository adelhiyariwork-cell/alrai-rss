# RSS صحيفة الرأي

خلاصة RSS مستقلة ومجانية لأحدث أخبار [صحيفة الرأي](https://alrai.com/). تُحدّث تلقائياً مرة كل ساعة عبر GitHub Actions وتنشر على GitHub Pages.

## النشر المجاني

1. أنشئ مستودع GitHub جديداً باسم `alrai-rss` وارفع هذه الملفات إليه.
2. من **Settings → Pages**، اختر **GitHub Actions** ضمن *Build and deployment*.
3. من تبويب **Actions** شغّل workflow باسم **Update and publish RSS** مرة واحدة.
4. يصبح رابط الاشتراك:
   `https://YOUR-GITHUB-USERNAME.github.io/alrai-rss/feed.xml`

استبدل `YOUR-GITHUB-USERNAME` باسم حسابك. للحصول على الرابط الظاهر داخل الـRSS نفسه أيضاً، استبدل القيمة `FEED_URL` في `scripts/build-feed.mjs` بالرابط النهائي (اختياري حالياً، لأن هذا المتغير ليس مستخدماً ضمن الخلاصة).

## ملاحظة

هذه الخلاصة تعرض العنوان والرابط فقط، وتعيد القارئ إلى المقال الأصلي. وهي ليست خدمة رسمية تابعة لصحيفة الرأي.
