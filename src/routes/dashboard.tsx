import { createFileRoute, Link } from "@tanstack/react-router";
import { Building2, Target, CheckSquare, MapPinned, ArrowRight } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { PageBody, PageHeader } from "@/components/page-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { listLocais } from "@/lib/locais-api";
import { listOportunidades } from "@/lib/oportunidades-api";
import { listTarefas } from "@/lib/tarefas-api";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "Dashboard — MapaLead" },
      { name: "description", content: "Visão geral de locais, oportunidades e tarefas no MapaLead." },
    ],
  }),
  component: Dashboard,
});

function Stat({ icon: Icon, label, value, hint }: { icon: any; label: string; value: string | number; hint?: string }) {
  return (
    <Card>
      <CardContent className="flex items-center gap-4 p-5">
        <div className="flex h-11 w-11 items-center justify-center rounded-md bg-primary/10 text-primary">
          <Icon className="h-5 w-5" />
        </div>
        <div>
          <p className="text-xs uppercase tracking-wider text-muted-foreground">{label}</p>
          <p className="text-2xl font-semibold text-foreground">{value}</p>
          {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
        </div>
      </CardContent>
    </Card>
  );
}

function Dashboard() {
  const { data: locais = [] } = useQuery({ queryKey: ["locais"], queryFn: listLocais });
  const { data: oportunidades = [] } = useQuery({ queryKey: ["oportunidades"], queryFn: listOportunidades });
  const { data: tarefas = [] } = useQuery({ queryKey: ["tarefas"], queryFn: listTarefas });

  const oportAbertas = oportunidades.filter((o) => o.status !== "Convertido" && o.status !== "Perdido").length;
  const tarefasPendentes = tarefas.filter((t) => t.status !== "Concluída").length;
  const regioesMonitoradas = locais.filter((l) => l.tipo === "Bairro" || l.tipo === "Região Comercial").length;
  const recentes = [...oportunidades].slice(0, 5);

  return (
    <>
      <PageHeader
        title="Dashboard"
        description="Inteligência territorial — locais, oportunidades e ações em um só lugar."
        actions={
          <Button asChild>
            <Link to="/buscar">
              Nova busca territorial <ArrowRight className="ml-1 h-4 w-4" />
            </Link>
          </Button>
        }
      />
      <PageBody>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Stat icon={Building2} label="Locais cadastrados" value={locais.length} hint="Condomínios, edifícios, bairros e regiões" />
          <Stat icon={Target} label="Oportunidades abertas" value={oportAbertas} />
          <Stat icon={CheckSquare} label="Tarefas pendentes" value={tarefasPendentes} />
          <Stat icon={MapPinned} label="Regiões monitoradas" value={regioesMonitoradas} />
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-3">
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="text-base">Oportunidades recentes</CardTitle>
            </CardHeader>
            <CardContent>
              {recentes.length === 0 ? (
                <p className="text-sm text-muted-foreground">Nenhuma oportunidade ainda.</p>
              ) : (
                <ul className="divide-y divide-border">
                  {recentes.map((o) => (
                    <li key={o.id} className="flex items-center justify-between gap-3 py-3">
                      <div>
                        <p className="text-sm font-medium text-foreground">{o.titulo}</p>
                        <p className="text-xs text-muted-foreground">{o.locais?.nome ?? "—"}</p>
                      </div>
                      <Badge variant="secondary">{o.status}</Badge>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Atalhos</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-2">
              <Button variant="outline" asChild><Link to="/locais">Ver todos os locais</Link></Button>
              <Button variant="outline" asChild><Link to="/funil">Abrir funil de oportunidades</Link></Button>
              <Button variant="outline" asChild><Link to="/tarefas">Minhas tarefas</Link></Button>
              <Button variant="outline" asChild><Link to="/contatos">Contatos</Link></Button>
            </CardContent>
          </Card>
        </div>
      </PageBody>
    </>
  );
}
