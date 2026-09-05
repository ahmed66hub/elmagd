-- =====================================================================
-- 3D Elmagd — سكيمة قاعدة البيانات على Supabase
-- ---------------------------------------------------------------------
-- هذه النسخة تعمل بلا سيرفر Laravel: المتصفح يتكلم مع Postgres مباشرة،
-- لذلك كل الحماية هنا في القاعدة نفسها (Row Level Security) لا في كود الواجهة.
--
-- القاعدة الحاكمة: القراءة العامة مسموحة للمحتوى فقط،
-- والكتابة كلها — بلا استثناء — محصورة في بريد المالك.
-- حتى لو أنشأ أي شخص حسابًا وسجّل دخوله، لن يستطيع تعديل حرف واحد
-- ولن يقرأ طلبًا واحدًا، لأن Postgres يرفض الطلب قبل أن يصل لأي جدول.
--
-- التشغيل: Supabase Dashboard → SQL Editor → الصق هذا الملف كاملًا → Run
-- ثم الصق supabase/seed.sql بعده.
-- =====================================================================

create extension if not exists pgcrypto;

-- =====================================================================
-- 1) هوية المالك
-- =====================================================================

-- بريد المالك في مكان واحد. لتغييره: عدّل هذه الدالة وأعد تشغيلها فقط.
create or replace function public.owner_email()
returns text
language sql
stable
security definer
set search_path = public
as $$
  select 'masry5357@gmail.com'::text;
$$;

-- هل الطلب الحالي قادم من المالك؟
-- auth.jwt() يأتي من التوكن الذي يصدره Supabase Auth بعد الدخول،
-- ولا يمكن تزويره من المتصفح لأنه موقَّع بمفتاح المشروع السري.
--
-- security definer هنا مقصود: الدالة تُستدعى داخل سياسات RLS من دورَي anon
-- وauthenticated، فنضمن أنها تعمل بصلاحية مالك القاعدة مهما كانت صلاحيات
-- المتصل على مخطط auth — ومع ذلك تبقى تقرأ توكن الطلب الحالي لا غيره.
create or replace function public.is_owner()
returns boolean
language sql
stable
security definer
set search_path = public, auth
as $$
  select coalesce(auth.jwt() ->> 'role', '') = 'authenticated'
     and lower(coalesce(auth.jwt() ->> 'email', '')) = lower(public.owner_email());
$$;

grant execute on function public.owner_email() to anon, authenticated;
grant execute on function public.is_owner()    to anon, authenticated;

-- =====================================================================
-- 2) جداول المحتوى
-- =====================================================================

create table if not exists public.settings (
  key        text primary key,
  value      jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

create table if not exists public.services (
  id          text primary key,
  position    integer not null default 0,
  title       text not null default '',
  description text not null default '',
  price       text not null default '',
  updated_at  timestamptz not null default now()
);

create table if not exists public.works (
  id          text primary key,
  position    integer not null default 0,
  title       text not null default '',
  category    text not null default '',
  description text not null default '',
  material    text not null default '',
  size        text not null default '',
  print_time  text not null default '',
  image       text not null default '',
  updated_at  timestamptz not null default now()
);

create table if not exists public.faq_items (
  id         text primary key,
  position   integer not null default 0,
  question   text not null default '',
  answer     text not null default '',
  updated_at timestamptz not null default now()
);

create table if not exists public.materials (
  id              text primary key,
  position        integer not null default 0,
  name            text not null default '',
  tagline         text not null default '',
  price_per_gram  numeric(10, 3) not null default 0,
  density         numeric(10, 3) not null default 1,
  strength        integer not null default 0,
  heat_resistance integer not null default 0,
  updated_at      timestamptz not null default now()
);

create index if not exists services_position_idx  on public.services (position, id);
create index if not exists works_position_idx     on public.works (position, id);
create index if not exists faq_items_position_idx on public.faq_items (position, id);
create index if not exists materials_position_idx on public.materials (position, id);

-- =====================================================================
-- 3) جدول الطلبات — لا دفع أونلاين، الطلب يُسجَّل ثم تُفتح محادثة واتساب
-- =====================================================================

create table if not exists public.orders (
  id            uuid primary key default gen_random_uuid(),
  customer_name text not null,
  whatsapp      text not null,
  details       text not null,
  file_name     text,
  material_name text,
  quote         jsonb,
  status        text not null default 'new'
                check (status in ('new','quoted','confirmed','printing','ready','delivered','cancelled')),
  source        text not null default 'contact'
                check (source in ('viewer','contact')),
  customer_id   uuid references auth.users (id) on delete set null,
  created_at    timestamptz not null default now()
);

create index if not exists orders_created_at_idx on public.orders (created_at desc);
create index if not exists orders_status_idx     on public.orders (status);

-- =====================================================================
-- 4) نموذج التسعير داخل القاعدة
-- ---------------------------------------------------------------------
-- المتصفح يعرض السعر، لكن الذي يُخزَّن مع الطلب هو ما تحسبه هذه الدالة
-- من أسعار الخامات في القاعدة — فلا يستطيع أحد إرسال سعر من عنده.
-- المعادلات هنا نسخة حرفية من apps/web/src/lib/domain/pricing.ts،
-- ويحرس التطابقَ اختبارُ pricing.parity.test.ts.
-- =====================================================================

