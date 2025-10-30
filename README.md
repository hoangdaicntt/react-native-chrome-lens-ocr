# react-native-chrome-lens-ocr

React Native-ready wrapper around the Chrome Lens protobuf API. This library exposes the same OCR capabilities Google Lens uses, without depending on a headless browser. The package bundles lightweight TypeScript utilities and works on Expo or bare React Native projects that provide a `fetch` implementation. It is forked from [dimdenGD/chrome-lens-ocr](https://github.com/dimdenGD/chrome-lens-ocr) and adapted for React Native usage.


## Features
- Pure TypeScript ESM build designed for React Native environments.
- Remote URL, base64, and in-memory byte scanning helpers.
- Fine-grained access to bounding boxes, language hints, and raw proto responses through `LensCore`.
- Ships with pre-generated protobuf definitions so no compilation step is required at runtime.

## Installation

```bash
npm install react-native-chrome-lens-ocr
# or
yarn add react-native-chrome-lens-ocr
```

The package targets ES2020 and relies on the global `fetch`, `Headers`, and `atob` APIs that React Native provides out of the box. If you target older environments, polyfill these before creating an instance.

## Quick Start

```ts
import Lens from 'react-native-chrome-lens-ocr';

const lens = new Lens();

// Scan a publicly available image
const result = await lens.scanRemote('https://example.com/photo.png');
console.log(result.language);
console.log(result.segments[0]?.text);
```

### Base64 Input

```ts
const lens = new Lens();
const { uri, base64, width, height } = await ImagePicker.launchImageLibraryAsync({ base64: true });

if (!base64 || !width || !height) throw new Error('Image picker did not return base64 or dimensions');

const ocr = await lens.scanBase64(base64, 'image/jpeg', width, height);
```

### File Input (React Native)

React Native does not expose direct filesystem access in JavaScript by default. To scan local files, read them into memory (e.g. using `react-native-fs`) and pass them in via `scanFile`:

```ts
import Lens from 'react-native-chrome-lens-ocr';
import RNFS from 'react-native-fs';

const lens = new Lens();

const filePath = `${RNFS.DocumentDirectoryPath}/receipt.jpg`;
const base64 = await RNFS.readFile(filePath, 'base64');

const result = await lens.scanFile(filePath, {
  base64,
  mimeType: 'image/jpeg',
  width: 1080,
  height: 1920,
});
```

## API Overview

The default export is `LensRN`, which extends `LensCore` with React Native-friendly helpers.

### `new LensRN(options?: LensInitOptions)`
Optional configuration lets you tune the Chrome version headers, user agent, target language, and endpoint overrides. See `src/types.ts` for the full shape.

### `scanRemote(url: string | URL): Promise<LensResult>`
Downloads the image using `fetch` and scans it.

### `scanBase64(base64: string, mimeType: string, width: number, height: number): Promise<LensResult>`
Accepts base64-encoded image content alongside its MIME type and dimensions.

### `scanFile(uri: string, options: ScanFileOptions): Promise<LensResult>`
For React Native, supply either `options.base64` or `options.bytes` plus the image dimensions if they cannot be inferred.

### Working Directly With `LensCore`

Import `LensCore` for lower-level control or to integrate outside React Native:

```ts
import { default as LensRN, LensCore, LensResult, Segment, BoundingBox } from 'react-native-chrome-lens-ocr';
```

`LensCore` exposes `scanByURL`, `scanByData`, cookie management helpers, and raw protobuf handling for advanced use cases.

## Building from Source

The repository ships with an esbuild + TypeScript pipeline:

```bash
yarn install
yarn build
```

This produces ESM bundles and declaration files in `dist/`, which are the only assets published to npm.

## Contributing

1. Fork https://github.com/hoangdaicntt/react-native-chrome-lens-ocr.
2. Create a feature branch.
3. Run `yarn build` to ensure the generated output matches expectations.
4. Submit a pull request with clear motivation and testing notes.

Bug reports and feature requests are welcome via GitHub issues.

## Donate

If this project helps you, consider buying me a coffee: https://paypal.me/hoangdai1908

## License

ISC © [hoangdaicntt](https://github.com/hoangdaicntt)
