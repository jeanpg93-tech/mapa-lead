import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Building2, MapPin, Search } from "lucide-react";
import { toast } from "sonner";
import { PageBody, PageHeader } from "@/components/page-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  createLocal,
  listLocais,
  TIPOS_LOCAL,
  type TipoLocal,
} from "@/lib/locais-api";
import {
  buscarLocaisPublicosPorNome,
  type PublicPlaceResult,
} from "@/lib/integrations-api";

export const Route = createFileRoute("/buscar")({
  head: () => ({ meta: [{ title: "Busca Territorial — MapaLead" }] }),
  component: BuscaTerritorial,
});

const filtros: (TipoLocal | "Todos")[] = ["Todos", ...TIPOS_LOCAL];

function BuscaTerritorial() {
  const qc = useQueryClient();
  const [q, setQ] = useState("");
  const [tipo, setTipo] = useState<(typeof filtros)[number]>("Todos");
  const [ufBusca, setUfBusca] = useState("SP");
  const [cidadeBusca, setCidadeBusca] = useState("");
  const [nomeBusca, setNomeBusca] = useState("");
  const [tipoSalvar, setTipoSalvar] = useState<TipoLocal>("Condomínio");
  const [resultadoPublico, setResultadoPublico] = useState<PublicPlaceResult[]>([]);

  const { data: locais = [], isLoading } = useQuery({
    queryKey: ["locais"],
    queryFn: listLocais,
  });

  const publicSearch = useMutation({
    mutationFn: buscarLocaisPublicosPorNome,
    onSuccess: (result) => {
      setResultadoPublico(result.data ?? []);
      toast.success(result.cached ? "Resultados recuperados do cache" : "Busca pública concluída");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const savePlace = useMutation({
    mutationFn: (place: PublicPlaceResult) => createLocal(placeToLocal(place, tipoSalvar, cidadeBusca, ufBusca)),
    onSuccess: (local) => {
      toast.success(`Local salvo: ${local.nome}`);
      qc.invalidateQueries({ queryKey: ["locais"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const resultados = useMemo(() => {
    const term = q.trim().toLowerCase();
    return locais.filter((l) => {
      const matchTipo = tipo === "Todos" || l.tipo === tipo;
      const matchTerm =
        !term ||
        [l.nome, l.bairro ?? "", l.cidade ?? "", l.endereco ?? ""].some((f) =>
          f.toLowerCase().includes(term),
        );
      return matchTipo && matchTerm;
    });
  }, [q, tipo, locais]);

  return (
    <>
      <PageHeader
        title="Busca Territorial"
        description="Encontre condomínios, edifícios, residenciais e regiões públicas antes de salvar como locais de prospecção."
      />
      <PageBody>
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Building2 className="h-4 w-4" /> Buscar condomínio ou prédio público
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Use esta busca para localizar o endereço público de um residencial, condomínio, edifício ou ponto comercial. O MapaLead não busca listas de moradores nem telefones pessoais.
            </p>
            <form
              className="grid gap-3 md:grid-cols-[90px_1fr_1.4fr_auto]"
              onSubmit={(e) => {
                e.preventDefault();
                publicSearch.mutate({ uf: ufBusca, cidade: cidadeBusca, nome: nomeBusca });
              }}
            >
              <div className="space-y-2">
                <Label>UF</Label>
                <Input value={ufBusca} onChange={(e) => setUfBusca(e.target.value.toUpperCase())} maxLength={2} />
              </div>
              <div className="space-y-2">
                <Label>Cidade</Label>
                <Input placeholder="São Bernardo do Campo" value={cidadeBusca} onChange={(e) => setCidadeBusca(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Nome do prédio/condomínio</Label>
                <Input placeholder="Residencial Jardim do Mar" value={nomeBusca} onChange={(e) => setNomeBusca(e.target.value)} />
              </div>
              <Button className="self-end" type="submit" disabled={publicSearch.isPending}>
                {publicSearch.isPending ? "Buscando…" : "Buscar"}
              </Button>
            </form>

            <div className="flex flex-wrap items-center gap-2 text-sm">
              <span className="text-muted-foreground">Salvar candidatos como:</span>
              {TIPOS_LOCAL.map((t) => (
                <Button
                  key={t}
                  type="button"
                  size="sm"
                  variant={tipoSalvar === t ? "default" : "outline"}
                  onClick={() => setTipoSalvar(t)}
                >
                  {t}
                </Button>
              ))}
            </div>

            {resultadoPublico.length > 0 && (
              <div className="grid gap-3 lg:grid-cols-2">
                {resultadoPublico.map((place, idx) => (
                  <Card key={`${place.place_id ?? place.osm_id ?? idx}`}>
                    <CardContent className="space-y-3 p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <h3 className="font-medium">{placeTitle(place)}</h3>
                          <p className="mt-1 text-sm text-muted-foreground">{place.display_name}</p>
                        </div>
                        <Badge variant="outline">{place.type ?? place.category ?? "local"}</Badge>
                      </div>
                      <div className="flex flex-wrap gap-2 text-xs">
                        {place.address?.suburb && <Badge variant="secondary">{place.address.suburb}</Badge>}
                        {place.address?.city && <Badge variant="secondary">{place.address.city}</Badge>}
                        {place.address?.town && <Badge variant="secondary">{place.address.town}</Badge>}
                        {place.lat && place.lon && <Badge variant="secondary">{place.lat}, {place.lon}</Badge>}
                      </div>
                      <Button
                        size="sm"
                        disabled={savePlace.isPending}
                        onClick={() => savePlace.mutate(place)}
                      >
                        Salvar local
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {!publicSearch.isPending && resultadoPublico.length === 0 && nomeBusca.trim().length > 0 && (
              <p className="text-xs text-muted-foreground">
                Dica: se não encontrar, tente variações como “Edifício”, “Condomínio”, “Residencial” ou apenas o nome principal.
              </p>
            )}
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardContent className="flex flex-col gap-3 p-4 md:flex-row md:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Buscar nos locais já salvos…"
                className="pl-9"
              />
            </div>
            <div className="flex flex-wrap gap-1">
              {filtros.map((t) => (
                <Button
                  key={t}
                  size="sm"
                  variant={tipo === t ? "default" : "outline"}
                  onClick={() => setTipo(t)}
                >
                  {t}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        <p className="mb-3 text-xs text-muted-foreground">
          {isLoading
            ? "Carregando…"
            : `${resultados.length} local salvo encontrado${resultados.length === 1 ? "" : "s"}`}
        </p>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {resultados.map((l) => (
            <Link key={l.id} to="/locais/$id" params={{ id: l.id }} className="block">
              <Card className="h-full transition hover:border-primary/60 hover:shadow-sm">
                <CardContent className="flex h-full flex-col gap-3 p-5">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="font-semibold text-foreground">{l.nome}</h3>
                      <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                        <MapPin className="h-3 w-3" />
                        {l.endereco ? `${l.endereco} · ` : ""}
                        {[l.bairro, l.cidade].filter(Boolean).join(", ")}
                        {l.uf ? `/${l.uf}` : ""}
                      </p>
                    </div>
                    <Badge variant="outline">{l.tipo}</Badge>
                  </div>
                  <div className="mt-auto flex flex-wrap items-center gap-2 text-xs">
                    <Badge variant="secondary">Confiança: {l.confianca}</Badge>
                    {l.unidades_estimadas != null && (
                      <Badge variant="secondary">{l.unidades_estimadas} unidades</Badge>
                    )}
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
          {!isLoading && resultados.length === 0 && (
            <Card className="md:col-span-2 xl:col-span-3">
              <CardContent className="p-8 text-center text-sm text-muted-foreground">
                Nenhum local salvo corresponde aos filtros aplicados.
              </CardContent>
            </Card>
          )}
        </div>
      </PageBody>
    </>
  );
}

function placeTitle(place: PublicPlaceResult) {
  return place.name || place.display_name?.split(",")[0]?.trim() || "Local encontrado";
}

function placeCity(place: PublicPlaceResult, fallback: string) {
  return place.address?.city || place.address?.town || place.address?.municipality || fallback.trim() || null;
}

function placeNeighborhood(place: PublicPlaceResult) {
  return place.address?.suburb || place.address?.neighbourhood || null;
}

function placeAddress(place: PublicPlaceResult) {
  return place.address?.road || place.display_name || null;
}

function placeToLocal(place: PublicPlaceResult, tipo: TipoLocal, cidadeFallback: string, ufFallback: string) {
  const title = placeTitle(place);
  const coords = place.lat && place.lon ? `Coordenadas: ${place.lat}, ${place.lon}. ` : "";
  const source = place.osm_type || place.osm_id ? `OSM: ${place.osm_type ?? ""} ${place.osm_id ?? ""}. ` : "";

  return {
    nome: title,
    tipo,
    endereco: placeAddress(place),
    bairro: placeNeighborhood(place),
    cidade: placeCity(place, cidadeFallback),
    uf: ufFallback.trim().toUpperCase() || null,
    unidades_estimadas: null,
    observacoes: `${coords}${source}Fonte pública: OpenStreetMap/Nominatim. Validar dados antes de usar em prospecção.`.trim(),
    origem: "público" as const,
    confianca: "Médio" as const,
  };
}
