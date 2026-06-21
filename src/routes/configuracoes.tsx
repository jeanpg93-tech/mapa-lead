import { createFileRoute } from "@tanstack/react-router";
import { PageBody, PageHeader } from "@/components/page-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabaseConfigured } from "@/lib/supabase-external";

export const Route = createFileRoute("/configuracoes")({
  head: () => ({ meta: [{ title: "Configurações — MapaLead" }] }),
  component: ConfigPage,
});

function ConfigPage() {
  return (
    <>
      <PageHeader
        title="Configurações"
        description="Conexões, governança e preferências do MapaLead."
      />
      <PageBody>
        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">Supabase externo</CardTitle>
                <Badge variant={supabaseConfigured ? "default" : "outline"}>
                  {supabaseConfigured ? "Conectado" : "Não configurado"}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-muted-foreground">
              <p>
                O MapaLead se conecta ao seu projeto Supabase externo via variáveis de ambiente.
                Crie o projeto no Supabase e preencha o arquivo <code>.env</code>:
              </p>
              <pre className="overflow-auto rounded-md bg-muted p-3 text-xs text-foreground">
{`VITE_SUPABASE_URL=https://SEU-PROJETO.supabase.co
VITE_SUPABASE_ANON_KEY=sua-anon-key-publica`}
              </pre>
              <p>
                Enquanto as credenciais não estão definidas, a aplicação opera com dados fictícios
                de demonstração para validar a experiência.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Governança e privacidade</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-muted-foreground">
              <p>Princípios adotados desde o início:</p>
              <ul className="list-disc space-y-1 pl-5">
                <li>Sem scraping ou coleta automatizada de dados pessoais.</li>
                <li>Sem listas de moradores reais ou CPFs.</li>
                <li>Toda informação possui origem e grau de confiança.</li>
                <li>Contatos exigem base legal e consentimento.</li>
                <li>Opção <strong>não contatar</strong> sempre respeitada.</li>
                <li>Integrações futuras só com fontes legítimas (IBGE, ViaCEP, parceiros etc).</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="text-base">Fases do produto</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-3 text-sm sm:grid-cols-3">
              <Fase n="1" titulo="Protótipo navegável" status="Em andamento" desc="Conceito, navegação, busca territorial, locais, oportunidades, funil, tarefas e contatos com mocks." />
              <Fase n="2" titulo="Persistência Supabase" status="Próxima" desc="Schema, RLS e CRUD real no Supabase externo. Substituição gradual dos mocks." />
              <Fase n="3" titulo="Integrações & mapa" status="Planejada" desc="ViaCEP, IBGE, OSM/Mapbox, dados abertos e parceiros — sempre com governança." />
            </CardContent>
          </Card>
        </div>
      </PageBody>
    </>
  );
}

function Fase({ n, titulo, status, desc }: { n: string; titulo: string; status: string; desc: string }) {
  return (
    <div className="rounded-md border border-border p-4">
      <div className="flex items-center justify-between">
        <span className="text-xs uppercase tracking-wider text-muted-foreground">Fase {n}</span>
        <Badge variant="outline">{status}</Badge>
      </div>
      <p className="mt-2 font-medium text-foreground">{titulo}</p>
      <p className="mt-1 text-xs text-muted-foreground">{desc}</p>
    </div>
  );
}
