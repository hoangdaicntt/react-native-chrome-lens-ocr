import LensRN from './src/index.js';
import { inspect } from 'node:util';
import { Buffer } from 'node:buffer';
import { imageDimensionsFromData } from 'image-dimensions';

if (!globalThis.fetch) {
    throw new Error('Global fetch is not available. Run on Node.js 18+ or provide a fetch polyfill before executing this test.');
}

if (!globalThis.atob) {
    globalThis.atob = (base64: string): string => Buffer.from(base64, 'base64').toString('binary');
}

const lens = new LensRN();
const log = (data: unknown): void => console.log(inspect(data, { depth: null, colors: true }));

const REMOTE_IMAGE_URL = 'https://i.pinimg.com/736x/f8/bf/e7/f8bfe74729abbc71953e3bba41d162ca.jpg';
const SAMPLE_URI = 'file:///downloaded/sample.png';

interface SamplePayload {
    bytes: Uint8Array;
    base64: string;
    width: number;
    height: number;
    mimeType: string;
}

const downloadImagePayload = async (url: string): Promise<SamplePayload> => {
    const response = await fetch(url);
    if (!response.ok) {
        throw new Error(`Failed to download image: ${response.status} ${response.statusText}`);
    }

    const arrayBuffer = await response.arrayBuffer();
    const bytes = new Uint8Array(arrayBuffer);
    const dimensions = imageDimensionsFromData(bytes);

    if (!dimensions?.width || !dimensions?.height) {
        throw new Error('Unable to detect image dimensions from downloaded image.');
    }

    const mimeTypeHeader = response.headers.get('content-type');
    const mimeType = mimeTypeHeader?.split(';')[0] ?? 'image/jpeg';
    const base64 = Buffer.from(bytes).toString('base64');

    return {
        bytes,
        base64,
        width: dimensions.width,
        height: dimensions.height,
        mimeType,
    };
};

const run = async (): Promise<void> => {
    let payload: SamplePayload;

    try {
        console.log('--- downloading sample image ---');
        payload = await downloadImagePayload(REMOTE_IMAGE_URL);
        console.log('Downloaded image metadata:', {
            width: payload.width,
            height: payload.height,
            mimeType: payload.mimeType,
            base64Length: payload.base64.length,
        });
    } catch (error) {
        console.error('Image download failed:', error);
        return;
    }

    try {
        console.log('--- scanRemote ---');
        const remote = await lens.scanRemote(REMOTE_IMAGE_URL);
        log(remote);
    } catch (error) {
        console.error('scanRemote failed:', error);
    }

    try {
        console.log('--- scanBase64 ---');
        const base64 = await lens.scanBase64(payload.base64, payload.mimeType, payload.width, payload.height);
        log(base64);
    } catch (error) {
        console.error('scanBase64 failed:', error);
    }

    try {
        console.log('--- scanFile ---');
        const file = await lens.scanFile(SAMPLE_URI, {
            bytes: payload.bytes,
            mimeType: payload.mimeType,
            width: payload.width,
            height: payload.height,
        });
        log(file);
    } catch (error) {
        console.error('scanFile failed:', error);
    }
};

void run();
