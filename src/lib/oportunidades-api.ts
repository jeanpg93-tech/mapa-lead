import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

export type Oportunidade = Database["public"]["Tables"]["oportunidades"]["Row"];
export type OportunidadeInsert = Database["public"]["Tables"]["oportunidades"]["Insert"];
export type StatusOportunidade = Database["public"]["Enums"]["status_oportunidade"];

export const STATUS_OPORTUNIDADE: StatusOportunidade[] = [
  "Novo",
  "Em pesquisa",
  "Potencial identificado",
  "Contato permitido",
  "Em negociação",
  "Convertido",
  "Perdido",
];

export type OportunidadeComLocal = Oportunidade & {
  locais: { id: string; nome: string } | null;
};

export async function listOportunidades(): Promise<OportunidadeComLocal[]> {
  const { data, error } = await supabase
    .from("oportunidades")
    .select("*, locais(id, nome)")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as OportunidadeComLocal[];
}

export async function createOportunidade(
  input: Omit<OportunidadeInsert, "owner_id">,
): Promise<Oportunidade> {
  const { data: userData, error: userErr } = await supabase.auth.getUser();
  if (userErr || !userData.user) throw new Error("Sessão expirada");
  const { data, error } = await supabase
    .from("oportunidades")
    .insert({ ...input, owner_id: userData.user.id })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function updateOportunidadeStatus(
  id: string,
  status: StatusOportunidade,
): Promise<void> {
  const { error } = await supabase
    .from("oportunidades")
    .update({ status })
    .eq("id", id);
  if (error) throw error;
}

export async function deleteOportunidade(id: string): Promise<void> {
  const { error } = await supabase.from("oportunidades").delete().eq("id", id);
  if (error) throw error;
}

export async function listLocaisSimples(): Promise<{ id: string; nome: string }[]> {
  const { data, error } = await supabase
    .from("locais")
    .select("id, nome")
    .order("nome");
  if (error) throw error;
  return data ?? [];
}
