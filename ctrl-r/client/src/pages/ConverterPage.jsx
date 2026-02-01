// File: src/pages/ConverterPage.jsx
import { useRef, useState, useMemo, useEffect } from "react";
import "./ConverterPage.css";
import { acceptedfiletypes_dictionary } from "./../backend/dict.js";
import { File_Labels, File_Desc } from "./../backend/filedescs.js";

import logo from "../assets/ctrlr-logo.png";
import dropArt from "../assets/dragdrop-card.png";

function formatBytes(bytes) {
  if (!Number.isFinite(bytes)) return "—";
  if (bytes < 1024) return `${bytes} B`;
  const kb = bytes / 1024;
  if (kb < 1024) return `${kb.toFixed(1)} KB`;
  const mb = kb / 1024;
  return `${mb.toFixed(1)} MB`;
}

function createdLabelFromLastModified(lastModified) {
  if (!lastModified) return "—";
  const d = new Date(lastModified);
  const year = d.getFullYear();
  if (year <= 1999) return "Created in the late 1990s";
  if (year <= 2009) return "Created in the 2000s";
  if (year <= 2019) return "Created in the 2010s";
  return `Created in ${year}`;
}

function pickDefaultOutput(inputExt, outputs) {
  const inExt = String(inputExt || "").toLowerCase();
  const list = Array.isArray(outputs)
    ? outputs.map((x) => String(x).toLowerCase())
    : ["pdf"];

  if (list.includes("pdf")) return "pdf";
  const firstDifferent = list.find((x) => x && x !== inExt);
  if (firstDifferent) return firstDifferent;
  return "pdf";
}

async function copyToClipboard(text) {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(text);
    return true;
  }
  const ta = document.createElement("textarea");
  ta.value = text;
  ta.setAttribute("readonly", "");
  ta.style.position = "absolute";
  ta.style.left = "-9999px";
  document.body.appendChild(ta);
  ta.select();
  const ok = document.execCommand("copy");
  document.body.removeChild(ta);
  return ok;
}

// Preview helpers
function isImageExt(ext) {
  return ["png", "jpg", "jpeg", "gif", "webp", "bmp", "svg", "tif", "tiff"].includes(ext);
}
function isTextExt(ext) {
  return ["txt", "md", "csv", "log", "xml", "json", "html", "htm"].includes(ext);
}
function isPdfExt(ext) {
  return ext === "pdf";
}

