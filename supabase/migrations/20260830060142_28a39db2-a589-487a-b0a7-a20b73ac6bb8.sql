
-- ========== ROLES & PROFILES ==========
CREATE TYPE public.app_role AS ENUM ('admin','pengasuhan');

CREATE TABLE public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text NOT NULL DEFAULT '',
  email text,
  avatar_url text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;

CREATE OR REPLACE FUNCTION public.is_staff()
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid())
$$;

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin')
$$;

CREATE POLICY "profiles_select_staff" ON public.profiles FOR SELECT TO authenticated USING (public.is_staff() OR id = auth.uid());
CREATE POLICY "profiles_update_self" ON public.profiles FOR UPDATE TO authenticated USING (id = auth.uid() OR public.is_admin()) WITH CHECK (id = auth.uid() OR public.is_admin());
CREATE POLICY "profiles_insert_self" ON public.profiles FOR INSERT TO authenticated WITH CHECK (id = auth.uid());
CREATE POLICY "user_roles_select" ON public.user_roles FOR SELECT TO authenticated USING (user_id = auth.uid() OR public.is_admin());

CREATE OR REPLACE FUNCTION public.set_updated_at() RETURNS trigger
LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END $$;

CREATE OR REPLACE FUNCTION public.handle_new_user() RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name',''), NEW.email)
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END $$;
CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ========== MASTER STRUCTURE ==========
CREATE TABLE public.tahun_ajaran (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nama text NOT NULL UNIQUE,
  is_active boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE public.asrama (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nama text NOT NULL UNIQUE,
  aktif boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE public.kelas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nama text NOT NULL UNIQUE,
  tingkat text,
  aktif boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE public.kamar (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nama text NOT NULL,
  asrama_id uuid REFERENCES public.asrama(id) ON DELETE SET NULL,
  aktif boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (nama, asrama_id)
);

CREATE TABLE public.achievement_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nama text NOT NULL UNIQUE,
  dimension text NOT NULL DEFAULT 'achievement',
  aktif boolean NOT NULL DEFAULT true
);
CREATE TABLE public.achievement_levels (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nama text NOT NULL UNIQUE,
  urutan int NOT NULL DEFAULT 1,
  points int NOT NULL DEFAULT 10,
  aktif boolean NOT NULL DEFAULT true
);
CREATE TABLE public.incident_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nama text NOT NULL UNIQUE,
  dimension text NOT NULL DEFAULT 'discipline',
  aktif boolean NOT NULL DEFAULT true
);
CREATE TABLE public.incident_levels (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nama text NOT NULL UNIQUE,
  urutan int NOT NULL DEFAULT 1,
  points int NOT NULL DEFAULT -5,
  aktif boolean NOT NULL DEFAULT true
);
CREATE TABLE public.point_rules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  kode text NOT NULL UNIQUE,
  deskripsi text NOT NULL,
  points int NOT NULL DEFAULT 0,
  dimension text NOT NULL DEFAULT 'achievement',
  aktif boolean NOT NULL DEFAULT true
);
CREATE TABLE public.recognition_badges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  kode text NOT NULL UNIQUE,
  nama text NOT NULL,
  deskripsi text,
  icon text NOT NULL DEFAULT 'award',
  points int NOT NULL DEFAULT 15,
  dimension text NOT NULL DEFAULT 'character',
  aktif boolean NOT NULL DEFAULT true
);
CREATE TABLE public.settings (
  key text PRIMARY KEY,
  value jsonb NOT NULL DEFAULT '{}'::jsonb,
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- ========== SANTRI ==========
CREATE TABLE public.santri (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nis text NOT NULL UNIQUE,
  nama text NOT NULL,
  panggilan text,
  foto_url text,
  jenis_kelamin text NOT NULL DEFAULT 'L',
  kelas_id uuid REFERENCES public.kelas(id) ON DELETE SET NULL,
  kamar_id uuid REFERENCES public.kamar(id) ON DELETE SET NULL,
  asrama_id uuid REFERENCES public.asrama(id) ON DELETE SET NULL,
  tahun_masuk int,
  tahun_ajaran_id uuid REFERENCES public.tahun_ajaran(id) ON DELETE SET NULL,
  status text NOT NULL DEFAULT 'Aktif',
  qr_token uuid NOT NULL DEFAULT gen_random_uuid() UNIQUE,
  archived_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_santri_nama ON public.santri (lower(nama));
CREATE INDEX idx_santri_nis ON public.santri (nis);
CREATE INDEX idx_santri_status ON public.santri (status);
CREATE INDEX idx_santri_kelas ON public.santri (kelas_id);
CREATE INDEX idx_santri_asrama ON public.santri (asrama_id);
CREATE TRIGGER trg_santri_updated BEFORE UPDATE ON public.santri FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ========== ACHIEVEMENTS ==========
CREATE TABLE public.achievements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  santri_id uuid NOT NULL REFERENCES public.santri(id) ON DELETE CASCADE,
  category_id uuid REFERENCES public.achievement_categories(id) ON DELETE SET NULL,
  level_id uuid REFERENCES public.achievement_levels(id) ON DELETE SET NULL,
  event_name text NOT NULL,
  organizer text,
  tanggal date NOT NULL DEFAULT current_date,
  hasil text,
  points int NOT NULL DEFAULT 0,
  deskripsi text,
  coach text,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_ach_santri ON public.achievements (santri_id);
CREATE INDEX idx_ach_created ON public.achievements (created_at DESC);
CREATE INDEX idx_ach_tanggal ON public.achievements (tanggal DESC);
CREATE TRIGGER trg_ach_updated BEFORE UPDATE ON public.achievements FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ========== INCIDENTS ==========
CREATE TABLE public.incidents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  santri_id uuid NOT NULL REFERENCES public.santri(id) ON DELETE CASCADE,
  category_id uuid REFERENCES public.incident_categories(id) ON DELETE SET NULL,
  level_id uuid REFERENCES public.incident_levels(id) ON DELETE SET NULL,
  tanggal date NOT NULL DEFAULT current_date,
  waktu time,
  lokasi text,
  deskripsi text NOT NULL,
  reporter text,
  points int NOT NULL DEFAULT 0,
  tindakan_awal text,
  status text NOT NULL DEFAULT 'Baru',
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_inc_santri ON public.incidents (santri_id);
CREATE INDEX idx_inc_created ON public.incidents (created_at DESC);
CREATE INDEX idx_inc_tanggal ON public.incidents (tanggal DESC);
CREATE TRIGGER trg_inc_updated BEFORE UPDATE ON public.incidents FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ========== GUIDANCE ==========
CREATE TABLE public.guidance (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  santri_id uuid NOT NULL REFERENCES public.santri(id) ON DELETE CASCADE,
  source_incident_id uuid REFERENCES public.incidents(id) ON DELETE SET NULL,
  goal text NOT NULL,
  approach text,
  coach text,
  start_date date NOT NULL DEFAULT current_date,
  target_date date,
  status text NOT NULL DEFAULT 'Planned',
  result text,
  notes text,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_guid_santri ON public.guidance (santri_id);
CREATE INDEX idx_guid_status ON public.guidance (status);
CREATE TRIGGER trg_guid_updated BEFORE UPDATE ON public.guidance FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE public.guidance_followups (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  guidance_id uuid NOT NULL REFERENCES public.guidance(id) ON DELETE CASCADE,
  tanggal date NOT NULL DEFAULT current_date,
  coach text,
  observation text,
  progress int NOT NULL DEFAULT 0,
  next_action text,
  status text NOT NULL DEFAULT 'Follow-up',
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_fu_guidance ON public.guidance_followups (guidance_id);

-- ========== RECOGNITION ==========
CREATE TABLE public.student_recognitions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  santri_id uuid NOT NULL REFERENCES public.santri(id) ON DELETE CASCADE,
  badge_id uuid NOT NULL REFERENCES public.recognition_badges(id) ON DELETE CASCADE,
  alasan text,
  tanggal date NOT NULL DEFAULT current_date,
  points int NOT NULL DEFAULT 0,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_rec_santri ON public.student_recognitions (santri_id);

-- ========== POINT LEDGER ==========
CREATE TABLE public.point_ledger (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  santri_id uuid NOT NULL REFERENCES public.santri(id) ON DELETE CASCADE,
  source_type text NOT NULL,
  source_id uuid,
  dimension text NOT NULL DEFAULT 'achievement',
  points int NOT NULL DEFAULT 0,
  description text,
  occurred_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (source_type, source_id)
);
CREATE INDEX idx_ledger_santri ON public.point_ledger (santri_id);
CREATE INDEX idx_ledger_occurred ON public.point_ledger (occurred_at DESC);

-- ========== SNAPSHOTS / WARNINGS / MISC ==========
CREATE TABLE public.growth_snapshots (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  santri_id uuid NOT NULL REFERENCES public.santri(id) ON DELETE CASCADE,
  period_start date NOT NULL,
  period_end date NOT NULL,
  metrics jsonb NOT NULL DEFAULT '{}'::jsonb,
  total_score numeric NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (santri_id, period_start, period_end)
);
CREATE TABLE public.early_warning_rules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  kode text NOT NULL UNIQUE,
  nama text NOT NULL,
  deskripsi text,
  metric text NOT NULL,
  threshold numeric NOT NULL,
  window_days int NOT NULL DEFAULT 14,
  severity text NOT NULL DEFAULT 'Needs Attention',
  aktif boolean NOT NULL DEFAULT true
);
CREATE TABLE public.early_warnings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  santri_id uuid NOT NULL REFERENCES public.santri(id) ON DELETE CASCADE,
  rule_id uuid REFERENCES public.early_warning_rules(id) ON DELETE SET NULL,
  severity text NOT NULL DEFAULT 'Needs Attention',
  reason text NOT NULL,
  status text NOT NULL DEFAULT 'Open',
  reviewed_at timestamptz,
  reviewed_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_warn_santri ON public.early_warnings (santri_id);

CREATE TABLE public.attachments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_type text NOT NULL,
  entity_id uuid NOT NULL,
  path text NOT NULL,
  mime_type text,
  size_bytes bigint,
  uploaded_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_att_entity ON public.attachments (entity_type, entity_id);

CREATE TABLE public.notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL,
  message text,
  type text NOT NULL DEFAULT 'info',
  entity_type text,
  entity_id uuid,
  read_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_notif_user ON public.notifications (user_id, read_at);

CREATE TABLE public.activity_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  action text NOT NULL,
  entity text NOT NULL,
  entity_id uuid,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_log_actor ON public.activity_logs (actor_id, created_at DESC);

-- ========== GRANTS ==========
GRANT SELECT, INSERT, UPDATE, DELETE ON
  public.tahun_ajaran, public.asrama, public.kelas, public.kamar,
  public.achievement_categories, public.achievement_levels,
  public.incident_categories, public.incident_levels,
  public.point_rules, public.recognition_badges, public.settings,
  public.santri, public.achievements, public.incidents,
  public.guidance, public.guidance_followups, public.student_recognitions,
  public.point_ledger, public.growth_snapshots,
  public.early_warning_rules, public.early_warnings,
  public.attachments, public.notifications, public.activity_logs
TO authenticated;
GRANT ALL ON
  public.tahun_ajaran, public.asrama, public.kelas, public.kamar,
  public.achievement_categories, public.achievement_levels,
  public.incident_categories, public.incident_levels,
  public.point_rules, public.recognition_badges, public.settings,
  public.santri, public.achievements, public.incidents,
  public.guidance, public.guidance_followups, public.student_recognitions,
  public.point_ledger, public.growth_snapshots,
  public.early_warning_rules, public.early_warnings,
  public.attachments, public.notifications, public.activity_logs
TO service_role;

-- ========== RLS ==========
ALTER TABLE public.tahun_ajaran ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.asrama ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.kelas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.kamar ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.achievement_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.achievement_levels ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.incident_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.incident_levels ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.point_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recognition_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.early_warning_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.santri ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.incidents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.guidance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.guidance_followups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_recognitions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.point_ledger ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.growth_snapshots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.early_warnings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;

-- master/config: staff read, admin write
DO $$
DECLARE t text;
BEGIN
  FOREACH t IN ARRAY ARRAY['tahun_ajaran','asrama','kelas','kamar','achievement_categories','achievement_levels','incident_categories','incident_levels','point_rules','recognition_badges','settings','early_warning_rules']
  LOOP
    EXECUTE format('CREATE POLICY %I ON public.%I FOR SELECT TO authenticated USING (public.is_staff())', t||'_sel', t);
    EXECUTE format('CREATE POLICY %I ON public.%I FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin())', t||'_admin', t);
  END LOOP;
END $$;

-- operational: staff read+write, admin delete
DO $$
DECLARE t text;
BEGIN
  FOREACH t IN ARRAY ARRAY['santri','achievements','incidents','guidance','guidance_followups','student_recognitions','attachments','early_warnings','growth_snapshots']
  LOOP
    EXECUTE format('CREATE POLICY %I ON public.%I FOR SELECT TO authenticated USING (public.is_staff())', t||'_sel', t);
    EXECUTE format('CREATE POLICY %I ON public.%I FOR INSERT TO authenticated WITH CHECK (public.is_staff())', t||'_ins', t);
    EXECUTE format('CREATE POLICY %I ON public.%I FOR UPDATE TO authenticated USING (public.is_staff()) WITH CHECK (public.is_staff())', t||'_upd', t);
    EXECUTE format('CREATE POLICY %I ON public.%I FOR DELETE TO authenticated USING (public.is_admin())', t||'_del', t);
  END LOOP;
END $$;

CREATE POLICY "ledger_sel" ON public.point_ledger FOR SELECT TO authenticated USING (public.is_staff());
CREATE POLICY "ledger_admin" ON public.point_ledger FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE POLICY "notif_sel" ON public.notifications FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "notif_upd" ON public.notifications FOR UPDATE TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY "notif_ins" ON public.notifications FOR INSERT TO authenticated WITH CHECK (public.is_staff());
CREATE POLICY "logs_sel" ON public.activity_logs FOR SELECT TO authenticated USING (public.is_admin());
CREATE POLICY "logs_ins" ON public.activity_logs FOR INSERT TO authenticated WITH CHECK (actor_id = auth.uid());

-- ========== POINT LEDGER SYNC TRIGGERS ==========
CREATE OR REPLACE FUNCTION public.sync_ledger_achievement() RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE dim text; pts int;
BEGIN
  IF TG_OP = 'DELETE' THEN
    DELETE FROM public.point_ledger WHERE source_type='achievement' AND source_id = OLD.id;
    RETURN OLD;
  END IF;
  SELECT COALESCE(c.dimension,'achievement') INTO dim FROM public.achievement_categories c WHERE c.id = NEW.category_id;
  pts := COALESCE(NEW.points, 0);
  IF pts = 0 THEN SELECT COALESCE(l.points,10) INTO pts FROM public.achievement_levels l WHERE l.id = NEW.level_id; END IF;
  INSERT INTO public.point_ledger (santri_id, source_type, source_id, dimension, points, description, occurred_at, created_by)
  VALUES (NEW.santri_id,'achievement',NEW.id,COALESCE(dim,'achievement'),COALESCE(pts,10),NEW.event_name,NEW.tanggal::timestamptz,NEW.created_by)
  ON CONFLICT (source_type, source_id) DO UPDATE
    SET points = EXCLUDED.points, dimension = EXCLUDED.dimension, description = EXCLUDED.description,
        santri_id = EXCLUDED.santri_id, occurred_at = EXCLUDED.occurred_at;
  RETURN NEW;
END $$;
CREATE TRIGGER trg_ledger_ach AFTER INSERT OR UPDATE OR DELETE ON public.achievements
FOR EACH ROW EXECUTE FUNCTION public.sync_ledger_achievement();

CREATE OR REPLACE FUNCTION public.sync_ledger_incident() RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE dim text; pts int;
BEGIN
  IF TG_OP = 'DELETE' THEN
    DELETE FROM public.point_ledger WHERE source_type='incident' AND source_id = OLD.id;
    RETURN OLD;
  END IF;
  SELECT COALESCE(c.dimension,'discipline') INTO dim FROM public.incident_categories c WHERE c.id = NEW.category_id;
  pts := COALESCE(NEW.points, 0);
  IF pts = 0 THEN SELECT COALESCE(l.points,-5) INTO pts FROM public.incident_levels l WHERE l.id = NEW.level_id; END IF;
  INSERT INTO public.point_ledger (santri_id, source_type, source_id, dimension, points, description, occurred_at, created_by)
  VALUES (NEW.santri_id,'incident',NEW.id,COALESCE(dim,'discipline'),COALESCE(pts,-5),LEFT(NEW.deskripsi,120),NEW.tanggal::timestamptz,NEW.created_by)
  ON CONFLICT (source_type, source_id) DO UPDATE
    SET points = EXCLUDED.points, dimension = EXCLUDED.dimension, description = EXCLUDED.description,
        santri_id = EXCLUDED.santri_id, occurred_at = EXCLUDED.occurred_at;
  RETURN NEW;
END $$;
CREATE TRIGGER trg_ledger_inc AFTER INSERT OR UPDATE OR DELETE ON public.incidents
FOR EACH ROW EXECUTE FUNCTION public.sync_ledger_incident();

CREATE OR REPLACE FUNCTION public.sync_ledger_recognition() RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE dim text; pts int;
BEGIN
  IF TG_OP = 'DELETE' THEN
    DELETE FROM public.point_ledger WHERE source_type='recognition' AND source_id = OLD.id;
    RETURN OLD;
  END IF;
  SELECT b.dimension, b.points INTO dim, pts FROM public.recognition_badges b WHERE b.id = NEW.badge_id;
  IF COALESCE(NEW.points,0) <> 0 THEN pts := NEW.points; END IF;
  INSERT INTO public.point_ledger (santri_id, source_type, source_id, dimension, points, description, occurred_at, created_by)
  VALUES (NEW.santri_id,'recognition',NEW.id,COALESCE(dim,'character'),COALESCE(pts,15),COALESCE(NEW.alasan,'Recognition'),NEW.tanggal::timestamptz,NEW.created_by)
  ON CONFLICT (source_type, source_id) DO UPDATE
    SET points = EXCLUDED.points, dimension = EXCLUDED.dimension, description = EXCLUDED.description;
  RETURN NEW;
END $$;
CREATE TRIGGER trg_ledger_rec AFTER INSERT OR UPDATE OR DELETE ON public.student_recognitions
FOR EACH ROW EXECUTE FUNCTION public.sync_ledger_recognition();

-- ========== SCORING VIEW ==========
CREATE OR REPLACE VIEW public.v_santri_scores
WITH (security_invoker = on) AS
WITH win AS (
  SELECT santri_id, dimension, points, occurred_at,
    (occurred_at > now() - interval '90 days') AS is_current,
    (occurred_at <= now() - interval '90 days' AND occurred_at > now() - interval '180 days') AS is_prev
  FROM public.point_ledger
  WHERE occurred_at > now() - interval '180 days'
), agg AS (
  SELECT s.id AS santri_id,
    COALESCE(SUM(w.points) FILTER (WHERE w.is_current AND w.dimension='achievement'),0) AS a_cur,
    COALESCE(SUM(w.points) FILTER (WHERE w.is_current AND w.dimension='discipline'),0) AS d_cur,
    COALESCE(SUM(w.points) FILTER (WHERE w.is_current AND w.dimension='character'),0) AS c_cur,
    COALESCE(SUM(w.points) FILTER (WHERE w.is_current AND w.dimension='contribution'),0) AS k_cur,
    COALESCE(SUM(w.points) FILTER (WHERE w.is_current AND w.dimension='leadership'),0) AS l_cur,
    COALESCE(SUM(w.points) FILTER (WHERE w.is_current),0) AS t_cur,
    COALESCE(SUM(w.points) FILTER (WHERE w.is_prev),0) AS t_prev
  FROM public.santri s LEFT JOIN win w ON w.santri_id = s.id
  GROUP BY s.id
)
SELECT santri_id,
  LEAST(100, GREATEST(0, 50 + a_cur))::numeric AS achievement_score,
  LEAST(100, GREATEST(0, 80 + d_cur))::numeric AS discipline_score,
  LEAST(100, GREATEST(0, 60 + c_cur))::numeric AS character_score,
  LEAST(100, GREATEST(0, 55 + k_cur))::numeric AS contribution_score,
  LEAST(100, GREATEST(0, 55 + l_cur))::numeric AS leadership_score,
  LEAST(100, GREATEST(0, 50 + (t_cur - t_prev)))::numeric AS growth_score_metric,
  ROUND((
    LEAST(100, GREATEST(0, 50 + a_cur)) * 0.25 +
    LEAST(100, GREATEST(0, 80 + d_cur)) * 0.30 +
    LEAST(100, GREATEST(0, 60 + c_cur)) * 0.15 +
    LEAST(100, GREATEST(0, 55 + k_cur)) * 0.10 +
    LEAST(100, GREATEST(0, 55 + l_cur)) * 0.10 +
    LEAST(100, GREATEST(0, 50 + (t_cur - t_prev))) * 0.10
  )::numeric, 1) AS growth_score,
  t_cur AS points_current, t_prev AS points_previous, (t_cur - t_prev) AS points_delta
FROM agg;
GRANT SELECT ON public.v_santri_scores TO authenticated, service_role;

CREATE OR REPLACE VIEW public.v_santri_overview
WITH (security_invoker = on) AS
SELECT s.*, k.nama AS kelas_nama, km.nama AS kamar_nama, a.nama AS asrama_nama,
  sc.growth_score, sc.achievement_score, sc.discipline_score, sc.character_score,
  sc.contribution_score, sc.leadership_score, sc.growth_score_metric,
  sc.points_current, sc.points_previous, sc.points_delta,
  (SELECT count(*) FROM public.achievements ac WHERE ac.santri_id = s.id) AS total_achievements,
  (SELECT count(*) FROM public.incidents ic WHERE ic.santri_id = s.id) AS total_incidents,
  (SELECT count(*) FROM public.guidance g WHERE g.santri_id = s.id AND g.status IN ('Planned','Active','Follow-up')) AS active_guidance
FROM public.santri s
LEFT JOIN public.kelas k ON k.id = s.kelas_id
LEFT JOIN public.kamar km ON km.id = s.kamar_id
LEFT JOIN public.asrama a ON a.id = s.asrama_id
LEFT JOIN public.v_santri_scores sc ON sc.santri_id = s.id;
GRANT SELECT ON public.v_santri_overview TO authenticated, service_role;
