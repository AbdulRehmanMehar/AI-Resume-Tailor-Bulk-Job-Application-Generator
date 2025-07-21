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
    "Generate a tailored resume based on the provided job title, job description, and original resume.",
  parameters: {
    type: "object",
    required: [
      "full_name",
      "contact_information",
      "professional_summary",
      "skills",
      "work_experience",
      "education",
    ],
    properties: {
      full_name: {
        type: "string",
        description:
          "The candidate's full name, as it should appear on the resume.",
      },
      contact_information: {
        type: "object",
        required: ["email", "phone"],
        properties: {
          email: {
            type: "string",
            description: "The candidate's professional email address.",
          },
          phone: {
            type: "string",
            description:
              "The candidate's phone number, including country code if relevant.",
          },
          location: {
            type: "string",
            description: "The candidate's city and country (optional).",
          },
          linkedin: {
            type: "string",
            description: "URL to the candidate's LinkedIn profile (optional).",
          },
          website: {
            type: "string",
            description:
              "URL to the candidate's personal/professional website or portfolio (optional).",
          },
        },
        description: "Contact details for the candidate.",
      },
      professional_summary: {
        type: "string",
        description:
          "A concise, tailored summary highlighting the candidate's strengths and fit for the specific role.",
      },
      skills: {
        type: "array",
        description:
          "List of the most relevant skills, technologies, or competencies.",
        items: {
          type: "string",
          description:
            "A relevant skill or competency, matching job description keywords.",
        },
      },
      work_experience: {
        type: "array",
        description: "Work experience, starting with the most recent.",
        items: {
          type: "object",
          required: [
            "job_title",
            "company",
            "location",
            "start_date",
            "end_date",
            "responsibilities",
          ],
          properties: {
            job_title: {
              type: "string",
              description: "The candidate's official title in this position.",
            },
            company: {
              type: "string",
              description: "Name of the company/organization.",
            },
            location: {
              type: "string",
              description: "City and country (or remote).",
            },
            start_date: {
              type: "string",
              description: "Start date in YYYY-MM format.",
            },
            end_date: {
              type: ["string", "null"],
              description:
                "End date in YYYY-MM format, or null if currently employed.",
            },
            responsibilities: {
              type: "array",
              description:
                "List of achievements/responsibilities for this role.",
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
        description: "Education history, starting with the most recent.",
        items: {
          type: "object",
          required: [
            "degree",
            "institution",
            "location",
            "start_year",
            "end_year",
          ],
          properties: {
            degree: {
              type: "string",
              description:
                "Degree or qualification earned (e.g., B.Sc. Computer Science).",
            },
            institution: {
              type: "string",
              description: "Name of the school or university.",
            },
            location: {
              type: "string",
              description: "City and country.",
            },
            start_year: {
              type: "integer",
              description: "Year the degree program started.",
            },
            end_year: {
              type: ["integer", "null"],
              description:
                "Year graduated or expected to graduate. Null if ongoing.",
            },
            additional_details: {
              type: "string",
              description:
                "Any honors, GPA, relevant coursework, or thesis (optional).",
            },
          },
        },
      },
      certifications: {
        type: "array",
        description: "Relevant certifications (optional).",
        items: {
          type: "object",
          required: ["name", "issuer", "year"],
          properties: {
            name: {
              type: "string",
              description: "Name of the certification.",
            },
            issuer: {
              type: "string",
              description: "Issuing organization.",
            },
            year: {
              type: "integer",
              description: "Year the certification was obtained.",
            },
            credential_url: {
              type: "string",
              description: "URL to verify the certification (optional).",
            },
          },
        },
      },
      projects: {
        type: "array",
        description:
          "Significant projects demonstrating relevant skills (optional).",
        items: {
          type: "object",
          required: ["title", "description"],
          properties: {
            title: {
              type: "string",
              description: "Project name.",
            },
            description: {
              type: "string",
              description:
                "Description of the project and the candidate's role.",
            },
            url: {
              type: "string",
              description: "Link to the project or code repository (optional).",
            },
          },
        },
      },
      languages: {
        type: "array",
        description: "Languages spoken and proficiency (optional).",
        items: {
          type: "object",
          required: ["language", "proficiency"],
          properties: {
            language: {
              type: "string",
              description: "Language name (e.g., English, Spanish, Urdu).",
            },
            proficiency: {
              type: "string",
              description:
                "Proficiency level (Native, Fluent, Professional, Intermediate, Basic).",
            },
          },
        },
      },
      awards: {
        type: "array",
        description: "Awards or honors (optional).",
        items: {
          type: "object",
          required: ["title", "issuer", "year"],
          properties: {
            title: {
              type: "string",
              description: "Name of the award.",
            },
            issuer: {
              type: "string",
              description: "Issuing body or organization.",
            },
            year: {
              type: "integer",
              description: "Year received.",
            },
            description: {
              type: "string",
              description:
                "Short description of why the award was given (optional).",
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
    const { job_title, job_description, original_resume, additional_context } =
      body;

    // Validate required fields
    if (!job_title || !job_description || !original_resume) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Missing required fields: job_title, job_description, and original_resume are required",
        },
        { status: 400 }
      );
    }

    // Construct the prompt for resume tailoring
    const systemPrompt = `You are an expert resume writer and career coach. Your task is to create a tailored resume based on the provided job posting and original resume.

Key Instructions:
1. Analyze the job description to identify key requirements, skills, and qualifications
2. Use the original resume as the foundation, preserving factual information
3. Tailor the professional summary to highlight relevant experience for the specific role
4. Reorder and emphasize skills that match the job requirements
5. Rewrite work experience bullets to emphasize achievements and responsibilities relevant to the target role
6. Use action verbs and quantify results wherever possible
7. Maintain honesty - do not fabricate experience or skills
8. Ensure the resume is ATS-friendly with relevant keywords from the job description
9. Keep the resume concise and professional

Original Resume Context:
${original_resume}

Target Job Title: ${job_title}

Job Description:
${job_description}

${additional_context ? `Additional Context: ${additional_context}` : ""}

Generate a tailored resume that maximizes the candidate's chances of getting an interview for this specific role.`;

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
      "Generate a tailored resume based on job posting and original resume",
    required_fields: ["job_title", "job_description", "original_resume"],
    optional_fields: ["additional_context"],
    example_request: {
      job_title: "Senior Software Engineer",
      job_description:
        "We are looking for a senior software engineer with experience in React, Node.js, and cloud technologies...",
      original_resume: "Full resume content here...",
      additional_context: "Years of experience: 5-7, Language: English",
    },
    response_schema:
      "Returns structured resume data following the OpenAI function schema",
  });
}
