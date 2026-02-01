// server/index.js
require("dotenv").config();

const express = require("express");
const multer = require("multer");
const path = require("path");
const http = require("http");
const https = require("https");
const cors = require("cors");
const fs = require("fs/promises");
const fssync = require("fs");
const crypto = require("crypto");

const { convertFile } = require("./services/convertFile.js");

const PORT = process.env.PORT || 3001;

const app = express();
app.use(cors());
app.use(express.json());

// Always store uploads inside server/uploads (absolute path)
const UPLOAD_DIR = path.join(__dirname, "uploads");
const CONVERTED_DIR = path.join(UPLOAD_DIR, "converted");
fssync.mkdirSync(UPLOAD_DIR, { recursive: true });
fssync.mkdirSync(CONVERTED_DIR, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOAD_DIR),
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({ storage });

// Serve converted files from a stable, same-origin URL so they can be embedded in iframes.
app.use("/converted", express.static(CONVERTED_DIR));

async function downloadConvertedFile(remoteUrl, targetExt) {
  if (!remoteUrl) {
    throw new Error("Missing remote URL for converted file");
  }

  const safeExt = String(targetExt || "")
    .replace(/[^a-z0-9]/gi, "")
    .toLowerCase() || "bin";

  const id = crypto.randomBytes(8).toString("hex");
  const filename = `${Date.now()}-${id}.${safeExt}`;
  const destPath = path.join(CONVERTED_DIR, filename);

  const client = remoteUrl.startsWith("https:") ? https : http;

  await new Promise((resolve, reject) => {
    const fileStream = fssync.createWriteStream(destPath);

    client
      .get(remoteUrl, (response) => {
        if (response.statusCode !== 200) {
          fileStream.close(() => {
            fssync.unlink(destPath, () => {});
          });
          return reject(
            new Error(
              `Failed to download converted file: ${response.statusCode}`
            )
          );
        }

        response.pipe(fileStream);
        fileStream.on("finish", () => fileStream.close(resolve));
      })
      .on("error", (err) => {
        fileStream.close(() => {
          fssync.unlink(destPath, () => {});
        });
        reject(err);
      });
  });

  return {
    path: destPath,
    url: `/converted/${filename}`,
  };
}

// Optional health check
app.get("/", (req, res) => res.json({ ok: true, service: "ctrl-r server" }));

app.post("/upload", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: "No file uploaded." });

    const uploadedPath = req.file.path;
    const sourceExt = path.extname(req.file.originalname).slice(1).toLowerCase();

    const targetFormatRaw = req.body?.targetFormat;
    const targetFormat = String(targetFormatRaw || "pdf").toLowerCase();

    console.log("UPLOAD DEBUG:", {
      originalname: req.file.originalname,
      uploadedPath,
      sourceExt,
      targetFormatRaw,
      targetFormat,
    });

    // Prevent nonsense conversions
    if (targetFormat === sourceExt) {
      return res.status(400).json({
        message: `Invalid target format: cannot convert ${sourceExt} -> ${targetFormat}`,
      });
    }

    // Block wpd output (not useful for your app)
    if (targetFormat === "wpd") {
      return res.status(400).json({
        message: "Invalid target format: output cannot be WPD. Choose PDF or DOCX.",
      });
    }

    const remoteUrl = await convertFile(uploadedPath, sourceExt, targetFormat);

    // cleanup uploaded file after conversion succeeds
    await fs.unlink(uploadedPath).catch(() => {});

    // Prefer a same-origin, cached URL for previews.
    let finalUrl = remoteUrl;
    try {
      const stored = await downloadConvertedFile(remoteUrl, targetFormat);
      finalUrl = stored.url;
    } catch (downloadErr) {
      console.error(
        "Failed to cache converted file locally; using remote URL instead.",
        downloadErr
      );
    }

    return res.json({
      message: "File uploaded and converted successfully",
      url: finalUrl,
      sourceExt,
      targetFormat,
    });
  } catch (err) {
    console.error("Upload/convert error:", err);

    // best-effort cleanup
    if (req?.file?.path) {
      await fs.unlink(req.file.path).catch(() => {});
    }

    return res.status(500).json({
      message: "Conversion failed",
      error: err?.message || String(err),
    });
  }
});

app.listen(PORT, () => {
  console.log(`Server listening on ${PORT}`);
});
