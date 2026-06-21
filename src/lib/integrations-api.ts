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

export type PublicPlaceResult = {
  place_id?: number;
  osm_type?: string;
  osm_id?: number;
  name?: string;
  display_name?: string;
  lat?: string;
  lon?: string;
  category?: string;
  type?: string;
  importance?: number;
  address?: {
    road?: string;
    suburb?: string;
    neighbourhood?: string;
    city?: string;
    town?: string;
    municipality?: string;
    state?: string;
    postcode?: string;
    country?: string;
    [key: string]: Json | undefined;
  };
  boundingbox?: string[];
  search_query?: string;
  is_manual_candidate?: boolean;
  validation_status?: string;
  [key: string]: Json | undefined;
};

function onlyDigits(value: string) {
  return value.replace(/\D/g, "");
}

function normalizeText(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

function uniqueValues(values: string[]) {
  return Array.from(new Set(values.map((value) => value.trim()).filter(Boolean)));
}

function stripPlacePrefixes(value: string) {
  return value
    .replace(
      /\b(condom[ií]nio|condominio|cond\.|residencial|res\.|edif[ií]cio|edificio|pr[eé]dio|predio|empreendimento|conjunto)\b/gi,
      " ",
    )
    .replace(/\s+/g, " ")
    .trim();
}

function placeIdentity(place: PublicPlaceResult) {
  return [
    place.osm_type,
    place.osm_id,
    place.place_id,
    normalizeText(place.display_name ?? ""),
  ].join("|");
}

function buildSearchablePlaceNames(nome: string) {
  const cleanName = nome.trim();
  const baseName = stripPlacePrefixes(cleanName);
  const noPunctuation = baseName.replace(/[.,;:()[\]{}_-]+/g, " ").replace(/\s+/g, " ").trim();

  return uniqueValues([baseName, noPunctuation, cleanName]).filter((name) => name.length >= 3);
}

function buildPlaceQueries(nome: string, cidade: string, uf: string) {
  const cleanName = nome.trim();
  const searchableNames = buildSearchablePlaceNames(cleanName);
  const baseName = searchableNames[0] ?? cleanName;
  const names = uniqueValues([
    baseName,
    cleanName,
    `Condomínio ${baseName}`,
    `Residencial ${baseName}`,
    `Edifício ${baseName}`,
    ...searchableNames,
  ]);

  return uniqueValues(
    names.flatMap((name) => [
      `${name}, ${cidade}, ${uf}, Brasil`,
      `${name}, ${cidade}, Brasil`,
    ]),
  );
}

function manualPlaceCandidate(nome: string, cidade: string, uf: string): PublicPlaceResult {
  return {
    name: nome,
    display_name: `${nome}, ${cidade}/${uf} - candidato pendente de validação`,
    category: "manual_candidate",
    type: "pendente",
    address: {
      city: cidade,
      state: uf,
      country: "Brasil",
    },
    is_manual_candidate: true,
    validation_status: "pendente",
  };
}

function placeMatchScore(place: PublicPlaceResult, searchableNames: string[]) {
  const placeText = normalizeText(`${place.name ?? ""} ${place.display_name ?? ""}`);
  const queryText = normalizeText(place.search_query ?? "");

  return searchableNames.reduce((score, name, index) => {
    const normalizedName = normalizeText(name);
    if (!normalizedName) return score;

    const exactWeight = index === 0 ? 6 : 4;
    const queryWeight = index === 0 ? 3 : 2;
    return (
      score +
      (placeText.includes(normalizedName) ? exactWeight : 0) +
      (queryText.includes(normalizedName) ? queryWeight : 0)
    );
  }, Number(place.importance ?? 0));
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

export async function buscarLocaisPublicosPorNome(input: {
  uf: string;
  cidade: string;
  nome: string;
}) {
  const uf = input.uf.trim().toUpperCase();
  const cidade = input.cidade.trim();
  const nome = input.nome.trim();

  if (uf.length !== 2) throw new Error("Informe a UF com 2 letras.");
  if (cidade.length < 2) throw new Error("Informe a cidade.");
  if (nome.length < 3) throw new Error("Digite pelo menos 3 caracteres do nome do local.");

  const queries = buildPlaceQueries(nome, cidade, uf);
  const allResults: PublicPlaceResult[] = [];
  let anyCached = false;

  for (const query of queries) {
    const result = await invokePublicData<PublicPlaceResult[]>("nominatim.search", { q: query });
    anyCached = anyCached || result.cached;
    for (const place of result.data ?? []) {
      allResults.push({ ...place, search_query: query });
    }
  }

  const seen = new Set<string>();
  const uniqueResults = allResults.filter((place) => {
    const id = placeIdentity(place);
    if (seen.has(id)) return false;
    seen.add(id);
    return true;
  });

  const searchableNames = buildSearchablePlaceNames(nome);
  const sortedResults = uniqueResults.sort(
    (a, b) => placeMatchScore(b, searchableNames) - placeMatchScore(a, searchableNames),
  );
  const hasCloseName = sortedResults.some((place) => {
    const placeText = normalizeText(`${place.name ?? ""} ${place.display_name ?? ""}`);
    return searchableNames.some((name) => placeText.includes(normalizeText(name)));
  });

  if (!hasCloseName) {
    sortedResults.unshift(manualPlaceCandidate(nome, cidade, uf));
  }

  return {
    provider: "nominatim" as const,
    action: "search-expanded",
    params: { uf, cidade, nome, termos_considerados: searchableNames, queries },
    data: sortedResults,
    cached: anyCached,
    fetchedAt: new Date().toISOString(),
  };
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
