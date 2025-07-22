// Final comprehensive test to validate the entire system
const finalSystemValidation = async () => {
  console.log("🏆 FINAL SYSTEM VALIDATION - Comprehensive Testing\n");

  const testCases = [
    {
      name: "Real Hans Choi Resume",
      resume: `Hans Choi

| Anchorage, AK | Open to Travel / Relocation / Demanding Schedules

EDUCATION
Master of Science, Cybersecurity and Information Assurance (Expected Dec 2025) Western Governors University
Bachelor of Science, Cybersecurity and Information Assurance Western Governors University

EXPERIENCE
IT Administrator Coordinator March 2025 - Present
Alaska Communications / Granite Construction, Inc.

Sr. Certified Computer Technician August 2024 - March 2025 Galena City School District

Technical Support Technician March 2024 - June 2024 Covetrus`,
      jobTitle: "Senior Software Engineer",
      expectedName: "Hans Choi",
      expectedLocation: "Anchorage, AK",
      expectedCompanies: ["Alaska Communications", "Galena City", "Covetrus"],
      expectedEducation: "Western Governors",
    },
    {
      name: "Complex International Name",
      resume: `José María Rodríguez-González
Email: jose.rodriguez@email.com
Phone: +34-612-345-678
Location: Madrid, Spain

EXPERIENCE
Senior Data Scientist | Meta | 2021-Present
Data Scientist | Google | 2019-2021

EDUCATION
PhD Computer Science | Universidad Politécnica de Madrid | 2019`,
      jobTitle: "Product Manager",
      expectedName: "José María",
      expectedEmail: "jose.rodriguez@email.com",
      expectedPhone: "612-345-678",
      expectedCompanies: ["Meta", "Google"],
      expectedEducation: "Madrid",
    },
  ];

  let totalTests = 0;
  let passedTests = 0;

  for (const testCase of testCases) {
    console.log(`📋 Testing: ${testCase.name}`);
    totalTests++;

    try {
      const response = await fetch(
        "http://localhost:3000/api/generate-tailored-resume",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            job_title: testCase.jobTitle,
            job_description: "Standard job description for testing...",
            original_resume: testCase.resume,
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const result = await response.json();
      if (!result.success) {
        throw new Error(result.error);
      }

      const resume = result.data.tailored_resume;
      let issues = [];

      // Validate name
      if (
        testCase.expectedName &&
        !resume.full_name.includes(testCase.expectedName)
      ) {
        issues.push(
          `Name mismatch: expected "${testCase.expectedName}", got "${resume.full_name}"`
        );
      }

      // Validate email
      if (
        testCase.expectedEmail &&
        resume.contact_information.email !== testCase.expectedEmail
      ) {
        issues.push(
          `Email mismatch: expected "${testCase.expectedEmail}", got "${resume.contact_information.email}"`
        );
      }

      // Validate phone
      if (testCase.expectedPhone) {
        const originalPhoneDigits = testCase.expectedPhone.replace(
          /[^\d]/g,
          ""
        );
        const generatedPhoneDigits = resume.contact_information.phone.replace(
          /[^\d]/g,
          ""
        );
        if (!generatedPhoneDigits.includes(originalPhoneDigits)) {
          issues.push(
            `Phone mismatch: expected "${testCase.expectedPhone}", got "${resume.contact_information.phone}"`
          );
        }
      }

      // Validate companies
      if (testCase.expectedCompanies) {
        const resumeCompanies = resume.work_experience.map((job) =>
          job.company.toLowerCase()
        );
        const missingCompanies = testCase.expectedCompanies.filter(
          (company) =>
            !resumeCompanies.some((rc) => rc.includes(company.toLowerCase()))
        );
        if (missingCompanies.length > 0) {
          issues.push(`Missing companies: ${missingCompanies.join(", ")}`);
        }
      }

      // Validate education
      if (testCase.expectedEducation) {
        const hasEducation = resume.education.some((edu) =>
          edu.institution
            .toLowerCase()
            .includes(testCase.expectedEducation.toLowerCase())
        );
        if (!hasEducation) {
          issues.push(
            `Education missing: expected "${testCase.expectedEducation}"`
          );
        }
      }

      if (issues.length === 0) {
        console.log(`   ✅ PASSED: All data preserved correctly`);
        passedTests++;
      } else {
        console.log(`   ❌ FAILED: ${issues.join("; ")}`);
        console.log(`      Generated Name: ${resume.full_name}`);
        console.log(
          `      Generated Email: ${resume.contact_information.email}`
        );
        console.log(
          `      Generated Phone: ${resume.contact_information.phone}`
        );
      }
    } catch (error) {
      console.log(`   💥 ERROR: ${error.message}`);
    }

    console.log("");
  }

  console.log("🎯 FINAL RESULTS:");
  console.log(
    `   Tests Passed: ${passedTests}/${totalTests} (${(
      (passedTests / totalTests) *
      100
    ).toFixed(1)}%)`
  );

  if (passedTests === totalTests) {
    console.log("   🏆 SYSTEM STATUS: EXCELLENT");
    console.log("   ✅ All data preservation tests passed!");
    console.log("   ✅ The resume tailoring system is working reliably");
    console.log(
      "   💡 The system successfully preserves user data while tailoring content"
    );
  } else {
    console.log("   ⚠️ SYSTEM STATUS: NEEDS IMPROVEMENT");
    console.log("   🔧 Some data preservation issues detected");
    console.log("   📝 Consider implementing additional safeguards");
  }

  console.log("\n🏁 Final system validation complete!");
};

// Run the validation
finalSystemValidation().catch(console.error);
