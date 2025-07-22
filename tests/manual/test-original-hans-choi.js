// Test with the exact Hans Choi resume from the user's example
const testOriginalHansChoi = async () => {
  console.log(
    "🔒 Testing Original Hans Choi Resume (from user's example)...\n"
  );

  // Use the EXACT resume text from the user's request
  const originalHansChoiResume = `Hans Choi

| Anchorage, AK | Open to Travel / Relocation / Demanding Schedules

EDUCATION

Master of Science, Cybersecurity and Information Assurance (Expected Dec 2025) Western Governors University

Bachelor of Science, Cybersecurity and Information Assurance Western Governors University

CERTIFICATIONS

CompTIA:

SecurityX (Previously CASP+) Expected by August, 2025

PenTest+ (Penetration Tester+) Active

CySA+ (Cybersecurity Analyst+) Active

Security+ Active

Network+ Active

A+ Active

Project+ Active

(ISC)²:

SSCP (Systems Security Certified Practitioner) Active

AXELOS:

ITILv4 Foundation Active

Linux Professional Institute (LPI):

Linux Essentials Active

Additional Certifications:

Google IT Support Professional Google | Coursera

Dell Client Foundations DELL Technologies

PowerEdge Corrective Maintenance DELL Technologies

International Certifications:

Word Processor Specialist Korean National Technical Qualification

Information Technology Qualification - Hancom (ITQ) Korea Productivity Center

Graphic Technology Qualification - Adobe Photoshop (GTQ) Korea Productivity Center

PROJECTS

AI-Driven Post-Quantum Cryptography Readiness Tool

https://mirospqc-lab.mirostek.com

Technology/Tools Used: TLS/SSL analysis, SSLyze, OpenAI Engine, HTML, Python, PQC, NIST-PQC, Agile, OWASP, Google Cloud, Flask, Gunicorn, SSH, uWSGI, Automation

Developed a web tool analyzing TLS/SSL configurations for PQC readiness using AI recommendations.

Implementing a SOC and Honeynet in Azure

https://hanschoihot.blogspot.com/2023/12/siemazure-sentinel-live-cyber-attacks.html

Technology/Tools Used: Azure Virtual Machines, Microsoft Sentinel (SIEM), Log Analytics, Security Analytics

Deployed Azure Sentinel to monitor live RDP attacks on honeypot VMs, visualized geolocation data.

Home Lab: Virtual Active Directory Environment Setup

https://hanschoihot.blogspot.com/2023/12/home-lab-active-directory-setup-with.html

Technology/Tools Used: Oracle VirtualBox, Virtual Machines, Active Directory, Windows Server, Windows OS

Configured AD environment with Oracle VirtualBox, including DHCP, user management, and networking.

- 1 -


EXPERIENCE

IT Administrator Coordinator March 2025 - Present

Alaska Communications / Granite Construction, Inc.

Responsible for managing and supporting all IT infrastructure, hardware, software, and network systems across the entire state of Alaska for business operations and construction projects.

Collaborate directly with project managers to plan, deploy, and maintain IT systems at construction sites statewide.

Administer user accounts, security permissions, asset management, system upgrades, and software deployments.

Provide troubleshooting, technical support, and end-user training to ensure reliable and secure IT operations.

Sr. Certified Computer Technician August 2024 - March 2025 Galena City School District

Delivered IT support, infrastructure management (LAN, WLAN, WAN), and cloud services (Azure, Microsoft 365) across Alaska offices.

Managed networks, user accounts, system upgrades, IT assets, and earned DELL Certified Direct Tech credential, reducing costs with on-site repairs.

Led weekly technician certification training, monthly staff IT training, and developed SOPs to standardize IT operations.

Supported PowerSchool systems handling sensitive student PII and PHI, and directed the transition and management of service desk platforms using ITIL best practices.

Technical Support Technician March 2024 - June 2024 Covetrus

Utilized SQL to query and analyze user data for troubleshooting and issue resolution.

Delivered remote technical support and customer service for veterinary practice management software.

Reported software bugs and contributed to bug reports and fixes through Splunk during support operations.

Resolved technical issues, improved client satisfaction, and optimized workflow productivity.

Cyber Warfare Technician & Cyber Mission Specialist Recruit July 2022 - December 2023

U.S. Navy & U.S. Coast Guard

Enlisted in the U.S. Navy for Cyber Warfare Technician training.

Later pursued a Cyber Mission Specialist role with the U.S. Coast Guard.

Gained exposure to military concepts, operations, and protocols.

Transitioned focus to cybersecurity education, pursuing a degree and industry-recognized IT certifications.

Help Desk September 2015 - January 2020

Hyunsoo Transportation, Inc.

Managed entry level Help Desk operations, providing technical support for employees and truck drivers.

Supported Hancom Office, and business applications; handled customer issues and complaint resolution.

Performed office PC repairs, data entry, form creation, document scanning, and maintained data confidentiality.

Utilized Excel for quality tracking and earned Korean national IT certifications to enhance business operations.

SKILLS & ACCOMPLISHMENTS

Languages: Korean (Fluent), English (Fluent)

Technical Interests: AI, Governance/Risk/Compliance (GRC), IT Infrastructure, Server Administration, Vulnerability Management, Cloud IAM, Log & Security Analytics, IT Project Coordination Accomplishments: Excellence Award for Legal Issues in Information Security (Western Governors University)`;

  const jobTitle = "Machine Learning Engineer";
  const jobDescription = `We are seeking a Machine Learning Engineer to join our AI team and develop cutting-edge ML solutions.

Key Responsibilities:
- Design and implement machine learning models
- Work with large datasets and data pipelines
- Deploy ML models to production environments
- Collaborate with data scientists and engineers
- Optimize model performance and scalability

Requirements:
- 3+ years of machine learning experience
- Strong programming skills in Python
- Experience with TensorFlow, PyTorch, or similar
- Knowledge of cloud platforms (AWS, GCP, Azure)
- Bachelor's degree in Computer Science or related field`;

  try {
    console.log("📋 Testing Hans Choi's ACTUAL resume for ML Engineer role...");
    console.log("   Original Name: Hans Choi");
    console.log("   Original Location: Anchorage, AK");
    console.log("   Original Background: IT/Cybersecurity Professional");
    console.log(
      "   Original Companies: Alaska Communications, Galena City School District, Covetrus, U.S. Navy/Coast Guard, Hyunsoo Transportation"
    );
    console.log(
      "   Original Education: Western Governors University (MS & BS Cybersecurity)"
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
          original_resume: originalHansChoiResume,
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP ${response.status}: ${errorText}`);
    }

    const result = await response.json();
    if (!result.success) {
      throw new Error(result.error || "API returned failure");
    }

    const tailoredResume = result.data.tailored_resume;

    // Check name preservation
    const namePreserved =
      tailoredResume.full_name.includes("Hans") &&
      tailoredResume.full_name.includes("Choi");
    console.log("🔍 Critical Data Preservation Check:");
    console.log(
      `   ${namePreserved ? "✅" : "❌"} Name: "${tailoredResume.full_name}" ${
        namePreserved ? "(PRESERVED)" : "(FABRICATED!)"
      }`
    );

    // Check if AI fabricated contact info
    const hasEmail = tailoredResume.contact_information.email;
    const hasPhone = tailoredResume.contact_information.phone;
    const hasLocation = tailoredResume.contact_information.location;

    console.log(
      `   📧 Email: "${hasEmail || "Not provided"}" ${
        hasEmail ? "(Generated - original had none)" : "(Correct)"
      }`
    );
    console.log(
      `   📱 Phone: "${hasPhone || "Not provided"}" ${
        hasPhone ? "(Generated - original had none)" : "(Correct)"
      }`
    );
    console.log(
      `   📍 Location: "${hasLocation || "Not provided"}" ${
        hasLocation?.includes("Anchorage")
          ? "(PRESERVED)"
          : hasLocation
          ? "(CHANGED!)"
          : "(Not provided)"
      }`
    );

    // Check work experience - should preserve all 5 companies
    const originalCompanies = [
      "Alaska Communications",
      "Granite Construction",
      "Galena City School District",
      "Covetrus",
      "U.S. Navy",
      "U.S. Coast Guard",
      "Hyunsoo Transportation",
    ];

    console.log(
      `\n   📊 Work Experience (${tailoredResume.work_experience.length} positions found):`
    );
    let companiesPreserved = 0;
    tailoredResume.work_experience.forEach((job, i) => {
      const companyMatch = originalCompanies.some(
        (company) =>
          job.company.toLowerCase().includes(company.toLowerCase()) ||
          company.toLowerCase().includes(job.company.toLowerCase())
      );
      if (companyMatch) companiesPreserved++;

      console.log(
        `      ${companyMatch ? "✅" : "❌"} ${i + 1}. "${job.job_title}" at "${
          job.company
        }" (${job.start_date || "No date"} - ${job.end_date || "Present"})`
      );
    });

    // Check education preservation
    const educationPreserved = tailoredResume.education.some(
      (edu) =>
        edu.institution.toLowerCase().includes("western governors") ||
        (edu.institution.toLowerCase().includes("western") &&
          edu.institution.toLowerCase().includes("governors"))
    );
    console.log(
      `\n   🎓 Education: ${
        educationPreserved
          ? "✅ PRESERVED (Western Governors University)"
          : "❌ CHANGED!"
      }`
    );
    if (tailoredResume.education.length > 0) {
      tailoredResume.education.forEach((edu, i) => {
        console.log(`      ${i + 1}. ${edu.degree} at ${edu.institution}`);
      });
    }

    // Overall assessment for this specific case
    const criticalIssues = [];
    if (!namePreserved) criticalIssues.push("Name fabricated");
    if (companiesPreserved < 3)
      criticalIssues.push(
        `Work history severely incomplete (${companiesPreserved}/7+ companies)`
      ); // Allow some flexibility since some companies might be combined
    if (!educationPreserved) criticalIssues.push("Education changed");

    console.log("\n🎯 FINAL ASSESSMENT FOR HANS CHOI:");
    if (criticalIssues.length === 0) {
      console.log("   🏆 EXCELLENT: All critical data preserved!");
      console.log(
        "   ✅ This resume correctly preserves Hans Choi's actual background"
      );
    } else {
      console.log("   ❌ CRITICAL FAILURES:");
      criticalIssues.forEach((issue) => console.log(`      - ${issue}`));
      console.log(
        "\n   🚨 This demonstrates the exact problem mentioned in the issue!"
      );
      console.log(
        "   📋 The AI is fabricating data instead of preserving Hans Choi's actual information"
      );
    }

    // Check if it shows signs of ML background fabrication
    const summaryHasML =
      tailoredResume.professional_summary
        .toLowerCase()
        .includes("machine learning") ||
      tailoredResume.professional_summary.toLowerCase().includes("ml ") ||
      tailoredResume.professional_summary.toLowerCase().includes("ai");

    const skillsHasML = tailoredResume.skills.some(
      (skill) =>
        skill.toLowerCase().includes("tensorflow") ||
        skill.toLowerCase().includes("pytorch") ||
        skill.toLowerCase().includes("machine learning") ||
        skill.toLowerCase().includes("python")
    );

    console.log("\n🤖 ML Content Analysis:");
    console.log(
      `   Summary mentions ML/AI: ${
        summaryHasML ? "YES (good tailoring)" : "NO (might be too conservative)"
      }`
    );
    console.log(
      `   Skills include ML tools: ${
        skillsHasML ? "YES (good tailoring)" : "NO (might be too conservative)"
      }`
    );
  } catch (error) {
    console.log(`❌ Test failed: ${error.message}`);
  }

  console.log("\n🏁 Hans Choi original resume testing complete!");
};

// Run the test
testOriginalHansChoi().catch(console.error);
