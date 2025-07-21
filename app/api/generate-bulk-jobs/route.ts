import { NextRequest, NextResponse } from "next/server";

interface BulkJobRequest {
  company_url: string;
  context?: string;
  existing_title?: string;
  existing_description?: string;
  existing_skills?: string;
}

interface GenerationOptions {
  generate_titles?: boolean;
  generate_descriptions?: boolean;
  generate_skills?: boolean;
  context?: string;
}

export async function POST(request: NextRequest) {
  try {
    const {
      jobs,
      options = {
        generate_titles: true,
        generate_descriptions: true,
        generate_skills: true,
      },
    }: {
      jobs: BulkJobRequest[];
      options?: GenerationOptions;
    } = await request.json();

    if (!jobs || !Array.isArray(jobs) || jobs.length === 0) {
      return NextResponse.json(
        { error: "Jobs array is required" },
        { status: 400 }
      );
    }

    // Validate each job has a company_url
    for (const job of jobs) {
      if (!job.company_url) {
        return NextResponse.json(
          { error: "All jobs must have a company_url" },
          { status: 400 }
        );
      }
    }

    const baseUrl = request.nextUrl.origin;
    const results = [];

    // Process each job
    for (const job of jobs) {
      try {
        let jobTitle = job.existing_title || "";
        let jobDescription = job.existing_description || "";
        let jobSkills = job.existing_skills || "";

        // Generate job title if requested and not provided
        if (options.generate_titles && !jobTitle) {
          const titleResponse = await fetch(
            `${baseUrl}/api/generate-job-title`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                company_url: job.company_url,
                context: job.context || options.context || "",
              }),
            }
          );

          if (titleResponse.ok) {
            const titleData = await titleResponse.json();
            jobTitle = titleData.job_title;
          }
        }

        // Generate job description if requested and not provided
        if (options.generate_descriptions && !jobDescription) {
          const descriptionResponse = await fetch(
            `${baseUrl}/api/generate-job-description`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                company_url: job.company_url,
                job_title: jobTitle,
                context: job.context || options.context || "",
              }),
            }
          );

          if (descriptionResponse.ok) {
            const descriptionData = await descriptionResponse.json();
            jobDescription = descriptionData.job_description;
          }
        }

        // Generate skills if requested and not provided
        if (options.generate_skills && !jobSkills) {
          const skillsResponse = await fetch(
            `${baseUrl}/api/generate-job-skills`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                company_url: job.company_url,
                job_title: jobTitle,
                job_description: jobDescription,
              }),
            }
          );

          if (skillsResponse.ok) {
            const skillsData = await skillsResponse.json();
            jobSkills = skillsData.skills_string;
          }
        }

        // Extract company name from URL
        const domain = job.company_url
          .replace(/^https?:\/\//, "")
          .replace(/^www\./, "")
          .split(".")[0];
        const companyName = domain.charAt(0).toUpperCase() + domain.slice(1);

        results.push({
          company_url: job.company_url,
          company: companyName,
          job_title: jobTitle,
          job_description: jobDescription,
          skills: jobSkills,
          context: job.context,
          success: true,
        });
      } catch (jobError) {
        console.error(`Error processing job for ${job.company_url}:`, jobError);
        results.push({
          company_url: job.company_url,
          error: "Failed to process this job",
          success: false,
        });
      }
    }

    return NextResponse.json({
      success: true,
      processed: results.length,
      results,
      options,
      generated_at: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error in bulk job generation:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
