import type { EXT_TO_MIME, MIME_TO_EXT, SUPPORTED_MIMES } from './consts.js';

export type SupportedMime = (typeof SUPPORTED_MIMES)[number];

export type MimeKey = keyof typeof MIME_TO_EXT;
export type ExtKey = keyof typeof EXT_TO_MIME;

export type Viewport = [number, number];

export interface LensInitOptions {
    chromeVersion?: string;
    majorChromeVersion?: string;
    userAgent?: string;
    endpoint?: string;
    viewport?: Viewport;
    headers?: Record<string, string | undefined>;
    fetchOptions?: RequestInit;
    targetLanguage?: string;
    region?: string;
    timeZone?: string;
}

export interface LensResolvedConfig {
    chromeVersion: string;
    majorChromeVersion: string;
    userAgent: string;
    endpoint: string;
    viewport: Viewport;
    headers: Record<string, string>;
    fetchOptions: RequestInit;
    targetLanguage: string;
    region?: string;
    timeZone?: string;
}

export interface CookieDetail {
    name: string;
    value: string;
    expires: number;
    domain?: string;
    path?: string;
}

export type CookieStore = Record<string, CookieDetail>;

export interface BoundingBoxPixelCoords {
    x: number;
    y: number;
    width: number;
    height: number;
}

export interface ScanFileOptions {
    base64?: string;
    bytes?: Uint8Array;
    mimeType?: string;
    width?: number;
    height?: number;
}

export type FetchFunction = (input: RequestInfo | URL, init?: RequestInit) => Promise<Response>;
