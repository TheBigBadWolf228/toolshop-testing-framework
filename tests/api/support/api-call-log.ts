import type { APIRequestContext, APIResponse } from '@playwright/test';

type FetchTarget = Parameters<APIRequestContext['fetch']>[0];

interface RequestOptions {
  data?: unknown;
  headers?: Record<string, string>;
  method?: string;
}

const SECRET_KEYS: readonly string[] = ['password', 'access_token', 'token'];
const MAX_BODY_CHARS = 2_000;
const REDACTED = '<redacted>';
const TOKEN_PLACEHOLDER = 'Bearer $TOKEN';
const FIRST_FAILED_STATUS = 400;
const RECORDED_METHODS: readonly string[] = [
  'get',
  'post',
  'put',
  'patch',
  'delete',
  'head',
];

export interface ApiCall {
  method: string;
  url: string;
  requestHeaders: Record<string, string>;
  requestBody?: unknown;
  status: number;
  responseBody: string;
  durationMs: number;
}

export class ApiCallLog {
  private readonly calls: ApiCall[] = [];

  record(call: ApiCall): void {
    this.calls.push(call);
  }

  get isEmpty(): boolean {
    return this.shownCalls().length === 0;
  }

  toMarkdown(): string {
    return this.shownCalls()
      .map((call, index) => formatCall(call, index + 1))
      .join('\n\n');
  }

  private shownCalls(): ApiCall[] {
    const seen = new Set<string>();
    return this.calls.filter((call) => {
      if (call.status < FIRST_FAILED_STATUS) {
        return true;
      }
      if (isUnauthorizedWithoutToken(call)) {
        return false;
      }
      const key = [call.method, call.url, call.status, call.responseBody].join(
        ' '
      );
      if (seen.has(key)) {
        return false;
      }
      seen.add(key);
      return true;
    });
  }
}

export function recordCalls(
  request: APIRequestContext,
  log: ApiCallLog,
  headers: Record<string, string>
): APIRequestContext {
  const record = async (
    method: string,
    options: RequestOptions,
    send: () => Promise<APIResponse>
  ): Promise<APIResponse> => {
    const started = Date.now();
    const response = await send();
    const durationMs = Date.now() - started;
    log.record({
      method,
      url: response.url(),
      requestHeaders: { ...headers, ...options.headers },
      requestBody: options.data,
      status: response.status(),
      responseBody: await response.text(),
      durationMs,
    });
    return response;
  };

  return new Proxy(request, {
    get(target, property) {
      const value = Reflect.get(target, property);
      if (typeof value !== 'function') {
        return value;
      }
      const call = value.bind(target);
      if (property === 'fetch') {
        return (resource: FetchTarget, options: RequestOptions = {}) =>
          record(fetchMethod(resource, options), options, () =>
            call(resource, options)
          );
      }
      if (typeof property === 'string' && RECORDED_METHODS.includes(property)) {
        return (url: string, options: RequestOptions = {}) =>
          record(property.toUpperCase(), options, () => call(url, options));
      }
      return call;
    },
  });
}

function fetchMethod(resource: FetchTarget, options: RequestOptions): string {
  const method =
    options.method ??
    (typeof resource === 'string' ? 'GET' : resource.method());
  return method.toUpperCase();
}

export function toCurl(call: ApiCall): string {
  const headers = Object.entries(call.requestHeaders).map(([name, value]) =>
    isAuthorization(name)
      ? `-H "${name}: ${TOKEN_PLACEHOLDER}"`
      : `-H ${shellQuote(`${name}: ${value}`)}`
  );
  const body =
    call.requestBody === undefined
      ? []
      : [
          `--data ${shellQuote(JSON.stringify(redact(parse(call.requestBody))))}`,
        ];
  return [
    `curl -X ${call.method} ${shellQuote(call.url)}`,
    ...headers,
    ...body,
  ].join(' \\\n  ');
}

function formatCall(call: ApiCall, number: number): string {
  const { pathname, search } = new URL(call.url);
  const summary = `${number}. ${call.method} ${pathname}${search} → ${call.status} (${call.durationMs} ms)`;
  if (call.status < FIRST_FAILED_STATUS) {
    return summary;
  }
  const sections = [`### ${summary}`];
  if (call.requestBody !== undefined) {
    sections.push(`Request:\n${bodyBlock(call.requestBody)}`);
  }
  sections.push(`Response:\n${bodyBlock(call.responseBody)}`);
  sections.push(codeBlock('bash', toCurl(call)));
  return sections.join('\n\n');
}

function isUnauthorizedWithoutToken(call: ApiCall): boolean {
  return (
    call.status === 401 &&
    !Object.keys(call.requestHeaders).some(isAuthorization)
  );
}

function bodyBlock(body: unknown): string {
  const value = redact(parse(body));
  const text =
    typeof value === 'string' ? value : JSON.stringify(value, null, 2);
  const shown =
    text.length > MAX_BODY_CHARS
      ? `${text.slice(0, MAX_BODY_CHARS)}\n… (${text.length - MAX_BODY_CHARS} more chars)`
      : text;
  return codeBlock(typeof value === 'string' ? 'text' : 'json', shown);
}

function parse(body: unknown): unknown {
  if (typeof body !== 'string') {
    return body;
  }
  try {
    return JSON.parse(body);
  } catch {
    return body;
  }
}

function redact(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map(redact);
  }
  if (value !== null && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value).map(([key, inner]) => [
        key,
        SECRET_KEYS.includes(key) ? REDACTED : redact(inner),
      ])
    );
  }
  return value;
}

function isAuthorization(header: string): boolean {
  return header.toLowerCase() === 'authorization';
}

function shellQuote(text: string): string {
  return `'${text.replaceAll("'", `'\\''`)}'`;
}

function codeBlock(language: string, text: string): string {
  return `\`\`\`${language}\n${text}\n\`\`\``;
}
