"use client";
import React, { useRef, useEffect, useState } from "react";

type Analysis = {
  summary: string;
  value: string;
  highlights: string[] | string;
  skills: string[];
};

export default function CareerDashboardPage() {
  const chartRef = useRef<HTMLCanvasElement>(null);
  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const [uploading, setUploading] = useState(false);
  const [company, setCompany] = useState("");
  const [role, setRole] = useState("");
  const [coverLetter, setCoverLetter] = useState("");
  const [generating, setGenerating] = useState(false);

  // Render chart when skills change
  useEffect(() => {
    let chart: import("chart.js/auto").Chart | undefined;
    if (!analysis?.skills?.length) return;
    import("chart.js/auto").then((Chart) => {
      if (chartRef.current) {
        chart = new Chart.default(chartRef.current, {
          type: "bar",
          data: {
            labels: analysis.skills,
            datasets: [
              {
                label: "Skill Strength",
                data: analysis.skills.map(() => 5),
                backgroundColor: "rgba(129, 178, 154, 0.6)",
                borderColor: "rgba(129, 178, 154, 1)",
                borderWidth: 1,
              },
            ],
          },
          options: {
            indexAxis: "y",
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: { display: false },
            },
            scales: {
              x: { beginAtZero: true, max: 5, ticks: { display: false } },
              y: { ticks: { font: { size: 14 } } },
            },
          },
        });
      }
    });
    return () => {
      chart?.destroy();
    };
  }, [analysis?.skills]);

  // Resume upload handler
  async function handleResumeUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setAnalysis(null);
    setCoverLetter("");
    const formData = new FormData();
    formData.append("resume", file);

    const res = await fetch("/api/upload-resume", {
      method: "POST",
      body: formData,
    });
    const data = await res.json();
    setAnalysis(data);
    setUploading(false);
  }

  // Cover letter generation handler
  async function handleGenerateCoverLetter() {
    setGenerating(true);
    setCoverLetter("");
    if (!analysis) {
      setCoverLetter(
        "Resume analysis is missing. Please upload your resume first."
      );
      setGenerating(false);
      return;
    }
    const prompt = `
You are a professional career assistant.
Given this candidate's resume summary: ${analysis.summary}
Value proposition: ${analysis.value}
Highlights: ${
      Array.isArray(analysis.highlights)
        ? analysis.highlights.join(", ")
        : analysis.highlights
    }
Skills: ${
      Array.isArray(analysis.skills)
        ? analysis.skills.join(", ")
        : analysis.skills
    }
Write a concise, tailored cover letter for the role "${role}" at "${company}". Make it professional, enthusiastic, and relevant to the job.
    `;
    const res = await fetch("/api/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt }),
    });
    const data = await res.json();
    setCoverLetter(data.message || "Could not generate cover letter.");
    setGenerating(false);
  }

  return (
    <div className="container mx-auto px-6 py-8">
      <h1 className="text-4xl font-bold mb-8 text-center">
        Career Strategy Dashboard
      </h1>
      {/* Resume Upload */}
      <div className=" p-6 rounded-xl shadow-lg border mb-8 max-w-xl mx-auto">
        <h2 className="text-xl font-bold mb-4">Upload Your Resume (PDF)</h2>
        <input
          type="file"
          accept=".pdf"
          onChange={handleResumeUpload}
          className="mb-2"
        />
        {uploading && (
          <p className="text-blue-600">Extracting and analyzing resume...</p>
        )}
      </div>
      {/* Analysis */}
      {analysis && (
        <div className=" p-6 rounded-xl shadow-lg border mb-8 max-w-2xl mx-auto">
          <h2 className="text-xl font-bold mb-2">Resume Analysis</h2>
          <p className="mb-2">
            <strong>Summary:</strong> {analysis.summary}
          </p>
          <p className="mb-2">
            <strong>Value Proposition:</strong> {analysis.value}
          </p>
          <p className="mb-2">
            <strong>Highlights:</strong>{" "}
            {Array.isArray(analysis.highlights)
              ? analysis.highlights.join(", ")
              : analysis.highlights}
          </p>
          <p className="mb-2">
            <strong>Skills:</strong>{" "}
            {Array.isArray(analysis.skills)
              ? analysis.skills.join(", ")
              : analysis.skills}
          </p>
        </div>
      )}
      {/* Skills Chart */}
      {analysis &&
        Array.isArray(analysis.skills) &&
        analysis.skills.length > 0 && (
          <div className=" p-6 rounded-xl shadow-lg border mb-8 max-w-2xl mx-auto">
            <h2 className="text-xl font-bold mb-4 text-center">
              Skill Profile Chart
            </h2>
            <div style={{ height: 350 }}>
              <canvas ref={chartRef} />
            </div>
          </div>
        )}
      {/* Cover Letter Generator */}
      {Array.isArray(analysis?.skills) && analysis.skills.length > 0 && (
        <div className=" p-6 rounded-xl shadow-lg border mb-12 max-w-xl mx-auto">
          <h2 className="text-xl font-bold mb-4">
            ✨ Generate a Cover Letter Draft
          </h2>
          <div className="mb-4">
            <label className="block mb-1">Company Name:</label>
            <input
              className="border rounded p-2 w-full"
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              disabled={generating}
            />
          </div>
          <div className="mb-4">
            <label className="block mb-1">Job Role:</label>
            <input
              className="border rounded p-2 w-full"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              disabled={generating}
            />
          </div>
          <button
            className="px-4 py-2 bg-green-600 text-white rounded"
            onClick={handleGenerateCoverLetter}
            disabled={generating || !company || !role}>
            {generating ? "Generating..." : "Generate Draft"}
          </button>
          {coverLetter && (
            <div className="mt-4">
              <label className="block mb-1 font-semibold">
                Generated Cover Letter:
              </label>
              <textarea
                className="w-full h-48 border rounded p-2"
                value={coverLetter}
                readOnly
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
