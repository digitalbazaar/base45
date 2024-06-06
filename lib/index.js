/*!
 * Copyright (c) 2024 Digital Bazaar, Inc. All rights reserved.
 */
// RFC 9285 The Base45 Data Encoding
// https://www.rfc-editor.org/rfc/rfc9285

// base45 alphabet (RFC 9285)
const encodeTable = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ $%*+-./:';
const decodeTable = new Uint8Array(256);

// build decode table, using 0xFF as invalid value.
decodeTable.fill(0xFF);
for(let i = 0; i < encodeTable.length; ++i) {
  decodeTable[encodeTable.charCodeAt(i)] = i;
}

/**
 * Encodes a Uint8Array to a string using the RFC 9285 base45 algorithm.
 *
 * @param {Uint8Array} input - The bytes to encode in a Uint8Array.
 *
 * @returns {string} The base45-encoded output string.
 */
export function encode(input) {
  if(!(input instanceof Uint8Array)) {
    throw new TypeError('"input" must be a Uint8Array.');
  }
  if(input.length === 0) {
    return '';
  }

  let output = '';

  const inputView = new DataView(input.buffer);
  for(let i = 0; i < Math.floor(input.length / 2); ++i) {
    const d = inputView.getUint16(i * 2);
    output += encodeTable[d % 45];
    output += encodeTable[Math.floor(d / 45) % 45];
    output += encodeTable[Math.floor(d / (45 * 45)) % 45];
  }
  if(input.length % 2) {
    const d = inputView.getUint8(input.length - 1);
    output += encodeTable[d % 45];
    output += encodeTable[Math.floor(d / 45) % 45];
  }

  return output;
}

/**
 * Decodes a string to a Uint8Array using the RFC 9285 base45 algorithm.
 *
 * @param {string} input - The base45-encoded input string.
 *
 * @returns {Uint8Array} The decoded bytes in a Uint8Array.
 */
export function decode(input) {
  if(typeof input !== 'string') {
    throw new TypeError('"input" must be a string.');
  }
  if(input.length === 0) {
    return new Uint8Array();
  }

  const odd = input.length % 3;
  if(odd === 1) {
    throw new RangeError('Invalid input length.');
  }
  const output = new Uint8Array(
    Math.floor(input.length / 3) * 2 + (odd ? 1 : 0));
  const outputView = new DataView(output.buffer);

  for(let i = 0; i < Math.floor(input.length / 3); ++i) {
    const d0 = _decodeChar(input.charCodeAt(i * 3));
    const d1 = _decodeChar(input.charCodeAt(i * 3 + 1));
    const d2 = _decodeChar(input.charCodeAt(i * 3 + 2));
    const value = d0 + (d1 * 45) + (d2 * 45 * 45);
    if(value > 0xFFFF) {
      throw new RangeError('Invalid decoded value.');
    }
    outputView.setUint16(i * 2, value);
  }
  if(input.length % 3) {
    const d0 = _decodeChar(input.charCodeAt(input.length - 2));
    const d1 = _decodeChar(input.charCodeAt(input.length - 1));
    const value = d0 + (d1 * 45);
    if(value > 0xFF) {
      throw new RangeError('Invalid decoded value.');
    }
    outputView.setUint8(output.length - 1, value);
  }

  return output;
}

// decode one char and check validity
function _decodeChar(c) {
  const d = decodeTable[c];
  if(d === 0xFF) {
    throw new RangeError('Invalid input character.');
  }
  return d;
}
