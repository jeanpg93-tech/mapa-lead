import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { PageBody, PageHeader } from "@/components/page-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  getLocaisPorTipo,
  getOportunidadesPorStatus,
  getTarefasPorStatus,
  getTopLocaisComOportunidades,
  getTarefasAtrasadas,
} from "@/lib/relatorios-api";
import { listOportunidades } from "@/lib/oportunidades-api";
import { STATUS_OPORTUNIDADE } from "@/lib/oportunidades-api";
import { STATUS_TAREFA } from "@/lib/tarefas-api";
import { TIPOS_LOCAL } from "@/lib/locais-api";
import { ArrowRight, TrendingUp, AlertTriangle, MapPin, DollarSign, CheckSquare } from "lucide-react";

export const Route = createFileRoute("/relatorios")({
  head: () => ({
    meta: [
      { title: "Relatórios — MapaLead" },
      { name: "description", content: "Indicadores e relatórios do funil comercial e território no MapaLead." },
    ],
  }),
  component: Relatorios,
});

const COLORS = [
  "hsl(var(--primary))",
  "hsl(var(--accent))",
  "hsl(var(--muted-foreground))",
  "hsl(var(--destructive))",
  "hsl(var(--success))",
  "hsl(var(--warning))",
  "hsl(var(--info))",
];

function ensureAllStatuses<T extends { status: string }>(
  data: T[],
  allStatuses: readonly string[],
  fill: (status: string) => T,
): T[] {
  const map = new Map(data.map((d) => [d.status, d]));
  return allStatuses.map((status) => map.get(status) ?? fill(status));
}

function ensureAllTipos(data: { tipo: string; quantidade: number }[]): { tipo: string; quantidade: number }[] {
  const map = new Map(data.map((d) => [d.tipo, d.quantidade]));
  return TIPOS_LOCAL.map((tipo) => ({ tipo, quantidade: map.get(tipo) ?? 0 }));
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    maximumFractionDigits: 0,
  }).format(value);
}

