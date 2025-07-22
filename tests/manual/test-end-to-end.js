#!/usr/bin/env node

// End-to-end test for resume upload and text extraction
const fs = require("fs");
const path = require("path");

console.log("=== End-to-End Resume Upload Test ===\n");

// Check if required dependencies are installed
try {
  require("mammoth");
  console.log("✓ mammoth package is available");
} catch (e) {
  console.log("✗ mammoth package not found:", e.message);
  process.exit(1);
}

try {
  require("pdfjs-dist");
  console.log("✓ pdfjs-dist package is available");
} catch (e) {
  console.log("✗ pdfjs-dist package not found:", e.message);
  process.exit(1);
}

// Test the API with resumeText field
async function testResumeTextAPI() {
  console.log("\n=== Testing API with resumeText field ===");

  const testResumeText = `John Doe
Software Engineer
john.doe@example.com
(555) 123-4567

EXPERIENCE:
Senior Software Engineer at Tech Corp (2020-2023)
- Developed web applications using React and Node.js
- Led a team of 5 developers
- Improved system performance by 40%

Junior Developer at StartupXYZ (2018-2020)
- Built mobile applications using React Native
- Collaborated with cross-functional teams

EDUCATION:
B.S. Computer Science, University of Technology (2018)

SKILLS:
JavaScript, TypeScript, React, Node.js, Python, AWS`;

  try {
    const response = await fetch(
      "http://localhost:3000/api/generate-tailored-resume",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          job_title: "Senior Full Stack Developer",
          job_description:
            "We are looking for a Senior Full Stack Developer with experience in React, Node.js, and cloud technologies. The ideal candidate will have 5+ years of experience and leadership skills.",
          resumeText: testResumeText,
          additional_context:
            "Years of experience: 5-8, Language: English (US)",
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    console.log("✓ API call successful");
    console.log("✓ Response received with tailored_resume field");

    // Verify that original data is preserved
    const tailoredResume = data.data.tailored_resume;
    const preservedData = [
      "John Doe",
      "john.doe@example.com",
      "(555) 123-4567",
      "Tech Corp",
      "StartupXYZ",
      "University of Technology",
    ];

    let preservationCount = 0;
    preservedData.forEach((item) => {
      if (tailoredResume.includes(item)) {
        preservationCount++;
        console.log(`✓ Preserved: ${item}`);
      } else {
        console.log(`✗ Missing: ${item}`);
      }
    });

    console.log(
      `\nData preservation: ${preservationCount}/${preservedData.length} items preserved`
    );

    if (preservationCount === preservedData.length) {
      console.log("✓ All critical data preserved!");
      return true;
    } else {
      console.log("✗ Some data was not preserved");
      return false;
    }
  } catch (error) {
    console.error("✗ API test failed:", error.message);
    return false;
  }
}

// Test backward compatibility with original_resume field
async function testBackwardCompatibility() {
  console.log("\n=== Testing Backward Compatibility (original_resume) ===");

  const testResumeText = `Jane Smith
Product Manager
jane.smith@example.com`;

  try {
    const response = await fetch(
      "http://localhost:3000/api/generate-tailored-resume",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          job_title: "Senior Product Manager",
          job_description: "Looking for an experienced Product Manager",
          original_resume: testResumeText,
          additional_context:
            "Years of experience: 2-5, Language: English (US)",
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    console.log("✓ Backward compatibility test successful");
    console.log("✓ original_resume field still works");

    const tailoredResume = data.data.tailored_resume;
    if (
      tailoredResume.includes("Jane Smith") &&
      tailoredResume.includes("jane.smith@example.com")
    ) {
      console.log("✓ Data preserved in backward compatibility mode");
      return true;
    } else {
      console.log("✗ Data not preserved in backward compatibility mode");
      return false;
    }
  } catch (error) {
    console.error("✗ Backward compatibility test failed:", error.message);
    return false;
  }
}

// Main test runner
async function runTests() {
  console.log("Starting end-to-end tests...\n");

  const resumeTextTest = await testResumeTextAPI();
  const backwardCompatTest = await testBackwardCompatibility();

  console.log("\n=== Test Summary ===");
  console.log(
    `Resume Text API Test: ${resumeTextTest ? "✓ PASSED" : "✗ FAILED"}`
  );
  console.log(
    `Backward Compatibility Test: ${
      backwardCompatTest ? "✓ PASSED" : "✗ FAILED"
    }`
  );

  if (resumeTextTest && backwardCompatTest) {
    console.log("\n🎉 All tests passed! The integration is working correctly.");
    process.exit(0);
  } else {
    console.log("\n❌ Some tests failed. Please check the issues above.");
    process.exit(1);
  }
}

// Check if server is running first
async function checkServer() {
  try {
    const response = await fetch(
      "http://localhost:3000/api/generate-tailored-resume"
    );
    if (response.status === 405) {
      // Method not allowed is expected for GET
      console.log("✓ Server is running on localhost:3000");
      return true;
    }
  } catch (error) {
    console.log("✗ Server not running on localhost:3000");
    console.log(
      "Please start the Next.js development server with: npm run dev"
    );
    return false;
  }
}

// Run the tests
(async () => {
  const serverRunning = await checkServer();
  if (serverRunning) {
    await runTests();
  } else {
    process.exit(1);
  }
})();
