import {
  Document,
  Paragraph,
  TextRun,
  AlignmentType,
  HeadingLevel,
  BorderStyle,
  Table,
  TableRow,
  TableCell,
  WidthType,
  ShadingType,
  UnderlineType,
  TabStopPosition,
  TabStopType,
  LevelFormat,
  convertInchesToTwip,
  ISectionOptions,
} from "docx";

// Define modern color scheme inspired by Canva templates
const COLORS = {
  primary: "2563EB", // Modern blue
  secondary: "64748B", // Slate gray
  accent: "0F172A", // Dark slate
  light: "F1F5F9", // Light gray
  white: "FFFFFF",
  text: "334155", // Dark gray for text
};

// Modern typography sizes (in half-points)
const FONT_SIZES = {
  name: 32, // 16pt
  header: 24, // 12pt
  subheader: 22, // 11pt
  body: 20, // 10pt
  small: 18, // 9pt
};

interface TailoredResumeData {
  full_name: string;
  contact_information: {
    email: string;
    phone: string;
    location?: string;
    linkedin?: string;
    website?: string;
  };
  professional_summary: string;
  skills: string[];
  work_experience: Array<{
    job_title: string;
    company: string;
    location: string;
    start_date: string;
    end_date: string | null;
    responsibilities: string[];
  }>;
  education: Array<{
    degree: string;
    institution: string;
    location: string;
    start_year: number;
    end_year: number | null;
    additional_details?: string;
  }>;
  certifications?: Array<{
    name: string;
    issuer: string;
    year: number;
    credential_url?: string;
  }>;
  projects?: Array<{
    title: string;
    description: string;
    url?: string;
  }>;
  languages?: Array<{
    language: string;
    proficiency: string;
  }>;
  awards?: Array<{
    title: string;
    issuer: string;
    year: number;
    description?: string;
  }>;
}

