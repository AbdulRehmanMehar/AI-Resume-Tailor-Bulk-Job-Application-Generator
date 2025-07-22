import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const {
      company_url,
      job_title = "",
      context = "",
      years_experience = 0,
      language = "English",
    } = await request.json();

    if (!company_url) {
      return NextResponse.json(
        { error: "Company URL is required" },
        { status: 400 }
      );
    }

    // Extract company name from URL
    const domain = company_url
      .replace(/^https?:\/\//, "")
      .replace(/^www\./, "")
      .split(".")[0];
    const companyName = domain.charAt(0).toUpperCase() + domain.slice(1);

    // Create AI prompt for generating job description
    const systemPrompt = `You are an expert recruiter and HR professional. Generate engaging, professional job descriptions that are:
1. Tailored to the specific job title provided
2. Realistic and industry-appropriate
3. ATS-friendly with clear structure
4. Compelling to attract top talent
5. Include relevant responsibilities, requirements, and benefits

Format the description with clear sections and bullet points. Make it realistic and specific to the role.`;

    let userPrompt = `Generate a professional job description for "${
      job_title || "Software Engineer"
    }" at ${companyName}`;

    if (years_experience > 0) {
      userPrompt += ` targeting candidates with ${years_experience} years of experience`;
    }

    if (context) {
      userPrompt += `. Additional context: ${context}`;
    }

    userPrompt += `. Make sure the description is specifically tailored to the "${job_title}" role and includes relevant responsibilities, requirements, and skills for this position.`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: systemPrompt,
        },
        {
          role: "user",
          content: userPrompt,
        },
      ],
      max_tokens: 600,
      temperature: 0.7,
    });

    const generatedDescription =
      completion.choices[0]?.message?.content?.trim();

    if (!generatedDescription) {
      throw new Error("No job description generated");
    }

    return NextResponse.json({
      success: true,
      job_description: generatedDescription,
      company: companyName,
      job_title: job_title || "Software Engineer",
      generated_at: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error generating job description:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Internal server error",
      },
      { status: 500 }
    );
  }
}
