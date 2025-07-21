// Test utility for the generate-tailored-resume endpoint
// Usage: Save this as a .js file and run with Node.js

const testResumeGeneration = async () => {
  const testData = {
    job_title: "AI Engineer",
    job_description: `We are seeking an experienced AI Engineer to join our innovative team. The ideal candidate will have:
    
    - 3+ years of experience in machine learning and AI
    - Strong proficiency in Python, TensorFlow, and PyTorch  
    - Experience with natural language processing and computer vision
    - Knowledge of cloud platforms (AWS, GCP, or Azure)
    - Experience with MLOps and model deployment
    - Strong problem-solving skills and ability to work in a fast-paced environment
    
    Responsibilities:
    - Design and implement machine learning models
    - Collaborate with cross-functional teams
    - Deploy models to production
    - Stay current with AI/ML research and trends`,

    original_resume: `John Smith
    john.smith@email.com
    (555) 123-4567
    San Francisco, CA
    
    EXPERIENCE:
    Software Engineer at TechCorp (2020-2023)
    - Developed web applications using Python and JavaScript
    - Implemented data processing pipelines
    - Worked with databases and APIs
    - Collaborated with team of 5 engineers
    
    Junior Developer at StartupXYZ (2018-2020)
    - Built frontend applications with React
    - Wrote unit tests and documentation
    - Participated in code reviews
    
    EDUCATION:
    B.S. Computer Science, University of California (2014-2018)
    
    SKILLS:
    Python, JavaScript, React, SQL, Git, Docker`,

    additional_context: "Years of experience: 5, Language: English (US)",
  };

  try {
    const response = await fetch(
      "http://localhost:3000/api/generate-tailored-resume",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(testData),
      }
    );

    const result = await response.json();

    if (response.ok) {
      console.log("✅ Success! Resume generated:");
      console.log(JSON.stringify(result.data.tailored_resume, null, 2));
    } else {
      console.log("❌ Error:", result.error);
    }
  } catch (error) {
    console.log("❌ Network Error:", error.message);
  }
};

// Uncomment to run the test
// testResumeGeneration();
