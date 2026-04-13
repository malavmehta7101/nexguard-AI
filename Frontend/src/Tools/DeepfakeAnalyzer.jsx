import { useState, useRef, useCallback } from "react";
import { Eye, Video, Mic, Image, Upload, X, FileVideo, FileAudio, FileImage, AlertTriangle, CheckCircle, HelpCircle } from "lucide-react";

const VERDICT_STYLE = {
  AUTHENTIC:         { color: "var(--primary)", bg: "var(--primary-dim)", icon: <CheckCircle size={20} />, label: "✓ LIKELY AUTHENTIC" },
  LIKELY_SYNTHETIC:  { color: "var(--warning)", bg: "var(--warning-dim)", icon: <AlertTriangle size={20} />, label: "⚠ LIKELY SYNTHETIC / AI GENERATED" },
  DEEPFAKE:          { color: "var(--danger)",  bg: "var(--danger-dim)",  icon: <AlertTriangle size={20} />, label: "✗ DEEPFAKE DETECTED" },
  AI_GENERATED:      { color: "var(--danger)",  bg: "var(--danger-dim)",  icon: <AlertTriangle size={20} />, label: "✗ AI GENERATED CONTENT" },
  AI_VOICE:          { color: "var(--warning)", bg: "var(--warning-dim)", icon: <AlertTriangle size={20} />, label: "⚠ AI VOICE / VOICE CLONE DETECTED" },
  ANALYSIS_COMPLETE: { color: "var(--cyan)",    bg: "var(--cyan-dim)",    icon: <HelpCircle size={20} />,   label: "◈ ANALYSIS COMPLETE" },
};

const ACCEPTED = {
  image: { mime: "image/jpeg,image/png,image/gif,image/webp,image/bmp", exts: ["JPG","PNG","GIF","WEBP","BMP"], label: "Images" },
  video: { mime: "video/mp4,video/quicktime,video/x-msvideo,video/x-matroska,video/webm", exts: ["MP4","MOV","AVI","MKV","WEBM"], label: "Videos" },
  audio: { mime: "audio/mpeg,audio/wav,audio/ogg,audio/mp4,audio/aac", exts: ["MP3","WAV","OGG","M4A","AAC"], label: "Audio" },
};

const ARTIFACTS_INFO = {
  image: ["GAN face boundary blending artifacts","Unnatural skin texture / AI smoothing","Lighting direction inconsistencies","JPEG compression grid anomalies","Eye reflections & pupil irregularities","Background perspective distortions","Diffusion model upsampling patterns","Hair and fine detail rendering artifacts"],
  video: ["Temporal flickering in face region","Audio-visual lip sync mismatch","Unnatural blinking rate (too fast/slow)","Face boundary shimmer between frames","Neck and shoulder blending issues","Inconsistent lighting across frames","Background warping near face edges","Micro-expression unnaturalness"],
  audio: ["Pitch and formant inconsistencies","Unnatural pause and breath patterns","Spectral anomalies from AI vocoder","Robotic or over-smoothed prosody","Background noise AI artifacts","Clipping from TTS synthesis","Unnatural phoneme transitions","Echo/reverb inconsistency"],
};

