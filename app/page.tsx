"use client";

import type React from "react";
import { useState } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import { Loader2, Download, AlertCircle, FileText } from "lucide-react";
import { Packer } from "docx";
import saveAs from "file-saver";
import { Document, Paragraph, TextRun } from "docx";
import * as xlsx from "xlsx";
import { ResumeRenderer } from "@/components/resume-renderer";
import { ResumeLoadingSkeleton } from "@/components/resume-loading-skeleton";
import { ModernResumePreview } from "@/components/modern-resume-preview";
import { sampleResume, sampleJobs } from "@/lib/sample-data";
import { createModernResumeDocument } from "@/lib/resume-docx-generator";
import { generateModernResumeDocx } from "@/lib/modern-resume-generator";

interface Job {
  id: number;
  title: string;
  description: string;
}

interface TailoredResume {
  [jobId: number]: {
    status: "idle" | "loading" | "success" | "error";
    content?: string;
    structuredData?: any; // Store the structured resume data from API
    error?: string;
  };
}

export default function ResumeTailorPage() {
  const [baseResumeText, setBaseResumeText] = useState("");
  const [jobs, setJobs] = useState<Job[]>([]);
  const [tailoredResumes, setTailoredResumes] = useState<TailoredResume>({});
  const [error, setError] = useState<string | null>(null);
  const [isParsingResume, setIsParsingResume] = useState(false);
  const [isParsingJobs, setIsParsingJobs] = useState(false);
  const [showDemo, setShowDemo] = useState(false);

  const handleResumeFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsParsingResume(true);
    setError(null);
    setBaseResumeText("");

    try {
      const arrayBuffer = await file.arrayBuffer();
      let text = "";

      if (file.name.endsWith(".docx")) {
        // Dynamic import to avoid build issues
        const PizZip = (await import("pizzip")).default;

        const zip = new PizZip(arrayBuffer);
        const doc = zip.file("word/document.xml");
        if (!doc) {
          throw new Error("Invalid DOCX file structure");
        }

        const content = doc.asText();
        // Extract text content by removing XML tags
        text = content
          .replace(/<[^>]*>/g, " ") // Remove XML tags
          .replace(/\s+/g, " ") // Replace multiple spaces with single space
          .trim();
      } else if (file.name.endsWith(".pdf")) {
        // Dynamic import to avoid SSR issues
        const pdfjsLib = await import("pdfjs-dist");
        pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;

        const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
        let pdfText = "";
        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
          const textContent = await page.getTextContent();
          pdfText +=
            textContent.items.map((item: any) => item.str).join(" ") + "\n";
        }
        text = pdfText;
      } else {
        throw new Error("Unsupported file type. Please use DOCX or PDF.");
      }

      if (!text.trim()) {
        throw new Error(
          "Could not extract any text from the file. It might be empty, password-protected, or in an unsupported format."
        );
      }

      setBaseResumeText(text);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsParsingResume(false);
    }
  };

  const handleJobsFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsParsingJobs(true);
    setError(null);
    setJobs([]);

    try {
      const buffer = await file.arrayBuffer();
      const workbook = xlsx.read(buffer, { type: "buffer" });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const data = xlsx.utils.sheet_to_json(worksheet, {
        header: ["Job Title", "Job Description"],
        range: 1,
      }) as { "Job Title": string; "Job Description": string }[];

      const parsedJobs = data
        .map((row, index) => ({
          id: index,
          title: row["Job Title"],
          description: row["Job Description"],
        }))
        .filter((job) => job.title && job.description);

      if (parsedJobs.length === 0) {
        throw new Error(
          "No valid jobs found in the Excel file. Check column headers ('Job Title', 'Job Description') and content."
        );
      }

      setJobs(parsedJobs);
    } catch (err: any) {
      setError(`Error parsing Excel file: ${err.message}`);
    } finally {
      setIsParsingJobs(false);
    }
  };

  const handlePastedJobs = (pastedText: string) => {
    const jobBlocks = pastedText.trim().split(/\n\s*\n/);
    const parsedJobs = jobBlocks.map((block, index) => {
      const lines = block.split("\n");
      const title = lines[0];
      const description = lines.slice(1).join("\n");
      return { id: index, title, description };
    });
    setJobs(parsedJobs);
  };

  const pollForStatus = (
    threadId: string,
    runId: string,
    jobId: number,
    attempts = 0
  ) => {
    if (attempts > 45) {
      setTailoredResumes((prev) => ({
        ...prev,
        [jobId]: { status: "error", error: "Request timed out." },
      }));
      return;
    }

    setTimeout(async () => {
      try {
        const statusResponse = await fetch(
          `/api/generate-resume/status?threadId=${threadId}&runId=${runId}`
        );
        if (!statusResponse.ok) {
          const errorData = await statusResponse.json().catch(() => ({}));
          throw new Error(errorData.error || "Polling for status failed.");
        }
        const statusData = await statusResponse.json();

        if (statusData.status === "completed") {
          setTailoredResumes((prev) => ({
            ...prev,
            [jobId]: { status: "success", content: statusData.resume },
          }));
        } else if (statusData.status === "failed") {
          setTailoredResumes((prev) => ({
            ...prev,
            [jobId]: {
              status: "error",
              error: statusData.error || "Generation failed.",
            },
          }));
        } else {
          pollForStatus(threadId, runId, jobId, attempts + 1);
        }
      } catch (err: any) {
        setTailoredResumes((prev) => ({
          ...prev,
          [jobId]: { status: "error", error: err.message },
        }));
      }
    }, 2000);
  };

  const generateResume = async (job: Job) => {
    if (!baseResumeText.trim()) {
      setError("Please provide a base resume first.");
      return;
    }

    setTailoredResumes((prev) => ({
      ...prev,
      [job.id]: { status: "loading" },
    }));
    setError(null);

    try {
      // Use the new structured API endpoint
      const response = await fetch("/api/generate-tailored-resume", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          job_title: job.title,
          job_description: job.description,
          resumeText: baseResumeText,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.error || "Failed to generate tailored resume."
        );
      }

      const responseData = await response.json();

      if (!responseData.success) {
        throw new Error(responseData.error || "Resume generation failed");
      }

      const tailoredResumeData = responseData.data.tailored_resume;

      // Generate a formatted text version for display (optional fallback)
      const formattedContent = formatResumeData(tailoredResumeData);

      setTailoredResumes((prev) => ({
        ...prev,
        [job.id]: {
          status: "success",
          content: formattedContent,
          structuredData: tailoredResumeData,
        },
      }));
    } catch (err: any) {
      setTailoredResumes((prev) => ({
        ...prev,
        [job.id]: { status: "error", error: err.message },
      }));
    }
  };

  const loadDemo = () => {
    setBaseResumeText(sampleResume);
    setJobs(sampleJobs);
    setShowDemo(true);

    // Create sample structured data for demo
    const sampleStructuredData = {
      full_name: "John Smith",
      source_content_analysis: {
        has_email: true,
        has_phone: true,
        has_location: true,
        has_linkedin: true,
        has_github: false,
        has_social_links: false,
        has_relocation_willingness: false,
        has_professional_summary: true,
        has_skills: true,
        has_work_experience: true,
        has_education: true,
        has_certifications: false,
        has_projects: false,
        has_languages: false,
        has_awards: false,
      },
      contact_information: {
        email: "john.smith@email.com",
        phone: "(555) 123-4567",
        location: "San Francisco, CA",
        linkedin: "linkedin.com/in/johnsmith",
      },
      professional_summary:
        "Experienced software engineer with 5+ years of expertise in full-stack development, cloud architecture, and team leadership. Proven track record of delivering scalable solutions and driving technical innovation in fast-paced environments.",
      skills: [
        "JavaScript",
        "TypeScript",
        "React",
        "Node.js",
        "Python",
        "AWS",
        "Docker",
        "PostgreSQL",
        "Git",
        "Agile",
      ],
      work_experience: [
        {
          job_title: "Senior Software Engineer",
          company: "Tech Corp",
          location: "San Francisco, CA",
          start_date: "2020-01",
          end_date: null,
          responsibilities: [
            "Led development of microservices architecture serving 1M+ users",
            "Implemented CI/CD pipelines reducing deployment time by 60%",
            "Mentored 3 junior developers and conducted code reviews",
            "Collaborated with product team to define technical requirements",
          ],
        },
        {
          job_title: "Software Engineer",
          company: "StartupXYZ",
          location: "San Francisco, CA",
          start_date: "2018-06",
          end_date: "2019-12",
          responsibilities: [
            "Built responsive web applications using React and Node.js",
            "Designed and implemented RESTful APIs serving mobile and web clients",
            "Optimized database queries improving application performance by 40%",
          ],
        },
      ],
      education: [
        {
          degree: "B.S. Computer Science",
          institution: "Stanford University",
          location: "California",
          start_year: 2014,
          end_year: 2018,
        },
      ],
    };

    // Simulate some generated resumes for demo
    const demoResumes: TailoredResume = {};
    sampleJobs.forEach((job, index) => {
      if (index < 2) {
        // Create tailored structured data for each job
        const tailoredData = {
          ...sampleStructuredData,
          professional_summary: `${
            sampleStructuredData.professional_summary
          } Seeking to leverage expertise in ${job.title.toLowerCase()} to drive innovation and deliver exceptional results.`,
        };

        const formattedContent = formatResumeData(tailoredData);

        demoResumes[job.id] = {
          status: "success",
          content: formattedContent,
          structuredData: tailoredData,
        };
      }
    });

    setTailoredResumes(demoResumes);
  };

  const downloadDocx = async (jobId: number, title: string) => {
    try {
      const resumeData = tailoredResumes[jobId];

      if (!resumeData || !resumeData.structuredData) {
        throw new Error("No structured resume data available");
      }

      // Use the modern resume generator with structured data
      const doc = generateModernResumeDocx(resumeData.structuredData);
      const blob = await Packer.toBlob(doc);
      const safeTitle = title.replace(/[^a-z0-9]/gi, "_").toLowerCase();
      saveAs(blob, `modern_resume_for_${safeTitle}.docx`);
    } catch (error) {
      console.error("Error generating DOCX:", error);

      // Fallback to simple version if modern generator fails
      const resumeData = tailoredResumes[jobId];
      if (resumeData?.content) {
        const doc = createModernResumeDocument(resumeData.content, title);
        const blob = await Packer.toBlob(doc);
        const safeTitle = title.replace(/[^a-z0-9]/gi, "_").toLowerCase();
        saveAs(blob, `resume_for_${safeTitle}.docx`);
      } else {
        throw new Error("No resume content available for download");
      }
    }
  };

  // Helper function to format structured resume data into readable text
  const formatResumeData = (data: any): string => {
    if (!data) return "";

    let formatted = `${data.full_name}\n`;

    // Add contact information (will be conditionally included based on source_content_analysis)
    const contactParts = [];
    if (
      data.source_content_analysis?.has_email &&
      data.contact_information?.email
    ) {
      contactParts.push(data.contact_information.email);
    }
    if (
      data.source_content_analysis?.has_phone &&
      data.contact_information?.phone
    ) {
      contactParts.push(data.contact_information.phone);
    }
    if (
      data.source_content_analysis?.has_location &&
      data.contact_information?.location
    ) {
      contactParts.push(data.contact_information.location);
    }
    if (
      data.source_content_analysis?.has_linkedin &&
      data.contact_information?.linkedin
    ) {
      contactParts.push(data.contact_information.linkedin);
    }
    if (
      data.source_content_analysis?.has_github &&
      data.contact_information?.github
    ) {
      contactParts.push(data.contact_information.github);
    }
    if (
      data.source_content_analysis?.has_social_links &&
      data.contact_information?.website
    ) {
      contactParts.push(data.contact_information.website);
    }

    if (contactParts.length > 0) {
      formatted += contactParts.join(" • ") + "\n";
    }

    formatted += "\n";

    if (
      data.source_content_analysis?.has_professional_summary &&
      data.professional_summary
    ) {
      formatted += "PROFESSIONAL SUMMARY\n";
      formatted += data.professional_summary + "\n\n";
    }

    if (
      data.source_content_analysis?.has_skills &&
      data.skills &&
      data.skills.length > 0
    ) {
      formatted += "SKILLS\n";
      formatted += data.skills.join(" • ") + "\n\n";
    }

    if (
      data.source_content_analysis?.has_work_experience &&
      data.work_experience &&
      data.work_experience.length > 0
    ) {
      formatted += "WORK EXPERIENCE\n";
      data.work_experience.forEach((job: any) => {
        formatted += `${job.job_title} at ${job.company}\n`;
        formatted += `${job.start_date} - ${job.end_date || "Present"}\n`;
        if (job.responsibilities && job.responsibilities.length > 0) {
          job.responsibilities.forEach((resp: string) => {
            formatted += `• ${resp}\n`;
          });
        }
        formatted += "\n";
      });
    }

    if (
      data.source_content_analysis?.has_education &&
      data.education &&
      data.education.length > 0
    ) {
      formatted += "EDUCATION\n";
      data.education.forEach((edu: any) => {
        formatted += `${edu.degree} - ${edu.institution}\n`;
        formatted += `${edu.start_year} - ${edu.end_year || "Present"}\n\n`;
      });
    }

    return formatted;
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 sm:p-8">
      <main className="max-w-4xl mx-auto space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-50">
            AI Resume Tailor
          </h1>
          <p className="mt-2 text-lg text-gray-600 dark:text-gray-400">
            Generate tailored resumes for multiple jobs in seconds.
          </p>
          <div className="mt-4 flex flex-col sm:flex-row gap-3 justify-center">
            <Button
              variant="outline"
              onClick={loadDemo}
              className="bg-blue-50 hover:bg-blue-100 text-blue-600 border-blue-200"
            >
              ✨ View Beautiful Resume Demo
            </Button>
            <Button
              variant="outline"
              onClick={() => window.open("/bulk-jobs", "_blank")}
              className="bg-purple-50 hover:bg-purple-100 text-purple-600 border-purple-200"
            >
              🚀 Bulk Job Generator
            </Button>
          </div>
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Step 1: Provide Your Base Resume</CardTitle>
            <CardDescription>
              Upload a DOCX/PDF file or paste your resume text below.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid w-full max-w-sm items-center gap-1.5">
              <Label htmlFor="resume-file">Upload File</Label>
              <Input
                id="resume-file"
                type="file"
                accept=".docx,.pdf"
                onChange={handleResumeFileChange}
                disabled={isParsingResume}
              />
            </div>
            <div className="flex items-center">
              <div className="flex-grow border-t border-gray-200 dark:border-gray-700"></div>
              <span className="flex-shrink mx-4 text-gray-400 dark:text-gray-500 text-xs">
                OR
              </span>
              <div className="flex-grow border-t border-gray-200 dark:border-gray-700"></div>
            </div>
            <div>
              <Label htmlFor="resume-text">Paste Text</Label>
              <Textarea
                id="resume-text"
                placeholder="Paste your full resume here..."
                className="mt-1 h-48"
                value={baseResumeText}
                onChange={(e) => setBaseResumeText(e.target.value)}
                disabled={isParsingResume}
              />
            </div>
          </CardContent>
          {isParsingResume && (
            <CardFooter>
              <div className="flex items-center text-sm text-gray-500">
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Parsing resume...
              </div>
            </CardFooter>
          )}
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Step 2: Provide Job Descriptions</CardTitle>
            <CardDescription>
              Upload an Excel file (with 'Job Title' and 'Job Description'
              columns) or paste job descriptions.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid w-full max-w-sm items-center gap-1.5">
              <Label htmlFor="jobs-file">Upload Excel File</Label>
              <Input
                id="jobs-file"
                type="file"
                accept=".xlsx,.xls"
                onChange={handleJobsFileChange}
                disabled={isParsingJobs}
              />
            </div>
            <div className="flex items-center">
              <div className="flex-grow border-t border-gray-200 dark:border-gray-700"></div>
              <span className="flex-shrink mx-4 text-gray-400 dark:text-gray-500 text-xs">
                OR
              </span>
              <div className="flex-grow border-t border-gray-200 dark:border-gray-700"></div>
            </div>
            <div>
              <Label htmlFor="jobs-text">Paste Job Descriptions</Label>
              <Textarea
                id="jobs-text"
                placeholder="Paste job descriptions here. Separate each job with a blank line. Make the first line of each job the title."
                className="mt-1 h-48"
                onChange={(e) => handlePastedJobs(e.target.value)}
                disabled={isParsingJobs}
              />
            </div>
          </CardContent>
          {isParsingJobs && (
            <CardFooter>
              <div className="flex items-center text-sm text-gray-500">
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Parsing jobs file...
              </div>
            </CardFooter>
          )}
        </Card>

        {jobs.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Step 3: Generate Tailored Resumes</CardTitle>
              <CardDescription>
                Click "Generate" for each job to create a tailored version of
                your resume.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Job Title</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {jobs.map((job) => (
                    <TableRow key={job.id}>
                      <TableCell className="font-medium">{job.title}</TableCell>
                      <TableCell className="text-right">
                        {tailoredResumes[job.id]?.status === "loading" && (
                          <Button disabled size="sm">
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Generating...
                          </Button>
                        )}
                        {tailoredResumes[job.id]?.status === "success" && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => downloadDocx(job.id, job.title)}
                          >
                            <Download className="mr-2 h-4 w-4" />
                            Download
                          </Button>
                        )}
                        {tailoredResumes[job.id]?.status === "error" && (
                          <div className="text-red-500 text-xs text-right">
                            {tailoredResumes[job.id].error}
                          </div>
                        )}
                        {(!tailoredResumes[job.id] ||
                          tailoredResumes[job.id]?.status === "idle" ||
                          tailoredResumes[job.id]?.status === "error") && (
                          <Button
                            onClick={() => generateResume(job)}
                            size="sm"
                            disabled={!baseResumeText.trim()}
                          >
                            Generate
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}

        {/* Modern Resume Previews Section */}
        {Object.entries(tailoredResumes).some(
          ([_, resume]) => resume.status === "success"
        ) && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Generated Modern Resumes
              </CardTitle>
              <CardDescription>
                Preview your beautifully formatted resumes before downloading.
                Each resume is professionally designed with modern styling.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-8">
              {Object.entries(tailoredResumes)
                .filter(([_, resume]) => resume.status === "success")
                .map(([jobId, resume]) => {
                  const job = jobs.find((j) => j.id.toString() === jobId);
                  return (
                    <ModernResumePreview
                      key={jobId}
                      content={resume.content!}
                      jobTitle={job?.title}
                      onDownload={() =>
                        downloadDocx(parseInt(jobId), job?.title || "resume")
                      }
                      className="w-full"
                    />
                  );
                })}
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}
