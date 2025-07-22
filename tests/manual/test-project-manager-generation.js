// Test AI-powered job content generation for Project Manager role
const testProjectManagerGeneration = async () => {
  console.log("🎯 Testing AI-powered generation for Project Manager role...\n");

  const testCompanyUrl = "https://google.com";
  const jobTitle = "Project Manager";
  const yearsExperience = 5;

  try {
    // Step 1: Test job title generation
    console.log("📋 Testing job title generation...");
    const titleResponse = await fetch(
      "http://localhost:3000/api/generate-job-title",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          company_url: testCompanyUrl,
          target_role: jobTitle,
          years_experience: yearsExperience,
          language: "English",
          context: "Project management professional",
        }),
      }
    );

    if (titleResponse.ok) {
      const titleData = await titleResponse.json();
      if (titleData.success) {
        console.log(`✅ Generated Title: "${titleData.job_title}"`);

        // Check if it's relevant to project management
        const isRelevant =
          titleData.job_title.toLowerCase().includes("project") ||
          titleData.job_title.toLowerCase().includes("program") ||
          titleData.job_title.toLowerCase().includes("manager");
        console.log(
          `   ${isRelevant ? "✅" : "⚠️"} Relevance: ${
            isRelevant ? "GOOD" : "QUESTIONABLE"
          }`
        );
      } else {
        console.log(`❌ Title generation failed: ${titleData.error}`);
      }
    } else {
      console.log(`❌ Title API failed: ${titleResponse.status}`);
    }

    console.log("");

    // Step 2: Test job description generation
    console.log("📝 Testing job description generation...");
    const descResponse = await fetch(
      "http://localhost:3000/api/generate-job-description",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          company_url: testCompanyUrl,
          job_title: jobTitle,
          years_experience: yearsExperience,
          language: "English",
          context:
            "Project management professional with experience in agile methodologies",
        }),
      }
    );

    if (descResponse.ok) {
      const descData = await descResponse.json();
      if (descData.success) {
        const description = descData.job_description;
        console.log(`✅ Generated Description (${description.length} chars):`);
        console.log(
          `   First 200 chars: "${description.substring(0, 200)}..."`
        );

        // Check for project management keywords
        const pmKeywords = [
          "project",
          "agile",
          "scrum",
          "stakeholder",
          "timeline",
          "budget",
          "deliverable",
          "team",
        ];
        const foundKeywords = pmKeywords.filter((keyword) =>
          description.toLowerCase().includes(keyword)
        );
        console.log(
          `   📊 PM Keywords found: ${foundKeywords.length}/${
            pmKeywords.length
          } (${foundKeywords.join(", ")})`
        );

        if (foundKeywords.length >= 4) {
          console.log(`   ✅ Content relevance: EXCELLENT`);
        } else if (foundKeywords.length >= 2) {
          console.log(`   👍 Content relevance: GOOD`);
        } else {
          console.log(`   ⚠️ Content relevance: NEEDS IMPROVEMENT`);
        }
      } else {
        console.log(`❌ Description generation failed: ${descData.error}`);
      }
    } else {
      console.log(`❌ Description API failed: ${descResponse.status}`);
    }

    console.log("");

    // Step 3: Test skills generation
    console.log("🛠️ Testing skills generation...");
    const skillsResponse = await fetch(
      "http://localhost:3000/api/generate-job-skills",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          company_url: testCompanyUrl,
          job_title: jobTitle,
          job_description:
            "Lead cross-functional teams to deliver projects on time and within budget using agile methodologies",
          years_experience: yearsExperience,
          language: "English",
        }),
      }
    );

    if (skillsResponse.ok) {
      const skillsData = await skillsResponse.json();
      if (skillsData.success) {
        const skills = skillsData.skills;
        const skillsArray = skillsData.skills_array || skills.split(", ");
        console.log(`✅ Generated Skills (${skillsArray.length} skills):`);
        console.log(`   Skills: ${skills}`);

        // Check for project management skills
        const pmSkills = [
          "agile",
          "scrum",
          "pmp",
          "project management",
          "stakeholder",
          "jira",
          "confluence",
          "kanban",
        ];
        const foundPMSkills = pmSkills.filter((skill) =>
          skills.toLowerCase().includes(skill.toLowerCase())
        );
        console.log(
          `   📊 PM Skills found: ${foundPMSkills.length}/${
            pmSkills.length
          } (${foundPMSkills.join(", ")})`
        );

        // Check for technical skills that shouldn't be there for PM role
        const techSkills = [
          "javascript",
          "python",
          "java",
          "react",
          "node.js",
          "docker",
          "kubernetes",
        ];
        const foundTechSkills = techSkills.filter((skill) =>
          skills.toLowerCase().includes(skill.toLowerCase())
        );

        if (foundTechSkills.length > 0) {
          console.log(
            `   ⚠️ Unexpected tech skills found: ${foundTechSkills.join(", ")}`
          );
        } else {
          console.log(`   ✅ No inappropriate tech skills found`);
        }

        if (foundPMSkills.length >= 3 && foundTechSkills.length === 0) {
          console.log(`   🏆 Skills relevance: EXCELLENT`);
        } else if (foundPMSkills.length >= 2) {
          console.log(`   👍 Skills relevance: GOOD`);
        } else {
          console.log(`   📈 Skills relevance: NEEDS IMPROVEMENT`);
        }
      } else {
        console.log(`❌ Skills generation failed: ${skillsData.error}`);
      }
    } else {
      console.log(`❌ Skills API failed: ${skillsResponse.status}`);
    }
  } catch (error) {
    console.log(`❌ Test failed: ${error.message}`);
  }

  console.log("\n🏁 Project Manager generation test complete!");
};

// Run the test
testProjectManagerGeneration().catch(console.error);
