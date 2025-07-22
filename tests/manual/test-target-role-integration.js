// Simple test to verify target role integration with job title generation
const testTargetRoleIntegration = async () => {
  console.log(
    "🔗 Testing target role integration with job title generation...\n"
  );

  const testCases = [
    {
      name: "Software Engineer Path",
      existingTitles: ["Software Engineer", "Senior Developer"],
      testUrl: "https://example.com",
    },
    {
      name: "Project Manager Path",
      existingTitles: ["Project Manager", "Program Manager"],
      testUrl: "https://example.com",
    },
    {
      name: "Data Scientist Path",
      existingTitles: ["Data Scientist", "ML Engineer"],
      testUrl: "https://example.com",
    },
  ];

  for (const testCase of testCases) {
    console.log(`📋 Testing: ${testCase.name}`);
    console.log(`   Input titles: ${testCase.existingTitles.join(", ")}`);

    try {
      // Step 1: Get AI-generated target role
      console.log("   🎯 Getting target role...");
      const targetRoleResponse = await fetch(
        "http://localhost:3001/api/generate-target-role",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            existing_titles: testCase.existingTitles,
            resume_context:
              "Experienced professional with strong technical background.",
            years_experience: 5,
            language: "English",
          }),
        }
      );

      const targetRoleData = await targetRoleResponse.json();
      if (!targetRoleData.success) {
        console.log(`   ❌ Target role failed: ${targetRoleData.error}`);
        continue;
      }

      const targetRole = targetRoleData.target_role;
      console.log(`   ✅ Target role: "${targetRole}"`);

      // Step 2: Test job title generation using the target role
      console.log("   💼 Generating job titles with target role...");

      for (let i = 0; i < 3; i++) {
        const jobTitleResponse = await fetch(
          "http://localhost:3001/api/generate-job-title",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              company_url: testCase.testUrl,
              target_role: targetRole,
              years_experience: 5,
              language: "English",
            }),
          }
        );

        if (jobTitleResponse.ok) {
          const jobTitleData = await jobTitleResponse.json();
          if (jobTitleData.success && jobTitleData.job_title) {
            const generatedTitle = jobTitleData.job_title;
            console.log(`   📝 Generated title ${i + 1}: "${generatedTitle}"`);

            // Check relevance
            const targetKeywords = targetRole.toLowerCase().split(" ");
            const titleLower = generatedTitle.toLowerCase();
            const hasRelevantKeyword = targetKeywords.some(
              (keyword) => keyword.length > 2 && titleLower.includes(keyword)
            );

            if (hasRelevantKeyword) {
              console.log(
                `      ✅ Contains relevant keywords from target role`
              );
            } else {
              console.log(
                `      ⚠️  May not be closely related to target role`
              );
            }
          } else {
            console.log(
              `   ❌ Job title generation failed: ${jobTitleData.error}`
            );
          }
        } else {
          console.log(`   ❌ HTTP Error: ${jobTitleResponse.status}`);
        }

        // Small delay between requests
        await new Promise((resolve) => setTimeout(resolve, 500));
      }
    } catch (error) {
      console.log(`   ❌ Test case failed: ${error.message}`);
    }

    console.log(""); // Empty line for readability
  }

  console.log("🏁 Target role integration testing complete!");
};

// Run the test
testTargetRoleIntegration().catch(console.error);