export function generateModernResumeDocx(
  resumeData: TailoredResumeData
): Document {
  const children: Paragraph[] = [];

  // Header Section with Name and Contact Info
  children.push(
    // Full Name - Large, bold, colored
    new Paragraph({
      children: [
        new TextRun({
          text: resumeData.full_name.toUpperCase(),
          size: FONT_SIZES.name,
          bold: true,
          color: COLORS.primary,
          font: "Calibri",
        }),
      ],
      alignment: AlignmentType.CENTER,
      spacing: { after: 200 },
    })
  );

  // Build contact information dynamically - only include available info
  const contactParts: TextRun[] = [];

  // Email is required
  if (resumeData.contact_information.email) {
    contactParts.push(
      new TextRun({
        text: resumeData.contact_information.email,
        size: FONT_SIZES.body,
        color: COLORS.text,
        font: "Calibri",
      })
    );
  }

  // Phone (optional)
  if (resumeData.contact_information.phone) {
    if (contactParts.length > 0) {
      contactParts.push(
        new TextRun({
          text: " • ",
          size: FONT_SIZES.body,
          color: COLORS.secondary,
          font: "Calibri",
        })
      );
    }
    contactParts.push(
      new TextRun({
        text: resumeData.contact_information.phone,
        size: FONT_SIZES.body,
        color: COLORS.text,
        font: "Calibri",
      })
    );
  }

  // Location (optional)
  if (resumeData.contact_information.location?.trim()) {
    if (contactParts.length > 0) {
      contactParts.push(
        new TextRun({
          text: " • ",
          size: FONT_SIZES.body,
          color: COLORS.secondary,
          font: "Calibri",
        })
      );
    }
    contactParts.push(
      new TextRun({
        text: resumeData.contact_information.location,
        size: FONT_SIZES.body,
        color: COLORS.text,
        font: "Calibri",
      })
    );
  }

  // LinkedIn (optional)
  if (resumeData.contact_information.linkedin?.trim()) {
    if (contactParts.length > 0) {
      contactParts.push(
        new TextRun({
          text: " • ",
          size: FONT_SIZES.body,
          color: COLORS.secondary,
          font: "Calibri",
        })
      );
    }
    contactParts.push(
      new TextRun({
        text: "LinkedIn",
        size: FONT_SIZES.body,
        color: COLORS.primary,
        font: "Calibri",
      })
    );
  }

  // Website/Portfolio (optional)
  if (resumeData.contact_information.website?.trim()) {
    if (contactParts.length > 0) {
      contactParts.push(
        new TextRun({
          text: " • ",
          size: FONT_SIZES.body,
          color: COLORS.secondary,
          font: "Calibri",
        })
      );
    }
    contactParts.push(
      new TextRun({
        text: "Portfolio",
        size: FONT_SIZES.body,
        color: COLORS.primary,
        font: "Calibri",
      })
    );
  }

  // Add contact information paragraph only if we have contact parts
  if (contactParts.length > 0) {
    children.push(
      new Paragraph({
        children: contactParts,
        alignment: AlignmentType.CENTER,
        spacing: { after: 300 },
      })
    );
  }

  // Professional Summary Section - only if content exists
  if (resumeData.professional_summary?.trim()) {
    children.push(
      createSectionHeader("PROFESSIONAL SUMMARY"),
      new Paragraph({
        children: [
          new TextRun({
            text: resumeData.professional_summary,
            size: FONT_SIZES.body,
            color: COLORS.text,
            font: "Calibri",
          }),
        ],
        alignment: AlignmentType.JUSTIFIED,
        spacing: { after: 240 },
        indent: {
          left: convertInchesToTwip(0.1),
          right: convertInchesToTwip(0.1),
        },
      })
    );
  }

  // Skills Section
  if (resumeData.skills && resumeData.skills.length > 0) {
    children.push(createSectionHeader("CORE COMPETENCIES"));

    // Create skills in a flowing format with bullet points
    const skillsText = resumeData.skills.join(" • ");
    children.push(
      new Paragraph({
        children: [
          new TextRun({
            text: skillsText,
            size: FONT_SIZES.body,
            color: COLORS.text,
            font: "Calibri",
          }),
        ],
        alignment: AlignmentType.JUSTIFIED,
        spacing: { after: 240 },
        indent: {
          left: convertInchesToTwip(0.1),
        },
      })
    );
  }

  // Work Experience Section
  if (resumeData.work_experience && resumeData.work_experience.length > 0) {
    // Filter out work experience entries that don't have required information
    const validWorkExperience = resumeData.work_experience.filter(
      (job) => job.job_title?.trim() && job.company?.trim()
    );

    if (validWorkExperience.length > 0) {
      children.push(createSectionHeader("PROFESSIONAL EXPERIENCE"));

      validWorkExperience.forEach((job, index) => {
        const dateRange = `${job.start_date || "Unknown"} - ${
          job.end_date || "Present"
        }`;

        // Job title and company
        children.push(
          new Paragraph({
            children: [
              new TextRun({
                text: job.job_title,
                size: FONT_SIZES.subheader,
                bold: true,
                color: COLORS.accent,
                font: "Calibri",
              }),
              new TextRun({
                text: ` | ${job.company}`,
                size: FONT_SIZES.subheader,
                color: COLORS.primary,
                font: "Calibri",
              }),
            ],
            spacing: { after: 100 },
            indent: {
              left: convertInchesToTwip(0.1),
            },
          })
        );

        // Location and date range - build dynamically
        const locationAndDateParts: string[] = [];
        if (job.location?.trim()) locationAndDateParts.push(job.location);
        locationAndDateParts.push(dateRange);

        children.push(
          new Paragraph({
            children: [
              new TextRun({
                text: locationAndDateParts.join(" | "),
                size: FONT_SIZES.small,
                color: COLORS.secondary,
                font: "Calibri",
                italics: true,
              }),
            ],
            spacing: { after: 120 },
            indent: {
              left: convertInchesToTwip(0.1),
            },
          })
        );

        // Responsibilities - only render if they exist and have content
        if (job.responsibilities && Array.isArray(job.responsibilities)) {
          const validResponsibilities = job.responsibilities.filter(
            (resp) => resp && typeof resp === "string" && resp.trim()
          );

          validResponsibilities.forEach((responsibility) => {
            children.push(
              new Paragraph({
                children: [
                  new TextRun({
                    text: "• ",
                    size: FONT_SIZES.body,
                    color: COLORS.primary,
                    font: "Calibri",
                    bold: true,
                  }),
                  new TextRun({
                    text: responsibility,
                    size: FONT_SIZES.body,
                    color: COLORS.text,
                    font: "Calibri",
                  }),
                ],
                spacing: { after: 100 },
                indent: {
                  left: convertInchesToTwip(0.3),
                  hanging: convertInchesToTwip(0.2),
                },
              })
            );
          });
        }

        // Add space between jobs
        if (index < validWorkExperience.length - 1) {
          children.push(
            new Paragraph({
              children: [new TextRun({ text: "", size: 1 })],
              spacing: { after: 180 },
            })
          );
        }
      });

      // Space after experience section
      children.push(
        new Paragraph({
          children: [new TextRun({ text: "", size: 1 })],
          spacing: { after: 240 },
        })
      );
    }
  } // Education Section - only if data exists
  if (resumeData.education && resumeData.education.length > 0) {
    children.push(createSectionHeader("EDUCATION"));

    resumeData.education.forEach((edu) => {
      const yearRange = `${edu.start_year} - ${edu.end_year || "Present"}`;

      // Only render if we have basic required information
      if (edu.degree?.trim() && edu.institution?.trim()) {
        children.push(
          new Paragraph({
            children: [
              new TextRun({
                text: edu.degree,
                size: FONT_SIZES.subheader,
                bold: true,
                color: COLORS.accent,
                font: "Calibri",
              }),
            ],
            spacing: { after: 100 },
            indent: {
              left: convertInchesToTwip(0.1),
            },
          })
        );

        // Build institution line dynamically
        const institutionParts: string[] = [];
        if (edu.institution?.trim()) institutionParts.push(edu.institution);
        if (edu.location?.trim()) institutionParts.push(edu.location);
        institutionParts.push(yearRange);

        children.push(
          new Paragraph({
            children: [
              new TextRun({
                text: institutionParts.join(" | "),
                size: FONT_SIZES.body,
                color: COLORS.secondary,
                font: "Calibri",
              }),
            ],
            spacing: { after: edu.additional_details?.trim() ? 100 : 180 },
            indent: {
              left: convertInchesToTwip(0.1),
            },
          })
        );

        // Additional details (optional)
        if (edu.additional_details?.trim()) {
          children.push(
            new Paragraph({
              children: [
                new TextRun({
                  text: edu.additional_details,
                  size: FONT_SIZES.body,
                  color: COLORS.text,
                  font: "Calibri",
                  italics: true,
                }),
              ],
              spacing: { after: 180 },
              indent: {
                left: convertInchesToTwip(0.1),
              },
            })
          );
        }
      }
    });
  } // Certifications Section - only if data exists and has required fields
  if (resumeData.certifications && resumeData.certifications.length > 0) {
    // Filter out certifications that don't have required information
    const validCertifications = resumeData.certifications.filter(
      (cert) => cert.name?.trim() && cert.issuer?.trim() && cert.year
    );

    if (validCertifications.length > 0) {
      children.push(createSectionHeader("CERTIFICATIONS"));

      validCertifications.forEach((cert) => {
        children.push(
          new Paragraph({
            children: [
              new TextRun({
                text: "• ",
                size: FONT_SIZES.body,
                color: COLORS.primary,
                font: "Calibri",
                bold: true,
              }),
              new TextRun({
                text: `${cert.name} - ${cert.issuer} (${cert.year})`,
                size: FONT_SIZES.body,
                color: COLORS.text,
                font: "Calibri",
              }),
            ],
            spacing: { after: 100 },
            indent: {
              left: convertInchesToTwip(0.3),
              hanging: convertInchesToTwip(0.2),
            },
          })
        );
      });

      children.push(
        new Paragraph({
          children: [new TextRun({ text: "", size: 1 })],
          spacing: { after: 240 },
        })
      );
    }
  }

  // Projects Section - only if data exists and has required fields
  if (resumeData.projects && resumeData.projects.length > 0) {
    // Filter out projects that don't have required information
    const validProjects = resumeData.projects.filter(
      (project) => project.title?.trim() && project.description?.trim()
    );

    if (validProjects.length > 0) {
      children.push(createSectionHeader("KEY PROJECTS"));

      validProjects.forEach((project) => {
        children.push(
          new Paragraph({
            children: [
              new TextRun({
                text: "• ",
                size: FONT_SIZES.body,
                color: COLORS.primary,
                font: "Calibri",
                bold: true,
              }),
              new TextRun({
                text: `${project.title}: `,
                size: FONT_SIZES.body,
                color: COLORS.accent,
                font: "Calibri",
                bold: true,
              }),
              new TextRun({
                text: project.description,
                size: FONT_SIZES.body,
                color: COLORS.text,
                font: "Calibri",
              }),
            ],
            spacing: { after: 100 },
            indent: {
              left: convertInchesToTwip(0.3),
              hanging: convertInchesToTwip(0.2),
            },
          })
        );
      });

      children.push(
        new Paragraph({
          children: [new TextRun({ text: "", size: 1 })],
          spacing: { after: 240 },
        })
      );
    }
  }

  // Languages Section - only if data exists and has required fields
  if (resumeData.languages && resumeData.languages.length > 0) {
    const validLanguages = resumeData.languages.filter(
      (lang) => lang.language?.trim() && lang.proficiency?.trim()
    );

    if (validLanguages.length > 0) {
      children.push(createSectionHeader("LANGUAGES"));

      validLanguages.forEach((lang) => {
        children.push(
          new Paragraph({
            children: [
              new TextRun({
                text: "• ",
                size: FONT_SIZES.body,
                color: COLORS.primary,
                font: "Calibri",
                bold: true,
              }),
              new TextRun({
                text: `${lang.language}: `,
                size: FONT_SIZES.body,
                color: COLORS.accent,
                font: "Calibri",
                bold: true,
              }),
              new TextRun({
                text: lang.proficiency,
                size: FONT_SIZES.body,
                color: COLORS.text,
                font: "Calibri",
              }),
            ],
            spacing: { after: 100 },
            indent: {
              left: convertInchesToTwip(0.3),
              hanging: convertInchesToTwip(0.2),
            },
          })
        );
      });

      children.push(
        new Paragraph({
          children: [new TextRun({ text: "", size: 1 })],
          spacing: { after: 240 },
        })
      );
    }
  }

  // Awards Section - only if data exists and has required fields
  if (resumeData.awards && resumeData.awards.length > 0) {
    const validAwards = resumeData.awards.filter(
      (award) => award.title?.trim() && award.issuer?.trim() && award.year
    );

    if (validAwards.length > 0) {
      children.push(createSectionHeader("AWARDS & HONORS"));

      validAwards.forEach((award) => {
        children.push(
          new Paragraph({
            children: [
              new TextRun({
                text: "• ",
                size: FONT_SIZES.body,
                color: COLORS.primary,
                font: "Calibri",
                bold: true,
              }),
              new TextRun({
                text: `${award.title} - ${award.issuer} (${award.year})`,
                size: FONT_SIZES.body,
                color: COLORS.accent,
                font: "Calibri",
                bold: true,
              }),
              ...(award.description?.trim()
                ? [
                    new TextRun({
                      text: `: ${award.description}`,
                      size: FONT_SIZES.body,
                      color: COLORS.text,
                      font: "Calibri",
                    }),
                  ]
                : []),
            ],
            spacing: { after: 100 },
            indent: {
              left: convertInchesToTwip(0.3),
              hanging: convertInchesToTwip(0.2),
            },
          })
        );
      });
    }
  }

  // Create the document with modern styling
  return new Document({
    styles: {
      default: {
        document: {
          run: {
            font: "Calibri",
            size: FONT_SIZES.body,
          },
        },
      },
    },
    sections: [
      {
        properties: {
          page: {
            margin: {
              top: convertInchesToTwip(0.75),
              right: convertInchesToTwip(0.75),
              bottom: convertInchesToTwip(0.75),
              left: convertInchesToTwip(0.75),
            },
          },
        },
        children: children,
      },
    ],
  });
}

// Helper function to create section headers with modern styling
function createSectionHeader(text: string): Paragraph {
  return new Paragraph({
    children: [
      new TextRun({
        text: text,
        size: FONT_SIZES.header,
        bold: true,
        color: COLORS.primary,
        font: "Calibri",
      }),
    ],
    spacing: { before: 300, after: 180 },
    border: {
      bottom: {
        color: COLORS.primary,
        space: 2,
        style: BorderStyle.SINGLE,
        size: 6,
      },
    },
  });
}

// Export function to generate and download the resume
export async function downloadTailoredResume(
  resumeData: TailoredResumeData,
  fileName: string = "tailored_resume.docx"
): Promise<void> {
  const doc = generateModernResumeDocx(resumeData);

  // Import Packer dynamically to avoid SSR issues
  const { Packer } = await import("docx");

  const blob = await Packer.toBlob(doc);

  // Create download link
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
