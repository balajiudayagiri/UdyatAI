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
  const [company, setCompany] = useState("");
  const [role, setRole] = useState("");
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
                backgroundColor: "rgba(59,130,246,0.15)", // blue-400, very soft
                borderColor: "rgba(59,130,246,0.7)",
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
                title: { display: true, text: "%" },
                grid: { color: "#e5e7eb" }, // slate-200
              },
              y: { ticks: { font: { size: 14 }, color: "#64748b" } }, // slate-500
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
        ? analysis.skills.map((s) => s.name).join(", ")
        : ""
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

  // Copy cover letter to clipboard
  function handleCopy() {
    if (!coverLetter) return;
    navigator.clipboard.writeText(coverLetter);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  // Accordion state for analysis cards
  const [openSection, setOpenSection] = useState<string | null>(null);
  const toggleSection = (section: string) =>
    setOpenSection(openSection === section ? null : section);

  return (
    <div className="min-h-screen  text-gray-900 px-2 sm:px-4 md:px-8 py-8">
      <h1 className="text-4xl font-semibold mb-10 text-center text-apple-primary tracking-tight">
        Career Strategy Dashboard
      </h1>

      {/* Upload Card */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-xl mx-auto mb-10">
        <div className="bg-apple-card rounded-2xl p-8 flex flex-col items-center relative">
          <Upload className="w-10 h-10 text-blue-400 mb-3" />
          <h2 className="text-xl font-semibold text-apple-primary mb-2">
            Upload Your Resume
          </h2>
          <label
            htmlFor="resume-upload"
            className="cursor-pointer px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-full shadow transition mb-4">
            Select PDF File
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
            <div className="flex items-center gap-2 text-blue-500 mt-2">
              <Loader2 className="animate-spin h-5 w-5" />
              <span>Extracting and analyzing resume...</span>
            </div>
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
            {/* Summary Card */}
            <div className="bg-apple-card rounded-2xl shadow p-8">
              <div className="flex items-center gap-3 mb-4">
                <User className="w-7 h-7 text-blue-400" />
                <h3 className="text-lg font-semibold text-apple-primary">
                  Summary
                </h3>
              </div>
              <p className="mb-3 text-xl text-apple-primary">
                {analysis.summary}
              </p>
              <div className="flex flex-wrap gap-4">
                <div>
                  <span className="font-semibold text-blue-500">Value:</span>{" "}
                  <span className="text-apple-primary">{analysis.value}</span>
                </div>
                <div>
                  <span className="font-semibold text-blue-500">
                    Highlights:
                  </span>{" "}
                  <span className="text-apple-primary">
                    {Array.isArray(analysis.highlights)
                      ? analysis.highlights.join(", ")
                      : analysis.highlights}
                  </span>
                </div>
              </div>
            </div>

            {/* Skills Card */}
            <div className="bg-apple-card rounded-2xl shadow p-8">
              <div className="flex items-center gap-3 mb-4">
                <BarChart className="w-7 h-7 text-blue-400" />
                <h3 className="text-lg font-semibold text-apple-primary">
                  Skills
                </h3>
              </div>
              <div className="flex flex-wrap gap-2">
                {analysis.skills.map((skill, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-2 bg-apple-accent rounded-full px-3 py-1 shadow text-apple-primary">
                    <span className="font-semibold">{skill.name}</span>
                    <span className="text-blue-500 font-bold">
                      {skill.percentage}%
                    </span>
                  </div>
                ))}
              </div>
              <ul className="mt-4 space-y-1">
                {analysis.skills.map((skill, idx) => (
                  <li key={idx} className="text-apple-secondary text-xs">
                    <span className="font-semibold">{skill.name}:</span>{" "}
                    {skill.reason}
                  </li>
                ))}
              </ul>
            </div>

            {/* Experience Card */}
            <div className="bg-apple-card rounded-2xl shadow p-8">
              <div
                className="flex items-center gap-3 mb-4 cursor-pointer select-none"
                onClick={() => toggleSection("experience")}>
                <FileText className="w-7 h-7 text-blue-400" />
                <h3 className="text-lg font-semibold text-apple-primary">
                  Experience
                </h3>
              </div>
              <AnimatePresence>
                {(!openSection || openSection === "experience") &&
                  analysis.experience && (
                    <motion.ul
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden space-y-4">
                      {analysis.experience.map((exp, idx) => (
                        <li
                          key={idx}
                          className="border-l-4 border-blue-400 pl-4 py-2">
                          <div className="font-semibold text-apple-primary">
                            {exp.role}{" "}
                            <span className="text-blue-500">
                              @ {exp.company}
                            </span>
                          </div>
                          <div className="text-apple-secondary text-sm">
                            {exp.duration}
                          </div>
                          <div className="text-apple-primary">
                            {exp.responsibilities}
                          </div>
                        </li>
                      ))}
                    </motion.ul>
                  )}
              </AnimatePresence>
            </div>

            {/* Education Card */}
            <div className="bg-apple-card rounded-2xl shadow p-8">
              <div
                className="flex items-center gap-3 mb-4 cursor-pointer select-none"
                onClick={() => toggleSection("education")}>
                <GraduationCap className="w-7 h-7 text-blue-400" />
                <h3 className="text-lg font-semibold text-apple-primary">
                  Education
                </h3>
              </div>
              <AnimatePresence>
                {(!openSection || openSection === "education") &&
                  analysis.education && (
                    <motion.ul
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden space-y-4">
                      {analysis.education.map((edu, idx) => (
                        <li
                          key={idx}
                          className="border-l-4 border-blue-200 pl-4 py-2">
                          <div className="font-semibold text-apple-primary">
                            {edu.degree}
                          </div>
                          <div className="text-apple-secondary text-sm">
                            {edu.institution}, {edu.year}
                            {edu.honors && (
                              <span className="text-blue-400">
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
              <div className="bg-apple-card rounded-2xl shadow p-8">
                <div className="flex items-center gap-3 mb-4">
                  <Lightbulb className="w-7 h-7 text-yellow-400" />
                  <h3 className="text-lg font-semibold text-apple-primary">
                    Suggestions for Improvement
                  </h3>
                </div>
                <ul className="list-disc ml-6 text-apple-secondary space-y-1">
                  {analysis.improvementSuggestions.map((suggestion, idx) => (
                    <li key={idx}>{suggestion}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Formatting & Keywords Card */}
            {(analysis.formatting ||
              (analysis.keywordMatch && analysis.keywordMatch.length > 0)) && (
              <div className="bg-apple-card rounded-2xl shadow p-8">
                <div className="flex items-center gap-3 mb-4">
                  <BarChart3 className="w-7 h-7 text-purple-400" />
                  <h3 className="text-lg font-semibold text-apple-primary">
                    Formatting & Keywords
                  </h3>
                </div>
                {analysis.formatting && (
                  <p className="mb-2 text-purple-700">
                    <span className="font-semibold">Formatting:</span>{" "}
                    {analysis.formatting}
                  </p>
                )}
                {analysis.keywordMatch && analysis.keywordMatch.length > 0 && (
                  <div>
                    <span className="font-semibold text-purple-700">
                      Keyword Match:
                    </span>
                    <ul className="list-disc ml-6 text-purple-700">
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
                className="bg-apple-card rounded-2xl shadow p-8">
                <div className="flex items-center gap-3 mb-4">
                  <BarChart className="w-7 h-7 text-blue-400" />
                  <h2 className="text-lg font-semibold text-apple-primary">
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
                className="bg-apple-card rounded-2xl shadow p-8">
                <div className="flex items-center gap-3 mb-4">
                  <Mail className="w-7 h-7 text-blue-400" />
                  <h2 className="text-lg font-semibold text-apple-primary">
                    ✨ Generate a Cover Letter Draft
                  </h2>
                </div>
                <div className="mb-4">
                  <label className="block mb-1 text-apple-primary font-semibold">
                    Company Name:
                  </label>
                  <input
                    className="border border-slate-200 rounded p-2 w-full bg-white text-slate-900 focus:border-blue-400 focus:ring-blue-400"
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    disabled={generating}
                  />
                </div>
                <div className="mb-4">
                  <label className="block mb-1 text-apple-primary font-semibold">
                    Job Role:
                  </label>
                  <input
                    className="border border-slate-200 rounded p-2 w-full bg-white text-slate-900 focus:border-blue-400 focus:ring-blue-400"
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    disabled={generating}
                  />
                </div>
                <button
                  className="px-6 py-2 w-full sm:w-auto bg-blue-500 hover:bg-blue-600 text-white rounded-full shadow transition flex items-center justify-center gap-2 disabled:bg-blue-200 disabled:cursor-not-allowed font-bold"
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
                {coverLetter && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-4 relative">
                    <label className="block mb-1 font-semibold text-apple-primary">
                      Generated Cover Letter:
                    </label>
                    <textarea
                      className="w-full h-48 border border-slate-200 rounded p-2 bg-white text-slate-900"
                      value={coverLetter}
                      readOnly
                    />
                    <button
                      onClick={handleCopy}
                      className="absolute top-2 right-2 p-1.5 bg-blue-100 hover:bg-blue-200 rounded-full text-blue-700 transition"
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
