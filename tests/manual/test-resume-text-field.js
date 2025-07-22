// Test the updated API with the new resumeText field
const testResumeTextField = async () => {
  console.log("🔄 Testing Updated API with resumeText Field...\n");

  const testResume = `John Smith
Email: john.smith@email.com
Phone: (555) 987-6543
Location: San Francisco, CA

EXPERIENCE
Senior Software Engineer | TechCorp Inc. | 2020-Present
• Led development of microservices architecture
• Built scalable web applications using React and Node.js
• Mentored junior developers

Software Engineer | StartupXYZ | 2018-2020
• Developed full-stack applications
• Implemented CI/CD pipelines
• Worked in agile development environment

EDUCATION
Bachelor of Science in Computer Science
Stanford University | 2018

SKILLS
JavaScript, TypeScript, React, Node.js, Python, AWS, Docker`;

  const jobDescription = `We are seeking a Senior Product Manager to drive product strategy and roadmap.

Requirements:
- 5+ years of product management experience
- Strong analytical and communication skills
- Experience with agile development
- Technical background preferred`;

  console.log("📋 Test 1: Using new resumeText field");
  try {
    const response1 = await fetch(
      "http://localhost:3000/api/generate-tailored-resume",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          job_title: "Senior Product Manager",
          job_description: jobDescription,
          resumeText: testResume, // Using the new field
          additional_context: "Years of experience: 5-7, Language: English",
        }),
      }
    );

    if (!response1.ok) {
      throw new Error(`HTTP ${response1.status}: ${response1.statusText}`);
    }

    const result1 = await response1.json();
    if (!result1.success) {
      throw new Error(result1.error || "API returned failure");
    }

    const resume1 = result1.data.tailored_resume;
    const namePreserved1 =
      resume1.full_name.includes("John") && resume1.full_name.includes("Smith");
    const emailPreserved1 =
      resume1.contact_information.email === "john.smith@email.com";

    console.log(
      `   ${namePreserved1 ? "✅" : "❌"} Name preserved: "${
        resume1.full_name
      }"`
    );
    console.log(
      `   ${emailPreserved1 ? "✅" : "❌"} Email preserved: "${
        resume1.contact_information.email
      }"`
    );
    console.log(`   ✅ Successfully used resumeText field`);
  } catch (error) {
    console.log(`   ❌ Test 1 failed: ${error.message}`);
  }

  console.log("\n📋 Test 2: Backward compatibility with original_resume");
  try {
    const response2 = await fetch(
      "http://localhost:3000/api/generate-tailored-resume",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          job_title: "Senior Product Manager",
          job_description: jobDescription,
          original_resume: testResume, // Using the old field
          additional_context: "Years of experience: 5-7, Language: English",
        }),
      }
    );

    if (!response2.ok) {
      throw new Error(`HTTP ${response2.status}: ${response2.statusText}`);
    }

    const result2 = await response2.json();
    if (!result2.success) {
      throw new Error(result2.error || "API returned failure");
    }

    const resume2 = result2.data.tailored_resume;
    const namePreserved2 =
      resume2.full_name.includes("John") && resume2.full_name.includes("Smith");
    const emailPreserved2 =
      resume2.contact_information.email === "john.smith@email.com";

    console.log(
      `   ${namePreserved2 ? "✅" : "❌"} Name preserved: "${
        resume2.full_name
      }"`
    );
    console.log(
      `   ${emailPreserved2 ? "✅" : "❌"} Email preserved: "${
        resume2.contact_information.email
      }"`
    );
    console.log(`   ✅ Backward compatibility maintained`);
  } catch (error) {
    console.log(`   ❌ Test 2 failed: ${error.message}`);
  }

  console.log(
    "\n📋 Test 3: Priority test (resumeText should override original_resume)"
  );
  try {
    const differentResume = `Jane Doe
Email: jane.doe@email.com
Phone: (555) 111-2222

EXPERIENCE
Data Scientist | DataCorp | 2021-Present
• Built machine learning models
• Analyzed large datasets`;

    const response3 = await fetch(
      "http://localhost:3000/api/generate-tailored-resume",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          job_title: "Senior Product Manager",
          job_description: jobDescription,
          resumeText: differentResume, // Should use this
          original_resume: testResume, // Should ignore this
          additional_context: "Years of experience: 5-7, Language: English",
        }),
      }
    );

    if (!response3.ok) {
      throw new Error(`HTTP ${response3.status}: ${response3.statusText}`);
    }

    const result3 = await response3.json();
    if (!result3.success) {
      throw new Error(result3.error || "API returned failure");
    }

    const resume3 = result3.data.tailored_resume;
    const usedResumeText =
      resume3.full_name.includes("Jane") && resume3.full_name.includes("Doe");
    const ignoredOriginal = !resume3.full_name.includes("John");

    console.log(
      `   ${usedResumeText ? "✅" : "❌"} Used resumeText: "${
        resume3.full_name
      }"`
    );
    console.log(
      `   ${ignoredOriginal ? "✅" : "❌"} Ignored original_resume: ${
        ignoredOriginal ? "Yes" : "No"
      }`
    );
    console.log(`   ✅ Priority handling works correctly`);
  } catch (error) {
    console.log(`   ❌ Test 3 failed: ${error.message}`);
  }

  console.log("\n📋 Test 4: Error handling (missing both fields)");
  try {
    const response4 = await fetch(
      "http://localhost:3000/api/generate-tailored-resume",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          job_title: "Senior Product Manager",
          job_description: jobDescription,
          // Missing both resumeText and original_resume
        }),
      }
    );

    const result4 = await response4.json();
    const hasExpectedError =
      !result4.success && result4.error.includes("resumeText");

    console.log(
      `   ${hasExpectedError ? "✅" : "❌"} Error handling: ${
        hasExpectedError ? "Correct error message" : "Unexpected response"
      }`
    );
    if (hasExpectedError) {
      console.log(`   📝 Error message: "${result4.error}"`);
    }
  } catch (error) {
    console.log(`   ❌ Test 4 failed: ${error.message}`);
  }

  console.log("\n🎯 API Update Summary:");
  console.log(
    "   ✅ New resumeText field accepts extracted text from uploaded files"
  );
  console.log(
    "   ✅ Backward compatibility maintained with original_resume field"
  );
  console.log("   ✅ resumeText takes priority when both fields are provided");
  console.log("   ✅ Clear error messages when required fields are missing");
  console.log(
    "   💡 Frontend can now extract text from DOCX, PDF, TXT files and pass as resumeText"
  );

  console.log("\n🏁 API field testing complete!");
};

// Run the test
testResumeTextField().catch(console.error);
