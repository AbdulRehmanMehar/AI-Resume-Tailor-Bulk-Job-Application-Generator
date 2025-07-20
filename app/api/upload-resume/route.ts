import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

// This is the critical change: run this route on the Edge Runtime.
export const runtime = "edge"

export async function POST(request: NextRequest) {
  try {
    const apiKey = process.env.OPENAI_API_KEY
    if (!apiKey) {
      return NextResponse.json({ error: "OpenAI API key not configured." }, { status: 500 })
    }

    const requestFormData = await request.formData()
    const resumeFile = requestFormData.get("resumeFile") as File | null

    if (!resumeFile) {
      return NextResponse.json({ error: "No resume file found in the form data." }, { status: 400 })
    }

    // --- Manual Fetch to OpenAI ---
    // This bypasses potential issues in the OpenAI SDK's file handling on the Edge.
    const openAiFormData = new FormData()
    openAiFormData.append("purpose", "assistants")
    openAiFormData.append("file", resumeFile)

    const response = await fetch("https://api.openai.com/v1/files", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
      body: openAiFormData,
    })

    if (!response.ok) {
      // If OpenAI returns an error, parse it and forward it.
      const errorData = await response.json().catch(() => ({}))
      console.error("OpenAI API Error:", errorData)
      throw new Error(errorData?.error?.message || "Failed to upload file to OpenAI.")
    }

    const result = await response.json()

    return NextResponse.json({ fileId: result.id })
  } catch (error: any) {
    console.error("Error in /api/upload-resume:", error)
    return NextResponse.json(
      { error: error.message || "An unknown error occurred during file upload." },
      { status: 500 },
    )
  }
}
