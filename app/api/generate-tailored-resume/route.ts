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
              "The candidate's exact email address as found in the original resume. ONLY include if has_email is true in source_content_analysis.",
          },
          phone: {
            type: "string",
            description:
              "The candidate's exact phone number as found in the original resume. ONLY include if has_phone is true in source_content_analysis.",
          },
          location: {
            type: "string",
            description:
              "The candidate's exact location as found in the original resume. ONLY include if has_location is true in source_content_analysis.",
          },
          linkedin: {
            type: "string",
            description:
              "The candidate's exact LinkedIn profile URL or username as found in the original resume. Include the full URL if provided (e.g., 'https://linkedin.com/in/username' or 'linkedin.com/in/username'). ONLY include if has_linkedin is true in source_content_analysis.",
          },
          github: {
            type: "string",
            description:
              "The candidate's exact GitHub profile URL or username as found in the original resume. Include the full URL if provided (e.g., 'https://github.com/username' or 'github.com/username'). ONLY include if has_github is true in source_content_analysis.",
          },
          website: {
            type: "string",
            description:
              "The candidate's exact personal/professional website or portfolio URL as found in the original resume. Include the full URL if provided. ONLY include if has_social_links is true in source_content_analysis.",
          },
          social_links: {
            type: "array",
            description:
              "Additional social media links found in the original resume (Twitter, Instagram, Behance, etc.). ONLY include if has_social_links is true in source_content_analysis.",
            items: {
              type: "object",
              required: [],
              properties: {
                platform: {
                  type: "string",
                  description:
                    "The name of the social media platform (e.g., Twitter, Instagram, Behance)",
                },
                url: {
                  type: "string",
                  description:
                    "The exact URL or username as found in the original resume",
                },
              },
            },
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
          "A strategically crafted 3-4 sentence professional summary that positions the candidate as the ideal fit for the target role. Must include relevant years of experience, 3-5 key qualifications that match job requirements, and industry-specific terminology from the job posting. This should read like a compelling elevator pitch tailored specifically for this position.",
      },
      skills: {
        type: "array",
        description:
          "Strategically ordered list of the most relevant skills, technologies, and competencies for the target role. Must be reordered to prioritize exact matches with job requirements, using terminology from the job description. Lead with the most critical skills for the position. ONLY include if has_skills is true in source_content_analysis.",
        items: {
          type: "string",
          description:
            "A highly relevant skill, technology, or competency that matches job description requirements. Use exact terminology from the job posting when possible.",
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
                "The candidate's job title, enhanced to better reflect their contributions and alignment with target role progression. May include descriptive elements (e.g., 'Software Developer (Full-Stack Applications)' or 'Marketing Assistant & Content Strategist') while maintaining core accuracy. ONLY include if has_job_title is true.",
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
                "COMPREHENSIVE list of job-tailored achievements and responsibilities. Each bullet must be strategically rewritten to emphasize relevance to the target role, using action verbs from the job description, quantified results, and highlighting transferable skills. Transform duty-based descriptions into achievement-focused statements. ONLY include if has_responsibilities is true.",
              items: {
                type: "string",
                description:
                  "A strategically crafted bullet point showcasing achievements, quantified results, and skills relevant to the target job. Use strong action verbs, include metrics when possible, and emphasize impact over duties.",
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
    const systemPrompt = `You are an expert resume writer and career coach specializing in ATS-optimized, job-targeted resume tailoring. Your task is to create a comprehensively tailored resume that maximizes interview potential for the specific target role.

CRITICAL INSTRUCTION - COMPREHENSIVE JOB TAILORING:
You must create a resume that strategically aligns every element with the target job while preserving factual accuracy. This goes beyond simple keyword matching - you need to reposition the candidate as the ideal fit for this specific role.

TAILORING STRATEGY:
1. DEEP JOB ANALYSIS: Extract key requirements, skills, technologies, responsibilities, and qualifications from the job description
2. STRATEGIC POSITIONING: Reframe the candidate's experience to highlight relevance to the target role
3. EXPERIENCE TRANSFORMATION: Rewrite ALL work experience bullets to emphasize achievements and responsibilities that directly relate to the target job
4. TITLE OPTIMIZATION: Enhance job titles to better reflect the candidate's actual contributions and alignment with career progression toward the target role
5. KEYWORD INTEGRATION: Seamlessly integrate job description keywords throughout all sections

MANDATORY TAILORING REQUIREMENTS:

WORK EXPERIENCE TRANSFORMATION:
- REWRITE every single bullet point to emphasize relevance to the target job
- Use action verbs that match the job description language
- Quantify achievements wherever possible (percentages, dollar amounts, team sizes, timeframes)
- Highlight transferable skills that apply to the target role
- Reorganize bullets to lead with the most relevant accomplishments
- Include technologies, methodologies, and approaches mentioned in the job posting
- Focus on RESULTS and IMPACT rather than just duties
- If the original role differs from target role, emphasize overlapping skills and responsibilities

JOB TITLE ENHANCEMENT:
- If the candidate's actual job title doesn't fully capture their contributions, you may enhance it with clarifying information
- Example: "Software Developer" → "Software Developer (Full-Stack Web Applications)"
- Example: "Marketing Assistant" → "Marketing Assistant & Content Strategist" 
- Example: "Project Coordinator" → "Technical Project Coordinator"
- Keep the core title honest but add descriptive elements that highlight relevant experience
- Ensure enhanced titles accurately reflect the person's actual responsibilities and skills

SKILLS REORDERING:
- Prioritize skills that directly match the job requirements
- Group related skills strategically
- Include both hard and soft skills mentioned in the job posting
- Use exact terminology from the job description when possible

PROFESSIONAL SUMMARY OPTIMIZATION:
- Create a compelling 3-4 sentence summary that positions the candidate as ideal for THIS specific role
- Include years of experience relevant to the target position
- Mention 3-5 key qualifications that directly match job requirements
- Use industry-specific language and terminology from the job posting

DATA PRESERVATION & ANALYSIS:
3. CAREFULLY analyze what sections and information are present in the original resume:
   
   CONTACT INFORMATION EXTRACTION - PRESERVE EXACT FORMATTING:
   - Email address: Look for @ symbols and email patterns. Extract the EXACT email address as written.
   - Phone number: Look for number patterns like (555) 123-4567, +1-555-123-4567, 555.123.4567. Extract the EXACT format as written.
   - Location/address: Extract city, state, country information exactly as written.
   - LinkedIn profile: Look for linkedin.com URLs, LinkedIn mentions, or profile references. Extract the EXACT URL or username as written (e.g., "https://linkedin.com/in/johndoe", "linkedin.com/in/johndoe", or "LinkedIn: johndoe").
   - GitHub profile: Look for github.com URLs, GitHub mentions, or profile references. Extract the EXACT URL or username as written (e.g., "https://github.com/johndoe", "github.com/johndoe", or "GitHub: johndoe").
   - Portfolio/Website: Look for any website URLs, portfolio links, or personal domains. Extract the EXACT URL as written.
   - Social links: Look for Twitter, Instagram, Behance, personal websites, or any other social media mentions. Extract as array of platform/url pairs with EXACT formatting.
   - Relocation willingness: Look for phrases like "willing to relocate", "open to relocation", etc.

   CRITICAL: Do NOT modify, format, or standardize contact information. Use the EXACT text as it appears in the original resume. If a LinkedIn profile is listed as "linkedin.com/in/johndoe", keep it exactly like that. If it's listed as "https://www.linkedin.com/in/johndoe", preserve the full URL. If it's listed as just "johndoe", keep it as "johndoe".

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

MANDATORY EXECUTION STEPS:
7. **TRANSFORM ALL WORK EXPERIENCE BULLETS**: Rewrite every single responsibility/achievement to highlight relevance for the target role. Use strong action verbs, quantify results, and emphasize transferable skills.
8. **ENHANCE JOB TITLES**: Thoughtfully enhance job titles to better reflect the candidate's contributions while maintaining honesty. Add descriptive elements that show progression toward the target role.
9. **STRATEGIC SKILL REORDERING**: Prioritize and reorder skills to match job requirements exactly. Lead with the most relevant technologies and competencies.
10. **KEYWORD INTEGRATION**: Seamlessly weave job description keywords throughout work experience, skills, and professional summary.
11. **RESULTS-FOCUSED LANGUAGE**: Transform duty-based descriptions into achievement-focused statements with measurable impact.
12. **INDUSTRY ALIGNMENT**: Use terminology and language patterns that match the target industry and role level.
13. **ATS OPTIMIZATION**: Ensure the resume contains sufficient keyword density and formatting for ATS systems.

EXAMPLES OF EFFECTIVE WORK EXPERIENCE TRANSFORMATION:

BEFORE (Generic): "Responsible for developing software applications"
AFTER (Tailored for Full-Stack Developer): "Architected and developed responsive web applications using React, Node.js, and PostgreSQL, serving 10,000+ daily active users with 99.9% uptime"

BEFORE (Generic): "Managed social media accounts"  
AFTER (Tailored for Digital Marketing Manager): "Strategically managed multi-platform social media campaigns, increasing engagement by 150% and driving $2M+ in revenue through targeted content strategies and data-driven optimization"

BEFORE (Generic): "Worked on team projects"
AFTER (Tailored for Project Manager): "Led cross-functional agile teams of 8+ developers and designers, delivering enterprise software solutions 20% ahead of schedule using Scrum methodology and stakeholder communication frameworks"

JOB TITLE ENHANCEMENT EXAMPLES:
BEFORE: "Developer" → AFTER: "Full-Stack Developer (React/Node.js Applications)"
BEFORE: "Analyst" → AFTER: "Business Intelligence Analyst & Data Visualization Specialist"  
BEFORE: "Coordinator" → AFTER: "Technical Project Coordinator & Stakeholder Liaison"

REMEMBER: Every element must serve the goal of positioning this candidate as the ideal hire for the specific target role. This is not just keyword stuffing - it's strategic repositioning based on genuine skills and experience.

REMEMBER: Every element must serve the goal of positioning this candidate as the ideal hire for the specific target role. This is not just keyword stuffing - it's strategic repositioning based on genuine skills and experience.

FINAL VALIDATION CHECKLIST:
✓ Every work experience bullet has been rewritten with target role relevance
✓ Job titles are enhanced to show career progression alignment  
✓ Skills are reordered to match job priority and terminology
✓ Professional summary reads like it was written specifically for this job
✓ Quantified achievements and metrics are included wherever possible
✓ Action verbs and language patterns match the job description
✓ All sections work together to tell a cohesive story of job readiness

Original Resume Context:
${resumeContent}

Target Job Title: ${job_title}

Job Description:
${job_description}

${
  additional_context
    ? `Additional Context: ${JSON.stringify(additional_context)}`
    : ""
}

EXECUTE THE COMPREHENSIVE TAILORING STRATEGY: Generate a resume that transforms this candidate into the ideal applicant for this specific role through strategic repositioning, enhanced bullet points, and keyword optimization while maintaining complete factual accuracy. Please ensure following while generating the resume:

(You are an expert resume writer and prompt engineer. Your task is to tailor an existing resume for a specific job application, making sure it is optimized for Applicant Tracking Systems (ATS) and stands out to recruiters. Follow these steps:
Tailor my resume for the following job which I paste its descriptions
Use ATS-friendly formatting and align it with the job description
Match the job title in the header, integrate keywords from the description, Match the job description in the work experience job title, include a professional summary, core competencies, categorized technical skills, and four experience entries with 5–7 bullet points each and a ‘Selected project highlights and Awards and recognition and soft skills’
Add achievements where possible
Keep formatting consistent with my past resumes
Output ONLY the revised resume, ready to be copied into a document or application form.
Universal Tailoring Prompt for Resume Work Experience:
"Tailor the work experience section of the resume to align with any provided job description. For each position in the work experience:
Change the job title to reflect relevant terminology and keywords from the job description.
Update the bullet points to emphasize relevant experiences, quantifiable achievements, and skills that match the responsibilities and requirements outlined in the job description.
Job Description: [Insert job description details here]
All information should remain truthful, based on the original resume—do not invent degrees, jobs or certifications. Do not include certifications not in original resume or languages.)
`;

    // Helper function for making OpenAI API calls with retry logic
    const makeOpenAICallWithRetry = async (
      maxRetries = 3,
      baseDelay = 1000
    ) => {
      for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
          console.log(
            `Attempt ${attempt}/${maxRetries} - Making OpenAI API call...`
          );

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
                  // "Please generate a tailored resume based on the provided information.",
                  `
You are an expert resume writer and prompt engineer. Your task is to tailor an existing resume for a specific job application, making sure it is optimized for Applicant Tracking Systems (ATS) and stands out to recruiters. Follow these steps:
Tailor my resume for the following job which I paste its descriptions
Use ATS-friendly formatting and align it with the job description
Match the job title in the header, integrate keywords from the description, Match the job description in the work experience job title, include a professional summary, core competencies, categorized technical skills, and four experience entries with 5–7 bullet points each and a ‘Selected project highlights and Awards and recognition and soft skills’
Add achievements where possible
Keep formatting consistent with my past resumes
Output ONLY the revised resume, ready to be copied into a document or application form.
Universal Tailoring Prompt for Resume Work Experience:
"Tailor the work experience section of the resume to align with any provided job description. For each position in the work experience:
Change the job title to reflect relevant terminology and keywords from the job description.
Update the bullet points to emphasize relevant experiences, quantifiable achievements, and skills that match the responsibilities and requirements outlined in the job description.
Job Description: [Insert job description details here]
All information should remain truthful, based on the original resume—do not invent degrees, jobs or certifications. Do not include certifications not in original resume or languages.
                  `,
              },
            ],
            functions: [GENERATE_TAILORED_RESUME_SCHEMA],
            function_call: { name: "generate_tailored_resume" },
            temperature: 0.2,
            max_tokens: 16384,
          });

          console.log(`OpenAI API call successful on attempt ${attempt}`);
          return completion;
        } catch (error: any) {
          console.error(`Attempt ${attempt} failed:`, error.message);

          // Handle rate limit errors (429)
          if (error.status === 429) {
            if (attempt === maxRetries) {
              throw new Error(
                `Rate limit exceeded after ${maxRetries} attempts. Please try again later.`
              );
            }

            // Extract retry delay from headers
            let waitMs = baseDelay * Math.pow(2, attempt - 1); // Exponential backoff

            if (error.headers && error.headers["retry-after"]) {
              // Use the exact retry-after value if provided
              waitMs = parseFloat(error.headers["retry-after"]) * 1000;
            } else if (error.headers && error.headers["retry-after-ms"]) {
              // Some APIs provide retry-after-ms
              waitMs = parseFloat(error.headers["retry-after-ms"]);
            }

            console.log(
              `Rate limit hit. Waiting ${waitMs}ms before retry ${
                attempt + 1
              }...`
            );
            await new Promise((resolve) => setTimeout(resolve, waitMs));
            continue;
          }

          // Handle other OpenAI errors
          if (error.status === 400) {
            throw new Error(`Invalid request: ${error.message}`);
          } else if (error.status === 401) {
            throw new Error(
              `Authentication failed: Please check your OpenAI API key`
            );
          } else if (error.status === 403) {
            throw new Error(`Access forbidden: Insufficient permissions`);
          } else if (error.status === 500) {
            // Server errors - retry with exponential backoff
            if (attempt === maxRetries) {
              throw new Error(
                `OpenAI server error after ${maxRetries} attempts: ${error.message}`
              );
            }

            const waitMs = baseDelay * Math.pow(2, attempt - 1);
            console.log(
              `Server error. Waiting ${waitMs}ms before retry ${attempt + 1}...`
            );
            await new Promise((resolve) => setTimeout(resolve, waitMs));
            continue;
          } else if (error.status >= 500) {
            // Other server errors
            if (attempt === maxRetries) {
              throw new Error(
                `Server error after ${maxRetries} attempts: ${error.message}`
              );
            }

            const waitMs = baseDelay * Math.pow(2, attempt - 1);
            console.log(
              `Server error ${error.status}. Waiting ${waitMs}ms before retry ${
                attempt + 1
              }...`
            );
            await new Promise((resolve) => setTimeout(resolve, waitMs));
            continue;
          }

          // For all other errors, don't retry
          throw error;
        }
      }

      throw new Error(`Failed after ${maxRetries} attempts`);
    };

    // Make API call to OpenAI with retry logic
    const completion = await makeOpenAICallWithRetry();

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

    // Handle specific error types with better user messaging
    let errorMessage = "Failed to generate tailored resume";
    let statusCode = 500;

    if (error.message.includes("Rate limit exceeded")) {
      errorMessage =
        "API rate limit exceeded. Please wait a moment and try again.";
      statusCode = 429;
    } else if (error.message.includes("Authentication failed")) {
      errorMessage = "API authentication error. Please contact support.";
      statusCode = 401;
    } else if (error.message.includes("Invalid request")) {
      errorMessage = "Invalid request format. Please check your input data.";
      statusCode = 400;
    } else if (error.message.includes("Server error")) {
      errorMessage =
        "Temporary server error. Please try again in a few minutes.";
      statusCode = 502;
    } else if (error.message) {
      errorMessage = error.message;
    }

    return NextResponse.json(
      {
        success: false,
        error: errorMessage,
        details:
          process.env.NODE_ENV === "development"
            ? {
                originalError: error.message,
                stack: error.stack,
                response: error.response?.data,
              }
            : null,
        retryable:
          error.message.includes("Rate limit") ||
          error.message.includes("Server error"),
      },
      { status: statusCode }
    );
  }
}

