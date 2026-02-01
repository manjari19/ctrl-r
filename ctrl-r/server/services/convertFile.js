// server/services/convertFile.js
const convertapi = require("./convertApiClient");

async function convertFile(filePath, sourceExt, targetExt) {
  const src = String(sourceExt || "").replace(".", "").toLowerCase();
  const dst = String(targetExt || "").replace(".", "").toLowerCase();

  if (!src || !dst) throw new Error(`Bad formats src="${src}" dst="${dst}"`);
  if (src === dst) throw new Error(`Invalid conversion ${src} -> ${dst}`);

  // ✅ ConvertAPI Node SDK: convert(toFormat, params, fromFormat?)
  const result = await convertapi.convert(
    dst,
    { File: filePath, StoreFile: true },
    src
  );

  // SDK sometimes uses `url` (lowercase). Be tolerant.
  const file0 = result?.files?.[0];
  const url = file0?.url || file0?.Url;

  if (!url) throw new Error("ConvertAPI returned no output URL");

  return url;
}

module.exports = { convertFile };
