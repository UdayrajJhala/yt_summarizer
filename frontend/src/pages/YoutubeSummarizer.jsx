import React, { useState, useRef } from "react";
import axios from "axios";
import ReactMarkdown from "react-markdown";
import html2pdf from "html2pdf.js";
import "./YoutubeSummarizer.css";

const SUPPORTED_LANGUAGES = {
  en: "English",
  hi: "हिंदी (Hindi)",
  bn: "বাংলা (Bengali)",
  te: "తెలుగు (Telugu)",
  ta: "தமிழ் (Tamil)",
  mr: "मराठी (Marathi)",
  gu: "ગુજરાતી (Gujarati)",
  kn: "ಕನ್ನಡ (Kannada)",
  ml: "മലയാളം (Malayalam)",
  pa: "ਪੰਜਾਬੀ (Punjabi)",
  or: "ଓଡ଼ିଆ (Odia)",
};

const YoutubeSummarizer = () => {
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [summary, setSummary] = useState("");
  const [editableSummary, setEditableSummary] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [targetLanguage, setTargetLanguage] = useState("en");
  const [isEditing, setIsEditing] = useState(false);
  const summaryRef = useRef(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await axios.post(
        "http://localhost:8000/api/summarize/",
        {
          youtube_url: youtubeUrl,
          target_language: targetLanguage,
        }
      );
      setSummary(response.data.summary);
      setEditableSummary(response.data.summary);
      setError("");
    } catch (err) {
      setError(err.response?.data?.error || "An error occurred");
      setSummary("");
      setEditableSummary("");
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPDF = () => {
    const element = summaryRef.current;
    const opt = {
      margin: 1,
      filename: `video-summary-${targetLanguage}.pdf`,
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: "in", format: "letter", orientation: "portrait" },
    };

    html2pdf().set(opt).from(element).save();
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleSave = () => {
    setSummary(editableSummary);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditableSummary(summary);
    setIsEditing(false);
  };

  return (
    <div className="container">
      <div className="summarizer-card">
        <div className="card-header">
          <h1>YouTube Video Summarizer</h1>
        </div>

        <div className="card-content">
          <form onSubmit={handleSubmit} className="summarizer-form">
            <div className="form-group">
              <label htmlFor="youtube-url">Enter YouTube URL</label>
              <div className="input-container">
                <input
                  id="youtube-url"
                  type="text"
                  value={youtubeUrl}
                  onChange={(e) => setYoutubeUrl(e.target.value)}
                  placeholder="https://www.youtube.com/watch?v=..."
                  className="url-input"
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="language-select">Select Summary Language</label>
              <select
                id="language-select"
                value={targetLanguage}
                onChange={(e) => setTargetLanguage(e.target.value)}
                className="language-select"
              >
                {Object.entries(SUPPORTED_LANGUAGES).map(([code, name]) => (
                  <option key={code} value={code}>
                    {name}
                  </option>
                ))}
              </select>
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`submit-button ${loading ? "loading" : ""}`}
            >
              {loading ? "Loading..." : "Summarize"}
            </button>
          </form>

          {error && <div className="error-message">{error}</div>}

          {summary && (
            <div className="summary-container">
              <div className="summary-header">
                <h2>Summary</h2>
                <div className="summary-actions">
                  {!isEditing && (
                    <>
                      <button onClick={handleEdit} className="edit-button">
                        Edit
                      </button>
                      <button
                        onClick={handleDownloadPDF}
                        className="download-button"
                      >
                        Download PDF
                      </button>
                    </>
                  )}
                  {isEditing && (
                    <>
                      <button onClick={handleSave} className="save-button">
                        Save
                      </button>
                      <button onClick={handleCancel} className="cancel-button">
                        Cancel
                      </button>
                    </>
                  )}
                </div>
              </div>

              <div ref={summaryRef} className="summary-content">
                <div className="summary-meta">
                  <p>Video URL: {youtubeUrl}</p>
                </div>
                {isEditing ? (
                  <textarea
                    value={editableSummary}
                    onChange={(e) => setEditableSummary(e.target.value)}
                    className="summary-editor"
                    rows={10}
                  />
                ) : (
                  <ReactMarkdown>{summary}</ReactMarkdown>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default YoutubeSummarizer;
