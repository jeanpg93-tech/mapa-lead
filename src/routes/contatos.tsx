import { createFileRoute } from "@tanstack/react-router";
import { Download, ShieldCheck, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { PageBody, PageHeader } from "@/components/page-shell";
import { Card, CardContent } from "@/components/ui/card";
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
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import {
  CONSENTIMENTOS,
  ORIGENS,
  TIPOS_CONTATO,
  createContato,
  deleteContato,
  listContatos,
  type Consentimento,
  type OrigemDado,
  type TipoContato,
} from "@/lib/contatos-api";
import { exportToCsv } from "@/lib/csv-export";

export const Route = createFileRoute("/contatos")({
  head: () => ({ meta: [{ title: "Contatos — MapaLead" }] }),
  component: ContatosPage,
});

function ContatosPage() {
  const qc = useQueryClient();
  const { data: contatos = [], isLoading } = useQuery({ queryKey: ["contatos"], queryFn: listContatos });
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    nome: "",
    tipo: "Lead manual" as TipoContato,
    email: "",
    telefone: "",
    origem: "manual" as OrigemDado,
    consentimento: "Pendente" as Consentimento,
    base_legal: "",
    nao_contatar: false,
  });

  const create = useMutation({
    mutationFn: () =>
      createContato({
        nome: form.nome,
        tipo: form.tipo,
        email: form.email || null,
        telefone: form.telefone || null,
        origem: form.origem,
        consentimento: form.consentimento,
        base_legal: form.base_legal || null,
        nao_contatar: form.nao_contatar,
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["contatos"] });
      toast.success("Contato cadastrado");
      setOpen(false);
      setForm({
        nome: "", tipo: "Lead manual", email: "", telefone: "",
        origem: "manual", consentimento: "Pendente", base_legal: "", nao_contatar: false,
      });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const remove = useMutation({
    mutationFn: deleteContato,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["contatos"] });
      toast.success("Contato removido");
    },
  });

  return (
    <>
      <PageHeader
        title="Contatos"
        description="Apenas contatos legítimos: administradoras, síndicos, empresas e leads cadastrados com base legal."
        actions={
          <>
            <Button
              variant="outline"
              disabled={contatos.length === 0}
              onClick={() =>
                exportToCsv("contatos", [
                  { header: "Nome", accessor: (c) => c.nome },
                  { header: "Tipo", accessor: (c) => c.tipo },
                  { header: "Email", accessor: (c) => c.email ?? "" },
                  { header: "Telefone", accessor: (c) => c.telefone ?? "" },
                  { header: "Origem", accessor: (c) => c.origem },
                  { header: "Consentimento", accessor: (c) => c.consentimento },
                  { header: "Base legal", accessor: (c) => c.base_legal ?? "" },
                  { header: "Não contatar", accessor: (c) => (c.nao_contatar ? "Sim" : "Não") },
                  { header: "Criado em", accessor: (c) => c.created_at },
                ], contatos)
              }
            >
              <Download className="mr-1 h-4 w-4" /> Exportar CSV
            </Button>
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <Button><Plus className="mr-1 h-4 w-4" /> Novo contato</Button>
              </DialogTrigger>
              <DialogContent className="max-w-lg">
              <DialogHeader><DialogTitle>Novo contato</DialogTitle></DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Nome</Label>
                  <Input value={form.nome} onChange={(e) => setForm({ ...form, nome: e.target.value })} />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label>Tipo</Label>
                    <Select value={form.tipo} onValueChange={(v) => setForm({ ...form, tipo: v as TipoContato })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {TIPOS_CONTATO.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Origem</Label>
                    <Select value={form.origem} onValueChange={(v) => setForm({ ...form, origem: v as OrigemDado })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {ORIGENS.map((o) => <SelectItem key={o} value={o}>{o}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label>E-mail</Label>
                    <Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
                  </div>
                  <div className="space-y-2">
                    <Label>Telefone</Label>
                    <Input value={form.telefone} onChange={(e) => setForm({ ...form, telefone: e.target.value })} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label>Consentimento</Label>
                    <Select value={form.consentimento} onValueChange={(v) => setForm({ ...form, consentimento: v as Consentimento })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {CONSENTIMENTOS.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Base legal (LGPD)</Label>
                    <Input value={form.base_legal} onChange={(e) => setForm({ ...form, base_legal: e.target.value })} placeholder="Ex: Legítimo interesse" />
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Checkbox id="nao-contatar" checked={form.nao_contatar} onCheckedChange={(v) => setForm({ ...form, nao_contatar: !!v })} />
                  <Label htmlFor="nao-contatar">Marcar como "não contatar"</Label>
                </div>
              </div>
              <DialogFooter>
                <Button onClick={() => create.mutate()} disabled={!form.nome || create.isPending}>Cadastrar</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          </>
        }
      />
      <PageBody>
        <Card className="mb-6 border-accent/40 bg-accent/10">
          <CardContent className="flex items-start gap-3 p-4 text-sm">
            <ShieldCheck className="mt-0.5 h-4 w-4 text-foreground" />
            <div className="text-foreground">
              <p className="font-medium">Privacy-first · LGPD</p>
              <p className="text-muted-foreground">
                O MapaLead não importa listas de moradores nem coleta dados sensíveis. Cadastre
                apenas contatos com origem clara, base legal definida e consentimento adequado.
                Sempre respeite a opção <strong>não contatar</strong>.
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Contato</TableHead>
                <TableHead>Origem</TableHead>
                <TableHead>Base legal</TableHead>
                <TableHead>Consentimento</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading && (
                <TableRow><TableCell colSpan={7} className="text-center text-muted-foreground">Carregando...</TableCell></TableRow>
              )}
              {!isLoading && contatos.length === 0 && (
                <TableRow><TableCell colSpan={7} className="text-center text-muted-foreground">Nenhum contato cadastrado</TableCell></TableRow>
              )}
              {contatos.map((c) => (
                <TableRow key={c.id} className={c.nao_contatar ? "opacity-60" : ""}>
                  <TableCell className="font-medium">{c.nome}</TableCell>
                  <TableCell><Badge variant="outline">{c.tipo}</Badge></TableCell>
                  <TableCell className="text-muted-foreground">{c.email ?? c.telefone ?? "—"}</TableCell>
                  <TableCell><Badge variant="secondary">{c.origem}</Badge></TableCell>
                  <TableCell className="text-muted-foreground">{c.base_legal ?? "—"}</TableCell>
                  <TableCell>
                    {c.nao_contatar ? (
                      <Badge variant="destructive">Não contatar</Badge>
                    ) : (
                      <Badge variant="secondary">{c.consentimento}</Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <Button variant="ghost" size="icon" onClick={() => remove.mutate(c.id)}>
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
