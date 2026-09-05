-- =====================================================================
-- 3D Elmagd — محتوى البداية
-- ---------------------------------------------------------------------
-- مولَّد آليًا من apps/web/src/lib/data/seed.ts — لا تعدّله يدويًا.
-- لإعادة توليده بعد أي تعديل على المحتوى الافتراضي:  npm run seed:sql
--
-- التشغيل: Supabase Dashboard → SQL Editor، بعد supabase/schema.sql.
-- الملف idempotent: تشغيله مرة أخرى يعيد القيم الافتراضية ولا يكسر شيئًا.
-- =====================================================================

insert into public.settings (key, value) values
  ('brand', '{"name":"3D Elmagd","tagline":"3D PRINTING · EGYPT","logo":"/brand/logo.jpg","theme":"light","color":"#0B6FB8","accent":"#E4622A"}'::jsonb),
  ('hero', '{"pillText":"الماكينة تعمل الآن · 3 طلبات في الانتظار","title":"طباعة ثلاثية الأبعاد بدقة تصنيع","highlight":"وسعر تعرفه في ثانية","text":"ارفع ملفك، شوفه بكل الزوايا قبل الطباعة، واعرف السعر والمدة فورًا. حجم بناء يصل إلى 42×42×50 سم.","ctaMain":"احسب سعر قطعتك","ctaAlt":"شاهد الأعمال","stats":[{"value":"480+","label":"قطعة تم تسليمها"},{"value":"420×420×500","label":"حجم البناء (مم)"},{"value":"600 mm/s","label":"أقصى سرعة"}]}'::jsonb),
  ('about', '{"title":"ماكينة واحدة تفعل ما تحتاجه ورشة","text":"نشتغل على Anycubic Kobra 3 Max — أكبر مساحة بناء في فئتها، طباعة متعددة الألوان بنظام ACE Pro، ودقة طبقة تصل إلى 0.1 مم.","specs":[{"label":"حجم الطباعة","value":"420 × 420 × 500 mm"},{"label":"أقصى سرعة","value":"600 mm/s"},{"label":"طباعة متعددة الألوان","value":"ACE Pro"},{"label":"دقة الطبقة","value":"0.1 – 0.3 mm"},{"label":"التقنية","value":"FDM"}]}'::jsonb),
  ('contact', '{"whatsapp":"01000000000","phone":"01000000000","address":"القاهرة، مصر","hours":"السبت – الخميس · 10ص إلى 8م","facebook":"3delmagd","instagram":"3delmagd"}'::jsonb),
  ('pricing', '{"setupFee":60,"hourlyRate":8,"currency":"EGP"}'::jsonb),
  ('pages', '{"home":true,"services":true,"work":true,"viewer":true,"materials":true,"faq":true,"contact":true}'::jsonb),
  ('labels', '{"home":"الرئيسية","services":"الخدمات","work":"معرض الأعمال","viewer":"المعاين 3D","materials":"الخامات","faq":"أسئلة شائعة","contact":"تواصل"}'::jsonb)
on conflict (key) do update set value = excluded.value, updated_at = now();

insert into public.services (id, position, title, description, price) values
  ('s1', 1, 'طباعة من ملفك', 'ارفع STL أو OBJ أو 3MF أو STEP، نفحصه تقنيًا ونرسل السعر والمدة خلال ساعات.', 'from 120 EGP'),
  ('s2', 2, 'تصميم ونمذجة 3D', 'من فكرة أو رسم يدوي أو مقاسات على ورقة إلى موديل جاهز للتصنيع.', 'from 350 EGP'),
  ('s3', 3, 'هندسة عكسية لقطع الغيار', 'قطعة مكسورة أو مقطوعة من السوق — نقيسها، نعيد نمذجتها، ونطبع بديلًا مطابقًا.', 'from 400 EGP'),
  ('s4', 4, 'ماكيتات معمارية', 'مجسمات مشاريع بمقياس رسم دقيق، وقطعة واحدة بدل التقسيم واللصق.', 'from 900 EGP'),
  ('s5', 5, 'دروع وهدايا الشركات', 'مخصصة باللوجو والأسماء، بكميات، مع تشطيب وطلاء اختياري.', 'from 250 EGP'),
  ('s6', 6, 'قطع Cosplay بمقاس حقيقي', 'خوذات وأقنعة ودروع — التخصص الذي يناسب حجم ماكينتنا تحديدًا.', 'from 1200 EGP')
