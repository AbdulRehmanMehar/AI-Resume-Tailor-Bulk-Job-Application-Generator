import { NextRequest, NextResponse } from "next/server";
import { OpenAI } from "openai";

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const { existing_titles, resume_context, years_experience, language } =
      await request.json();

    if (!existing_titles || existing_titles.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error:
            "At least one existing job title is required to determine target role",
        },
        { status: 400 }
      );
    }

    const systemPrompt = `You are an expert career advisor and job market analyst. Your task is to analyze existing job titles and determine the most appropriate target role that represents the common theme or career focus.

Instructions:
1. Analyze the provided job titles to identify the common career theme
2. Generate a concise, professional target role that encompasses the career focus
3. The target role should be specific enough to be useful but broad enough to cover variations
4. Consider the years of experience and context provided
5. Return only the target role name, nothing else

Examples:
- Input: ["Software Engineer", "Senior Developer", "Full Stack Developer"] → Output: "Software Engineer"
- Input: ["Project Manager", "Senior Project Manager", "Program Manager"] → Output: "Project Manager" 
- Input: ["Data Scientist", "ML Engineer", "AI Research Scientist"] → Output: "Data Scientist"
- Input: ["Marketing Manager", "Digital Marketing Specialist", "Growth Marketing Lead"] → Output: "Marketing Manager"`;

    const userPrompt = `Analyze these job titles and determine the target role:

Job Titles: ${existing_titles.join(", ")}
Years of Experience: ${years_experience}
Language: ${language}
${resume_context ? `Resume Context: ${resume_context.substring(0, 500)}` : ""}

Generate the target role:`;

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
      max_tokens: 50,
      temperature: 0.3,
    });

    const targetRole = completion.choices[0]?.message?.content?.trim();

    if (!targetRole) {
      throw new Error("No target role generated");
    }

    return NextResponse.json({
      success: true,
      target_role: targetRole,
    });
  } catch (error: any) {
    console.error("Error generating target role:", error);

    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to generate target role",
      },
      { status: 500 }
    );
  }
}
