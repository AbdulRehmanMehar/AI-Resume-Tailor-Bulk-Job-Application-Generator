// Test for consistency - run the same test multiple times to check for intermittent failures
const testConsistency = async () => {
  console.log("🔒 Testing Consistency Across Multiple API Calls...\n");

  const testResume = `Hans Choi
Senior Software Engineer

Email: hans.choi@email.com
Phone: (555) 987-6543
Location: Seattle, WA

EXPERIENCE
Senior Software Engineer | Tech Innovations Inc. | 2020-Present
Software Engineer | Digital Solutions Corp | 2018-2020
Junior Developer | StartupXYZ | 2016-2018

EDUCATION  
BS Computer Science | University of Washington | 2016`;

  const jobTitle = "Project Manager";
  const jobDescription =
    "We need an experienced Project Manager to lead our engineering teams...";

  const NUM_TESTS = 5;
  let successCount = 0;
  let failures = [];

  for (let i = 1; i <= NUM_TESTS; i++) {
    try {
      console.log(`📋 Test Run ${i}/${NUM_TESTS}...`);

      const response = await fetch(
        "http://localhost:3000/api/generate-tailored-resume",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            job_title: jobTitle,
            job_description: jobDescription,
            original_resume: testResume,
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      if (!result.success) {
        throw new Error(result.error || "API returned failure");
      }

      const tailoredResume = result.data.tailored_resume;

      // Check preservation
      const nameOK =
        tailoredResume.full_name.includes("Hans") &&
        tailoredResume.full_name.includes("Choi");
      const emailOK =
        tailoredResume.contact_information.email === "hans.choi@email.com";
      const phoneOK =
        tailoredResume.contact_information.phone.includes("555") &&
        tailoredResume.contact_information.phone.includes("987-6543");

      const companies = tailoredResume.work_experience.map((job) =>
        job.company.toLowerCase()
      );
      const techInnovationsFound = companies.some(
        (c) => c.includes("tech") && c.includes("innovation")
      );
      const digitalSolutionsFound = companies.some(
        (c) => c.includes("digital") && c.includes("solution")
      );
      const startupFound = companies.some((c) => c.includes("startup"));

      const allCompaniesFound =
        techInnovationsFound && digitalSolutionsFound && startupFound;
      const educationOK = tailoredResume.education.some((edu) =>
        edu.institution.toLowerCase().includes("washington")
      );

      const allPreserved =
        nameOK && emailOK && phoneOK && allCompaniesFound && educationOK;

      if (allPreserved) {
        console.log(`   ✅ Run ${i}: All data preserved correctly`);
        successCount++;
      } else {
        console.log(`   ❌ Run ${i}: Data corruption detected!`);
        failures.push({
          run: i,
          name: tailoredResume.full_name,
          email: tailoredResume.contact_information.email,
          phone: tailoredResume.contact_information.phone,
          companies: companies,
          education: tailoredResume.education.map((edu) => edu.institution),
          issues: {
            nameOK,
            emailOK,
            phoneOK,
            techInnovationsFound,
            digitalSolutionsFound,
            startupFound,
            educationOK,
          },
        });
      }

      // Small delay to avoid rate limiting
      await new Promise((resolve) => setTimeout(resolve, 1000));
    } catch (error) {
      console.log(`   💥 Run ${i}: API Error - ${error.message}`);
      failures.push({
        run: i,
        error: error.message,
      });
    }
  }

  console.log("\n🎯 CONSISTENCY TEST RESULTS:");
  console.log(
    `   Success Rate: ${successCount}/${NUM_TESTS} (${(
      (successCount / NUM_TESTS) *
      100
    ).toFixed(1)}%)`
  );

  if (failures.length > 0) {
    console.log("\n❌ FAILURES DETECTED:");
    failures.forEach((failure) => {
      if (failure.error) {
        console.log(`   Run ${failure.run}: API Error - ${failure.error}`);
      } else {
        console.log(`   Run ${failure.run}: Data Issues`);
        console.log(
          `     Name: "${failure.name}" (${
            failure.issues.nameOK ? "OK" : "CHANGED"
          })`
        );
        console.log(
          `     Email: "${failure.email}" (${
            failure.issues.emailOK ? "OK" : "CHANGED"
          })`
        );
        console.log(
          `     Phone: "${failure.phone}" (${
            failure.issues.phoneOK ? "OK" : "CHANGED"
          })`
        );
        console.log(`     Companies: [${failure.companies.join(", ")}]`);
        console.log(
          `       Tech Innovations: ${
            failure.issues.techInnovationsFound ? "Found" : "Missing"
          }`
        );
        console.log(
          `       Digital Solutions: ${
            failure.issues.digitalSolutionsFound ? "Found" : "Missing"
          }`
        );
        console.log(
          `       StartupXYZ: ${
            failure.issues.startupFound ? "Found" : "Missing"
          }`
        );
        console.log(
          `     Education: [${failure.education.join(", ")}] (${
            failure.issues.educationOK ? "OK" : "CHANGED"
          })`
        );
      }
    });
    console.log(
      "\n🚨 INCONSISTENT BEHAVIOR DETECTED! The AI sometimes fabricates data!"
    );
  } else {
    console.log("\n🏆 PERFECT CONSISTENCY! All runs preserved data correctly.");
    console.log("✅ The data preservation system is working reliably.");
  }

  console.log("\n🏁 Consistency testing complete!");
};

// Run the test
testConsistency().catch(console.error);
