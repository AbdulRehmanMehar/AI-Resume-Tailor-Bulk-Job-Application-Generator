import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createModernResumeDocument } from "@/lib/resume-docx-generator";
import { Packer } from "docx";
import fs from "fs";
import path from "path";

// Use file-based storage for job data (in production, use Redis or database)
const STORAGE_DIR = path.join(process.cwd(), ".tmp");
const ensureStorageDir = () => {
  if (!fs.existsSync(STORAGE_DIR)) {
    fs.mkdirSync(STORAGE_DIR, { recursive: true });
  }
};

const setJobData = (taskId: string, data: any) => {
  ensureStorageDir();
  const filePath = path.join(STORAGE_DIR, `${taskId}.json`);
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
};

const getJobData = (taskId: string) => {
  ensureStorageDir();
  const filePath = path.join(STORAGE_DIR, `${taskId}.json`);
  try {
    if (fs.existsSync(filePath)) {
      const data = fs.readFileSync(filePath, "utf-8");
      return JSON.parse(data);
    }
  } catch (error) {
    console.error(`Error reading job data for ${taskId}:`, error);
  }
  return null;
};

export async function POST(request: NextRequest) {
  console.log("--- Entering /api/generate-resume/start ---");
  try {
    const {
      fileId,
      resumeContent,
      jobDescription,
      jobTitle,
      company,
      companyUrl,
      skills,
      baseResumeContent,
      yearsOfExperience,
      language,
      jobId,
    } = await request.json();

    console.log(`Received data for job: ${jobTitle} at ${company}`);
    console.log(
      `Resume content length: ${
        (resumeContent || baseResumeContent)?.length || 0
      }`
    );

    const finalResumeContent = resumeContent || baseResumeContent;
    const finalJobDescription =
      jobDescription ||
      `Job Title: ${jobTitle}\nCompany: ${company}\nRequired Skills: ${skills}`;

    if (!finalResumeContent || !finalJobDescription || !jobTitle) {
      console.error("Missing required data in request body.");
      return NextResponse.json(
        { error: "Missing resume content, job description, or job title." },
        { status: 400 }
      );
    }

    // Create a unique task ID
    const taskId = `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Store job data for processing
    setJobData(taskId, {
      status: "processing",
      jobTitle,
      company: company || "Unknown Company",
      companyUrl,
      resumeContent: finalResumeContent,
      jobDescription: finalJobDescription,
      skills,
      yearsOfExperience,
      language,
      jobId,
      createdAt: new Date().toISOString(),
    });

    // Start async processing
    processResumeGeneration(taskId, {
      jobTitle,
      jobDescription: finalJobDescription,
      resumeText: finalResumeContent,
      additional_context: `Years of experience: ${yearsOfExperience}, Language: ${language}`,
    }).catch((error) => {
      console.error(`Error processing task ${taskId}:`, error);
      // Update status to error
      const jobData = getJobData(taskId);
      if (jobData) {
        setJobData(taskId, {
          ...jobData,
          status: "error",
          error: error.message || "Unknown error occurred",
        });
      }
    });

    return NextResponse.json({
      taskId,
      status: "started",
    });
  } catch (error: any) {
    console.error("--- Caught error in /api/generate-resume/start ---");
    console.error("Full error object:", JSON.stringify(error, null, 2));

    return NextResponse.json(
      { error: error.message || "An unexpected server error occurred." },
      { status: 500 }
    );
  }
}

async function processResumeGeneration(taskId: string, requestData: any) {
  try {
    console.log(`Processing resume generation for task ${taskId}`);

    // Call the tailored resume API
    const response = await fetch(
      `${
        process.env.NEXTAUTH_URL || "http://localhost:3000"
      }/api/generate-tailored-resume`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestData),
      }
    );

    if (!response.ok) {
      throw new Error(`Tailored resume API failed: ${response.statusText}`);
    }

    const result = await response.json();

    if (!result.success) {
      throw new Error(result.error || "Failed to generate tailored resume");
    }

    // Convert the structured resume data to markdown text
    const resumeText = convertStructuredResumeToMarkdown(
      result.data.tailored_resume
    );

    // Generate DOCX file
    const doc = createModernResumeDocument(resumeText, requestData.jobTitle);
    const buffer = await Packer.toBuffer(doc);

    // Create data URLs
    const docxBase64 = Buffer.from(buffer).toString("base64");
    const docxUrl = `data:application/vnd.openxmlformats-officedocument.wordprocessingml.document;base64,${docxBase64}`;

    const textBase64 = Buffer.from(resumeText, "utf-8").toString("base64");
    const textUrl = `data:text/plain;base64,${textBase64}`;

    // Update job status
    const jobData = getJobData(taskId);
    if (jobData) {
      setJobData(taskId, {
        ...jobData,
        status: "completed",
        resumeText,
        resumeUrl: docxUrl,
        textUrl,
        completedAt: new Date().toISOString(),
      });
    }

    console.log(`Successfully completed resume generation for task ${taskId}`);
  } catch (error) {
    console.error(
      `Error in processResumeGeneration for task ${taskId}:`,
      error
    );
    throw error;
  }
}

function convertStructuredResumeToMarkdown(resumeData: any): string {
  let markdown = "";

  // Add name as main header
  if (resumeData.full_name) {
    markdown += `# ${resumeData.full_name}\n\n`;
  }

  // Add contact information
  if (resumeData.contact_information) {
    const contact = resumeData.contact_information;
    const contactLines = [];

    if (contact.email) contactLines.push(contact.email);
    if (contact.phone) contactLines.push(contact.phone);
    if (contact.location) contactLines.push(contact.location);
    if (contact.linkedin) contactLines.push(contact.linkedin);
    if (contact.github) contactLines.push(contact.github);
    if (contact.website) contactLines.push(contact.website);

    if (contactLines.length > 0) {
      markdown += contactLines.join(" • ") + "\n\n";
    }
  }

  // Add professional summary
  if (resumeData.professional_summary) {
    markdown += `## Professional Summary\n\n${resumeData.professional_summary}\n\n`;
  }

  // Add skills
  if (resumeData.skills && resumeData.skills.length > 0) {
    markdown += `## Core Competencies\n\n`;
    markdown +=
      resumeData.skills.map((skill: string) => `• ${skill}`).join("\n") +
      "\n\n";
  }

  // Add work experience
  if (resumeData.work_experience && resumeData.work_experience.length > 0) {
    markdown += `## Professional Experience\n\n`;
    resumeData.work_experience.forEach((exp: any) => {
      if (exp.job_title && exp.company) {
        markdown += `**${exp.job_title}** | ${exp.company}`;
        if (exp.location) markdown += ` | ${exp.location}`;
        if (exp.start_date || exp.end_date) {
          markdown += ` | ${exp.start_date || "Present"} - ${
            exp.end_date || "Present"
          }`;
        }
        markdown += "\n\n";

        if (exp.responsibilities && exp.responsibilities.length > 0) {
          exp.responsibilities.forEach((resp: string) => {
            markdown += `• ${resp}\n`;
          });
          markdown += "\n";
        }
      }
    });
  }

  // Add education
  if (resumeData.education && resumeData.education.length > 0) {
    markdown += `## Education\n\n`;
    resumeData.education.forEach((edu: any) => {
      if (edu.degree && edu.institution) {
        markdown += `**${edu.degree}** | ${edu.institution}`;
        if (edu.location) markdown += ` | ${edu.location}`;
        if (edu.start_year || edu.end_year) {
          markdown += ` | ${edu.start_year || ""} - ${
            edu.end_year || "Present"
          }`;
        }
        markdown += "\n";

        if (edu.additional_details) {
          markdown += `${edu.additional_details}\n`;
        }
        markdown += "\n";
      }
    });
  }

  // Add certifications
  if (resumeData.certifications && resumeData.certifications.length > 0) {
    markdown += `## Certifications\n\n`;
    resumeData.certifications.forEach((cert: any) => {
      if (cert.name) {
        markdown += `• **${cert.name}**`;
        if (cert.issuer) markdown += ` - ${cert.issuer}`;
        if (cert.year) markdown += ` (${cert.year})`;
        markdown += "\n";
      }
    });
    markdown += "\n";
  }

  // Add projects
  if (resumeData.projects && resumeData.projects.length > 0) {
    markdown += `## Key Projects\n\n`;
    resumeData.projects.forEach((project: any) => {
      if (project.title) {
        markdown += `**${project.title}**\n`;
        if (project.description) {
          markdown += `${project.description}\n`;
        }
        if (project.url) {
          markdown += `${project.url}\n`;
        }
        markdown += "\n";
      }
    });
  }

  // Add languages
  if (resumeData.languages && resumeData.languages.length > 0) {
    markdown += `## Languages\n\n`;
    resumeData.languages.forEach((lang: any) => {
      if (lang.language) {
        markdown += `• ${lang.language}`;
        if (lang.proficiency) markdown += ` (${lang.proficiency})`;
        markdown += "\n";
      }
    });
    markdown += "\n";
  }

  // Add awards
  if (resumeData.awards && resumeData.awards.length > 0) {
    markdown += `## Awards & Recognition\n\n`;
    resumeData.awards.forEach((award: any) => {
      if (award.title) {
        markdown += `• **${award.title}**`;
        if (award.issuer) markdown += ` - ${award.issuer}`;
        if (award.year) markdown += ` (${award.year})`;
        if (award.description) markdown += `\n  ${award.description}`;
        markdown += "\n";
      }
    });
    markdown += "\n";
  }

  return markdown.trim();
}
