# Chrome Lens OCR
Library to use Google Lens OCR for free, via API used in Chromium. This doesn't require running a headless browser, and is much faster than using Puppeteer or similar.
It's set up to work without any options, there's no need to be authorized (no need for Google account!).

## Installation
```bash
npm install chrome-lens-ocr
```

## Usage
```javascript
import Lens from 'chrome-lens-ocr';
import { inspect } from 'util';

const lens = new Lens();
const log = data => console.log(inspect(data, { depth: null, colors: true }));

lens.scanByFile('shrimple.png').then(log).catch(console.error);
lens.scanByBuffer(Buffer.from('...')).then(log).catch(console.error);
// fetches image and then scans it
lens.scanByURL('https://lune.dimden.dev/7949f833fa42.png').then(log).catch(console.error);
```
All methods above return `LensResult` object (see docs below). In case error happened during the process, `LensError` will be thrown.

![Example output](https://lune.dimden.dev/1454b73026ab.png)

## API
All of the classes are exported. `Lens` is the default export, and `LensCore`, `LensResult`, `Segment`, `BoundingBox` and `LensError` are named exports.
### class Lens extends LensCore
#### `constructor(options?: Object): Lens`
Creates a new instance of Lens. `options` is optional.

#### `scanByFile(path: String): Promise<LensResult>`
Scans an image from a file.

#### `scanByBuffer(buffer: Buffer): Promise<LensResult>`
Scans an image from a buffer.

### class LensCore
This is the core class, which is extended by `Lens`. You can use it if you want to use the library in environments that don't support Node.js APIs, as it doesn't include `scanByFile` and `scanByBuffer` methods. Keep in mind that `Lens` class extends `LensCore`, so all methods and properties of `LensCore` are available in `Lens`.

#### `constructor(options?: Object, fetch?: Function): LensCore`
Creates a new instance of LensCore. `options` is optional. `fetch` is function that will be used to send requests, by default it's `fetch` from global scope.

#### `scanByURL(url: String): Promise<LensResult>`
Fetches an image from a remote URL, and scans it.

#### `scanByData(data: Uint8Array, mime: String, originalDimensions: Array): Promise<LensResult>`
Scans an image from a Uint8Array. `originalDimensions` is array of `[width, height]` format. You must provide width and height of image before it was resized to get accurate pixel coordinates. You should only use this method if you're using the library in environments that don't support Node.js APIs, because it doesn't automatically resize images to less than 1000x1000 dimensions, like methods in `Lens` do.

#### `updateOptions(options: Object): void`
Updates the options for the instance.

#### `fetch(options?: RequestInit & { endpoint: String } = {}, originalDimensions: Array): Promise<LensResult>`
Internal method to send a request to the API. You can use it to send a custom request, but you'll have to handle the formdata and dimensions yourself. Original dimensions (`[width, height]`) are used to calculate pixel coordinates of the text. You should supply dimensions before any resizing (hence 'original') if you want to get correct coordinates for original image.

#### `cookies`
This property contains object with cookies that are set for the instance. You can use it to save and load cookies to avoid doing the consent process every time.

### Options object
Options can be empty, or contain the following (default values):
```javascript
{
  chromeVersion: '124.0.6367.60', // Version of Chromium to "use"
  userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36', // user agent to use, major Chrome version should match the previous value
  headers: {}, // you can add headers here, they'll override the default ones
  fetchOptions: {}, // options to pass to fetch function (like agent, dispatcher, etc.)
}
```

### class LensResult
Instance of this class is is returned by all scan methods. It contains the following properties:
```javascript
{
  language: String, // language of the text in 2-letter format
  segments: Array<Segment>
}
```

### class Segment
Instance of this class is contained in `LensResult`'s `segments` property. It contains the following properties:
```javascript
{
  text: String, // text of the segment
  boundingBox: BoundingBox,
}
```

### class BoundingBox
Instance of this class is contained in `Segment`'s `boundingBox` property. It contains the following properties:
```javascript
{
  centerPerX: Number, // center of the bounding box on X axis, in % of the image width
  centerPerY: Number, // center of the bounding box on Y axis, in % of the image height
  perWidth: Number, // width of the bounding box, in % of the image width
  perHeight: Number, // height of the bounding box, in % of the image height
  pixelCoords: {
    x: Number, // top-left corner X coordinate, in pixels
    y: Number, // top-left corner Y coordinate, in pixels
    width: Number, // width of the bounding box, in pixels
    height: Number, // height of the bounding box, in pixels
  }
}
```

### class LensError extends Error
Instance of this class is thrown when an error happens during the process. It contains the following properties:
```javascript
{
  name: "LensError"
  message: String, // error message
  code: String, // error code
  headers: HeadersList, // headers of the response
  body: String, // body of the response
}
```

## Using proxy
By default, this library relies on the global `fetch` implementation (for example, the one bundled with Node.js 18+). If you want to add a proxy by using `undici`, install it separately and pass the dispatcher through `fetchOptions`:
```javascript
import Lens from 'chrome-lens-ocr';
import { ProxyAgent } from 'undici';

const lens = new Lens({
  fetchOptions: {
    dispatcher: new ProxyAgent('http://user:pass@example.com:8080')
  }
});
```
If you use core class with a different fetch function, you can pass whatever options that implementation expects instead of `dispatcher` in `fetchOptions` (for example `agent` for node-fetch).

## Using your cookies
You can use your own cookies to be authorized in Google. This is optional. Here's an example:
```javascript
import Lens from 'chrome-lens-ocr';

const lens = new Lens({
    headers: {
        // 'cookie' is the only 'special' header that can also accept an object, all other headers should be strings
        'cookie': '__Secure-ENID=17.SE=-dizH-; NID=511=---bcDwC4fo0--lgfi0n2-' // way #1
        'cookie': { // way #2, better because you can set expiration date and it will be automatically handled, all 3 fields are required in this way
            '__Secure-ENID': {
                name: '__Secure-ENID',
                value: '17.SE=-dizH-',
                expires: 1634025600,
            },
            'NID': {
                name: 'NID',
                value: '511=---bcDwC4fo0--lgfi0n2-',
                expires: 1634025600,
            }
        }
    }
});
```