function FileDropZone({ mediaType, onFile }) {
  const inputRef = useRef(null);
  const [dragging, setDragging] = useState(false);
  const accept = ACCEPTED[mediaType];

  const handle = useCallback((file) => {
    if (!file) return;
    const ext = file.name.split(".").pop().toUpperCase();
    if (!accept.exts.includes(ext)) {
      alert(`Unsupported format. Allowed: ${accept.exts.join(", ")}`);
      return;
    }
    if (file.size > 50 * 1024 * 1024) {
      alert("File too large. Maximum size is 50MB.");
      return;
    }
    onFile(file);
  }, [accept, onFile]);

  const onDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    handle(e.dataTransfer.files[0]);
  };

  const icon = mediaType === "image" ? <Image size={32} /> : mediaType === "video" ? <Video size={32} /> : <Mic size={32} />;

  return (
    <div
      onClick={() => inputRef.current?.click()}
      onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
      onDragLeave={() => setDragging(false)}
      onDrop={onDrop}
      style={{
        border: `2px dashed ${dragging ? "var(--primary)" : "var(--border2)"}`,
        padding: "40px 20px", textAlign: "center", cursor: "pointer",
        background: dragging ? "var(--primary-dim)" : "var(--surface)",
        transition: "all .2s",
      }}
      onMouseEnter={e => e.currentTarget.style.borderColor = "var(--primary)"}
      onMouseLeave={e => { if (!dragging) e.currentTarget.style.borderColor = "var(--border2)"; }}
    >
      <input
        ref={inputRef} type="file" accept={accept.mime}
        style={{ display: "none" }}
        onChange={e => handle(e.target.files[0])}
      />
      <div style={{ color: "var(--primary)", marginBottom: 12 }}>{icon}</div>
      <div style={{ fontFamily: "Syne, sans-serif", fontSize: 15, fontWeight: 700, color: "var(--white)", marginBottom: 6 }}>
        Drop {accept.label} here or click to browse
      </div>
      <div style={{ fontSize: 11, color: "var(--text2)", marginBottom: 10 }}>
        Supports: {accept.exts.join(", ")} · Max 50MB
      </div>
      <div style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
        <button className="btn sm" style={{ pointerEvents: "none" }}>
          <Upload size={12} /> Choose File
        </button>
      </div>
    </div>
  );
}

function FilePreview({ file, onRemove }) {
  const ext  = file.name.split(".").pop().toUpperCase();
  const isImg = ["JPG","JPEG","PNG","GIF","WEBP","BMP"].includes(ext);
  const isVid = ["MP4","MOV","AVI","MKV","WEBM"].includes(ext);
  const url  = URL.createObjectURL(file);
  const sizeMB = (file.size / (1024 * 1024)).toFixed(2);

  return (
    <div style={{ background: "var(--surface)", border: "1px solid var(--border)", padding: 16, position: "relative" }}>
      <button onClick={onRemove} style={{ position: "absolute", top: 10, right: 10, background: "none", border: "none", color: "var(--text2)", cursor: "pointer", display: "flex" }}>
        <X size={16} />
      </button>

      {isImg && (
        <img src={url} alt="preview" style={{ width: "100%", maxHeight: 280, objectFit: "contain", marginBottom: 12, display: "block" }} />
      )}
      {isVid && (
        <video src={url} controls style={{ width: "100%", maxHeight: 280, marginBottom: 12, display: "block" }} />
      )}
      {!isImg && !isVid && (
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12, padding: "16px 0" }}>
          <Mic size={28} color="var(--cyan)" />
          <div>
            <div style={{ fontSize: 13, color: "var(--white)", marginBottom: 3 }}>{file.name}</div>
            <audio src={url} controls style={{ width: "100%", accentColor: "var(--primary)" }} />
          </div>
        </div>
      )}

      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        <span className="tag g">{file.name}</span>
        <span className="tag c">{sizeMB} MB</span>
        <span className="tag m">{ext}</span>
      </div>
    </div>
  );
}

