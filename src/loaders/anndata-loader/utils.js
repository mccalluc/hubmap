import { extent } from 'd3-array';

const HEADER_LENGTH = 4;

export const readFloat32FromUint8 = (bytes) => {
  if (bytes.length !== 4) {
    throw new Error('readFloat32 only takes in length 4 byte buffers');
  }
  return new Int32Array(bytes.buffer)[0];
};

/**
 * Method for decoding text arrays from zarr.
 * Largerly a port of https://github.com/zarr-developers/numcodecs/blob/2c1aff98e965c3c4747d9881d8b8d4aad91adb3a/numcodecs/vlen.pyx#L135-L178
 * @returns {string[]} An array of strings.
 */
export function parseVlenUtf8(buffer) {
  const decoder = new TextDecoder();
  let data = 0;
  const dataEnd = data + buffer.length;
  const length = readFloat32FromUint8(buffer.slice(data, HEADER_LENGTH));
  if (buffer.length < HEADER_LENGTH) {
    throw new Error('corrupt buffer, missing or truncated header');
  }
  data += HEADER_LENGTH;
  const output = new Array(length);
  for (let i = 0; i < length; i += 1) {
    if (data + 4 > dataEnd) {
      throw new Error('corrupt buffer, data seem truncated');
    }
    const l = readFloat32FromUint8(buffer.slice(data, data + 4));
    data += 4;
    if (data + l > dataEnd) {
      throw new Error('corrupt buffer, data seem truncated');
    }
    output[i] = decoder.decode(buffer.slice(data, data + l));
    data += l;
  }
  return output;
}

export const normalize = (arr) => {
  const [min, max] = extent(arr);
  const ratio = 255 / (max - min);
  const data = new Uint8Array(arr.map(i => Math.floor((i - min) * ratio)));
  return { data };
};

export const concatenateColumnVectors = (arr) => {
  const numCols = arr.length;
  const numRows = arr[0].length;
  const { BYTES_PER_ELEMENT } = arr[0];
  const view = new DataView(
    new ArrayBuffer(numCols * numRows * BYTES_PER_ELEMENT),
  );
  const TypedArray = arr[0].constructor;
  const dtype = TypedArray.name.replace('Array', '');
  for (let i = 0; i < numCols; i += 1) {
    for (let j = 0; j < numRows; j += 1) {
      view[`set${dtype}`](
        BYTES_PER_ELEMENT * (j * numCols + i),
        arr[i][j],
        true,
      );
    }
  }
  return new TypedArray(view.buffer);
};
