// server/index.js
require("dotenv").config();

const express = require("express");
const multer = require("multer");
const path = require("path");
const cors = require("cors");
const fs = require("fs/promises");
const fssync = require("fs");

const { convertFile } = require("./services/convertFile.js");

const PORT = process.env.PORT || 3001;

const app = express();
app.use(cors());
app.use(express.json());

// Always store uploads inside server/uploads (absolute path)
const UPLOAD_DIR = path.join(__dirname, "uploads");
fssync.mkdirSync(UPLOAD_DIR, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOAD_DIR),
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({ storage });

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

    const url = await convertFile(uploadedPath, sourceExt, targetFormat);

    // cleanup uploaded file after conversion succeeds
    await fs.unlink(uploadedPath).catch(() => {});

    return res.json({
      message: "File uploaded and converted successfully",
      url,
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