on conflict (id) do update set
  position = excluded.position,
  title = excluded.title,
  description = excluded.description,
  price = excluded.price,
  updated_at = now();

insert into public.works (id, position, title, category, description, material, size, print_time, image) values
  ('w1', 1, 'ماكيت مشروع سكني', 'ماكيتات', 'مقياس 1:100، قطعة واحدة بدون تقسيم.', 'PLA', '40 cm', '26 h', ''),
  ('w2', 2, 'هيكل درون', 'وظيفي', 'خامة ألياف كربون، محسّن للمتانة وخفة الوزن.', 'PLA-CF', '22 cm', '9 h', ''),
  ('w3', 3, 'تروس صناعية', 'وظيفي', 'قطع غيار بتفاوت أبعاد ±0.2 مم بعد المعايرة.', 'PETG', '9 cm', '3 h', ''),
  ('w4', 4, 'خوذة Cosplay', 'ديكور', 'بمقاس حقيقي من قطعة واحدة مع تشطيب اختياري.', 'PLA-CF', '42 cm', '38 h', ''),
  ('w5', 5, 'درع تكريم بلوجو', 'هدايا', 'مخصص بالاسم والشعار، متاح بكميات.', 'PLA + طلاء', '22 cm', '8 h', ''),
  ('w6', 6, 'مزهرية حلزونية', 'ديكور', 'طباعة حلزونية بلمعان حريري بدون طلاء.', 'PLA SILK', '28 cm', '14 h', '')
on conflict (id) do update set
  position = excluded.position,
  title = excluded.title,
  category = excluded.category,
  description = excluded.description,
  material = excluded.material,
  size = excluded.size,
  print_time = excluded.print_time,
  image = excluded.image,
  updated_at = now();

insert into public.faq_items (id, position, question, answer) values
  ('f1', 1, 'كم يستغرق تنفيذ الطلب؟', 'القطع الصغيرة من يوم إلى يومين، والمتوسطة 3–5 أيام. القطع الكبيرة والكميات نحدد لها موعدًا دقيقًا قبل التأكيد.'),
  ('f2', 2, 'كيف يُحسب السعر بالضبط؟', 'وزن الخامة المستهلكة + زمن تشغيل الماكينة + التشطيب اليدوي إن وُجد. المعاين يعطيك تقديرًا فوريًا والسعر النهائي بعد مراجعة الملف.'),
  ('f3', 3, 'ما عندي ملف ثلاثي الأبعاد — تقدروا تساعدوني؟', 'نعم، أرسل صورة أو رسمًا ومقاسات تقريبية وننفذ التصميم من الصفر، ويبقى الملف ملكك بعد التسليم.'),
  ('f4', 4, 'هل القطعة تتحمل الاستخدام الحقيقي؟', 'يعتمد على الخامة. PETG وABS للقطع الوظيفية، وPLA أنسب للديكور والمجسمات.'),
  ('f5', 5, 'ماذا عن سرية التصميم الذي أرسله؟', 'ملفك ملكك وحدك، لا يُعاد استخدامه ولا يُنشر في المعرض إلا بموافقة كتابية منك.')
on conflict (id) do update set
  position = excluded.position,
  question = excluded.question,
  answer = excluded.answer,
  updated_at = now();

insert into public.materials (id, position, name, tagline, price_per_gram, density, strength, heat_resistance) values
  ('m1', 1, 'PLA', 'ديكور، ماكيتات، هدايا بتفاصيل دقيقة', 3.5, 1.24, 55, 25),
  ('m2', 2, 'PETG', 'قطع وظيفية وحوامل وحاويات', 4.5, 1.27, 80, 55),
  ('m3', 3, 'ABS', 'قطع تتعرض للشمس والحرارة', 5.5, 1.04, 85, 88),
  ('m4', 4, 'TPU', 'قطع مرنة وجلود وحشوات', 7.5, 1.21, 60, 45),
  ('m5', 5, 'PLA-CF', 'ألياف كربون، صلابة وتشطيب مطفي', 6.5, 1.22, 88, 60)
on conflict (id) do update set
  position = excluded.position,
  name = excluded.name,
  tagline = excluded.tagline,
  price_per_gram = excluded.price_per_gram,
  density = excluded.density,
  strength = excluded.strength,
  heat_resistance = excluded.heat_resistance,
  updated_at = now();
