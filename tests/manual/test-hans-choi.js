// Test script to validate that resume generation preserves user personal data for Hans Choi
const testHansChoiPreservation = async () => {
  console.log("🔒 Testing Hans Choi Resume Data Preservation...\n");

  // Test with Hans Choi's actual resume (from conversation history)
  const hansChoiResume = `Hans Choi
Senior Software Engineer

Contact Information:
Email: hans.choi@email.com
Phone: (555) 987-6543
Location: Seattle, WA
LinkedIn: linkedin.com/in/hanschoi
GitHub: github.com/hanschoi

PROFESSIONAL SUMMARY
Experienced Senior Software Engineer with 8+ years developing scalable web applications and distributed systems. Proven expertise in full-stack development, cloud architecture, and technical leadership.

TECHNICAL SKILLS
• Programming Languages: JavaScript, TypeScript, Python, Java, Go
• Frontend: React, Vue.js, Next.js, HTML5, CSS3, Tailwind CSS
• Backend: Node.js, Express.js, Django, Spring Boot, FastAPI
• Databases: PostgreSQL, MongoDB, Redis, Elasticsearch
• Cloud: AWS (EC2, Lambda, RDS, S3), Docker, Kubernetes
• Tools: Git, Jenkins, JIRA, Figma

WORK EXPERIENCE

Senior Software Engineer
Tech Innovations Inc. | Seattle, WA | Jan 2020 - Present
• Lead development of microservices architecture serving 1M+ users
• Architected and implemented CI/CD pipelines reducing deployment time by 60%
• Mentored 4 junior developers and conducted technical interviews
• Collaborated with product team to deliver features on aggressive timelines
• Optimized database queries resulting in 40% performance improvement

Software Engineer
Digital Solutions Corp | Seattle, WA | Mar 2018 - Dec 2019
• Built responsive web applications using React and Node.js
• Developed RESTful APIs handling high-traffic loads (50K+ RPM)
• Integrated payment systems (Stripe, PayPal) with robust error handling
• Participated in agile sprint planning and retrospectives
• Maintained 95% code coverage with comprehensive testing

Junior Software Developer
StartupXYZ | Portland, OR | Jun 2016 - Feb 2018
• Developed custom web solutions for client projects
• Worked with design team to implement pixel-perfect user interfaces
• Built and maintained WordPress themes and custom plugins
• Learned industry best practices for code quality and collaboration

EDUCATION
Bachelor of Science in Computer Science
University of Washington | Seattle, WA | 2012-2016
Relevant Coursework: Data Structures, Algorithms, Database Systems, Software Engineering

PROJECTS
E-Commerce Platform (2019)
• Built full-stack application using MERN stack
• Implemented secure authentication and payment processing
• Deployed on AWS with auto-scaling capabilities

Task Management System (2018)
• Developed React-based project management tool
• Used Redux for state management and Firebase backend
• Implemented real-time collaboration features`;

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
      "📋 Testing with Hans Choi's resume for Project Manager role..."
    );
    console.log("   Original Name: Hans Choi");
    console.log("   Original Email: hans.choi@email.com");
    console.log("   Original Phone: (555) 987-6543");
    console.log(
      "   Original Companies: Tech Innovations Inc., Digital Solutions Corp, StartupXYZ"
    );
    console.log("   Original University: University of Washington");
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
          original_resume: hansChoiResume,
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
      tailoredResume.full_name.includes("Hans") &&
      tailoredResume.full_name.includes("Choi");
    console.log(
      `   ${namePreserved ? "✅" : "❌"} Name: "${tailoredResume.full_name}" ${
        namePreserved ? "(PRESERVED)" : "(CHANGED - CRITICAL ERROR!)"
      }`
    );

    // Test 2: Verify contact information preservation
    const emailPreserved =
      tailoredResume.contact_information.email === "hans.choi@email.com";
    console.log(
      `   ${emailPreserved ? "✅" : "❌"} Email: "${
        tailoredResume.contact_information.email
      }" ${emailPreserved ? "(PRESERVED)" : "(CHANGED - CRITICAL ERROR!)"}`
    );

    const phonePreserved =
      tailoredResume.contact_information.phone.includes("555") &&
      tailoredResume.contact_information.phone.includes("987-6543");
    console.log(
      `   ${phonePreserved ? "✅" : "❌"} Phone: "${
        tailoredResume.contact_information.phone
      }" ${phonePreserved ? "(PRESERVED)" : "(CHANGED - CRITICAL ERROR!)"}`
    );

    // Test 3: Verify work experience preservation
    let companiesPreserved = 0;
    const originalCompanies = [
      "Tech Innovations Inc.",
      "Digital Solutions Corp",
      "StartupXYZ",
    ];

    console.log(`   📊 Work Experience Preservation:`);
    tailoredResume.work_experience.forEach((job, index) => {
      const companyMatch = originalCompanies.some(
        (company) =>
          job.company.includes(company.replace(".", "")) ||
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
        edu.institution.includes("Washington") ||
        edu.institution.includes("University of Washington")
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
        "   ✅ The resume generation now respects Hans Choi's actual information"
      );
    } else {
      console.log("   ❌ CRITICAL FAILURES:");
      criticalIssues.forEach((issue) => console.log(`      - ${issue}`));
      console.log(
        "\n   🚨 This fails the basic requirement of preserving user data!"
      );
      console.log("\n   📄 Generated Resume Details:");
      console.log(`      Name: ${tailoredResume.full_name}`);
      console.log(`      Email: ${tailoredResume.contact_information.email}`);
      console.log(`      Phone: ${tailoredResume.contact_information.phone}`);
      console.log("      Companies:");
      tailoredResume.work_experience.forEach((job, i) => {
        console.log(`        ${i + 1}. ${job.company}`);
      });
      console.log("      Education:");
      tailoredResume.education.forEach((edu, i) => {
        console.log(`        ${i + 1}. ${edu.institution}`);
      });
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

  console.log("\n🏁 Hans Choi resume data preservation testing complete!");
};

// Run the test
testHansChoiPreservation().catch(console.error);
