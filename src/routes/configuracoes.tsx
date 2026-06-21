import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { PageBody, PageHeader } from "@/components/page-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/configuracoes")({
  head: () => ({ meta: [{ title: "Configurações — MapaLead" }] }),
  component: ConfigPage,
});

type SessionUser = { id: string; email: string | null; created_at: string };

function ConfigPage() {
  const [user, setUser] = useState<SessionUser | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) {
        setUser({
          id: data.user.id,
          email: data.user.email ?? null,
          created_at: data.user.created_at,
        });
      }
    });
  }, []);

  const { data: roles = [] } = useQuery({
    queryKey: ["user_roles", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user!.id);
      if (error) throw error;
      return data.map((r) => r.role);
    },
  });

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) toast.error(error.message);
    else window.location.href = "/auth";
  };

  return (
    <>
      <PageHeader
        title="Configurações"
        description="Sua conta, governança e preferências do MapaLead."
      />
      <PageBody>
        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">Sua conta</CardTitle>
                <Badge variant="default">Conectado</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              {user ? (
                <>
                  <Info label="Email" value={user.email ?? "—"} />
                  <Info label="ID do usuário" value={user.id} mono />
                  <Info
                    label="Conta criada em"
                    value={new Date(user.created_at).toLocaleString("pt-BR")}
                  />
                  <div>
                    <p className="text-xs uppercase tracking-wider text-muted-foreground">
                      Papéis
                    </p>
                    <div className="mt-1 flex flex-wrap gap-1">
                      {roles.length === 0 ? (
                        <Badge variant="outline">user (padrão)</Badge>
                      ) : (
                        roles.map((r) => (
                          <Badge key={r} variant="secondary">
                            {r}
                          </Badge>
                        ))
                      )}
                    </div>
                  </div>
                  <Button variant="outline" size="sm" onClick={signOut}>
                    Sair da conta
                  </Button>
                </>
              ) : (
                <p className="text-muted-foreground">Carregando sessão…</p>
              )}
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
                <li>
                  Opção <strong>não contatar</strong> sempre respeitada.
                </li>
                <li>
                  Dados isolados por usuário via RLS (Row Level Security) do Supabase.
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="text-base">Fases do produto</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-3 text-sm sm:grid-cols-3">
              <Fase
                n="1"
                titulo="Protótipo navegável"
                status="Concluída"
                desc="Conceito, navegação, busca, locais, oportunidades, funil, tarefas, contatos e fontes."
              />
              <Fase
                n="2"
                titulo="Persistência Supabase"
                status="Concluída"
                desc="Schema, RLS, CRUD real e autenticação. Todos os módulos com dados reais."
              />
              <Fase
                n="3"
                titulo="Integrações & mapa"
                status="Próxima"
                desc="ViaCEP, IBGE, OSM/Mapbox, dados abertos e parceiros — sempre com governança."
              />
            </CardContent>
          </Card>
        </div>
      </PageBody>
    </>
  );
}

function Info({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div>
      <p className="text-xs uppercase tracking-wider text-muted-foreground">{label}</p>
      <p className={`mt-1 text-sm text-foreground ${mono ? "font-mono text-xs" : ""}`}>
        {value}
      </p>
    </div>
  );
}

function Fase({
  n,
  titulo,
  status,
  desc,
}: {
  n: string;
  titulo: string;
  status: string;
  desc: string;
}) {
  return (
    <div className="rounded-md border border-border p-4">
      <div className="flex items-center justify-between">
        <span className="text-xs uppercase tracking-wider text-muted-foreground">
          Fase {n}
        </span>
        <Badge variant="outline">{status}</Badge>
      </div>
      <p className="mt-2 font-medium text-foreground">{titulo}</p>
      <p className="mt-1 text-xs text-muted-foreground">{desc}</p>
    </div>
  );
}
