import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

export type Local = Database["public"]["Tables"]["locais"]["Row"];
export type LocalInsert = Database["public"]["Tables"]["locais"]["Insert"];
export type LocalUpdate = Database["public"]["Tables"]["locais"]["Update"];
export type TipoLocal = Database["public"]["Enums"]["tipo_local"];
export type GrauConfianca = Database["public"]["Enums"]["grau_confianca"];
export type OrigemDado = Database["public"]["Enums"]["origem_dado"];

export const TIPOS_LOCAL: TipoLocal[] = [
  "Condomínio",
  "Edifício",
  "Bairro",
  "Rua",
  "Região Comercial",
];
export const GRAUS_CONFIANCA: GrauConfianca[] = ["Baixo", "Médio", "Alto"];
export const ORIGENS: OrigemDado[] = ["manual", "demo", "parceiro", "importação", "público"];

export async function listLocais(): Promise<Local[]> {
  const { data, error } = await supabase
    .from("locais")
    .select("*")
    .order("updated_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function getLocalById(id: string): Promise<Local | null> {
  const { data, error } = await supabase
    .from("locais")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (error) throw error;
  return data;
}

export async function createLocal(
  input: Omit<LocalInsert, "owner_id">,
): Promise<Local> {
  const { data: userData, error: userErr } = await supabase.auth.getUser();
  if (userErr || !userData.user) throw new Error("Sessão expirada");
  const { data, error } = await supabase
    .from("locais")
    .insert({ ...input, owner_id: userData.user.id })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function updateLocal(id: string, patch: LocalUpdate): Promise<Local> {
  const { data, error } = await supabase
    .from("locais")
    .update(patch)
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function deleteLocal(id: string): Promise<void> {
  const { error } = await supabase.from("locais").delete().eq("id", id);
  if (error) throw error;
}

export async function countsForLocal(id: string) {
  const [{ count: ops }, { count: tks }, { count: cts }] = await Promise.all([
    supabase
      .from("oportunidades")
      .select("id", { head: true, count: "exact" })
      .eq("local_id", id)
      .not("status", "in", "(Convertido,Perdido)"),
    supabase
      .from("tarefas")
      .select("id", { head: true, count: "exact" })
      .eq("local_id", id)
      .neq("status", "Concluída"),
    supabase
      .from("contatos")
      .select("id", { head: true, count: "exact" })
      .eq("local_id", id),
  ]);
  return {
    oportunidadesAbertas: ops ?? 0,
    tarefasPendentes: tks ?? 0,
    contatos: cts ?? 0,
  };
}
