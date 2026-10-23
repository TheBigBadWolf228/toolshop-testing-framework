const SECRET_KEYS: readonly string[] = ['password', 'access_token', 'token'];
const MAX_BODY_CHARS = 2_000;
const REDACTED = '<redacted>';
const TOKEN_PLACEHOLDER = 'Bearer $TOKEN';

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
    return this.calls.length === 0;
  }

  toMarkdown(): string {
    return this.calls
      .map((call, index) => formatCall(call, index + 1))
      .join('\n\n');
  }
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
  const sections = [
    `### ${number}. ${call.method} ${pathname}${search} → ${call.status} (${call.durationMs} ms)`,
  ];
  if (call.requestBody !== undefined) {
    sections.push(`Request:\n${bodyBlock(call.requestBody)}`);
  }
  sections.push(`Response:\n${bodyBlock(call.responseBody)}`);
  sections.push(codeBlock('bash', toCurl(call)));
  return sections.join('\n\n');
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
