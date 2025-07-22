// Test with problematic resume formats that might cause AI to fabricate data
const testProblematicFormats = async () => {
  console.log("🔒 Testing Problematic Resume Formats...\n");

  // Test case 1: Minimal/sparse resume that might trigger AI hallucination
  const sparseResume = `Hans Choi
hans.choi@email.com | (555) 987-6543

Work:
- Software Engineer at TechCorp (2020-now)
- Developer at StartupXYZ (2018-2020)

Education: BS Computer Science, University of Washington (2018)`;

  // Test case 2: Unusual formatting that might confuse parsing
  const weirdFormatResume = `RESUME OF: Hans Choi

=== PERSONAL INFO ===
📧 Email: hans.choi@email.com
📱 Phone Number: (555) 987-6543  
🏠 Address: Seattle, WA
🔗 LinkedIn: linkedin.com/in/hanschoi

=== EMPLOYMENT HISTORY ===
► Current Position:
   Software Engineer | TechCorp Inc | Seattle | Jan 2020 → Present
   * Built web applications
   * Fixed bugs and issues
   * Worked on team projects

► Previous Position:  
   Junior Developer | StartupXYZ LLC | Portland | Jun 2018 → Dec 2019
   * Learned programming
   * Helped with websites
   * Attended meetings

=== SCHOOLING ===
► University of Washington, Seattle WA
   Bachelor of Science - Computer Science 
   Graduated: Spring 2018`;

  const jobTitle = "Senior Product Manager";
  const jobDescription = `We seek a Senior Product Manager to drive product strategy and roadmap for our SaaS platform.

Responsibilities:
- Define product vision and strategy
- Manage product roadmap and prioritization
- Work with engineering and design teams
- Analyze user feedback and market trends
- Drive go-to-market strategies

Requirements:
- 5+ years product management experience
- Strong analytical and communication skills
- Experience with agile development
- Technical background preferred`;

  // Test the sparse resume first
  try {
    console.log("📋 Test 1: Sparse/minimal resume format...");
    console.log("   Original: Hans Choi, hans.choi@email.com, (555) 987-6543");
    console.log("   Companies: TechCorp, StartupXYZ");
    console.log("");

    const response1 = await fetch(
      "http://localhost:3000/api/generate-tailored-resume",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          job_title: jobTitle,
          job_description: jobDescription,
          original_resume: sparseResume,
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

    const tailoredResume1 = result1.data.tailored_resume;

    // Check preservation for sparse resume
    const nameOK1 =
      tailoredResume1.full_name.includes("Hans") &&
      tailoredResume1.full_name.includes("Choi");
    const emailOK1 =
      tailoredResume1.contact_information.email === "hans.choi@email.com";
    const phoneOK1 =
      tailoredResume1.contact_information.phone.includes("555") &&
      tailoredResume1.contact_information.phone.includes("987-6543");

    const companiesFound1 = tailoredResume1.work_experience.map((job) =>
      job.company.toLowerCase()
    );
    const techCorpFound1 = companiesFound1.some((c) => c.includes("techcorp"));
    const startupFound1 = companiesFound1.some((c) => c.includes("startup"));

    console.log("🔍 Sparse Resume Results:");
    console.log(
      `   ${nameOK1 ? "✅" : "❌"} Name: "${tailoredResume1.full_name}"`
    );
    console.log(
      `   ${emailOK1 ? "✅" : "❌"} Email: "${
        tailoredResume1.contact_information.email
      }"`
    );
    console.log(
      `   ${phoneOK1 ? "✅" : "❌"} Phone: "${
        tailoredResume1.contact_information.phone
      }"`
    );
    console.log(
      `   ${techCorpFound1 ? "✅" : "❌"} TechCorp: ${
        techCorpFound1 ? "Found" : "Missing"
      }`
    );
    console.log(
      `   ${startupFound1 ? "✅" : "❌"} StartupXYZ: ${
        startupFound1 ? "Found" : "Missing"
      }`
    );

    if (
      !nameOK1 ||
      !emailOK1 ||
      !phoneOK1 ||
      !techCorpFound1 ||
      !startupFound1
    ) {
      console.log("   🚨 SPARSE RESUME CAUSED DATA CORRUPTION!");
      console.log("   📄 What AI Generated:");
      console.log(`      Name: ${tailoredResume1.full_name}`);
      console.log(`      Email: ${tailoredResume1.contact_information.email}`);
      console.log(`      Phone: ${tailoredResume1.contact_information.phone}`);
      tailoredResume1.work_experience.forEach((job, i) => {
        console.log(`      Job ${i + 1}: ${job.job_title} at ${job.company}`);
      });
    }
  } catch (error) {
    console.log(`❌ Sparse resume test failed: ${error.message}`);
  }

  // Test the weird format resume
  try {
    console.log("\n📋 Test 2: Unusual formatting...");

    const response2 = await fetch(
      "http://localhost:3000/api/generate-tailored-resume",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          job_title: jobTitle,
          job_description: jobDescription,
          original_resume: weirdFormatResume,
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

    const tailoredResume2 = result2.data.tailored_resume;

    // Check preservation for weird format resume
    const nameOK2 =
      tailoredResume2.full_name.includes("Hans") &&
      tailoredResume2.full_name.includes("Choi");
    const emailOK2 =
      tailoredResume2.contact_information.email === "hans.choi@email.com";
    const phoneOK2 =
      tailoredResume2.contact_information.phone.includes("555") &&
      tailoredResume2.contact_information.phone.includes("987-6543");

    const companiesFound2 = tailoredResume2.work_experience.map((job) =>
      job.company.toLowerCase()
    );
    const techCorpFound2 = companiesFound2.some((c) => c.includes("techcorp"));
    const startupFound2 = companiesFound2.some((c) => c.includes("startup"));

    console.log("🔍 Weird Format Resume Results:");
    console.log(
      `   ${nameOK2 ? "✅" : "❌"} Name: "${tailoredResume2.full_name}"`
    );
    console.log(
      `   ${emailOK2 ? "✅" : "❌"} Email: "${
        tailoredResume2.contact_information.email
      }"`
    );
    console.log(
      `   ${phoneOK2 ? "✅" : "❌"} Phone: "${
        tailoredResume2.contact_information.phone
      }"`
    );
    console.log(
      `   ${techCorpFound2 ? "✅" : "❌"} TechCorp: ${
        techCorpFound2 ? "Found" : "Missing"
      }`
    );
    console.log(
      `   ${startupFound2 ? "✅" : "❌"} StartupXYZ: ${
        startupFound2 ? "Found" : "Missing"
      }`
    );

    if (
      !nameOK2 ||
      !emailOK2 ||
      !phoneOK2 ||
      !techCorpFound2 ||
      !startupFound2
    ) {
      console.log("   🚨 WEIRD FORMAT CAUSED DATA CORRUPTION!");
      console.log("   📄 What AI Generated:");
      console.log(`      Name: ${tailoredResume2.full_name}`);
      console.log(`      Email: ${tailoredResume2.contact_information.email}`);
      console.log(`      Phone: ${tailoredResume2.contact_information.phone}`);
      tailoredResume2.work_experience.forEach((job, i) => {
        console.log(`      Job ${i + 1}: ${job.job_title} at ${job.company}`);
      });
    }
  } catch (error) {
    console.log(`❌ Weird format test failed: ${error.message}`);
  }

  console.log("\n🏁 Problematic format testing complete!");
};

// Run the test
testProblematicFormats().catch(console.error);
