import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const { company_url, context = "" } = await request.json();

    if (!company_url) {
      return NextResponse.json(
        { error: "Company URL is required" },
        { status: 400 }
      );
    }

    // Create the assistant message with function calling
    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content:
            "You are an expert recruiter and job market analyst. Generate modern, concise job titles suitable for technical roles at companies.",
        },
        {
          role: "user",
          content: `Generate a job title for a company with URL: ${company_url}${
            context ? ` with context: ${context}` : ""
          }`,
        },
      ],
      functions: [
        {
          name: "generate_job_title",
          description:
            "Generate a modern, concise job title suitable for a role at the given company. Use additional context if available, but only require the company URL.",
          parameters: {
            type: "object",
            properties: {
              company_url: {
                type: "string",
                description: "The main website URL of the company.",
              },
              context: {
                type: "string",
                description:
                  "Optional: Any extra info or keywords about the team, department, or focus of the job.",
              },
            },
            required: ["company_url", "context"],
            additionalProperties: false,
          },
        },
      ],
      function_call: {
        name: "generate_job_title",
      },
      temperature: 0.7,
    });

    const functionCall = completion.choices[0]?.message?.function_call;

    if (!functionCall) {
      return NextResponse.json(
        { error: "Failed to generate job title" },
        { status: 500 }
      );
    }

    // Parse the function arguments to get the generated title
    const functionArgs = JSON.parse(functionCall.arguments || "{}");

    // For demo purposes, we'll generate a title based on the company URL
    // In a real implementation, this would be handled by the assistant
    const domain = company_url
      .replace(/^https?:\/\//, "")
      .replace(/^www\./, "")
      .split(".")[0];
    const companyName = domain.charAt(0).toUpperCase() + domain.slice(1);

    const jobTitles = [
      "Senior Software Engineer",
      "Full Stack Developer",
      "Software Development Engineer",
      "Backend Engineer",
      "Frontend Developer",
      "DevOps Engineer",
      "Data Engineer",
      "ML Engineer",
      "Product Engineer",
      "Platform Engineer",
    ];

    // Add context-based titles if context is provided
    const contextBasedTitles: { [key: string]: string[] } = {
      frontend: ["Frontend Developer", "React Developer", "UI/UX Engineer"],
      backend: ["Backend Engineer", "API Developer", "Server Engineer"],
      mobile: ["Mobile Developer", "iOS Engineer", "Android Developer"],
      data: ["Data Engineer", "Data Scientist", "Analytics Engineer"],
      ai: ["ML Engineer", "AI Engineer", "Data Scientist"],
      devops: [
        "DevOps Engineer",
        "Site Reliability Engineer",
        "Cloud Engineer",
      ],
      security: [
        "Security Engineer",
        "Cybersecurity Specialist",
        "InfoSec Engineer",
      ],
    };

    let selectedTitle = jobTitles[Math.floor(Math.random() * jobTitles.length)];

    // Check if context matches any specialized roles
    const lowerContext = context.toLowerCase();
    for (const [key, titles] of Object.entries(contextBasedTitles)) {
      if (lowerContext.includes(key)) {
        selectedTitle = titles[Math.floor(Math.random() * titles.length)];
        break;
      }
    }

    return NextResponse.json({
      job_title: selectedTitle,
      company: companyName,
      generated_at: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error generating job title:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
