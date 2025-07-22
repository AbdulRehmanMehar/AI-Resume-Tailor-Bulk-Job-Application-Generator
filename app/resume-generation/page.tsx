"use client";

import React, { useState, useEffect } from "react";
import "@/styles/docx-preview.css";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import {
  ArrowLeft,
  Download,
  Eye,
  Play,
  Pause,
  FileText,
  Sparkles,
  Building2,
  Target,
  Brain,
} from "lucide-react";
import Link from "next/link";
import { generateModernResumeDocx } from "@/lib/modern-resume-generator";
import { Packer } from "docx";
import { renderAsync } from "docx-preview";

// Type definition for tailored resume data
interface TailoredResumeData {
  full_name?: string;
  source_content_analysis?: {
    has_email?: boolean;
    has_phone?: boolean;
    has_location?: boolean;
    has_linkedin?: boolean;
    has_github?: boolean;
    has_social_links?: boolean;
    has_relocation_willingness?: boolean;
    has_professional_summary?: boolean;
    has_skills?: boolean;
    has_work_experience?: boolean;
    has_education?: boolean;
    has_certifications?: boolean;
    has_projects?: boolean;
    has_languages?: boolean;
    has_awards?: boolean;
  };
  contact_information?: {
    email?: string;
    phone?: string;
    location?: string;
    linkedin?: string;
    github?: string;
    website?: string;
    social_links?: Array<{
      platform?: string;
      url?: string;
    }>;
    willing_to_relocate?: boolean;
  };
  professional_summary?: string;
  skills?: string[];
  work_experience?: Array<{
    has_job_title?: boolean;
    has_company?: boolean;
    has_location?: boolean;
    has_start_date?: boolean;
    has_end_date?: boolean;
    has_responsibilities?: boolean;
    job_title?: string;
    company?: string;
    location?: string;
    start_date?: string;
    end_date?: string | null;
    responsibilities?: string[];
  }>;
  education?: Array<{
    has_degree?: boolean;
    has_institution?: boolean;
    has_location?: boolean;
    has_start_year?: boolean;
    has_end_year?: boolean;
    has_additional_details?: boolean;
    degree?: string;
    institution?: string;
    location?: string;
    start_year?: number;
    end_year?: number | null;
    additional_details?: string;
  }>;
  certifications?: Array<{
    has_name?: boolean;
    has_issuer?: boolean;
    has_year?: boolean;
    has_credential_url?: boolean;
    name?: string;
    issuer?: string;
    year?: number;
    credential_url?: string;
  }>;
  projects?: Array<{
    has_title?: boolean;
    has_description?: boolean;
    has_url?: boolean;
    title?: string;
    description?: string;
    url?: string;
  }>;
  languages?: Array<{
    has_language?: boolean;
    has_proficiency?: boolean;
    language?: string;
    proficiency?: string;
  }>;
  awards?: Array<{
    has_title?: boolean;
    has_issuer?: boolean;
    has_year?: boolean;
    has_description?: boolean;
    title?: string;
    issuer?: string;
    year?: number;
    description?: string;
  }>;
}

interface Job {
  id: string;
  jobTitle: string;
  company: string;
  companyUrl: string;
  description: string;
  skills: string;
  status: "pending" | "generating" | "completed" | "error";
  progress: number;
  resumeUrl?: string;
  resumeContent?: string;
  docxUrl?: string;
  tailoredResumeData?: TailoredResumeData;
  error?: string;
}

interface PreviewData {
  originalResume: string;
  originalResumeFile?: string; // File URL or data URL for the original resume
  tailoredResume: string;
  tailoredResumeFile?: string; // File URL or data URL for the tailored resume
  jobTitle: string;
  company: string;
  jobDescription: string;
  skills: string;
}

