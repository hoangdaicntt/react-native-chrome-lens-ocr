declare module 'set-cookie-parser' {
  export interface Cookie {
    name: string;
    value: string;
    path?: string;
    domain?: string;
    expires?: Date | number;
    maxAge?: number;
    secure?: boolean;
    httpOnly?: boolean;
    sameSite?: 'Strict' | 'Lax' | 'None' | string;
    partitioned?: boolean;
    priority?: string;
  }

  export interface CookieParseOptions {
    decodeValues?: boolean;
    map?: boolean;
  }

  export function parse(
    input: string | string[],
    options?: CookieParseOptions & { map: true }
  ): Record<string, Cookie>;

  export function parse(
    input: string | string[],
    options?: CookieParseOptions
  ): Cookie[];

  export function splitCookiesString(input: string | string[]): string[];

  export interface SetCookieParser {
    parse: typeof parse;
    splitCookiesString: typeof splitCookiesString;
  }

  const setCookie: SetCookieParser;
  export default setCookie;
}
