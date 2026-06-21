import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, Building2, MapPin, ShieldCheck } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { PageBody, PageHeader } from "@/components/page-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { getLocalById } from "@/lib/locais-api";

export const Route = createFileRoute("/locais/$id")({
  head: () => ({ meta: [{ title: "Local — MapaLead" }] }),
  notFoundComponent: () => (
    <div className="p-8 text-sm text-muted-foreground">Local não encontrado.</div>
  ),
  errorComponent: ({ error }) => (
    <div className="p-8 text-sm text-destructive">Erro ao carregar local: {error.message}</div>
  ),
  component: DetalheLocal,
});

function DetalheLocal() {
  const { id } = Route.useParams();

  const { data: local, isLoading } = useQuery({
    queryKey: ["locais", id],
    queryFn: () => getLocalById(id),
  });

  const { data: ops = [] } = useQuery({
    queryKey: ["oportunidades", { localId: id }],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("oportunidades")
        .select("*")
        .eq("local_id", id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });

  const { data: tks = [] } = useQuery({
    queryKey: ["tarefas", { localId: id }],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("tarefas")
        .select("*")
        .eq("local_id", id)
        .order("prazo", { ascending: true });
      if (error) throw error;
      return data ?? [];
    },
  });

  const { data: cts = [] } = useQuery({
    queryKey: ["contatos", { localId: id }],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("contatos")
        .select("*")
        .eq("local_id", id)
        .order("nome");
      if (error) throw error;
      return data ?? [];
    },
  });

  if (isLoading) {
    return <div className="p-8 text-sm text-muted-foreground">Carregando…</div>;
  }
  if (!local) {
    return <div className="p-8 text-sm text-muted-foreground">Local não encontrado.</div>;
  }

  const atualizadoEm = new Date(local.updated_at).toLocaleDateString("pt-BR");

  return (
    <>
      <PageHeader
        title={local.nome}
        description={`${local.endereco ? local.endereco + " · " : ""}${local.bairro ?? ""}${local.cidade ? `, ${local.cidade}` : ""}${local.uf ? `/${local.uf}` : ""}`}
        actions={
          <Button variant="outline" asChild>
            <Link to="/locais">
              <ArrowLeft className="mr-1 h-4 w-4" /> Voltar
            </Link>
          </Button>
        }
      />
      <PageBody>
        <div className="grid gap-6 lg:grid-cols-3">
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Building2 className="h-4 w-4" /> Dados do local
              </CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2">
              <Info label="Tipo" value={local.tipo} />
              <Info label="Bairro" value={local.bairro ?? "—"} />
              <Info label="Cidade" value={`${local.cidade ?? "—"}${local.uf ? `/${local.uf}` : ""}`} />
              <Info label="Unidades estimadas" value={local.unidades_estimadas?.toString() ?? "—"} />
              <Info label="Origem do dado" value={local.origem} />
              <Info label="Grau de confiança" value={local.confianca} />
              <div className="sm:col-span-2">
                <p className="text-xs uppercase tracking-wider text-muted-foreground">Observações</p>
                <p className="mt-1 text-sm text-foreground">{local.observacoes ?? "—"}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <ShieldCheck className="h-4 w-4" /> Governança
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <p className="text-muted-foreground">
                Este local segue as diretrizes de privacidade do MapaLead. Dados pessoais só são
                exibidos quando há contato cadastrado de forma legítima.
              </p>
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-primary" />
                <span>Atualizado em {atualizadoEm}</span>
              </div>
              <Badge variant="secondary">LGPD · privacy-first</Badge>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="oportunidades" className="mt-8">
          <TabsList>
            <TabsTrigger value="oportunidades">Oportunidades ({ops.length})</TabsTrigger>
            <TabsTrigger value="tarefas">Tarefas ({tks.length})</TabsTrigger>
            <TabsTrigger value="contatos">Contatos ({cts.length})</TabsTrigger>
            <TabsTrigger value="historico">Histórico</TabsTrigger>
          </TabsList>

          <TabsContent value="oportunidades" className="mt-4">
            <Card>
              <CardContent className="p-0">
                <ul className="divide-y divide-border">
                  {ops.length === 0 && (
                    <li className="p-4 text-sm text-muted-foreground">Nenhuma oportunidade vinculada.</li>
                  )}
                  {ops.map((o) => (
                    <li key={o.id} className="flex items-center justify-between p-4">
                      <div>
                        <p className="text-sm font-medium">{o.titulo}</p>
                        <p className="text-xs text-muted-foreground">
                          {o.responsavel ?? "—"} · criada em {new Date(o.created_at).toLocaleDateString("pt-BR")}
                        </p>
                      </div>
                      <Badge>{o.status}</Badge>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="tarefas" className="mt-4">
            <Card>
              <CardContent className="p-0">
                <ul className="divide-y divide-border">
                  {tks.length === 0 && (
                    <li className="p-4 text-sm text-muted-foreground">Sem tarefas.</li>
                  )}
                  {tks.map((t) => (
                    <li key={t.id} className="flex items-center justify-between p-4">
                      <div>
                        <p className="text-sm font-medium">{t.titulo}</p>
                        <p className="text-xs text-muted-foreground">
                          {t.responsavel ?? "—"} · prazo {t.prazo ?? "—"}
                        </p>
                      </div>
                      <Badge variant="outline">{t.status}</Badge>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="contatos" className="mt-4">
            <Card>
              <CardContent className="p-4 text-sm text-muted-foreground">
                {cts.length === 0 ? (
                  <p>Nenhum contato vinculado a este local. Cadastre apenas contatos com base legal e consentimento.</p>
                ) : (
                  <ul className="divide-y divide-border">
                    {cts.map((c) => (
                      <li key={c.id} className="flex items-center justify-between py-3">
                        <div>
                          <p className="font-medium text-foreground">{c.nome}</p>
                          <p className="text-xs">{c.tipo} · base legal: {c.base_legal ?? "—"}</p>
                        </div>
                        <Badge variant={c.nao_contatar ? "destructive" : "secondary"}>
                          {c.nao_contatar ? "Não contatar" : `Consentimento: ${c.consentimento}`}
                        </Badge>
                      </li>
                    ))}
                  </ul>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="historico" className="mt-4">
            <Card>
              <CardContent className="p-4 text-sm text-muted-foreground">
                Histórico de ações aparecerá aqui (cadastro, edições, contatos realizados, mudanças
                de status). Ainda não implementado neste protótipo.
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </PageBody>
    </>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs uppercase tracking-wider text-muted-foreground">{label}</p>
      <p className="mt-1 text-sm text-foreground">{value}</p>
    </div>
  );
}
