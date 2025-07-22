import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import fs from "fs";
import path from "path";

// Use file-based storage for job data (in production, use Redis or database)
const STORAGE_DIR = path.join(process.cwd(), ".tmp");
const ensureStorageDir = () => {
  if (!fs.existsSync(STORAGE_DIR)) {
    fs.mkdirSync(STORAGE_DIR, { recursive: true });
  }
};

const getJobData = (taskId: string) => {
  ensureStorageDir();
  const filePath = path.join(STORAGE_DIR, `${taskId}.json`);
  try {
    if (fs.existsSync(filePath)) {
      const data = fs.readFileSync(filePath, "utf-8");
      return JSON.parse(data);
    }
  } catch (error) {
    console.error(`Error reading job data for ${taskId}:`, error);
  }
  return null;
};

export async function GET(request: NextRequest) {
  try {
    console.log(`Full request URL: ${request.url}`);
    const { searchParams } = new URL(request.url);
    const taskId = searchParams.get("taskId");

    console.log(`Checking status for taskId: ${taskId}`);

    if (!taskId || taskId === "undefined") {
      console.error(`Missing or invalid taskId: ${taskId}`);
      return NextResponse.json(
        { error: "Missing or invalid taskId." },
        { status: 400 }
      );
    }

    const jobData = getJobData(taskId);

    if (!jobData) {
      return NextResponse.json(
        { error: "Task not found or expired." },
        { status: 404 }
      );
    }

    console.log(`Job status: ${jobData.status}`);

    if (jobData.status === "completed") {
      return NextResponse.json({
        status: "completed",
        resume: jobData.resumeText,
        resumeUrl: jobData.resumeUrl,
        textUrl: jobData.textUrl,
      });
    } else if (jobData.status === "error") {
      return NextResponse.json({
        status: "error",
        error: jobData.error || "Unknown error occurred",
      });
    } else {
      return NextResponse.json({
        status: "in_progress",
      });
    }
  } catch (error: any) {
    console.error("Error checking resume status:", error);
    return NextResponse.json(
      { error: error.message || "An unknown error occurred." },
      { status: 500 }
    );
  }
}
