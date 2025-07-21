"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  FileText,
  Download,
  User,
  Mail,
  Phone,
  MapPin,
  Briefcase,
  GraduationCap,
  Award,
  Sparkles,
} from "lucide-react";

interface ModernResumePreviewProps {
  content: string;
  jobTitle?: string;
  onDownload?: () => void;
  className?: string;
}

interface ParsedResumeData {
  personalInfo: {
    name?: string;
    email?: string;
    phone?: string;
    location?: string;
    summary?: string;
  };
  experience: Array<{
    title: string;
    company: string;
    duration: string;
    description: string;
  }>;
  education: Array<{
    degree: string;
    institution: string;
    year: string;
  }>;
  skills: string[];
  sections: Array<{
    title: string;
    content: string;
  }>;
}

export function ModernResumePreview({
  content,
  jobTitle,
  onDownload,
  className = "",
}: ModernResumePreviewProps) {
  const parseContent = (text: string): ParsedResumeData => {
    const lines = text.split("\n").filter((line) => line.trim());
    const parsed: ParsedResumeData = {
      personalInfo: {},
      experience: [],
      education: [],
      skills: [],
      sections: [],
    };

    let currentSection = "";
    let currentContent: string[] = [];

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();

      if (
        line.match(
          /^(PERSONAL INFORMATION|CONTACT|PROFILE|SUMMARY|OBJECTIVE|PROFESSIONAL SUMMARY)/i
        ) ||
        line.match(
          /^(EXPERIENCE|WORK EXPERIENCE|EMPLOYMENT|PROFESSIONAL EXPERIENCE)/i
        ) ||
        line.match(/^(EDUCATION|ACADEMIC BACKGROUND)/i) ||
        line.match(/^(SKILLS|TECHNICAL SKILLS|CORE COMPETENCIES)/i) ||
        line.match(/^(PROJECTS|ACHIEVEMENTS|CERTIFICATIONS|AWARDS)/i) ||
        (line.length < 50 && line.toUpperCase() === line && line.includes(" "))
      ) {
        if (currentSection && currentContent.length > 0) {
          processSection(currentSection, currentContent.join("\n"), parsed);
        }
        currentSection = line;
        currentContent = [];
        continue;
      }

      currentContent.push(line);
    }

    if (currentSection && currentContent.length > 0) {
      processSection(currentSection, currentContent.join("\n"), parsed);
    }

    // Extract name from first line if not found
    if (!parsed.personalInfo.name) {
      const firstLine = lines[0]?.trim();
      if (firstLine && firstLine.length < 50 && !firstLine.includes("@")) {
        parsed.personalInfo.name = firstLine;
      }
    }

    return parsed;
  };

  const processSection = (
    title: string,
    content: string,
    parsed: ParsedResumeData
  ) => {
    const lowerTitle = title.toLowerCase();

    if (
      lowerTitle.includes("personal") ||
      lowerTitle.includes("contact") ||
      lowerTitle.includes("profile") ||
      lowerTitle.includes("summary")
    ) {
      const emailMatch = content.match(/[\w.-]+@[\w.-]+\.\w+/);
      const phoneMatch = content.match(/[\+]?[\d\s\-\(\)]{10,}/);
      const locationMatch = content.match(
        /([A-Z][a-z]+(?: [A-Z][a-z]+)*),?\s*([A-Z]{2}|[A-Z][a-z]+)/
      );

      if (emailMatch) parsed.personalInfo.email = emailMatch[0];
      if (phoneMatch) parsed.personalInfo.phone = phoneMatch[0];
      if (locationMatch) parsed.personalInfo.location = locationMatch[0];

      if (!parsed.personalInfo.name) {
        const firstLine = content.split("\n")[0]?.trim();
        if (firstLine && firstLine.length < 50 && !firstLine.includes("@")) {
          parsed.personalInfo.name = firstLine;
        }
      }

      parsed.personalInfo.summary = content;
    } else if (
      lowerTitle.includes("experience") ||
      lowerTitle.includes("employment")
    ) {
      const jobEntries = content
        .split(/(?=\n[A-Z][^a-z\n]*(?:\n|$))/)
        .filter((entry) => entry.trim());

      jobEntries.forEach((entry) => {
        const lines = entry
          .trim()
          .split("\n")
          .filter((line) => line.trim());
        if (lines.length >= 2) {
          const title = lines[0]?.trim() || "";
          const company = lines[1]?.trim() || "";
          const duration = lines[2]?.trim() || "";
          const description =
            lines
              .slice(title && company && duration ? 3 : 2)
              .join("\n")
              .trim() || "";

          parsed.experience.push({ title, company, duration, description });
        }
      });
    } else if (lowerTitle.includes("education")) {
      const educationEntries = content
        .split(/(?=\n[A-Z][^a-z\n]*(?:\n|$))/)
        .filter((entry) => entry.trim());

      educationEntries.forEach((entry) => {
        const lines = entry
          .trim()
          .split("\n")
          .filter((line) => line.trim());
        if (lines.length >= 2) {
          parsed.education.push({
            degree: lines[0] || "",
            institution: lines[1] || "",
            year: lines[2] || "",
          });
        }
      });
    } else if (lowerTitle.includes("skill")) {
      const skills = content
        .split(/[,\n•\-\|]/)
        .map((s) => s.trim())
        .filter((s) => s && s.length > 1 && s.length < 40);
      parsed.skills.push(...skills);
    } else {
      parsed.sections.push({ title, content });
    }
  };

  const parsedData = React.useMemo(() => parseContent(content), [content]);

  return (
    <div
      className={`bg-white rounded-lg shadow-lg border-2 border-blue-200 ${className}`}
    >
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white p-6 rounded-t-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 bg-white/20 rounded-full flex items-center justify-center">
              <Sparkles className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-xl font-bold">Modern Professional Resume</h3>
              <p className="text-blue-100 text-sm">
                {jobTitle ? `Tailored for ${jobTitle}` : "AI-Generated Resume"}
              </p>
            </div>
          </div>
          {onDownload && (
            <Button
              onClick={onDownload}
              variant="secondary"
              className="bg-white text-blue-600 hover:bg-blue-50"
            >
              <Download className="mr-2 h-4 w-4" />
              Download DOCX
            </Button>
          )}
        </div>
      </div>

      {/* Preview Content */}
      <div
        className="p-6 space-y-6"
        style={{ fontFamily: "Arial, sans-serif" }}
      >
        {/* Name and Contact */}
        <div className="text-center border-b-2 border-blue-600 pb-4">
          <h1 className="text-2xl font-bold text-blue-600 mb-2">
            {parsedData.personalInfo.name || "Professional Name"}
          </h1>
          <div className="flex justify-center items-center gap-4 text-sm text-gray-600 flex-wrap">
            {parsedData.personalInfo.email && (
              <div className="flex items-center gap-1">
                <Mail className="h-3 w-3" />
                {parsedData.personalInfo.email}
              </div>
            )}
            {parsedData.personalInfo.phone && (
              <div className="flex items-center gap-1">
                <Phone className="h-3 w-3" />
                {parsedData.personalInfo.phone}
              </div>
            )}
            {parsedData.personalInfo.location && (
              <div className="flex items-center gap-1">
                <MapPin className="h-3 w-3" />
                {parsedData.personalInfo.location}
              </div>
            )}
          </div>
        </div>

        {/* Professional Summary */}
        {parsedData.personalInfo.summary && (
          <div>
            <h2 className="text-lg font-bold text-blue-600 border-b border-blue-600 pb-1 mb-3">
              PROFESSIONAL SUMMARY
            </h2>
            <p className="text-sm text-gray-700 leading-relaxed">
              {parsedData.personalInfo.summary
                .replace(/^(PROFESSIONAL SUMMARY|SUMMARY|OBJECTIVE)\s*/i, "")
                .trim()}
            </p>
          </div>
        )}

        {/* Experience */}
        {parsedData.experience.length > 0 && (
          <div>
            <h2 className="text-lg font-bold text-blue-600 border-b border-blue-600 pb-1 mb-3 flex items-center gap-2">
              <Briefcase className="h-4 w-4" />
              PROFESSIONAL EXPERIENCE
            </h2>
            <div className="space-y-4">
              {parsedData.experience.slice(0, 2).map((exp, index) => (
                <div key={index} className="border-l-2 border-blue-200 pl-4">
                  <h3 className="font-bold text-blue-600">{exp.title}</h3>
                  <p className="text-sm italic text-gray-600">
                    {exp.company} {exp.duration && `• ${exp.duration}`}
                  </p>
                  <p className="text-xs text-gray-700 mt-1 leading-relaxed">
                    {exp.description.slice(0, 150)}
                    {exp.description.length > 150 && "..."}
                  </p>
                </div>
              ))}
              {parsedData.experience.length > 2 && (
                <div className="text-xs text-gray-500 italic">
                  + {parsedData.experience.length - 2} more positions in full
                  resume
                </div>
              )}
            </div>
          </div>
        )}

        {/* Skills */}
        {parsedData.skills.length > 0 && (
          <div>
            <h2 className="text-lg font-bold text-blue-600 border-b border-blue-600 pb-1 mb-3">
              CORE COMPETENCIES
            </h2>
            <div className="text-sm text-gray-700">
              {parsedData.skills.slice(0, 10).join(" • ")}
              {parsedData.skills.length > 10 &&
                ` • +${parsedData.skills.length - 10} more`}
            </div>
          </div>
        )}

        {/* Education */}
        {parsedData.education.length > 0 && (
          <div>
            <h2 className="text-lg font-bold text-blue-600 border-b border-blue-600 pb-1 mb-3 flex items-center gap-2">
              <GraduationCap className="h-4 w-4" />
              EDUCATION
            </h2>
            <div className="space-y-2">
              {parsedData.education.map((edu, index) => (
                <div key={index}>
                  <h3 className="font-semibold text-gray-800">{edu.degree}</h3>
                  <p className="text-sm italic text-gray-600">
                    {edu.institution} {edu.year && `• ${edu.year}`}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="border-t border-gray-200 pt-4 text-center text-xs text-gray-500 italic">
          Resume tailored for: {jobTitle || "Professional Opportunity"}
        </div>

        {/* Style features showcase */}
        <div className="bg-blue-50 p-4 rounded-lg">
          <h3 className="font-semibold text-blue-800 mb-2 flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Modern Resume Features
          </h3>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <Badge variant="outline" className="justify-start">
              ✓ Professional blue color scheme
            </Badge>
            <Badge variant="outline" className="justify-start">
              ✓ Clean Arial typography
            </Badge>
            <Badge variant="outline" className="justify-start">
              ✓ ATS-friendly format
            </Badge>
            <Badge variant="outline" className="justify-start">
              ✓ Section dividers & borders
            </Badge>
            <Badge variant="outline" className="justify-start">
              ✓ Optimized spacing & layout
            </Badge>
            <Badge variant="outline" className="justify-start">
              ✓ Tailoring footer note
            </Badge>
          </div>
        </div>
      </div>
    </div>
  );
}
