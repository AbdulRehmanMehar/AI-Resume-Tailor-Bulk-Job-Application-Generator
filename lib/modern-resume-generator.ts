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
  source_content_analysis: {
    has_email: boolean;
    has_phone: boolean;
    has_location: boolean;
    has_linkedin: boolean;
    has_github: boolean;
    has_social_links: boolean;
    has_relocation_willingness: boolean;
    has_professional_summary?: boolean; // Always true, but kept for compatibility
    has_skills: boolean;
    has_work_experience: boolean;
    has_education: boolean;
    has_certifications: boolean;
    has_projects: boolean;
    has_languages: boolean;
    has_awards: boolean;
  };
  contact_information: {
    email?: string;
    phone?: string;
    location?: string;
    linkedin?: string;
    github?: string;
    website?: string;
    willing_to_relocate?: boolean;
  };
  professional_summary: string;
  skills: string[];
  work_experience: Array<{
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
  education: Array<{
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

  // Build contact information dynamically - only include info that was in original resume
  const contactParts: TextRun[] = [];

  // Email - only if detected in original resume
  if (
    resumeData.source_content_analysis.has_email &&
    resumeData.contact_information.email
  ) {
    contactParts.push(
      new TextRun({
        text: resumeData.contact_information.email,
        size: FONT_SIZES.body,
        color: COLORS.text,
        font: "Calibri",
      })
    );
  }

  // Phone - only if detected in original resume
  if (
    resumeData.source_content_analysis.has_phone &&
    resumeData.contact_information.phone
  ) {
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

  // Location - only if detected in original resume
  if (
    resumeData.source_content_analysis.has_location &&
    resumeData.contact_information.location?.trim()
  ) {
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

  // LinkedIn - only if detected in original resume
  if (
    resumeData.source_content_analysis.has_linkedin &&
    resumeData.contact_information.linkedin?.trim()
  ) {
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

  // GitHub - only if detected in original resume
  if (
    resumeData.source_content_analysis.has_github &&
    resumeData.contact_information.github?.trim()
  ) {
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
        text: "GitHub",
        size: FONT_SIZES.body,
        color: COLORS.primary,
        font: "Calibri",
      })
    );
  }

  // Website/Portfolio - only if social links detected in original resume
  if (
    resumeData.source_content_analysis.has_social_links &&
    resumeData.contact_information.website?.trim()
  ) {
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

  // Relocation willingness - only if mentioned in original resume
  if (
    resumeData.source_content_analysis.has_relocation_willingness &&
    resumeData.contact_information.willing_to_relocate
  ) {
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
        text: "Open to relocation",
        size: FONT_SIZES.body,
        color: COLORS.accent,
        font: "Calibri",
        italics: true,
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

  // Professional Summary Section - always included since we always generate it
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

  // Skills Section - only if detected in original resume
  if (
    resumeData.source_content_analysis.has_skills &&
    resumeData.skills &&
    resumeData.skills.length > 0
  ) {
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

  // Work Experience Section - only if detected in original resume
  if (
    resumeData.source_content_analysis.has_work_experience &&
    resumeData.work_experience &&
    resumeData.work_experience.length > 0
  ) {
    // Filter out work experience entries that don't have required information
    const validWorkExperience = resumeData.work_experience.filter(
      (job) =>
        (job.has_job_title && job.job_title?.trim()) ||
        (job.has_company && job.company?.trim())
    );

    if (validWorkExperience.length > 0) {
      children.push(createSectionHeader("PROFESSIONAL EXPERIENCE"));

      validWorkExperience.forEach((job, index) => {
        // Build date range - only if dates are available
        let dateRange = "";
        if (job.has_start_date && job.start_date) {
          dateRange = job.start_date;
          if (job.has_end_date) {
            dateRange += ` - ${job.end_date || "Present"}`;
          }
        } else if (job.has_end_date && job.end_date) {
          dateRange = `Until ${job.end_date}`;
        }

        // Build job title and company line - only include what's available
        const titleParts: TextRun[] = [];

        if (job.has_job_title && job.job_title?.trim()) {
          titleParts.push(
            new TextRun({
              text: job.job_title,
              size: FONT_SIZES.subheader,
              bold: true,
              color: COLORS.accent,
              font: "Calibri",
            })
          );
        }

        if (job.has_company && job.company?.trim()) {
          if (titleParts.length > 0) {
            titleParts.push(
              new TextRun({
                text: " | ",
                size: FONT_SIZES.subheader,
                color: COLORS.secondary,
                font: "Calibri",
              })
            );
          }
          titleParts.push(
            new TextRun({
              text: job.company,
              size: FONT_SIZES.subheader,
              color: COLORS.primary,
              font: "Calibri",
            })
          );
        }

        // Only add title/company line if we have at least one of them
        if (titleParts.length > 0) {
          children.push(
            new Paragraph({
              children: titleParts,
              spacing: { after: 100 },
              indent: {
                left: convertInchesToTwip(0.1),
              },
            })
          );
        }

        // Location and date range - build dynamically based on what's available
        const locationAndDateParts: string[] = [];
        if (job.has_location && job.location?.trim()) {
          locationAndDateParts.push(job.location);
        }
        if (dateRange) {
          locationAndDateParts.push(dateRange);
        }

        if (locationAndDateParts.length > 0) {
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
        }

        // Responsibilities - only render if flag is true and data exists
        if (
          job.has_responsibilities &&
          job.responsibilities &&
          Array.isArray(job.responsibilities)
        ) {
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
  }

  // Education Section - only if data exists AND detected in original resume
  if (
    resumeData.source_content_analysis.has_education &&
    resumeData.education &&
    resumeData.education.length > 0
  ) {
    children.push(createSectionHeader("EDUCATION"));

    resumeData.education.forEach((edu) => {
      // Only render if we have basic required information
      if (
        (edu.has_degree && edu.degree?.trim()) ||
        (edu.has_institution && edu.institution?.trim())
      ) {
        // Degree line - only if available
        if (edu.has_degree && edu.degree?.trim()) {
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
        }

        // Build institution line dynamically based on available fields
        const institutionParts: string[] = [];
        if (edu.has_institution && edu.institution?.trim()) {
          institutionParts.push(edu.institution);
        }
        if (edu.has_location && edu.location?.trim()) {
          institutionParts.push(edu.location);
        }

        // Year range - only if available
        if (edu.has_start_year && edu.start_year) {
          const yearRange =
            edu.has_end_year && edu.end_year
              ? `${edu.start_year} - ${edu.end_year}`
              : edu.has_end_year
              ? `${edu.start_year} - Present`
              : `${edu.start_year}`;
          institutionParts.push(yearRange);
        } else if (edu.has_end_year && edu.end_year) {
          institutionParts.push(`Graduated ${edu.end_year}`);
        }

        if (institutionParts.length > 0) {
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
              spacing: {
                after:
                  edu.has_additional_details && edu.additional_details?.trim()
                    ? 100
                    : 180,
              },
              indent: {
                left: convertInchesToTwip(0.1),
              },
            })
          );
        }

        // Additional details - only if flag is true and content exists
        if (edu.has_additional_details && edu.additional_details?.trim()) {
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
  }

  // Certifications Section - only if data exists and detected in original resume
  if (
    resumeData.source_content_analysis.has_certifications &&
    resumeData.certifications &&
    resumeData.certifications.length > 0
  ) {
    // Filter out certifications that don't have required information
    const validCertifications = resumeData.certifications.filter(
      (cert) =>
        (cert.has_name && cert.name?.trim()) ||
        (cert.has_issuer && cert.issuer?.trim()) ||
        (cert.has_year && cert.year)
    );

    if (validCertifications.length > 0) {
      children.push(createSectionHeader("CERTIFICATIONS"));

      validCertifications.forEach((cert) => {
        // Build certification text dynamically based on available fields
        const certParts: string[] = [];

        if (cert.has_name && cert.name?.trim()) {
          certParts.push(cert.name);
        }

        if (cert.has_issuer && cert.issuer?.trim()) {
          certParts.push(cert.issuer);
        }

        if (cert.has_year && cert.year) {
          certParts.push(`(${cert.year})`);
        }

        if (certParts.length > 0) {
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
                  text: certParts.join(" - "),
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
        }
      });

      children.push(
        new Paragraph({
          children: [new TextRun({ text: "", size: 1 })],
          spacing: { after: 240 },
        })
      );
    }
  }

  // Projects Section - only if data exists and detected in original resume
  if (
    resumeData.source_content_analysis.has_projects &&
    resumeData.projects &&
    resumeData.projects.length > 0
  ) {
    // Filter out projects that don't have required information
    const validProjects = resumeData.projects.filter(
      (project) =>
        (project.has_title && project.title?.trim()) ||
        (project.has_description && project.description?.trim())
    );

    if (validProjects.length > 0) {
      children.push(createSectionHeader("KEY PROJECTS"));

      validProjects.forEach((project) => {
        const projectParts: TextRun[] = [];

        // Bullet point
        projectParts.push(
          new TextRun({
            text: "• ",
            size: FONT_SIZES.body,
            color: COLORS.primary,
            font: "Calibri",
            bold: true,
          })
        );

        // Project title - only if available
        if (project.has_title && project.title?.trim()) {
          projectParts.push(
            new TextRun({
              text: `${project.title}`,
              size: FONT_SIZES.body,
              color: COLORS.accent,
              font: "Calibri",
              bold: true,
            })
          );

          // Add separator if we also have description
          if (project.has_description && project.description?.trim()) {
            projectParts.push(
              new TextRun({
                text: ": ",
                size: FONT_SIZES.body,
                color: COLORS.accent,
                font: "Calibri",
                bold: true,
              })
            );
          }
        }

        // Project description - only if available
        if (project.has_description && project.description?.trim()) {
          projectParts.push(
            new TextRun({
              text: project.description,
              size: FONT_SIZES.body,
              color: COLORS.text,
              font: "Calibri",
            })
          );
        }

        if (projectParts.length > 1) {
          // More than just the bullet
          children.push(
            new Paragraph({
              children: projectParts,
              spacing: { after: 100 },
              indent: {
                left: convertInchesToTwip(0.3),
                hanging: convertInchesToTwip(0.2),
              },
            })
          );
        }
      });

      children.push(
        new Paragraph({
          children: [new TextRun({ text: "", size: 1 })],
          spacing: { after: 240 },
        })
      );
    }
  }

  // Languages Section - only if data exists and detected in original resume
  if (
    resumeData.source_content_analysis.has_languages &&
    resumeData.languages &&
    resumeData.languages.length > 0
  ) {
    const validLanguages = resumeData.languages.filter(
      (lang) =>
        (lang.has_language && lang.language?.trim()) ||
        (lang.has_proficiency && lang.proficiency?.trim())
    );

    if (validLanguages.length > 0) {
      children.push(createSectionHeader("LANGUAGES"));

      validLanguages.forEach((lang) => {
        const langParts: TextRun[] = [];

        // Bullet point
        langParts.push(
          new TextRun({
            text: "• ",
            size: FONT_SIZES.body,
            color: COLORS.primary,
            font: "Calibri",
            bold: true,
          })
        );

        // Language name - only if available
        if (lang.has_language && lang.language?.trim()) {
          langParts.push(
            new TextRun({
              text: lang.language,
              size: FONT_SIZES.body,
              color: COLORS.accent,
              font: "Calibri",
              bold: true,
            })
          );

          // Add separator if we also have proficiency
          if (lang.has_proficiency && lang.proficiency?.trim()) {
            langParts.push(
              new TextRun({
                text: ": ",
                size: FONT_SIZES.body,
                color: COLORS.accent,
                font: "Calibri",
                bold: true,
              })
            );
          }
        }

        // Proficiency - only if available
        if (lang.has_proficiency && lang.proficiency?.trim()) {
          langParts.push(
            new TextRun({
              text: lang.proficiency,
              size: FONT_SIZES.body,
              color: COLORS.text,
              font: "Calibri",
            })
          );
        }

        if (langParts.length > 1) {
          // More than just the bullet
          children.push(
            new Paragraph({
              children: langParts,
              spacing: { after: 100 },
              indent: {
                left: convertInchesToTwip(0.3),
                hanging: convertInchesToTwip(0.2),
              },
            })
          );
        }
      });

      children.push(
        new Paragraph({
          children: [new TextRun({ text: "", size: 1 })],
          spacing: { after: 240 },
        })
      );
    }
  }

  // Awards Section - only if data exists and detected in original resume
  if (
    resumeData.source_content_analysis.has_awards &&
    resumeData.awards &&
    resumeData.awards.length > 0
  ) {
    const validAwards = resumeData.awards.filter(
      (award) =>
        (award.has_title && award.title?.trim()) ||
        (award.has_issuer && award.issuer?.trim()) ||
        (award.has_year && award.year)
    );

    if (validAwards.length > 0) {
      children.push(createSectionHeader("AWARDS & HONORS"));

      validAwards.forEach((award) => {
        const awardParts: TextRun[] = [];

        // Bullet point
        awardParts.push(
          new TextRun({
            text: "• ",
            size: FONT_SIZES.body,
            color: COLORS.primary,
            font: "Calibri",
            bold: true,
          })
        );

        // Build the main award line with available information
        const mainParts: string[] = [];
        if (award.has_title && award.title?.trim()) {
          mainParts.push(award.title);
        }
        if (award.has_issuer && award.issuer?.trim()) {
          mainParts.push(award.issuer);
        }
        if (award.has_year && award.year) {
          mainParts.push(`(${award.year})`);
        }

        if (mainParts.length > 0) {
          awardParts.push(
            new TextRun({
              text: mainParts.join(" - "),
              size: FONT_SIZES.body,
              color: COLORS.accent,
              font: "Calibri",
              bold: true,
            })
          );
        }

        // Award description - only if available
        if (award.has_description && award.description?.trim()) {
          awardParts.push(
            new TextRun({
              text: `: ${award.description}`,
              size: FONT_SIZES.body,
              color: COLORS.text,
              font: "Calibri",
            })
          );
        }

        if (awardParts.length > 1) {
          // More than just the bullet
          children.push(
            new Paragraph({
              children: awardParts,
              spacing: { after: 100 },
              indent: {
                left: convertInchesToTwip(0.3),
                hanging: convertInchesToTwip(0.2),
              },
            })
          );
        }
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
