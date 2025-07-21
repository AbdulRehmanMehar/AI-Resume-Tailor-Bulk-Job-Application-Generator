import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { company_url, context = "" } = await request.json();

    if (!company_url) {
      return NextResponse.json(
        { error: "Company URL is required" },
        { status: 400 }
      );
    }

    // Call each endpoint in sequence to build complete job data
    const baseUrl = request.nextUrl.origin;

    // Step 1: Generate job title
    const titleResponse = await fetch(`${baseUrl}/api/generate-job-title`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        company_url,
        context,
      }),
    });

    if (!titleResponse.ok) {
      throw new Error("Failed to generate job title");
    }

    const titleData = await titleResponse.json();
    const jobTitle = titleData.job_title;

    // Step 2: Generate job description
    const descriptionResponse = await fetch(
      `${baseUrl}/api/generate-job-description`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          company_url,
          job_title: jobTitle,
          context,
        }),
      }
    );

    if (!descriptionResponse.ok) {
      throw new Error("Failed to generate job description");
    }

    const descriptionData = await descriptionResponse.json();
    const jobDescription = descriptionData.job_description;

    // Step 3: Generate skills
    const skillsResponse = await fetch(`${baseUrl}/api/generate-job-skills`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        company_url,
        job_title: jobTitle,
        job_description: jobDescription,
      }),
    });

    if (!skillsResponse.ok) {
      throw new Error("Failed to generate job skills");
    }

    const skillsData = await skillsResponse.json();

    // Return combined data
    return NextResponse.json({
      success: true,
      data: {
        company_url,
        company: titleData.company,
        job_title: jobTitle,
        job_description: jobDescription,
        skills: skillsData.skills,
        skills_string: skillsData.skills_string,
        context,
        generated_at: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error("Error generating complete job data:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
