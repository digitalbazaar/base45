/*!
 * Copyright (c) 2020-2024 Digital Bazaar, Inc. All rights reserved.
 */
import chai from 'chai';
import chaiBytes from 'chai-bytes';
chai.use(chaiBytes);
const should = chai.should();

import {decode, encode} from '../lib/index.js';

// https://www.rfc-editor.org/rfc/rfc9285
// test from the spec
const specVectors = [
  [
    'AB',
    'BB8'
  ],
  [
    'Hello!!',
    '%69 VD92EX0'
  ],
  [
    'base-45',
    'UJCLQE7W581'
  ],
  [
    'ietf!',
    'QED8WEX0'
  ],
];

// misc tests
const miscVectors = [
  // basic inputs
  [[], ''],
  ['', ''],
  ['a', '72'],
  ['ab', '0EC'],
  ['abc', '0EC92'],
  [[0x00], '00'],
  [[0x00, 0x00], '000'],
  // tests from https://github.com/multiformats/js-multiformats
  ['Decentralize everything!!', '4T8KPCG/DVKEXVDDLFD44O/EALEAWEZEDV1DX0'],
  ['yes mani !', 'RFF.OEB$D5/DZ24'],
  ['hello world', '+8D VD82EK4F.KEA2'],
  ['\x00yes mani !', 'V206$CL44CEC2DDX0'],
  ['\x00\x00yes mani !', '000RFF.OEB$D5/DZ24'],
];

// tests from README.md
const readmeVectors = [
  [[1, 2, 3, 4], 'X507H0'],
  ['abc', '0EC92'],
];

const testVectors = [
  ...specVectors,
  ...miscVectors,
  ...readmeVectors
].map(([data, result]) => [_toUint8Array(data), result]);

const invalidEncodeVectors = [
  [0, TypeError],
  [123456, TypeError],
  [true, TypeError],
  [3.14159, TypeError],
  [[], TypeError],
  [[0, 1, 2], TypeError],
  [{}, TypeError]
];

// tables from index file, keep in sync
const encodeTable = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ $%*+-./:';
const decodeTable = new Uint8Array(256);

// build decode table, using 0xFF as invalid value.
decodeTable.fill(0xFF);
for(let i = 0; i < encodeTable.length; ++i) {
  decodeTable[encodeTable.charCodeAt(i)] = i;
}

// invalid alphabet chars
const invalidChars = [...[...decodeTable].entries()]
  .filter(v => v[1] === 0xFF)
  .map(v => [`00${String.fromCharCode(v[0])}`, RangeError]);

// invalid lengths
const invalidLengths = [
  ['0', RangeError],
  ['0000', RangeError],
];

// invalid decoded size
const invalidSizes = [
  // check main triplet size
  ['GGW', RangeError], // 0x10000 / 65536 too large
  [':::', RangeError], // 0x163f5 / 91125 too large
  // check trailing triplet size
  ['000V5', RangeError], // 0x100 / 256 too large
  ['000::', RangeError], // 0x7e8 / 2024 too large
];

// misc invalid
const invaildMisc = [
  // every char decode position checks validity
  ['x00', RangeError],
  ['0x0', RangeError],
  ['00x', RangeError],
  ['000x0', RangeError],
  ['0000x', RangeError],
];

const invalidDecodeVectors = [
  ...invalidChars,
  ...invalidLengths,
  ...invalidSizes,
  ...invaildMisc
];

describe('base45-universal APIs', () => {
  describe('encode', () => {
    it('should properly encode', async () => {
      /* eslint-disable-next-line no-unused-vars */
      const results = testVectors.map(([input, _]) => {
        return [
          input,
          encode(input)
        ];
      });
      results.forEach((r, i) => {
        should.exist(r);
        should.exist(r[0], 'result should exist');
        should.exist(r[1], 'expected result should exist');
        r[0].should.equalBytes(testVectors[i][0]);
        r[1].should.equal(testVectors[i][1]);
      });
    });
    it('throws errors on invalid input', async () => {
      invalidEncodeVectors.forEach(([input, expectedError]) => {
        let result;
        let error;
        try {
          result = encode(input);
        } catch(e) {
          error = e;
        }
        should.not.exist(result);
        should.exist(error);
        (error instanceof expectedError).should.be.true;
      });
    });
  }); // end encode

  describe('decode', () => {
    it('should properly decode data', async () => {
      /* eslint-disable-next-line no-unused-vars */
      const results = testVectors.map(([_, encoded]) => {
        return [
          decode(encoded),
          encoded
        ];
      });
      results.forEach((r, i) => {
        should.exist(r);
        should.exist(r[0], 'result should exist');
        should.exist(r[1], 'expected result should exist');
        r[0].should.equalBytes(testVectors[i][0]);
        r[1].should.equal(testVectors[i][1]);
      });
    });
    it('should fail to decode data', async () => {
      invalidDecodeVectors.forEach(([input, expectedError]) => {
        let result;
        let error;
        try {
          result = decode(input);
        } catch(e) {
          error = e;
        }
        should.not.exist(result);
        should.exist(error);
        (error instanceof expectedError).should.be.true;
      });
    });
  }); // end decode
});

function _toUint8Array(data) {
  if(typeof data === 'string') {
    // convert data to Uint8Array
    return new TextEncoder().encode(data);
  }
  if(Array.isArray(data)) {
    return new Uint8Array(data);
  }
  if(!(data instanceof Uint8Array)) {
    throw new TypeError('"data" be a string, Array, or Uint8Array.');
  }
  return data;
}
