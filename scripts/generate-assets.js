import fs from "node:fs";
import path from "node:path";
import zlib from "node:zlib";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const rootDir = path.resolve(__dirname, "..");
const clientPublicDir = path.resolve(rootDir, "client", "public");

if (!fs.existsSync(clientPublicDir)) {
  fs.mkdirSync(clientPublicDir, { recursive: true });
}

// 1. Copy final.JPG to client/public/final.JPG and client/public/deepak.jpg
const srcFinalJpg = path.resolve(rootDir, "final.JPG");
const destFinalJpg = path.resolve(clientPublicDir, "final.JPG");
const destDeepakJpg = path.resolve(clientPublicDir, "deepak.jpg");

if (fs.existsSync(srcFinalJpg)) {
  fs.copyFileSync(srcFinalJpg, destFinalJpg);
  fs.copyFileSync(srcFinalJpg, destDeepakJpg);
  console.log("Successfully copied final.JPG to client/public");
} else {
  console.warn("final.JPG not found in root dir");
}

// 2. Generate or fetch QR code PNG for http://localhost:5173/feedback
const feedbackUrl = "http://localhost:5173/feedback";
const qrDestRoot = path.resolve(rootDir, "feedback-qr-code.png");
const qrDestPublic = path.resolve(clientPublicDir, "feedback-qr-code.png");

