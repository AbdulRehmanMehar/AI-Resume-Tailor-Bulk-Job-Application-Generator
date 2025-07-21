import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const {
      company_url,
      job_title = "",
      job_description = "",
    } = await request.json();

    if (!company_url) {
      return NextResponse.json(
        { error: "Company URL is required" },
        { status: 400 }
      );
    }

    // Create the assistant message with function calling
    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content:
            "You are an expert technical recruiter and skills analyst. Generate focused, relevant skill lists for technical roles based on company requirements and industry standards.",
        },
        {
          role: "user",
          content: `Generate skills for a company with URL: ${company_url}${
            job_title ? ` for the role: ${job_title}` : ""
          }${
            job_description ? ` with job description: ${job_description}` : ""
          }`,
        },
      ],
      functions: [
        {
          name: "generate_job_skills",
          description:
            "Generate a focused list of the most relevant skills typically required for a technical role at the given company using the provided company URL and additional optional job details.",
          parameters: {
            type: "object",
            required: ["company_url", "job_title", "job_description"],
            properties: {
              company_url: {
                type: "string",
                description: "The main website URL of the company.",
              },
              job_title: {
                type: "string",
                description: "Optional: A specific job title, if provided.",
              },
              job_description: {
                type: "string",
                description: "Optional: The job description, if provided.",
              },
            },
            additionalProperties: false,
          },
        },
      ],
      function_call: {
        name: "generate_job_skills",
      },
      temperature: 0.6,
    });

    const functionCall = completion.choices[0]?.message?.function_call;

    if (!functionCall) {
      return NextResponse.json(
        { error: "Failed to generate job skills" },
        { status: 500 }
      );
    }

    // Parse the function arguments
    const functionArgs = JSON.parse(functionCall.arguments || "{}");

    // For demo purposes, we'll generate skills based on the inputs
    // In a real implementation, this would be handled by the assistant
    const domain = company_url
      .replace(/^https?:\/\//, "")
      .replace(/^www\./, "")
      .split(".")[0];
    const companyName = domain.charAt(0).toUpperCase() + domain.slice(1);

    // Define skill sets based on job titles and companies
    const skillSets: { [key: string]: string[] } = {
      "Senior Software Engineer": [
        "JavaScript",
        "TypeScript",
        "React",
        "Node.js",
        "Python",
        "Java",
        "System Design",
        "Microservices",
        "Docker",
        "Kubernetes",
        "AWS",
        "PostgreSQL",
        "Redis",
        "Git",
        "CI/CD",
        "Agile",
        "Leadership",
        "Code Review",
        "Mentoring",
        "Architecture Design",
      ],
      "Full Stack Developer": [
        "JavaScript",
        "TypeScript",
        "React",
        "Vue.js",
        "Node.js",
        "Express.js",
        "HTML5",
        "CSS3",
        "Sass",
        "MongoDB",
        "PostgreSQL",
        "REST APIs",
        "GraphQL",
        "Git",
        "Webpack",
        "Jest",
        "Docker",
        "AWS",
        "Responsive Design",
      ],
      "Frontend Developer": [
        "JavaScript",
        "TypeScript",
        "React",
        "Vue.js",
        "Angular",
        "HTML5",
        "CSS3",
        "Sass",
        "Less",
        "Webpack",
        "Vite",
        "Jest",
        "Cypress",
        "Figma",
        "Adobe XD",
        "Responsive Design",
        "Web Accessibility",
        "Performance Optimization",
        "PWA",
        "Git",
      ],
      "Backend Engineer": [
        "Python",
        "Django",
        "FastAPI",
        "Node.js",
        "Java",
        "Spring Boot",
        "PostgreSQL",
        "MongoDB",
        "Redis",
        "Elasticsearch",
        "Docker",
        "Kubernetes",
        "AWS",
        "Microservices",
        "REST APIs",
        "GraphQL",
        "Message Queues",
        "Caching",
        "Database Design",
        "System Design",
      ],
      "DevOps Engineer": [
        "AWS",
        "Azure",
        "GCP",
        "Docker",
        "Kubernetes",
        "Terraform",
        "Jenkins",
        "GitLab CI",
        "Ansible",
        "Prometheus",
        "Grafana",
        "Linux",
        "Bash",
        "Python",
        "Infrastructure as Code",
        "Monitoring",
        "Log Management",
        "Security",
        "Networking",
      ],
      "Data Engineer": [
        "Python",
        "SQL",
        "Apache Spark",
        "Apache Kafka",
        "Apache Airflow",
        "AWS",
        "Snowflake",
        "BigQuery",
        "ETL",
        "Data Warehousing",
        "Data Lakes",
        "Pandas",
        "NumPy",
        "Docker",
        "Kubernetes",
        "Databricks",
        "dbt",
        "Data Modeling",
        "Stream Processing",
      ],
      "ML Engineer": [
        "Python",
        "TensorFlow",
        "PyTorch",
        "Scikit-learn",
        "Pandas",
        "NumPy",
        "Jupyter",
        "MLOps",
        "Docker",
        "Kubernetes",
        "AWS",
        "Model Deployment",
        "Feature Engineering",
        "Data Pipeline",
        "A/B Testing",
        "Statistics",
        "Linear Algebra",
        "Git",
        "SQL",
      ],
      "Product Engineer": [
        "JavaScript",
        "TypeScript",
        "React",
        "Node.js",
        "Python",
        "Product Analytics",
        "A/B Testing",
        "User Research",
        "SQL",
        "Data Analysis",
        "Git",
        "Agile",
        "Figma",
        "REST APIs",
        "Product Management",
        "User Experience",
        "Growth Hacking",
      ],
      "Platform Engineer": [
        "Kubernetes",
        "Docker",
        "Terraform",
        "AWS",
        "Python",
        "Go",
        "Infrastructure as Code",
        "Monitoring",
        "Service Mesh",
        "API Gateway",
        "Load Balancing",
        "Security",
        "Networking",
        "Linux",
        "Bash",
        "CI/CD",
        "GitOps",
        "Observability",
      ],
    };

    // Company-specific skill additions
    const companySkillAdditions: { [key: string]: string[] } = {
      apple: ["iOS", "Swift", "Objective-C", "Xcode", "Core Data", "UIKit"],
      google: [
        "GCP",
        "Android",
        "Kotlin",
        "TensorFlow",
        "BigQuery",
        "Firebase",
      ],
      microsoft: [
        "Azure",
        ".NET",
        "C#",
        "TypeScript",
        "Power Platform",
        "Office 365",
      ],
      amazon: ["AWS", "DynamoDB", "Lambda", "S3", "EC2", "Alexa Skills"],
      meta: ["React", "GraphQL", "Relay", "Flow", "React Native", "PyTorch"],
      netflix: [
        "Microservices",
        "Scala",
        "Kafka",
        "Cassandra",
        "Hystrix",
        "Spinnaker",
      ],
      uber: ["Go", "React", "Python", "Cassandra", "Redis", "Kafka"],
      airbnb: [
        "React",
        "Ruby on Rails",
        "Kafka",
        "Airflow",
        "Presto",
        "Superset",
      ],
      shopify: [
        "Ruby on Rails",
        "React",
        "GraphQL",
        "Kubernetes",
        "MySQL",
        "Redis",
      ],
      stripe: [
        "Ruby",
        "Scala",
        "React",
        "MongoDB",
        "Kafka",
        "Machine Learning",
      ],
    };

    let skills = skillSets[job_title] || skillSets["Senior Software Engineer"];

    // Add company-specific skills
    const lowerDomain = domain.toLowerCase();
    if (companySkillAdditions[lowerDomain]) {
      skills = [...new Set([...skills, ...companySkillAdditions[lowerDomain]])];
    }

    // Analyze job description for additional skills if provided
    if (job_description) {
      const descriptionLower = job_description.toLowerCase();
      const additionalSkills: string[] = [];

      // Technology keywords in job description
      const techKeywords = [
        { keywords: ["react", "reactjs"], skill: "React" },
        { keywords: ["vue", "vuejs"], skill: "Vue.js" },
        { keywords: ["angular"], skill: "Angular" },
        { keywords: ["node", "nodejs"], skill: "Node.js" },
        { keywords: ["python"], skill: "Python" },
        { keywords: ["java"], skill: "Java" },
        { keywords: ["typescript"], skill: "TypeScript" },
        { keywords: ["aws", "amazon web services"], skill: "AWS" },
        { keywords: ["docker"], skill: "Docker" },
        { keywords: ["kubernetes", "k8s"], skill: "Kubernetes" },
        { keywords: ["postgresql", "postgres"], skill: "PostgreSQL" },
        { keywords: ["mongodb", "mongo"], skill: "MongoDB" },
        { keywords: ["redis"], skill: "Redis" },
        { keywords: ["graphql"], skill: "GraphQL" },
        { keywords: ["microservices"], skill: "Microservices" },
        { keywords: ["terraform"], skill: "Terraform" },
        { keywords: ["jenkins"], skill: "Jenkins" },
        { keywords: ["kafka"], skill: "Apache Kafka" },
        { keywords: ["elasticsearch"], skill: "Elasticsearch" },
        { keywords: ["machine learning", "ml"], skill: "Machine Learning" },
      ];

      for (const tech of techKeywords) {
        if (
          tech.keywords.some((keyword) => descriptionLower.includes(keyword))
        ) {
          additionalSkills.push(tech.skill);
        }
      }

      // Add additional skills found in description
      skills = [...new Set([...skills, ...additionalSkills])];
    }

    // Return top 15-20 most relevant skills
    const finalSkills = skills.slice(0, 18);

    return NextResponse.json({
      skills: finalSkills,
      skills_string: finalSkills.join(", "),
      company: companyName,
      job_title: job_title || "Software Engineer",
      generated_at: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error generating job skills:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
