// File: src/pages/ConverterPage.jsx
import { useRef, useState, useMemo } from "react";
import "./ConverterPage.css";
import { acceptedfiletypes_dictionary } from './../backend/dict.js'

import logo from "../assets/ctrlr-logo.png";
import dropArt from "../assets/dragdrop-card.png";

const EXT_LABELS = {
  wpd: "WordPerfect (.wpd)",
  wp: "WordPerfect (.wp)",
  xls: "Microsoft Excel (.xls)",
  ods: "OpenDocument Spreadsheet (.ods)",
  dwg: "AutoCAD (.dwg)",
  doc: "Microsoft Word (.doc)",
  docx: "Microsoft Word (.docx)",
};

const EXT_DESCRIPTIONS = {
  wpd: "A WordPerfect document — once popular in offices and universities before modern formats became standard.",
  wp: "A WordPerfect document — an older word processing format used widely before DOC/DOCX took over.",
  xls: "An older Excel spreadsheet format — commonly used before .xlsx became the default.",
  ods: "An OpenDocument spreadsheet — a standards-based format used by LibreOffice and similar tools.",
  dwg: "An AutoCAD drawing — a common CAD format used in architecture and engineering workflows.",
  doc: "A legacy Microsoft Word document — widely used before .docx became standard.",
  docx: "A modern Microsoft Word document — widely supported across most word processors today.",
};

const EXT_OUTPUTS = {
  wpd: ["pdf", "docx", "txt"],
  wp: ["pdf", "docx", "txt"],
  xls: ["pdf", "xlsx", "csv"],
  ods: ["pdf", "xlsx", "csv"],
  dwg: ["pdf", "png", "jpg"],
  doc: ["pdf", "docx", "txt"],
  docx: ["pdf", "txt"],
};

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


export default function ConverterPage() {
  const inputRef = useRef(null);
  const [file, setFile] = useState(null);
  const [dragOver, setDragOver] = useState(false);

  // "upload" | "convert"
  const [step, setStep] = useState("upload");

  const [targetFormat, setTargetFormat] = useState("pdf");

  const fileExt = useMemo(() => {
    if (!file?.name) return "";
    return file.name.split(".").pop()?.toLowerCase() || "";
  }, [file]);

  const detectedType = useMemo(() => {
    if (!file) return "";
    return (
      EXT_LABELS[fileExt] ||
      (fileExt ? `${fileExt.toUpperCase()} file` : "Unknown file")
    );
  }, [file, fileExt]);

  const typeDescription = useMemo(() => {
    if (!file) return "";
    return (
      EXT_DESCRIPTIONS[fileExt] ||
      "A legacy file format — often difficult to open with modern software."
    );
  }, [file, fileExt]);

  const availableOutputs = useMemo(() => {
    if (!file) return ["pdf"];
    return acceptedfiletypes_dictionary[fileExt] || ["pdf"];
  }, [file, fileExt]);

  const onFiles = (files) => {
    if (!files || files.length === 0) return;
    const picked = files[0];
    setFile(picked);

    // always return to upload view when picking a new file
    setStep("upload");

    const ext = picked.name.split(".").pop()?.toLowerCase() || "";
    const outputs = acceptedfiletypes_dictionary[ext] || ["pdf"];
    setTargetFormat(outputs[0]);
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

  const onTrySample = () => {
    alert("Sample file flow coming soon ✨");
  };

  const onConvert = () => {
    if (!file) return;
    setStep("convert");
  };

  const onStartConversion = () => {
    if (!file) return;
    alert(`Converting ${file.name} → ${targetFormat.toUpperCase()} (demo)...`);
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
                        }}
                      >
                        ×
                      </button>
                    </span>
                  ) : (
                    <span>
                      Supported <b>.wpd</b>, <b>.xls</b>, <b>.ods</b>, <b>.dwg</b> • Privacy
                      unlimited.
                    </span>
                  )}
                </div>
              </div>
            </section>

            {/* RIGHT SIDE: ONLY show after "Ready To Convert" */}
            {step === "convert" && (
              <aside className="ctrlr-rightStack" aria-live="polite">
                {/* Conversion options */}
                <section className="ctrlr-dropCard ctrlr-rightCard">
                  <div className="ctrlr-dropInset">
                    <h2 className="ctrlr-title ctrlr-titleSmall">Conversion options</h2>

                    {/* Detected + Convert-to on the same line */}
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
                          disabled={!file}
                        >
                          {availableOutputs.map((fmt) => (
                            <option key={fmt} value={fmt}>
                              {fmt.toUpperCase()}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="ctrlr-actions">
                      <button
                        type="button"
                        className="ctrlr-secondaryBtn"
                        onClick={() => setStep("upload")}
                      >
                        ← Back
                      </button>

                      <button
                        type="button"
                        className="ctrlr-primaryBtn"
                        onClick={onStartConversion}
                        disabled={!file}
                      >
                        Start conversion <span aria-hidden="true">➜</span>
                      </button>
                    </div>

                    <p className="ctrlr-hint">Pick an output format, then start conversion.</p>
                  </div>
                </section>

                {/* About this file */}
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
