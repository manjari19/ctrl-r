// File: src/pages/ConverterPage.jsx
import { useRef, useState, useMemo } from "react";
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
  // Modern clipboard API
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(text);
    return true;
  }

  // Fallback
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
    // don’t allow output == input (prevents wpd->wpd etc.)
    const filtered = outs.filter(
      (x) => String(x).toLowerCase() !== String(fileExt).toLowerCase()
    );
    return filtered.length ? filtered : ["pdf"];
  }, [file, fileExt]);

  const resetResultState = () => {
    setIsConverting(false);
    setErrorMsg("");
    setResultUrl("");
    setCopied(false);
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
      // keep user on page; they can click Download/Open or Copy Link
    } catch {
      // errorMsg is already set
    }
  };

  const onOpenResult = () => {
    if (!resultUrl) return;
    window.open(resultUrl, "_blank", "noopener,noreferrer");
  };

  const onCopyLink = async () => {
    if (!resultUrl) return;
    try {
      const ok = await copyToClipboard(resultUrl);
      setCopied(Boolean(ok));
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

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
          <div
            className={
              "ctrlr-stage2 " + (step === "convert" ? "ctrlr-stage2--convert" : "")
            }
          >
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
                <img
                  className="ctrlr-dropArt"
                  src={dropArt}
                  alt="File + clock illustration"
                />

                <h1 className="ctrlr-title">
                  {file ? "Ready to revive this file" : "Drag & drop a legacy file"}
                </h1>

                <p className="ctrlr-subtitle">
                  {file ? "Next step: conversion." : "Your files — converted in seconds."}
                </p>

                {file ? (
                  <button
                    className="ctrlr-browseBtn ctrlr-convertBtn"
                    onClick={onConvert}
                  >
                    Ready To Convert <span aria-hidden="true">➜</span>
                  </button>
                ) : (
                  <button className="ctrlr-browseBtn" onClick={onBrowse}>
                    Browse files <span aria-hidden="true">➜</span>
                  </button>
                )}

                <input
                  ref={inputRef}
                  type="file"
                  className="ctrlr-hiddenInput"
                  accept=".wpd,.wp,.xls,.ods,.dwg,.doc,.docx"
                  onChange={onInputChange}
                />

                <div className="ctrlr-meta">
                  {file ? (
                    <span className="ctrlr-filePill">
                      {file.name}{" "}
                      <button
                        type="button"
                        aria-label="Remove file"
                        onClick={() => {
                          setFile(null);
                          setStep("upload");
                          resetResultState();
                        }}
                      >
                        ×
                      </button>
                    </span>
                  ) : (
                    <span>
                      Supported <b>.wpd</b>, <b>.xls</b>, <b>.ods</b>, <b>.dwg</b> •
                      Privacy unlimited.
                    </span>
                  )}
                </div>
              </div>
            </section>

            {/* RIGHT SIDE */}
            {step === "convert" && (
              <aside className="ctrlr-rightStack" aria-live="polite">
                <section className="ctrlr-dropCard ctrlr-rightCard">
                  <div className="ctrlr-dropInset">
                    <h2 className="ctrlr-title ctrlr-titleSmall">Conversion options</h2>

                    <div className="ctrlr-inlineRow">
                      <div className="ctrlr-field">
                        <div className="ctrlr-formLabel">Detected</div>
                        <div
                          className={
                            "ctrlr-formValue " + (file ? "ctrlr-pillValue" : "")
                          }
                        >
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
                          disabled={!file || isConverting}
                        >
                          {availableOutputs.map((fmt) => (
                            <option key={fmt} value={fmt}>
                              {String(fmt).toUpperCase()}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* Status + actions */}
                    {errorMsg && (
                      <p style={{ marginTop: 10 }}>
                        <b>Error:</b> {errorMsg}
                      </p>
                    )}

                    {resultUrl && (
                      <div style={{ marginTop: 12 }}>
                        <p style={{ marginBottom: 8 }}>
                          <b>Converted file:</b>{" "}
                          <a href={resultUrl} target="_blank" rel="noreferrer">
                            {resultUrl}
                          </a>
                        </p>

                        <div className="ctrlr-actions">
                          <button
                            type="button"
                            className="ctrlr-secondaryBtn"
                            onClick={onOpenResult}
                          >
                            Open / Download
                          </button>

                          <button
                            type="button"
                            className="ctrlr-primaryBtn"
                            onClick={onCopyLink}
                          >
                            {copied ? "Copied!" : "Copy link"}
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Main actions */}
                    <div className="ctrlr-actions" style={{ marginTop: 14 }}>
                      <button
                        type="button"
                        className="ctrlr-secondaryBtn"
                        onClick={() => setStep("upload")}
                        disabled={isConverting}
                      >
                        ← Back
                      </button>

                      <button
                        type="button"
                        className="ctrlr-primaryBtn"
                        onClick={onStartConversion}
                        disabled={!file || isConverting}
                      >
                        {isConverting ? "Converting..." : "Start conversion "}
                        <span aria-hidden="true">➜</span>
                      </button>
                    </div>

                    <p className="ctrlr-hint">
                      Pick an output format, then start conversion.
                    </p>
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
                      <div className="ctrlr-infoText">
                        {file ? typeDescription : "—"}
                      </div>
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
