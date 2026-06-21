import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Search, MapPin } from "lucide-react";
import { PageBody, PageHeader } from "@/components/page-shell";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { listLocais, TIPOS_LOCAL, type TipoLocal } from "@/lib/locais-api";

export const Route = createFileRoute("/buscar")({
  head: () => ({ meta: [{ title: "Busca Territorial — MapaLead" }] }),
  component: BuscaTerritorial,
});

const filtros: (TipoLocal | "Todos")[] = ["Todos", ...TIPOS_LOCAL];

function BuscaTerritorial() {
  const [q, setQ] = useState("");
  const [tipo, setTipo] = useState<(typeof filtros)[number]>("Todos");
  const { data: locais = [], isLoading } = useQuery({
    queryKey: ["locais"],
    queryFn: listLocais,
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
        description="Pesquise por condomínio, edifício, bairro, rua, cidade ou região."
      />
      <PageBody>
        <Card className="mb-6">
          <CardContent className="flex flex-col gap-3 p-4 md:flex-row md:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Ex.: Jardim do Mar, Boqueirão, Av. Presidente Wilson…"
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
            : `${resultados.length} resultado${resultados.length === 1 ? "" : "s"} encontrado${resultados.length === 1 ? "" : "s"}`}
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
                Nenhum local corresponde aos filtros aplicados.
              </CardContent>
            </Card>
          )}
        </div>
      </PageBody>
    </>
  );
}
