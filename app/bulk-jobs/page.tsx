"use client";

import { BulkJobGenerator } from "@/components/bulk-job-generator";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Sparkles, Zap, Target, FileText } from "lucide-react";
import Link from "next/link";

export default function BulkJobsPage() {
  const handleJobsGenerated = (jobs: any[]) => {
    console.log("Generated jobs:", jobs);
    // Handle the generated jobs - could integrate with your existing resume tailor functionality
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/30 p-4 sm:p-8">
      <main className="max-w-7xl mx-auto space-y-8">
        {/* Header with Navigation */}
        <div className="flex items-center justify-between">
          {/* <Link href="/">
            <Button
              variant="ghost"
              className="flex items-center gap-2 text-gray-600 hover:text-gray-800"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Resume Tailor
            </Button>
          </Link> */}
        </div>

        {/* Hero Section */}
        <div className="text-center space-y-6 py-8 !hidden">
          <div className="inline-flex items-center gap-3 bg-gradient-to-r from-blue-100 to-purple-100 px-6 py-3 rounded-full">
            <Zap className="h-5 w-5 text-blue-600" />
            <span className="text-blue-800 font-medium">
              AI-Powered Bulk Generation
            </span>
          </div>

          <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
            <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 bg-clip-text text-transparent">
              Bulk Job Application Generator
            </span>
          </h1>

          <p className="mt-4 text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Generate multiple tailored job applications efficiently with AI
            assistance. Add company URLs and let our AI create professional job
            titles, descriptions, and required skills.
          </p>

          {/* Feature Highlights */}
          <div className="grid md:grid-cols-3 gap-6 mt-12 max-w-4xl mx-auto">
            <div className="flex items-center gap-4 bg-white/60 backdrop-blur-sm p-6 rounded-2xl border border-gray-200/50 shadow-sm">
              <div className="p-3 bg-blue-100 rounded-xl">
                <Target className="h-6 w-6 text-blue-600" />
              </div>
              <div className="text-left">
                <h3 className="font-semibold text-gray-900">Smart Targeting</h3>
                <p className="text-sm text-gray-600">
                  AI-generated job titles based on company analysis
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4 bg-white/60 backdrop-blur-sm p-6 rounded-2xl border border-gray-200/50 shadow-sm">
              <div className="p-3 bg-green-100 rounded-xl">
                <FileText className="h-6 w-6 text-green-600" />
              </div>
              <div className="text-left">
                <h3 className="font-semibold text-gray-900">
                  Rich Descriptions
                </h3>
                <p className="text-sm text-gray-600">
                  Compelling job descriptions that attract candidates
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4 bg-white/60 backdrop-blur-sm p-6 rounded-2xl border border-gray-200/50 shadow-sm">
              <div className="p-3 bg-purple-100 rounded-xl">
                <Sparkles className="h-6 w-6 text-purple-600" />
              </div>
              <div className="text-left">
                <h3 className="font-semibold text-gray-900">Skill Matching</h3>
                <p className="text-sm text-gray-600">
                  Relevant skills based on role requirements
                </p>
              </div>
            </div>
          </div>
        </div>

        <BulkJobGenerator onJobsGenerated={handleJobsGenerated} />
      </main>
    </div>
  );
}
