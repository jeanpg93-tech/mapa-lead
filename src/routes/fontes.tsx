import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Building2, Database, FileSearch, MapPin, Plus, ShieldCheck, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { PageBody, PageHeader } from "@/components/page-shell";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
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
import {
  buscarPrediosOverpass,
  buscarViaCepPorEndereco,
  consultarBrasilApiCep,
  consultarBrasilApiCnpj,
  consultarViaCep,
  geocodificarNominatim,
  listarEstadosIBGE,
  listarMunicipiosPorUF,
  type IntegrationResult,
} from "@/lib/integrations-api";
import type { Json } from "@/integrations/supabase/types";

export const Route = createFileRoute("/fontes")({
  head: () => ({ meta: [{ title: "Fontes de Dados — MapaLead" }] }),
  component: FontesPage,
});

const apiCards = [
  {
    name: "ViaCEP",
    use: "CEP e busca de logradouros por UF/cidade/rua.",
    status: "Pronta para teste",
  },
  {
    name: "BrasilAPI",
    use: "CEP e CNPJ público para identificar empresas, administradoras e condomínios com CNPJ.",
    status: "Pronta para teste",
  },
  {
    name: "IBGE Localidades",
    use: "Estados, municípios e estrutura territorial oficial.",
    status: "Pronta para teste",
  },
  {
    name: "OpenStreetMap Nominatim",
    use: "Geocodificação de endereços, bairros, condomínios e pontos de referência.",
    status: "Uso moderado",
  },
  {
    name: "OpenStreetMap Overpass",
    use: "Leitura de prédios e objetos mapeados dentro de uma área geográfica.",
    status: "Uso moderado",
  },
];