create or replace function public.calculate_quote(
  p_volume_cm3       double precision,
  p_box_mm           double precision[],
  p_layer_height     double precision,
  p_infill           double precision,
  p_supports         double precision,
  p_quantity         integer,
  p_material_rate    double precision,
  p_material_density double precision,
  p_setup_fee        double precision,
  p_hourly_rate      double precision
)
returns jsonb
language plpgsql
immutable
as $$
declare
  -- ثوابت النموذج (PRICING_MODEL في الواجهة)
  shell_factor    constant double precision := 0.26;
  infill_factor   constant double precision := 0.0074;
  support_divisor constant double precision := 260;
  grams_per_hour  constant double precision := 17;
  reference_layer constant double precision := 0.2;
  warmup_hours    constant double precision := 0.4;
  rounding_step   constant double precision := 5;
  hours_per_day   constant double precision := 12;
  min_lead_days   constant integer := 2;
  max_lead_days   constant integer := 12;

  qty          integer;
  safe_layer   double precision;
  solid_ratio  double precision;
  support_rate double precision;
  unit_weight  double precision;
  unit_hours   double precision;
  raw_price    double precision;
  final_price  double precision;
  total_hours  double precision;
  lead_days    integer;
  box          double precision[];
begin
  qty := greatest(1, round(coalesce(p_quantity, 1))::integer);
  safe_layer := case when coalesce(p_layer_height, 0) > 0 then p_layer_height else reference_layer end;
  box := coalesce(p_box_mm, array[0, 0, 0]::double precision[]);

  solid_ratio  := shell_factor + infill_factor * coalesce(p_infill, 0);
  support_rate := 1 + coalesce(p_supports, 0) / support_divisor;

  unit_weight := greatest(
    0,
    coalesce(p_volume_cm3, 0) * coalesce(p_material_density, 0) * solid_ratio * support_rate
  );
  unit_hours := (unit_weight / grams_per_hour) * (reference_layer / safe_layer) + warmup_hours;

  raw_price := coalesce(p_setup_fee, 0)
             + unit_weight * coalesce(p_material_rate, 0) * qty
             + unit_hours * coalesce(p_hourly_rate, 0) * qty;

  -- نفس تقريب Math.round في الواجهة: نصف يرتفع لأعلى (القيم موجبة دائمًا).
  final_price := greatest(
    coalesce(p_setup_fee, 0),
    round((raw_price / rounding_step)::numeric)::double precision * rounding_step
  );

  total_hours := unit_hours * qty;
  lead_days := least(
    max_lead_days,
    greatest(min_lead_days, ceil(total_hours / hours_per_day)::integer + 1)
  );

  return jsonb_build_object(
    'volumeCm3',          coalesce(p_volume_cm3, 0),
    'weightGrams',        round((unit_weight * qty)::numeric)::integer,
    'hours',              total_hours,
    'price',              final_price,
    'leadTimeDays',       lead_days,
    'exceedsBuildVolume', coalesce(box[1], 0) > 420
                          or coalesce(box[2], 0) > 420
                          or coalesce(box[3], 0) > 500
  );
end;
$$;

-- =====================================================================
-- 5) تسجيل الطلب — المسار الوحيد للكتابة في جدول الطلبات
-- ---------------------------------------------------------------------
-- security definer: تعمل بصلاحية مالك الدالة، فتستطيع الإدراج رغم أن
-- الزائر نفسه لا يملك أي سياسة insert على الجدول. أي محاولة إدراج مباشر
-- من المتصفح تُرفض؛ والمرور من هنا يعني المرور على التحقق وإعادة حساب السعر.
-- =====================================================================

create or replace function public.submit_order(payload jsonb)
returns public.orders
language plpgsql
security definer
set search_path = public
as $$
declare
  v_name     text := btrim(coalesce(payload ->> 'customerName', ''));
  v_whatsapp text := btrim(coalesce(payload ->> 'whatsapp', ''));
  v_details  text := btrim(coalesce(payload ->> 'details', ''));
  v_file     text := nullif(btrim(coalesce(payload ->> 'fileName', '')), '');
  v_source   text := coalesce(payload ->> 'source', 'contact');
  v_print    jsonb := payload -> 'print';
  v_material public.materials%rowtype;
  v_pricing  jsonb;
  v_quote    jsonb := null;
  v_material_name text := null;
  v_result   public.orders%rowtype;
