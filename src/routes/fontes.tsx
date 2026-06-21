import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { PageBody, PageHeader } from "@/components/page-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
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
  listFontes,
  createFonte,
  deleteFonte,
  TIPOS_FONTE,
  STATUS_FONTE,
  type TipoFonte,
  type StatusFonte,
} from "@/lib/fontes-api";

export const Route = createFileRoute("/fontes")({
  head: () => ({ meta: [{ title: "Fontes de Dados — MapaLead" }] }),
  component: FontesPage,
});

function FontesPage() {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const { data: fontes = [], isLoading, error } = useQuery({
    queryKey: ["fontes"],
    queryFn: listFontes,
  });

  const del = useMutation({
    mutationFn: deleteFonte,
    onSuccess: () => {
      toast.success("Fonte removida");
      qc.invalidateQueries({ queryKey: ["fontes"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <>
      <PageHeader
        title="Fontes de Dados"
        description="Toda informação no MapaLead tem origem rastreável. Cadastre suas fontes manuais e integrações."
        actions={
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="mr-1 h-4 w-4" /> Nova fonte
              </Button>
            </DialogTrigger>
            <DialogContent>
              <NovaFonteForm onDone={() => setOpen(false)} />
            </DialogContent>
          </Dialog>
        }
      />
      <PageBody>
        {isLoading && <p className="text-sm text-muted-foreground">Carregando…</p>}
        {error && <p className="text-sm text-destructive">{(error as Error).message}</p>}

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {fontes.map((f) => (
            <Card key={f.id}>
              <CardHeader>
                <div className="flex items-start justify-between gap-2">
                  <CardTitle className="text-base">{f.nome}</CardTitle>
                  <Badge variant={f.status === "Ativa" ? "default" : "outline"}>
                    {f.status}
                  </Badge>
                </div>
                <p className="text-xs uppercase tracking-wider text-muted-foreground">
                  {f.tipo}
                </p>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                {f.descricao && (
                  <p className="text-muted-foreground">{f.descricao}</p>
                )}
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Registros</span>
                  <span className="font-medium text-foreground">{f.registros}</span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-destructive"
                  onClick={() => {
                    if (confirm(`Remover "${f.nome}"?`)) del.mutate(f.id);
                  }}
                >
                  <Trash2 className="mr-1 h-3 w-3" /> Remover
                </Button>
              </CardContent>
            </Card>
          ))}
          {!isLoading && fontes.length === 0 && (
            <Card className="md:col-span-2 xl:col-span-3">
              <CardContent className="p-8 text-center text-sm text-muted-foreground">
                Nenhuma fonte cadastrada. Clique em “Nova fonte” para começar.
              </CardContent>
            </Card>
          )}
        </div>
      </PageBody>
    </>
  );
}

function NovaFonteForm({ onDone }: { onDone: () => void }) {
  const qc = useQueryClient();
  const [nome, setNome] = useState("");
  const [tipo, setTipo] = useState<TipoFonte>("Base manual");
  const [status, setStatus] = useState<StatusFonte>("Ativa");
  const [descricao, setDescricao] = useState("");
  const [registros, setRegistros] = useState<number>(0);

  const create = useMutation({
    mutationFn: createFonte,
    onSuccess: () => {
      toast.success("Fonte criada");
      qc.invalidateQueries({ queryKey: ["fontes"] });
      onDone();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        create.mutate({
          nome,
          tipo,
          status,
          descricao: descricao || null,
          registros,
        });
      }}
      className="space-y-4"
    >
      <DialogHeader>
        <DialogTitle>Nova fonte</DialogTitle>
      </DialogHeader>
      <div className="space-y-2">
        <Label>Nome</Label>
        <Input value={nome} onChange={(e) => setNome(e.target.value)} required />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <Label>Tipo</Label>
          <Select value={tipo} onValueChange={(v) => setTipo(v as TipoFonte)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {TIPOS_FONTE.map((t) => (
                <SelectItem key={t} value={t}>{t}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Status</Label>
          <Select value={status} onValueChange={(v) => setStatus(v as StatusFonte)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {STATUS_FONTE.map((s) => (
                <SelectItem key={s} value={s}>{s}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="space-y-2">
        <Label>Descrição</Label>
        <Textarea value={descricao} onChange={(e) => setDescricao(e.target.value)} />
      </div>
      <div className="space-y-2">
        <Label>Registros</Label>
        <Input
          type="number"
          min={0}
          value={registros}
          onChange={(e) => setRegistros(Number(e.target.value))}
        />
      </div>
      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onDone}>Cancelar</Button>
        <Button type="submit" disabled={create.isPending}>
          {create.isPending ? "Salvando…" : "Salvar"}
        </Button>
      </div>
    </form>
  );
}
