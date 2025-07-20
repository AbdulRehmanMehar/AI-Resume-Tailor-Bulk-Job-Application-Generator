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
import { Loader2, Download, AlertCircle } from "lucide-react";
import { Packer } from "docx";
import saveAs from "file-saver";
import { Document, Paragraph, TextRun } from "docx";
import * as xlsx from "xlsx";

interface Job {
  id: number;
  title: string;
  description: string;
}

interface TailoredResume {
  [jobId: number]: {
    status: "idle" | "loading" | "success" | "error";
    content?: string;
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
      // Step 1: Upload the resume text to our dedicated upload endpoint.
      const resumeBlob = new Blob([baseResumeText], { type: "text/plain" });
      const uploadFormData = new FormData();
      uploadFormData.append("resumeFile", resumeBlob, "resume.txt");

      const uploadResponse = await fetch("/api/upload-resume", {
        method: "POST",
        body: uploadFormData,
      });

      if (!uploadResponse.ok) {
        const errorData = await uploadResponse.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to upload resume file.");
      }
      const { fileId } = await uploadResponse.json();

      // Step 2: Start the generation process with the returned fileId.
      const startResponse = await fetch("/api/generate-resume/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fileId: fileId,
          jobDescription: `${job.title}\n\n${job.description}`,
        }),
      });

      if (!startResponse.ok) {
        const errorData = await startResponse.json().catch(() => ({}));
        throw new Error(
          errorData.error || "Failed to start resume generation."
        );
      }

      const { threadId, runId } = await startResponse.json();
      pollForStatus(threadId, runId, job.id);
    } catch (err: any) {
      setTailoredResumes((prev) => ({
        ...prev,
        [job.id]: { status: "error", error: err.message },
      }));
    }
  };

  const downloadDocx = async (content: string, title: string) => {
    const doc = new Document({
      sections: [
        {
          properties: {},
          children: content.split("\n").map(
            (text) =>
              new Paragraph({
                children: [new TextRun(text)],
              })
          ),
        },
      ],
    });

    const blob = await Packer.toBlob(doc);
    const safeTitle = title.replace(/[^a-z0-9]/gi, "_").toLowerCase();
    saveAs(blob, `resume_for_${safeTitle}.docx`);
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
                            onClick={() =>
                              downloadDocx(
                                tailoredResumes[job.id].content!,
                                job.title
                              )
                            }
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
      </main>
    </div>
  );
}
