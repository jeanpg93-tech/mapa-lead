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
import { locais, tarefas } from "@/lib/mock-data";

export const Route = createFileRoute("/tarefas")({
  head: () => ({ meta: [{ title: "Tarefas — MapaLead" }] }),
  component: TarefasPage,
});

function TarefasPage() {
  return (
    <>
      <PageHeader
        title="Tarefas"
        description="Ações de prospecção: ligações, visitas, atualizações e propostas."
        actions={
          <Button>
            <Plus className="mr-1 h-4 w-4" /> Nova tarefa
          </Button>
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
              </TableRow>
            </TableHeader>
            <TableBody>
              {tarefas.map((t) => {
                const local = locais.find((l) => l.id === t.localId);
                return (
                  <TableRow key={t.id}>
                    <TableCell className="font-medium">{t.titulo}</TableCell>
                    <TableCell>
                      {local && (
                        <Link to="/locais/$id" params={{ id: local.id }} className="hover:underline">
                          {local.nome}
                        </Link>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant={t.status === "Concluída" ? "secondary" : "outline"}>
                        {t.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{t.responsavel}</TableCell>
                    <TableCell className="text-muted-foreground">{t.prazo}</TableCell>
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
