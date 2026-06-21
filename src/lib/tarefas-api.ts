import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

export type Tarefa = Database["public"]["Tables"]["tarefas"]["Row"];
export type TarefaInsert = Database["public"]["Tables"]["tarefas"]["Insert"];
export type StatusTarefa = Database["public"]["Enums"]["status_tarefa"];

export const STATUS_TAREFA: StatusTarefa[] = ["Aberta", "Em andamento", "Concluída"];

export type TarefaComLocal = Tarefa & { locais: { id: string; nome: string } | null };

export async function listTarefas(): Promise<TarefaComLocal[]> {
  const { data, error } = await supabase
    .from("tarefas")
    .select("*, locais(id, nome)")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as TarefaComLocal[];
}

export async function createTarefa(input: Omit<TarefaInsert, "owner_id">): Promise<Tarefa> {
  const { data: userData, error: userErr } = await supabase.auth.getUser();
  if (userErr || !userData.user) throw new Error("Sessão expirada");
  const { data, error } = await supabase
    .from("tarefas")
    .insert({ ...input, owner_id: userData.user.id })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function updateTarefaStatus(id: string, status: StatusTarefa): Promise<void> {
  const { error } = await supabase.from("tarefas").update({ status }).eq("id", id);
  if (error) throw error;
}

export async function deleteTarefa(id: string): Promise<void> {
  const { error } = await supabase.from("tarefas").delete().eq("id", id);
  if (error) throw error;
}
