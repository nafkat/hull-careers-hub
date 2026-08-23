CREATE TABLE public.job_listings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  title text NOT NULL,
  department text NOT NULL,
  description text NOT NULL DEFAULT '',
  employment_type text NOT NULL DEFAULT 'Full-time',
  location text NOT NULL DEFAULT '',
  summary text NOT NULL DEFAULT '',
  requirements text[] NOT NULL DEFAULT '{}',
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','active','closed')),
  social_auto_post boolean NOT NULL DEFAULT false,
  social_posted_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.job_listings TO anon;
GRANT SELECT ON public.job_listings TO authenticated;
GRANT ALL ON public.job_listings TO service_role;
ALTER TABLE public.job_listings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active job listings"
  ON public.job_listings FOR SELECT TO anon, authenticated
  USING (status = 'active');

CREATE TABLE public.applications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  job_listing_id uuid NOT NULL REFERENCES public.job_listings(id) ON DELETE CASCADE,
  full_name text NOT NULL,
  email text NOT NULL,
  phone text,
  cover_message text,
  file_path text,
  file_name text,
  file_size bigint,
  file_mime_type text,
  virus_scan_status text NOT NULL DEFAULT 'pending' CHECK (virus_scan_status IN ('pending','clean','infected','error')),
  email_sent boolean NOT NULL DEFAULT false,
  is_read boolean NOT NULL DEFAULT false,
  is_archived boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX applications_job_listing_id_idx ON public.applications (job_listing_id);
GRANT ALL ON public.applications TO service_role;
ALTER TABLE public.applications ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.app_settings (
  id boolean PRIMARY KEY DEFAULT true CHECK (id),
  max_file_size_mb integer NOT NULL DEFAULT 10,
  email_from text NOT NULL DEFAULT 'careers@eurohull.com',
  email_subject text NOT NULL DEFAULT 'We received your application — EUROHULL',
  email_body_template text NOT NULL DEFAULT 'Thank you {{full_name}}, we received your application for {{job_title}}. We will contact you soon. — EUROHULL Team',
  virus_scan_enabled boolean NOT NULL DEFAULT true,
  admin_password_hash text,
  social_api_keys jsonb NOT NULL DEFAULT '{}'::jsonb,
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT ALL ON public.app_settings TO service_role;
ALTER TABLE public.app_settings ENABLE ROW LEVEL SECURITY;

INSERT INTO public.app_settings (id) VALUES (true);

INSERT INTO public.job_listings (slug, title, department, location, employment_type, status, social_auto_post, summary, description, requirements) VALUES
('senior-naval-architect', 'Senior Naval Architect', 'Engineering', 'Piraeus, Greece', 'Full-time', 'active', true,
 'Lead hull form development and structural design for our next generation of hybrid-electric coastal vessels.',
 E'As Senior Naval Architect at EUROHULL you own the hydrodynamic and structural concept of vessels from first sketch to class approval.\n\nYou will work alongside production engineers on the slipway, translating CFD studies into steel that actually gets cut, welded and launched.',
 ARRAY['MSc in Naval Architecture or Marine Engineering','7+ years designing commercial or naval steel hulls','Fluency with NAPA, Rhino and CFD toolchains','Experience with class societies (DNV, LR, BV)']),
('certified-hull-welder', 'Certified Hull Welder', 'Production', 'Elefsina Yard, Greece', 'Full-time', 'active', true,
 'Join the plate shop crew building sections for 90m offshore support vessels.',
 E'You will perform MIG/MAG and FCAW welding on heavy structural sections, working from isometric drawings and welding procedure specifications.\n\nOur yard runs two shifts with full PPE provision, on-site canteen and transport from Piraeus.',
 ARRAY['Valid EN ISO 9606-1 certification','3+ years shipyard or heavy fabrication experience','Comfortable working at height and in confined spaces','Basic English or Greek for safety briefings']),
('marine-interior-designer', 'Marine Interior Designer', 'Design', 'Athens, Greece (Hybrid)', 'Contract', 'active', false,
 'Shape crew and guest spaces for explorer yachts where every millimetre and every kilogram counts.',
 E'You will develop interior concepts, material palettes and joinery detailing that survive salt, vibration and SOLAS fire regulations.\n\nThis is a 12-month contract with a strong likelihood of extension into our refit programme.',
 ARRAY['Portfolio of marine, aviation or high-end residential interiors','Working knowledge of IMO FTP Code materials','Advanced Rhino / SolidWorks and rendering skills']),
('yard-operations-coordinator', 'Yard Operations Coordinator', 'Operations', 'Elefsina Yard, Greece', 'Part-time', 'active', false,
 'Keep dry-dock scheduling, subcontractors and material flow moving in sync across three build bays.',
 E'You are the connective tissue between project managers, the plate shop and external subcontractors.\n\nExpect daily walk-downs of the yard, live schedule updates and close work with the HSE team.',
 ARRAY['3+ years in industrial planning or logistics','Confident with MS Project or Primavera','Greek and English fluency']);