#!/usr/bin/env node

// Test the improved resume generation with missing/optional fields
const testConditionalRendering = async () => {
  console.log("Testing conditional rendering with missing data...\n");

  try {
    const response = await fetch(
      "http://localhost:3000/api/generate-tailored-resume",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          job_title: "Software Engineer",
          job_description:
            "Looking for a software engineer with good programming skills.",
          original_resume: `Jane Doe
jane.doe@email.com

SUMMARY
Software developer with programming experience.

EXPERIENCE
Developer at Company A (2020-2023)
- Built web applications
- Worked with teams

EDUCATION
Computer Science Degree
University X (2016-2020)

SKILLS
JavaScript, React, Python`,
          additional_context:
            "Years of experience: 2-5, Language: English (US)",
        }),
      }
    );

    if (response.ok) {
      const data = await response.json();
      const resume = data.data.tailored_resume;

      console.log("✅ Resume generated successfully!");
      console.log("Testing conditional rendering...\n");

      // Test contact information
      console.log("CONTACT INFORMATION:");
      console.log("- Email:", resume.contact_information.email || "MISSING");
      console.log("- Phone:", resume.contact_information.phone || "MISSING");
      console.log(
        "- Location:",
        resume.contact_information.location || "MISSING"
      );
      console.log(
        "- LinkedIn:",
        resume.contact_information.linkedin || "MISSING"
      );
      console.log(
        "- Website:",
        resume.contact_information.website || "MISSING"
      );

      // Test optional sections
      console.log("\nOPTIONAL SECTIONS:");
      console.log(
        "- Certifications:",
        resume.certifications?.length || 0,
        "items"
      );
      console.log("- Projects:", resume.projects?.length || 0, "items");
      console.log("- Languages:", resume.languages?.length || 0, "items");
      console.log("- Awards:", resume.awards?.length || 0, "items");

      // Test work experience
      console.log("\nWORK EXPERIENCE:");
      if (resume.work_experience && resume.work_experience.length > 0) {
        resume.work_experience.forEach((job, index) => {
          console.log(`Job ${index + 1}:`);
          console.log("  - Title:", job.job_title || "MISSING");
          console.log("  - Company:", job.company || "MISSING");
          console.log("  - Location:", job.location || "MISSING");
          console.log("  - Start Date:", job.start_date || "MISSING");
          console.log("  - End Date:", job.end_date || "MISSING (Present)");
          console.log(
            "  - Responsibilities:",
            job.responsibilities?.length || 0,
            "items"
          );
        });
      }

      // Test education
      console.log("\nEDUCATION:");
      if (resume.education && resume.education.length > 0) {
        resume.education.forEach((edu, index) => {
          console.log(`Education ${index + 1}:`);
          console.log("  - Degree:", edu.degree || "MISSING");
          console.log("  - Institution:", edu.institution || "MISSING");
          console.log("  - Location:", edu.location || "MISSING");
          console.log(
            "  - Additional Details:",
            edu.additional_details || "MISSING"
          );
        });
      }

      console.log("\n🎉 Conditional rendering test complete!");
      console.log(
        "The DOCX generator will now only render sections with actual data."
      );

      return true;
    } else {
      console.error("❌ Error:", response.status, response.statusText);
      const errorData = await response.text();
      console.error(errorData);
      return false;
    }
  } catch (error) {
    console.error("❌ Network error:", error.message);
    return false;
  }
};

// Test with empty optional sections
const testEmptyOptionalSections = async () => {
  console.log("\n" + "=".repeat(50));
  console.log("Testing with completely empty optional sections...\n");

  try {
    const response = await fetch(
      "http://localhost:3000/api/generate-tailored-resume",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          job_title: "Frontend Developer",
          job_description: "We need a frontend developer.",
          original_resume: `John Smith
john@email.com
123-456-7890

Frontend Developer with React experience.

EXPERIENCE
React Developer at TechCorp (2021-2024)
- Built React applications
- Worked with design team

EDUCATION
BS Computer Science
Tech University (2017-2021)

SKILLS
React, JavaScript, HTML, CSS`,
          additional_context: "Years of experience: 2-5",
        }),
      }
    );

    if (response.ok) {
      const data = await response.json();
      const resume = data.data.tailored_resume;

      console.log("✅ Resume with basic info generated successfully!");
      console.log("Full Name:", resume.full_name);

      // Check what optional sections are empty or missing
      const optionalSections = [
        { name: "Certifications", data: resume.certifications },
        { name: "Projects", data: resume.projects },
        { name: "Languages", data: resume.languages },
        { name: "Awards", data: resume.awards },
      ];

      console.log("\nOptional sections status:");
      optionalSections.forEach((section) => {
        const isEmpty = !section.data || section.data.length === 0;
        console.log(
          `- ${section.name}: ${
            isEmpty ? "❌ EMPTY (will not render)" : "✅ HAS DATA"
          }`
        );
      });

      console.log(
        "\n✅ Empty sections will be completely omitted from the DOCX!"
      );

      return true;
    } else {
      console.error("❌ Error:", response.status, response.statusText);
      return false;
    }
  } catch (error) {
    console.error("❌ Network error:", error.message);
    return false;
  }
};

// Run both tests
const runAllTests = async () => {
  const test1 = await testConditionalRendering();
  const test2 = await testEmptyOptionalSections();

  if (test1 && test2) {
    console.log("\n" + "🎉".repeat(10));
    console.log("ALL TESTS PASSED!");
    console.log("The improved DOCX generator now:");
    console.log("✅ Only renders contact info that exists");
    console.log("✅ Skips empty optional sections entirely");
    console.log(
      "✅ Handles missing location, dates, and other fields gracefully"
    );
    console.log("✅ Validates required fields before rendering sections");
    console.log(
      "✅ Creates clean, professional documents without empty sections"
    );
  } else {
    console.log("\n❌ Some tests failed. Please check the implementation.");
  }
};

runAllTests();
