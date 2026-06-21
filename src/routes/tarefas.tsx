import { createFileRoute, Link } from "@tanstack/react-router";
import { Download, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { PageBody, PageHeader } from "@/components/page-shell";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import {
  createTarefa,
  deleteTarefa,
  listTarefas,
  STATUS_TAREFA,
  type StatusTarefa,
} from "@/lib/tarefas-api";
import { listLocaisSimples } from "@/lib/oportunidades-api";
import { exportToCsv } from "@/lib/csv-export";

export const Route = createFileRoute("/tarefas")({
  head: () => ({ meta: [{ title: "Tarefas — MapaLead" }] }),
  component: TarefasPage,
});

function TarefasPage() {
  const qc = useQueryClient();
  const { data: tarefas = [], isLoading } = useQuery({ queryKey: ["tarefas"], queryFn: listTarefas });
  const { data: locais = [] } = useQuery({ queryKey: ["locais-simples"], queryFn: listLocaisSimples });
  const [open, setOpen] = useState(false);
  const [titulo, setTitulo] = useState("");
  const [localId, setLocalId] = useState<string>("");
  const [status, setStatus] = useState<StatusTarefa>("Aberta");
  const [responsavel, setResponsavel] = useState("");
  const [prazo, setPrazo] = useState("");

  const create = useMutation({
    mutationFn: () =>
      createTarefa({
        titulo,
        local_id: localId || null,
        status,
        responsavel: responsavel || null,
        prazo: prazo || null,
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["tarefas"] });
      toast.success("Tarefa criada");
      setOpen(false);
      setTitulo(""); setLocalId(""); setStatus("Aberta"); setResponsavel(""); setPrazo("");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const remove = useMutation({
    mutationFn: deleteTarefa,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["tarefas"] });
      toast.success("Tarefa removida");
    },
  });

  return (
    <>
      <PageHeader
        title="Tarefas"
        description="Ações de prospecção: ligações, visitas, atualizações e propostas."
        actions={
          <>
            <Button
              variant="outline"
              disabled={tarefas.length === 0}
              onClick={() =>
                exportToCsv("tarefas", [
                  { header: "Título", accessor: (t) => t.titulo },
                  { header: "Local", accessor: (t) => t.locais?.nome ?? "" },
                  { header: "Status", accessor: (t) => t.status },
                  { header: "Responsável", accessor: (t) => t.responsavel ?? "" },
                  { header: "Prazo", accessor: (t) => t.prazo ?? "" },
                  { header: "Criada em", accessor: (t) => t.created_at },
                ], tarefas)
              }
            >
              <Download className="mr-1 h-4 w-4" /> Exportar CSV
            </Button>
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <Button><Plus className="mr-1 h-4 w-4" /> Nova tarefa</Button>
              </DialogTrigger>
              <DialogContent>
              <DialogHeader><DialogTitle>Nova tarefa</DialogTitle></DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Título</Label>
                  <Input value={titulo} onChange={(e) => setTitulo(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Local (opcional)</Label>
                  <Select value={localId} onValueChange={setLocalId}>
                    <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                    <SelectContent>
                      {locais.map((l) => (
                        <SelectItem key={l.id} value={l.id}>{l.nome}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label>Status</Label>
                    <Select value={status} onValueChange={(v) => setStatus(v as StatusTarefa)}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {STATUS_TAREFA.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Prazo</Label>
                    <Input type="date" value={prazo} onChange={(e) => setPrazo(e.target.value)} />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Responsável</Label>
                  <Input value={responsavel} onChange={(e) => setResponsavel(e.target.value)} />
                </div>
              </div>
              <DialogFooter>
                <Button onClick={() => create.mutate()} disabled={!titulo || create.isPending}>
                  Criar
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          </>
        }
      />
      <PageBody>
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tarefa</TableHead>
                <TableHead>Local</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Responsável</TableHead>
                <TableHead>Prazo</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading && (
                <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground">Carregando...</TableCell></TableRow>
              )}
              {!isLoading && tarefas.length === 0 && (
                <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground">Nenhuma tarefa cadastrada</TableCell></TableRow>
              )}
              {tarefas.map((t) => (
                <TableRow key={t.id}>
                  <TableCell className="font-medium">{t.titulo}</TableCell>
                  <TableCell>
                    {t.locais && (
                      <Link to="/locais/$id" params={{ id: t.locais.id }} className="hover:underline">
                        {t.locais.nome}
                      </Link>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge variant={t.status === "Concluída" ? "secondary" : "outline"}>{t.status}</Badge>
                  </TableCell>
                  <TableCell>{t.responsavel ?? "—"}</TableCell>
                  <TableCell className="text-muted-foreground">{t.prazo ?? "—"}</TableCell>
                  <TableCell>
                    <Button variant="ghost" size="icon" onClick={() => remove.mutate(t.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      </PageBody>
    </>
  );
}
