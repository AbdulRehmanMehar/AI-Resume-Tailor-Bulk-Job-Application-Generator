#!/usr/bin/env node

// Test script for enhanced resume schema with source content analysis
console.log("🔍 TESTING ENHANCED RESUME SCHEMA WITH CONTENT ANALYSIS\n");

const testCases = [
  {
    name: "Complete Resume with All Contact Info",
    resumeText: `John Doe
Senior Software Engineer
Email: john.doe@company.com
Phone: (555) 123-4567
Location: San Francisco, CA
LinkedIn: https://linkedin.com/in/johndoe
GitHub: https://github.com/johndoe
Portfolio: https://johndoe.dev
Willing to relocate for the right opportunity

EXPERIENCE:
Software Engineer at TechCorp (2020-2023)
- Built applications using React and Node.js`,
    expectedAnalysis: {
      has_email: true,
      has_phone: true,
      has_location: true,
      has_linkedin: true,
      has_github: true,
      has_social_links: true,
      has_relocation_willingness: true,
    },
  },
  {
    name: "Minimal Resume with Only Name and Experience",
    resumeText: `Jane Smith
Software Developer

EXPERIENCE:
Developer at StartupXYZ (2021-2023)
- Created web applications`,
    expectedAnalysis: {
      has_email: false,
      has_phone: false,
      has_location: false,
      has_linkedin: false,
      has_github: false,
      has_social_links: false,
      has_relocation_willingness: false,
    },
  },
  {
    name: "Partial Contact Info Resume",
    resumeText: `Alex Johnson
Data Scientist
alex.johnson@email.com
New York, NY

EXPERIENCE:
Data Scientist at DataCorp (2019-2023)
- Analyzed large datasets using Python

EDUCATION:
MS Data Science, Columbia University`,
    expectedAnalysis: {
      has_email: true,
      has_phone: false,
      has_location: true,
      has_linkedin: false,
      has_github: false,
      has_social_links: false,
      has_relocation_willingness: false,
    },
  },
  {
    name: "Resume with Social Links but No Traditional Contact",
    resumeText: `Sam Developer
Full Stack Engineer
github.com/samdev
linkedin.com/in/samueldev

PROJECTS:
Built e-commerce platform using React and Node.js`,
    expectedAnalysis: {
      has_email: false,
      has_phone: false,
      has_location: false,
      has_linkedin: true,
      has_github: true,
      has_social_links: false,
      has_relocation_willingness: false,
    },
  },
];

async function testEnhancedSchema() {
  console.log("🧪 Testing Enhanced Resume Schema with Content Analysis\n");

  for (const testCase of testCases) {
    console.log(`📋 Test Case: ${testCase.name}`);
    console.log(
      `📝 Resume Text Length: ${testCase.resumeText.length} characters`
    );
    console.log(`🔍 Expected Analysis:`);

    Object.entries(testCase.expectedAnalysis).forEach(([key, value]) => {
      console.log(`   ${key}: ${value ? "✅" : "❌"}`);
    });

    // Test API call
    try {
      const response = await fetch(
        "http://localhost:3000/api/generate-tailored-resume",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            job_title: "Senior Software Engineer",
            job_description:
              "We are looking for a senior software engineer with strong technical skills and excellent communication abilities.",
            resumeText: testCase.resumeText,
            additional_context:
              "Years of experience: 3-5, Language: English (US)",
          }),
        }
      );

      if (response.ok) {
        const data = await response.json();
        const analysis = data.data.tailored_resume.source_content_analysis;
        const contactInfo = data.data.tailored_resume.contact_information;

        console.log(`✅ API Response received`);
        console.log(`🔍 Actual Analysis:`);
        Object.entries(analysis).forEach(([key, value]) => {
          const expected = testCase.expectedAnalysis[key];
          const match = value === expected;
          console.log(
            `   ${key}: ${value ? "✅" : "❌"} ${match ? "✓" : "✗ MISMATCH"}`
          );
        });

        console.log(`📞 Contact Info Included:`);
        Object.entries(contactInfo).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            console.log(`   ${key}: "${value}"`);
          }
        });

        // Validate that only expected fields are included
        const shouldHaveEmail = analysis.has_email;
        const actuallyHasEmail = contactInfo.email !== undefined;
        console.log(
          `📧 Email validation: Should have: ${shouldHaveEmail}, Actually has: ${actuallyHasEmail} ${
            shouldHaveEmail === actuallyHasEmail ? "✓" : "✗"
          }`
        );

        const shouldHavePhone = analysis.has_phone;
        const actuallyHasPhone = contactInfo.phone !== undefined;
        console.log(
          `📱 Phone validation: Should have: ${shouldHavePhone}, Actually has: ${actuallyHasPhone} ${
            shouldHavePhone === actuallyHasPhone ? "✓" : "✗"
          }`
        );
      } else {
        console.log(
          `❌ API call failed: ${response.status} ${response.statusText}`
        );
      }
    } catch (error) {
      console.log(`💥 Error testing case: ${error.message}`);
    }

    console.log("\n" + "─".repeat(80) + "\n");
  }
}

// Test server availability first
async function checkServer() {
  try {
    const response = await fetch(
      "http://localhost:3000/api/generate-tailored-resume"
    );
    if (response.status === 405) {
      // Method not allowed is expected for GET
      console.log("✅ Server is running on localhost:3000\n");
      return true;
    }
  } catch (error) {
    console.log("❌ Server not running on localhost:3000");
    console.log(
      "Please start the Next.js development server with: npm run dev\n"
    );
    return false;
  }
}

console.log("🎯 ENHANCED SCHEMA FEATURES:");
console.log("✅ Source content analysis to detect available information");
console.log("✅ Boolean flags for each contact field type");
console.log("✅ Prevents fabrication of missing contact information");
console.log("✅ Only includes fields that exist in original resume");
console.log("✅ Accurate detection of email, phone, location, social links");
console.log("✅ Willingness to relocate detection");
console.log("");

// Run tests
(async () => {
  const serverRunning = await checkServer();
  if (serverRunning) {
    await testEnhancedSchema();
    console.log("🎉 Enhanced schema testing completed!");
  } else {
    process.exit(1);
  }
})();
