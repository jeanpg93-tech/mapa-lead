import { createFileRoute } from "@tanstack/react-router";
import { ShieldCheck, Plus } from "lucide-react";
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
import { contatos } from "@/lib/mock-data";

export const Route = createFileRoute("/contatos")({
  head: () => ({ meta: [{ title: "Contatos — MapaLead" }] }),
  component: ContatosPage,
});

function ContatosPage() {
  return (
    <>
      <PageHeader
        title="Contatos"
        description="Apenas contatos legítimos: administradoras, síndicos, empresas e leads cadastrados com base legal."
        actions={
          <Button>
            <Plus className="mr-1 h-4 w-4" /> Novo contato
          </Button>
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
              </TableRow>
            </TableHeader>
            <TableBody>
              {contatos.map((c) => (
                <TableRow key={c.id} className={c.naoContatar ? "opacity-60" : ""}>
                  <TableCell className="font-medium">{c.nome}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{c.tipo}</Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {c.email ?? c.telefone ?? "—"}
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">{c.origem}</Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{c.baseLegal}</TableCell>
                  <TableCell>
                    {c.naoContatar ? (
                      <Badge variant="destructive">Não contatar</Badge>
                    ) : (
                      <Badge variant="secondary">{c.consentimento}</Badge>
                    )}
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
