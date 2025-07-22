#!/usr/bin/env node

// Test the tailored resume generation endpoint
const test = async () => {
  console.log("Testing tailored resume generation endpoint...\n");

  try {
    const response = await fetch(
      "http://localhost:3000/api/generate-tailored-resume",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          job_title: "Senior Frontend Developer",
          job_description:
            "We are looking for an experienced frontend developer with React expertise to join our team. You will be responsible for building user interfaces and working with our design team.",
          original_resume: `John Doe
Software Engineer
john.doe@email.com | (555) 123-4567

EXPERIENCE
Frontend Developer at TechCorp (2020-2023)
- Built React applications with TypeScript
- Collaborated with design teams on UI/UX
- Implemented responsive designs

EDUCATION
Bachelor of Computer Science
University of Technology (2016-2020)

SKILLS
JavaScript, React, TypeScript, HTML, CSS, Node.js`,
          additional_context:
            "Years of experience: 2-5, Language: English (US)",
        }),
      }
    );

    if (response.ok) {
      const data = await response.json();
      console.log("✅ Success! Tailored resume generated:");
      console.log("Full Name:", data.data.tailored_resume.full_name);
      console.log(
        "Professional Summary:",
        data.data.tailored_resume.professional_summary
      );
      console.log("Skills:", data.data.tailored_resume.skills);
      console.log("\nMetadata:");
      console.log(
        "- Changes made:",
        data.data.metadata.changes_made?.length || 0
      );
      console.log(
        "- Keyword matches:",
        data.data.metadata.keyword_matches?.length || 0
      );
    } else {
      console.error("❌ Error:", response.status, response.statusText);
      const errorData = await response.text();
      console.error(errorData);
    }
  } catch (error) {
    console.error("❌ Network error:", error.message);
  }
};

test();
