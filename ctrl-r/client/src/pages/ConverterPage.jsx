// File: src/pages/ConverterPage.jsx
import { useRef, useState, useMemo } from "react";
import "./ConverterPage.css";

import logo from "../assets/ctrlr-logo.png";
import dropArt from "../assets/dragdrop-card.png";

const EXT_LABELS = {
  wpd: "WordPerfect (.wpd)",
  wp: "WordPerfect (.wp)",
  wk1: "Lotus 1-2-3 (.wk1)",
  wk3: "Lotus 1-2-3 (.wk3)",
  123: "Lotus 1-2-3 (.123)",
  dwg: "AutoCAD (.dwg)",
  doc: "Microsoft Word (.doc)",
  docx: "Microsoft Word (.docx)",
};

const EXT_OUTPUTS = {
  wpd: ["pdf", "docx", "txt"],
  wp: ["pdf", "docx", "txt"],
  wk1: ["pdf", "xlsx", "csv"],
  wk3: ["pdf", "xlsx", "csv"],
  123: ["pdf", "xlsx", "csv"],
  dwg: ["pdf", "png", "jpg"],
  doc: ["pdf", "docx", "txt"],
  docx: ["pdf", "txt"],
};

export default function ConverterPage() {
  const inputRef = useRef(null);
  const [file, setFile] = useState(null);
  const [dragOver, setDragOver] = useState(false);

  // slide + show right card
  const [step, setStep] = useState("upload"); // "upload" | "convert"

  // dropdown selection
  const [targetFormat, setTargetFormat] = useState("pdf");

  const fileExt = useMemo(() => {
    if (!file?.name) return "";
    const ext = file.name.split(".").pop()?.toLowerCase() || "";
    return ext;
  }, [file]);

  const detectedType = useMemo(() => {
    if (!file) return "";
    return EXT_LABELS[fileExt] || (fileExt ? `${fileExt.toUpperCase()} file` : "Unknown file");
  }, [file, fileExt]);

  const availableOutputs = useMemo(() => {
    if (!file) return ["pdf"];
    return EXT_OUTPUTS[fileExt] || ["pdf"];
  }, [file, fileExt]);

  const onFiles = (files) => {
    if (!files || files.length === 0) return;
    const picked = files[0];
    setFile(picked);

    // reset to upload view whenever they pick a new file
    setStep("upload");

    const ext = picked.name.split(".").pop()?.toLowerCase() || "";
    const outputs = EXT_OUTPUTS[ext] || ["pdf"];
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

  // clicking this shows the right card
  const onConvert = () => {
    if (!file) return;
    setStep("convert");
  };

  // placeholder “start conversion”
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
          {/* stage becomes 2-column only after convert */}
          <div className={"ctrlr-stage2 " + (step === "convert" ? "ctrlr-stage2--convert" : "")}>
            {/* LEFT CARD (existing) */}
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
                  {file ? "Next step: conversion." : "Your files — converted  in seconds."}
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
                  accept=".wpd,.wp,.wk1,.wk3,.123,.dwg,.doc,.docx"
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
                      Supported <b>.wp</b>, <b>.123</b>, <b>.dwg</b> • Privacy
                      unlimited.
                    </span>
                  )}
                </div>
              </div>
            </section>

            {/* RIGHT CARD (appears only after click) */}
            <section className="ctrlr-dropCard ctrlr-rightCard" aria-live="polite">
              <div className="ctrlr-dropInset">
                <h2 className="ctrlr-title ctrlr-titleSmall">Conversion options</h2>

                <div className="ctrlr-formRow">
                  <div className="ctrlr-formLabel">Detected file type</div>
                  <div className="ctrlr-formValue">{file ? detectedType : "—"}</div>
                </div>

                <div className="ctrlr-formRow">
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

                <p className="ctrlr-hint">
                  Pick an output format, then start conversion.
                </p>
              </div>
            </section>
          </div>

          <p className="ctrlr-tagline">
            Old file formats aren’t broken—they’re just forgotten.
          </p>
        </main>
      </div>
    </div>
  );
}
