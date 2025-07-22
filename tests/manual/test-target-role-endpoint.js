// Test script for the AI-powered target role endpoint
const testTargetRoleEndpoint = async () => {
  console.log("🧪 Testing AI-powered target role endpoint...\n");

  const testCases = [
    {
      name: "Software Engineering Roles",
      data: {
        existing_titles: [
          "Software Engineer",
          "Senior Developer",
          "Full Stack Engineer",
        ],
        resume_context:
          "Experienced software developer with expertise in React, Node.js, and Python.",
        years_experience: 5,
        language: "English",
      },
      expectedRole: "Software Engineer",
    },
    {
      name: "Project Management Roles",
      data: {
        existing_titles: [
          "Project Manager",
          "Senior Project Manager",
          "Program Manager",
          "Agile Project Manager",
        ],
        resume_context:
          "Project management professional with PMP certification and agile methodologies experience.",
        years_experience: 8,
        language: "English",
      },
      expectedRole: "Project Manager",
    },
    {
      name: "Data Science Roles",
      data: {
        existing_titles: [
          "Data Scientist",
          "ML Engineer",
          "AI Research Scientist",
          "Senior Data Analyst",
        ],
        resume_context:
          "Data scientist with expertise in machine learning, Python, and statistical analysis.",
        years_experience: 6,
        language: "English",
      },
      expectedRole: "Data Scientist",
    },
    {
      name: "Marketing Roles",
      data: {
        existing_titles: [
          "Marketing Manager",
          "Digital Marketing Specialist",
          "Growth Marketing Lead",
        ],
        resume_context:
          "Marketing professional with experience in digital campaigns and growth strategies.",
        years_experience: 4,
        language: "English",
      },
      expectedRole: "Marketing Manager",
    },
    {
      name: "Single Title",
      data: {
        existing_titles: ["UX Designer"],
        resume_context:
          "User experience designer with expertise in design thinking and prototyping.",
        years_experience: 3,
        language: "English",
      },
      expectedRole: "UX Designer",
    },
  ];

  for (const testCase of testCases) {
    try {
      console.log(`📋 Testing: ${testCase.name}`);
      console.log(
        `   Input titles: ${testCase.data.existing_titles.join(", ")}`
      );

      const response = await fetch(
        "http://localhost:3001/api/generate-target-role",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(testCase.data),
        }
      );

      if (!response.ok) {
        console.log(
          `   ❌ HTTP Error: ${response.status} ${response.statusText}`
        );
        continue;
      }

      const result = await response.json();

      if (result.success && result.target_role) {
        console.log(`   ✅ Generated target role: "${result.target_role}"`);

        // Check if the generated role makes sense
        const generatedRole = result.target_role.toLowerCase();
        const expectedRole = testCase.expectedRole.toLowerCase();

        if (
          generatedRole.includes(expectedRole.split(" ")[0]) ||
          expectedRole.includes(generatedRole.split(" ")[0])
        ) {
          console.log(
            `   🎯 Role relevance: GOOD (related to expected "${testCase.expectedRole}")`
          );
        } else {
          console.log(
            `   ⚠️  Role relevance: DIFFERENT (expected "${testCase.expectedRole}")`
          );
        }
      } else {
        console.log(
          `   ❌ Error: ${result.error || "No target role generated"}`
        );
      }

      console.log(""); // Empty line for readability

      // Add delay to avoid rate limiting
      await new Promise((resolve) => setTimeout(resolve, 1000));
    } catch (error) {
      console.log(`   ❌ Request failed: ${error.message}`);
      console.log("");
    }
  }

  // Test error cases
  console.log("🚫 Testing error cases...\n");

  try {
    console.log("📋 Testing: Empty titles array");
    const response = await fetch(
      "http://localhost:3001/api/generate-target-role",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          existing_titles: [],
          resume_context: "Some context",
          years_experience: 5,
          language: "English",
        }),
      }
    );

    const result = await response.json();
    if (!result.success) {
      console.log(`   ✅ Correctly handled empty titles: ${result.error}`);
    } else {
      console.log(`   ❌ Should have failed with empty titles`);
    }
  } catch (error) {
    console.log(`   ❌ Request failed: ${error.message}`);
  }

  console.log("\n🏁 Target role endpoint testing complete!");
};

// Run the test
testTargetRoleEndpoint().catch(console.error);
