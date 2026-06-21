import { createClient } from "https://esm.sh/@supabase/supabase-js@2.108.2";

type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];
type JsonObject = { [key: string]: Json | undefined };
type Provider = "viacep" | "brasilapi" | "ibge" | "nominatim" | "overpass";

type ActionConfig = {
  provider: Provider;
  action: string;
  ttlDays: number;
  fetcher: (params: JsonObject) => Promise<Json>;
};

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

function onlyDigits(value: unknown) {
  return String(value ?? "").replace(/\D/g, "");
}

function textParam(params: JsonObject, key: string) {
  return String(params[key] ?? "").trim();
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

function jsonResponse(body: JsonObject, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

async function requestJson<T extends Json>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    ...init,
    headers: {
      Accept: "application/json",
      "User-Agent": "MapaLead/0.1 https://mapa-lead.lovable.app",
      ...(init?.headers ?? {}),
    },
  });

  if (!res.ok) throw new Error(`A API retornou erro ${res.status}`);
  return (await res.json()) as T;
}

function getActionConfig(actionName: string, params: JsonObject): ActionConfig {
  if (actionName === "viacep.cep") {
    return {
      provider: "viacep",
      action: "cep",
      ttlDays: 7,
      fetcher: async () => {
        const cep = onlyDigits(params.cep);
        if (cep.length !== 8) throw new Error("Informe um CEP com 8 dígitos.");
        const data = await requestJson<JsonObject>(`https://viacep.com.br/ws/${cep}/json/`);
        if (data.erro) throw new Error("CEP não encontrado no ViaCEP.");
        return data;
      },
    };
  }

  if (actionName === "viacep.endereco") {
    return {
      provider: "viacep",
      action: "endereco",
      ttlDays: 7,
      fetcher: () => {
        const uf = textParam(params, "uf").toUpperCase();
        const cidade = textParam(params, "cidade");
        const logradouro = textParam(params, "logradouro");
        if (uf.length !== 2) throw new Error("Informe a UF com 2 letras.");
        if (cidade.length < 3 || logradouro.length < 3) {
          throw new Error("Informe cidade e logradouro com pelo menos 3 caracteres.");
        }
        return requestJson<Json[]>(
          `https://viacep.com.br/ws/${encodeURIComponent(uf)}/${encodeURIComponent(cidade)}/${encodeURIComponent(logradouro)}/json/`,
        );
      },
    };
  }

  if (actionName === "brasilapi.cep") {
    return {
      provider: "brasilapi",
      action: "cep-v2",
      ttlDays: 7,
      fetcher: () => {
        const cep = onlyDigits(params.cep);
        if (cep.length !== 8) throw new Error("Informe um CEP com 8 dígitos.");
        return requestJson<JsonObject>(`https://brasilapi.com.br/api/cep/v2/${cep}`);
      },
    };
  }

  if (actionName === "brasilapi.cnpj") {
    return {
      provider: "brasilapi",
      action: "cnpj",
      ttlDays: 7,
      fetcher: () => {
        const cnpj = onlyDigits(params.cnpj);
        if (cnpj.length !== 14) throw new Error("Informe um CNPJ com 14 dígitos.");
        return requestJson<JsonObject>(`https://brasilapi.com.br/api/cnpj/v1/${cnpj}`);
      },
    };
  }

  if (actionName === "ibge.estados") {
    return {
      provider: "ibge",
      action: "estados",
      ttlDays: 30,
      fetcher: () => requestJson<Json[]>("https://servicodados.ibge.gov.br/api/v1/localidades/estados?orderBy=nome"),
    };
  }

  if (actionName === "ibge.municipios") {
    return {
      provider: "ibge",
      action: "municipios",
      ttlDays: 30,
      fetcher: () => {
        const uf = textParam(params, "uf").toUpperCase();
        if (uf.length !== 2) throw new Error("Informe a UF com 2 letras.");
        return requestJson<Json[]>(
          `https://servicodados.ibge.gov.br/api/v1/localidades/estados/${encodeURIComponent(uf)}/municipios?orderBy=nome`,
        );
      },
    };
  }

  if (actionName === "nominatim.search") {
    return {
      provider: "nominatim",
      action: "search",
      ttlDays: 14,
      fetcher: () => {
        const q = textParam(params, "q");
        if (q.length < 3) throw new Error("Digite um endereço, condomínio, bairro ou cidade.");
        return requestJson<Json[]>(
          `https://nominatim.openstreetmap.org/search?format=jsonv2&limit=5&countrycodes=br&q=${encodeURIComponent(q)}`,
          { headers: { "Accept-Language": "pt-BR", Referer: "https://mapa-lead.lovable.app" } },
        );
      },
    };
  }

  if (actionName === "overpass.buildings") {
    return {
      provider: "overpass",
      action: "buildings-bbox",
      ttlDays: 14,
      fetcher: () => {
        const south = Number(params.south);
        const west = Number(params.west);
        const north = Number(params.north);
        const east = Number(params.east);
        if ([south, west, north, east].some((value) => Number.isNaN(value))) {
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
        return requestJson<JsonObject>("https://overpass-api.de/api/interpreter", {
          method: "POST",
          headers: { "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8" },
          body: new URLSearchParams({ data: query }),
        });
      },
    };
  }

  throw new Error("Integração não reconhecida.");
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return jsonResponse({ error: "Método não permitido." }, 405);

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const anonKey = Deno.env.get("SUPABASE_ANON_KEY");
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!supabaseUrl || !anonKey || !serviceRoleKey) {
    return jsonResponse({ error: "Configuração do Supabase incompleta." }, 500);
  }

  const authorization = req.headers.get("Authorization") ?? "";
  const userClient = createClient(supabaseUrl, anonKey, {
    global: { headers: { Authorization: authorization } },
  });
  const adminClient = createClient(supabaseUrl, serviceRoleKey);

  const { data: userData, error: userError } = await userClient.auth.getUser();
  if (userError || !userData.user) return jsonResponse({ error: "Sessão expirada." }, 401);

  let body: { action?: string; params?: JsonObject };
  try {
    body = await req.json();
  } catch {
    return jsonResponse({ error: "JSON inválido." }, 400);
  }

  const params = body.params ?? {};
  let config: ActionConfig;
  try {
    config = getActionConfig(body.action ?? "", params);
  } catch (err) {
    return jsonResponse({ error: err instanceof Error ? err.message : "Integração inválida." }, 400);
  }

  const key = cacheKey(config.action, params);
  const now = new Date().toISOString();

  const { data: cached } = await adminClient
    .from("api_cache")
    .select("response_data, expires_at, updated_at")
    .eq("owner_id", userData.user.id)
    .eq("provider", config.provider)
    .eq("cache_key", key)
    .maybeSingle();

  if (cached && (!cached.expires_at || new Date(cached.expires_at) > new Date())) {
    return jsonResponse({
      provider: config.provider,
      action: config.action,
      params,
      data: cached.response_data,
      cached: true,
      fetchedAt: cached.updated_at,
    });
  }

  try {
    const data = await config.fetcher(params);

    await adminClient.from("api_cache").upsert(
      {
        owner_id: userData.user.id,
        provider: config.provider,
        cache_key: key,
        request_params: params,
        response_data: data,
        expires_at: expiresIn(config.ttlDays),
        updated_at: now,
      },
      { onConflict: "owner_id,provider,cache_key" },
    );

    await adminClient.from("integration_logs").insert({
      owner_id: userData.user.id,
      provider: config.provider,
      action: config.action,
      status: "success",
      request_params: params,
    });

    return jsonResponse({ provider: config.provider, action: config.action, params, data, cached: false, fetchedAt: now });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Falha desconhecida.";
    await adminClient.from("integration_logs").insert({
      owner_id: userData.user.id,
      provider: config.provider,
      action: config.action,
      status: "error",
      request_params: params,
      error_message: message,
    });
    return jsonResponse({ error: message }, 502);
  }
});
