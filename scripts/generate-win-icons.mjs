import fs from 'fs';
import path from 'path';
import zlib from 'zlib';

function crc32(buf) {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    c ^= buf[i];
    for (let k = 0; k < 8; k++) {
      c = (c >>> 1) ^ (c & 1 ? 0xedb88320 : 0);
    }
  }
  return (c ^ 0xffffffff) >>> 0;
}

function pngChunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length, 0);
  const typeBuf = Buffer.from(type, 'ascii');
  const crcBuf = Buffer.alloc(4);
  crcBuf.writeUInt32BE(crc32(Buffer.concat([typeBuf, data])), 0);
  return Buffer.concat([len, typeBuf, data, crcBuf]);
}

function encodePng(size, rgba) {
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(size, 0);
  ihdr.writeUInt32BE(size, 4);
  ihdr[8] = 8;
  ihdr[9] = 6;

  const stride = size * 4 + 1;
  const raw = Buffer.alloc(stride * size);
  for (let y = 0; y < size; y++) {
    raw[y * stride] = 0;
    rgba.copy(raw, y * stride + 1, y * size * 4, (y + 1) * size * 4);
  }
  const compressed = zlib.deflateSync(raw, { level: 9 });

  return Buffer.concat([
    signature,
    pngChunk('IHDR', ihdr),
    pngChunk('IDAT', compressed),
    pngChunk('IEND', Buffer.alloc(0)),
  ]);
}

function createBmpDibEntry(size, rgba) {
  const header = Buffer.alloc(40, 0);
  header.writeUInt32LE(40, 0); // biSize
  header.writeInt32LE(size, 4); // biWidth
  header.writeInt32LE(size * 2, 8); // biHeight (XOR + AND)
  header.writeUInt16LE(1, 12); // biPlanes
  header.writeUInt16LE(32, 14); // biBitCount
  header.writeUInt32LE(0, 16); // BI_RGB
  header.writeUInt32LE(size * size * 4, 20); // biSizeImage

  const xorMask = Buffer.alloc(size * size * 4);
  for (let y = 0; y < size; y++) {
    const srcRow = size - 1 - y; // bottom-up
    for (let x = 0; x < size; x++) {
      const srcIdx = (srcRow * size + x) * 4;
      const dstIdx = (y * size + x) * 4;
      xorMask[dstIdx] = rgba[srcIdx + 2]; // B
      xorMask[dstIdx + 1] = rgba[srcIdx + 1]; // G
      xorMask[dstIdx + 2] = rgba[srcIdx]; // R
      xorMask[dstIdx + 3] = rgba[srcIdx + 3]; // A
    }
  }

  const andRowStride = Math.ceil(size / 32) * 4;
  const andMask = Buffer.alloc(andRowStride * size, 0);
  return Buffer.concat([header, xorMask, andMask]);
}

function createMultiResIco(images) {
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0);
  header.writeUInt16LE(1, 2); // ICO
  header.writeUInt16LE(images.length, 4);

  let offset = 6 + images.length * 16;
  const entries = [];
  const payloads = [];

  for (const img of images) {
    const entry = Buffer.alloc(16, 0);
    entry[0] = img.size >= 256 ? 0 : img.size;
    entry[1] = img.size >= 256 ? 0 : img.size;
    entry.writeUInt16LE(1, 4);
    entry.writeUInt16LE(32, 6);
    entry.writeUInt32LE(img.buffer.length, 8);
    entry.writeUInt32LE(offset, 12);
    entries.push(entry);
    payloads.push(img.buffer);
    offset += img.buffer.length;
  }

  return Buffer.concat([header, ...entries, ...payloads]);
}

function blendPixel(buf, size, x, y, r, g, b, alpha) {
  if (x < 0 || x >= size || y < 0 || y >= size || alpha <= 0) return;
  const a = Math.min(1, Math.max(0, alpha));
  const idx = (y * size + x) * 4;
  const dstA = buf[idx + 3] / 255;
  const outA = a + dstA * (1 - a);
  if (outA <= 0) return;

  buf[idx] = Math.round((r * a + buf[idx] * dstA * (1 - a)) / outA);
  buf[idx + 1] = Math.round((g * a + buf[idx + 1] * dstA * (1 - a)) / outA);
  buf[idx + 2] = Math.round((b * a + buf[idx + 2] * dstA * (1 - a)) / outA);
  buf[idx + 3] = Math.round(outA * 255);
}

