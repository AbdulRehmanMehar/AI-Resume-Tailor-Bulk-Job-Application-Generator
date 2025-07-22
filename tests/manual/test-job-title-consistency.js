// Test script to validate job title consistency with AI-generated target role
const testJobTitleConsistency = async () => {
  console.log(
    "🎯 Testing job title consistency with AI-generated target role...\n"
  );

  const testScenarios = [
    {
      name: "Software Engineering Career Path",
      existingTitles: [
        "Software Engineer",
        "Senior Developer",
        "Full Stack Engineer",
      ],
      companyUrls: [
        "https://github.com/careers",
        "https://careers.google.com",
        "https://jobs.netflix.com",
        "https://amazon.jobs",
      ],
    },
    {
      name: "Project Management Career Path",
      existingTitles: [
        "Project Manager",
        "Senior Project Manager",
        "Program Manager",
      ],
      companyUrls: [
        "https://microsoft.com/careers",
        "https://apple.com/careers",
        "https://salesforce.com/careers",
        "https://oracle.com/careers",
      ],
    },
    {
      name: "Data Science Career Path",
      existingTitles: [
        "Data Scientist",
        "ML Engineer",
        "AI Research Scientist",
      ],
      companyUrls: [
        "https://research.google.com/careers",
        "https://openai.com/careers",
        "https://uber.com/careers",
        "https://airbnb.com/careers",
      ],
    },
  ];

  for (const scenario of testScenarios) {
    console.log(`📋 Testing scenario: ${scenario.name}`);
    console.log(`   Existing titles: ${scenario.existingTitles.join(", ")}`);

    try {
      // First, get the AI-generated target role
      console.log("   🤖 Step 1: Getting AI-generated target role...");
      const targetRoleResponse = await fetch(
        "http://localhost:3001/api/generate-target-role",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            existing_titles: scenario.existingTitles,
            resume_context:
              "Experienced professional seeking new opportunities in tech industry.",
            years_experience: 5,
            language: "English",
          }),
        }
      );

      if (!targetRoleResponse.ok) {
        console.log(
          `   ❌ Failed to get target role: ${targetRoleResponse.status}`
        );
        continue;
      }

      const targetRoleData = await targetRoleResponse.json();
      if (!targetRoleData.success || !targetRoleData.target_role) {
        console.log(
          `   ❌ Target role generation failed: ${targetRoleData.error}`
        );
        continue;
      }

      const targetRole = targetRoleData.target_role;
      console.log(`   ✅ Target role generated: "${targetRole}"`);

      // Now test job title generation for consistency
      console.log("   🎯 Step 2: Testing job title generation consistency...");

      let consistentTitles = 0;
      let totalTitles = 0;

      for (let i = 0; i < scenario.companyUrls.length; i++) {
        try {
          const jobTitleResponse = await fetch(
            "http://localhost:3001/api/generate-job-title",
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                company_url: scenario.companyUrls[i],
                target_role: targetRole, // Use the AI-generated target role
                years_experience: 5,
                language: "English",
              }),
            }
          );

          if (jobTitleResponse.ok) {
            const jobTitleData = await jobTitleResponse.json();
            if (jobTitleData.success && jobTitleData.job_title) {
              totalTitles++;
              const generatedTitle = jobTitleData.job_title;

              // Check if the generated title is consistent with the target role
              const isConsistent = isJobTitleConsistent(
                generatedTitle,
                targetRole
              );
              if (isConsistent) {
                consistentTitles++;
              }

              console.log(
                `   ${
                  isConsistent ? "✅" : "⚠️ "
                } Generated: "${generatedTitle}" ${
                  isConsistent ? "(consistent)" : "(inconsistent)"
                }`
              );
            }
          }

          // Add delay to avoid rate limiting
          await new Promise((resolve) => setTimeout(resolve, 1000));
        } catch (error) {
          console.log(`   ❌ Error generating job title: ${error.message}`);
        }
      }

      const consistencyRate =
        totalTitles > 0
          ? ((consistentTitles / totalTitles) * 100).toFixed(1)
          : 0;
      console.log(
        `   📊 Consistency rate: ${consistentTitles}/${totalTitles} (${consistencyRate}%)`
      );

      if (consistencyRate >= 80) {
        console.log(`   🎉 EXCELLENT consistency for ${scenario.name}!`);
      } else if (consistencyRate >= 60) {
        console.log(`   👍 GOOD consistency for ${scenario.name}`);
      } else {
        console.log(
          `   📈 Room for improvement in consistency for ${scenario.name}`
        );
      }
    } catch (error) {
      console.log(`   ❌ Scenario failed: ${error.message}`);
    }

    console.log(""); // Empty line for readability
  }

  console.log("🏁 Job title consistency testing complete!");
};

// Helper function to check if a job title is consistent with the target role
const isJobTitleConsistent = (generatedTitle, targetRole) => {
  const generatedLower = generatedTitle.toLowerCase();
  const targetLower = targetRole.toLowerCase();

  // Extract key words from target role
  const targetKeywords = targetLower
    .split(" ")
    .filter(
      (word) =>
        word.length > 2 &&
        ![
          "the",
          "and",
          "for",
          "with",
          "senior",
          "junior",
          "lead",
          "principal",
        ].includes(word)
    );

  // Check if generated title contains key concepts from target role
  return targetKeywords.some((keyword) => generatedLower.includes(keyword));
};

// Run the test
testJobTitleConsistency().catch(console.error);
