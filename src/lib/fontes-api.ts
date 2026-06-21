import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

export type Fonte = Database["public"]["Tables"]["fontes"]["Row"];
export type FonteInsert = Database["public"]["Tables"]["fontes"]["Insert"];
export type TipoFonte = Database["public"]["Enums"]["tipo_fonte"];
export type StatusFonte = Database["public"]["Enums"]["status_fonte"];

export const TIPOS_FONTE: TipoFonte[] = [
  "Base manual",
  "Mock/Demo",
  "API",
  "Parceiro",
  "Importação",
  "Dados públicos",
];
export const STATUS_FONTE: StatusFonte[] = ["Ativa", "Planejada", "Pausada"];

export async function listFontes(): Promise<Fonte[]> {
  const { data, error } = await supabase
    .from("fontes")
    .select("*")
    .order("updated_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function createFonte(
  input: Omit<FonteInsert, "owner_id">,
): Promise<Fonte> {
  const { data: userData, error: userErr } = await supabase.auth.getUser();
  if (userErr || !userData.user) throw new Error("Sessão expirada");
  const { data, error } = await supabase
    .from("fontes")
    .insert({ ...input, owner_id: userData.user.id })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function deleteFonte(id: string): Promise<void> {
  const { error } = await supabase.from("fontes").delete().eq("id", id);
  if (error) throw error;
}
