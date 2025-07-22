import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Function schema for structured output
const GENERATE_TAILORED_RESUME_SCHEMA = {
  name: "generate_tailored_resume",
  description:
    "Generate a tailored resume based on the provided job title, job description, and original resume. Only include contact information and fields that are present in the original resume text.",
  parameters: {
    type: "object",
    required: [
      "full_name",
      "contact_information",
      "professional_summary",
      "skills",
      "work_experience",
      "education",
      "source_content_analysis",
    ],
    properties: {
      source_content_analysis: {
        type: "object",
        description:
          "Analysis of what information was found in the original resume text",
        required: [
          "has_email",
          "has_phone",
          "has_location",
          "has_linkedin",
          "has_github",
          "has_social_links",
          "has_relocation_willingness",
          "has_skills",
          "has_work_experience",
          "has_education",
          "has_certifications",
          "has_projects",
          "has_languages",
          "has_awards",
        ],
        properties: {
          has_email: {
            type: "boolean",
            description:
              "True if an email address was found in the original resume text",
          },
          has_phone: {
            type: "boolean",
            description:
              "True if a phone number was found in the original resume text",
          },
          has_location: {
            type: "boolean",
            description:
              "True if location/address information was found in the original resume text",
          },
          has_linkedin: {
            type: "boolean",
            description:
              "True if LinkedIn profile URL or username was found in the original resume text",
          },
          has_github: {
            type: "boolean",
            description:
              "True if GitHub profile URL or username was found in the original resume text",
          },
          has_social_links: {
            type: "boolean",
            description:
              "True if any other social media links (Twitter, portfolio website, etc.) were found in the original resume text",
          },
          has_relocation_willingness: {
            type: "boolean",
            description:
              "True if any mention of willingness to relocate was found in the original resume text",
          },
          has_skills: {
            type: "boolean",
            description:
              "True if a skills, competencies, or technical skills section was found in the original resume text",
          },
          has_work_experience: {
            type: "boolean",
            description:
              "True if work experience, employment history, or professional experience section was found in the original resume text",
          },
          has_education: {
            type: "boolean",
            description:
              "True if education, academic background, or qualifications section was found in the original resume text",
          },
          has_certifications: {
            type: "boolean",
            description:
              "True if certifications, licenses, or professional credentials section was found in the original resume text",
          },
          has_projects: {
            type: "boolean",
            description:
              "True if projects, portfolio, or key projects section was found in the original resume text",
          },
          has_languages: {
            type: "boolean",
            description:
              "True if languages, language skills, or multilingual abilities section was found in the original resume text",
          },
          has_awards: {
            type: "boolean",
            description:
              "True if awards, honors, achievements, or recognition section was found in the original resume text",
          },
        },
      },
      full_name: {
        type: "string",
        description:
          "The candidate's full name, exactly as it appears in the original resume.",
      },
      contact_information: {
        type: "object",
        required: [],
        properties: {
          email: {
            type: "string",
            description:
              "The candidate's email address. ONLY include if has_email is true in source_content_analysis.",
          },
          phone: {
            type: "string",
            description:
              "The candidate's phone number. ONLY include if has_phone is true in source_content_analysis.",
          },
          location: {
            type: "string",
            description:
              "The candidate's location. ONLY include if has_location is true in source_content_analysis.",
          },
          linkedin: {
            type: "string",
            description:
              "LinkedIn profile URL. ONLY include if has_linkedin is true in source_content_analysis.",
          },
          github: {
            type: "string",
            description:
              "GitHub profile URL. ONLY include if has_github is true in source_content_analysis.",
          },
          website: {
            type: "string",
            description:
              "Personal/professional website or portfolio URL. ONLY include if has_social_links is true in source_content_analysis.",
          },
          willing_to_relocate: {
            type: "boolean",
            description:
              "Willingness to relocate. ONLY include if has_relocation_willingness is true in source_content_analysis.",
          },
        },
        description:
          "Contact details for the candidate. Only include fields that were present in the original resume.",
      },
      professional_summary: {
        type: "string",
        description:
          "A concise, tailored summary highlighting the candidate's strengths and fit for the specific role. ALWAYS generate this section to align the candidate's skillset with the job requirements, regardless of whether it existed in the original resume.",
      },
      skills: {
        type: "array",
        description:
          "List of the most relevant skills, technologies, or competencies. ONLY include if has_skills is true in source_content_analysis.",
        items: {
          type: "string",
          description:
            "A relevant skill or competency, matching job description keywords.",
        },
      },
      work_experience: {
        type: "array",
        description:
          "Work experience, starting with the most recent. ONLY include if has_work_experience is true in source_content_analysis.",
        items: {
          type: "object",
          required: [],
          properties: {
            has_job_title: {
              type: "boolean",
              description:
                "True if job title is present for this work experience entry",
            },
            has_company: {
              type: "boolean",
              description:
                "True if company name is present for this work experience entry",
            },
            has_location: {
              type: "boolean",
              description:
                "True if location is present for this work experience entry",
            },
            has_start_date: {
              type: "boolean",
              description:
                "True if start date is present for this work experience entry",
            },
            has_end_date: {
              type: "boolean",
              description:
                "True if end date is present for this work experience entry",
            },
            has_responsibilities: {
              type: "boolean",
              description:
                "True if responsibilities/achievements are present for this work experience entry",
            },
            job_title: {
              type: "string",
              description:
                "The candidate's official title in this position. ONLY include if has_job_title is true.",
            },
            company: {
              type: "string",
              description:
                "Name of the company/organization. ONLY include if has_company is true.",
            },
            location: {
              type: "string",
              description:
                "City and country (or remote). ONLY include if has_location is true.",
            },
            start_date: {
              type: "string",
              description:
                "Start date in YYYY-MM format. ONLY include if has_start_date is true.",
            },
            end_date: {
              type: ["string", "null"],
              description:
                "End date in YYYY-MM format, or null if currently employed. ONLY include if has_end_date is true.",
            },
            responsibilities: {
              type: "array",
              description:
                "List of achievements/responsibilities for this role. ONLY include if has_responsibilities is true.",
              items: {
                type: "string",
                description:
                  "A bullet describing a key responsibility or achievement.",
              },
            },
          },
        },
      },
      education: {
        type: "array",
        description:
          "Education history, starting with the most recent. ONLY include if has_education is true in source_content_analysis.",
        items: {
          type: "object",
          required: [],
          properties: {
            has_degree: {
              type: "boolean",
              description:
                "True if degree information is present for this education entry",
            },
            has_institution: {
              type: "boolean",
              description:
                "True if institution name is present for this education entry",
            },
            has_location: {
              type: "boolean",
              description:
                "True if location is present for this education entry",
            },
            has_start_year: {
              type: "boolean",
              description:
                "True if start year is present for this education entry",
            },
            has_end_year: {
              type: "boolean",
              description:
                "True if end year is present for this education entry",
            },
            has_additional_details: {
              type: "boolean",
              description:
                "True if additional details are present for this education entry",
            },
            degree: {
              type: "string",
              description:
                "Degree or qualification earned (e.g., B.Sc. Computer Science). ONLY include if has_degree is true.",
            },
            institution: {
              type: "string",
              description:
                "Name of the school or university. ONLY include if has_institution is true.",
            },
            location: {
              type: "string",
              description:
                "City and country. ONLY include if has_location is true.",
            },
            start_year: {
              type: "integer",
              description:
                "Year the degree program started. ONLY include if has_start_year is true.",
            },
            end_year: {
              type: ["integer", "null"],
              description:
                "Year graduated or expected to graduate. Null if ongoing. ONLY include if has_end_year is true.",
            },
            additional_details: {
              type: "string",
              description:
                "Any honors, GPA, relevant coursework, or thesis (optional). ONLY include if has_additional_details is true.",
            },
          },
        },
      },
      certifications: {
        type: "array",
        description:
          "Relevant certifications. ONLY include if has_certifications is true in source_content_analysis.",
        items: {
          type: "object",
          required: [],
          properties: {
            has_name: {
              type: "boolean",
              description:
                "True if certification name is present for this certification entry",
            },
            has_issuer: {
              type: "boolean",
              description:
                "True if issuer is present for this certification entry",
            },
            has_year: {
              type: "boolean",
              description:
                "True if year is present for this certification entry",
            },
            has_credential_url: {
              type: "boolean",
              description:
                "True if credential URL is present for this certification entry",
            },
            name: {
              type: "string",
              description:
                "Name of the certification. ONLY include if has_name is true.",
            },
            issuer: {
              type: "string",
              description:
                "Issuing organization. ONLY include if has_issuer is true.",
            },
            year: {
              type: "integer",
              description:
                "Year the certification was obtained. ONLY include if has_year is true.",
            },
            credential_url: {
              type: "string",
              description:
                "URL to verify the certification (optional). ONLY include if has_credential_url is true.",
            },
          },
        },
      },
      projects: {
        type: "array",
        description:
          "Significant projects demonstrating relevant skills. ONLY include if has_projects is true in source_content_analysis.",
        items: {
          type: "object",
          required: [],
          properties: {
            has_title: {
              type: "boolean",
              description:
                "True if project title is present for this project entry",
            },
            has_description: {
              type: "boolean",
              description:
                "True if project description is present for this project entry",
            },
            has_url: {
              type: "boolean",
              description:
                "True if project URL is present for this project entry",
            },
            title: {
              type: "string",
              description: "Project name. ONLY include if has_title is true.",
            },
            description: {
              type: "string",
              description:
                "Description of the project and the candidate's role. ONLY include if has_description is true.",
            },
            url: {
              type: "string",
              description:
                "Link to the project or code repository (optional). ONLY include if has_url is true.",
            },
          },
        },
      },
      languages: {
        type: "array",
        description:
          "Languages spoken and proficiency. ONLY include if has_languages is true in source_content_analysis.",
        items: {
          type: "object",
          required: [],
          properties: {
            has_language: {
              type: "boolean",
              description:
                "True if language name is present for this language entry",
            },
            has_proficiency: {
              type: "boolean",
              description:
                "True if proficiency level is present for this language entry",
            },
            language: {
              type: "string",
              description:
                "Language name (e.g., English, Spanish, Urdu). ONLY include if has_language is true.",
            },
            proficiency: {
              type: "string",
              description:
                "Proficiency level (Native, Fluent, Professional, Intermediate, Basic). ONLY include if has_proficiency is true.",
            },
          },
        },
      },
      awards: {
        type: "array",
        description:
          "Awards or honors. ONLY include if has_awards is true in source_content_analysis.",
        items: {
          type: "object",
          required: [],
          properties: {
            has_title: {
              type: "boolean",
              description:
                "True if award title is present for this award entry",
            },
            has_issuer: {
              type: "boolean",
              description:
                "True if award issuer is present for this award entry",
            },
            has_year: {
              type: "boolean",
              description: "True if award year is present for this award entry",
            },
            has_description: {
              type: "boolean",
              description:
                "True if award description is present for this award entry",
            },
            title: {
              type: "string",
              description:
                "Name of the award. ONLY include if has_title is true.",
            },
            issuer: {
              type: "string",
              description:
                "Issuing body or organization. ONLY include if has_issuer is true.",
            },
            year: {
              type: "integer",
              description: "Year received. ONLY include if has_year is true.",
            },
            description: {
              type: "string",
              description:
                "Short description of why the award was given (optional). ONLY include if has_description is true.",
            },
          },
        },
      },
    },
  },
};

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      job_title,
      job_description,
      original_resume,
      resumeText,
      additional_context,
    } = body;

    // Use resumeText if provided, otherwise fall back to original_resume for backward compatibility
    const resumeContent = resumeText || original_resume;

    // Validate required fields
    if (!job_title || !job_description || !resumeContent) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Missing required fields: job_title, job_description, and resumeText (or original_resume) are required",
        },
        { status: 400 }
      );
    }

    // Construct the prompt for resume tailoring
    const systemPrompt = `You are an expert resume writer and career coach. Your task is to create a tailored resume based on the provided job posting and original resume.

CRITICAL INSTRUCTION - DATA PRESERVATION & SECTION ANALYSIS:
First, carefully analyze the original resume text to determine what sections and information are actually present. You must NEVER fabricate, assume, or create information that is not explicitly stated in the original resume.

Key Instructions:
1. Analyze the job description to identify key requirements, skills, and qualifications
2. Use the original resume as the foundation, preserving ALL factual information exactly as provided
3. CAREFULLY analyze what sections and information are present in the original resume:
   
   CONTACT INFORMATION:
   - Email address (look for @ symbols and email patterns)
   - Phone number (look for number patterns like (555) 123-4567)
   - Location/address (city, state, country information)
   - LinkedIn profile (linkedin.com URLs or mentions)
   - GitHub profile (github.com URLs or mentions)
   - Other social links or websites
   - Any mention of willingness to relocate

   RESUME SECTIONS:
   - Skills/competencies/technical skills section
   - Work experience/employment history/professional experience section
   - Education/academic background/qualifications section
   - Certifications/licenses/professional credentials section
   - Projects/portfolio/key projects section
   - Languages/language skills/multilingual abilities section
   - Awards/honors/achievements/recognition section

   PROFESSIONAL SUMMARY:
   - ALWAYS generate a professional summary that aligns the candidate's skillset with the job requirements
   - This section should be tailored regardless of whether it existed in the original resume
   - Focus on highlighting relevant skills, experience, and value proposition for the target role

   FOR EACH ENTRY IN ARRAY SECTIONS, ANALYZE SUB-FIELDS:
   
   WORK EXPERIENCE entries - check each entry for:
   - Job title/position
   - Company/organization name
   - Location/city
   - Start date
   - End date
   - Responsibilities/achievements list
   
   EDUCATION entries - check each entry for:
   - Degree/qualification
   - Institution/school name
   - Location/city
   - Start year
   - End year
   - Additional details (GPA, honors, coursework)
   
   CERTIFICATIONS entries - check each entry for:
   - Certification name
   - Issuing organization
   - Year obtained
   - Credential URL/verification link
   
   PROJECTS entries - check each entry for:
   - Project title/name
   - Project description
   - Project URL/repository link
   
   LANGUAGES entries - check each entry for:
   - Language name
   - Proficiency level
   
   AWARDS entries - check each entry for:
   - Award title/name
   - Issuing organization
   - Year received
   - Award description

4. In the source_content_analysis section, accurately report what sections and information were found
5. For array sections (work_experience, education, etc.), include has_{fieldname} flags within each object to indicate which sub-fields are present
6. ONLY include sections and fields that were present in the original resume
7. For sections that exist, tailor the content to highlight relevance for the specific role
8. Reorder and emphasize skills that match the job requirements
9. Rewrite work experience bullets to emphasize achievements and responsibilities relevant to the target role
10. Use action verbs and quantify results wherever possible
11. Maintain complete honesty - do not fabricate experience, skills, sections, or contact information
12. Ensure the resume is ATS-friendly with relevant keywords from the job description
13. Keep the resume concise and professional

REMEMBER: If a section is not in the original resume, do NOT include it in the output. The source_content_analysis should accurately reflect what sections were actually found. For each entry in array sections, only include the sub-fields that are actually present in the original data.

Original Resume Context:
${resumeContent}

Target Job Title: ${job_title}

Job Description:
${job_description}

${additional_context ? `Additional Context: ${additional_context}` : ""}

Generate a tailored resume that maximizes the candidate's chances of getting an interview for this specific role while preserving the integrity of the original information.`;

    // Make API call to OpenAI
    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: systemPrompt,
        },
        {
          role: "user",
          content:
            "Please generate a tailored resume based on the provided information.",
        },
      ],
      functions: [GENERATE_TAILORED_RESUME_SCHEMA],
      function_call: { name: "generate_tailored_resume" },
      temperature: 0.7,
      max_tokens: 4000,
    });

    // Extract the function call response
    const functionCall = completion.choices[0].message.function_call;

    if (!functionCall || !functionCall.arguments) {
      throw new Error("No function call response received from OpenAI");
    }

    const tailoredResume = JSON.parse(functionCall.arguments);

    // Always set has_professional_summary to true since we always generate it
    if (tailoredResume.source_content_analysis) {
      tailoredResume.source_content_analysis.has_professional_summary = true;
    }

    return NextResponse.json({
      success: true,
      data: {
        tailored_resume: tailoredResume,
        metadata: {
          job_title,
          generated_at: new Date().toISOString(),
          tokens_used: completion.usage?.total_tokens || 0,
        },
      },
    });
  } catch (error: any) {
    console.error("Error generating tailored resume:", error);

    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to generate tailored resume",
        details: error.response?.data || null,
      },
      { status: 500 }
    );
  }
}

