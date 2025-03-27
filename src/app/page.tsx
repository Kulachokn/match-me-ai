"use client";

import { useState } from "react";

// move to separate file
type JobAnalysis = {
  position: string;
  required_skills: string[];
  nice_to_have: string[];
  education: string;
  experience: string;
};

type ResumeAnalysis = {
  name: string;
  contact_info: string;
  skills: string[];
  work_experience: string[];
  education: string;
  certifications?: string[];
};

export default function VacancyForm() {
  const [text, setText] = useState("");
  const [response, setResponse] = useState<JobAnalysis | null>(null);

  const [file, setFile] = useState<File | null>(null);
  const [resumeText, setResumeText] = useState("");

  const [isLoadingText, setIsLoadingText] = useState(false);
  const [errorText, setErrorText] = useState("");

  const [analysis, setAnalysis] = useState<ResumeAnalysis | null>(null);
  const [errorFile, setErrorFile] = useState("");
  const [isLoadingFile, setIsLoadingFile] = useState(false);

  // job description analyze
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!text.trim()) {
      setErrorText("Please enter the job description");
      return;
    }

    setErrorText("");
    setIsLoadingText(true);

    try {
      const res = await fetch("/api/job-description", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });

      // const data = await res.json();
      const data = await res.json();
      setResponse(data || "Error occurred while processing");
      console.log(data);
    } catch (err) {
      setResponse(null);
      setErrorText("Something went wrong. Please try again.");
      console.log(err);
    } finally {
      setIsLoadingText(false);
    }
  };

  // file uploading
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFile = event.target.files?.[0] || null;
    if (uploadedFile) {
      setFile(uploadedFile);
      setErrorFile("");
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setErrorFile("Please select a file");
      return;
    }
    const formData = new FormData();
    formData.append("file", file);

    setIsLoadingFile(true);

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      setResumeText(data.text || "Error extracting text");

      if (data.text) {
        await analyzeResume(data.text);
      }
    } catch (err) {
      setErrorFile("Something went wrong");
      console.error(err);
    } finally {
      setIsLoadingFile(false);
    }
  };

  const analyzeResume = async (text: string) => {
    setIsLoadingFile(true);
    try {
      const res = await fetch("/api/analyze-resume", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });

      const data = await res.json();
      setAnalysis(data);
    } catch (err) {
      setErrorFile("Error analyzing resume");
      console.error(err);
    } finally {
      setIsLoadingFile(false);
    }
  };

  return (
    <>
      <div>
        <h1>Analyze Job Vacancy Description</h1>
        <form onSubmit={handleSubmit}>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Enter job description here"
            rows={6}
            cols={50}
          />
          <br />
          <button type="submit" disabled={isLoadingText}>
            {isLoadingText ? "Processing..." : "Analyze"}
          </button>
        </form>

        {errorText && <p style={{ color: "red" }}>{errorText}</p>}
        {response && (
          <div className="bg-gray-100 p-4 rounded-lg">
            <h2 className="text-lg font-bold">Job Analysis</h2>
            <p>
              <strong>Position:</strong> {response.position}
            </p>
            <p>
              <strong>Required Skills:</strong>{" "}
              {response.required_skills?.join(", ")}
            </p>
            <p>
              <strong>Nice to Have:</strong> {response.nice_to_have?.join(", ")}
            </p>
            <p>
              <strong>Education:</strong> {response.education}
            </p>
            <p>
              <strong>Experience:</strong> {response.experience}
            </p>
          </div>
        )}
      </div>
      <div>
        <h2>Upload Resume</h2>
        <input type="file" accept=".pdf,.docx" onChange={handleFileChange} />
        <button onClick={handleUpload} disabled={isLoadingFile}>
          {isLoadingFile ? "Uploading..." : "Upload"}
        </button>
        {errorFile && <p style={{ color: "red" }}>{errorFile}</p>}
        {resumeText && (
          <div>
            <h3>Extracted Resume Text:</h3>
            <p>{resumeText}</p>
          </div>
        )}
        {analysis && (
          <div>
            <h3>Resume Analysis:</h3>
            <pre>{JSON.stringify(analysis, null, 2)}</pre>
          </div>
        )}
      </div>
    </>
  );
}
