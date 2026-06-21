import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

export type Contato = Database["public"]["Tables"]["contatos"]["Row"];
export type ContatoInsert = Database["public"]["Tables"]["contatos"]["Insert"];
export type TipoContato = Database["public"]["Enums"]["tipo_contato"];
export type Consentimento = Database["public"]["Enums"]["consentimento_contato"];
export type OrigemDado = Database["public"]["Enums"]["origem_dado"];

export const TIPOS_CONTATO: TipoContato[] = [
  "Administradora",
  "Síndico",
  "Empresa",
  "Lead manual",
  "Demo",
];
export const CONSENTIMENTOS: Consentimento[] = ["Sim", "Não", "Pendente"];
export const ORIGENS: OrigemDado[] = ["manual", "demo", "parceiro", "importação", "público"];

export async function listContatos(): Promise<Contato[]> {
  const { data, error } = await supabase
    .from("contatos")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function createContato(input: Omit<ContatoInsert, "owner_id">): Promise<Contato> {
  const { data: userData, error: userErr } = await supabase.auth.getUser();
  if (userErr || !userData.user) throw new Error("Sessão expirada");
  const { data, error } = await supabase
    .from("contatos")
    .insert({ ...input, owner_id: userData.user.id })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function deleteContato(id: string): Promise<void> {
  const { error } = await supabase.from("contatos").delete().eq("id", id);
  if (error) throw error;
}