function Kpi({
  icon: Icon,
  label,
  value,
  hint,
  variant = "default",
}: {
  icon: React.ElementType;
  label: string;
  value: string | number;
  hint?: string;
  variant?: "default" | "warning" | "success";
}) {
  const iconBg =
    variant === "warning"
      ? "bg-destructive/10 text-destructive"
      : variant === "success"
        ? "bg-emerald-500/10 text-emerald-600"
        : "bg-primary/10 text-primary";
  return (
    <Card>
      <CardContent className="flex items-center gap-4 p-5">
        <div className={`flex h-11 w-11 items-center justify-center rounded-md ${iconBg}`}>
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

function Relatorios() {
  const { data: oportPorStatus = [] } = useQuery({
    queryKey: ["relatorios", "oportunidades-por-status"],
    queryFn: getOportunidadesPorStatus,
  });
  const { data: locaisPorTipo = [] } = useQuery({
    queryKey: ["relatorios", "locais-por-tipo"],
    queryFn: getLocaisPorTipo,
  });
  const { data: tarefasPorStatus = [] } = useQuery({
    queryKey: ["relatorios", "tarefas-por-status"],
    queryFn: getTarefasPorStatus,
  });
  const { data: topLocais = [] } = useQuery({
    queryKey: ["relatorios", "top-locais"],
    queryFn: () => getTopLocaisComOportunidades(),
  });
  const { data: tarefasAtrasadas = 0 } = useQuery({
    queryKey: ["relatorios", "tarefas-atrasadas"],
    queryFn: getTarefasAtrasadas,
  });
  const { data: oportunidades = [] } = useQuery({
    queryKey: ["oportunidades"],
    queryFn: listOportunidades,
  });

  const oportunidadesCompletas = ensureAllStatuses(
    oportPorStatus,
    STATUS_OPORTUNIDADE,
    (status) => ({ status, quantidade: 0, valor: 0 }),
  );
  const tarefasCompletas = ensureAllStatuses(
    tarefasPorStatus,
    STATUS_TAREFA,
    (status) => ({ status, quantidade: 0 }),
  );
  const locaisCompletos = ensureAllTipos(locaisPorTipo);

  const valorTotalEmAberto = oportunidades
    .filter((o) => o.status !== "Convertido" && o.status !== "Perdido")
    .reduce((sum, o) => sum + (o.valor_estimado ?? 0), 0);
  const oportunidadesConvertidas = oportunidades.filter((o) => o.status === "Convertido").length;
  const totalOportunidades = oportunidades.length;

  return (
    <>
      <PageHeader
        title="Relatórios"
        description="Indicadores do território e do funil comercial."
        actions={
          <Button asChild variant="outline">
            <Link to="/oportunidades">
              Ver oportunidades <ArrowRight className="ml-1 h-4 w-4" />
            </Link>
          </Button>
        }
      />
      <PageBody>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Kpi icon={DollarSign} label="Valor em aberto" value={formatCurrency(valorTotalEmAberto)} hint="Oportunidades ativas" />
          <Kpi
            icon={TrendingUp}
            label="Taxa de conversão"
            value={totalOportunidades ? `${Math.round((oportunidadesConvertidas / totalOportunidades) * 100)}%` : "0%"}
            hint={`${oportunidadesConvertidas} de ${totalOportunidades} oportunidades`}
            variant="success"
          />
          <Kpi icon={MapPin} label="Locais monitorados" value={locaisCompletos.reduce((s, l) => s + l.quantidade, 0)} />
          <Kpi
            icon={AlertTriangle}
            label="Tarefas atrasadas"
            value={tarefasAtrasadas}
            hint="Prazo anterior a hoje"
            variant="warning"
          />
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-base font-medium">Oportunidades por status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={oportunidadesCompletas} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                    <XAxis dataKey="status" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }} axisLine={false} tickLine={false} />
                    <Tooltip
                      cursor={{ fill: "hsl(var(--muted))" }}
                      contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "var(--radius)" }}
                      formatter={(value: number) => [value, "Quantidade"]}
                    />
                    <Bar dataKey="quantidade" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base font-medium">Locais por tipo</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={locaisCompletos}
                      dataKey="quantidade"
                      nameKey="tipo"
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={90}
                      paddingAngle={3}
                    >
                      {locaisCompletos.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "var(--radius)" }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-2 flex flex-wrap gap-3">
                {locaisCompletos.map((item, idx) => (
                  <div key={item.tipo} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <span
                      className="inline-block h-2.5 w-2.5 rounded-full"
                      style={{ backgroundColor: COLORS[idx % COLORS.length] }}
                    />
                    {item.tipo} ({item.quantidade})
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base font-medium">Tarefas por status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={tarefasCompletas} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                    <XAxis dataKey="status" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }} axisLine={false} tickLine={false} />
                    <Tooltip
                      cursor={{ fill: "hsl(var(--muted))" }}
                      contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "var(--radius)" }}
                      formatter={(value: number) => [value, "Quantidade"]}
                    />
                    <Bar dataKey="quantidade" fill="hsl(var(--accent))" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base font-medium">Top locais com oportunidades em aberto</CardTitle>
            </CardHeader>
            <CardContent>
              {topLocais.length === 0 ? (
                <p className="text-sm text-muted-foreground">Nenhum local com oportunidades em aberto.</p>
              ) : (
                <div className="space-y-4">
                  {topLocais.map((local, idx) => (
                    <div key={local.id} className="flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3 min-w-0">
                        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-medium text-muted-foreground">
                          {idx + 1}
                        </span>
                        <span className="truncate text-sm font-medium text-foreground">{local.nome}</span>
                      </div>
                      <Badge variant="secondary">{local.quantidade} oportunidade{local.quantidade > 1 ? "s" : ""}</Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </PageBody>
    </>
  );
}
