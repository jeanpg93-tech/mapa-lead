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

type CacheRow = {
  response_data: Json;
  expires_at: string | null;
  updated_at: string;
};

const db = supabase as any;

function onlyDigits(value: string) {
  return value.replace(/\D/g, "");
}

function stableStringify(value: Json): string {
  if (Array.isArray(value)) return `[${value.map(stableStringify).join(",")}]`;
  if (value && typeof value === "object") {
    const objectValue = value as JsonObject;
    return `{${Object.keys(objectValue)
      .sort()
      .map((key) => `${JSON.stringify(key)}:${stableStringify(objectValue[key] ?? null)}`)
      .join(",")}}`;
  }
  return JSON.stringify(value);
}

function cacheKey(action: string, params: JsonObject) {
  return `${action}:${stableStringify(params)}`;
}

function expiresIn(days: number) {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toISOString();
}

async function getCurrentUserId() {
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) throw new Error("Sessão expirada. Entre novamente para consultar APIs.");
  return data.user.id;
}

async function requestJson<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    ...init,
    headers: {
      Accept: "application/json",
      ...(init?.headers ?? {}),
    },
  });

  if (!res.ok) {
    throw new Error(`A API retornou erro ${res.status}`);
  }

  return (await res.json()) as T;
}

async function logIntegration(
  ownerId: string,
  provider: IntegrationProvider,
  action: string,
  status: "success" | "error",
  params: JsonObject,
  errorMessage?: string,
) {
  await db.from("integration_logs").insert({
    owner_id: ownerId,
    provider,
    action,
    status,
    request_params: params,
    error_message: errorMessage ?? null,
  });
}

async function withCache<T extends Json>(
  provider: IntegrationProvider,
  action: string,
  params: JsonObject,
  fetcher: () => Promise<T>,
  ttlDays = 7,
): Promise<IntegrationResult<T>> {
  const ownerId = await getCurrentUserId();
  const key = cacheKey(action, params);

  const { data: cached } = await db
    .from("api_cache")
    .select("response_data, expires_at, updated_at")
    .eq("owner_id", ownerId)
    .eq("provider", provider)
    .eq("cache_key", key)
    .maybeSingle();

  const cachedRow = cached as CacheRow | null;

  if (cachedRow && (!cachedRow.expires_at || new Date(cachedRow.expires_at) > new Date())) {
    return {
      provider,
      action,
      params,
      data: cachedRow.response_data as T,
      cached: true,
      fetchedAt: cachedRow.updated_at,
    };
  }

  try {
    const data = await fetcher();
    const now = new Date().toISOString();

    await db.from("api_cache").upsert(
      {
        owner_id: ownerId,
        provider,
        cache_key: key,
        request_params: params,
        response_data: data,
        expires_at: expiresIn(ttlDays),
        updated_at: now,
      },
      { onConflict: "owner_id,provider,cache_key" },
    );

    await logIntegration(ownerId, provider, action, "success", params);

    return { provider, action, params, data, cached: false, fetchedAt: now };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Falha desconhecida";
    await logIntegration(ownerId, provider, action, "error", params, message);
    throw new Error(message);
  }
}

export async function consultarViaCep(cep: string) {
  const digits = onlyDigits(cep);
  if (digits.length !== 8) throw new Error("Informe um CEP com 8 dígitos.");

  return withCache("viacep", "cep", { cep: digits }, async () => {
    const data = await requestJson<JsonObject>(`https://viacep.com.br/ws/${digits}/json/`);
    if (data.erro) throw new Error("CEP não encontrado no ViaCEP.");
    return data;
  });
}

export async function buscarViaCepPorEndereco(uf: string, cidade: string, logradouro: string) {
  const cleanUf = uf.trim().toUpperCase();
  const cleanCidade = cidade.trim();
  const cleanLogradouro = logradouro.trim();

  if (cleanUf.length !== 2) throw new Error("Informe a UF com 2 letras.");
  if (cleanCidade.length < 3 || cleanLogradouro.length < 3) {
    throw new Error("Informe cidade e logradouro com pelo menos 3 caracteres.");
  }

  const params = { uf: cleanUf, cidade: cleanCidade, logradouro: cleanLogradouro };

  return withCache("viacep", "endereco", params, () =>
    requestJson<Json[]>(
      `https://viacep.com.br/ws/${encodeURIComponent(cleanUf)}/${encodeURIComponent(
        cleanCidade,
      )}/${encodeURIComponent(cleanLogradouro)}/json/`,
    ),
  );
}

export async function consultarBrasilApiCep(cep: string) {
  const digits = onlyDigits(cep);
  if (digits.length !== 8) throw new Error("Informe um CEP com 8 dígitos.");

  return withCache("brasilapi", "cep-v2", { cep: digits }, () =>
    requestJson<JsonObject>(`https://brasilapi.com.br/api/cep/v2/${digits}`),
  );
}

export async function consultarBrasilApiCnpj(cnpj: string) {
  const digits = onlyDigits(cnpj);
  if (digits.length !== 14) throw new Error("Informe um CNPJ com 14 dígitos.");

  return withCache("brasilapi", "cnpj", { cnpj: digits }, () =>
    requestJson<JsonObject>(`https://brasilapi.com.br/api/cnpj/v1/${digits}`),
  );
}

export async function listarEstadosIBGE() {
  return withCache("ibge", "estados", {}, () =>
    requestJson<Json[]>("https://servicodados.ibge.gov.br/api/v1/localidades/estados?orderBy=nome"),
    30,
  );
}

export async function listarMunicipiosPorUF(uf: string) {
  const cleanUf = uf.trim().toUpperCase();
  if (cleanUf.length !== 2) throw new Error("Informe a UF com 2 letras.");

  return withCache("ibge", "municipios", { uf: cleanUf }, () =>
    requestJson<Json[]>(
      `https://servicodados.ibge.gov.br/api/v1/localidades/estados/${encodeURIComponent(
        cleanUf,
      )}/municipios?orderBy=nome`,
    ),
    30,
  );
}

export async function geocodificarNominatim(query: string) {
  const q = query.trim();
  if (q.length < 3) throw new Error("Digite um endereço, condomínio, bairro ou cidade.");

  return withCache(
    "nominatim",
    "search",
    { q },
    () =>
      requestJson<Json[]>(
        `https://nominatim.openstreetmap.org/search?format=jsonv2&limit=5&countrycodes=br&q=${encodeURIComponent(
          q,
        )}`,
        { headers: { "Accept-Language": "pt-BR" } },
      ),
    14,
  );
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

  const query = `[out:json][timeout:25];
(
  way["building"](${south},${west},${north},${east});
  relation["building"](${south},${west},${north},${east});
);
out center tags 50;`;

  return withCache(
    "overpass",
    "buildings-bbox",
    { south, west, north, east },
    () =>
      requestJson<JsonObject>("https://overpass-api.de/api/interpreter", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8" },
        body: new URLSearchParams({ data: query }),
      }),
    14,
  );
}
