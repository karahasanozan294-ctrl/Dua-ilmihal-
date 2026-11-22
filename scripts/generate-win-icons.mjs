import fs from 'fs';
import path from 'path';
import zlib from 'zlib';

const SIZE = 256;

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

function encodePng(width, height, rgba) {
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 6; // RGBA
  ihdr[10] = 0;
  ihdr[11] = 0;
  ihdr[12] = 0;

  const stride = width * 4 + 1;
  const raw = Buffer.alloc(stride * height);
  for (let y = 0; y < height; y++) {
    raw[y * stride] = 0;
    rgba.copy(raw, y * stride + 1, y * width * 4, (y + 1) * width * 4);
  }
  const compressed = zlib.deflateSync(raw, { level: 9 });

  return Buffer.concat([
    signature,
    pngChunk('IHDR', ihdr),
    pngChunk('IDAT', compressed),
    pngChunk('IEND', Buffer.alloc(0)),
  ]);
}

function createIcoFromPng(pngBuffer, width, height) {
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0); // reserved
  header.writeUInt16LE(1, 2); // ICO type
  header.writeUInt16LE(1, 4); // 1 image

  const entry = Buffer.alloc(16);
  entry[0] = width >= 256 ? 0 : width;
  entry[1] = height >= 256 ? 0 : height;
  entry[2] = 0; // palette colors
  entry[3] = 0; // reserved
  entry.writeUInt16LE(1, 4); // color planes
  entry.writeUInt16LE(32, 6); // bits per pixel
  entry.writeUInt32LE(pngBuffer.length, 8);
  entry.writeUInt32LE(22, 12); // image offset (6 + 16)

  return Buffer.concat([header, entry, pngBuffer]);
}

function blendPixel(buf, x, y, r, g, b, alpha) {
  if (x < 0 || x >= SIZE || y < 0 || y >= SIZE || alpha <= 0) return;
  const a = Math.min(1, Math.max(0, alpha));
  const idx = (y * SIZE + x) * 4;
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

function renderMihrabIcon() {
  const rgba = Buffer.alloc(SIZE * SIZE * 4, 0);
  const center = SIZE / 2;

  for (let y = 0; y < SIZE; y++) {
    for (let x = 0; x < SIZE; x++) {
      const px = x + 0.5;
      const py = y + 0.5;

      // Dış yuvarlatılmış kare (zümrüt yeşili Mihrab amblemi)
      const bgDist = roundedRectSdf(px, py, center, center, 118, 118, 52);
      if (bgDist < 1) {
        const bgAlpha = Math.min(1, Math.max(0, 0.5 - bgDist));
        const grad = (py / SIZE) * 0.16;
        const r = Math.round(15 * (1 - grad) + 10 * grad);
        const g = Math.round(110 * (1 - grad) + 78 * grad);
        const b = Math.round(86 * (1 - grad) + 62 * grad);
        blendPixel(rgba, x, y, r, g, b, bgAlpha);

        // İnce altın iç çerçeve halkası
        const ringDist = Math.abs(Math.hypot(px - center, py - center) - 96);
        if (ringDist < 3) {
          const ringAlpha = Math.min(1, Math.max(0, 2.2 - ringDist)) * 0.72;
          blendPixel(rgba, x, y, 212, 168, 83, ringAlpha * bgAlpha);
        }

        // Hilal (iki dairenin farkı)
        const outerCrescent = Math.hypot(px - 122, py - 128) - 58;
        const innerCrescent = Math.hypot(px - 144, py - 118) - 47;
        const crescentDist = Math.max(outerCrescent, -innerCrescent);
        if (crescentDist < 1) {
          const cAlpha = Math.min(1, Math.max(0, 0.5 - crescentDist));
          blendPixel(rgba, x, y, 250, 249, 246, cAlpha);
        }

        // Yıldız (8 köşeli sade yıldız / parlak nokta)
        const sx = px - 166;
        const sy = py - 98;
        const sr = Math.hypot(sx, sy);
        if (sr < 18) {
          const ang = Math.atan2(sy, sx);
          const starRadius = 8 + 7 * Math.pow(Math.abs(Math.cos(ang * 2.5)), 2.5);
          const starDist = sr - starRadius;
          if (starDist < 1) {
            const sAlpha = Math.min(1, Math.max(0, 0.5 - starDist));
            blendPixel(rgba, x, y, 234, 198, 122, sAlpha);
          }
        }
      }
    }
  }

  return rgba;
}

const outDir = path.resolve(process.cwd(), 'electron');
fs.mkdirSync(outDir, { recursive: true });

const rgba = renderMihrabIcon();
const png = encodePng(SIZE, SIZE, rgba);
const ico = createIcoFromPng(png, SIZE, SIZE);

fs.writeFileSync(path.join(outDir, 'icon.png'), png);
fs.writeFileSync(path.join(outDir, 'icon.ico'), ico);
console.log('Windows simgeleri oluşturuldu: electron/icon.png ve electron/icon.ico');