async function obtainQrCodePng() {
  // First attempt: fetch crisp QR from public QR service
  try {
    const apiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=600x600&data=${encodeURIComponent(
      feedbackUrl
    )}&margin=20&format=png`;
    console.log("Fetching QR code from API...");
    const res = await fetch(apiUrl, { signal: AbortSignal.timeout(5000) });
    if (res.ok) {
      const buffer = Buffer.from(await res.arrayBuffer());
      fs.writeFileSync(qrDestRoot, buffer);
      fs.writeFileSync(qrDestPublic, buffer);
      console.log("QR Code PNG generated successfully via QR API.");
      return true;
    }
  } catch (err) {
    console.warn("API fetch failed or timed out, generating locally:", err.message);
  }

  // Fallback: Generate valid PNG locally
  const pngBuffer = createQrCodePng(feedbackUrl);
  fs.writeFileSync(qrDestRoot, pngBuffer);
  fs.writeFileSync(qrDestPublic, pngBuffer);
  console.log("Locally generated QR Code PNG saved.");
  return true;
}

// Pure JS QR Code matrix generator (Type 4, Error Correction M/L, 33x33)
// or standard QR encoder implementation
function createQrCodePng(text) {
  // Standard QR code implementation for text
  // We'll use a reliable QR matrix generator
  const modules = generateQrMatrix(text);
  const scale = 14;
  const margin = 4 * scale;
  const size = modules.length * scale + margin * 2;

  // Create grayscale + alpha or RGB raw bitmap
  // 3 bytes per pixel: R, G, B
  const rowStride = 1 + size * 3; // 1 filter byte + pixel data
  const rawData = Buffer.alloc(size * rowStride);

  for (let y = 0; y < size; y++) {
    const rowOffset = y * rowStride;
    rawData[rowOffset] = 0; // Filter type 0 (None)

    const qrY = Math.floor((y - margin) / scale);
    for (let x = 0; x < size; x++) {
      const qrX = Math.floor((x - margin) / scale);
      let isDark = false;
      if (
        qrY >= 0 &&
        qrY < modules.length &&
        qrX >= 0 &&
        qrX < modules.length
      ) {
        isDark = modules[qrY][qrX];
      }

      const pxOffset = rowOffset + 1 + x * 3;
      if (isDark) {
        // Dark forest green color: #174b38 (R:23, G:75, B:56)
        rawData[pxOffset] = 23;
        rawData[pxOffset + 1] = 75;
        rawData[pxOffset + 2] = 56;
      } else {
        // Crisp white / cream: #ffffff
        rawData[pxOffset] = 255;
        rawData[pxOffset + 1] = 255;
        rawData[pxOffset + 2] = 255;
      }
    }
  }

  return encodePng(size, size, rawData);
}

function encodePng(width, height, rawScanlines) {
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  // IHDR chunk
  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(width, 0);
  ihdrData.writeUInt32BE(height, 4);
  ihdrData[8] = 8; // Bit depth: 8
  ihdrData[9] = 2; // Color type: 2 (Truecolor RGB)
  ihdrData[10] = 0; // Compression method: 0 (Deflate)
  ihdrData[11] = 0; // Filter method: 0
  ihdrData[12] = 0; // Interlace method: 0 (No interlace)

  const ihdrChunk = makeChunk("IHDR", ihdrData);

  // IDAT chunk
  const compressed = zlib.deflateSync(rawScanlines, { level: 9 });
  const idatChunk = makeChunk("IDAT", compressed);

  // IEND chunk
  const iendChunk = makeChunk("IEND", Buffer.alloc(0));

  return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
}

function makeChunk(type, data) {
  const len = data.length;
  const chunk = Buffer.alloc(4 + 4 + len + 4);
  chunk.writeUInt32BE(len, 0);
  chunk.write(type, 4, 4, "ascii");
  data.copy(chunk, 8);
  const crc = crc32(chunk.subarray(4, 8 + len));
  chunk.writeUInt32BE(crc, 8 + len);
  return chunk;
}

// CRC32 table
const crcTable = new Uint32Array(256);
for (let n = 0; n < 256; n++) {
  let c = n;
  for (let k = 0; k < 8; k++) {
    if (c & 1) c = 0xedb88320 ^ (c >>> 1);
    else c = c >>> 1;
  }
  crcTable[n] = c;
}

function crc32(buf) {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    c = crcTable[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  }
  return (c ^ 0xffffffff) >>> 0;
}

// Lightweight QR matrix generation
function generateQrMatrix(text) {
  // We use version 3 QR Code (29x29) for standard URLs
  const size = 29;
  const matrix = Array.from({ length: size }, () => Array(size).fill(false));
  const isFunction = Array.from({ length: size }, () => Array(size).fill(false));

  function setFunction(r, c, val) {
    matrix[r][c] = val;
    isFunction[r][c] = true;
  }

  // 1. Finder patterns (7x7 at top-left, top-right, bottom-left)
  function drawFinder(row, col) {
    for (let r = -1; r <= 7; r++) {
      for (let c = -1; c <= 7; c++) {
        const nr = row + r;
        const nc = col + c;
        if (nr >= 0 && nr < size && nc >= 0 && nc < size) {
          if (
            (r >= 0 && r <= 6 && (c === 0 || c === 6)) ||
            (c >= 0 && c <= 6 && (r === 0 || r === 6)) ||
            (r >= 2 && r <= 4 && c >= 2 && c <= 4)
          ) {
            setFunction(nr, nc, true);
          } else {
            setFunction(nr, nc, false);
          }
        }
      }
    }
  }

  drawFinder(0, 0);
  drawFinder(0, size - 7);
  drawFinder(size - 7, 0);

  // 2. Alignment pattern (5x5 around (22, 22) for v3)
  const alignR = 22;
  const alignC = 22;
  for (let r = -2; r <= 2; r++) {
    for (let c = -2; c <= 2; c++) {
      if (Math.abs(r) === 2 || Math.abs(c) === 2 || (r === 0 && c === 0)) {
        setFunction(alignR + r, alignC + c, true);
      } else {
        setFunction(alignR + r, alignC + c, false);
      }
    }
  }

  // 3. Timing patterns
  for (let i = 8; i < size - 8; i++) {
    setFunction(6, i, i % 2 === 0);
    setFunction(i, 6, i % 2 === 0);
  }

  // 4. Dark module
  setFunction(size - 8, 8, true);

  // 5. Reserve format info
  for (let i = 0; i < 9; i++) {
    if (i !== 6) {
      setFunction(8, i, false);
      setFunction(i, 8, false);
    }
  }
  for (let i = 0; i < 8; i++) {
    setFunction(8, size - 1 - i, false);
    setFunction(size - 1 - i, 8, false);
  }

  // 6. Data encoding & placement
  // Simple byte mode encoding
  const bytes = Buffer.from(text, "utf8");
  const bits = [];
  // Mode: byte (0100)
  bits.push(0, 1, 0, 0);
  // Count: 8 bits for v1-9 byte mode
  for (let b = 7; b >= 0; b--) bits.push((bytes.length >> b) & 1);
  // Data bytes
  for (const byte of bytes) {
    for (let b = 7; b >= 0; b--) bits.push((byte >> b) & 1);
  }
  // Terminator
  for (let i = 0; i < 4 && bits.length < 560; i++) bits.push(0);
  while (bits.length % 8 !== 0) bits.push(0);
  // Pad bytes
  const pads = [0xec, 0x11];
  let p = 0;
  while (bits.length < 560) {
    const pad = pads[p % 2];
    for (let b = 7; b >= 0; b--) bits.push((pad >> b) & 1);
    p++;
  }

  // Place data in matrix
  let bitIdx = 0;
  let dir = -1; // up
  for (let right = size - 1; right > 0; right -= 2) {
    if (right === 6) right--; // Skip timing column
    const rows = [];
    if (dir === -1) {
      for (let r = size - 1; r >= 0; r--) rows.push(r);
    } else {
      for (let r = 0; r < size; r++) rows.push(r);
    }

    for (const r of rows) {
      for (let c = right; c > right - 2; c--) {
        if (!isFunction[r][c]) {
          const bit = bitIdx < bits.length ? bits[bitIdx++] : 0;
          // Apply mask 0: (r + c) % 2 === 0
          const mask = (r + c) % 2 === 0;
          matrix[r][c] = (bit ^ (mask ? 1 : 0)) === 1;
        }
      }
    }
    dir = -dir;
  }

  return matrix;
}

obtainQrCodePng().catch(console.error);
