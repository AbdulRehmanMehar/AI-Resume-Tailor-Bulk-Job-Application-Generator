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
      job_description = "",
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

    // Create AI prompt for generating job skills
    const systemPrompt = `You are an expert technical recruiter and skills analyst. Generate focused, relevant skill lists for ANY role based on:
1. The specific job title provided
2. Industry standards and requirements
3. Company context and needs
4. Experience level requirements

Return a comma-separated list of 8-15 relevant skills that are:
- Specific to the job title
- Industry-appropriate
- Mix of technical and soft skills where applicable
- Realistic and in-demand

For non-technical roles (like Project Manager, Marketing Manager, etc.), focus on relevant business skills, tools, and methodologies.`;

    let userPrompt = `Generate relevant skills for "${
      job_title || "Software Engineer"
    }" at ${companyName}`;

    if (years_experience > 0) {
      userPrompt += ` for someone with ${years_experience} years of experience`;
    }

    if (job_description) {
      userPrompt += `. Job description context: ${job_description.substring(
        0,
        300
      )}`;
    }

    userPrompt += `. Make sure the skills are specifically relevant to the "${job_title}" role and appropriate for this position type.`;

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
      max_tokens: 200,
      temperature: 0.6,
    });

    const generatedSkills = completion.choices[0]?.message?.content?.trim();

    if (!generatedSkills) {
      throw new Error("No job skills generated");
    }

    // Parse the comma-separated skills into an array
    const skillsArray = generatedSkills
      .split(",")
      .map((skill) => skill.trim())
      .filter((skill) => skill.length > 0);

    return NextResponse.json({
      success: true,
      skills: skillsArray.join(", "),
      skills_string: skillsArray.join(", "), // Add this field for compatibility
      skills_array: skillsArray,
      company: companyName,
      job_title: job_title || "Software Engineer",
      generated_at: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error generating job skills:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Internal server error",
      },
      { status: 500 }
    );
  }
}
