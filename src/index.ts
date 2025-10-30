import { imageDimensionsFromData } from 'image-dimensions';
import LensCore, { BoundingBox, LensError, LensResult, Segment } from './core.js';
import type { LensInitOptions, ScanFileOptions } from './types.js';

export { LensResult, LensError, Segment, BoundingBox };

/**
 * React Native wrapper for LensCore
 * Provides methods for OCR in React Native environment without Node.js dependencies
 */
export default class LensRN extends LensCore {
    constructor(config: LensInitOptions = {}) {
        if (config && typeof config !== 'object') {
            console.warn('LensRN constructor expects an object, got', typeof config);
            config = {};
        }

        const fetchFn = globalThis.fetch?.bind(globalThis);
        if (!fetchFn) {
            throw new Error('Global fetch is not available in this environment');
        }

        super(config, fetchFn);
    }

    async scanRemote(url: string | URL): Promise<LensResult> {
        return this.scanByURL(url);
    }

    async scanBase64(base64String: string, mimeType: string, width: number, height: number): Promise<LensResult> {
        if (typeof base64String !== 'string') {
            throw new TypeError('base64String must be a string');
        }
        if (typeof mimeType !== 'string') {
            throw new TypeError('mimeType must be a string');
        }
        if (!Number.isFinite(width) || !Number.isFinite(height)) {
            throw new TypeError('width and height must be numbers');
        }

        const base64Data = base64String.replace(/^data:image\/\w+;base64,/, '');
        const binaryString = atob(base64Data);
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
            bytes[i] = binaryString.charCodeAt(i);
        }

        return this.scanByData(bytes, mimeType, [width, height]);
    }

    async scanFile(uri: string, options: ScanFileOptions = {}): Promise<LensResult> {
        if (typeof uri !== 'string') {
            throw new TypeError('uri must be a string');
        }

        if (typeof options !== 'object') {
            throw new TypeError('options must be an object');
        }

        let bytes: Uint8Array;
        const mimeType = options.mimeType ?? 'image/jpeg';

        if (typeof options.base64 === 'string') {
            const base64Data = options.base64.replace(/^data:image\/\w+;base64,/, '');
            const binaryString = atob(base64Data);
            bytes = new Uint8Array(binaryString.length);
            for (let i = 0; i < binaryString.length; i++) {
                bytes[i] = binaryString.charCodeAt(i);
            }
        } else if (options.bytes instanceof Uint8Array) {
            bytes = options.bytes;
        } else {
            throw new Error('Either options.base64 or options.bytes must be provided');
        }

        let { width, height } = options;
        if (!width || !height) {
            try {
                const dimensions = imageDimensionsFromData(bytes);
                if (dimensions) {
                    width = dimensions.width;
                    height = dimensions.height;
                }
            } catch (error) {
                console.warn('Could not auto-detect image dimensions:', error);
            }
        }

        if (!width || !height) {
            throw new Error('Image dimensions (width, height) must be provided or detectable from image data');
        }

        return this.scanByData(bytes, mimeType, [width, height]);
    }
}
