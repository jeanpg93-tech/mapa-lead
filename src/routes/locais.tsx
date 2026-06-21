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
import { locais } from "@/lib/mock-data";

export const Route = createFileRoute("/locais")({
  head: () => ({ meta: [{ title: "Locais — MapaLead" }] }),
  component: LocaisPage,
});

function LocaisPage() {
  return (
    <>
      <PageHeader
        title="Locais"
        description="Condomínios, edifícios, bairros e regiões cadastrados."
        actions={
          <Button>
            <Plus className="mr-1 h-4 w-4" /> Novo local
          </Button>
        }
      />
      <PageBody>
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Endereço</TableHead>
                <TableHead>Cidade / UF</TableHead>
                <TableHead>Unidades</TableHead>
                <TableHead>Confiança</TableHead>
                <TableHead>Oport.</TableHead>
                <TableHead>Tarefas</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {locais.map((l) => (
                <TableRow key={l.id} className="cursor-pointer">
                  <TableCell className="font-medium">
                    <Link to="/locais/$id" params={{ id: l.id }} className="hover:underline">
                      {l.nome}
                    </Link>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{l.tipo}</Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{l.endereco}</TableCell>
                  <TableCell className="text-muted-foreground">{l.cidade}/{l.uf}</TableCell>
                  <TableCell>{l.unidadesEstimadas ?? "—"}</TableCell>
                  <TableCell>
                    <Badge variant="secondary">{l.confianca}</Badge>
                  </TableCell>
                  <TableCell>{l.oportunidadesAbertas}</TableCell>
                  <TableCell>{l.tarefasPendentes}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      </PageBody>
    </>
  );
}
