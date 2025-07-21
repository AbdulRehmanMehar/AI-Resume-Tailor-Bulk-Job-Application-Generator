import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import OpenAI from "openai";

const assistantId = process.env.OPENAI_ASSISTANT_ID;
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(request: NextRequest) {
  console.log("--- Entering /api/generate-resume/start ---");
  try {
    if (!process.env.OPENAI_API_KEY || !assistantId) {
      console.error("Missing OpenAI credentials on the server.");
      return NextResponse.json(
        { error: "OpenAI credentials not configured on the server." },
        { status: 500 }
      );
    }
    console.log(`Assistant ID loaded: ${assistantId}`);

    const { fileId, resumeContent, jobDescription } = await request.json();
    console.log(`Received fileId: ${fileId}`);
    console.log(`Resume content length: ${resumeContent?.length || 0}`);

    if ((!fileId && !resumeContent) || !jobDescription) {
      console.error(
        "Missing resume data (fileId or resumeContent) or jobDescription in request body."
      );
      return NextResponse.json(
        { error: "Missing resume data or job description." },
        { status: 400 }
      );
    }

    let thread;
    try {
      console.log("Step 1: Creating thread...");
      thread = await openai.beta.threads.create();
      console.log(`Thread created successfully: ${thread.id}`);
    } catch (e) {
      console.error("Error during thread creation:", e);
      throw new Error("Failed during OpenAI thread creation.");
    }

    try {
      console.log(`Step 2: Adding message to thread ${thread.id}...`);

      let messageContent = `Please tailor the following resume for this job description:\n\n---\nJOB DESCRIPTION:\n${jobDescription}\n---\n\n`;

      if (resumeContent) {
        // Use resume content directly
        messageContent += `RESUME TO TAILOR:\n${resumeContent}\n\n---\n\nPlease return only the full, tailored resume in markdown format. Do not include any introductory or concluding remarks, just the resume content itself.`;

        await openai.beta.threads.messages.create(thread.id, {
          role: "user",
          content: messageContent,
        });
      } else {
        // Use file attachment
        messageContent += `My base resume is attached. Please return only the full, tailored resume in markdown format. Do not include any introductory or concluding remarks, just the resume content itself.`;

        await openai.beta.threads.messages.create(thread.id, {
          role: "user",
          content: messageContent,
          attachments: [{ file_id: fileId, tools: [{ type: "file_search" }] }],
        });
      }

      console.log("Message added successfully.");
    } catch (e) {
      console.error("Error during message creation:", e);
      throw new Error("Failed during OpenAI message creation.");
    }

    let run;
    try {
      console.log(`Step 3: Creating run for thread ${thread.id}...`);
      run = await openai.beta.threads.runs.create(thread.id, {
        assistant_id: assistantId,
      });
      console.log(`Run created successfully: ${run.id}`);
    } catch (e) {
      console.error("Error during run creation:", e);
      throw new Error("Failed during OpenAI run creation.");
    }

    return NextResponse.json({ threadId: run.thread_id, runId: run.id });
  } catch (error: any) {
    console.error("--- Caught error in /api/generate-resume/start ---");
    console.error("Full error object:", JSON.stringify(error, null, 2));

    if (error instanceof OpenAI.APIError) {
      const { status, message, code, type } = error;
      console.error(
        `OpenAI API Error: Status ${status}, Code ${code}, Type ${type}, Message ${message}`
      );
      return NextResponse.json(
        { error: `OpenAI API Error: ${message}` },
        { status: status || 500 }
      );
    } else {
      console.error("Generic Server Error:", error.message);
      return NextResponse.json(
        { error: error.message || "An unexpected server error occurred." },
        { status: 500 }
      );
    }
  }
}