function roundedRectSdf(px, py, cx, cy, hw, hh, r) {
  const qx = Math.abs(px - cx) - (hw - r);
  const qy = Math.abs(py - cy) - (hh - r);
  const dx = Math.max(qx, 0);
  const dy = Math.max(qy, 0);
  return Math.hypot(dx, dy) + Math.min(Math.max(qx, qy), 0) - r;
}

function renderMihrabIconAtSize(size) {
  const rgba = Buffer.alloc(size * size * 4, 0);
  const scale = size / 256;
  const center = 128;

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const px = (x + 0.5) / scale;
      const py = (y + 0.5) / scale;

      const bgDist = roundedRectSdf(px, py, center, center, 118, 118, 52) * scale;
      if (bgDist < 1) {
        const bgAlpha = Math.min(1, Math.max(0, 0.5 - bgDist));
        const grad = (py / 256) * 0.16;
        const r = Math.round(15 * (1 - grad) + 10 * grad);
        const g = Math.round(110 * (1 - grad) + 78 * grad);
        const b = Math.round(86 * (1 - grad) + 62 * grad);
        blendPixel(rgba, size, x, y, r, g, b, bgAlpha);

        const ringDist = Math.abs(Math.hypot(px - center, py - center) - 96) * scale;
        const ringThickness = Math.max(1, 2.2 * scale);
        if (ringDist < ringThickness + 1) {
          const ringAlpha =
            Math.min(1, Math.max(0, ringThickness - ringDist)) * 0.75;
          blendPixel(rgba, size, x, y, 212, 168, 83, ringAlpha * bgAlpha);
        }

        const outerCrescent = (Math.hypot(px - 122, py - 128) - 58) * scale;
        const innerCrescent = (Math.hypot(px - 144, py - 118) - 47) * scale;
        const crescentDist = Math.max(outerCrescent, -innerCrescent);
        if (crescentDist < 1) {
          const cAlpha = Math.min(1, Math.max(0, 0.5 - crescentDist));
          blendPixel(rgba, size, x, y, 250, 249, 246, cAlpha);
        }

        const sx = px - 166;
        const sy = py - 98;
        const sr = Math.hypot(sx, sy);
        if (sr < 20) {
          const ang = Math.atan2(sy, sx);
          const starRadius = 8 + 7 * Math.pow(Math.abs(Math.cos(ang * 2.5)), 2.5);
          const starDist = (sr - starRadius) * scale;
          if (starDist < 1) {
            const sAlpha = Math.min(1, Math.max(0, 0.5 - starDist));
            blendPixel(rgba, size, x, y, 234, 198, 122, sAlpha);
          }
        }
      }
    }
  }

  return rgba;
}

const outDir = path.resolve(process.cwd(), 'electron');
fs.mkdirSync(outDir, { recursive: true });

const png256 = encodePng(256, renderMihrabIconAtSize(256));
fs.writeFileSync(path.join(outDir, 'icon.png'), png256);

const icoEntries = [
  { size: 16, buffer: createBmpDibEntry(16, renderMihrabIconAtSize(16)) },
  { size: 32, buffer: createBmpDibEntry(32, renderMihrabIconAtSize(32)) },
  { size: 48, buffer: createBmpDibEntry(48, renderMihrabIconAtSize(48)) },
  { size: 64, buffer: createBmpDibEntry(64, renderMihrabIconAtSize(64)) },
  { size: 256, buffer: png256 },
];

fs.writeFileSync(path.join(outDir, 'icon.ico'), createMultiResIco(icoEntries));
console.log('Çok çözünürlüklü Windows simgeleri oluşturuldu (16/32/48/64/256): electron/icon.ico');
