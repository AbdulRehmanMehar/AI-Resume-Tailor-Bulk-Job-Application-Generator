// Comprehensive test for edge cases that might cause data preservation failures
const testEdgeCases = async () => {
  console.log("🔒 Testing Edge Cases for Data Preservation...\n");

  // Test case with challenging name format and multiple companies
  const edgeCaseResume = `José María Rodríguez-González
Senior Data Scientist & Machine Learning Engineer

📧 Contact Information:
Email: jose.maria.rodriguez@gmail.com  
Phone: +1-415-555-9876
Location: San Francisco, CA, USA
LinkedIn: linkedin.com/in/jose-maria-rodriguez-gonzalez
Website: www.josemaria-ml.dev
GitHub: github.com/jose-maria-rdz

PROFESSIONAL SUMMARY
Bilingual Senior Data Scientist with 10+ years experience in machine learning, statistical modeling, and big data analytics. Proven track record of building production ML systems that drive business impact. Expertise in Python, R, and cloud platforms.

CORE COMPETENCIES
• Machine Learning: Supervised/Unsupervised Learning, Deep Learning, NLP, Computer Vision
• Programming: Python, R, SQL, Scala, Java, JavaScript
• Frameworks: TensorFlow, PyTorch, Scikit-learn, Pandas, NumPy
• Cloud Platforms: AWS (SageMaker, EC2, S3), GCP (BigQuery, Vertex AI), Azure ML
• Databases: PostgreSQL, MongoDB, Cassandra, Snowflake, BigQuery
• Visualization: Tableau, PowerBI, Matplotlib, Seaborn, D3.js

PROFESSIONAL EXPERIENCE

Senior Data Scientist & ML Engineer
Meta (Facebook) | Menlo Park, CA | March 2021 - Present
• Lead cross-functional teams to develop recommendation systems serving 2B+ users
• Built and deployed deep learning models reducing content moderation time by 45%
• Architected MLOps pipeline handling 100TB+ daily data processing
• Mentored 6 junior data scientists and ML engineers
• Published 3 papers at top-tier ML conferences (NeurIPS, ICML)

Data Scientist II  
Uber Technologies | San Francisco, CA | June 2019 - February 2021
• Developed dynamic pricing algorithms increasing revenue by $50M annually
• Built real-time fraud detection system with 99.7% accuracy using ensemble methods
• Led A/B testing framework used by 200+ product experiments
• Collaborated with engineering teams to productionize 15+ ML models
• Reduced customer churn by 23% through predictive modeling

Data Scientist I
Airbnb Inc. | San Francisco, CA | August 2017 - May 2019  
• Created demand forecasting models for host pricing optimization
• Developed NLP models for review sentiment analysis and content classification
• Built data pipelines processing 500M+ events daily using Apache Spark
• Designed experimental frameworks for causal inference and attribution
• Improved search ranking relevance by 18% using learning-to-rank algorithms

Junior Data Analyst
Palantir Technologies | Palo Alto, CA | January 2016 - July 2017
• Analyzed large-scale datasets to identify trends and business insights
• Built automated reporting systems reducing manual work by 80%  
• Created interactive dashboards using Tableau and custom web applications
• Supported client engagements in healthcare and financial services
• Learned advanced statistical methods and data engineering best practices

Research Assistant  
Stanford University - AI Lab | Stanford, CA | September 2014 - December 2015
• Conducted research on deep reinforcement learning under Prof. Andrew Ng
• Co-authored 2 papers on multi-agent learning published in top venues
• Built simulation environments for autonomous vehicle navigation
• Presented findings at 3 international conferences

EDUCATION

Master of Science in Computer Science (Artificial Intelligence Track)  
Stanford University | Stanford, CA | 2014-2016
Thesis: "Deep Reinforcement Learning for Multi-Agent Coordination"
Advisor: Prof. Andrew Ng
GPA: 3.9/4.0

Bachelor of Science in Mathematics & Computer Science (Double Major)
University of California, Berkeley | Berkeley, CA | 2010-2014  
Summa Cum Laude, Phi Beta Kappa
GPA: 3.95/4.0

CERTIFICATIONS
• AWS Certified Machine Learning Specialty (2023)
• Google Cloud Professional ML Engineer (2022)  
• Microsoft Azure AI Engineer Associate (2021)

LANGUAGES
• English: Native proficiency
• Spanish: Native proficiency  
• Portuguese: Professional working proficiency
• French: Conversational proficiency

AWARDS & HONORS
• "40 Under 40 in AI" - VentureBeat (2023)
• Best Paper Award - International Conference on Machine Learning (2022)
• Dean's List - Stanford University (2014-2016)
• Outstanding Graduate Award - UC Berkeley Mathematics Dept (2014)`;

  const jobTitle = "Marketing Manager";
  const jobDescription = `We are seeking a creative and data-driven Marketing Manager to lead our digital marketing efforts and brand strategy.

Key Responsibilities:
- Develop and execute comprehensive marketing campaigns
- Manage social media presence and content strategy  
- Analyze marketing performance and ROI metrics
- Collaborate with sales team to generate qualified leads
- Oversee brand messaging and creative development

Requirements:
- 5+ years of marketing experience
- Strong analytical and creative skills
- Experience with digital marketing tools
- Excellent communication abilities
- Bachelor's degree in Marketing or related field`;

  try {
    console.log(
      "📋 Testing complex resume (José María) for Marketing Manager role..."
    );
    console.log("   Original Name: José María Rodríguez-González");
    console.log("   Original Email: jose.maria.rodriguez@gmail.com");
    console.log("   Original Phone: +1-415-555-9876");
    console.log(
      "   Original Companies: Meta, Uber, Airbnb, Palantir, Stanford"
    );
    console.log("   Original Universities: Stanford University, UC Berkeley");
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
          original_resume: edgeCaseResume,
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

    // Test 1: Verify name preservation (with special characters)
    console.log("🔍 Testing Data Preservation:");
    const namePreserved =
      tailoredResume.full_name.includes("José") &&
      tailoredResume.full_name.includes("María") &&
      tailoredResume.full_name.includes("Rodríguez");
    console.log(
      `   ${namePreserved ? "✅" : "❌"} Name: "${tailoredResume.full_name}" ${
        namePreserved ? "(PRESERVED)" : "(CHANGED - CRITICAL ERROR!)"
      }`
    );

    // Test 2: Verify contact information preservation
    const emailPreserved =
      tailoredResume.contact_information.email ===
      "jose.maria.rodriguez@gmail.com";
    console.log(
      `   ${emailPreserved ? "✅" : "❌"} Email: "${
        tailoredResume.contact_information.email
      }" ${emailPreserved ? "(PRESERVED)" : "(CHANGED - CRITICAL ERROR!)"}`
    );

    const phonePreserved =
      tailoredResume.contact_information.phone.includes("415") &&
      tailoredResume.contact_information.phone.includes("555-9876");
    console.log(
      `   ${phonePreserved ? "✅" : "❌"} Phone: "${
        tailoredResume.contact_information.phone
      }" ${phonePreserved ? "(PRESERVED)" : "(CHANGED - CRITICAL ERROR!)"}`
    );

    // Test 3: Verify work experience preservation (all 5 positions)
    let companiesPreserved = 0;
    const originalCompanies = [
      "Meta",
      "Uber",
      "Airbnb",
      "Palantir",
      "Stanford",
    ];

    console.log(
      `   📊 Work Experience Preservation (${tailoredResume.work_experience.length} of ${originalCompanies.length} expected):`
    );
    tailoredResume.work_experience.forEach((job, index) => {
      const companyMatch = originalCompanies.some((company) =>
        job.company.toLowerCase().includes(company.toLowerCase())
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

    // Test 4: Verify education preservation (both degrees)
    const stanfordPreserved = tailoredResume.education.some((edu) =>
      edu.institution.toLowerCase().includes("stanford")
    );
    const berkeleyPreserved = tailoredResume.education.some((edu) =>
      edu.institution.toLowerCase().includes("berkeley")
    );
    console.log(
      `   ${stanfordPreserved ? "✅" : "❌"} Stanford Education: ${
        stanfordPreserved ? "PRESERVED" : "CHANGED - CRITICAL ERROR!"
      }`
    );
    console.log(
      `   ${berkeleyPreserved ? "✅" : "❌"} Berkeley Education: ${
        berkeleyPreserved ? "PRESERVED" : "CHANGED - CRITICAL ERROR!"
      }`
    );

    // Overall assessment
    const criticalIssues = [];
    if (!namePreserved) criticalIssues.push("Name changed");
    if (!emailPreserved) criticalIssues.push("Email changed");
    if (!phonePreserved) criticalIssues.push("Phone changed");
    if (companiesPreserved < originalCompanies.length)
      criticalIssues.push(
        `Work history incomplete (${companiesPreserved}/${originalCompanies.length})`
      );
    if (!stanfordPreserved || !berkeleyPreserved)
      criticalIssues.push("Education changed");

    console.log("\n🎯 OVERALL ASSESSMENT:");
    if (criticalIssues.length === 0) {
      console.log("   🏆 PERFECT: All personal data preserved correctly!");
    } else {
      console.log("   ❌ CRITICAL FAILURES:");
      criticalIssues.forEach((issue) => console.log(`      - ${issue}`));
      console.log(
        "\n   🚨 This demonstrates the preservation system is not bulletproof!"
      );

      if (companiesPreserved < originalCompanies.length) {
        console.log("\n   📄 Missing Companies Analysis:");
        const foundCompanies = tailoredResume.work_experience.map(
          (job) => job.company
        );
        const missingCompanies = originalCompanies.filter(
          (orig) =>
            !foundCompanies.some((found) =>
              found.toLowerCase().includes(orig.toLowerCase())
            )
        );
        missingCompanies.forEach((missing) => {
          console.log(`      ❌ Missing: ${missing}`);
        });
      }
    }

    // Test 5: Verify completely wrong tailoring (Data Scientist → Marketing Manager)
    console.log("\n📝 Testing Content Tailoring for Cross-Domain Change:");
    const summaryMentionsMarketing =
      tailoredResume.professional_summary.toLowerCase().includes("marketing") ||
      tailoredResume.professional_summary.toLowerCase().includes("brand") ||
      tailoredResume.professional_summary.toLowerCase().includes("campaign");
    console.log(
      `   ${
        summaryMentionsMarketing ? "✅" : "⚠️"
      } Summary mentions marketing concepts: ${
        summaryMentionsMarketing ? "YES" : "NO"
      }`
    );
  } catch (error) {
    console.log(`❌ Test failed: ${error.message}`);
  }

  console.log("\n🏁 Edge case testing complete!");
};

// Run the test
testEdgeCases().catch(console.error);