// Optional: Add GET method for API documentation
export async function GET() {
  return NextResponse.json({
    endpoint: "/api/generate-tailored-resume",
    method: "POST",
    description:
      "Generate a tailored resume based on job posting and original resume with intelligent content analysis",
    required_fields: [
      "job_title",
      "job_description",
      "resumeText or original_resume",
    ],
    optional_fields: ["additional_context"],
    new_features: {
      source_content_analysis:
        "Analyzes what contact information and sections are present in the original resume",
      data_preservation:
        "Only includes contact fields that exist in the original resume text",
      fabrication_prevention:
        "Prevents AI from inventing missing email, phone, or other contact details",
      professional_summary_always_generated:
        "Professional summary is always generated to align candidate's skillset with job requirements",
    },
    example_request: {
      job_title: "Senior Software Engineer",
      job_description:
        "We are looking for a senior software engineer with experience in React, Node.js, and cloud technologies...",
      resumeText:
        "John Doe\nEmail: john@example.com\nPhone: (555) 123-4567\nLocation: San Francisco, CA\nLinkedIn: linkedin.com/in/johndoe\n\nEXPERIENCE\nSoftware Engineer | TechCorp | 2020-Present\n- Built web applications using React\n- Developed APIs with Node.js\n\nEDUCATION\nBS Computer Science | University of Technology | 2020",
      original_resume:
        "Full resume content here... (deprecated, use resumeText instead)",
      additional_context: "Years of experience: 5-7, Language: English",
    },
    response_schema: {
      description:
        "Returns structured resume data with source content analysis",
      fields: {
        source_content_analysis: {
          has_email: "boolean - true if email found in original resume",
          has_phone: "boolean - true if phone found in original resume",
          has_location: "boolean - true if location found in original resume",
          has_linkedin:
            "boolean - true if LinkedIn profile found in original resume",
          has_github:
            "boolean - true if GitHub profile found in original resume",
          has_social_links:
            "boolean - true if other social links found in original resume",
          has_relocation_willingness:
            "boolean - true if relocation willingness mentioned in original resume",
        },
        contact_information:
          "Only includes fields that were detected in the original resume",
        professional_summary:
          "Always generated to align candidate's skillset with job requirements",
      },
    },
    notes: {
      resumeText:
        "Preferred field for passing extracted text from uploaded files (DOCX, PDF, TXT)",
      original_resume: "Legacy field maintained for backward compatibility",
      data_integrity:
        "The AI will NEVER fabricate contact information not present in the original resume",
      content_analysis:
        "Each response includes analysis of what information was found in the source",
    },
  });
}
