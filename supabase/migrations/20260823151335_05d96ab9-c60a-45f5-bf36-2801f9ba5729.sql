CREATE TABLE public.social_posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  job_listing_id uuid REFERENCES public.job_listings(id) ON DELETE CASCADE,
  platform text NOT NULL CHECK (platform IN ('linkedin','facebook','instagram')),
  post_url text,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','success','failed')),
  error_message text,
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT ALL ON public.social_posts TO service_role;

ALTER TABLE public.social_posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role manages social posts"
  ON public.social_posts FOR ALL TO service_role USING (true) WITH CHECK (true);

ALTER TABLE public.job_listings
  ADD COLUMN IF NOT EXISTS posted_to_linkedin boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS posted_to_facebook boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS posted_to_instagram boolean NOT NULL DEFAULT false;

ALTER TABLE public.app_settings
  ADD COLUMN IF NOT EXISTS clamav_api_url text,
  ADD COLUMN IF NOT EXISTS rate_limit_per_day integer NOT NULL DEFAULT 3;