function FontesPage() {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [result, setResult] = useState<IntegrationResult<Json> | null>(null);
  const [loadingAction, setLoadingAction] = useState<string | null>(null);

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

  async function runIntegration(label: string, fn: () => Promise<IntegrationResult<Json>>) {
    setLoadingAction(label);
    try {
      const response = await fn();
      setResult(response);
      toast.success(response.cached ? "Resultado recuperado do cache" : "Consulta concluída");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Não foi possível consultar a API");
    } finally {
      setLoadingAction(null);
    }
  }

  return (
    <>
      <PageHeader
        title="Fontes de Dados"
        description="Teste APIs públicas, registre fontes manuais e mantenha rastreabilidade antes de automatizar importações."
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
        <Alert>
          <ShieldCheck className="h-4 w-4" />
          <AlertTitle>Validação privacy-first</AlertTitle>
          <AlertDescription>
            Esta etapa consulta somente fontes públicas e dados territoriais. Não há coleta automática de moradores,
            CPF ou listas pessoais. As respostas ficam em cache por usuário para reduzir chamadas nas APIs gratuitas.
          </AlertDescription>
        </Alert>

        <div className="grid gap-4 xl:grid-cols-[minmax(0,1.2fr)_minmax(360px,0.8fr)]">
          <ApiWorkspace loadingAction={loadingAction} onRun={runIntegration} />
          <ResultPanel result={result} />
        </div>

        <section className="space-y-3">
          <div>
            <h2 className="text-lg font-semibold">Fontes planejadas</h2>
            <p className="text-sm text-muted-foreground">
              Use esta área para documentar bases, parceiros e importações que entram no MapaLead.
            </p>
          </div>

          {isLoading && <p className="text-sm text-muted-foreground">Carregando…</p>}
          {error && <p className="text-sm text-destructive">{(error as Error).message}</p>}

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {fontes.map((f) => (
              <Card key={f.id}>
                <CardHeader>
                  <div className="flex items-start justify-between gap-2">
                    <CardTitle className="text-base">{f.nome}</CardTitle>
                    <Badge variant={f.status === "Ativa" ? "default" : "outline"}>{f.status}</Badge>
                  </div>
                  <p className="text-xs uppercase tracking-wider text-muted-foreground">{f.tipo}</p>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                  {f.descricao && <p className="text-muted-foreground">{f.descricao}</p>}
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
        </section>
      </PageBody>
    </>
  );
}

function ApiWorkspace({
  loadingAction,
  onRun,
}: {
  loadingAction: string | null;
  onRun: (label: string, fn: () => Promise<IntegrationResult<Json>>) => void;
}) {
  const [cep, setCep] = useState("");
  const [uf, setUf] = useState("SP");
  const [cidade, setCidade] = useState("");
  const [logradouro, setLogradouro] = useState("");
  const [cnpj, setCnpj] = useState("");
  const [ibgeUf, setIbgeUf] = useState("SP");
  const [geoQuery, setGeoQuery] = useState("");
  const [bbox, setBbox] = useState({ south: "-23.570", west: "-46.665", north: "-23.555", east: "-46.645" });

  const pending = (label: string) => loadingAction === label;

  return (
    <div className="space-y-4">
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {apiCards.map((api) => (
          <Card key={api.name}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">{api.name}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <p className="text-muted-foreground">{api.use}</p>
              <Badge variant="outline">{api.status}</Badge>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <MapPin className="h-4 w-4" /> Endereços e CEPs
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-3 md:grid-cols-[1fr_auto_auto]">
            <div className="space-y-2">
              <Label>CEP</Label>
              <Input placeholder="01001000" value={cep} onChange={(e) => setCep(e.target.value)} />
            </div>
            <Button className="self-end" disabled={!!loadingAction} onClick={() => onRun("viacep-cep", () => consultarViaCep(cep))}>
              {pending("viacep-cep") ? "Consultando…" : "ViaCEP"}
            </Button>
            <Button className="self-end" variant="outline" disabled={!!loadingAction} onClick={() => onRun("brasilapi-cep", () => consultarBrasilApiCep(cep))}>
              {pending("brasilapi-cep") ? "Consultando…" : "BrasilAPI"}
            </Button>
          </div>

          <Separator />

          <div className="grid gap-3 md:grid-cols-[90px_1fr_1fr_auto]">
            <div className="space-y-2">
              <Label>UF</Label>
              <Input value={uf} onChange={(e) => setUf(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Cidade</Label>
              <Input value={cidade} onChange={(e) => setCidade(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Logradouro</Label>
              <Input value={logradouro} onChange={(e) => setLogradouro(e.target.value)} />
            </div>
            <Button className="self-end" disabled={!!loadingAction} onClick={() => onRun("viacep-endereco", () => buscarViaCepPorEndereco(uf, cidade, logradouro))}>
              {pending("viacep-endereco") ? "Buscando…" : "Buscar"}
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <FileSearch className="h-4 w-4" /> CNPJ público
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Útil para administradoras, empresas locais e condomínios com CNPJ cadastrado publicamente.
            </p>
            <div className="grid gap-3 md:grid-cols-[1fr_auto]">
              <Input placeholder="00.000.000/0001-00" value={cnpj} onChange={(e) => setCnpj(e.target.value)} />
              <Button disabled={!!loadingAction} onClick={() => onRun("brasilapi-cnpj", () => consultarBrasilApiCnpj(cnpj))}>
                {pending("brasilapi-cnpj") ? "Consultando…" : "Consultar"}
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Database className="h-4 w-4" /> IBGE Localidades
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Base oficial para padronizar UF, município e estrutura territorial.
            </p>
            <div className="grid gap-3 md:grid-cols-[90px_1fr_auto]">
              <Input value={ibgeUf} onChange={(e) => setIbgeUf(e.target.value)} />
              <Button variant="outline" disabled={!!loadingAction} onClick={() => onRun("ibge-estados", listarEstadosIBGE)}>
                {pending("ibge-estados") ? "Carregando…" : "Estados"}
              </Button>
              <Button disabled={!!loadingAction} onClick={() => onRun("ibge-municipios", () => listarMunicipiosPorUF(ibgeUf))}>
                {pending("ibge-municipios") ? "Carregando…" : "Municípios"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Building2 className="h-4 w-4" /> Geografia e prédios mapeados
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-3 md:grid-cols-[1fr_auto]">
            <div className="space-y-2">
              <Label>Buscar no OpenStreetMap</Label>
              <Input placeholder="Jardim do Mar, São Bernardo do Campo, SP" value={geoQuery} onChange={(e) => setGeoQuery(e.target.value)} />
            </div>
            <Button className="self-end" disabled={!!loadingAction} onClick={() => onRun("nominatim-search", () => geocodificarNominatim(geoQuery))}>
              {pending("nominatim-search") ? "Buscando…" : "Geocodificar"}
            </Button>
          </div>

          <Separator />

          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Overpass consulta prédios por área. Use áreas pequenas para respeitar os limites do serviço gratuito.
            </p>
            <div className="grid gap-3 md:grid-cols-5">
              {(["south", "west", "north", "east"] as const).map((key) => (
                <div className="space-y-2" key={key}>
                  <Label>{key}</Label>
                  <Input value={bbox[key]} onChange={(e) => setBbox((current) => ({ ...current, [key]: e.target.value }))} />
                </div>
              ))}
              <Button
                className="self-end"
                disabled={!!loadingAction}
                onClick={() =>
                  onRun("overpass-buildings", () =>
                    buscarPrediosOverpass({
                      south: Number.parseFloat(bbox.south),
                      west: Number.parseFloat(bbox.west),
                      north: Number.parseFloat(bbox.north),
                      east: Number.parseFloat(bbox.east),
                    }),
                  )
                }
              >
                {pending("overpass-buildings") ? "Consultando…" : "Prédios"}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function ResultPanel({ result }: { result: IntegrationResult<Json> | null }) {
  return (
    <Card className="xl:sticky xl:top-4 xl:self-start">
      <CardHeader>
        <CardTitle className="text-base">Resultado da consulta</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {!result && (
          <div className="rounded-md border border-dashed p-6 text-center text-sm text-muted-foreground">
            Execute uma consulta para visualizar a estrutura retornada pela API.
          </div>
        )}
        {result && (
          <>
            <div className="flex flex-wrap gap-2 text-xs">
              <Badge>{result.provider}</Badge>
              <Badge variant="outline">{result.action}</Badge>
              <Badge variant={result.cached ? "secondary" : "default"}>{result.cached ? "cache" : "novo"}</Badge>
            </div>
            <p className="text-xs text-muted-foreground">Atualizado em {new Date(result.fetchedAt).toLocaleString("pt-BR")}</p>
            <pre className="max-h-[560px] overflow-auto rounded-md bg-muted p-3 text-xs leading-relaxed">
              {JSON.stringify(result.data, null, 2)}
            </pre>
          </>
        )}
      </CardContent>
    </Card>
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
