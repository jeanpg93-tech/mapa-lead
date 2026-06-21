import { createFileRoute, Link } from "@tanstack/react-router";
import { Plus } from "lucide-react";
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
import { locais, oportunidades } from "@/lib/mock-data";

export const Route = createFileRoute("/oportunidades")({
  head: () => ({ meta: [{ title: "Oportunidades — MapaLead" }] }),
  component: OportunidadesPage,
});

function OportunidadesPage() {
  return (
    <>
      <PageHeader
        title="Oportunidades"
        description="Negócios comerciais vinculados a locais ou regiões."
        actions={
          <>
            <Button variant="outline" asChild>
              <Link to="/funil">Ver funil</Link>
            </Button>
            <Button>
              <Plus className="mr-1 h-4 w-4" /> Nova oportunidade
            </Button>
          </>
        }
      />
      <PageBody>
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Título</TableHead>
                <TableHead>Local</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Responsável</TableHead>
                <TableHead>Valor est.</TableHead>
                <TableHead>Criada em</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {oportunidades.map((o) => {
                const local = locais.find((l) => l.id === o.localId);
                return (
                  <TableRow key={o.id}>
                    <TableCell className="font-medium">{o.titulo}</TableCell>
                    <TableCell>
                      {local && (
                        <Link to="/locais/$id" params={{ id: local.id }} className="hover:underline">
                          {local.nome}
                        </Link>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">{o.status}</Badge>
                    </TableCell>
                    <TableCell>{o.responsavel}</TableCell>
                    <TableCell>
                      {o.valorEstimado
                        ? o.valorEstimado.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })
                        : "—"}
                    </TableCell>
                    <TableCell className="text-muted-foreground">{o.criadaEm}</TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </Card>
      </PageBody>
    </>
  );
}
