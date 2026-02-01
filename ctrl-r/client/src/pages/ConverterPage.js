// ===============================
// File: src/pages/ConverterPage.jsx
// ===============================

import { useState, useEffect } from "react";
import { ConvertFile } from "../backend/backend";

export default function ConverterPage() {
  const [file, setFile] = useState(null);
  const [converted, setConverted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState(null);

  useEffect(() => {
    fetch("/api") // The proxy forwards this to localhost:3001/api
      .then((res) => res.json())
      .then((data) => setData(data.message));
  }, []);

  const handleUpload = (e) => {
    if (e.target.files.length > 0) {
      setFile(e.target.files[0]);
      setConverted(false);
    }
  };

  const handleConvert = () => {
    if (!file) return;

    var currentFiletype = file.name.split(".").pop(); // make sure it's supported
    var targetFiletype = "pdf";

    ConvertFile(file, currentFiletype, targetFiletype);

    setLoading(true);

    // Fake conversion delay
    setTimeout(() => {
      setLoading(false);
      setConverted(true);
    }, 1200);
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      {/* Header */}
      <header className="text-center mb-10">
        <span className="inline-block bg-green-100 text-green-700 px-4 py-1 rounded-full text-sm mb-4">
          AI Document Modernizer
        </span>
        <h1 className="text-4xl font-bold mb-2">
          Legacy Document Converter
        </h1>
        <p className="text-slate-600 max-w-xl mx-auto">
          Convert WordPerfect and Lotus 1-2-3 files into modern PDFs with
          automatic summaries.
        </p>
        <p>data: {data}</p>
      </header>

      {/* Main Layout */}
      <main className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
        {/* Left Panel */}
        <div className="bg-white rounded-2xl shadow p-5 min-h-[500px]">
          <h2 className="font-semibold mb-4">📄 Original Document</h2>

          <label className="block border-2 border-dashed border-slate-300 rounded-xl p-6 text-center cursor-pointer hover:border-green-500 hover:bg-green-50 transition">
            <input
              type="file"
              className="hidden"
              accept=".wpd,.wk1,.wk3,.123,.doc"
              onChange={handleUpload}
            />
            <p className="font-medium">Click to upload</p>
            <p className="text-sm text-slate-500 mt-1">
              WordPerfect / Lotus files
            </p>
          </label>

          {/* Preview */}
          <div className="mt-6 bg-slate-100 rounded-lg p-4 text-sm font-mono text-slate-700 whitespace-pre-wrap">
            {file ? (
              <>Loaded: {file.name}

Parsing preview coming from backend...</>
            ) : (
              <>No file uploaded yet.

Upload a legacy document to preview.</>
            )}
          </div>
        </div>

        {/* Middle */}
        <div className="flex flex-col items-center justify-center gap-4 mt-6 md:mt-0">
          <button
            onClick={handleConvert}
            disabled={!file || loading}
            className="w-16 h-16 rounded-full bg-green-600 text-white text-2xl shadow-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            {loading ? "⏳" : converted ? "✓" : "→"}
          </button>
          <p className="text-sm text-slate-500">Convert</p>
        </div>

        {/* Right Panel */}
        <div className="bg-white rounded-2xl shadow p-5 min-h-[500px]">
          <h2 className="font-semibold mb-4 text-white bg-green-600 rounded-lg px-3 py-2">
            ✨ Modern PDF
          </h2>

          {!converted && !loading && (
            <div className="text-center text-slate-500 mt-24">
              Converted document preview
              <br />
              will appear here.
            </div>
          )}

          {loading && (
            <div className="text-center text-slate-500 mt-24">
              Converting document...
            </div>
          )}

          {converted && !loading && (
            <div>
              {/* Summary */}
              <h3 className="text-xl font-semibold mb-1">
                Q1 Financial Summary
              </h3>
              <p className="text-sm text-slate-500 mb-4">
                Finance Dept • March 2026
              </p>

              <h4 className="font-medium mb-2">Executive Summary</h4>
              <p className="text-slate-600 text-sm leading-relaxed mb-5">
                Revenue increased by 23% compared to last quarter, driven by
                strong performance in the Northeast region and improved
                operational efficiency.
              </p>

              {/* Metrics */}
              <div className="grid grid-cols-2 gap-3 mb-5">
                <Metric
                  label="Total Revenue"
                  value="$1.24M"
                  change="↑ 23% QoQ"
                />
                <Metric
                  label="Net Profit"
                  value="$422K"
                  change="↑ 18% YoY"
                />
              </div>

              {/* Regions */}
              <h4 className="font-medium mb-2">Regional Performance</h4>

              <Region name="Northeast" value="$487K" percent={85} />
              <Region name="Southeast" value="$312K" percent={55} />
              <Region name="Midwest" value="$289K" percent={50} />

              {/* Download */}
              <button className="mt-6 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition">
                Download PDF
              </button>
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="text-center text-sm text-slate-400 mt-12">
        Prototype UI — Legacy Converter
      </footer>
    </div>
  );
}

/* Components */

function Metric({ label, value, change }) {
  return (
    <div className="bg-green-50 border border-green-200 rounded-xl p-3">
      <p className="text-xs text-green-700">{label}</p>
      <p className="text-lg font-semibold">{value}</p>
      <p className="text-xs text-green-600">{change}</p>
    </div>
  );
}

function Region({ name, value, percent }) {
  return (
    <div className="mb-3">
      <div className="flex justify-between text-sm mb-1">
        <span>{name}</span>
        <span>{value}</span>
      </div>
      <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
        <div
          className="h-full bg-green-500"
          style={{ width: `${percent}%` }}
        ></div>
      </div>
    </div>
  );
}


