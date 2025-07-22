// Test script to validate that resume generation preserves user personal data
const testResumeDataPreservation = async () => {
  console.log("🔒 Testing Resume Data Preservation...\n");

  // Test with a sample original resume
  const originalResume = `IDRIS AILEM EODU

Contact Information:
- Email: idris.ailem@example.com
- Phone: +1 (555) 123-4567
- Location: San Francisco, CA, USA
- LinkedIn: linkedin.com/in/idrisailem
- Portfolio: www.idrisailem.dev

PROFESSIONAL SUMMARY
Results-driven Software Engineer with 8 years of experience in full-stack web development, cloud architecture, and team leadership. Proven track record of delivering scalable solutions and mentoring junior developers.

TECHNICAL SKILLS
Programming Languages: JavaScript, TypeScript, Python, Java, Go
Frontend: React, Vue.js, Angular, HTML5, CSS3, Sass
Backend: Node.js, Express, Django, Spring Boot, FastAPI
Databases: PostgreSQL, MongoDB, Redis, Elasticsearch
Cloud & DevOps: AWS, Docker, Kubernetes, Jenkins, Terraform
Tools: Git, JIRA, Figma, VS Code

WORK EXPERIENCE

Senior Software Engineer | TechCorp Solutions | San Francisco, CA | 2020-01 to Present
• Led development of microservices architecture serving 2M+ daily active users
• Mentored team of 5 junior developers and conducted code reviews
• Implemented CI/CD pipelines reducing deployment time by 70%
• Collaborated with product managers to define technical requirements
• Optimized database queries improving application performance by 45%

Software Engineer | StartupXYZ | San Francisco, CA | 2018-03 to 2019-12
• Built responsive web applications using React and Node.js
• Developed RESTful APIs handling 100K+ requests per day
• Integrated third-party payment systems (Stripe, PayPal)
• Participated in agile development processes and sprint planning
• Wrote comprehensive unit and integration tests

Junior Developer | WebDev Agency | Oakland, CA | 2016-06 to 2018-02
• Created custom WordPress themes and plugins for client websites
• Maintained and updated existing web applications
• Collaborated with design team to implement pixel-perfect UIs
• Learned best practices for version control and team collaboration

EDUCATION
Bachelor of Science in Computer Science
University of California, Berkeley | Berkeley, CA | Graduated: 2016-05

PROJECTS
E-commerce Platform (2019)
- Built full-stack e-commerce solution using MERN stack
- Implemented secure payment processing and user authentication
- Deployed on AWS with auto-scaling and load balancing

Task Management App (2018)  
- Developed React-based task management application
- Used Redux for state management and Firebase for backend
- Implemented real-time collaboration features`;

  const jobTitle = "Project Manager";
  const jobDescription = `We are seeking an experienced Project Manager to lead cross-functional teams and deliver complex software projects on time and within budget. 

Key Responsibilities:
- Manage project timelines, budgets, and deliverables
- Coordinate between engineering, design, and product teams
- Lead agile development processes and sprint planning
- Communicate project status to stakeholders
- Identify and mitigate project risks

Requirements:
- 5+ years of project management experience
- Experience with agile methodologies
- Strong communication and leadership skills
- Technical background preferred
- PMP certification is a plus`;

  try {
    console.log(
      "📋 Testing with Project Manager role (very different from software engineer)..."
    );
    console.log("   Original Name: IDRIS AILEM EODU");
    console.log("   Original Email: idris.ailem@example.com");
    console.log("   Original Phone: +1 (555) 123-4567");
    console.log(
      "   Original Companies: TechCorp Solutions, StartupXYZ, WebDev Agency"
    );
    console.log("");

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
          original_resume: originalResume,
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

    // Test 1: Verify name preservation
    console.log("🔍 Testing Data Preservation:");
    const namePreserved =
      tailoredResume.full_name.includes("IDRIS") ||
      tailoredResume.full_name.includes("AILEM") ||
      tailoredResume.full_name.includes("EODU");
    console.log(
      `   ${namePreserved ? "✅" : "❌"} Name: "${tailoredResume.full_name}" ${
        namePreserved ? "(PRESERVED)" : "(CHANGED - CRITICAL ERROR!)"
      }`
    );

    // Test 2: Verify contact information preservation
    const emailPreserved =
      tailoredResume.contact_information.email === "idris.ailem@example.com";
    console.log(
      `   ${emailPreserved ? "✅" : "❌"} Email: "${
        tailoredResume.contact_information.email
      }" ${emailPreserved ? "(PRESERVED)" : "(CHANGED - CRITICAL ERROR!)"}`
    );

    const phonePreserved =
      tailoredResume.contact_information.phone.includes("555") &&
      tailoredResume.contact_information.phone.includes("123-4567");
    console.log(
      `   ${phonePreserved ? "✅" : "❌"} Phone: "${
        tailoredResume.contact_information.phone
      }" ${phonePreserved ? "(PRESERVED)" : "(CHANGED - CRITICAL ERROR!)"}`
    );

    // Test 3: Verify work experience preservation
    let companiesPreserved = 0;
    const originalCompanies = [
      "TechCorp Solutions",
      "StartupXYZ",
      "WebDev Agency",
    ];

    console.log(`   📊 Work Experience Preservation:`);
    tailoredResume.work_experience.forEach((job, index) => {
      const companyMatch = originalCompanies.some((company) =>
        job.company.includes(company)
      );
      if (companyMatch) companiesPreserved++;

      console.log(
        `      ${companyMatch ? "✅" : "❌"} Job ${index + 1}: "${
          job.job_title
        }" at "${job.company}" ${
          companyMatch ? "(PRESERVED)" : "(CHANGED - CRITICAL ERROR!)"
        }`
      );
      console.log(
        `         Dates: ${job.start_date} to ${job.end_date || "Present"}`
      );
    });

    // Test 4: Verify education preservation
    const educationPreserved = tailoredResume.education.some(
      (edu) =>
        edu.institution.includes("Berkeley") ||
        edu.institution.includes("California")
    );
    console.log(
      `   ${educationPreserved ? "✅" : "❌"} Education: ${
        educationPreserved ? "PRESERVED" : "CHANGED - CRITICAL ERROR!"
      }`
    );

    // Overall assessment
    const criticalIssues = [];
    if (!namePreserved) criticalIssues.push("Name changed");
    if (!emailPreserved) criticalIssues.push("Email changed");
    if (!phonePreserved) criticalIssues.push("Phone changed");
    if (companiesPreserved < originalCompanies.length)
      criticalIssues.push("Work history changed");
    if (!educationPreserved) criticalIssues.push("Education changed");

    console.log("\n🎯 OVERALL ASSESSMENT:");
    if (criticalIssues.length === 0) {
      console.log("   🏆 PERFECT: All personal data preserved correctly!");
      console.log(
        "   ✅ The resume generation now respects user's actual information"
      );
    } else {
      console.log("   ❌ CRITICAL FAILURES:");
      criticalIssues.forEach((issue) => console.log(`      - ${issue}`));
      console.log(
        "\n   🚨 This fails the basic requirement of preserving user data!"
      );
    }

    // Test 5: Verify tailoring occurred
    console.log("\n📝 Testing Content Tailoring:");
    const summaryMentionsManagement =
      tailoredResume.professional_summary.toLowerCase().includes("project") ||
      tailoredResume.professional_summary.toLowerCase().includes("manage") ||
      tailoredResume.professional_summary.toLowerCase().includes("leadership");
    console.log(
      `   ${
        summaryMentionsManagement ? "✅" : "⚠️"
      } Summary tailored for PM role: ${
        summaryMentionsManagement ? "YES" : "NO"
      }`
    );

    const skillsRelevant = tailoredResume.skills.some(
      (skill) =>
        skill.toLowerCase().includes("project") ||
        skill.toLowerCase().includes("agile") ||
        skill.toLowerCase().includes("management")
    );
    console.log(
      `   ${skillsRelevant ? "✅" : "⚠️"} Skills include PM-relevant items: ${
        skillsRelevant ? "YES" : "NO"
      }`
    );
  } catch (error) {
    console.log(`❌ Test failed: ${error.message}`);
  }

  console.log("\n🏁 Resume data preservation testing complete!");
};

// Run the test
testResumeDataPreservation().catch(console.error);