begin
  -- تحقق مطابق لتحقق الواجهة، لأن الواجهة وحدها لا يُوثق بها.
  if char_length(v_name) < 2 then
    raise exception 'الاسم قصير جدًا' using errcode = '22023';
  end if;
  if v_whatsapp !~ '^[0-9[:space:]+()-]{8,}$' then
    raise exception 'رقم واتساب غير صحيح' using errcode = '22023';
  end if;
  if char_length(v_details) < 10 then
    raise exception 'تفاصيل الطلب قصيرة جدًا' using errcode = '22023';
  end if;
  if v_source not in ('viewer', 'contact') then
    v_source := 'contact';
  end if;

  -- حدود تمنع إغراق الجدول بنص ضخم من نموذج عام.
  v_name    := left(v_name, 120);
  v_whatsapp := left(v_whatsapp, 40);
  v_details := left(v_details, 2000);
  v_file    := left(v_file, 255);

  -- إعادة حساب السعر من بيانات القاعدة، لا من أي رقم أرسله المتصفح.
  if v_print is not null and nullif(payload ->> 'materialId', '') is not null then
    select * into v_material from public.materials where id = payload ->> 'materialId';

    if found then
      select value into v_pricing from public.settings where key = 'pricing';
      v_pricing := coalesce(v_pricing, '{}'::jsonb);
      v_material_name := v_material.name;

      v_quote := public.calculate_quote(
        (v_print ->> 'volumeCm3')::double precision,
        array[
          coalesce((v_print -> 'boundingBoxMm' ->> 0)::double precision, 0),
          coalesce((v_print -> 'boundingBoxMm' ->> 1)::double precision, 0),
          coalesce((v_print -> 'boundingBoxMm' ->> 2)::double precision, 0)
        ],
        (v_print ->> 'layerHeight')::double precision,
        (v_print ->> 'infill')::double precision,
        (v_print ->> 'supports')::double precision,
        greatest(1, least(30, coalesce((v_print ->> 'quantity')::integer, 1))),
        v_material.price_per_gram::double precision,
        v_material.density::double precision,
        coalesce((v_pricing ->> 'setupFee')::double precision, 0),
        coalesce((v_pricing ->> 'hourlyRate')::double precision, 0)
      ) || jsonb_build_object(
        'currency',     coalesce(v_pricing ->> 'currency', 'EGP'),
        'materialId',   v_material.id,
        'materialName', v_material.name,
        'layerHeight',  (v_print ->> 'layerHeight')::double precision,
        'infill',       (v_print ->> 'infill')::double precision,
        'supports',     (v_print ->> 'supports')::double precision,
        'quantity',     greatest(1, least(30, coalesce((v_print ->> 'quantity')::integer, 1)))
      );
    end if;
  end if;

  insert into public.orders (
    customer_name, whatsapp, details, file_name, material_name, quote, source, customer_id
  )
  values (
    v_name, v_whatsapp, v_details, v_file, v_material_name, v_quote, v_source, auth.uid()
  )
  returning * into v_result;

  return v_result;
end;
$$;

revoke all on function public.submit_order(jsonb) from public;
grant execute on function public.submit_order(jsonb) to anon, authenticated;

-- =====================================================================
-- 6) Row Level Security
-- =====================================================================

alter table public.settings   enable row level security;
alter table public.services   enable row level security;
alter table public.works      enable row level security;
alter table public.faq_items  enable row level security;
alter table public.materials  enable row level security;
alter table public.orders     enable row level security;

-- المحتوى: يقرأه الجميع (الموقع العام يحتاجه) ولا يكتبه إلا المالك.
do $$
declare
  t text;
begin
  foreach t in array array['settings', 'services', 'works', 'faq_items', 'materials'] loop
    execute format('drop policy if exists %I on public.%I', t || '_public_read', t);
    execute format('drop policy if exists %I on public.%I', t || '_owner_write', t);

    execute format(
      'create policy %I on public.%I for select using (true)',
      t || '_public_read', t
    );
    execute format(
      'create policy %I on public.%I for all using (public.is_owner()) with check (public.is_owner())',
      t || '_owner_write', t
    );
  end loop;
end;
$$;

-- الطلبات: بيانات عملاء. لا يقرأها أحد غير المالك ولا يعدّلها أحد غيره.
-- ولا توجد سياسة insert إطلاقًا — الإدراج يمر حصرًا عبر submit_order().
drop policy if exists orders_owner_read   on public.orders;
drop policy if exists orders_owner_update on public.orders;
drop policy if exists orders_owner_delete on public.orders;

create policy orders_owner_read on public.orders
  for select using (public.is_owner());

create policy orders_owner_update on public.orders
  for update using (public.is_owner()) with check (public.is_owner());

create policy orders_owner_delete on public.orders
  for delete using (public.is_owner());

-- =====================================================================
-- 7) تخزين الصور
-- =====================================================================

insert into storage.buckets (id, name, public)
values ('media', 'media', true)
on conflict (id) do update set public = true;

drop policy if exists media_public_read   on storage.objects;
drop policy if exists media_owner_insert  on storage.objects;
drop policy if exists media_owner_update  on storage.objects;
drop policy if exists media_owner_delete  on storage.objects;

create policy media_public_read on storage.objects
  for select using (bucket_id = 'media');

create policy media_owner_insert on storage.objects
  for insert with check (bucket_id = 'media' and public.is_owner());

create policy media_owner_update on storage.objects
  for update using (bucket_id = 'media' and public.is_owner());

create policy media_owner_delete on storage.objects
  for delete using (bucket_id = 'media' and public.is_owner());
