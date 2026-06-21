import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { PageBody, PageHeader } from "@/components/page-shell";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  listOportunidades,
  STATUS_OPORTUNIDADE,
  updateOportunidadeStatus,
  type OportunidadeComLocal,
  type StatusOportunidade,
} from "@/lib/oportunidades-api";

export const Route = createFileRoute("/funil")({
  head: () => ({ meta: [{ title: "Funil — MapaLead" }] }),
  component: FunilPage,
});

function FunilPage() {
  const qc = useQueryClient();
  const [dragOver, setDragOver] = useState<StatusOportunidade | null>(null);

  const { data: ops = [], isLoading, error } = useQuery({
    queryKey: ["oportunidades"],
    queryFn: listOportunidades,
  });

  const move = useMutation({
    mutationFn: ({ id, status }: { id: string; status: StatusOportunidade }) =>
      updateOportunidadeStatus(id, status),
    onMutate: async ({ id, status }) => {
      await qc.cancelQueries({ queryKey: ["oportunidades"] });
      const prev = qc.getQueryData<OportunidadeComLocal[]>(["oportunidades"]);
      qc.setQueryData<OportunidadeComLocal[]>(["oportunidades"], (old = []) =>
        old.map((o) => (o.id === id ? { ...o, status } : o)),
      );
      return { prev };
    },
    onError: (e: Error, _vars, ctx) => {
      if (ctx?.prev) qc.setQueryData(["oportunidades"], ctx.prev);
      toast.error(e.message);
    },
    onSettled: () => qc.invalidateQueries({ queryKey: ["oportunidades"] }),
  });

  if (error) {
    return (
      <PageBody>
        <p className="text-sm text-destructive">Erro: {(error as Error).message}</p>
      </PageBody>
    );
  }

  return (
    <>
      <PageHeader
        title="Funil de Oportunidades"
        description="Arraste cards entre colunas para mudar o status."
      />
      <PageBody>
        {isLoading ? (
          <p className="text-sm text-muted-foreground">Carregando…</p>
        ) : (
          <div className="grid grid-flow-col auto-cols-[minmax(260px,1fr)] gap-4 overflow-x-auto pb-4">
            {STATUS_OPORTUNIDADE.map((status) => {
              const itens = ops.filter((o) => o.status === status);
              const isOver = dragOver === status;
              return (
                <div
                  key={status}
                  onDragOver={(e) => {
                    e.preventDefault();
                    setDragOver(status);
                  }}
                  onDragLeave={() => setDragOver((s) => (s === status ? null : s))}
                  onDrop={(e) => {
                    e.preventDefault();
                    const id = e.dataTransfer.getData("text/oportunidade-id");
                    const fromStatus = e.dataTransfer.getData("text/oportunidade-status");
                    setDragOver(null);
                    if (id && fromStatus !== status) {
                      move.mutate({ id, status });
                    }
                  }}
                  className={`flex flex-col rounded-lg border bg-card transition-colors ${
                    isOver ? "border-primary bg-primary/5" : "border-border"
                  }`}
                >
                  <div className="flex items-center justify-between border-b border-border px-3 py-2">
                    <p className="text-sm font-semibold text-foreground">{status}</p>
                    <Badge variant="secondary">{itens.length}</Badge>
                  </div>
                  <div className="flex min-h-[80px] flex-col gap-2 p-2">
                    {itens.map((o) => (
                      <Card
                        key={o.id}
                        draggable
                        onDragStart={(e) => {
                          e.dataTransfer.setData("text/oportunidade-id", o.id);
                          e.dataTransfer.setData("text/oportunidade-status", o.status);
                          e.dataTransfer.effectAllowed = "move";
                        }}
                        className="cursor-grab shadow-none active:cursor-grabbing"
                      >
                        <CardContent className="p-3">
                          <p className="text-sm font-medium leading-snug text-foreground">{o.titulo}</p>
                          <p className="mt-1 text-xs text-muted-foreground">{o.locais?.nome ?? "—"}</p>
                          <div className="mt-2 flex items-center justify-between text-xs">
                            <span className="text-muted-foreground">{o.responsavel ?? "—"}</span>
                            {o.valor_estimado && (
                              <span className="font-medium text-foreground">
                                {Number(o.valor_estimado).toLocaleString("pt-BR", {
                                  style: "currency",
                                  currency: "BRL",
                                  maximumFractionDigits: 0,
                                })}
                              </span>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                    {itens.length === 0 && (
                      <p className="px-2 py-3 text-xs text-muted-foreground">Sem oportunidades.</p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </PageBody>
    </>
  );
}