// Optional: Add GET method for API documentation
export async function GET() {
  return NextResponse.json({
    endpoint: "/api/generate-tailored-resume",
    method: "POST",
    description:
      "Generate a comprehensively tailored resume with strategic job-specific repositioning, enhanced work experience bullets, optimized job titles, and ATS-friendly keyword integration",
    required_fields: [
      "job_title",
      "job_description",
      "resumeText or original_resume",
    ],
    optional_fields: ["additional_context"],
    new_features: {
      comprehensive_tailoring:
        "Every work experience bullet is strategically rewritten for maximum job relevance",
      job_title_enhancement:
        "Job titles are thoughtfully enhanced to show career progression alignment",
      strategic_skill_reordering:
        "Skills prioritized and reordered to match exact job requirements and terminology",
      quantified_achievements:
        "Focus on measurable impact and results rather than just job duties",
      keyword_optimization:
        "Seamless integration of job description keywords throughout all sections",
      ats_optimization:
        "Resume structured for maximum ATS compatibility and keyword density",
      source_content_analysis:
        "Analyzes what contact information and sections are present in the original resume",
      data_preservation:
        "Only includes contact fields that exist in the original resume text",
      fabrication_prevention:
        "Prevents AI from inventing missing email, phone, or other contact details",
      professional_summary_optimization:
        "Professional summary crafted as compelling elevator pitch for specific target role",
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
