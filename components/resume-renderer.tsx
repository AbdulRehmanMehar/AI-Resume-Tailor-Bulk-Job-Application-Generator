"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Download,
  Eye,
  EyeOff,
  User,
  Mail,
  Phone,
  MapPin,
  Briefcase,
  GraduationCap,
  Award,
  Code,
  Copy,
  Check,
} from "lucide-react";

// Simple markdown to HTML conversion for display
function parseMarkdownForDisplay(text: string): string {
  return (
    text
      // Headers
      .replace(
        /^### (.*$)/gim,
        '<h3 class="text-lg font-semibold text-blue-700 mb-2 mt-4">$1</h3>'
      )
      .replace(
        /^## (.*$)/gim,
        '<h2 class="text-xl font-bold text-blue-800 mb-3 mt-6">$1</h2>'
      )
      .replace(
        /^# (.*$)/gim,
        '<h1 class="text-2xl font-bold text-blue-900 mb-4 mt-6">$1</h1>'
      )
      // Bold text
      .replace(
        /\*\*(.*?)\*\*/g,
        '<strong class="font-semibold text-gray-900">$1</strong>'
      )
      // Italic text
      .replace(/\*(.*?)\*/g, '<em class="italic">$1</em>')
      // Email and links
      .replace(
        /([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/g,
        '<a href="mailto:$1" class="text-blue-600 underline">$1</a>'
      )
      .replace(
        /https?:\/\/[^\s]+/g,
        '<a href="$&" class="text-blue-600 underline" target="_blank">$&</a>'
      )
      // Bullet points - convert to proper list structure
      .replace(/^[\*\-\•]\s(.+)$/gm, '<li class="ml-4 list-disc">$1</li>')
      // Phone numbers and emojis handling
      .replace(/📧\s*/g, '<span class="mr-2">📧</span>')
      .replace(/📞\s*/g, '<span class="mr-2">📞</span>')
      .replace(/🔗\s*/g, '<span class="mr-2">🔗</span>')
      .replace(/📍\s*/g, '<span class="mr-2">📍</span>')
      // Line breaks (convert double line breaks to paragraphs, single to br)
      .replace(/\n\s*\n/g, '</p><p class="mb-2">')
      .replace(/\n/g, "<br />")
  );
}

interface ResumeRendererProps {
  content: string;
  jobTitle?: string;
  onDownload?: () => void;
  className?: string;
}

interface ParsedResume {
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

export function ResumeRenderer({
  content,
  jobTitle,
  onDownload,
  className = "",
}: ResumeRendererProps) {
  const [isExpanded, setIsExpanded] = React.useState(false);
  const [copied, setCopied] = React.useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy text: ", err);
    }
  };

  // Parse the resume content into structured sections
  const parseResumeContent = (text: string): ParsedResume => {
    const lines = text.split("\n").filter((line) => line.trim());
    const parsed: ParsedResume = {
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

      // Detect markdown headers (# ## ###) or traditional section headers
      const isMarkdownHeader = line.startsWith("#");
      const headerText = isMarkdownHeader ? line.replace(/^#+\s*/, "") : line;

      // Detect section headers (common patterns)
      if (
        isMarkdownHeader ||
        headerText.match(
          /^(PERSONAL INFORMATION|CONTACT|PROFILE|SUMMARY|OBJECTIVE)/i
        ) ||
        headerText.match(
          /^(EXPERIENCE|WORK EXPERIENCE|EMPLOYMENT|PROFESSIONAL EXPERIENCE)/i
        ) ||
        headerText.match(/^(EDUCATION|ACADEMIC BACKGROUND)/i) ||
        headerText.match(/^(SKILLS|TECHNICAL SKILLS|CORE COMPETENCIES)/i) ||
        headerText.match(/^(PROJECTS|ACHIEVEMENTS|CERTIFICATIONS|AWARDS)/i) ||
        (!isMarkdownHeader &&
          headerText.length < 50 &&
          headerText.toUpperCase() === headerText &&
          headerText.includes(" "))
      ) {
        // Save previous section
        if (currentSection && currentContent.length > 0) {
          processSection(currentSection, currentContent.join("\n"), parsed);
        }

        currentSection = line;
        currentContent = [];
        continue;
      }

      currentContent.push(line);
    }

    // Process last section
    if (currentSection && currentContent.length > 0) {
      processSection(currentSection, currentContent.join("\n"), parsed);
    }

    // If no sections detected, treat as one large section
    if (parsed.sections.length === 0 && !parsed.personalInfo.name) {
      parsed.sections.push({
        title: "Resume Content",
        content: text,
      });
    }

    return parsed;
  };

  const processSection = (
    title: string,
    content: string,
    parsed: ParsedResume
  ) => {
    const lowerTitle = title.toLowerCase();

    if (
      lowerTitle.includes("personal") ||
      lowerTitle.includes("contact") ||
      lowerTitle.includes("profile")
    ) {
      // Extract personal information
      const emailMatch = content.match(/[\w.-]+@[\w.-]+\.\w+/);
      const phoneMatch = content.match(/[\+]?[\d\s\-\(\)]{10,}/);
      const nameMatch = content.split("\n")[0]?.trim();

      if (emailMatch) parsed.personalInfo.email = emailMatch[0];
      if (phoneMatch) parsed.personalInfo.phone = phoneMatch[0];
      if (nameMatch && nameMatch.length < 50)
        parsed.personalInfo.name = nameMatch;

      parsed.personalInfo.summary = content;
    } else if (
      lowerTitle.includes("experience") ||
      lowerTitle.includes("employment")
    ) {
      // Parse experience section
      const experiences = content
        .split(/(?=\n[A-Z][^a-z]*\n)/)
        .filter((exp) => exp.trim());
      experiences.forEach((exp) => {
        const lines = exp.trim().split("\n");
        if (lines.length >= 2) {
          parsed.experience.push({
            title: lines[0] || "",
            company: lines[1] || "",
            duration: lines[2] || "",
            description: lines.slice(3).join("\n") || "",
          });
        }
      });
    } else if (lowerTitle.includes("skill")) {
      // Parse skills
      const skills = content
        .split(/[,\n•\-]/)
        .map((s) => s.trim())
        .filter((s) => s && s.length > 1 && s.length < 30);
      parsed.skills.push(...skills);
    } else {
      // Generic section
      parsed.sections.push({
        title,
        content,
      });
    }
  };

  const parsedResume = React.useMemo(
    () => parseResumeContent(content),
    [content]
  );

  const PersonalInfoSection = () => {
    if (!parsedResume.personalInfo.name && !parsedResume.personalInfo.email)
      return null;

    return (
      <Card className="mb-6 border-l-4 border-l-blue-500">
        <CardHeader className="pb-3 bg-blue-50 dark:bg-blue-950">
          <div className="flex items-center gap-2">
            <User className="h-5 w-5 text-blue-600" />
            <CardTitle className="text-lg">Personal Information</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-3 pt-4">
          {parsedResume.personalInfo.name && (
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-gray-500" />
              <span className="font-semibold text-lg">
                {parsedResume.personalInfo.name}
              </span>
            </div>
          )}
          {parsedResume.personalInfo.email && (
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-gray-500" />
              <span>{parsedResume.personalInfo.email}</span>
            </div>
          )}
          {parsedResume.personalInfo.phone && (
            <div className="flex items-center gap-2">
              <Phone className="h-4 w-4 text-gray-500" />
              <span>{parsedResume.personalInfo.phone}</span>
            </div>
          )}
          {parsedResume.personalInfo.location && (
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-gray-500" />
              <span>{parsedResume.personalInfo.location}</span>
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  const ExperienceSection = () => {
    if (parsedResume.experience.length === 0) return null;

    return (
      <Card className="mb-6 border-l-4 border-l-green-500">
        <CardHeader className="pb-3 bg-green-50 dark:bg-green-950">
          <div className="flex items-center gap-2">
            <Briefcase className="h-5 w-5 text-green-600" />
            <CardTitle className="text-lg">Experience</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-6 pt-4">
          {parsedResume.experience.map((exp, index) => (
            <div
              key={index}
              className="border-l-2 border-green-200 pl-4 pb-4 last:pb-0"
            >
              <h4 className="font-semibold text-gray-900 text-lg">
                {exp.title}
              </h4>
              <p className="text-green-600 font-medium">{exp.company}</p>
              <p className="text-sm text-gray-500 mb-3">{exp.duration}</p>
              <div className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
                {exp.description}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    );
  };

  const SkillsSection = () => {
    if (parsedResume.skills.length === 0) return null;

    return (
      <Card className="mb-6 border-l-4 border-l-purple-500">
        <CardHeader className="pb-3 bg-purple-50 dark:bg-purple-950">
          <div className="flex items-center gap-2">
            <Code className="h-5 w-5 text-purple-600" />
            <CardTitle className="text-lg">Skills</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="pt-4">
          <div className="flex flex-wrap gap-2">
            {parsedResume.skills.slice(0, 20).map((skill, index) => (
              <Badge
                key={index}
                variant="secondary"
                className="bg-purple-100 text-purple-800 hover:bg-purple-200"
              >
                {skill}
              </Badge>
            ))}
            {parsedResume.skills.length > 20 && (
              <Badge variant="outline" className="text-gray-500">
                +{parsedResume.skills.length - 20} more
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  const GenericSections = () => {
    if (parsedResume.sections.length === 0) return null;

    return (
      <>
        {parsedResume.sections.map((section, index) => (
          <Card key={index} className="mb-6 border-l-4 border-l-orange-500">
            <CardHeader className="pb-3 bg-orange-50 dark:bg-orange-950">
              <div className="flex items-center gap-2">
                <Award className="h-5 w-5 text-orange-600" />
                <CardTitle className="text-lg">{section.title}</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
                {section.content}
              </div>
            </CardContent>
          </Card>
        ))}
      </>
    );
  };

  const truncatedContent =
    content.slice(0, 500) + (content.length > 500 ? "..." : "");

  return (
    <div
      className={`bg-white dark:bg-gray-800 rounded-lg shadow-lg ${className}`}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
            <User className="h-5 w-5 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              {jobTitle ? `Resume for ${jobTitle}` : "Generated Resume"}
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {content.length} characters • AI generated
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleCopy}>
            {copied ? (
              <>
                <Check className="mr-2 h-4 w-4 text-green-500" />
                Copied!
              </>
            ) : (
              <>
                <Copy className="mr-2 h-4 w-4" />
                Copy
              </>
            )}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            {isExpanded ? (
              <>
                <EyeOff className="mr-2 h-4 w-4" />
                Collapse
              </>
            ) : (
              <>
                <Eye className="mr-2 h-4 w-4" />
                Expand
              </>
            )}
          </Button>
          {onDownload && (
            <Button onClick={onDownload} size="sm">
              <Download className="mr-2 h-4 w-4" />
              Download
            </Button>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {isExpanded ? (
          <ScrollArea className="max-h-[80vh]">
            <div className="space-y-6">
              <PersonalInfoSection />
              <ExperienceSection />
              <SkillsSection />
              <GenericSections />
            </div>
          </ScrollArea>
        ) : (
          <div className="space-y-4">
            <div className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-6 rounded-lg border">
              <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-3 flex items-center gap-2">
                <Eye className="h-4 w-4" />
                Preview
              </h4>
              <div
                className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed prose prose-sm max-w-none"
                dangerouslySetInnerHTML={{
                  __html: `<p class="mb-2">${parseMarkdownForDisplay(
                    truncatedContent
                  )}</p>`,
                }}
              />
              {content.length > 500 && (
                <Button
                  variant="link"
                  size="sm"
                  onClick={() => setIsExpanded(true)}
                  className="p-0 h-auto mt-3 text-blue-600 hover:text-blue-800"
                >
                  Read full resume →
                </Button>
              )}
            </div>

            {/* Enhanced quick stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {parsedResume.experience.length > 0 && (
                <div className="flex items-center gap-2 p-3 bg-green-50 dark:bg-green-950 rounded-md border border-green-200 dark:border-green-800">
                  <Briefcase className="h-4 w-4 text-green-600" />
                  <span className="text-sm font-medium text-green-700 dark:text-green-300">
                    {parsedResume.experience.length} positions
                  </span>
                </div>
              )}
              {parsedResume.skills.length > 0 && (
                <div className="flex items-center gap-2 p-3 bg-purple-50 dark:bg-purple-950 rounded-md border border-purple-200 dark:border-purple-800">
                  <Code className="h-4 w-4 text-purple-600" />
                  <span className="text-sm font-medium text-purple-700 dark:text-purple-300">
                    {parsedResume.skills.length} skills
                  </span>
                </div>
              )}
              {parsedResume.sections.length > 0 && (
                <div className="flex items-center gap-2 p-3 bg-orange-50 dark:bg-orange-950 rounded-md border border-orange-200 dark:border-orange-800">
                  <Award className="h-4 w-4 text-orange-600" />
                  <span className="text-sm font-medium text-orange-700 dark:text-orange-300">
                    {parsedResume.sections.length} sections
                  </span>
                </div>
              )}
              <div className="flex items-center gap-2 p-3 bg-blue-50 dark:bg-blue-950 rounded-md border border-blue-200 dark:border-blue-800">
                <User className="h-4 w-4 text-blue-600" />
                <span className="text-sm font-medium text-blue-700 dark:text-blue-300">
                  {Math.round(content.length / 100)} chars
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
