CREATE TABLE IF NOT EXISTS public.api_cache (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  provider text NOT NULL,
  cache_key text NOT NULL,
  request_params jsonb NOT NULL DEFAULT '{}'::jsonb,
  response_data jsonb NOT NULL,
  expires_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (owner_id, provider, cache_key)
);

CREATE TABLE IF NOT EXISTS public.integration_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  provider text NOT NULL,
  action text NOT NULL,
  status text NOT NULL CHECK (status IN ('success', 'error')),
  request_params jsonb NOT NULL DEFAULT '{}'::jsonb,
  error_message text,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.api_cache ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.integration_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Owners manage own api cache" ON public.api_cache;
CREATE POLICY "Owners manage own api cache" ON public.api_cache
  FOR ALL TO authenticated
  USING (auth.uid() = owner_id OR public.has_role(auth.uid(), 'admin'))
  WITH CHECK (auth.uid() = owner_id OR public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Owners view own integration logs" ON public.integration_logs;
CREATE POLICY "Owners view own integration logs" ON public.integration_logs
  FOR SELECT TO authenticated
  USING (auth.uid() = owner_id OR public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Owners insert own integration logs" ON public.integration_logs;
CREATE POLICY "Owners insert own integration logs" ON public.integration_logs
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = owner_id OR public.has_role(auth.uid(), 'admin'));

GRANT SELECT, INSERT, UPDATE, DELETE ON public.api_cache TO authenticated;
GRANT SELECT, INSERT ON public.integration_logs TO authenticated;
GRANT ALL ON public.api_cache TO service_role;
GRANT ALL ON public.integration_logs TO service_role;

DROP TRIGGER IF EXISTS trg_api_cache_updated_at ON public.api_cache;
CREATE TRIGGER trg_api_cache_updated_at BEFORE UPDATE ON public.api_cache
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE INDEX IF NOT EXISTS idx_api_cache_owner_provider ON public.api_cache(owner_id, provider);
CREATE INDEX IF NOT EXISTS idx_api_cache_expires_at ON public.api_cache(expires_at);
CREATE INDEX IF NOT EXISTS idx_integration_logs_owner_provider ON public.integration_logs(owner_id, provider, created_at DESC);
