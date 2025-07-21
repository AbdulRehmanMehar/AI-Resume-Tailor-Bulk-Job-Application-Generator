"use client";

import React, { useState, useEffect } from "react";
import "@/styles/docx-preview.css";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Plus,
  X,
  Loader2,
  Sparkles,
  Building2,
  FileText,
  Brain,
  Target,
  Upload,
  Download,
  Eye,
} from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Toaster } from "@/components/ui/toaster";
import { useToast } from "@/hooks/use-toast";
import * as XLSX from "xlsx";
import {
  downloadTailoredResume,
  generateModernResumeDocx,
} from "@/lib/modern-resume-generator";
import { renderAsync } from "docx-preview";

interface JobRow {
  id: string;
  companyUrl: string;
  jobTitle: string;
  description: string;
  skills: string;
}

interface BulkJobGeneratorProps {
  className?: string;
  onJobsGenerated?: (jobs: JobRow[]) => void;
}

export function BulkJobGenerator({
  className = "",
  onJobsGenerated,
}: BulkJobGeneratorProps) {
  const [jobs, setJobs] = useState<JobRow[]>([
    {
      id: "1",
      companyUrl: "",
      jobTitle: "",
      description: "",
      skills: "",
    },
  ]);

  const [language, setLanguage] = useState("English (US)");
  const [yearsOfExperience, setYearsOfExperience] = useState("2-5");
  const [isGenerating, setIsGenerating] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [bulkGenerating, setBulkGenerating] = useState<string | null>(null);
  const [rowErrors, setRowErrors] = useState<{ [key: string]: string }>({});
  const [baseResume, setBaseResume] = useState<File | null>(null);
  const [baseResumeContent, setBaseResumeContent] = useState<string>("");
  const [includeDescriptions, setIncludeDescriptions] = useState(false);
  const [isUploadingExcel, setIsUploadingExcel] = useState(false);
  const [isGeneratingResumes, setIsGeneratingResumes] = useState(false);
  const [generatedResumes, setGeneratedResumes] = useState<{
    [key: string]: any;
  }>({});

  // Preview modal state
  const [previewModalOpen, setPreviewModalOpen] = useState(false);
  const [previewJobId, setPreviewJobId] = useState<string | null>(null);
  const [previewUrls, setPreviewUrls] = useState<{
    oldResume: string | null;
    newResume: string | null;
  }>({ oldResume: null, newResume: null });

  const { toast } = useToast();

  // Effect to render DOCX files when preview URLs change
  useEffect(() => {
    const renderDocxFiles = async () => {
      if (previewModalOpen && previewUrls.newResume) {
        try {
          // Render the new tailored resume
          const newResumeContainer =
            document.getElementById("new-resume-preview");
          if (newResumeContainer) {
            newResumeContainer.innerHTML =
              '<div class="text-center p-4"><div class="animate-spin inline-block w-6 h-6 border-[3px] border-current border-t-transparent rounded-full text-blue-600" role="status"><span class="sr-only">Loading...</span></div><p class="mt-2 text-sm text-gray-600">Rendering resume...</p></div>';

            const newResumeResponse = await fetch(previewUrls.newResume);
            const newResumeArrayBuffer = await newResumeResponse.arrayBuffer();

            // Clear the loading state and render
            newResumeContainer.innerHTML = "";
            await renderAsync(
              newResumeArrayBuffer,
              newResumeContainer,
              undefined,
              {
                className: "docx-content",
                inWrapper: false,
                ignoreWidth: false,
                ignoreHeight: false,
                ignoreFonts: false,
                breakPages: false,
                ignoreLastRenderedPageBreak: true,
                experimental: false,
                trimXmlDeclaration: true,
              }
            );
          }

          // Render the old resume if available
          if (previewUrls.oldResume) {
            const oldResumeContainer =
              document.getElementById("old-resume-preview");
            if (oldResumeContainer) {
              oldResumeContainer.innerHTML =
                '<div class="text-center p-4"><div class="animate-spin inline-block w-6 h-6 border-[3px] border-current border-t-transparent rounded-full text-blue-600" role="status"><span class="sr-only">Loading...</span></div><p class="mt-2 text-sm text-gray-600">Rendering resume...</p></div>';

              const oldResumeResponse = await fetch(previewUrls.oldResume);
              const oldResumeArrayBuffer =
                await oldResumeResponse.arrayBuffer();

              // Clear the loading state and render
              oldResumeContainer.innerHTML = "";
              await renderAsync(
                oldResumeArrayBuffer,
                oldResumeContainer,
                undefined,
                {
                  className: "docx-content",
                  inWrapper: false,
                  ignoreWidth: false,
                  ignoreHeight: false,
                  ignoreFonts: false,
                  breakPages: false,
                  ignoreLastRenderedPageBreak: true,
                  experimental: false,
                  trimXmlDeclaration: true,
                }
              );
            }
          }
        } catch (error) {
          console.error("Error rendering DOCX files:", error);
          // Show error in containers
          const newResumeContainer =
            document.getElementById("new-resume-preview");
          const oldResumeContainer =
            document.getElementById("old-resume-preview");

          if (newResumeContainer) {
            newResumeContainer.innerHTML =
              '<div class="text-center p-4 text-red-600"><p>Failed to render resume</p></div>';
          }
          if (oldResumeContainer && previewUrls.oldResume) {
            oldResumeContainer.innerHTML =
              '<div class="text-center p-4 text-red-600"><p>Failed to render resume</p></div>';
          }
        }
      }
    };

    if (previewModalOpen) {
      // Small delay to ensure DOM elements are ready
      setTimeout(renderDocxFiles, 200);
    }
  }, [previewModalOpen, previewUrls]);

  // URL validation function
  const isValidUrl = (url: string): boolean => {
    if (!url || url.trim() === "") return false;

    // Add protocol if missing
    let testUrl = url.trim();
    if (!testUrl.startsWith("http://") && !testUrl.startsWith("https://")) {
      testUrl = "https://" + testUrl;
    }

    try {
      new URL(testUrl);
      // Check if it's a valid domain format
      const domain = testUrl
        .replace(/^https?:\/\//, "")
        .replace(/^www\./, "")
        .split("/")[0];
      return domain.includes(".") && domain.length > 3;
    } catch {
      return false;
    }
  };

  // Clear row error
  const clearRowError = (rowId: string) => {
    setRowErrors((prev) => {
      const newErrors = { ...prev };
      delete newErrors[rowId];
      return newErrors;
    });
  };

  // Set row error
  const setRowError = (rowId: string, message: string) => {
    setRowErrors((prev) => ({
      ...prev,
      [rowId]: message,
    }));
  };

  // Handle base resume upload
  const handleResumeUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setBaseResume(file);

    // Extract text content from the file
    if (file.type === "text/plain") {
      const text = await file.text();
      setBaseResumeContent(text);
    } else if (file.type === "application/pdf" || file.name.endsWith(".pdf")) {
      // For PDF files, we would need a PDF parser, for now just set filename
      setBaseResumeContent(`PDF Resume: ${file.name}`);
    } else if (file.name.endsWith(".docx") || file.name.endsWith(".doc")) {
      // For Word docs, we would need a doc parser, for now just set filename
      setBaseResumeContent(`Word Document: ${file.name}`);
    } else {
      try {
        const text = await file.text();
        setBaseResumeContent(text);
      } catch (error) {
        setBaseResumeContent(`Resume File: ${file.name}`);
      }
    }
  };

  // Handle Excel file upload
  const handleExcelUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith(".xlsx") && !file.name.endsWith(".xls")) {
      setError("Please upload a valid Excel file (.xlsx or .xls)");
      return;
    }

    setIsUploadingExcel(true);
    setError(null);

    try {
      const arrayBuffer = await file.arrayBuffer();
      const workbook = XLSX.read(arrayBuffer, { type: "array" });

      // Get the first worksheet
      const firstSheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[firstSheetName];

      // Convert to JSON
      const jsonData: any[] = XLSX.utils.sheet_to_json(worksheet);

      if (jsonData.length === 0) {
        setError("Excel file appears to be empty");
        return;
      }

      // Map Excel data to job rows
      const newJobs: JobRow[] = jsonData.slice(0, 100).map((row, index) => ({
        id: (Date.now() + index).toString(),
        companyUrl:
          row["Company URL"] ||
          row["companyUrl"] ||
          row["url"] ||
          row["Company"] ||
          "",
        jobTitle:
          row["Job Title"] ||
          row["jobTitle"] ||
          row["title"] ||
          row["Title"] ||
          "",
        description:
          row["Description"] ||
          row["description"] ||
          row["Job Description"] ||
          row["jobDescription"] ||
          "",
        skills:
          row["Skills"] ||
          row["skills"] ||
          row["Required Skills"] ||
          row["requiredSkills"] ||
          "",
      }));

      // Filter out completely empty rows
      const validJobs = newJobs.filter(
        (job) =>
          job.companyUrl.trim() !== "" ||
          job.jobTitle.trim() !== "" ||
          job.description.trim() !== "" ||
          job.skills.trim() !== ""
      );

      if (validJobs.length === 0) {
        setError(
          'No valid job data found in Excel file. Please ensure columns are named: "Company URL", "Job Title", "Description", "Skills"'
        );
        return;
      }

      setJobs(validJobs);
      setError(null);

      // Clear the file input
      event.target.value = "";
    } catch (error) {
      console.error("Error parsing Excel file:", error);
      setError(
        "Failed to parse Excel file. Please ensure it's a valid Excel format."
      );
    } finally {
      setIsUploadingExcel(false);
    }
  };

  // Get existing job titles to maintain consistency
  const getExistingJobTitles = (): string[] => {
    return jobs
      .filter((job) => job.jobTitle && job.jobTitle.trim() !== "")
      .map((job) => job.jobTitle);
  };

  // Determine target industry/role based on existing titles
  const getTargetRole = (): string => {
    const existingTitles = getExistingJobTitles();
    if (existingTitles.length === 0) return "";

    // Use the first non-empty title as the target role for consistency
    const firstTitle = existingTitles[0];
    if (firstTitle) {
      return firstTitle;
    }

    // If no titles exist yet, fall back to pattern matching
    const titleWords = existingTitles.join(" ").toLowerCase();

    if (
      titleWords.includes("ai") ||
      titleWords.includes("artificial intelligence") ||
      titleWords.includes("machine learning") ||
      titleWords.includes("ml engineer")
    ) {
      return "AI Engineer";
    } else if (
      titleWords.includes("frontend") ||
      titleWords.includes("react") ||
      titleWords.includes("ui")
    ) {
      return "Frontend Developer";
    } else if (
      titleWords.includes("backend") ||
      titleWords.includes("api") ||
      titleWords.includes("server")
    ) {
      return "Backend Engineer";
    } else if (
      titleWords.includes("full stack") ||
      titleWords.includes("fullstack")
    ) {
      return "Full Stack Developer";
    } else if (
      titleWords.includes("data") ||
      titleWords.includes("analytics")
    ) {
      return "Data Engineer";
    } else if (
      titleWords.includes("devops") ||
      titleWords.includes("infrastructure")
    ) {
      return "DevOps Engineer";
    } else if (
      titleWords.includes("mobile") ||
      titleWords.includes("ios") ||
      titleWords.includes("android")
    ) {
      return "Mobile Developer";
    } else if (titleWords.includes("senior") || titleWords.includes("lead")) {
      return "Senior Software Engineer";
    }

    return "Software Engineer"; // Default fallback
  };

  // Generate all fields for all valid rows
  const generateAllValidRows = async () => {
    setBulkGenerating("all-fields");
    setError(null);
    setRowErrors({});

    try {
      const validJobs = jobs.filter((job) => {
        if (!isValidUrl(job.companyUrl)) {
          setRowError(job.id, "Invalid or missing company URL");
          return false;
        }
        return true;
      });

      if (validJobs.length === 0) {
        setError("Please add at least one valid company URL");
        setBulkGenerating(null);
        return;
      }

      const targetRole = getTargetRole();
      const contextWithResume = `Years of experience: ${yearsOfExperience}, Language: ${language}${
        baseResumeContent
          ? `, Resume context: ${baseResumeContent.substring(0, 500)}...`
          : ""
      }${targetRole ? `, Target role: ${targetRole}` : ""}`;

      // Make parallel requests for each valid job that has empty fields
      const promises = validJobs.map(async (job) => {
        try {
          // Only generate fields that are empty
          const needsTitle = !job.jobTitle || job.jobTitle.trim() === "";
          const needsDescription =
            includeDescriptions &&
            (!job.description || job.description.trim() === "");
          const needsSkills = !job.skills || job.skills.trim() === "";

          // If all fields are filled or not needed, skip this job
          if (!needsTitle && !needsDescription && !needsSkills) {
            return {
              jobId: job.id,
              success: true,
              jobTitle: job.jobTitle,
              jobDescription: job.description,
              skills: job.skills,
              skipped: true,
            };
          }

          const response = await fetch("/api/generate-complete-job", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              company_url: job.companyUrl,
              context: contextWithResume,
            }),
          });

          if (!response.ok) {
            throw new Error(`Failed to generate content for ${job.companyUrl}`);
          }

          const data = await response.json();
          return {
            jobId: job.id,
            success: true,
            // Only use AI-generated values for empty fields
            jobTitle: needsTitle ? data.data.job_title : job.jobTitle,
            jobDescription: needsDescription
              ? data.data.job_description
              : job.description,
            skills: needsSkills ? data.data.skills_string : job.skills,
          };
        } catch (err) {
          return {
            jobId: job.id,
            success: false,
            error: err instanceof Error ? err.message : "Unknown error",
          };
        }
      });

      const results = await Promise.all(promises);

      // Check if all jobs were skipped (all fields already populated)
      const allSkipped = results.every(
        (result) => result.success && result.skipped
      );
      if (allSkipped) {
        toast({
          title: "All Fields Already Populated",
          description: `All ${
            includeDescriptions
              ? "titles, descriptions, and skills"
              : "titles and skills"
          } are already filled for valid rows.`,
          variant: "default",
        });
        setBulkGenerating(null);
        return;
      }

      // Update jobs with results
      const updatedJobs = jobs.map((job) => {
        const result = results.find((r) => r.jobId === job.id);
        if (result) {
          if (result.success) {
            clearRowError(job.id);
            return {
              ...job,
              jobTitle: result.jobTitle,
              description: result.jobDescription,
              skills: result.skills,
            };
          } else {
            setRowError(job.id, result.error || "Generation failed");
          }
        }
        return job;
      });

      setJobs(updatedJobs);
    } catch (err: any) {
      console.error("Error generating all fields:", err);
      setError(
        "Failed to generate all fields: " + (err.message || "Unknown error")
      );
    } finally {
      setBulkGenerating(null);
    }
  };

  const addRow = () => {
    if (jobs.length >= 100) {
      setError("Maximum of 100 job rows allowed");
      return;
    }

    const newJob: JobRow = {
      id: Date.now().toString(),
      companyUrl: "",
      jobTitle: "",
      description: "",
      skills: "",
    };
    setJobs([...jobs, newJob]);
  };

  const removeRow = (id: string) => {
    setJobs(jobs.filter((job) => job.id !== id));
  };

  const updateJob = (id: string, field: keyof JobRow, value: string) => {
    setJobs(
      jobs.map((job) => (job.id === id ? { ...job, [field]: value } : job))
    );
  };

  const generateAllTitles = async () => {
    setBulkGenerating("titles");
    setError(null);
    setRowErrors({});

    try {
      const validJobs = jobs.filter((job) => {
        if (!isValidUrl(job.companyUrl)) {
          setRowError(job.id, "Invalid or missing company URL");
          return false;
        }
        return true;
      });

      if (validJobs.length === 0) {
        setError("Please add at least one valid company URL");
        setBulkGenerating(null);
        return;
      }

      // Only process jobs with empty titles
      const jobsNeedingTitles = validJobs.filter(
        (job) => !job.jobTitle || job.jobTitle.trim() === ""
      );

      if (jobsNeedingTitles.length === 0) {
        toast({
          title: "All Titles Already Exist",
          description: "All valid rows already have job titles.",
          variant: "default",
        });
        setBulkGenerating(null);
        return;
      }

      // Make parallel requests for each job needing titles
      const promises = jobsNeedingTitles.map(async (job) => {
        try {
          const targetRole = getTargetRole();
          const contextWithResume = `Years of experience: ${yearsOfExperience}, Language: ${language}${
            targetRole ? `, Target role: ${targetRole}` : ""
          }${
            baseResumeContent
              ? `, Resume context: ${baseResumeContent.substring(0, 300)}`
              : ""
          }`;

          const response = await fetch("/api/generate-job-title", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              company_url: job.companyUrl,
              context: contextWithResume,
            }),
          });

          if (!response.ok) {
            throw new Error(`Failed to generate title for ${job.companyUrl}`);
          }

          const data = await response.json();
          return {
            jobId: job.id,
            success: true,
            jobTitle: data.job_title,
          };
        } catch (err) {
          return {
            jobId: job.id,
            success: false,
            error: err instanceof Error ? err.message : "Unknown error",
          };
        }
      });

      const results = await Promise.all(promises);

      // Update jobs with results
      const updatedJobs = jobs.map((job) => {
        const result = results.find((r) => r.jobId === job.id);
        if (result) {
          if (result.success) {
            clearRowError(job.id);
            return { ...job, jobTitle: result.jobTitle };
          } else {
            setRowError(job.id, result.error || "Generation failed");
          }
        }
        return job;
      });

      setJobs(updatedJobs);
    } catch (err: any) {
      console.error("Error generating titles:", err);
      setError(
        "Failed to generate job titles: " + (err.message || "Unknown error")
      );
    } finally {
      setBulkGenerating(null);
    }
  };

  const generateAllDescriptions = async () => {
    setBulkGenerating("descriptions");
    setError(null);
    setRowErrors({});

    try {
      const validJobs = jobs.filter((job) => {
        if (!isValidUrl(job.companyUrl)) {
          setRowError(job.id, "Invalid or missing company URL");
          return false;
        }
        return true;
      });

      if (validJobs.length === 0) {
        setError("Please add at least one valid company URL");
        setBulkGenerating(null);
        return;
      }

      // Only process jobs with empty descriptions
      const jobsNeedingDescriptions = validJobs.filter(
        (job) => !job.description || job.description.trim() === ""
      );

      if (jobsNeedingDescriptions.length === 0) {
        toast({
          title: "All Descriptions Already Exist",
          description: "All valid rows already have job descriptions.",
          variant: "default",
        });
        setBulkGenerating(null);
        return;
      }

      // Make parallel requests for each job needing descriptions
      const promises = jobsNeedingDescriptions.map(async (job) => {
        try {
          const contextWithResume = `Years of experience: ${yearsOfExperience}, Language: ${language}${
            baseResumeContent
              ? `, Resume context: ${baseResumeContent.substring(0, 300)}`
              : ""
          }`;

          const response = await fetch("/api/generate-job-description", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              company_url: job.companyUrl,
              job_title: job.jobTitle,
              context: contextWithResume,
            }),
          });

          if (!response.ok) {
            throw new Error(
              `Failed to generate description for ${job.companyUrl}`
            );
          }

          const data = await response.json();
          return {
            jobId: job.id,
            success: true,
            jobDescription: data.job_description,
          };
        } catch (err) {
          return {
            jobId: job.id,
            success: false,
            error: err instanceof Error ? err.message : "Unknown error",
          };
        }
      });

      const results = await Promise.all(promises);

      // Update jobs with results
      const updatedJobs = jobs.map((job) => {
        const result = results.find((r) => r.jobId === job.id);
        if (result) {
          if (result.success) {
            clearRowError(job.id);
            return { ...job, description: result.jobDescription };
          } else {
            setRowError(job.id, result.error || "Generation failed");
          }
        }
        return job;
      });

      setJobs(updatedJobs);
    } catch (err: any) {
      console.error("Error generating descriptions:", err);
      setError(
        "Failed to generate job descriptions: " +
          (err.message || "Unknown error")
      );
    } finally {
      setBulkGenerating(null);
    }
  };

  const generateAllSkills = async () => {
    setBulkGenerating("skills");
    setError(null);
    setRowErrors({});

    try {
      const validJobs = jobs.filter((job) => {
        if (!isValidUrl(job.companyUrl)) {
          setRowError(job.id, "Invalid or missing company URL");
          return false;
        }
        return true;
      });

      if (validJobs.length === 0) {
        setError("Please add at least one valid company URL");
        setBulkGenerating(null);
        return;
      }

      // Only process jobs with empty skills
      const jobsNeedingSkills = validJobs.filter(
        (job) => !job.skills || job.skills.trim() === ""
      );

      if (jobsNeedingSkills.length === 0) {
        toast({
          title: "All Skills Already Exist",
          description: "All valid rows already have skills.",
          variant: "default",
        });
        setBulkGenerating(null);
        return;
      }

      // Make parallel requests for each job needing skills
      const promises = jobsNeedingSkills.map(async (job) => {
        try {
          const response = await fetch("/api/generate-job-skills", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              company_url: job.companyUrl,
              job_title: job.jobTitle,
              job_description: job.description,
            }),
          });

          if (!response.ok) {
            throw new Error(`Failed to generate skills for ${job.companyUrl}`);
          }

          const data = await response.json();
          return {
            jobId: job.id,
            success: true,
            skills: data.skills_string,
          };
        } catch (err) {
          return {
            jobId: job.id,
            success: false,
            error: err instanceof Error ? err.message : "Unknown error",
          };
        }
      });

      const results = await Promise.all(promises);

      // Update jobs with results
      const updatedJobs = jobs.map((job) => {
        const result = results.find((r) => r.jobId === job.id);
        if (result) {
          if (result.success) {
            clearRowError(job.id);
            return { ...job, skills: result.skills };
          } else {
            setRowError(job.id, result.error || "Generation failed");
          }
        }
        return job;
      });

      setJobs(updatedJobs);
    } catch (err: any) {
      console.error("Error generating skills:", err);
      setError(
        "Failed to generate job skills: " + (err.message || "Unknown error")
      );
    } finally {
      setBulkGenerating(null);
    }
  };

  const generateRowContent = async (id: string) => {
    const job = jobs.find((j) => j.id === id);
    if (!job) return;

    if (!isValidUrl(job.companyUrl)) {
      setRowError(id, "Please enter a valid company URL");
      return;
    }

    // Check if all fields are already populated
    const hasTitle = job.jobTitle && job.jobTitle.trim() !== "";
    const hasDescription = job.description && job.description.trim() !== "";
    const hasSkills = job.skills && job.skills.trim() !== "";

    if (hasTitle && hasDescription && hasSkills) {
      toast({
        title: "All Fields Already Populated",
        description:
          "This job row already has all fields filled (title, description, and skills).",
        variant: "default",
      });
      return;
    }

    setIsGenerating(id);
    setError(null);
    clearRowError(id);

    try {
      const targetRole = getTargetRole();
      const contextWithResume = `Years of experience: ${yearsOfExperience}, Language: ${language}${
        targetRole ? `, Target role: ${targetRole}` : ""
      }${
        baseResumeContent
          ? `, Resume context: ${baseResumeContent.substring(0, 400)}`
          : ""
      }`;

      const response = await fetch("/api/generate-complete-job", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          company_url: job.companyUrl,
          context: contextWithResume,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to generate job content");
      }

      const data = await response.json();

      if (data.success) {
        const updatedJobs = jobs.map((j) =>
          j.id === id
            ? {
                ...j,
                // Only update fields that are empty (preserve user-entered content)
                jobTitle:
                  j.jobTitle && j.jobTitle.trim() !== ""
                    ? j.jobTitle
                    : data.data.job_title,
                description:
                  j.description && j.description.trim() !== ""
                    ? j.description
                    : data.data.job_description,
                skills:
                  j.skills && j.skills.trim() !== ""
                    ? j.skills
                    : data.data.skills_string,
              }
            : j
        );

        setJobs(updatedJobs);
      } else {
        throw new Error("Generation failed");
      }
    } catch (err: any) {
      console.error("Error generating row content:", err);
      setRowError(id, err.message || "Failed to generate content");
    } finally {
      setIsGenerating(null);
    }
  };

  // Generate tailored resumes for all valid job rows
  const generateTailoredResumes = async () => {
    if (!baseResumeContent) {
      toast({
        title: "Base Resume Required",
        description:
          "Please upload a base resume before generating tailored resumes.",
        variant: "destructive",
      });
      return;
    }

    setIsGeneratingResumes(true);
    setError(null);
    setRowErrors({});

    try {
      // Get valid jobs with complete data
      const validJobs = jobs.filter((job) => {
        if (!isValidUrl(job.companyUrl)) {
          setRowError(job.id, "Invalid or missing company URL");
          return false;
        }
        if (!job.jobTitle || job.jobTitle.trim() === "") {
          setRowError(job.id, "Missing job title");
          return false;
        }
        if (!job.description || job.description.trim() === "") {
          setRowError(job.id, "Missing job description");
          return false;
        }
        return true;
      });

      if (validJobs.length === 0) {
        setError(
          "No valid job rows found. Please ensure each row has a company URL, job title, and description."
        );
        setIsGeneratingResumes(false);
        return;
      }

      const additionalContext = `Years of experience: ${yearsOfExperience}, Language: ${language}`;

      // Generate resumes in parallel for better performance
      const promises = validJobs.map(async (job) => {
        try {
          const response = await fetch("/api/generate-tailored-resume", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              job_title: job.jobTitle,
              job_description: job.description,
              original_resume: baseResumeContent,
              additional_context: additionalContext,
            }),
          });

          if (!response.ok) {
            throw new Error(`Failed to generate resume for ${job.companyUrl}`);
          }

          const data = await response.json();
          return {
            jobId: job.id,
            success: true,
            resume: data.data.tailored_resume,
            metadata: data.data.metadata,
          };
        } catch (err) {
          return {
            jobId: job.id,
            success: false,
            error: err instanceof Error ? err.message : "Unknown error",
          };
        }
      });

      const results = await Promise.all(promises);

      // Process results
      const newGeneratedResumes: { [key: string]: any } = {};
      let successCount = 0;
      let errorCount = 0;

      results.forEach((result) => {
        if (result.success) {
          newGeneratedResumes[result.jobId] = result.resume;
          clearRowError(result.jobId);
          successCount++;
        } else {
          setRowError(result.jobId, result.error || "Resume generation failed");
          errorCount++;
        }
      });

      setGeneratedResumes((prev) => ({ ...prev, ...newGeneratedResumes }));

      // Show success toast
      toast({
        title: "Resume Generation Complete",
        description: `Successfully generated ${successCount} tailored resume${
          successCount !== 1 ? "s" : ""
        }${errorCount > 0 ? ` (${errorCount} failed)` : ""}.`,
        variant: "default",
      });
    } catch (err: any) {
      console.error("Error generating tailored resumes:", err);
      setError(
        "Failed to generate tailored resumes: " +
          (err.message || "Unknown error")
      );
    } finally {
      setIsGeneratingResumes(false);
    }
  };

  // Download tailored resume for a specific job
  const downloadResumeForJob = async (jobId: string) => {
    const resume = generatedResumes[jobId];
    const job = jobs.find((j) => j.id === jobId);

    if (!resume || !job) {
      toast({
        title: "Resume Not Found",
        description: "Please generate the resume first before downloading.",
        variant: "destructive",
      });
      return;
    }

    try {
      const fileName = `${resume.full_name.replace(
        /\s+/g,
        "_"
      )}_${job.jobTitle.replace(/\s+/g, "_")}_Resume.docx`;
      await downloadTailoredResume(resume, fileName);

      toast({
        title: "Download Started",
        description: `Resume for ${job.jobTitle} is being downloaded.`,
        variant: "default",
      });
    } catch (error: any) {
      console.error("Error downloading resume:", error);
      toast({
        title: "Download Failed",
        description: "Failed to download resume. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Download all generated resumes as a zip file
  const downloadAllResumes = async () => {
    const resumesToDownload = Object.keys(generatedResumes);

    if (resumesToDownload.length === 0) {
      toast({
        title: "No Resumes to Download",
        description: "Please generate some resumes first.",
        variant: "destructive",
      });
      return;
    }

    // Download each resume individually (could be enhanced to create a zip in the future)
    let downloadCount = 0;
    for (const jobId of resumesToDownload) {
      try {
        await downloadResumeForJob(jobId);
        downloadCount++;
      } catch (error) {
        console.error(`Failed to download resume for job ${jobId}:`, error);
      }
    }

    if (downloadCount > 0) {
      toast({
        title: "Bulk Download Complete",
        description: `Started downloading ${downloadCount} resume${
          downloadCount !== 1 ? "s" : ""
        }.`,
        variant: "default",
      });
    }
  };

  // Preview tailored resume for a specific job
  const previewResumeForJob = async (jobId: string) => {
    const resume = generatedResumes[jobId];
    const job = jobs.find((j) => j.id === jobId);

    if (!resume || !job) {
      toast({
        title: "Resume Not Found",
        description: "Please generate the resume first before previewing.",
        variant: "destructive",
      });
      return;
    }

    try {
      setPreviewJobId(jobId);
      setPreviewModalOpen(true);

      // Generate DOCX for the new tailored resume
      const newResumeDoc = generateModernResumeDocx(resume);

      // Convert to blob using Packer
      const { Packer } = await import("docx");
      const newResumeBlob = await Packer.toBlob(newResumeDoc);

      // Set preview URLs
      setPreviewUrls({
        oldResume: baseResume ? URL.createObjectURL(baseResume) : null,
        newResume: URL.createObjectURL(newResumeBlob),
      });
    } catch (error: any) {
      console.error("Error creating preview:", error);
      toast({
        title: "Preview Failed",
        description: "Failed to create resume preview. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Close preview modal and cleanup URLs
  const closePreviewModal = () => {
    setPreviewModalOpen(false);
    setPreviewJobId(null);

    // Cleanup blob URLs to prevent memory leaks
    if (previewUrls.oldResume) {
      URL.revokeObjectURL(previewUrls.oldResume);
    }
    if (previewUrls.newResume) {
      URL.revokeObjectURL(previewUrls.newResume);
    }

    setPreviewUrls({ oldResume: null, newResume: null });
  };

  return (
    <div className={`space-y-8 ${className}`}>
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Card className="shadow-lg border-0">
        <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b">
          <CardTitle className="flex items-center gap-3 text-xl">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Sparkles className="h-6 w-6 text-blue-600" />
            </div>
            Bulk Job Application Generator
            <Badge variant="secondary" className="ml-2">
              AI-Powered
            </Badge>
          </CardTitle>
          <p className="text-gray-600 mt-2">
            Generate multiple tailored job applications efficiently. Add company
            URLs and let AI create job titles, descriptions, and required
            skills.
          </p>
        </CardHeader>
        <CardContent className="space-y-8 p-8">
          {/* Base Resume Upload */}
          <div className="bg-blue-50 rounded-xl p-6 border-2 border-dashed border-blue-200">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <FileText className="h-5 w-5 text-blue-600" />
              Base Resume Upload
            </h3>
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <input
                  type="file"
                  id="resume-upload"
                  accept=".pdf,.doc,.docx,.txt"
                  onChange={handleResumeUpload}
                  className="hidden"
                />
                <Button
                  onClick={() =>
                    document.getElementById("resume-upload")?.click()
                  }
                  variant="outline"
                  className="border-blue-300 text-blue-700 hover:bg-blue-100"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Upload Resume
                </Button>
                {baseResume && (
                  <div className="flex items-center gap-2 text-sm text-green-700 bg-green-50 px-3 py-1 rounded-full">
                    <FileText className="h-4 w-4" />
                    {baseResume.name}
                  </div>
                )}
              </div>
              <p className="text-sm text-blue-600">
                Upload your base resume to provide context for better job
                generation. Supports PDF, Word, and text files.
              </p>
            </div>
          </div>

          {/* Excel Upload Section */}
          <div className="bg-green-50 rounded-xl p-6 border-2 border-dashed border-green-200">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Upload className="h-5 w-5 text-green-600" />
              Excel Upload
            </h3>
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <input
                  type="file"
                  id="excel-upload"
                  accept=".xlsx,.xls"
                  onChange={handleExcelUpload}
                  className="hidden"
                />
                <Button
                  onClick={() =>
                    document.getElementById("excel-upload")?.click()
                  }
                  variant="outline"
                  className="border-green-300 text-green-700 hover:bg-green-100"
                  disabled={isUploadingExcel}
                >
                  {isUploadingExcel ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Plus className="mr-2 h-4 w-4" />
                  )}
                  Upload Excel File
                </Button>
                <Button
                  onClick={() => {
                    const link = document.createElement("a");
                    link.href = "/sample-jobs.xlsx";
                    link.download = "sample-jobs.xlsx";
                    link.click();
                  }}
                  variant="outline"
                  size="sm"
                  className="border-green-300 text-green-700 hover:bg-green-100"
                >
                  Download Sample
                </Button>
              </div>
              <p className="text-sm text-green-600">
                Upload an Excel file to pre-fill job rows. Ensure columns are
                named: "Company URL", "Job Title", "Description", "Skills".
              </p>
            </div>
          </div>

          {/* AI Generation Controls */}
          <div className="bg-gray-50 rounded-xl p-6 border-2 border-dashed border-gray-200">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Brain className="h-5 w-5 text-purple-600" />
              AI Generation Tools
            </h3>

            {/* Generate All Valid Rows Button */}
            <div className="mb-6">
              {/* Include Descriptions Checkbox */}
              <div className="flex items-center space-x-2 mb-4">
                <Checkbox
                  id="include-descriptions"
                  checked={includeDescriptions}
                  onCheckedChange={(checked) =>
                    setIncludeDescriptions(checked === true)
                  }
                />
                <Label
                  htmlFor="include-descriptions"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Include Descriptions Generation
                </Label>
              </div>

              <Button
                onClick={generateAllValidRows}
                disabled={isGenerating !== null || bulkGenerating !== null}
                className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white border-0 shadow-md hover:shadow-lg transition-all"
                size="lg"
              >
                {bulkGenerating === "all-fields" ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Sparkles className="mr-2 h-4 w-4" />
                )}
                Generate All Valid Rows (
                {jobs.filter((job) => isValidUrl(job.companyUrl)).length})
              </Button>
              <p className="text-sm text-gray-600 mt-2">
                Generate titles{includeDescriptions ? ", descriptions," : ""}{" "}
                and skills for all rows with valid company URLs.
                {getExistingJobTitles().length > 0 && (
                  <span className="text-blue-600">
                    {" "}
                    Will maintain consistency with existing job titles.
                  </span>
                )}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Button
                onClick={generateAllTitles}
                disabled={isGenerating !== null || bulkGenerating !== null}
                className="bg-blue-500 hover:bg-blue-600 text-white border-0 shadow-md hover:shadow-lg transition-all"
                size="lg"
              >
                {bulkGenerating === "titles" ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Target className="mr-2 h-4 w-4" />
                )}
                Generate All Titles
              </Button>

              <Button
                onClick={generateAllDescriptions}
                disabled={isGenerating !== null || bulkGenerating !== null}
                className="bg-green-500 hover:bg-green-600 text-white border-0 shadow-md hover:shadow-lg transition-all"
                size="lg"
              >
                {bulkGenerating === "descriptions" ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <FileText className="mr-2 h-4 w-4" />
                )}
                Generate All Descriptions
              </Button>

              <Button
                onClick={generateAllSkills}
                disabled={isGenerating !== null || bulkGenerating !== null}
                className="bg-purple-500 hover:bg-purple-600 text-white border-0 shadow-md hover:shadow-lg transition-all"
                size="lg"
              >
                {bulkGenerating === "skills" ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Building2 className="mr-2 h-4 w-4" />
                )}
                Generate All Skills
              </Button>
            </div>

            {/* Generate Tailored Resumes Button */}
            <div className="mt-6 pt-6 border-t border-gray-200">
              <div className="text-center">
                <Button
                  onClick={generateTailoredResumes}
                  disabled={
                    isGenerating !== null ||
                    bulkGenerating !== null ||
                    isGeneratingResumes ||
                    !baseResumeContent
                  }
                  className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white border-0 shadow-md hover:shadow-lg transition-all"
                  size="lg"
                >
                  {isGeneratingResumes ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <FileText className="mr-2 h-4 w-4" />
                  )}
                  Generate Tailored Resumes (
                  {
                    jobs.filter(
                      (job) =>
                        isValidUrl(job.companyUrl) &&
                        job.jobTitle?.trim() &&
                        job.description?.trim()
                    ).length
                  }
                  )
                </Button>

                {/* Download All Resumes Button - only show if any resumes are generated */}
                {Object.keys(generatedResumes).length > 0 && (
                  <Button
                    onClick={downloadAllResumes}
                    disabled={isGeneratingResumes}
                    className="mt-3 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white border-0 shadow-md hover:shadow-lg transition-all"
                    size="lg"
                  >
                    <Download className="mr-2 h-4 w-4" />
                    Download All Resumes ({Object.keys(generatedResumes).length}
                    )
                  </Button>
                )}

                <p className="text-sm text-gray-600 mt-2">
                  Generate personalized resumes for each job application using
                  your base resume.
                  {!baseResumeContent && (
                    <span className="text-red-500 block">
                      Please upload a base resume first.
                    </span>
                  )}
                </p>
              </div>
            </div>
          </div>

          {/* Job Table */}
          <div className="overflow-hidden rounded-xl border border-gray-200 shadow-sm">
            <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-8 py-4 border-b border-gray-200">
              <div className="grid grid-cols-12 gap-6 font-semibold text-sm text-gray-700">
                <div className="col-span-2 flex items-center gap-2">
                  <Building2 className="h-4 w-4 text-blue-600" />
                  Company URL *
                </div>
                <div className="col-span-2 flex items-center gap-2">
                  <Target className="h-4 w-4 text-green-600" />
                  Job Title
                </div>
                <div className="col-span-4 flex items-center gap-2">
                  <FileText className="h-4 w-4 text-purple-600" />
                  Description
                </div>
                <div className="col-span-3 flex items-center gap-2">
                  <Brain className="h-4 w-4 text-orange-600" />
                  Skills
                </div>
                <div className="col-span-1 text-center">Actions</div>
              </div>
            </div>

            <div className="divide-y divide-gray-100">
              {jobs.map((job, index) => (
                <div
                  key={job.id}
                  className={`px-8 py-6 hover:bg-gray-50/50 transition-colors ${
                    isGenerating === job.id ? "bg-blue-50/30" : ""
                  }`}
                >
                  <div className="grid grid-cols-12 gap-6 items-start">
                    {/* Company URL */}
                    <div className="col-span-2">
                      <Input
                        value={job.companyUrl}
                        onChange={(e) =>
                          updateJob(job.id, "companyUrl", e.target.value)
                        }
                        placeholder="google.com"
                        className="border-gray-200 focus:border-blue-500 focus:ring-blue-500/20"
                      />
                    </div>

                    {/* Job Title */}
                    <div className="col-span-2">
                      <Input
                        value={job.jobTitle}
                        onChange={(e) =>
                          updateJob(job.id, "jobTitle", e.target.value)
                        }
                        placeholder="Software Engineer"
                        className="border-gray-200 focus:border-green-500 focus:ring-green-500/20"
                      />
                    </div>

                    {/* Description */}
                    <div className="col-span-4">
                      <Textarea
                        value={job.description}
                        onChange={(e) =>
                          updateJob(job.id, "description", e.target.value)
                        }
                        placeholder="Join our team and work on cutting-edge technology..."
                        className="border-gray-200 focus:border-purple-500 focus:ring-purple-500/20 resize-none h-24 text-sm"
                        rows={3}
                      />
                    </div>

                    {/* Skills */}
                    <div className="col-span-3">
                      <Textarea
                        value={job.skills}
                        onChange={(e) =>
                          updateJob(job.id, "skills", e.target.value)
                        }
                        placeholder="React, Node.js, Python, AWS..."
                        className="border-gray-200 focus:border-orange-500 focus:ring-orange-500/20 resize-none h-24 text-sm"
                        rows={3}
                      />
                    </div>

                    {/* Actions */}
                    <div className="col-span-1 flex flex-col gap-2">
                      <Button
                        onClick={() => generateRowContent(job.id)}
                        disabled={
                          isGenerating !== null || bulkGenerating !== null
                        }
                        size="sm"
                        className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white border-0 shadow-sm h-8 text-xs font-medium"
                      >
                        {isGenerating === job.id ? (
                          <Loader2 className="h-3 w-3 animate-spin" />
                        ) : (
                          <Sparkles className="h-3 w-3" />
                        )}
                      </Button>

                      {/* Individual Generate Buttons */}
                      <div className="flex flex-col gap-1">
                        <Button
                          onClick={async () => {
                            // Only generate if title is empty
                            if (job.jobTitle && job.jobTitle.trim() !== "") {
                              toast({
                                title: "Title Already Exists",
                                description:
                                  "This job already has a title. Clear it first to regenerate.",
                                variant: "default",
                              });
                              return;
                            }

                            if (!isValidUrl(job.companyUrl)) {
                              setRowError(job.id, "Invalid URL");
                              return;
                            }
                            setIsGenerating(`${job.id}-title`);
                            clearRowError(job.id);
                            try {
                              const targetRole = getTargetRole();
                              const contextWithResume = `Years: ${yearsOfExperience}, Language: ${language}${
                                targetRole ? `, Target role: ${targetRole}` : ""
                              }${
                                baseResumeContent
                                  ? `, Resume: ${baseResumeContent.substring(
                                      0,
                                      200
                                    )}`
                                  : ""
                              }`;

                              const response = await fetch(
                                "/api/generate-job-title",
                                {
                                  method: "POST",
                                  headers: {
                                    "Content-Type": "application/json",
                                  },
                                  body: JSON.stringify({
                                    company_url: job.companyUrl,
                                    context: contextWithResume,
                                  }),
                                }
                              );
                              if (response.ok) {
                                const data = await response.json();
                                updateJob(job.id, "jobTitle", data.job_title);
                              } else {
                                throw new Error("Failed to generate title");
                              }
                            } catch (err) {
                              setRowError(job.id, "Title generation failed");
                            } finally {
                              setIsGenerating(null);
                            }
                          }}
                          disabled={
                            isGenerating !== null || bulkGenerating !== null
                          }
                          size="sm"
                          variant="outline"
                          className="h-6 text-xs px-2 text-blue-600 border-blue-200"
                        >
                          {isGenerating === `${job.id}-title` ? (
                            <Loader2 className="h-2 w-2 animate-spin" />
                          ) : (
                            "T"
                          )}
                        </Button>

                        <Button
                          onClick={async () => {
                            // Only generate if description is empty
                            if (
                              job.description &&
                              job.description.trim() !== ""
                            ) {
                              toast({
                                title: "Description Already Exists",
                                description:
                                  "This job already has a description. Clear it first to regenerate.",
                                variant: "default",
                              });
                              return;
                            }

                            if (!isValidUrl(job.companyUrl)) {
                              setRowError(job.id, "Invalid URL");
                              return;
                            }
                            setIsGenerating(`${job.id}-desc`);
                            clearRowError(job.id);
                            try {
                              const contextWithResume = `Years: ${yearsOfExperience}, Language: ${language}${
                                baseResumeContent
                                  ? `, Resume: ${baseResumeContent.substring(
                                      0,
                                      200
                                    )}`
                                  : ""
                              }`;

                              const response = await fetch(
                                "/api/generate-job-description",
                                {
                                  method: "POST",
                                  headers: {
                                    "Content-Type": "application/json",
                                  },
                                  body: JSON.stringify({
                                    company_url: job.companyUrl,
                                    job_title: job.jobTitle,
                                    context: contextWithResume,
                                  }),
                                }
                              );
                              if (response.ok) {
                                const data = await response.json();
                                updateJob(
                                  job.id,
                                  "description",
                                  data.job_description
                                );
                              } else {
                                throw new Error(
                                  "Failed to generate description"
                                );
                              }
                            } catch (err) {
                              setRowError(
                                job.id,
                                "Description generation failed"
                              );
                            } finally {
                              setIsGenerating(null);
                            }
                          }}
                          disabled={
                            isGenerating !== null || bulkGenerating !== null
                          }
                          size="sm"
                          variant="outline"
                          className="h-6 text-xs px-2 text-green-600 border-green-200"
                        >
                          {isGenerating === `${job.id}-desc` ? (
                            <Loader2 className="h-2 w-2 animate-spin" />
                          ) : (
                            "D"
                          )}
                        </Button>

                        <Button
                          onClick={async () => {
                            // Only generate if skills is empty
                            if (job.skills && job.skills.trim() !== "") {
                              toast({
                                title: "Skills Already Exist",
                                description:
                                  "This job already has skills. Clear them first to regenerate.",
                                variant: "default",
                              });
                              return;
                            }

                            if (!isValidUrl(job.companyUrl)) {
                              setRowError(job.id, "Invalid URL");
                              return;
                            }
                            setIsGenerating(`${job.id}-skills`);
                            clearRowError(job.id);
                            try {
                              const response = await fetch(
                                "/api/generate-job-skills",
                                {
                                  method: "POST",
                                  headers: {
                                    "Content-Type": "application/json",
                                  },
                                  body: JSON.stringify({
                                    company_url: job.companyUrl,
                                    job_title: job.jobTitle,
                                    job_description: job.description,
                                  }),
                                }
                              );
                              if (response.ok) {
                                const data = await response.json();
                                updateJob(job.id, "skills", data.skills_string);
                              } else {
                                throw new Error("Failed to generate skills");
                              }
                            } catch (err) {
                              setRowError(job.id, "Skills generation failed");
                            } finally {
                              setIsGenerating(null);
                            }
                          }}
                          disabled={
                            isGenerating !== null || bulkGenerating !== null
                          }
                          size="sm"
                          variant="outline"
                          className="h-6 text-xs px-2 text-purple-600 border-purple-200"
                        >
                          {isGenerating === `${job.id}-skills` ? (
                            <Loader2 className="h-2 w-2 animate-spin" />
                          ) : (
                            "S"
                          )}
                        </Button>
                      </div>

                      {/* Preview and Download Resume Buttons - only show if resume is generated */}
                      {generatedResumes[job.id] && (
                        <>
                          <Button
                            onClick={() => previewResumeForJob(job.id)}
                            size="sm"
                            variant="outline"
                            className="h-8 text-blue-600 hover:text-blue-700 hover:bg-blue-50 border-blue-200 hover:border-blue-300"
                            title="Preview tailored resume"
                          >
                            <Eye className="h-3 w-3" />
                          </Button>
                          <Button
                            onClick={() => downloadResumeForJob(job.id)}
                            size="sm"
                            variant="outline"
                            className="h-8 text-green-600 hover:text-green-700 hover:bg-green-50 border-green-200 hover:border-green-300"
                            title="Download tailored resume"
                          >
                            <Download className="h-3 w-3" />
                          </Button>
                        </>
                      )}

                      {jobs.length > 1 && (
                        <Button
                          onClick={() => removeRow(job.id)}
                          size="sm"
                          variant="outline"
                          className="h-8 text-red-500 hover:text-red-600 hover:bg-red-50 border-red-200 hover:border-red-300"
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      )}
                    </div>
                  </div>

                  {/* Row Error Display */}
                  {rowErrors[job.id] && (
                    <div className="mt-2 px-4 py-2 bg-red-50 border border-red-200 rounded-md">
                      <p className="text-sm text-red-600 flex items-center gap-2">
                        <span className="font-semibold">Error:</span>
                        {rowErrors[job.id]}
                      </p>
                    </div>
                  )}

                  {/* Row number indicator */}
                  <div className="absolute left-2 top-6 text-xs text-gray-400 font-mono">
                    {index + 1}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Add Row Button */}
          <Button
            onClick={addRow}
            disabled={jobs.length >= 100}
            variant="outline"
            size="lg"
            className={`w-full border-dashed border-2 h-16 text-base font-medium transition-all ${
              jobs.length >= 100
                ? "border-gray-200 text-gray-400 cursor-not-allowed"
                : "border-gray-300 hover:border-blue-400 hover:bg-blue-50 text-gray-600 hover:text-blue-700"
            }`}
          >
            <Plus className="mr-3 h-5 w-5" />
            {jobs.length >= 100
              ? `Maximum Limit Reached (${jobs.length}/100)`
              : `Add New Job Row (${jobs.length}/100)`}
          </Button>
        </CardContent>
      </Card>

      {/* Core Settings */}
      <Card className="shadow-lg border-0">
        <CardHeader className="bg-gradient-to-r from-gray-50 to-slate-50 border-b">
          <CardTitle className="flex items-center gap-3">
            <div className="p-2 bg-gray-100 rounded-lg">
              <Target className="h-5 w-5 text-gray-600" />
            </div>
            Core Settings
          </CardTitle>
          <p className="text-gray-600 text-sm">
            Configure global settings that will apply to all generated
            applications.
          </p>
        </CardHeader>
        <CardContent className="p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-3">
              <Label className="text-base font-medium">Language</Label>
              <Select value={language} onValueChange={setLanguage}>
                <SelectTrigger className="h-12 border-gray-200 focus:border-blue-500">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="English (US)">🇺🇸 English (US)</SelectItem>
                  <SelectItem value="English (UK)">🇬🇧 English (UK)</SelectItem>
                  <SelectItem value="Spanish">🇪🇸 Spanish</SelectItem>
                  <SelectItem value="French">🇫🇷 French</SelectItem>
                  <SelectItem value="German">🇩🇪 German</SelectItem>
                  <SelectItem value="Portuguese">🇵🇹 Portuguese</SelectItem>
                  <SelectItem value="Italian">🇮🇹 Italian</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-3">
              <Label className="text-base font-medium">
                Years of Experience
              </Label>
              <Select
                value={yearsOfExperience}
                onValueChange={setYearsOfExperience}
              >
                <SelectTrigger className="h-12 border-gray-200 focus:border-blue-500">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0-1">Entry Level (0-1 years)</SelectItem>
                  <SelectItem value="2-3">Junior (2-3 years)</SelectItem>
                  <SelectItem value="2-5">Mid-level (2-5 years)</SelectItem>
                  <SelectItem value="4-7">Experienced (4-7 years)</SelectItem>
                  <SelectItem value="6-10">Senior (6-10 years)</SelectItem>
                  <SelectItem value="8-15">Lead (8-15 years)</SelectItem>
                  <SelectItem value="10+">Expert (10+ years)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Generate All Applications Button */}
      {/* <div className="flex justify-center pt-4">
        <Button
          onClick={() => onJobsGenerated?.(jobs)}
          size="lg"
          className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-12 py-4 text-lg font-semibold shadow-lg hover:shadow-xl transition-all transform hover:scale-105"
        >
          <Sparkles className="mr-3 h-6 w-6" />
          Generate All Applications ({jobs.length})
        </Button>
      </div> */}

      {/* Preview Modal */}
      <Dialog open={previewModalOpen} onOpenChange={closePreviewModal}>
        <DialogContent className="max-w-[95vw] w-full h-[95vh] p-0 gap-0">
          <DialogHeader className="p-6 pb-4 border-b bg-gradient-to-r from-gray-50 to-gray-100 rounded-t-lg">
            <DialogTitle className="text-xl font-semibold flex items-center gap-2">
              <Eye className="h-5 w-5 text-blue-600" />
              Resume Preview Comparison
              {previewJobId && (
                <Badge
                  variant="secondary"
                  className="ml-2 bg-blue-100 text-blue-800"
                >
                  {jobs.find((j) => j.id === previewJobId)?.jobTitle || "Job"}
                </Badge>
              )}
            </DialogTitle>
            <p className="text-sm text-gray-600 mt-1">
              Compare your original resume with the AI-tailored version
            </p>
          </DialogHeader>

          <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-6 p-6 h-full overflow-hidden">
            {/* Left: Original Resume */}
            <div className="flex flex-col h-full min-h-0">
              <h3 className="text-lg font-semibold mb-3 text-gray-700 flex items-center gap-2">
                <FileText className="h-4 w-4 text-gray-600" />
                Original Resume
              </h3>
              <div className="flex-1 border-2 border-dashed border-gray-300 rounded-xl overflow-hidden bg-white shadow-sm min-h-0">
                {previewUrls.oldResume ? (
                  <div className="w-full h-full overflow-auto bg-gray-50/30">
                    <div
                      id="old-resume-preview"
                      className="docx-wrapper min-h-full"
                      style={{ minHeight: "400px" }}
                    />
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-500 bg-gray-50/30">
                    <div className="text-center">
                      <FileText className="h-16 w-16 mx-auto mb-3 opacity-40" />
                      <p className="text-sm font-medium">
                        No base resume available
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        Upload a resume to see comparison
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Center: New Tailored Resume */}
            <div className="flex flex-col h-full min-h-0">
              <h3 className="text-lg font-semibold mb-3 text-green-700 flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-green-600" />
                Tailored Resume
                <Badge
                  variant="outline"
                  className="ml-auto text-xs bg-green-50 text-green-700 border-green-200"
                >
                  AI Generated
                </Badge>
              </h3>
              <div className="flex-1 border-2 border-green-300 rounded-xl overflow-hidden bg-white shadow-sm min-h-0">
                {previewUrls.newResume ? (
                  <div className="w-full h-full overflow-auto bg-green-50/20">
                    <div
                      id="new-resume-preview"
                      className="docx-wrapper min-h-full"
                      style={{ minHeight: "400px" }}
                    />
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-500 bg-green-50/20">
                    <div className="text-center">
                      <FileText className="h-16 w-16 mx-auto mb-3 opacity-40" />
                      <p className="text-sm font-medium">
                        Resume not available
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Right: Job Information Card */}
            <div className="flex flex-col h-full min-h-0 lg:max-w-sm">
              <h3 className="text-lg font-semibold mb-3 text-purple-700 flex items-center gap-2">
                <Building2 className="h-4 w-4 text-purple-600" />
                Job Details
              </h3>
              <div className="flex-1 space-y-4 overflow-y-auto">
                {previewJobId &&
                  (() => {
                    const job = jobs.find((j) => j.id === previewJobId);
                    return job ? (
                      <div className="space-y-4">
                        <Card className="border-purple-200 bg-purple-50/50 shadow-sm">
                          <CardHeader className="pb-3 px-4 pt-4">
                            <CardTitle className="text-base text-purple-800 flex items-center gap-2">
                              <Target className="h-4 w-4" />
                              {job.jobTitle || "Job Title"}
                            </CardTitle>
                          </CardHeader>
                          <CardContent className="pt-0 px-4 pb-4">
                            <div className="bg-white/60 rounded-md p-2 border border-purple-100">
                              <p className="text-xs text-purple-600 break-all font-mono">
                                {job.companyUrl}
                              </p>
                            </div>
                          </CardContent>
                        </Card>

                        <Card className="border-blue-200 bg-blue-50/50 shadow-sm">
                          <CardHeader className="pb-3 px-4 pt-4">
                            <CardTitle className="text-sm text-blue-800 flex items-center gap-2">
                              <FileText className="h-4 w-4" />
                              Job Description
                            </CardTitle>
                          </CardHeader>
                          <CardContent className="pt-0 px-4 pb-4">
                            <div className="bg-white/60 rounded-md p-3 border border-blue-100 max-h-40 overflow-y-auto">
                              <p className="text-xs text-blue-700 leading-relaxed whitespace-pre-wrap">
                                {job.description || "No description available"}
                              </p>
                            </div>
                          </CardContent>
                        </Card>

                        <Card className="border-orange-200 bg-orange-50/50 shadow-sm">
                          <CardHeader className="pb-3 px-4 pt-4">
                            <CardTitle className="text-sm text-orange-800 flex items-center gap-2">
                              <Brain className="h-4 w-4" />
                              Required Skills
                            </CardTitle>
                          </CardHeader>
                          <CardContent className="pt-0 px-4 pb-4">
                            <div className="bg-white/60 rounded-md p-3 border border-orange-100 max-h-32 overflow-y-auto">
                              <div className="flex flex-wrap gap-1">
                                {job.skills ? (
                                  job.skills
                                    .split(/[,;]/)
                                    .map((skill, index) => (
                                      <span
                                        key={index}
                                        className="inline-block bg-orange-100 text-orange-800 text-xs px-2 py-1 rounded-md border border-orange-200"
                                      >
                                        {skill.trim()}
                                      </span>
                                    ))
                                ) : (
                                  <span className="text-xs text-orange-600">
                                    No skills specified
                                  </span>
                                )}
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </div>
                    ) : null;
                  })()}
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Toaster />
    </div>
  );
}
