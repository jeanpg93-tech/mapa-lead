
-- =========================
-- ENUMS
-- =========================
CREATE TYPE public.tipo_local AS ENUM ('Condomínio','Edifício','Bairro','Rua','Região Comercial');
CREATE TYPE public.grau_confianca AS ENUM ('Baixo','Médio','Alto');
CREATE TYPE public.origem_dado AS ENUM ('manual','demo','parceiro','importação','público');
CREATE TYPE public.status_oportunidade AS ENUM ('Novo','Em pesquisa','Potencial identificado','Contato permitido','Em negociação','Convertido','Perdido');
CREATE TYPE public.status_tarefa AS ENUM ('Aberta','Em andamento','Concluída');
CREATE TYPE public.tipo_contato AS ENUM ('Administradora','Síndico','Empresa','Lead manual','Demo');
CREATE TYPE public.consentimento_contato AS ENUM ('Sim','Não','Pendente');
CREATE TYPE public.tipo_fonte AS ENUM ('Base manual','Mock/Demo','API','Parceiro','Importação','Dados públicos');
CREATE TYPE public.status_fonte AS ENUM ('Ativa','Planejada','Pausada');

-- =========================
-- updated_at trigger function
-- =========================
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- =========================
-- LOCAIS
-- =========================
CREATE TABLE public.locais (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  nome text NOT NULL,
  tipo public.tipo_local NOT NULL,
  endereco text,
  bairro text,
  cidade text,
  uf text,
  unidades_estimadas integer,
  observacoes text,
  origem public.origem_dado NOT NULL DEFAULT 'manual',
  confianca public.grau_confianca NOT NULL DEFAULT 'Médio',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.locais TO authenticated;
GRANT ALL ON public.locais TO service_role;
ALTER TABLE public.locais ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Owners manage own locais" ON public.locais
  FOR ALL TO authenticated
  USING (auth.uid() = owner_id)
  WITH CHECK (auth.uid() = owner_id);
CREATE POLICY "Admins manage all locais" ON public.locais
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE TRIGGER trg_locais_updated_at BEFORE UPDATE ON public.locais
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE INDEX idx_locais_owner ON public.locais(owner_id);
CREATE INDEX idx_locais_cidade_bairro ON public.locais(cidade, bairro);

-- =========================
-- OPORTUNIDADES
-- =========================
CREATE TABLE public.oportunidades (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  local_id uuid REFERENCES public.locais(id) ON DELETE SET NULL,
  titulo text NOT NULL,
  status public.status_oportunidade NOT NULL DEFAULT 'Novo',
  responsavel text,
  valor_estimado numeric(14,2),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.oportunidades TO authenticated;
GRANT ALL ON public.oportunidades TO service_role;
ALTER TABLE public.oportunidades ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Owners manage own oportunidades" ON public.oportunidades
  FOR ALL TO authenticated
  USING (auth.uid() = owner_id)
  WITH CHECK (auth.uid() = owner_id);
CREATE POLICY "Admins manage all oportunidades" ON public.oportunidades
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE TRIGGER trg_oportunidades_updated_at BEFORE UPDATE ON public.oportunidades
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE INDEX idx_oportunidades_owner ON public.oportunidades(owner_id);
CREATE INDEX idx_oportunidades_local ON public.oportunidades(local_id);
CREATE INDEX idx_oportunidades_status ON public.oportunidades(status);

-- =========================
-- TAREFAS
-- =========================
CREATE TABLE public.tarefas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  local_id uuid REFERENCES public.locais(id) ON DELETE SET NULL,
  oportunidade_id uuid REFERENCES public.oportunidades(id) ON DELETE SET NULL,
  titulo text NOT NULL,
  status public.status_tarefa NOT NULL DEFAULT 'Aberta',
  responsavel text,
  prazo date,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.tarefas TO authenticated;
GRANT ALL ON public.tarefas TO service_role;
ALTER TABLE public.tarefas ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Owners manage own tarefas" ON public.tarefas
  FOR ALL TO authenticated
  USING (auth.uid() = owner_id)
  WITH CHECK (auth.uid() = owner_id);
CREATE POLICY "Admins manage all tarefas" ON public.tarefas
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE TRIGGER trg_tarefas_updated_at BEFORE UPDATE ON public.tarefas
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE INDEX idx_tarefas_owner ON public.tarefas(owner_id);
CREATE INDEX idx_tarefas_local ON public.tarefas(local_id);

-- =========================
-- CONTATOS
-- =========================
CREATE TABLE public.contatos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  local_id uuid REFERENCES public.locais(id) ON DELETE SET NULL,
  nome text NOT NULL,
  tipo public.tipo_contato NOT NULL,
  email text,
  telefone text,
  origem public.origem_dado NOT NULL DEFAULT 'manual',
  consentimento public.consentimento_contato NOT NULL DEFAULT 'Pendente',
  base_legal text,
  nao_contatar boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.contatos TO authenticated;
GRANT ALL ON public.contatos TO service_role;
ALTER TABLE public.contatos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Owners manage own contatos" ON public.contatos
  FOR ALL TO authenticated
  USING (auth.uid() = owner_id)
  WITH CHECK (auth.uid() = owner_id);
CREATE POLICY "Admins manage all contatos" ON public.contatos
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE TRIGGER trg_contatos_updated_at BEFORE UPDATE ON public.contatos
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE INDEX idx_contatos_owner ON public.contatos(owner_id);
CREATE INDEX idx_contatos_local ON public.contatos(local_id);

-- =========================
-- FONTES
-- =========================
CREATE TABLE public.fontes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  nome text NOT NULL,
  tipo public.tipo_fonte NOT NULL,
  descricao text,
  status public.status_fonte NOT NULL DEFAULT 'Ativa',
  registros integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.fontes TO authenticated;
GRANT ALL ON public.fontes TO service_role;
ALTER TABLE public.fontes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Owners manage own fontes" ON public.fontes
  FOR ALL TO authenticated
  USING (auth.uid() = owner_id)
  WITH CHECK (auth.uid() = owner_id);
CREATE POLICY "Admins manage all fontes" ON public.fontes
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE TRIGGER trg_fontes_updated_at BEFORE UPDATE ON public.fontes
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE INDEX idx_fontes_owner ON public.fontes(owner_id);
