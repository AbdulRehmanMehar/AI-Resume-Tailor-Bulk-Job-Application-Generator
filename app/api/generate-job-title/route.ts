import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const {
      company_url,
      context = "",
      target_role = "",
      years_experience = 0,
      language = "English",
    } = await request.json();

    if (!company_url) {
      return NextResponse.json(
        { error: "Company URL is required" },
        { status: 400 }
      );
    }

    // Extract company name from URL for context
    const domain = company_url
      .replace(/^https?:\/\//, "")
      .replace(/^www\./, "")
      .split(".")[0];
    const companyName = domain.charAt(0).toUpperCase() + domain.slice(1);

    // Prepare the prompt for AI generation
    const systemPrompt = `You are an expert recruiter and job market analyst. Generate modern, professional job titles that are:
1. Realistic and commonly used in the industry
2. Appropriate for the candidate's experience level
3. Consistent with the target role when provided
4. Suitable for the company context
5. Professional and concise (typically 2-4 words)

Always return just the job title, nothing else.`;

    let userPrompt = `Generate a job title for ${companyName}`;

    if (target_role) {
      userPrompt += ` for someone targeting a "${target_role}" role`;
    }

    if (years_experience > 0) {
      userPrompt += ` with ${years_experience} years of experience`;
    }

    if (context) {
      userPrompt += `. Additional context: ${context}`;
    }

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
      max_tokens: 20,
      temperature: 0.7,
    });

    const generatedTitle = completion.choices[0]?.message?.content?.trim();

    if (!generatedTitle) {
      throw new Error("No job title generated");
    }

    return NextResponse.json({
      success: true,
      job_title: generatedTitle,
      company: companyName,
      generated_at: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error generating job title:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Internal server error",
      },
      { status: 500 }
    );
  }
}
