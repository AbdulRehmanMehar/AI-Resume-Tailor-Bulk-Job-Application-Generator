import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const { company_url, job_title = "", context = "" } = await request.json();

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
            "You are an expert recruiter and HR professional. Generate engaging, ATS-friendly job descriptions for technical roles that attract top talent.",
        },
        {
          role: "user",
          content: `Generate a job description for a company with URL: ${company_url}${
            job_title ? ` for the role: ${job_title}` : ""
          }${context ? ` with context: ${context}` : ""}`,
        },
      ],
      functions: [
        {
          name: "generate_job_description",
          description:
            "Generate an engaging, ATS-friendly job description for a typical technical or engineering role at the given company. Use additional info if provided, but only require the company URL.",
          parameters: {
            type: "object",
            required: ["company_url", "job_title", "context"],
            properties: {
              company_url: {
                type: "string",
                description: "The main website URL of the company.",
              },
              job_title: {
                type: "string",
                description: "Optional: A specific job title to target.",
              },
              context: {
                type: "string",
                description:
                  "Optional: Any extra info about the team, product, or responsibilities.",
              },
            },
            additionalProperties: false,
          },
        },
      ],
      function_call: {
        name: "generate_job_description",
      },
      temperature: 0.8,
    });

    const functionCall = completion.choices[0]?.message?.function_call;

    if (!functionCall) {
      return NextResponse.json(
        { error: "Failed to generate job description" },
        { status: 500 }
      );
    }

    // Parse the function arguments
    const functionArgs = JSON.parse(functionCall.arguments || "{}");

    // For demo purposes, we'll generate descriptions based on the inputs
    // In a real implementation, this would be handled by the assistant
    const domain = company_url
      .replace(/^https?:\/\//, "")
      .replace(/^www\./, "")
      .split(".")[0];
    const companyName = domain.charAt(0).toUpperCase() + domain.slice(1);

    const jobDescriptionTemplates = {
      "Senior Software Engineer": `Join ${companyName} as a Senior Software Engineer and lead the development of innovative solutions that impact millions of users worldwide. You'll work with cutting-edge technologies, mentor junior developers, and contribute to architectural decisions that shape our platform's future.

Key Responsibilities:
• Design and implement scalable backend systems and APIs
• Collaborate with cross-functional teams to deliver high-quality features
• Lead code reviews and establish engineering best practices
• Optimize application performance and ensure system reliability
• Mentor junior engineers and contribute to team growth

What We Offer:
• Competitive salary and equity package
• Flexible working arrangements and remote-friendly culture
• Professional development opportunities and conference attendance
• Comprehensive health benefits and wellness programs`,

      "Full Stack Developer": `${companyName} is seeking a talented Full Stack Developer to build and maintain our web applications from front-end user interfaces to back-end services. You'll work in a collaborative environment with modern technologies and have the opportunity to make a significant impact on our product.

Key Responsibilities:
• Develop responsive web applications using modern JavaScript frameworks
• Build and maintain RESTful APIs and database schemas
• Collaborate with designers to implement pixel-perfect user interfaces
• Write clean, testable code with comprehensive documentation
• Participate in agile development processes and sprint planning

What We Offer:
• Opportunity to work on diverse, challenging projects
• Modern tech stack and development tools
• Collaborative team environment with growth opportunities
• Competitive compensation and benefits package`,

      "Frontend Developer": `Join ${companyName}'s frontend team and create exceptional user experiences that delight our customers. You'll work closely with designers and product managers to build responsive, accessible, and performant web applications using the latest frontend technologies.

Key Responsibilities:
• Develop modern, responsive web applications using React/Vue.js
• Implement designs with attention to detail and user experience
• Optimize applications for maximum performance and scalability
• Collaborate with backend engineers to integrate APIs
• Maintain and improve existing frontend codebase

What We Offer:
• Work with cutting-edge frontend technologies
• Collaborative design and product team
• Professional growth and learning opportunities
• Flexible work environment and competitive benefits`,

      "Backend Engineer": `${companyName} is looking for a Backend Engineer to design and build the server-side logic that powers our applications. You'll work on scalable systems, APIs, and data processing pipelines that serve millions of requests daily.

Key Responsibilities:
• Design and implement robust backend services and APIs
• Work with databases, caching systems, and message queues
• Ensure high availability and performance of backend systems
• Collaborate with frontend teams to define API contracts
• Monitor and troubleshoot production systems

What We Offer:
• Work on high-scale, distributed systems
• Modern infrastructure and cloud technologies
• Strong engineering culture focused on best practices
• Competitive compensation and comprehensive benefits`,
    };

    let description =
      jobDescriptionTemplates[
        job_title as keyof typeof jobDescriptionTemplates
      ];

    if (!description) {
      // Generic description if specific job title not found
      description = `Join ${companyName} and be part of our innovative engineering team. We're looking for a talented ${
        job_title || "Software Engineer"
      } to help build products that make a difference. You'll work with cutting-edge technologies in a collaborative environment that values creativity, growth, and impact.

Key Responsibilities:
• Develop and maintain high-quality software solutions
• Collaborate with cross-functional teams to deliver features
• Participate in code reviews and technical discussions
• Contribute to architecture and technology decisions
• Stay current with industry trends and best practices

What We Offer:
• Opportunity to work on challenging technical problems
• Collaborative and inclusive team culture
• Professional development and growth opportunities
• Competitive compensation and comprehensive benefits
• Flexible work arrangements and modern development tools`;
    }

    // Add context-specific information if provided
    if (context) {
      description += `\n\nAdditional Context: ${context}`;
    }

    return NextResponse.json({
      job_description: description,
      company: companyName,
      job_title: job_title || "Software Engineer",
      generated_at: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error generating job description:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
