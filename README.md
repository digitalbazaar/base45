# RFC 9285 Base45 Encoder/Decoder _(@digitalbazaar/base45)_

> Encoder/decoder for [The Base45 Data Encoding][] for [Node.js][] and Web browsers

## Table of Contents

- [Background](#background)
- [Install](#install)
- [Usage](#usage)
- [Security](#security)
- [Contribute](#contribute)
- [Commercial Support](#commercial-support)
- [License](#license)

## Background

This library provides an encoder and decoder for RFC 9285 [The Base45 Encoding
Scheme][] using an alphabet designed for efficient use in QR codes using
Alphanumeric mode. It works in both [Node.js][] and in Web browsers with no
dependencies.

## Install

- Node.js >=18 is supported.

To install for [Node.js][] or in a Web project using npm:

```
npm install @digitalbazaar/base45
```

To install locally or for development:

```
git clone https://github.com/digitalbazaar/base45.git
cd base45
npm install
```

## Usage

```js
import {encode, decode} from '@digitalbazaar/base45';
```

### Encoding

* `encode(input])`
  * **`input`**: `Uint8Array` - bytes to encode
  * Returns a base45 encoded string.

```js
import {encode} from '@digitalbazaar/base45';

const input1 = Uint8Array([1, 2, 3, 4]);
const encoded1 = encode(input1);
// > X507H0
```

### Decoding

* `decode(input)`
  * **`input`**: `String` - string to decode
  * Returns a `Uint8Array` with the decoded bytes.

```js
import {decode} from '@digitalbazaar/base45';

const input2 = 'X507H0';
const decoded2 = decode(input2);
// > Uint8Array [ 1, 2, 3, 4 ]
```

### String Handling

This library uses [Uint8Array][] for encoder input and decoder output.  If
conversion to and from strings is needed it can be done with a variety of tools
such as [TextEncoder][] and [TextDecoder][] using the [Encoding][] standard.

```js
const input3 = new TextEncoder().encode('abc');
const encoded3 = encode(input3);
// > 0EC92

const decoded4 = decode(encoded3);
const output4 = new TextDecoder().decode(decoded4);
// > abc
```

## Security

- Processing large inputs could result in high resource usage.

## Contribute

Please follow the [Bedrock contributing
guidelines](https://github.com/digitalbazaar/bedrock/blob/master/CONTRIBUTING.md).

PRs accepted.

If editing the README, please conform to the
[standard-readme](https://github.com/RichardLitt/standard-readme)
specification.

## Commercial Support

Commercial support for this library is available upon request from
Digital Bazaar: support@digitalbazaar.com

## License

[New BSD License (3-clause)](LICENSE) © Digital Bazaar

[Encoding]: https://encoding.spec.whatwg.org/
[Node.js]: https://nodejs.org/
[TextDecoder]: https://developer.mozilla.org/en-US/docs/Web/API/TextDecoder
[TextEncoder]: https://developer.mozilla.org/en-US/docs/Web/API/TextEncoder
[The Base45 Data Encoding]: https://www.rfc-editor.org/rfc/rfc9285
[Uint8Array]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Uint8Array
