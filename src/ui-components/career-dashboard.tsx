"use client";
import React, { useRef, useEffect, useState } from "react";
import {
  Upload,
  BarChart3,
  BarChart,
  Mail,
  Copy,
  Check,
  Loader2,
  FileText,
  GraduationCap,
  Lightbulb,
  User,
  AlertCircle,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

type Skill = {
  name: string;
  percentage: number;
  reason: string;
};

type Experience = {
  company: string;
  role: string;
  duration: string;
  responsibilities: string;
};

type Education = {
  degree: string;
  institution: string;
  year: string;
  honors: string;
};

type Analysis = {
  candidateName?: string;
  summary: string;
  value: string;
  highlights: string[] | string;
  skills: Skill[];
  segments?: string[];
  improvementSuggestions?: string[];
  experience?: Experience[];
  education?: Education[];
  formatting?: string;
  keywordMatch?: string[];
};

export default function CareerDashboardPage() {
  const chartRef = useRef<HTMLCanvasElement>(null);
  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [company, setCompany] = useState("");
  const [role, setRole] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [coverLetter, setCoverLetter] = useState("");
  const [generating, setGenerating] = useState(false);
  const [copied, setCopied] = useState(false);

  // Chart.js handling
  useEffect(() => {
    let chart: import("chart.js/auto").Chart | undefined;
    if (!analysis?.skills?.length) return;
    import("chart.js/auto").then((Chart) => {
      if (chartRef.current) {
        chart = new Chart.default(chartRef.current, {
          type: "bar",
          data: {
            labels: analysis.skills.map((s) => s.name),
            datasets: [
              {
                label: "Skill Emphasis (%)",
                data: analysis.skills.map((s) => s.percentage),
                backgroundColor: "rgba(59, 130, 246, 0.2)",
                borderColor: "rgba(59, 130, 246, 0.8)",
                borderWidth: 2,
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
              x: {
                beginAtZero: true,
                max: 100,
                title: { display: true, text: "Emphasis (%)" },
                grid: { color: "rgba(0, 0, 0, 0.05)" },
              },
              y: { ticks: { font: { size: 14 }, color: "#374151" } },
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
    setError(null);
    setCoverLetter("");
    const formData = new FormData();
    formData.append("resume", file);

    try {
      const res = await fetch("/api/upload-resume", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(
          data.error || "Failed to process resume. Please try again."
        );
      }
      setAnalysis(data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "An unexpected error occurred."
      );
    } finally {
      setUploading(false);
    }
  }

  // Cover letter generation handler
  async function handleGenerateCoverLetter() {
    setGenerating(true);
    setCoverLetter("");
    setError(null);
    if (!analysis) {
      setError("Resume analysis is missing. Please upload your resume first.");
      setGenerating(false);
      return;
    }
    const prompt = `
      You are a professional career assistant. Your task is to write a concise, tailored cover letter.

      **Candidate's Profile (from their resume):**
      - Name: ${analysis.candidateName || "The Candidate"}
      - Summary: ${analysis.summary}
      - Value Proposition: ${analysis.value}
      - Highlights: ${
        Array.isArray(analysis.highlights)
          ? analysis.highlights.join(", ")
          : analysis.highlights
      }
      - Key Skills: ${
        Array.isArray(analysis.skills)
          ? analysis.skills.map((s) => s.name).join(", ")
          : ""
      }

      **Target Job:**
      - Role: "${role}"
      - Company: "${company}"
      ${jobDescription ? `- Job Description: """${jobDescription}"""` : ""}

      **Instructions:**
      Write a professional and enthusiastic cover letter.
      ${
        jobDescription
          ? "Crucially, align the candidate's skills and highlights with the requirements mentioned in the job description."
          : "Focus on the candidate's general strengths and suitability for the role."
      }
      Sign off the letter professionally with the candidate's name.
      Keep it concise and impactful.
          `;
    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Could not generate cover letter.");
      }
      setCoverLetter(data.message);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "An unknown error occurred."
      );
    } finally {
      setGenerating(false);
    }
  }

  // Copy cover letter to clipboard
  function handleCopy() {
    if (!coverLetter) return;
    navigator.clipboard.writeText(coverLetter);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <div className="min-h-screen  text-gray-800 px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-4xl md:text-5xl font-bold mb-12 text-center text-gray-800 tracking-tight">
        Career Strategy Dashboard
      </h1>

      {/* Upload Card */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-xl mx-auto mb-12">
        <div className="bg-white/60 backdrop-blur-xl border border-gray-200/80 rounded-3xl shadow-2xl shadow-gray-200/60 p-8 flex flex-col items-center relative">
          <Upload className="w-10 h-10 text-blue-400 mb-3" />
          <h2 className="text-2xl font-semibold text-gray-700 mb-2">
            Upload Your Resume
          </h2>
          <p className="text-gray-500 mb-6">
            Get an instant AI-powered analysis.
          </p>
          <label
            htmlFor="resume-upload"
            className="cursor-pointer px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-full shadow-lg shadow-blue-500/20 hover:shadow-xl hover:shadow-blue-500/30 transition-all duration-300 mb-4">
            Choose PDF File
          </label>
          <input
            id="resume-upload"
            type="file"
            accept=".pdf"
            onChange={handleResumeUpload}
            className="hidden"
            disabled={uploading}
          />
          {uploading && (
            <div className="flex items-center gap-2 text-gray-500 mt-2">
              <Loader2 className="animate-spin h-5 w-5" />
              <span>Extracting and analyzing resume...</span>
            </div>
          )}
          {error && !analysis && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-2 text-red-600 bg-red-100/50 rounded-lg px-4 py-2 mt-4 text-sm">
              <AlertCircle className="h-5 w-5 flex-shrink-0" />
              <span>{error}</span>
            </motion.div>
          )}
        </div>
      </motion.div>

      {/* Main Content */}
      <AnimatePresence>
        {analysis && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 30 }}
            className="flex flex-col gap-8 max-w-3xl mx-auto">
            {analysis.candidateName && (
              <h2 className="text-3xl font-bold text-center text-gray-700 -mb-4">
                Analysis for {analysis.candidateName}
              </h2>
            )}
            {/* Summary Card */}
            <div className="bg-white/60 backdrop-blur-xl border border-gray-200/80 rounded-3xl shadow-xl shadow-gray-200/50 p-6 md:p-8">
              <div className="flex items-center gap-3 mb-4">
                <User className="w-7 h-7 text-blue-400" />
                <h3 className="text-xl font-semibold text-gray-700">Summary</h3>
              </div>
              <p className="mb-4 text-lg text-gray-600">{analysis.summary}</p>
              <div className="flex flex-col sm:flex-row gap-4 text-sm">
                <div>
                  <span className="font-semibold text-gray-700">
                    Value Proposition:
                  </span>{" "}
                  <span className="text-gray-600">{analysis.value}</span>
                </div>
              </div>
            </div>

            {/* Skills Card */}
            <div className="bg-white/60 backdrop-blur-xl border border-gray-200/80 rounded-3xl shadow-xl shadow-gray-200/50 p-6 md:p-8">
              <div className="flex items-center gap-3 mb-4">
                <BarChart className="w-7 h-7 text-blue-400" />
                <h3 className="text-xl font-semibold text-gray-700">Skills</h3>
              </div>
              <div className="flex flex-wrap gap-2">
                {analysis.skills.map((skill, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-2 bg-blue-100/70 rounded-lg px-3 py-1 text-sm">
                    <span className="font-medium text-blue-800">
                      {skill.name}
                    </span>
                    <span className="text-blue-600 font-semibold">
                      {skill.percentage}%
                    </span>
                  </div>
                ))}
              </div>
              <ul className="mt-5 space-y-2 text-xs text-gray-500">
                {analysis.skills.map((skill, idx) => (
                  <li key={idx}>
                    <span className="font-semibold text-gray-600">
                      {skill.name}:
                    </span>{" "}
                    <span className="italic">{skill.reason}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Experience Card */}
            <div className="bg-white/60 backdrop-blur-xl border border-gray-200/80 rounded-3xl shadow-xl shadow-gray-200/50 p-6 md:p-8">
              <div className="flex items-center justify-between gap-3 cursor-pointer select-none group">
                <div className="flex items-center gap-3">
                  <FileText className="w-7 h-7 text-blue-400" />
                  <h3 className="text-xl font-semibold text-gray-700">
                    Experience
                  </h3>
                </div>
              </div>
              <AnimatePresence>
                {analysis.experience && (
                  <motion.ul
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden space-y-6 mt-4">
                    {analysis.experience.map((exp, idx) => (
                      <li key={idx} className="border-l-2 border-blue-300 pl-4">
                        <div className="font-semibold text-gray-800">
                          {exp.role}{" "}
                          <span className="text-blue-600">@ {exp.company}</span>
                        </div>
                        <div className="text-gray-500 text-sm mb-1">
                          {exp.duration}
                        </div>
                        <p className="text-gray-600">{exp.responsibilities}</p>
                      </li>
                    ))}
                  </motion.ul>
                )}
              </AnimatePresence>
            </div>

            {/* Education Card */}
            <div className="bg-white/60 backdrop-blur-xl border border-gray-200/80 rounded-3xl shadow-xl shadow-gray-200/50 p-6 md:p-8">
              <div className="flex items-center justify-between gap-3 cursor-pointer select-none group">
                <div className="flex items-center gap-3">
                  <GraduationCap className="w-7 h-7 text-blue-400" />
                  <h3 className="text-xl font-semibold text-gray-700">
                    Education
                  </h3>
                </div>
              </div>
              <AnimatePresence>
                {analysis.education && (
                  <motion.ul
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden space-y-4 mt-4">
                    {analysis.education.map((edu, idx) => (
                      <li key={idx} className="border-l-2 border-blue-200 pl-4">
                        <div className="font-semibold text-gray-800">
                          {edu.degree}
                        </div>
                        <div className="text-gray-500 text-sm">
                          {edu.institution}, {edu.year}
                          {edu.honors && (
                            <span className="text-blue-500">
                              {" "}
                              ({edu.honors})
                            </span>
                          )}
                        </div>
                      </li>
                    ))}
                  </motion.ul>
                )}
              </AnimatePresence>
            </div>

            {/* Suggestions Card */}
            {analysis.improvementSuggestions && (
              <div className="bg-white/60 backdrop-blur-xl border border-gray-200/80 rounded-3xl shadow-xl shadow-gray-200/50 p-6 md:p-8">
                <div className="flex items-center gap-3 mb-4">
                  <Lightbulb className="w-7 h-7 text-yellow-400" />
                  <h3 className="text-xl font-semibold text-gray-700">
                    Suggestions for Improvement
                  </h3>
                </div>
                <ul className="list-disc list-outside ml-6 text-gray-600 space-y-2">
                  {analysis.improvementSuggestions.map((suggestion, idx) => (
                    <li key={idx}>{suggestion}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Formatting & Keywords Card */}
            {(analysis.formatting ||
              (analysis.keywordMatch && analysis.keywordMatch.length > 0)) && (
              <div className="bg-white/60 backdrop-blur-xl border border-gray-200/80 rounded-3xl shadow-xl shadow-gray-200/50 p-6 md:p-8">
                <div className="flex items-center gap-3 mb-4">
                  <BarChart3 className="w-7 h-7 text-purple-400" />
                  <h3 className="text-xl font-semibold text-gray-700">
                    Formatting & Keywords
                  </h3>
                </div>
                {analysis.formatting && (
                  <p className="mb-3 text-gray-600">
                    <span className="font-semibold text-gray-700">
                      Formatting:
                    </span>{" "}
                    <span className="italic">{analysis.formatting}</span>
                  </p>
                )}
                {analysis.keywordMatch && analysis.keywordMatch.length > 0 && (
                  <div>
                    <span className="font-semibold text-gray-700">
                      Missing Keywords:
                    </span>
                    <ul className="list-disc list-outside ml-6 text-gray-600 mt-2">
                      {analysis.keywordMatch.map((keyword, idx) => (
                        <li key={idx}>{keyword}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            {/* Skill Chart */}
            {Array.isArray(analysis.skills) && analysis.skills.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white/60 backdrop-blur-xl border border-gray-200/80 rounded-3xl shadow-xl shadow-gray-200/50 p-6 md:p-8">
                <div className="flex items-center gap-3 mb-4">
                  <BarChart className="w-7 h-7 text-blue-400" />
                  <h2 className="text-xl font-semibold text-gray-700">
                    Skill Profile Chart
                  </h2>
                </div>
                <div className="overflow-x-auto" style={{ height: 350 }}>
                  <canvas ref={chartRef} />
                </div>
              </motion.div>
            )}

            {/* Cover Letter Generator */}
            {Array.isArray(analysis?.skills) && analysis.skills.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white/60 backdrop-blur-xl border border-gray-200/80 rounded-3xl shadow-xl shadow-gray-200/50 p-6 md:p-8">
                <div className="flex items-center gap-3 mb-4">
                  <Mail className="w-7 h-7 text-blue-400" />
                  <h2 className="text-xl font-semibold text-gray-700">
                    ✨ Generate a Cover Letter Draft
                  </h2>
                </div>
                <div className="mb-4">
                  <label className="block mb-1 text-gray-600 font-semibold text-sm">
                    Company Name:
                  </label>
                  <input
                    className="border border-gray-300 rounded-lg p-2 w-full bg-gray-100/50 text-gray-800 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition"
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    disabled={generating}
                  />
                </div>
                <div className="mb-4">
                  <label className="block mb-1 text-gray-600 font-semibold text-sm">
                    Job Role:
                  </label>
                  <input
                    className="border border-gray-300 rounded-lg p-2 w-full bg-gray-100/50 text-gray-800 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition"
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    disabled={generating}
                  />
                </div>
                <div className="mb-6">
                  <label className="block mb-1 text-gray-600 font-semibold text-sm">
                    Job Description (Optional, but recommended)
                  </label>
                  <textarea
                    className="border border-gray-300 rounded-lg p-2 w-full bg-gray-100/50 text-gray-800 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition h-28"
                    value={jobDescription}
                    onChange={(e) => setJobDescription(e.target.value)}
                    disabled={generating}
                    placeholder="Paste the job description here for a more tailored letter..."
                  />
                </div>
                <button
                  className="px-6 py-2.5 w-full sm:w-auto bg-blue-500 hover:bg-blue-600 text-white rounded-full shadow-lg shadow-blue-500/20 hover:shadow-xl hover:shadow-blue-500/30 transition-all duration-300 flex items-center justify-center gap-2 disabled:bg-blue-300 disabled:cursor-not-allowed disabled:shadow-none font-bold"
                  onClick={handleGenerateCoverLetter}
                  disabled={generating || !company || !role}>
                  {generating ? (
                    <>
                      <Loader2 className="animate-spin h-5 w-5" />
                      <span>Generating...</span>
                    </>
                  ) : (
                    "Generate Draft"
                  )}
                </button>
                {error && coverLetter === "" && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center gap-2 text-red-600 bg-red-100/50 rounded-lg px-4 py-2 mt-4 text-sm">
                    <AlertCircle className="h-5 w-5 flex-shrink-0" />
                    <span>{error}</span>
                  </motion.div>
                )}
                {coverLetter && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-6 relative">
                    <label className="block mb-2 font-semibold text-gray-700">
                      Generated Cover Letter:
                    </label>
                    <textarea
                      className="w-full h-56 border border-gray-300 rounded-lg p-3 bg-gray-100/50 text-gray-700 whitespace-pre-wrap"
                      value={coverLetter}
                      readOnly
                    />
                    <button
                      onClick={handleCopy}
                      className="absolute top-10 right-3 p-1.5 bg-gray-200/50 hover:bg-gray-300/70 rounded-full text-gray-600 transition"
                      title={copied ? "Copied!" : "Copy to clipboard"}>
                      {copied ? (
                        <Check className="w-5 h-5 text-green-600" />
                      ) : (
                        <Copy className="w-5 h-5" />
                      )}
                    </button>
                  </motion.div>
                )}
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
