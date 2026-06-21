import { createFileRoute, Link } from "@tanstack/react-router";
import { Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { PageBody, PageHeader } from "@/components/page-shell";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
  createLocal,
  deleteLocal,
  listLocais,
  TIPOS_LOCAL,
  GRAUS_CONFIANCA,
  ORIGENS,
  type GrauConfianca,
  type OrigemDado,
  type TipoLocal,
} from "@/lib/locais-api";

export const Route = createFileRoute("/locais")({
  head: () => ({ meta: [{ title: "Locais — MapaLead" }] }),
  component: LocaisPage,
});

function LocaisPage() {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const { data: locais = [], isLoading, error } = useQuery({
    queryKey: ["locais"],
    queryFn: listLocais,
  });

  const remove = useMutation({
    mutationFn: deleteLocal,
    onSuccess: () => {
      toast.success("Local removido");
      qc.invalidateQueries({ queryKey: ["locais"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <>
      <PageHeader
        title="Locais"
        description="Condomínios, edifícios, bairros e regiões cadastrados."
        actions={
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-1 h-4 w-4" /> Novo local
              </Button>
            </DialogTrigger>
            <NovoLocalDialog onDone={() => setOpen(false)} />
          </Dialog>
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
          ) : locais.length === 0 ? (
            <div className="p-10 text-center text-sm text-muted-foreground">
              Nenhum local cadastrado ainda. Clique em <strong>Novo local</strong> para começar.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Endereço</TableHead>
                  <TableHead>Cidade / UF</TableHead>
                  <TableHead>Unidades</TableHead>
                  <TableHead>Confiança</TableHead>
                  <TableHead>Origem</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {locais.map((l) => (
                  <TableRow key={l.id}>
                    <TableCell className="font-medium">
                      <Link to="/locais/$id" params={{ id: l.id }} className="hover:underline">
                        {l.nome}
                      </Link>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{l.tipo}</Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{l.endereco ?? "—"}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {l.cidade ?? "—"}{l.uf ? `/${l.uf}` : ""}
                    </TableCell>
                    <TableCell>{l.unidades_estimadas ?? "—"}</TableCell>
                    <TableCell>
                      <Badge variant="secondary">{l.confianca}</Badge>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">{l.origem}</TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          if (confirm(`Remover "${l.nome}"?`)) remove.mutate(l.id);
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

function NovoLocalDialog({ onDone }: { onDone: () => void }) {
  const qc = useQueryClient();
  const [nome, setNome] = useState("");
  const [tipo, setTipo] = useState<TipoLocal>("Condomínio");
  const [endereco, setEndereco] = useState("");
  const [bairro, setBairro] = useState("");
  const [cidade, setCidade] = useState("");
  const [uf, setUf] = useState("");
  const [unidades, setUnidades] = useState("");
  const [observacoes, setObservacoes] = useState("");
  const [origem, setOrigem] = useState<OrigemDado>("manual");
  const [confianca, setConfianca] = useState<GrauConfianca>("Médio");

  const create = useMutation({
    mutationFn: createLocal,
    onSuccess: () => {
      toast.success("Local criado");
      qc.invalidateQueries({ queryKey: ["locais"] });
      onDone();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <DialogContent className="max-w-lg">
      <DialogHeader>
        <DialogTitle>Novo local</DialogTitle>
      </DialogHeader>
      <form
        className="grid gap-4"
        onSubmit={(e) => {
          e.preventDefault();
          if (!nome.trim()) return;
          create.mutate({
            nome: nome.trim(),
            tipo,
            endereco: endereco.trim() || null,
            bairro: bairro.trim() || null,
            cidade: cidade.trim() || null,
            uf: uf.trim() || null,
            unidades_estimadas: unidades ? Number(unidades) : null,
            observacoes: observacoes.trim() || null,
            origem,
            confianca,
          });
        }}
      >
        <div className="grid gap-2">
          <Label htmlFor="nome">Nome *</Label>
          <Input id="nome" value={nome} onChange={(e) => setNome(e.target.value)} required />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="grid gap-2">
            <Label>Tipo</Label>
            <Select value={tipo} onValueChange={(v) => setTipo(v as TipoLocal)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {TIPOS_LOCAL.map((t) => (
                  <SelectItem key={t} value={t}>{t}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <Label>Confiança</Label>
            <Select value={confianca} onValueChange={(v) => setConfianca(v as GrauConfianca)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {GRAUS_CONFIANCA.map((t) => (
                  <SelectItem key={t} value={t}>{t}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="grid gap-2">
          <Label htmlFor="endereco">Endereço</Label>
          <Input id="endereco" value={endereco} onChange={(e) => setEndereco(e.target.value)} />
        </div>
        <div className="grid grid-cols-3 gap-3">
          <div className="grid gap-2">
            <Label htmlFor="bairro">Bairro</Label>
            <Input id="bairro" value={bairro} onChange={(e) => setBairro(e.target.value)} />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="cidade">Cidade</Label>
            <Input id="cidade" value={cidade} onChange={(e) => setCidade(e.target.value)} />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="uf">UF</Label>
            <Input id="uf" maxLength={2} value={uf} onChange={(e) => setUf(e.target.value.toUpperCase())} />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="grid gap-2">
            <Label htmlFor="unidades">Unidades estimadas</Label>
            <Input id="unidades" type="number" value={unidades} onChange={(e) => setUnidades(e.target.value)} />
          </div>
          <div className="grid gap-2">
            <Label>Origem do dado</Label>
            <Select value={origem} onValueChange={(v) => setOrigem(v as OrigemDado)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {ORIGENS.map((t) => (
                  <SelectItem key={t} value={t}>{t}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="grid gap-2">
          <Label htmlFor="obs">Observações</Label>
          <Textarea id="obs" value={observacoes} onChange={(e) => setObservacoes(e.target.value)} rows={3} />
        </div>
        <DialogFooter>
          <Button type="submit" disabled={create.isPending}>
            {create.isPending ? "Salvando…" : "Criar local"}
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  );
}
