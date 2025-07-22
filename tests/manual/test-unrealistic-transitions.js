// Test scenarios that might trigger AI to fabricate data by creating unrealistic job transitions
const testUnrealisticTransitions = async () => {
  console.log(
    "🔒 Testing Unrealistic Job Transitions That Might Trigger Fabrication...\n"
  );

  // Test case: Doctor trying to become Software Engineer - completely unrealistic
  const doctorResume = `Dr. Sarah Chen
Cardiologist

Contact Information:
Email: dr.sarah.chen@hospital.com
Phone: (555) 123-7890
Address: Boston, MA

MEDICAL EDUCATION
Harvard Medical School | MD | 2010-2014
Johns Hopkins University | Residency in Cardiology | 2014-2018
Massachusetts General Hospital | Fellowship | 2018-2020

PROFESSIONAL EXPERIENCE
Senior Cardiologist | Boston Medical Center | 2020-Present
• Perform complex cardiac procedures
• Supervise medical residents
• Research cardiovascular disease

Cardiologist | Mass General Hospital | 2018-2020
• Treated patients with heart conditions  
• Published research papers
• Led medical team

BOARD CERTIFICATIONS
• American Board of Internal Medicine (2018)
• American Board of Cardiovascular Disease (2020)

PUBLICATIONS
• "Novel Approaches to Cardiac Catheterization" - NEJM (2022)
• "Minimally Invasive Heart Surgery Outcomes" - Circulation (2021)`;

  // Test case: Completely different domain with zero overlap
  const librarianResume = `Margaret Thompson
Senior Librarian & Information Specialist

Contact Details:
Email: m.thompson@library.edu
Phone: (555) 456-1234
Location: Chicago, IL

PROFESSIONAL EXPERIENCE

Head Librarian | University of Chicago Library | 2015-Present
• Manage collection of 2.5 million books and digital resources
• Supervise staff of 25 librarians and assistants
• Develop policies for information access and research support
• Coordinate with faculty on academic resource needs
• Lead digital transformation initiatives

Reference Librarian | Chicago Public Library | 2010-2015  
• Assisted patrons with research and information needs
• Organized community reading programs
• Maintained catalog systems and databases
• Conducted information literacy workshops

Library Assistant | Northwestern University | 2008-2010
• Processed new book acquisitions
• Helped students locate research materials
• Maintained library organization systems

EDUCATION
Master of Library and Information Science
University of Illinois at Urbana-Champaign | 2008

Bachelor of Arts in English Literature  
DePaul University | 2006

CERTIFICATIONS
• American Library Association Professional Certification
• Digital Archives Specialist Certificate`;

  const softwareEngineerJob = `Senior Software Engineer

We are seeking a Senior Software Engineer to join our growing engineering team and help build scalable web applications.

Key Responsibilities:
- Design and develop full-stack web applications using React and Node.js
- Build RESTful APIs and microservices architecture
- Implement automated testing and CI/CD pipelines
- Collaborate with product managers and designers
- Mentor junior developers and conduct code reviews
- Optimize application performance and scalability

Requirements:
- 5+ years of software development experience
- Strong proficiency in JavaScript, TypeScript, Python
- Experience with React, Node.js, SQL databases
- Knowledge of cloud platforms (AWS, GCP, or Azure)
- Bachelor's degree in Computer Science or related field
- Experience with agile development methodologies`;

  // Test 1: Doctor → Software Engineer
  try {
    console.log(
      "📋 Test 1: Doctor → Software Engineer (Completely unrealistic)..."
    );
    console.log("   Original: Dr. Sarah Chen, dr.sarah.chen@hospital.com");
    console.log("   Background: Cardiologist with Harvard MD");
    console.log("");

    const response1 = await fetch(
      "http://localhost:3000/api/generate-tailored-resume",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          job_title: "Senior Software Engineer",
          job_description: softwareEngineerJob,
          original_resume: doctorResume,
        }),
      }
    );

    const result1 = await response1.json();
    if (!result1.success) {
      throw new Error(result1.error || "API returned failure");
    }

    const tailoredResume1 = result1.data.tailored_resume;

    // Check if AI preserved the doctor's identity
    const namePreserved1 =
      tailoredResume1.full_name.includes("Sarah") &&
      tailoredResume1.full_name.includes("Chen");
    const emailPreserved1 =
      tailoredResume1.contact_information.email ===
      "dr.sarah.chen@hospital.com";
    const phonePreserved1 =
      tailoredResume1.contact_information.phone.includes("555") &&
      tailoredResume1.contact_information.phone.includes("123-7890");

    // Check if medical background is preserved
    const medicalWork = tailoredResume1.work_experience.some(
      (job) =>
        job.company.toLowerCase().includes("medical") ||
        job.company.toLowerCase().includes("hospital") ||
        job.job_title.toLowerCase().includes("cardiologist")
    );

    const medicalEducation = tailoredResume1.education.some(
      (edu) =>
        edu.institution.toLowerCase().includes("harvard") ||
        edu.institution.toLowerCase().includes("johns hopkins")
    );

    console.log("🔍 Doctor → Software Engineer Results:");
    console.log(
      `   ${namePreserved1 ? "✅" : "❌"} Name: "${
        tailoredResume1.full_name
      }" ${namePreserved1 ? "(PRESERVED)" : "(FABRICATED!)"}`
    );
    console.log(
      `   ${emailPreserved1 ? "✅" : "❌"} Email: "${
        tailoredResume1.contact_information.email
      }" ${emailPreserved1 ? "(PRESERVED)" : "(FABRICATED!)"}`
    );
    console.log(
      `   ${phonePreserved1 ? "✅" : "❌"} Phone: "${
        tailoredResume1.contact_information.phone
      }" ${phonePreserved1 ? "(PRESERVED)" : "(FABRICATED!)"}`
    );
    console.log(
      `   ${medicalWork ? "✅" : "❌"} Medical Work History: ${
        medicalWork ? "PRESERVED" : "FABRICATED NEW TECH JOBS!"
      }`
    );
    console.log(
      `   ${medicalEducation ? "✅" : "❌"} Medical Education: ${
        medicalEducation ? "PRESERVED" : "FABRICATED NEW EDUCATION!"
      }`
    );

    if (
      !namePreserved1 ||
      !emailPreserved1 ||
      !phonePreserved1 ||
      !medicalWork ||
      !medicalEducation
    ) {
      console.log(
        "   🚨 CRITICAL: AI FABRICATED DATA FOR UNREALISTIC TRANSITION!"
      );
      console.log("   📄 What AI Generated Instead:");
      console.log(`      Name: ${tailoredResume1.full_name}`);
      console.log(`      Email: ${tailoredResume1.contact_information.email}`);
      console.log("      Work History:");
      tailoredResume1.work_experience.forEach((job, i) => {
        console.log(
          `        ${i + 1}. ${job.job_title} at ${job.company} (${
            job.start_date
          } - ${job.end_date || "Present"})`
        );
      });
      console.log("      Education:");
      tailoredResume1.education.forEach((edu, i) => {
        console.log(`        ${i + 1}. ${edu.degree} at ${edu.institution}`);
      });
    }
  } catch (error) {
    console.log(`❌ Doctor test failed: ${error.message}`);
  }

  // Test 2: Librarian → Software Engineer
  try {
    console.log("\n📋 Test 2: Librarian → Software Engineer...");
    console.log("   Original: Margaret Thompson, m.thompson@library.edu");
    console.log("   Background: Senior Librarian at University of Chicago");
    console.log("");

    const response2 = await fetch(
      "http://localhost:3000/api/generate-tailored-resume",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          job_title: "Senior Software Engineer",
          job_description: softwareEngineerJob,
          original_resume: librarianResume,
        }),
      }
    );

    const result2 = await response2.json();
    if (!result2.success) {
      throw new Error(result2.error || "API returned failure");
    }

    const tailoredResume2 = result2.data.tailored_resume;

    const namePreserved2 =
      tailoredResume2.full_name.includes("Margaret") &&
      tailoredResume2.full_name.includes("Thompson");
    const emailPreserved2 =
      tailoredResume2.contact_information.email === "m.thompson@library.edu";
    const phonePreserved2 =
      tailoredResume2.contact_information.phone.includes("555") &&
      tailoredResume2.contact_information.phone.includes("456-1234");

    const libraryWork = tailoredResume2.work_experience.some(
      (job) =>
        job.company.toLowerCase().includes("library") ||
        job.company.toLowerCase().includes("chicago") ||
        job.job_title.toLowerCase().includes("librarian")
    );

    const libraryEducation = tailoredResume2.education.some(
      (edu) =>
        edu.degree.toLowerCase().includes("library") ||
        edu.degree.toLowerCase().includes("information") ||
        edu.institution.toLowerCase().includes("illinois") ||
        edu.institution.toLowerCase().includes("depaul")
    );

    console.log("🔍 Librarian → Software Engineer Results:");
    console.log(
      `   ${namePreserved2 ? "✅" : "❌"} Name: "${
        tailoredResume2.full_name
      }" ${namePreserved2 ? "(PRESERVED)" : "(FABRICATED!)"}`
    );
    console.log(
      `   ${emailPreserved2 ? "✅" : "❌"} Email: "${
        tailoredResume2.contact_information.email
      }" ${emailPreserved2 ? "(PRESERVED)" : "(FABRICATED!)"}`
    );
    console.log(
      `   ${phonePreserved2 ? "✅" : "❌"} Phone: "${
        tailoredResume2.contact_information.phone
      }" ${phonePreserved2 ? "(PRESERVED)" : "(FABRICATED!)"}`
    );
    console.log(
      `   ${libraryWork ? "✅" : "❌"} Library Work History: ${
        libraryWork ? "PRESERVED" : "FABRICATED NEW TECH JOBS!"
      }`
    );
    console.log(
      `   ${libraryEducation ? "✅" : "❌"} Library Education: ${
        libraryEducation ? "PRESERVED" : "FABRICATED NEW EDUCATION!"
      }`
    );

    if (
      !namePreserved2 ||
      !emailPreserved2 ||
      !phonePreserved2 ||
      !libraryWork ||
      !libraryEducation
    ) {
      console.log(
        "   🚨 CRITICAL: AI FABRICATED DATA FOR UNREALISTIC TRANSITION!"
      );
      console.log("   📄 What AI Generated Instead:");
      console.log(`      Name: ${tailoredResume2.full_name}`);
      console.log(`      Email: ${tailoredResume2.contact_information.email}`);
      console.log("      Work History:");
      tailoredResume2.work_experience.forEach((job, i) => {
        console.log(
          `        ${i + 1}. ${job.job_title} at ${job.company} (${
            job.start_date
          } - ${job.end_date || "Present"})`
        );
      });
      console.log("      Education:");
      tailoredResume2.education.forEach((edu, i) => {
        console.log(`        ${i + 1}. ${edu.degree} at ${edu.institution}`);
      });
    }
  } catch (error) {
    console.log(`❌ Librarian test failed: ${error.message}`);
  }

  console.log("\n🏁 Unrealistic transition testing complete!");
  console.log("💡 If these tests pass, the AI system is very robust!");
  console.log(
    "🚨 If these tests fail, we've found conditions that trigger fabrication!"
  );
};

// Run the test
testUnrealisticTransitions().catch(console.error);
