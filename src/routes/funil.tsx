import { createFileRoute } from "@tanstack/react-router";
import { PageBody, PageHeader } from "@/components/page-shell";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { locais, oportunidades, STATUS_OPORTUNIDADE } from "@/lib/mock-data";

export const Route = createFileRoute("/funil")({
  head: () => ({ meta: [{ title: "Funil — MapaLead" }] }),
  component: FunilPage,
});

function FunilPage() {
  return (
    <>
      <PageHeader
        title="Funil de Oportunidades"
        description="Acompanhe oportunidades por etapa do processo comercial."
      />
      <PageBody>
        <div className="grid grid-flow-col auto-cols-[minmax(260px,1fr)] gap-4 overflow-x-auto pb-4">
          {STATUS_OPORTUNIDADE.map((status) => {
            const itens = oportunidades.filter((o) => o.status === status);
            return (
              <div key={status} className="flex flex-col rounded-lg border border-border bg-card">
                <div className="flex items-center justify-between border-b border-border px-3 py-2">
                  <p className="text-sm font-semibold text-foreground">{status}</p>
                  <Badge variant="secondary">{itens.length}</Badge>
                </div>
                <div className="flex flex-col gap-2 p-2">
                  {itens.map((o) => {
                    const local = locais.find((l) => l.id === o.localId);
                    return (
                      <Card key={o.id} className="shadow-none">
                        <CardContent className="p-3">
                          <p className="text-sm font-medium leading-snug text-foreground">{o.titulo}</p>
                          <p className="mt-1 text-xs text-muted-foreground">{local?.nome}</p>
                          <div className="mt-2 flex items-center justify-between text-xs">
                            <span className="text-muted-foreground">{o.responsavel}</span>
                            {o.valorEstimado && (
                              <span className="font-medium text-foreground">
                                {o.valorEstimado.toLocaleString("pt-BR", {
                                  style: "currency",
                                  currency: "BRL",
                                  maximumFractionDigits: 0,
                                })}
                              </span>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                  {itens.length === 0 && (
                    <p className="px-2 py-3 text-xs text-muted-foreground">Sem oportunidades.</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </PageBody>
    </>
  );
}
