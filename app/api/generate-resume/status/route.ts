import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function GET(request: NextRequest) {
  try {
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: "OpenAI API key not configured." },
        { status: 500 }
      );
    }

    console.log(`Full request URL: ${request.url}`);
    const { searchParams } = new URL(request.url);
    const threadId = searchParams.get("threadId");
    const runId = searchParams.get("runId");

    console.log(`Parsed from URL: threadId=${threadId}, runId=${runId}`);
    console.log(
      `threadId type: ${typeof threadId}, runId type: ${typeof runId}`
    );

    if (!threadId || !runId) {
      console.error(`Missing parameters: threadId=${threadId}, runId=${runId}`);
      return NextResponse.json(
        { error: "Missing threadId or runId." },
        { status: 400 }
      );
    }

    // Based on the error path pattern, try different parameter order
    console.log(
      `About to call retrieve with threadId=${threadId}, runId=${runId}`
    );

    // Ensure threadId and runId are not null
    if (threadId === null || runId === null) {
      return NextResponse.json(
        { error: "threadId or runId is null" },
        { status: 400 }
      );
    }

    // The error shows /threads/undefined/runs/threadId which suggests runId should be first
    const run = await openai.beta.threads.runs.retrieve(runId, {
      thread_id: threadId,
    });

    if (run.status === "completed") {
      const messages = await openai.beta.threads.messages.list(threadId);
      const assistantMessage = messages.data.find(
        (m) => m.role === "assistant"
      );
      const resume =
        assistantMessage?.content[0].type === "text"
          ? assistantMessage.content[0].text.value
          : null;

      if (!resume) {
        return NextResponse.json({
          status: "failed",
          error: "Assistant did not return a valid response.",
        });
      }
      return NextResponse.json({ status: "completed", resume });
    } else if (
      run.status === "failed" ||
      run.status === "cancelled" ||
      run.status === "expired"
    ) {
      const errorMessage =
        run.last_error?.message || `Run failed with status: ${run.status}`;
      return NextResponse.json({ status: "failed", error: errorMessage });
    } else {
      return NextResponse.json({ status: "in_progress" });
    }
  } catch (error: any) {
    console.error("Error checking resume status:", error);
    return NextResponse.json(
      { error: error.message || "An unknown error occurred." },
      { status: 500 }
    );
  }
}