export default function DeepfakeAnalyzer() {
  const [mode, setMode] = useState("upload");           // "upload" | "describe"
  const [mediaType, setMediaType] = useState("image");
  const [file, setFile] = useState(null);
  const [description, setDescription] = useState("");
  const [metadata, setMetadata] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState("");

  const reset = () => { setFile(null); setResult(null); setDescription(""); setMetadata(""); };

  // ── File Upload Analysis ───────────────────────────────────────────────────
  const analyzeFile = async () => {
    if (!file) return;
    setLoading(true); setResult(null);
    setProgress(mediaType === "image" ? "Sending image to Claude Vision AI..." : `Analyzing ${mediaType} metadata...`);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const r = await fetch("/api/ai/deepfake-file", { method: "POST", body: formData });
      if (!r.ok) {
        const err = await r.json();
        throw new Error(err.error || "Upload failed");
      }
      setResult(await r.json());
    } catch (e) {
      setResult({ verdict: "ANALYSIS_COMPLETE", confidence: 0, media_type: mediaType, artifacts_detected: [], analysis: `Error: ${e.message}`, recommendations: ["Check your internet connection and try again"] });
    }
    setLoading(false); setProgress("");
  };

  // ── Description Analysis ───────────────────────────────────────────────────
  const analyzeDescription = async () => {
    if (!description.trim()) return;
    setLoading(true); setResult(null); setProgress("Running AI analysis...");
    try {
      const r = await fetch("/api/ai/deepfake", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ description: description.trim(), metadata: metadata.trim(), type: mediaType }),
      });
      setResult(await r.json());
    } catch (e) {
      setResult({ verdict: "ANALYSIS_COMPLETE", confidence: 0, artifacts_detected: [], analysis: `Error: ${e.message}`, recommendations: [] });
    }
    setLoading(false); setProgress("");
  };

  const vs = VERDICT_STYLE[result?.verdict] || VERDICT_STYLE.ANALYSIS_COMPLETE;

  return (
    <div className="fade-up">
      {/* Header */}
      <div style={{ marginBottom: 20 }}>
        <h2 style={{ fontFamily: "Syne, sans-serif", fontSize: 20, fontWeight: 800, color: "var(--white)", marginBottom: 4 }}>Deepfake Audio &amp; Video Analyzer</h2>
        <p style={{ fontSize: 11, color: "var(--text2)" }}>&gt; Upload media for AI-powered deepfake detection · Images analyzed with Claude Vision</p>
      </div>

      {/* Mode Toggle */}
      <div style={{ display: "flex", gap: 8, marginBottom: 18 }}>
        <button className={`tool-tab${mode === "upload" ? " active" : ""}`} onClick={() => { setMode("upload"); reset(); }}>
          <Upload size={13} /> Upload File
        </button>
        <button className={`tool-tab${mode === "describe" ? " active" : ""}`} onClick={() => { setMode("describe"); reset(); }}>
          <Eye size={13} /> Describe / Metadata
        </button>
      </div>

      {/* Media Type (for both modes) */}
      <div style={{ display: "flex", gap: 8, marginBottom: 18 }}>
        {["image","video","audio"].map(t => (
          <button key={t} className={`tool-tab${mediaType === t ? " active" : ""}`} onClick={() => { setMediaType(t); reset(); }}>
            {t === "image" ? <Image size={13} /> : t === "video" ? <Video size={13} /> : <Mic size={13} />}
            {t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      {/* Upload Mode */}
      {mode === "upload" && (
        <div className="card" style={{ padding: 22, marginBottom: 18 }}>
          {mediaType === "image" && (
            <div className="alert good" style={{ marginBottom: 14 }}>
              ◈ Images are analyzed directly with Claude Vision AI — most accurate analysis available.
            </div>
          )}
          {mediaType === "video" && (
            <div className="alert warn" style={{ marginBottom: 14 }}>
              ⚠ Video analysis uses metadata &amp; file properties. For frame-level analysis, use the Describe mode with specific observations.
            </div>
          )}
          {mediaType === "audio" && (
            <div className="alert info" style={{ marginBottom: 14 }}>
              ◈ Audio analysis uses file metadata &amp; properties. Describe voice characteristics below for deeper AI analysis.
            </div>
          )}

          {!file ? (
            <FileDropZone mediaType={mediaType} onFile={setFile} />
          ) : (
            <div>
              <FilePreview file={file} onRemove={reset} />
              <button
                className="btn solid"
                onClick={analyzeFile}
                disabled={loading}
                style={{ width: "100%", marginTop: 14, padding: "12px" }}
              >
                {loading
                  ? <><span className="spinner spin" /> {progress || "Analyzing..."}</>
                  : <><Eye size={14} /> Analyze for Deepfake / AI Generation</>}
              </button>
            </div>
          )}
        </div>
      )}

      {/* Describe Mode */}
      {mode === "describe" && (
        <div className="card" style={{ padding: 22, marginBottom: 18 }}>
          <div className="section-label">BEHAVIORAL OBSERVATIONS / DESCRIPTION</div>
          <textarea
            className="input textarea" rows={5}
            placeholder={
              mediaType === "image"
                ? "Describe what you observe: facial texture, lighting direction, background sharpness, any blurring around edges, eye reflections, skin smoothness..."
                : mediaType === "video"
                ? "Describe: facial movements, blinking patterns, lip sync accuracy, lighting consistency, any flickering or glitching around the face..."
                : "Describe: voice naturalness, pauses, breathing sounds, any robotic quality, pitch consistency, background audio..."
            }
            value={description}
            onChange={e => setDescription(e.target.value)}
            style={{ marginBottom: 14 }}
          />
          <div className="section-label">FILE METADATA (optional)</div>
          <textarea
            className="input" rows={3}
            placeholder='e.g. "MP4, H.264, 1920x1080, 30fps, created 2024-01-15, encoded with HandBrake"'
            value={metadata}
            onChange={e => setMetadata(e.target.value)}
            style={{ marginBottom: 14 }}
          />
          <button className="btn solid" onClick={analyzeDescription} disabled={loading || !description.trim()} style={{ width: "100%" }}>
            {loading ? <><span className="spinner spin" /> {progress}</> : <><Eye size={14} /> Analyze Description</>}
          </button>
        </div>
      )}

      {/* Artifacts Reference */}
      <div className="card" style={{ padding: 18, marginBottom: 18 }}>
        <div className="section-label">KNOWN {mediaType.toUpperCase()} DEEPFAKE ARTIFACTS — WHAT TO LOOK FOR</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 7 }}>
          {ARTIFACTS_INFO[mediaType].map((a, i) => (
            <div key={i} style={{ display: "flex", gap: 7, fontSize: 11, color: "var(--text)" }}>
              <span style={{ color: "var(--warning)", flexShrink: 0 }}>◈</span>{a}
            </div>
          ))}
        </div>
      </div>

      {/* Result */}
      {result && (
        <div className="card fade-up" style={{ padding: 22 }}>
          {/* Verdict Banner */}
          <div style={{ background: vs.bg, border: `1px solid ${vs.color}30`, padding: "16px 18px", marginBottom: 20, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{ color: vs.color }}>{vs.icon}</span>
              <div className="verdict" style={{ color: vs.color }}>{vs.label}</div>
            </div>
            <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
              {result.filename && <span className="tag g" style={{ fontSize: 9 }}>{result.filename}</span>}
              {result.size_mb  && <span className="tag c" style={{ fontSize: 9 }}>{result.size_mb}MB</span>}
              <span style={{ fontSize: 11, color: "var(--text2)" }}>
                Confidence: <b style={{ color: vs.color }}>{result.confidence}%</b>
              </span>
            </div>
          </div>

          {/* Confidence Bar */}
          {result.confidence > 0 && (
            <div style={{ marginBottom: 18 }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, color: "var(--text2)", marginBottom: 5 }}>
                <span>DETECTION CONFIDENCE</span><span>{result.confidence}%</span>
              </div>
              <div className="progress-track" style={{ height: 5 }}>
                <div className="progress-fill" style={{ width: `${result.confidence}%`, background: vs.color, height: "100%" }} />
              </div>
            </div>
          )}

          {/* Artifacts */}
          {result.artifacts_detected?.length > 0 && (
            <div style={{ marginBottom: 16 }}>
              <div className="section-label">ARTIFACTS / INDICATORS DETECTED</div>
              <div style={{ display: "flex", gap: 7, flexWrap: "wrap" }}>
                {result.artifacts_detected.map((a, i) => <span key={i} className="tag d">{a}</span>)}
              </div>
            </div>
          )}

          {/* Analysis */}
          {result.analysis && (
            <div style={{ marginBottom: 16 }}>
              <div className="section-label">DETAILED AI ANALYSIS</div>
              <div className="result-box">{result.analysis}</div>
            </div>
          )}

          {/* Recommendations */}
          {result.recommendations?.length > 0 && (
            <div>
              <div className="section-label">RECOMMENDATIONS</div>
              {result.recommendations.map((r, i) => (
                <div key={i} style={{ display: "flex", gap: 8, fontSize: 11.5, color: "var(--text)", marginBottom: 6 }}>
                  <span style={{ color: "var(--primary)", flexShrink: 0 }}>→</span>{r}
                </div>
              ))}
            </div>
          )}

          <button className="btn sm cyan" onClick={reset} style={{ marginTop: 16 }}>Analyze Another File</button>
        </div>
      )}
    </div>
  );
}