export default function ResumeGenerationPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [overallProgress, setOverallProgress] = useState(0);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [previewData, setPreviewData] = useState<PreviewData | null>(null);
  const [baseResumeContent, setBaseResumeContent] = useState<string>("");
  const [baseResumeFile, setBaseResumeFile] = useState<string | null>(null); // For file preview
  const [yearsOfExperience, setYearsOfExperience] = useState("2-5");
  const [language, setLanguage] = useState("English (US)");

  // Preview modal state
  const [previewModalOpen, setPreviewModalOpen] = useState(false);
  const [previewJobId, setPreviewJobId] = useState<string | null>(null);
  const [previewUrls, setPreviewUrls] = useState<{
    oldResume: string | null;
    newResume: string | null;
  }>({ oldResume: null, newResume: null });

  // Horizontal scroll toggle for original resume
  const [isOriginalResumeScrollable, setIsOriginalResumeScrollable] =
    useState(false);

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
              '<div class="flex items-center justify-center h-full min-h-[200px]"><div class="animate-spin inline-block w-6 h-6 border-[3px] border-current border-t-transparent rounded-full text-green-600" role="status"><span class="sr-only">Loading...</span></div><p class="ml-3 text-sm text-gray-600">Rendering tailored resume...</p></div>';

            try {
              const newResumeResponse = await fetch(previewUrls.newResume);
              const newResumeArrayBuffer =
                await newResumeResponse.arrayBuffer();

              // Clear the loading state and prepare container
              newResumeContainer.innerHTML = "";
              newResumeContainer.className =
                "docx-wrapper w-full h-full overflow-auto bg-white p-4";

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
            } catch (renderError) {
              console.error("Error rendering new resume:", renderError);
              newResumeContainer.innerHTML =
                '<div class="flex items-center justify-center h-full min-h-[200px] text-red-600"><div class="text-center"><p class="font-medium">Failed to render tailored resume</p><p class="text-sm text-gray-500 mt-1">Please try again or download the file</p></div></div>';
            }
          }

          // Render the old resume if available
          if (previewUrls.oldResume) {
            const oldResumeContainer =
              document.getElementById("old-resume-preview");
            if (oldResumeContainer) {
              oldResumeContainer.innerHTML =
                '<div class="flex items-center justify-center h-full min-h-[200px]"><div class="animate-spin inline-block w-6 h-6 border-[3px] border-current border-t-transparent rounded-full text-blue-600" role="status"><span class="sr-only">Loading...</span></div><p class="ml-3 text-sm text-gray-600">Rendering original resume...</p></div>';

              try {
                // Check if it's a data URL (uploaded file) or blob URL
                if (previewUrls.oldResume.startsWith("data:")) {
                  // Handle different file types from uploaded files
                  const uploadedFileData =
                    localStorage.getItem("uploadedResumeFile");
                  if (uploadedFileData) {
                    const fileData = JSON.parse(uploadedFileData);

                    if (
                      fileData.type === "application/pdf" ||
                      fileData.name.toLowerCase().endsWith(".pdf")
                    ) {
                      // Handle PDF files
                      oldResumeContainer.innerHTML = `
                        <div class="w-full h-full flex flex-col bg-white">
                          <div class="p-3 bg-blue-50 border-b text-xs text-blue-700 flex-shrink-0 rounded-t">
                            <span class="font-medium">📄 PDF Preview - ${fileData.name}</span>
                          </div>
                          <div class="flex-1 overflow-hidden">
                            <iframe src="${previewUrls.oldResume}" width="100%" height="100%" frameborder="0" class="w-full h-full border-0">
                              <p class="p-4 text-center text-gray-500">Your browser does not support PDFs. 
                              <a href="${previewUrls.oldResume}" download="${fileData.name}" class="text-blue-600 underline">Download the PDF</a>
                              to view it.</p>
                            </iframe>
                          </div>
                        </div>`;
                    } else if (
                      fileData.type.includes("wordprocessingml") ||
                      fileData.name.toLowerCase().endsWith(".docx")
                    ) {
                      // Handle DOCX files
                      const oldResumeResponse = await fetch(
                        previewUrls.oldResume
                      );
                      const oldResumeArrayBuffer =
                        await oldResumeResponse.arrayBuffer();

                      oldResumeContainer.innerHTML = "";
                      oldResumeContainer.className = isOriginalResumeScrollable
                        ? "docx-wrapper horizontal-scroll w-full h-full overflow-x-auto overflow-y-auto bg-white p-4"
                        : "docx-wrapper w-full h-full overflow-auto bg-white p-4";

                      await renderAsync(
                        oldResumeArrayBuffer,
                        oldResumeContainer,
                        undefined,
                        {
                          className: "docx-content",
                          inWrapper: false,
                          ignoreWidth: isOriginalResumeScrollable
                            ? true
                            : false,
                          ignoreHeight: false,
                          ignoreFonts: false,
                          breakPages: false,
                          ignoreLastRenderedPageBreak: true,
                          experimental: false,
                          trimXmlDeclaration: true,
                        }
                      );
                    } else {
                      // Handle text files or other formats
                      oldResumeContainer.innerHTML = `
                        <div class="w-full h-full flex flex-col bg-white rounded">
                          <div class="p-3 bg-gray-50 border-b text-sm text-gray-700 flex-shrink-0 rounded-t">
                            <span class="font-medium">📄 ${fileData.name}</span>
                            <span class="ml-2 text-xs text-gray-500">(${
                              fileData.size
                                ? Math.round(fileData.size / 1024) + "KB"
                                : "Unknown size"
                            })</span>
                          </div>
                          <div class="flex-1 overflow-auto p-4">
                            <pre class="whitespace-pre-wrap font-sans text-sm leading-relaxed text-gray-800">${
                              baseResumeContent ||
                              "File content not available for preview"
                            }</pre>
                          </div>
                        </div>`;
                    }
                  }
                } else {
                  // Handle blob URLs (generated DOCX files)
                  const oldResumeResponse = await fetch(previewUrls.oldResume);
                  const oldResumeArrayBuffer =
                    await oldResumeResponse.arrayBuffer();

                  oldResumeContainer.innerHTML = "";
                  oldResumeContainer.className = isOriginalResumeScrollable
                    ? "docx-wrapper horizontal-scroll w-full h-full overflow-x-auto overflow-y-auto bg-white p-4"
                    : "docx-wrapper w-full h-full overflow-auto bg-white p-4";

                  await renderAsync(
                    oldResumeArrayBuffer,
                    oldResumeContainer,
                    undefined,
                    {
                      className: "docx-content",
                      inWrapper: false,
                      ignoreWidth: isOriginalResumeScrollable ? true : false,
                      ignoreHeight: false,
                      ignoreFonts: false,
                      breakPages: false,
                      ignoreLastRenderedPageBreak: true,
                      experimental: false,
                      trimXmlDeclaration: true,
                    }
                  );
                }
              } catch (renderError) {
                console.error("Error rendering old resume:", renderError);
                oldResumeContainer.innerHTML =
                  '<div class="flex items-center justify-center h-full bg-red-50"><div class="text-center p-4 text-red-600"><p class="font-medium">Failed to render original resume</p><p class="text-sm mt-1">Please try uploading the file again</p></div></div>';
              }
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
              '<div class="flex items-center justify-center h-full min-h-[200px] bg-red-50"><div class="text-center p-4 text-red-600"><p class="font-medium">Failed to render tailored resume</p><p class="text-sm mt-1">Please try generating the resume again</p></div></div>';
          }
          if (oldResumeContainer && previewUrls.oldResume) {
            oldResumeContainer.innerHTML =
              '<div class="flex items-center justify-center h-full min-h-[200px] bg-red-50"><div class="text-center p-4 text-red-600"><p class="font-medium">Failed to render original resume</p><p class="text-sm mt-1">Please check the file format and try again</p></div></div>';
          }
        }
      }
    };

    if (previewModalOpen) {
      // Small delay to ensure DOM elements are ready
      setTimeout(renderDocxFiles, 200);
    }
  }, [previewModalOpen, previewUrls, isOriginalResumeScrollable]);

  useEffect(() => {
    // Load saved data from localStorage
    const savedData = localStorage.getItem("resumeGenerationData");
    if (savedData) {
      const data = JSON.parse(savedData);

      // Load jobs
      if (data.jobs && Array.isArray(data.jobs)) {
        setJobs(
          data.jobs.map((job: any) => {
            // If job has resume content or URL, mark it as completed
            const hasResumeData = job.resumeContent || job.resumeUrl;
            return {
              ...job,
              status: hasResumeData
                ? ("completed" as const)
                : ("pending" as const),
              progress: hasResumeData ? 100 : 0,
              // Preserve any existing resumeContent and resumeUrl if the job was previously completed
              resumeContent: job.resumeContent || undefined,
              resumeUrl: job.resumeUrl || undefined,
            };
          })
        );
      }

      // Load other important data
      if (data.baseResumeContent) {
        setBaseResumeContent(data.baseResumeContent);
      }
      if (data.yearsOfExperience) {
        setYearsOfExperience(data.yearsOfExperience);
      }
      if (data.language) {
        setLanguage(data.language);
      }
    }

    // Load uploaded resume file from localStorage
    const uploadedFileData = localStorage.getItem("uploadedResumeFile");
    if (uploadedFileData) {
      try {
        const fileData = JSON.parse(uploadedFileData);
        // Set the base resume file URL for preview (this is already a data URL)
        setBaseResumeFile(fileData.content);
        console.log(
          "Loaded resume file from localStorage for preview:",
          fileData.name
        );
      } catch (error) {
        console.error(
          "Error loading uploaded resume file from localStorage:",
          error
        );
      }
    } else if (baseResumeContent) {
      // Fallback: Create DOCX version of original resume for preview if no uploaded file
      createOriginalResumeFile(baseResumeContent).then((fileUrl) => {
        if (fileUrl) {
          setBaseResumeFile(fileUrl);
        }
      });
    }

    // Also load any previously generated resumes from persistent storage
    const previousResumes = localStorage.getItem("generatedResumes");
    if (previousResumes) {
      try {
        const parsedResumes = JSON.parse(previousResumes);
        const resumeHistory = Array.isArray(parsedResumes) ? parsedResumes : [];

        // Merge with current jobs if they have matching IDs or company names
        setJobs((prevJobs) =>
          prevJobs.map((job) => {
            const previousResult = resumeHistory.find(
              (prev: any) =>
                prev.jobId === job.id ||
                (prev.jobTitle === job.jobTitle &&
                  prev.company === extractCompanyFromUrl(job.companyUrl))
            );

            if (
              previousResult &&
              (previousResult.resumeUrl || previousResult.resumeContent)
            ) {
              return {
                ...job,
                status: "completed" as const,
                progress: 100,
                resumeUrl: previousResult.resumeUrl,
                resumeContent: previousResult.resumeContent,
              };
            }
            return job;
          })
        );
      } catch (error) {
        console.error("Error loading previous resumes:", error);
      }
    }
  }, []);

  // Helper function to create DOCX file from original resume content
  const createOriginalResumeFile = async (
    content: string
  ): Promise<string | null> => {
    try {
      // Convert plain text resume to structured format for the modern generator
      const basicResumeData = {
        full_name: "Resume Holder", // We'll extract this from content if possible
        source_content_analysis: {
          has_email: true,
          has_phone: true,
          has_location: true,
          has_linkedin: false,
          has_github: false,
          has_social_links: false,
          has_relocation_willingness: false,
          has_skills: true,
          has_work_experience: true,
          has_education: true,
          has_certifications: false,
          has_projects: false,
          has_languages: false,
          has_awards: false,
        },
        contact_information: {
          social_links: [],
        },
        professional_summary: content.substring(0, 300) + "...", // Use first part as summary
        skills: ["Skills from original resume"],
        work_experience: [
          {
            job_title: "Previous Role",
            company: "Previous Company",
            responsibilities: ["Experience from original resume"],
          },
        ],
        education: [
          {
            degree: "Education from original resume",
            institution: "Educational Institution",
          },
        ],
      };

      const doc = generateModernResumeDocx(basicResumeData);
      const buffer = await Packer.toBuffer(doc);
      const docxBase64 = Buffer.from(buffer).toString("base64");
      return `data:application/vnd.openxmlformats-officedocument.wordprocessingml.document;base64,${docxBase64}`;
    } catch (error) {
      console.error("Error creating original resume DOCX:", error);
      return null;
    }
  };

  // Helper function to extract company name from URL
  const extractCompanyFromUrl = (url: string): string => {
    try {
      const domain = url
        .replace(/^https?:\/\//, "")
        .replace(/^www\./, "")
        .split(".")[0];
      return domain.charAt(0).toUpperCase() + domain.slice(1);
    } catch {
      return "";
    }
  };

  // Helper function to create a readable preview text from structured data
  const createResumePreviewText = (data: TailoredResumeData): string => {
    // Defensive check for full_name
    const fullName = data.full_name || "Resume Holder";
    let text = `${fullName.toUpperCase()}\n`;
    text += "=".repeat(fullName.length) + "\n\n";

    // Contact Information
    const contactInfo: string[] = [];
    if (data.contact_information?.email)
      contactInfo.push(`Email: ${data.contact_information.email}`);
    if (data.contact_information?.phone)
      contactInfo.push(`Phone: ${data.contact_information.phone}`);
    if (data.contact_information?.location)
      contactInfo.push(`Location: ${data.contact_information.location}`);
    if (data.contact_information?.linkedin)
      contactInfo.push(`LinkedIn: ${data.contact_information.linkedin}`);
    if (data.contact_information?.github)
      contactInfo.push(`GitHub: ${data.contact_information.github}`);
    if (data.contact_information?.website)
      contactInfo.push(`Website: ${data.contact_information.website}`);
    if (data.contact_information?.social_links) {
      data.contact_information.social_links.forEach((link) => {
        if (link.platform && link.url) {
          contactInfo.push(`${link.platform}: ${link.url}`);
        }
      });
    }

    if (contactInfo.length > 0) {
      text += contactInfo.join(" | ") + "\n\n";
    }

    // Professional Summary
    if (data.professional_summary) {
      text += "PROFESSIONAL SUMMARY\n";
      text += "-".repeat(20) + "\n";
      text += data.professional_summary + "\n\n";
    }

    // Skills
    if (data.skills && data.skills.length > 0) {
      text += "CORE COMPETENCIES\n";
      text += "-".repeat(17) + "\n";
      text += data.skills.join(" • ") + "\n\n";
    }

    // Work Experience
    if (data.work_experience && data.work_experience.length > 0) {
      text += "PROFESSIONAL EXPERIENCE\n";
      text += "-".repeat(23) + "\n";
      data.work_experience.forEach((job) => {
        if (job.job_title || job.company) {
          text += `${job.job_title || "Position"} | ${
            job.company || "Company"
          }\n`;
          const details = [];
          if (job.location) details.push(job.location);
          if (job.start_date && job.end_date) {
            details.push(`${job.start_date} - ${job.end_date}`);
          } else if (job.start_date) {
            details.push(`${job.start_date} - Present`);
          }
          if (details.length > 0) {
            text += details.join(" | ") + "\n";
          }
          if (job.responsibilities && job.responsibilities.length > 0) {
            job.responsibilities.forEach((resp) => {
              text += `• ${resp}\n`;
            });
          }
          text += "\n";
        }
      });
    }

    // Education
    if (data.education && data.education.length > 0) {
      text += "EDUCATION\n";
      text += "-".repeat(9) + "\n";
      data.education.forEach((edu) => {
        if (edu.degree || edu.institution) {
          text += `${edu.degree || "Degree"}\n`;
          text += `${edu.institution || "Institution"}`;
          if (edu.location) text += ` - ${edu.location}`;
          text += "\n";
          if (edu.start_year && edu.end_year) {
            text += `${edu.start_year} - ${edu.end_year}\n`;
          } else if (edu.start_year) {
            text += `${edu.start_year}\n`;
          }
          if (edu.additional_details) {
            text += `${edu.additional_details}\n`;
          }
          text += "\n";
        }
      });
    }

    // Certifications
    if (data.certifications && data.certifications.length > 0) {
      text += "CERTIFICATIONS\n";
      text += "-".repeat(14) + "\n";
      data.certifications.forEach((cert) => {
        if (cert.name) {
          text += `• ${cert.name}`;
          if (cert.issuer) text += ` - ${cert.issuer}`;
          if (cert.year) text += ` (${cert.year})`;
          text += "\n";
        }
      });
      text += "\n";
    }

    // Projects
    if (data.projects && data.projects.length > 0) {
      text += "KEY PROJECTS\n";
      text += "-".repeat(12) + "\n";
      data.projects.forEach((project) => {
        if (project.title) {
          text += `• ${project.title}`;
          if (project.description) text += `: ${project.description}`;
          text += "\n";
        }
      });
      text += "\n";
    }

    // Languages
    if (data.languages && data.languages.length > 0) {
      text += "LANGUAGES\n";
      text += "-".repeat(9) + "\n";
      data.languages.forEach((lang) => {
        if (lang.language) {
          text += `• ${lang.language}`;
          if (lang.proficiency) text += `: ${lang.proficiency}`;
          text += "\n";
        }
      });
      text += "\n";
    }

    // Awards
    if (data.awards && data.awards.length > 0) {
      text += "AWARDS & HONORS\n";
      text += "-".repeat(15) + "\n";
      data.awards.forEach((award) => {
        if (award.title) {
          text += `• ${award.title}`;
          if (award.issuer) text += ` - ${award.issuer}`;
          if (award.year) text += ` (${award.year})`;
          if (award.description) text += `\n  ${award.description}`;
          text += "\n";
        }
      });
    }

    return text;
  };

  const startResumeGeneration = async () => {
    if (jobs.length === 0) return;

    setIsGenerating(true);
    setOverallProgress(0);

    // Reset all jobs to pending status
    const resetJobs = jobs.map((job) => ({
      ...job,
      status: "pending" as const,
      progress: 0,
      error: undefined,
    }));
    setJobs(resetJobs);

    try {
      // Process jobs with a concurrency limit of 2
      const concurrencyLimit = 2;
      const results: Array<{ jobId: string; success: boolean; error?: any }> =
        [];

      // Helper function to process a single job
      const processJob = async (job: Job) => {
        try {
          console.log(
            `🔄 Starting generation for: ${job.jobTitle} at ${job.company}`
          );

          // Update job status to generating
          setJobs((prevJobs) =>
            prevJobs.map((j) =>
              j.id === job.id
                ? { ...j, status: "generating" as const, progress: 20 }
                : j
            )
          );

          // Call the tailored resume API directly
          const response = await fetch("/api/generate-tailored-resume", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              job_title: job.jobTitle,
              job_description: job.description,
              resumeText: baseResumeContent,
              additional_context: {
                company: job.company || extractCompanyFromUrl(job.companyUrl),
                skills: job.skills,
                yearsOfExperience: yearsOfExperience,
                language: language || "en",
              },
            }),
          });

          if (!response.ok) {
            const errorText = await response.text();
            throw new Error(
              `API Error ${response.status}: ${response.statusText}. ${errorText}`
            );
          }

          console.log(`📝 API call successful for: ${job.jobTitle}`);

          // Update progress
          setJobs((prevJobs) =>
            prevJobs.map((j) =>
              j.id === job.id && j.status === "generating"
                ? { ...j, progress: 60 }
                : j
            )
          );

          const apiResponse = await response.json();

          // Extract the actual tailored resume data from the API response
          const tailoredResumeData =
            apiResponse.data?.tailored_resume || apiResponse;

          // Generate DOCX using modern generator
          const docxDocument = generateModernResumeDocx(tailoredResumeData);
          const docxBuffer = await Packer.toBuffer(docxDocument);
          const docxBlob = new Blob([docxBuffer], {
            type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
          });
          const docxUrl = URL.createObjectURL(docxBlob);

          // Update progress
          setJobs((prevJobs) =>
            prevJobs.map((j) =>
              j.id === job.id && j.status === "generating"
                ? { ...j, progress: 80 }
                : j
            )
          );

          // Create a readable preview text from the structured data
          const resumeText = createResumePreviewText(tailoredResumeData);

          // Create text data URL for download
          const textBlob = new Blob([resumeText], { type: "text/plain" });
          const textUrl = URL.createObjectURL(textBlob);

          // Update job to completed
          setJobs((prevJobs) =>
            prevJobs.map((j) =>
              j.id === job.id
                ? {
                    ...j,
                    status: "completed" as const,
                    progress: 100,
                    resumeUrl: textUrl,
                    resumeContent: resumeText,
                    docxUrl: docxUrl,
                    tailoredResumeData: tailoredResumeData,
                  }
                : j
            )
          );

          // Save to persistent storage for future sessions
          const resumeRecord = {
            jobId: job.id,
            jobTitle: job.jobTitle,
            company: job.company || extractCompanyFromUrl(job.companyUrl),
            companyUrl: job.companyUrl,
            resumeUrl: textUrl,
            resumeContent: resumeText,
            docxUrl: docxUrl,
            generatedAt: new Date().toISOString(),
            baseResumeUsed: baseResumeContent?.substring(0, 100) + "...",
          };

          try {
            const existingResumes = localStorage.getItem("generatedResumes");
            const resumeHistory = existingResumes
              ? JSON.parse(existingResumes)
              : [];

            // Remove any existing entry for this job to avoid duplicates
            const filteredHistory = resumeHistory.filter(
              (r: any) => r.jobId !== job.id
            );

            // Add the new record
            filteredHistory.push(resumeRecord);

            // Keep only the last 50 resumes to avoid localStorage bloat
            const limitedHistory = filteredHistory.slice(-50);

            localStorage.setItem(
              "generatedResumes",
              JSON.stringify(limitedHistory)
            );

            // Also update current session data
            const currentData = localStorage.getItem("resumeGenerationData");
            if (currentData) {
              const data = JSON.parse(currentData);
              data.jobs = data.jobs.map((j: any) =>
                j.id === job.id
                  ? {
                      ...j,
                      resumeUrl: textUrl,
                      resumeContent: resumeText,
                      docxUrl,
                    }
                  : j
              );
              localStorage.setItem(
                "resumeGenerationData",
                JSON.stringify(data)
              );
            }
          } catch (error) {
            console.error("Error saving resume to persistent storage:", error);
          }

          return { jobId: job.id, success: true };
        } catch (error) {
          console.log(
            `Error generating resume for job: ${job.jobTitle}`,
            error
          );

          // Update job to error status
          setJobs((prevJobs) =>
            prevJobs.map((j) =>
              j.id === job.id
                ? {
                    ...j,
                    status: "error" as const,
                    progress: 0,
                    error:
                      error instanceof Error ? error.message : "Unknown error",
                  }
                : j
            )
          );

          toast.error(
            `Failed to generate resume for ${job.jobTitle}: ${
              error instanceof Error ? error.message : "Unknown error"
            }`
          );
          return { jobId: job.id, success: false, error };
        }
      };

      // Process jobs with concurrency limit
      console.log(
        `Starting resume generation for ${resetJobs.length} jobs with concurrency limit: ${concurrencyLimit}`
      );

      for (let i = 0; i < resetJobs.length; i += concurrencyLimit) {
        const batch = resetJobs.slice(i, i + concurrencyLimit);
        const batchNumber = Math.floor(i / concurrencyLimit) + 1;
        const totalBatches = Math.ceil(resetJobs.length / concurrencyLimit);

        console.log(
          `🚀 Processing batch ${batchNumber}/${totalBatches} with ${batch.length} jobs:`,
          batch.map((j) => j.jobTitle)
        );

        const batchPromises = batch.map(processJob);
        const batchResults = await Promise.allSettled(batchPromises);

        // Process results and update progress
        batchResults.forEach((result, index) => {
          const jobId = batch[index].id;
          const jobTitle = batch[index].jobTitle;

          if (result.status === "fulfilled") {
            console.log(`✅ Successfully completed: ${jobTitle}`);
            results.push(result.value);
          } else {
            console.error(`❌ Failed job: ${jobTitle}`, result.reason);
            results.push({ jobId, success: false, error: result.reason });
          }
        });

        // Update overall progress
        const completedJobs = Math.min(i + concurrencyLimit, resetJobs.length);
        setOverallProgress((completedJobs / resetJobs.length) * 100);

        console.log(
          `📊 Progress: ${completedJobs}/${
            resetJobs.length
          } jobs completed (${Math.round(
            (completedJobs / resetJobs.length) * 100
          )}%)`
        );

        // Small delay between batches to prevent overwhelming the API
        if (i + concurrencyLimit < resetJobs.length) {
          console.log("⏱️  Brief pause before next batch...");
          await new Promise((resolve) => setTimeout(resolve, 500));
        }
      }

      // Final status summary
      const successCount = results.filter((r) => r.success).length;
      const errorCount = results.filter((r) => !r.success).length;

      if (successCount > 0) {
        toast.success(`Successfully generated ${successCount} resume(s)`);
      }
      if (errorCount > 0) {
        toast.error(`Failed to generate ${errorCount} resume(s)`);
      }
    } catch (error) {
      console.error("Error in resume generation:", error);
      toast.error("Failed to start resume generation");
    } finally {
      setIsGenerating(false);
    }
  };

  const downloadResume = (job: Job, format: "text" | "docx" = "text") => {
    if (format === "docx" && job.docxUrl) {
      // Download DOCX format
      const link = document.createElement("a");
      link.href = job.docxUrl;
      link.download = `${job.jobTitle}_${job.company}_Resume.docx`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      return;
    }

    // Download text format
    if (job.resumeContent) {
      const blob = new Blob([job.resumeContent], { type: "text/plain" });
      const url = URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = url;
      link.download = `${job.jobTitle}_${job.company}_Resume.txt`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      URL.revokeObjectURL(url);
      return;
    }

    // Fallback to resumeUrl if no stored content
    if (job.resumeUrl) {
      if (job.resumeUrl.startsWith("data:text/plain;base64,")) {
        const base64Content = job.resumeUrl.split(",")[1];
        const resumeText = atob(base64Content);

        const blob = new Blob([resumeText], { type: "text/plain" });
        const url = URL.createObjectURL(blob);

        const link = document.createElement("a");
        link.href = url;
        link.download = `${job.jobTitle}_${job.company}_Resume.txt`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        URL.revokeObjectURL(url);
      } else {
        const link = document.createElement("a");
        link.href = job.resumeUrl;
        link.download = `${job.jobTitle}_${job.company}_Resume.docx`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    }
  };

  const [previewContent, setPreviewContent] = useState<string | null>(null);

  const previewResume = async (job: Job) => {
    // Check if we have the complete structured data and original resume
    if (job.tailoredResumeData && (baseResumeContent || baseResumeFile)) {
      try {
        setPreviewJobId(job.id);
        setPreviewModalOpen(true);

        // Generate DOCX for the new tailored resume
        const newResumeDoc = generateModernResumeDocx(job.tailoredResumeData);

        // Convert to blob using Packer
        const newResumeBlob = await Packer.toBlob(newResumeDoc);

        // Create blob URL for the base resume if available
        let oldResumeUrl = null;
        if (baseResumeFile) {
          oldResumeUrl = baseResumeFile;
        } else if (baseResumeContent) {
          // Create a basic DOCX from the text content
          const basicResumeData = {
            full_name: "Resume Holder",
            source_content_analysis: {
              has_email: true,
              has_phone: true,
              has_location: true,
              has_linkedin: false,
              has_github: false,
              has_social_links: false,
              has_relocation_willingness: false,
              has_skills: true,
              has_work_experience: true,
              has_education: true,
              has_certifications: false,
              has_projects: false,
              has_languages: false,
              has_awards: false,
            },
            contact_information: {},
            professional_summary: baseResumeContent.substring(0, 300) + "...",
            skills: ["Skills from original resume"],
            work_experience: [
              {
                job_title: "Previous Role",
                company: "Previous Company",
                responsibilities: ["Experience from original resume"],
              },
            ],
            education: [
              {
                degree: "Education from original resume",
                institution: "Educational Institution",
              },
            ],
          };
          const originalResumeDoc = generateModernResumeDocx(basicResumeData);
          const originalResumeBlob = await Packer.toBlob(originalResumeDoc);
          oldResumeUrl = URL.createObjectURL(originalResumeBlob);
        }

        // Set preview URLs
        setPreviewUrls({
          oldResume: oldResumeUrl,
          newResume: URL.createObjectURL(newResumeBlob),
        });

        setPreviewModalOpen(true);
        setPreviewData(null);
        setPreviewContent(null);
        setPreviewUrl(null);
        setIsPreviewOpen(false);
        return;
      } catch (error) {
        console.error("Error creating preview:", error);
        toast.error("Failed to create resume preview. Please try again.");
        return;
      }
    }

    // Fallback for text content
    if (job.resumeContent && (baseResumeContent || baseResumeFile)) {
      setPreviewData({
        originalResume: baseResumeContent,
        originalResumeFile: baseResumeFile || undefined,
        tailoredResume: job.resumeContent,
        tailoredResumeFile: job.docxUrl || undefined,
        jobTitle: job.jobTitle,
        company: job.company || extractCompanyFromUrl(job.companyUrl),
        jobDescription: job.description,
        skills: job.skills,
      });
      setPreviewContent(null);
      setPreviewUrl(null);
      setIsPreviewOpen(true);
      setPreviewModalOpen(false);
      return;
    }

    // If we have resume content but no base resume, show single view
    if (job.resumeContent && !baseResumeContent) {
      setPreviewContent(job.resumeContent);
      setPreviewData(null);
      setPreviewUrl(null);
      setIsPreviewOpen(true);
      setPreviewModalOpen(false);
      toast(
        "Original resume not available for comparison. Showing tailored resume only.",
        {
          duration: 3000,
        }
      );
      return;
    }

    // Fallback handling for legacy data
    if (!job.resumeUrl) return;

    try {
      if (job.resumeUrl.startsWith("data:text/plain;base64,")) {
        const base64Content = job.resumeUrl.split(",")[1];
        const resumeText = atob(base64Content);

        if (baseResumeContent) {
          setPreviewData({
            originalResume: baseResumeContent,
            originalResumeFile: baseResumeFile || undefined,
            tailoredResume: resumeText,
            tailoredResumeFile: job.docxUrl || undefined,
            jobTitle: job.jobTitle,
            company: job.company || extractCompanyFromUrl(job.companyUrl),
            jobDescription: job.description,
            skills: job.skills,
          });
          setPreviewContent(null);
          setPreviewUrl(null);
          setPreviewModalOpen(false);
        } else {
          setPreviewContent(resumeText);
          setPreviewData(null);
          setPreviewUrl(job.resumeUrl);
          setPreviewModalOpen(false);
        }
      } else {
        setPreviewContent(null);
        setPreviewData(null);
        setPreviewUrl(job.resumeUrl);
        setPreviewModalOpen(false);
      }

      setIsPreviewOpen(true);
    } catch (error) {
      console.error("Error setting up preview:", error);
      toast.error("Failed to load preview");
    }
  };

  // Close preview modal and cleanup URLs
  const closePreviewModal = () => {
    setPreviewModalOpen(false);
    setPreviewJobId(null);

    // Cleanup blob URLs to prevent memory leaks
    if (previewUrls.oldResume && previewUrls.oldResume.startsWith("blob:")) {
      URL.revokeObjectURL(previewUrls.oldResume);
    }
    if (previewUrls.newResume && previewUrls.newResume.startsWith("blob:")) {
      URL.revokeObjectURL(previewUrls.newResume);
    }

    setPreviewUrls({ oldResume: null, newResume: null });
  };

  const getStatusBadge = (job: Job) => {
    switch (job.status) {
      case "pending":
        return <Badge variant="secondary">Pending</Badge>;
      case "generating":
        return (
          <div className="flex items-center gap-2">
            <div
              className="animate-spin inline-block w-4 h-4 border-[2px] border-current border-t-transparent rounded-full text-blue-600"
              role="status"
            >
              <span className="sr-only">Loading...</span>
            </div>
            <span className="text-sm text-blue-600">Generating</span>
          </div>
        );
      case "completed":
        return (
          <Badge variant="default" className="bg-green-500">
            Completed
          </Badge>
        );
      case "error":
        return <Badge variant="destructive">Error</Badge>;
      default:
        return <Badge variant="secondary">Unknown</Badge>;
    }
  };

  return (
    <div className="container mx-auto py-8">
      <div className="flex items-center gap-4 mb-6">
        <Link href="/bulk-jobs">
          <Button variant="outline" size="sm">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Jobs
          </Button>
        </Link>
        <h1 className="text-2xl font-bold">Resume Generation</h1>
      </div>

      <Card className="mb-6">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle>Generate Resumes</CardTitle>
            <Button
              onClick={startResumeGeneration}
              disabled={isGenerating || jobs.length === 0}
              className="flex items-center gap-2"
            >
              {isGenerating ? (
                <>
                  <Pause className="w-4 h-4" />
                  Generating...
                </>
              ) : (
                <>
                  <Play className="w-4 h-4" />
                  Start Generation
                </>
              )}
            </Button>
          </div>
          {isGenerating && (
            <div className="mt-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Overall Progress</span>
                <span className="text-sm text-muted-foreground">
                  {Math.round(overallProgress)}%
                </span>
              </div>
              <Progress value={overallProgress} className="h-2" />
            </div>
          )}
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-4">
            {jobs.length} job{jobs.length !== 1 ? "s" : ""} ready for resume
            generation
          </p>

          {jobs.length > 0 && (
            <div className="border rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Job Title</TableHead>
                    <TableHead>Company</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {jobs.map((job) => (
                    <TableRow key={job.id}>
                      <TableCell className="font-medium">
                        {job.jobTitle}
                      </TableCell>
                      <TableCell>{job.company}</TableCell>
                      <TableCell>
                        <div className="flex flex-col gap-1">
                          {getStatusBadge(job)}
                          {job.error && (
                            <span className="text-xs text-red-500">
                              {job.error}
                            </span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          {/* Debug info - remove after testing */}
                          {process.env.NODE_ENV === "development" && (
                            <span className="text-xs text-gray-400">
                              Status: {job.status}, URL:{" "}
                              {job.resumeUrl ? "Yes" : "No"}, Content:{" "}
                              {job.resumeContent ? "Yes" : "No"}
                            </span>
                          )}

                          {job.status === "completed" &&
                            (job.resumeUrl || job.resumeContent) && (
                              <>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => previewResume(job)}
                                >
                                  <Eye className="w-4 h-4 mr-1" />
                                  Preview
                                </Button>
                                <div className="flex gap-1">
                                  {/* <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => downloadResume(job, "text")}
                                  >
                                    <Download className="w-4 h-4 mr-1" />
                                    Text
                                  </Button> */}
                                  {job.docxUrl && (
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() =>
                                        downloadResume(job, "docx")
                                      }
                                    >
                                      <Download className="w-4 h-4 mr-1" />
                                      DOCX
                                    </Button>
                                  )}
                                </div>
                              </>
                            )}

                          {job.status === "completed" &&
                            !job.resumeUrl &&
                            !job.resumeContent && (
                              <span className="text-xs text-yellow-600">
                                Resume data missing
                              </span>
                            )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}

          {jobs.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              No jobs available for resume generation.
              <br />
              <Link href="/bulk-jobs" className="text-primary hover:underline">
                Go back to add some jobs first.
              </Link>
            </div>
          )}
        </CardContent>
      </Card>

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
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-semibold text-gray-700 flex items-center gap-2">
                  <FileText className="h-4 w-4 text-gray-600" />
                  Original Resume
                </h3>
                <button
                  onClick={() =>
                    setIsOriginalResumeScrollable(!isOriginalResumeScrollable)
                  }
                  className="text-xs text-blue-600 hover:text-blue-800 hover:underline transition-colors"
                  title={
                    isOriginalResumeScrollable
                      ? "Use container view"
                      : "Enable horizontal scrolling"
                  }
                >
                  {isOriginalResumeScrollable
                    ? "Use container"
                    : "Not rendering correctly? Try without container"}
                </button>
              </div>
              <div
                className={`flex-1 border-2 border-dashed border-gray-300 rounded-xl overflow-hidden bg-white shadow-sm min-h-0 ${
                  isOriginalResumeScrollable ? "overflow-x-auto" : ""
                }`}
              >
                {previewUrls.oldResume ? (
                  <div
                    className={`w-full h-full bg-gray-50/30 ${
                      isOriginalResumeScrollable
                        ? "overflow-x-auto overflow-y-auto"
                        : "overflow-auto"
                    }`}
                  >
                    <div
                      id="old-resume-preview"
                      className="w-full h-full min-h-[400px]"
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
                      className="w-full h-full min-h-[400px]"
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

      {/* Legacy Preview Modal - fallback for old data structure */}
      <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
        <DialogContent className="max-w-7xl max-h-[90vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Eye className="w-5 h-5" />
              Resume Preview Comparison
              {previewData && (
                <Badge variant="default" className="ml-2">
                  {previewData.jobTitle}
                </Badge>
              )}
            </DialogTitle>
            {previewData && (
              <p className="text-sm text-muted-foreground">
                Compare your original resume with the AI-tailored version
              </p>
            )}
          </DialogHeader>

          <div className="flex-1 overflow-hidden">
            {previewData ? (
              // Side-by-side comparison view
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 h-[70vh]">
                {/* Original Resume */}
                <div className="flex flex-col">
                  <div className="flex items-center gap-2 mb-3 pb-2 border-b">
                    <FileText className="w-4 h-4 text-gray-600" />
                    <h3 className="font-semibold text-gray-800">
                      Original Resume
                    </h3>
                  </div>
                  <div className="flex-1 border rounded-lg overflow-hidden bg-gray-50">
                    {previewData.originalResumeFile ? (
                      // Try to show DOCX file preview - note: Office online viewer may not work with data URLs
                      <div className="w-full h-full relative">
                        <div className="absolute inset-0 flex flex-col">
                          <div className="p-2 bg-blue-50 border-b text-xs text-blue-700">
                            <span>📄 DOCX Preview - </span>
                            <button
                              onClick={() => {
                                // Create download link
                                const link = document.createElement("a");
                                link.href = previewData.originalResumeFile!;
                                link.download = "Original_Resume.docx";
                                link.click();
                              }}
                              className="underline hover:text-blue-900"
                            >
                              Download to view full formatting
                            </button>
                          </div>
                          <div className="flex-1 p-4 overflow-auto">
                            <pre className="whitespace-pre-wrap font-sans text-xs leading-relaxed text-gray-700">
                              {previewData.originalResume}
                            </pre>
                          </div>
                        </div>
                      </div>
                    ) : (
                      // Fallback to text content
                      <div className="p-4 overflow-auto h-full">
                        <pre className="whitespace-pre-wrap font-sans text-xs leading-relaxed text-gray-700">
                          {previewData.originalResume}
                        </pre>
                      </div>
                    )}
                  </div>
                </div>

                {/* Tailored Resume */}
                <div className="flex flex-col">
                  <div className="flex items-center gap-2 mb-3 pb-2 border-b">
                    <Sparkles className="w-4 h-4 text-green-600" />
                    <h3 className="font-semibold text-green-800">
                      Tailored Resume
                    </h3>
                    <Badge variant="default" className="bg-green-500 text-xs">
                      AI Generated
                    </Badge>
                  </div>
                  <div className="flex-1 border rounded-lg overflow-hidden bg-green-50 border-green-200">
                    {previewData.tailoredResumeFile &&
                    previewData.tailoredResumeFile.startsWith(
                      "data:application/vnd.openxmlformats"
                    ) ? (
                      // Show DOCX file preview with download option
                      <div className="w-full h-full relative">
                        <div className="absolute inset-0 flex flex-col">
                          <div className="p-2 bg-green-100 border-b text-xs text-green-700">
                            <span>📄 DOCX Generated - </span>
                            <button
                              onClick={() => {
                                // Create download link
                                const link = document.createElement("a");
                                link.href = previewData.tailoredResumeFile!;
                                link.download = `${previewData.jobTitle}_${previewData.company}_Resume.docx`;
                                link.click();
                              }}
                              className="underline hover:text-green-900"
                            >
                              Download DOCX
                            </button>
                          </div>
                          <div className="flex-1 p-4 overflow-auto">
                            <pre className="whitespace-pre-wrap font-sans text-xs leading-relaxed text-gray-700">
                              {previewData.tailoredResume}
                            </pre>
                          </div>
                        </div>
                      </div>
                    ) : (
                      // Fallback to text content
                      <div className="p-4 overflow-auto h-full">
                        <pre className="whitespace-pre-wrap font-sans text-xs leading-relaxed text-gray-700">
                          {previewData.tailoredResume}
                        </pre>
                      </div>
                    )}
                  </div>
                </div>

                {/* Job Details */}
                <div className="flex flex-col">
                  <div className="flex items-center gap-2 mb-3 pb-2 border-b">
                    <Building2 className="w-4 h-4 text-purple-600" />
                    <h3 className="font-semibold text-purple-800">
                      Job Details
                    </h3>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <Target className="w-4 h-4 text-purple-600" />
                        <h4 className="font-medium text-purple-800">
                          Position
                        </h4>
                      </div>
                      <Badge variant="outline" className="mb-2">
                        {previewData.jobTitle}
                      </Badge>
                      <p className="text-sm text-gray-600">
                        {previewData.company}
                      </p>
                    </div>

                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <FileText className="w-4 h-4 text-blue-600" />
                        <h4 className="font-medium text-blue-800">
                          Description
                        </h4>
                      </div>
                      <div className="max-h-32 overflow-auto border rounded p-2 bg-blue-50 text-xs">
                        {previewData.jobDescription ||
                          "No description provided"}
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <Brain className="w-4 h-4 text-orange-600" />
                        <h4 className="font-medium text-orange-800">
                          Required Skills
                        </h4>
                      </div>
                      <div className="max-h-24 overflow-auto">
                        {previewData.skills ? (
                          <div className="flex flex-wrap gap-1">
                            {previewData.skills
                              .split(",")
                              .map((skill, index) => (
                                <Badge
                                  key={index}
                                  variant="secondary"
                                  className="text-xs"
                                >
                                  {skill.trim()}
                                </Badge>
                              ))}
                          </div>
                        ) : (
                          <span className="text-xs text-gray-500">
                            No skills specified
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : previewContent ? (
              // Single resume text preview (fallback)
              <div className="w-full h-[70vh] border rounded p-4 bg-white overflow-auto">
                <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed">
                  {previewContent}
                </pre>
              </div>
            ) : previewUrl ? (
              // Office document preview (fallback)
              <div className="w-full h-[70vh] border rounded">
                <iframe
                  src={`https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(
                    previewUrl
                  )}`}
                  width="100%"
                  height="100%"
                  frameBorder="0"
                  title="Resume Preview"
                >
                  This browser does not support document preview. Please
                  download the file to view it.
                </iframe>
              </div>
            ) : (
              <div className="w-full h-[70vh] border rounded flex items-center justify-center text-gray-500">
                No preview available
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
