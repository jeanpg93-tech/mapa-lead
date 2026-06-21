import { supabase } from "@/integrations/supabase/client";

export type LocaisPorTipo = { tipo: string; quantidade: number };
export type OportunidadesPorStatus = { status: string; quantidade: number; valor: number };
export type TarefasPorStatus = { status: string; quantidade: number };
export type LocalComOportunidades = { id: string; nome: string; quantidade: number };

export async function getLocaisPorTipo(): Promise<LocaisPorTipo[]> {
  const { data, error } = await supabase.from("locais").select("tipo");
  if (error) throw error;
  const map = new Map<string, number>();
  for (const row of data ?? []) {
    map.set(row.tipo, (map.get(row.tipo) ?? 0) + 1);
  }
  return Array.from(map.entries()).map(([tipo, quantidade]) => ({ tipo, quantidade }));
}

export async function getOportunidadesPorStatus(): Promise<OportunidadesPorStatus[]> {
  const { data, error } = await supabase.from("oportunidades").select("status, valor_estimado");
  if (error) throw error;
  const map = new Map<string, { quantidade: number; valor: number }>();
  for (const row of data ?? []) {
    const atual = map.get(row.status) ?? { quantidade: 0, valor: 0 };
    atual.quantidade += 1;
    atual.valor += row.valor_estimado ?? 0;
    map.set(row.status, atual);
  }
  return Array.from(map.entries()).map(([status, { quantidade, valor }]) => ({
    status,
    quantidade,
    valor,
  }));
}

export async function getTarefasPorStatus(): Promise<TarefasPorStatus[]> {
  const { data, error } = await supabase.from("tarefas").select("status");
  if (error) throw error;
  const map = new Map<string, number>();
  for (const row of data ?? []) {
    map.set(row.status, (map.get(row.status) ?? 0) + 1);
  }
  return Array.from(map.entries()).map(([status, quantidade]) => ({ status, quantidade }));
}

export async function getTopLocaisComOportunidades(limit = 5): Promise<LocalComOportunidades[]> {
  const { data, error } = await supabase
    .from("oportunidades")
    .select("local_id, locais(id, nome)")
    .not("status", "in", "(Convertido,Perdido)");
  if (error) throw error;
  const map = new Map<string, { nome: string; quantidade: number }>();
  for (const row of data ?? []) {
    const local = row.locais as { id: string; nome: string } | null;
    if (!local) continue;
    const atual = map.get(local.id) ?? { nome: local.nome, quantidade: 0 };
    atual.quantidade += 1;
    map.set(local.id, atual);
  }
  return Array.from(map.entries())
    .map(([id, { nome, quantidade }]) => ({ id, nome, quantidade }))
    .sort((a, b) => b.quantidade - a.quantidade)
    .slice(0, limit);
}

export async function getTarefasAtrasadas(): Promise<number> {
  const hoje = new Date().toISOString().split("T")[0];
  const { count, error } = await supabase
    .from("tarefas")
    .select("id", { head: true, count: "exact" })
    .not("status", "eq", "Concluída")
    .lt("prazo", hoje);
  if (error) throw error;
  return count ?? 0;
}
