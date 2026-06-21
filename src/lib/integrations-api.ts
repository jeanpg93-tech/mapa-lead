import { supabase } from "@/integrations/supabase/client";
import type { Json } from "@/integrations/supabase/types";

type JsonObject = { [key: string]: Json | undefined };

export type IntegrationProvider =
  | "viacep"
  | "brasilapi"
  | "ibge"
  | "nominatim"
  | "overpass";

export type IntegrationResult<T = Json> = {
  provider: IntegrationProvider;
  action: string;
  params: JsonObject;
  data: T;
  cached: boolean;
  fetchedAt: string;
};

function onlyDigits(value: string) {
  return value.replace(/\D/g, "");
}

async function invokePublicData<T extends Json>(
  action: string,
  params: JsonObject,
): Promise<IntegrationResult<T>> {
  const { data, error } = await supabase.functions.invoke<IntegrationResult<T> & { error?: string }>(
    "public-data",
    { body: { action, params } },
  );

  if (error) throw new Error(error.message);
  if (!data) throw new Error("A integração não retornou dados.");
  if (data.error) throw new Error(data.error);

  return data;
}

export async function consultarViaCep(cep: string) {
  const digits = onlyDigits(cep);
  if (digits.length !== 8) throw new Error("Informe um CEP com 8 dígitos.");
  return invokePublicData<JsonObject>("viacep.cep", { cep: digits });
}

export async function buscarViaCepPorEndereco(uf: string, cidade: string, logradouro: string) {
  const cleanUf = uf.trim().toUpperCase();
  const cleanCidade = cidade.trim();
  const cleanLogradouro = logradouro.trim();

  if (cleanUf.length !== 2) throw new Error("Informe a UF com 2 letras.");
  if (cleanCidade.length < 3 || cleanLogradouro.length < 3) {
    throw new Error("Informe cidade e logradouro com pelo menos 3 caracteres.");
  }

  return invokePublicData<Json[]>("viacep.endereco", {
    uf: cleanUf,
    cidade: cleanCidade,
    logradouro: cleanLogradouro,
  });
}

export async function consultarBrasilApiCep(cep: string) {
  const digits = onlyDigits(cep);
  if (digits.length !== 8) throw new Error("Informe um CEP com 8 dígitos.");
  return invokePublicData<JsonObject>("brasilapi.cep", { cep: digits });
}

export async function consultarBrasilApiCnpj(cnpj: string) {
  const digits = onlyDigits(cnpj);
  if (digits.length !== 14) throw new Error("Informe um CNPJ com 14 dígitos.");
  return invokePublicData<JsonObject>("brasilapi.cnpj", { cnpj: digits });
}

export async function listarEstadosIBGE() {
  return invokePublicData<Json[]>("ibge.estados", {});
}

export async function listarMunicipiosPorUF(uf: string) {
  const cleanUf = uf.trim().toUpperCase();
  if (cleanUf.length !== 2) throw new Error("Informe a UF com 2 letras.");
  return invokePublicData<Json[]>("ibge.municipios", { uf: cleanUf });
}

export async function geocodificarNominatim(query: string) {
  const q = query.trim();
  if (q.length < 3) throw new Error("Digite um endereço, condomínio, bairro ou cidade.");
  return invokePublicData<Json[]>("nominatim.search", { q });
}

export type OverpassBBox = {
  south: number;
  west: number;
  north: number;
  east: number;
};

export async function buscarPrediosOverpass(bbox: OverpassBBox) {
  const { south, west, north, east } = bbox;
  const values = [south, west, north, east];
  if (values.some((value) => Number.isNaN(value))) {
    throw new Error("Preencha todos os limites da área em formato decimal.");
  }
  if (south >= north || west >= east) {
    throw new Error("A área precisa ter sul < norte e oeste < leste.");
  }

  return invokePublicData<JsonObject>("overpass.buildings", { south, west, north, east });
}