// Build a preview-friendly URL that works both in dev (React on :3000, API on :3001)
// and in production (single origin).
function resolvePreviewUrl(rawUrl) {
  if (!rawUrl) return "";
  // If it's already absolute (http/https), use as-is.
  if (/^https?:\/\//i.test(rawUrl)) return rawUrl;

  if (typeof window === "undefined") return rawUrl;

  const origin = window.location.origin || "";
  const backendOrigin = origin.includes(":3000")
    ? origin.replace(":3000", ":3001")
    : origin;

  return backendOrigin + rawUrl;
}

export default function ConverterPage() {
  const inputRef = useRef(null);

  const [file, setFile] = useState(null);
  const [dragOver, setDragOver] = useState(false);

  // "upload" | "convert"
  const [step, setStep] = useState("upload");
  const [targetFormat, setTargetFormat] = useState("pdf");

  // conversion result state
  const [isConverting, setIsConverting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [resultUrl, setResultUrl] = useState("");
  const [copied, setCopied] = useState(false);

  // converted preview state
  const [convertedTextPreview, setConvertedTextPreview] = useState("");

  // Accept string derived from dictionary keys (no hardcoding)
  const ACCEPTED_EXTENSIONS = useMemo(() => {
    return Object.keys(acceptedfiletypes_dictionary || {})
      .map((ext) => `.${String(ext).toLowerCase()}`)
      .join(",");
  }, []);

  const fileExt = useMemo(() => {
    if (!file?.name) return "";
    return file.name.split(".").pop()?.toLowerCase() || "";
  }, [file]);

  const detectedType = useMemo(() => {
    if (!file) return "";
    return (
      File_Labels[fileExt] ||
      (fileExt ? `${fileExt.toUpperCase()} file` : "Unknown file")
    );
  }, [file, fileExt]);

  const typeDescription = useMemo(() => {
    if (!file) return "";
    return (
      File_Desc[fileExt] ||
      "A legacy file format — often difficult to open with modern software."
    );
  }, [file, fileExt]);

  const availableOutputs = useMemo(() => {
    if (!file) return ["pdf"];
    const outs = acceptedfiletypes_dictionary[fileExt] || ["pdf"];
    const filtered = outs.filter(
      (x) => String(x).toLowerCase() !== String(fileExt).toLowerCase()
    );
    return filtered.length ? filtered : ["pdf"];
  }, [file, fileExt]);

  const previewUrl = useMemo(() => resolvePreviewUrl(resultUrl), [resultUrl]);
  const canSummarizeNow = useMemo(
    () => Boolean(previewUrl),
    [previewUrl]
  );

  const resetResultState = () => {
    setIsConverting(false);
    setErrorMsg("");
    setResultUrl("");
    setCopied(false);
    setConvertedTextPreview("");
  };

  const onFiles = (files) => {
    if (!files || files.length === 0) return;
    const picked = files[0];
    setFile(picked);

    setStep("upload");
    resetResultState();

    const ext = picked.name.split(".").pop()?.toLowerCase() || "";
    const outputs = acceptedfiletypes_dictionary[ext] || ["pdf"];
    setTargetFormat(pickDefaultOutput(ext, outputs));
  };

  const handleUploadAndConvert = async () => {
    if (!file) return;

    setIsConverting(true);
    setErrorMsg("");
    setResultUrl("");
    setCopied(false);
    setConvertedTextPreview("");

    const formData = new FormData();
    formData.append("file", file);
    formData.append("targetFormat", targetFormat);

    try {
      const response = await fetch("/upload", {
        method: "POST",
        body: formData,
      });

      const payload = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(payload?.error || payload?.message || response.statusText);
      }
      if (!payload?.url) {
        throw new Error("No URL returned from server.");
      }

      setResultUrl(payload.url);
      return payload.url;
    } catch (err) {
      setErrorMsg(err?.message || "Conversion failed.");
      throw err;
    } finally {
      setIsConverting(false);
    }
  };

  // If converted output is text-like, fetch a small snippet for preview (best-effort)
  useEffect(() => {
    let alive = true;

    async function loadConvertedTextSnippet() {
      setConvertedTextPreview("");
      if (!previewUrl) return;
      if (!isTextExt(targetFormat)) return;

      try {
        const res = await fetch(previewUrl, { method: "GET" });
        if (!res.ok) return;
        const txt = await res.text();
        if (!alive) return;
        setConvertedTextPreview(txt.slice(0, 24 * 1024));
      } catch {
        // ignore
      }
    }

    loadConvertedTextSnippet();
    return () => {
      alive = false;
    };
  }, [previewUrl, targetFormat]);

  const onBrowse = () => inputRef.current?.click();
  const onInputChange = (e) => onFiles(e.target.files);

  const onDragOver = (e) => {
    e.preventDefault();
    setDragOver(true);
  };

  const onDragLeave = (e) => {
    e.preventDefault();
    setDragOver(false);
  };

  const onDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    onFiles(e.dataTransfer.files);
  };

  const onTrySample = () => alert("Sample file flow coming soon ✨");

  const onConvert = () => {
    if (!file) return;
    setStep("convert");
  };

  const onStartConversion = async () => {
    if (!file || isConverting) return;
    try {
      await handleUploadAndConvert();
      // left side will automatically switch to preview because resultUrl becomes set
    } catch {
      // errorMsg already set
    }
  };

  const onOpenResult = () => {
    if (!previewUrl) return;
    window.open(previewUrl, "_blank", "noopener,noreferrer");
  };

  const onCopyLink = async () => {
    if (!previewUrl) return;
    try {
      const ok = await copyToClipboard(previewUrl);
      setCopied(Boolean(ok));
      setTimeout(() => setCopied(false), 1400);
    } catch {
      setCopied(false);
    }
  };

  const onSummarize = () => {
    if (!previewUrl) return;
    alert("Summarization coming soon ✨");
  };

  const removeFile = () => {
    setFile(null);
    setStep("upload");
    resetResultState();
  };

  const shouldShowConvertedPreview = Boolean(file) && step === "convert" && Boolean(previewUrl);

  const canPreviewConverted =
    Boolean(previewUrl) &&
    (isPdfExt(targetFormat) || isImageExt(targetFormat) || isTextExt(targetFormat));

  return (
    <div className="ctrlr-page">
      <div className="ctrlr-bg" aria-hidden="true" />

      <div className="ctrlr-leaf ctrlr-leaf--tl" aria-hidden="true" />
      <div className="ctrlr-leaf ctrlr-leaf--tr" aria-hidden="true" />
      <div className="ctrlr-leaf ctrlr-leaf--bl" aria-hidden="true" />
      <div className="ctrlr-leaf ctrlr-leaf--br" aria-hidden="true" />

      <header className="ctrlr-topbar">
        <div className="ctrlr-topbarInner">
          <div className="ctrlr-brand">
            <img className="ctrlr-logo" src={logo} alt="ctrl-r logo" />
            <span className="ctrlr-name" aria-label="ctrl-r">
              <span className="ctrlr-nameMain">ctrl</span>
              <span className="ctrlr-nameAccent">-r</span>
            </span>
          </div>

          <nav className="ctrlr-nav">
            <a className="ctrlr-link" href="#about">
              About
            </a>
            <a className="ctrlr-link" href="#samples">
              Samples
            </a>
            <button className="ctrlr-sampleBtn" onClick={onTrySample}>
              <span className="ctrlr-sampleIcon" aria-hidden="true">
                ⟳
              </span>
              Try a Sample File
            </button>
          </nav>
        </div>
      </header>

      <div className="ctrlr-shell">
        <main className="ctrlr-center">
          <div className={"ctrlr-stage2 " + (step === "convert" ? "ctrlr-stage2--convert" : "")}>
            {/* LEFT CARD */}
            <section
              className={
                "ctrlr-dropCard ctrlr-leftCard " +
                (dragOver ? "ctrlr-dropCard--over" : "")
              }
              onDragOver={onDragOver}
              onDragLeave={onDragLeave}
              onDrop={onDrop}
            >
              <div className="ctrlr-dropInset">
                {shouldShowConvertedPreview ? (
                  <div className="ctrlr-previewWrap">
                    <div className="ctrlr-previewHeader">
                      <div className="ctrlr-previewTitle">Preview</div>
                      <div className="ctrlr-previewMeta">
                        Output: {String(targetFormat).toUpperCase()}
                      </div>
                    </div>

                    <div className="ctrlr-previewFrame" role="region" aria-label="Converted file preview">
                      {canPreviewConverted ? (
                        <>
                          {isImageExt(targetFormat) && (
                            <img
                              className="ctrlr-previewImg"
                              src={previewUrl}
                              alt="Converted output preview"
                            />
                          )}

                          {isPdfExt(targetFormat) && (
                            <iframe
                              className="ctrlr-previewPdf"
                              title="Converted PDF preview"
                              src={previewUrl}
                            />
                          )}

                          {isTextExt(targetFormat) && (
                            <pre className="ctrlr-previewText">
                              {convertedTextPreview || "Loading preview…"}
                            </pre>
                          )}
                        </>
                      ) : (
                        <div className="ctrlr-previewEmpty">
                          <div className="ctrlr-previewEmptyIcon" aria-hidden="true">
                            👀
                          </div>
                          <div className="ctrlr-previewEmptyTitle">Preview not available</div>
                          <div className="ctrlr-previewEmptySub">
                            This output format can’t be previewed in-browser. Use{" "}
                            <b>Open / Download</b>.
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <>
                    <img
                      className="ctrlr-dropArt"
                      src={dropArt}
                      alt="File + clock illustration"
                    />

                    <h1 className="ctrlr-title">
                      {file ? "Ready to revive this file" : "Drag & drop a legacy file"}
                    </h1>

                    <p className="ctrlr-subtitle">
                      {file
                        ? isConverting
                          ? "Processing… hang tight."
                          : "Next step: conversion."
                        : "Old formats back to life — in seconds."}
                    </p>
                  </>
                )}

                <div className="ctrlr-heroActions">
                  {file ? (
                    canSummarizeNow ? (
                      <button
                        className="ctrlr-browseBtn ctrlr-convertBtn"
                        onClick={onSummarize}
                        disabled={isConverting}
                        title={isConverting ? "Processing…" : "Summarize this file"}
                      >
                        Summarize file contents
                      </button>
                    ) : (
                      <button
                        className="ctrlr-browseBtn ctrlr-convertBtn"
                        onClick={onConvert}
                        disabled={isConverting}
                        title={isConverting ? "Conversion in progress" : "Go to conversion"}
                      >
                        {isConverting ? "Processing…" : "Ready to convert"}{" "}
                        <span aria-hidden="true">➜</span>
                      </button>
                    )
                  ) : (
                    <button className="ctrlr-browseBtn" onClick={onBrowse}>
                      Browse files <span aria-hidden="true">➜</span>
                    </button>
                  )}

                  {file && (
                    <button
                      className="ctrlr-ghostBtn"
                      type="button"
                      onClick={removeFile}
                      disabled={isConverting}
                      title={isConverting ? "Wait for conversion to finish" : "Choose another file"}
                    >
                      Choose a different file
                    </button>
                  )}
                </div>

                <input
                  ref={inputRef}
                  type="file"
                  className="ctrlr-hiddenInput"
                  accept={ACCEPTED_EXTENSIONS}
                  onChange={onInputChange}
                />

                <div className="ctrlr-meta">
                  {!file && (
                    <span>
                      Supports <b>50+</b> formats • Documents, spreadsheets, images, CAD, and more.
                    </span>
                  )}
                </div>
              </div>
            </section>

            {/* RIGHT SIDE */}
            {step === "convert" && (
              <aside className="ctrlr-rightStack" aria-live="polite">
                <section className="ctrlr-dropCard ctrlr-rightCard">
                  <div className="ctrlr-dropInset ctrlr-dropInset--tight">
                    <div className="ctrlr-cardTop">
                      <h2 className="ctrlr-title ctrlr-titleSmall">Conversion</h2>
                      <div className="ctrlr-miniHint">
                        Pick a format, hit convert. That’s it.
                      </div>
                    </div>

                    <div className="ctrlr-inlineRow">
                      <div className="ctrlr-field">
                        <div className="ctrlr-formLabel">Detected</div>
                        <div className={"ctrlr-formValue " + (file ? "ctrlr-pillValue" : "")}>
                          {file ? detectedType : "—"}
                        </div>
                      </div>

                      <div className="ctrlr-field">
                        <label className="ctrlr-formLabel" htmlFor="targetFormat">
                          Convert to
                        </label>

                        <select
                          id="targetFormat"
                          className="ctrlr-select"
                          value={targetFormat}
                          onChange={(e) => setTargetFormat(e.target.value)}
                          disabled={!file || isConverting || Boolean(resultUrl)}
                          title={resultUrl ? "Choose a different file to convert again" : ""}
                        >
                          {availableOutputs.map((fmt) => (
                            <option key={fmt} value={fmt}>
                              {String(fmt).toUpperCase()}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {errorMsg && <div className="ctrlr-alert ctrlr-alert--error">{errorMsg}</div>}

                    {resultUrl && !errorMsg && (
                      <div className="ctrlr-alert ctrlr-alert--success">
                        <span className="ctrlr-dot" aria-hidden="true" />
                        Converted successfully.
                      </div>
                    )}

                    {resultUrl ? (
                      <div className="ctrlr-actions ctrlr-actions--result">
                        <button
                          type="button"
                          className="ctrlr-primaryBtn"
                          onClick={onOpenResult}
                        >
                          Open / Download
                        </button>

                        <button
                          type="button"
                          className="ctrlr-secondaryBtn"
                          onClick={onCopyLink}
                        >
                          {copied ? "Copied ✨" : "Copy link"}
                        </button>
                      </div>
                    ) : (
                      <div className="ctrlr-actions" style={{ marginTop: 14 }}>
                        <button
                          type="button"
                          className="ctrlr-primaryBtn"
                          onClick={onStartConversion}
                          disabled={!file || isConverting}
                        >
                          {isConverting ? "Converting…" : "Start conversion "}
                          <span aria-hidden="true">➜</span>
                        </button>
                      </div>
                    )}
                  </div>
                </section>

                <section className="ctrlr-dropCard ctrlr-infoCard">
                  <div className="ctrlr-infoInset">
                    <div className="ctrlr-infoHeader">
                      <span className="ctrlr-infoIcon" aria-hidden="true">
                        <img className="ctrlr-infoLogo" src={logo} alt="" />
                      </span>
                      <h3 className="ctrlr-infoTitle">About this file</h3>
                    </div>

                    <div className="ctrlr-infoDivider" />

                    <div className="ctrlr-infoBlock">
                      <div className="ctrlr-infoLabel">File name</div>
                      <div className="ctrlr-infoPill">{file ? file.name : "—"}</div>
                    </div>

                    <div className="ctrlr-infoDivider" />

                    <div className="ctrlr-infoBlock">
                      <div className="ctrlr-infoLabel">File type</div>
                      <div className="ctrlr-infoText">{file ? typeDescription : "—"}</div>
                    </div>

                    <div className="ctrlr-infoDivider" />

                    <div className="ctrlr-infoBlock ctrlr-infoTwoCol">
                      <div>
                        <div className="ctrlr-infoLabel">File size</div>
                        <div className="ctrlr-infoStrong">
                          {file ? formatBytes(file.size) : "—"}
                        </div>
                      </div>

                      <div>
                        <div className="ctrlr-infoLabel">Created</div>
                        <div className="ctrlr-infoStrong">
                          {file ? createdLabelFromLastModified(file.lastModified) : "—"}
                        </div>
                      </div>
                    </div>
                  </div>
                </section>
              </aside>
            )}
          </div>

          <p className="ctrlr-tagline">
            Old file formats aren’t broken—they’re just forgotten.
          </p>
        </main>
      </div>
    </div>
  );
}
