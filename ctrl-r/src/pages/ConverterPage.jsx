// File: src/pages/ConverterPage.jsx
import { useRef, useState } from "react";
import "./ConverterPage.css";

import logo from "../assets/ctrlr-logo.png";
import dropArt from "../assets/dragdrop-card.png";

export default function ConverterPage() {
  const inputRef = useRef(null);
  const [file, setFile] = useState(null);
  const [dragOver, setDragOver] = useState(false);

  const onFiles = (files) => {
    if (!files || files.length === 0) return;
    setFile(files[0]);
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

  return (
    <div className="ctrlr-page">
      <div className="ctrlr-bg" aria-hidden="true" />

      <div className="ctrlr-leaf ctrlr-leaf--tl" aria-hidden="true" />
      <div className="ctrlr-leaf ctrlr-leaf--tr" aria-hidden="true" />
      <div className="ctrlr-leaf ctrlr-leaf--bl" aria-hidden="true" />
      <div className="ctrlr-leaf ctrlr-leaf--br" aria-hidden="true" />

      {/* ✅ Edge-to-edge navbar */}
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
          <section
            className={
              "ctrlr-dropCard " + (dragOver ? "ctrlr-dropCard--over" : "")
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
                {file
                  ? "Next step: convert it into a modern PDF."
                  : "WordPerfect, OpenDocument, and CAD files — converted to clean PDFs in seconds."}
              </p>

              <button className="ctrlr-browseBtn" onClick={onBrowse}>
                Browse files <span aria-hidden="true">➜</span>
              </button>

              <input
                ref={inputRef}
                type="file"
                className="ctrlr-hiddenInput"
                accept=".wpd,.wp,.xls,.xlsx,.ods,.dwg,.doc,.docx"
                onChange={onInputChange}
              />

              <div className="ctrlr-meta">
                {file ? (
                  <span className="ctrlr-filePill">
                    {file.name}{" "}
                    <button
                      type="button"
                      aria-label="Remove file"
                      onClick={() => setFile(null)}
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

          <p className="ctrlr-tagline">
            Old file formats aren’t broken—they’re just forgotten.
          </p>
        </main>
      </div>
    </div>
  );
}
