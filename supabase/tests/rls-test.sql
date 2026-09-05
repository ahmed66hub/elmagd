\set ON_ERROR_STOP off
\pset pager off
\pset tuples_only on
\pset format unaligned

-- صلاحيات مثل التي يمنحها Supabase تلقائيًا للدورين العامين.
grant usage on schema public to anon, authenticated;
grant select, insert, update, delete on all tables in schema public to anon, authenticated;
grant usage on schema storage to anon, authenticated;
grant usage on schema auth to anon, authenticated;
grant select, insert, update, delete on all tables in schema storage to anon, authenticated;

\echo '--- A/B: تطابق calculate_quote مع الواجهة ---'
select 'A weight=' || (q->>'weightGrams')
    || ' hours=' || round((q->>'hours')::numeric, 3)
    || ' price=' || (q->>'price')
    || ' lead='  || (q->>'leadTimeDays')
from (
  select public.calculate_quote(100, array[100,100,100]::double precision[], 0.2, 20, 0, 1, 3.5, 1.24, 60, 8) as q
) s;

select 'B weight=' || (q->>'weightGrams')
    || ' hours=' || round((q->>'hours')::numeric, 2)
    || ' price=' || (q->>'price')
    || ' lead='  || (q->>'leadTimeDays')
from (
  select public.calculate_quote(100, array[100,100,100]::double precision[], 0.2, 20, 0, 10, 3.5, 1.24, 60, 8) as q
) s;

select 'C exceeds=' || (public.calculate_quote(10, array[500,10,10]::double precision[], 0.2, 20, 0, 1, 3.5, 1.24, 60, 8)->>'exceedsBuildVolume');

\echo '--- D: is_owner ---'
begin;
  set local role authenticated;
  set local request.jwt.claims = '{"role":"authenticated","email":"masry5357@gmail.com"}';
  select 'D owner=' || public.is_owner();
commit;

begin;
  set local role authenticated;
  set local request.jwt.claims = '{"role":"authenticated","email":"someone@else.com"}';
  select 'E other-user-owner=' || public.is_owner();
commit;

begin;
  set local role anon;
  set local request.jwt.claims = '{"role":"anon","email":"masry5357@gmail.com"}';
  select 'F anon-claiming-owner-email=' || public.is_owner();
commit;

\echo '--- G: الزائر يقرأ المحتوى ---'
begin;
  set local role anon;
  set local request.jwt.claims = '{"role":"anon"}';
  select 'G anon-reads-services=' || count(*) from public.services;
commit;

\echo '--- H: الزائر لا يكتب المحتوى ---'
begin;
  set local role anon;
  set local request.jwt.claims = '{"role":"anon"}';
  update public.services set title = 'اختراق' where id = 's1';
  select 'H anon-updated-rows=' || count(*) from public.services where title = 'اختراق';
commit;

\echo '--- I: عميل مسجّل (ليس المالك) لا يكتب ولا يقرأ الطلبات ---'
begin;
  set local role authenticated;
  set local request.jwt.claims = '{"role":"authenticated","email":"customer@example.com"}';
  update public.services set title = 'اختراق2' where id = 's1';
  select 'I customer-updated-rows=' || count(*) from public.services where title = 'اختراق2';
commit;

\echo '--- J: إدراج مباشر في الطلبات ممنوع ---'
begin;
  set local role anon;
  set local request.jwt.claims = '{"role":"anon"}';
  insert into public.orders (customer_name, whatsapp, details) values ('متسلل', '01000000000', 'محاولة إدراج مباشر');
commit;

\echo '--- K: submit_order يعمل للزائر ويعيد حساب السعر بنفسه ---'
begin;
  set local role anon;
  set local request.jwt.claims = '{"role":"anon"}';
  select 'K order-price=' || (r.quote->>'price')
       || ' weight=' || (r.quote->>'weightGrams')
       || ' material=' || (r.quote->>'materialName')
       || ' currency=' || (r.quote->>'currency')
  from public.submit_order('{
    "customerName": "عميل الاختبار",
    "whatsapp": "01001234567",
    "details": "عايز أطبع قطعة تجريبية من فضلك",
    "fileName": "part.stl",
    "materialId": "m1",
    "source": "viewer",
    "price": 1,
    "quote": {"price": 1},
    "print": {
      "volumeCm3": 100,
      "boundingBoxMm": [100, 100, 100],
      "layerHeight": 0.2,
      "infill": 20,
      "supports": 0,
      "quantity": 1
    }
  }'::jsonb) r;
commit;

\echo '--- L: التحقق من المدخلات داخل القاعدة ---'
begin;
  set local role anon;
  set local request.jwt.claims = '{"role":"anon"}';
  select public.submit_order('{"customerName":"ا","whatsapp":"01001234567","details":"تفاصيل كافية جدا"}'::jsonb);
commit;

begin;
  set local role anon;
  set local request.jwt.claims = '{"role":"anon"}';
  select public.submit_order('{"customerName":"اسم صحيح","whatsapp":"123","details":"تفاصيل كافية جدا"}'::jsonb);
commit;

begin;
  set local role anon;
  set local request.jwt.claims = '{"role":"anon"}';
  select public.submit_order('{"customerName":"اسم صحيح","whatsapp":"01001234567","details":"قصير"}'::jsonb);
commit;

\echo '--- M: الزائر لا يقرأ الطلبات ---'
begin;
  set local role anon;
  set local request.jwt.claims = '{"role":"anon"}';
  select 'M anon-reads-orders=' || count(*) from public.orders;
commit;

begin;
  set local role authenticated;
  set local request.jwt.claims = '{"role":"authenticated","email":"customer@example.com"}';
  select 'M2 customer-reads-orders=' || count(*) from public.orders;
commit;

\echo '--- N: المالك يقرأ الطلبات ويعدّل المحتوى ---'
begin;
  set local role authenticated;
  set local request.jwt.claims = '{"role":"authenticated","email":"MASRY5357@Gmail.com"}';
  select 'N owner-reads-orders=' || count(*) from public.orders;
  update public.services set title = 'عنوان المالك' where id = 's1';
  select 'N owner-updated-rows=' || count(*) from public.services where title = 'عنوان المالك';
  update public.orders set status = 'confirmed' where customer_name = 'عميل الاختبار';
  select 'N owner-order-status=' || status from public.orders where customer_name = 'عميل الاختبار';
rollback;

\echo '--- O: رفع الصور — المالك فقط ---'
begin;
  set local role anon;
  set local request.jwt.claims = '{"role":"anon"}';
  insert into storage.objects (bucket_id, name) values ('media', 'works/hack.jpg');
commit;

begin;
  set local role authenticated;
  set local request.jwt.claims = '{"role":"authenticated","email":"masry5357@gmail.com"}';
  insert into storage.objects (bucket_id, name) values ('media', 'works/owner.jpg');
  select 'O owner-uploaded=' || count(*) from storage.objects where name = 'works/owner.jpg';
rollback;
