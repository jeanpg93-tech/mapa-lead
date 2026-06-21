import { createFileRoute } from "@tanstack/react-router";
import { PageBody, PageHeader } from "@/components/page-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { fontes } from "@/lib/mock-data";

export const Route = createFileRoute("/fontes")({
  head: () => ({ meta: [{ title: "Fontes de Dados — MapaLead" }] }),
  component: FontesPage,
});

function FontesPage() {
  return (
    <>
      <PageHeader
        title="Fontes de Dados"
        description="Toda informação no MapaLead tem origem rastreável. Hoje operamos com base manual e mocks; integrações entrarão em fases futuras."
      />
      <PageBody>
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
                <p className="text-muted-foreground">{f.descricao}</p>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Registros</span>
                  <span className="font-medium text-foreground">{f.registros}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="text-base">Roadmap de integrações</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            <p>
              Avaliações futuras: IBGE/CNEFE, IBGE Localidades, ViaCEP, BrasilAPI, OpenStreetMap /
              Overpass, Google Maps ou Mapbox, dados abertos municipais, bases de CNPJ e
              fornecedores legalmente contratados. Nenhuma integração externa está ativa neste
              protótipo.
            </p>
          </CardContent>
        </Card>
      </PageBody>
    </>
  );
}
