import { createFileRoute, Link } from "@tanstack/react-router";
import { Download, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { PageBody, PageHeader } from "@/components/page-shell";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  createOportunidade,
  deleteOportunidade,
  listLocaisSimples,
  listOportunidades,
  STATUS_OPORTUNIDADE,
  type StatusOportunidade,
} from "@/lib/oportunidades-api";
import { exportToCsv } from "@/lib/csv-export";

export const Route = createFileRoute("/oportunidades")({
  head: () => ({ meta: [{ title: "Oportunidades — MapaLead" }] }),
  component: OportunidadesPage,
});

function OportunidadesPage() {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);

  const { data: ops = [], isLoading, error } = useQuery({
    queryKey: ["oportunidades"],
    queryFn: listOportunidades,
  });

  const remove = useMutation({
    mutationFn: deleteOportunidade,
    onSuccess: () => {
      toast.success("Oportunidade removida");
      qc.invalidateQueries({ queryKey: ["oportunidades"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <>
      <PageHeader
        title="Oportunidades"
        description="Negócios comerciais vinculados a locais ou regiões."
        actions={
          <>
            <Button
              variant="outline"
              disabled={ops.length === 0}
              onClick={() =>
                exportToCsv("oportunidades", [
                  { header: "Título", accessor: (o) => o.titulo },
                  { header: "Local", accessor: (o) => o.locais?.nome ?? "" },
                  { header: "Status", accessor: (o) => o.status },
                  { header: "Responsável", accessor: (o) => o.responsavel ?? "" },
                  { header: "Valor estimado", accessor: (o) => o.valor_estimado ?? "" },
                  { header: "Probabilidade", accessor: (o) => o.probabilidade ?? "" },
                  { header: "Criada em", accessor: (o) => o.created_at },
                ], ops)
              }
            >
              <Download className="mr-1 h-4 w-4" /> Exportar CSV
            </Button>
            <Button variant="outline" asChild>
              <Link to="/funil">Ver funil</Link>
            </Button>
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-1 h-4 w-4" /> Nova oportunidade
                </Button>
              </DialogTrigger>
              <NovaOportunidadeDialog onDone={() => setOpen(false)} />
            </Dialog>
          </>
        }
      />
      <PageBody>
        <Card>
          {error ? (
            <div className="p-6 text-sm text-destructive">
              Erro ao carregar: {(error as Error).message}
            </div>
          ) : isLoading ? (
            <div className="p-6 text-sm text-muted-foreground">Carregando…</div>
          ) : ops.length === 0 ? (
            <div className="p-10 text-center text-sm text-muted-foreground">
              Nenhuma oportunidade cadastrada. Crie a primeira para acompanhar no funil.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Título</TableHead>
                  <TableHead>Local</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Responsável</TableHead>
                  <TableHead>Valor est.</TableHead>
                  <TableHead>Criada em</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {ops.map((o) => (
                  <TableRow key={o.id}>
                    <TableCell className="font-medium">{o.titulo}</TableCell>
                    <TableCell>
                      {o.locais ? (
                        <Link to="/locais/$id" params={{ id: o.locais.id }} className="hover:underline">
                          {o.locais.nome}
                        </Link>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">{o.status}</Badge>
                    </TableCell>
                    <TableCell>{o.responsavel ?? "—"}</TableCell>
                    <TableCell>
                      {o.valor_estimado
                        ? Number(o.valor_estimado).toLocaleString("pt-BR", {
                            style: "currency",
                            currency: "BRL",
                          })
                        : "—"}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {new Date(o.created_at).toLocaleDateString("pt-BR")}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          if (confirm(`Remover "${o.titulo}"?`)) remove.mutate(o.id);
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </Card>
      </PageBody>
    </>
  );
}

function NovaOportunidadeDialog({ onDone }: { onDone: () => void }) {
  const qc = useQueryClient();
  const [titulo, setTitulo] = useState("");
  const [localId, setLocalId] = useState<string>("none");
  const [status, setStatus] = useState<StatusOportunidade>("Novo");
  const [responsavel, setResponsavel] = useState("");
  const [valor, setValor] = useState("");

  const { data: locais = [] } = useQuery({
    queryKey: ["locais", "simples"],
    queryFn: listLocaisSimples,
  });

  const create = useMutation({
    mutationFn: createOportunidade,
    onSuccess: () => {
      toast.success("Oportunidade criada");
      qc.invalidateQueries({ queryKey: ["oportunidades"] });
      onDone();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <DialogContent className="max-w-lg">
      <DialogHeader>
        <DialogTitle>Nova oportunidade</DialogTitle>
      </DialogHeader>
      <form
        className="grid gap-4"
        onSubmit={(e) => {
          e.preventDefault();
          if (!titulo.trim()) return;
          create.mutate({
            titulo: titulo.trim(),
            local_id: localId === "none" ? null : localId,
            status,
            responsavel: responsavel.trim() || null,
            valor_estimado: valor ? Number(valor) : null,
          });
        }}
      >
        <div className="grid gap-2">
          <Label htmlFor="titulo">Título *</Label>
          <Input id="titulo" value={titulo} onChange={(e) => setTitulo(e.target.value)} required />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="grid gap-2">
            <Label>Local</Label>
            <Select value={localId} onValueChange={setLocalId}>
              <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Sem local</SelectItem>
                {locais.map((l) => (
                  <SelectItem key={l.id} value={l.id}>{l.nome}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <Label>Status</Label>
            <Select value={status} onValueChange={(v) => setStatus(v as StatusOportunidade)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {STATUS_OPORTUNIDADE.map((s) => (
                  <SelectItem key={s} value={s}>{s}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="grid gap-2">
            <Label htmlFor="resp">Responsável</Label>
            <Input id="resp" value={responsavel} onChange={(e) => setResponsavel(e.target.value)} />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="valor">Valor estimado (R$)</Label>
            <Input id="valor" type="number" step="0.01" value={valor} onChange={(e) => setValor(e.target.value)} />
          </div>
        </div>
        <DialogFooter>
          <Button type="submit" disabled={create.isPending}>
            {create.isPending ? "Salvando…" : "Criar oportunidade"}
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  );
}
