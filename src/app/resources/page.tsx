"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  BookOpen,
  ChevronDown,
  ChevronRight,
  FileText,
  PlaySquare,
  Link as LinkIcon,
  Loader2,
  Target
} from "lucide-react";

import { HoverInteractWrapper } from "@/components/ui/HoverInteractWrapper";

const SYLLABUS = [
  { subject: "Mathematics", topics: ["Fractions", "Ratios and Proportions", "Algebra", "Statistics", "Number Series"] },
  { subject: "English", topics: ["Subject-Verb Agreement", "Vocabulary", "Reading Comprehension", "Grammar", "Analogy"] },
  { subject: "General Information", topics: ["Philippine Constitution", "Code of Conduct", "Peace and Human Rights", "Environment"] }
];

interface StudyResource {
  title: string;
  type: "video" | "article" | "pdf";
  url: string;
  justification: string;
}

function StudyHallContent() {
  const searchParams = useSearchParams();
  const [activeSubject, setActiveSubject] = useState<string>("Mathematics");
  const [expandedTopic, setExpandedTopic] = useState<string | null>(null);
  const [topicResources, setTopicResources] = useState<Record<string, StudyResource[]>>({});
  const [isFetching, setIsFetching] = useState<boolean>(false);
  const [initialLoadDone, setInitialLoadDone] = useState(false);

  const activeSyllabus = SYLLABUS.find(s => s.subject === activeSubject) || SYLLABUS[0];

  const handleTopicExpand = async (topic: string) => {
    // Toggle collapse if clicking the currently expanded topic
    if (expandedTopic === topic) {
      setExpandedTopic(null);
      return;
    }

    setExpandedTopic(topic);

    // If we already have the resources cached in state, no need to refetch
    if (topicResources[topic]) {
      return;
    }

    setIsFetching(true);
    try {
      const res = await fetch('/api/resources/study-hall', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic }),
      });

      if (!res.ok) {
        throw new Error('Failed to fetch resources');
      }

      const data = await res.json();
      if (data.resources) {
        setTopicResources(prev => ({
          ...prev,
          [topic]: data.resources,
        }));
      }
    } catch (error) {
      console.error("Error fetching resources:", error);
    } finally {
      setIsFetching(false);
    }
  };

  // Check URL params on mount
  useEffect(() => {
    if (initialLoadDone) return;
    const topicParam = searchParams.get('topic');
    if (topicParam) {
      // Find the subject that contains this topic
      for (const syllabus of SYLLABUS) {
        if (syllabus.topics.includes(topicParam)) {
          setActiveSubject(syllabus.subject);
          handleTopicExpand(topicParam);
          break;
        }
      }
    }
    setInitialLoadDone(true);
  }, [searchParams, initialLoadDone]);


  const renderIcon = (type: string) => {
    switch (type) {
      case "video":
        return <PlaySquare className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />;
      case "pdf":
        return <FileText className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />;
      case "article":
      default:
        return <LinkIcon className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />;
    }
  };

  return (
    <main className="min-h-screen bg-transparent pt-10">
      <div className="max-w-7xl mx-auto p-6 md:grid md:grid-cols-4 gap-8">

        {/* Header Section (Full Width on mobile, spanning cols if needed but we'll just put it outside the grid or spanning all cols) */}
        <div className="md:col-span-4 mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-xl bg-csc-blue-light/30 flex items-center justify-center">
              <BookOpen className="w-6 h-6 text-csc-blue-dark" />
            </div>
            <h1 className="text-3xl font-bold text-slate-800">Study Hall</h1>
          </div>
          <p className="text-slate-600 max-w-3xl text-lg">
            Select a subject and expand a topic to receive highly specific, AI-curated study resources targeting the exact concepts you need to master for the Civil Service Exam.
          </p>
        </div>

        {/* Left Column: Subject Sidebar */}
        <div className="md:col-span-1 flex flex-col gap-2 mb-8 md:mb-0">
          <h2 className="font-semibold text-slate-500 uppercase tracking-wider text-sm mb-2 px-2">Subjects</h2>
          {SYLLABUS.map((syllabus) => (
            <HoverInteractWrapper key={syllabus.subject} scaleAmt={1.05}>
              <button
                onClick={() => {
                  setActiveSubject(syllabus.subject);
                  setExpandedTopic(null);
                }}
                className={`w-full text-left px-4 py-3 rounded-lg font-medium transition-all ${activeSubject === syllabus.subject
                    ? "bg-csc-blue-dark text-white shadow-md"
                    : "text-slate-600 hover:bg-white/50"
                  }`}
              >
                {syllabus.subject}
              </button>
            </HoverInteractWrapper>
          ))}
        </div>

        {/* Right Column: Topics Accordion */}
        <div className="md:col-span-3 space-y-4">
          <h2 className="font-semibold text-slate-800 text-xl mb-4">
            {activeSubject} Topics
          </h2>

          {activeSyllabus.topics.map((topic) => {
            const isExpanded = expandedTopic === topic;
            const resources = topicResources[topic];

            return (
              <HoverInteractWrapper key={topic} scaleAmt={1.02}>
                <div className="!bg-white/70 !backdrop-blur-md border border-slate-200/60 rounded-xl shadow-sm overflow-hidden transition-all duration-200 w-full">
                  {/* Accordion Header */}
                  <button
                    onClick={() => handleTopicExpand(topic)}
                    className="w-full flex items-center justify-between p-5 hover:bg-slate-50/50 transition-colors"
                  >
                    <span className="font-semibold text-slate-700 text-lg">{topic}</span>
                    {isExpanded ? (
                      <ChevronDown className="w-5 h-5 text-slate-400" />
                    ) : (
                      <ChevronRight className="w-5 h-5 text-slate-400" />
                    )}
                  </button>

                  {/* Accordion Body */}
                  {isExpanded && (
                    <div className="p-5 pt-0 border-t border-slate-100/50 bg-slate-50/30">
                      {/* Loading State */}
                      {isFetching && !resources && (
                        <div className="flex flex-col items-center justify-center py-10 gap-3 text-slate-500">
                          <Loader2 className="w-6 h-6 animate-spin text-csc-blue-dark" />
                          <p className="text-sm font-medium animate-pulse">Curating specific resources for {topic}...</p>
                        </div>
                      )}

                      {/* Resources List */}
                      {!isFetching && resources && resources.length > 0 && (
                        <div className="mt-4 space-y-4">
                          <div className="grid gap-4">
                            {resources.map((resource, idx) => (
                              <HoverInteractWrapper key={idx} scaleAmt={1.05}>
                                <a
                                  href={resource.url.startsWith('http') ? resource.url : `https://www.google.com/search?q=${encodeURIComponent(resource.url)}`}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="flex items-start gap-4 p-4 rounded-lg bg-white/80 border border-slate-200/60 hover:border-csc-blue-mid hover:shadow-md transition-all group block"
                                >
                                  {renderIcon(resource.type)}
                                  <div>
                                    <h4 className="font-semibold text-slate-800 group-hover:text-csc-blue-dark transition-colors">
                                      {resource.title}
                                    </h4>
                                    <p className="text-sm text-slate-500 mt-1 leading-relaxed">
                                      {resource.justification}
                                    </p>
                                  </div>
                                </a>
                              </HoverInteractWrapper>
                            ))}
                          </div>

                          {/* Targeted Practice CTA */}
                          <div className="mt-6 flex justify-end">
                            <HoverInteractWrapper scaleAmt={1.05}>
                              <Link href="/test-center/targeted" className="block">
                                <Button className="bg-csc-blue-dark hover:bg-csc-blue-dark/90 text-white shadow-sm flex items-center gap-2">
                                  <Target className="w-4 h-4" />
                                  Practice This Topic
                                </Button>
                              </Link>
                            </HoverInteractWrapper>
                          </div>
                        </div>
                      )}

                      {/* Error / Empty State (If fetch failed silently but finished loading) */}
                      {!isFetching && (!resources || resources.length === 0) && (
                        <div className="py-6 text-center text-slate-500">
                          <p>No resources found. Please try expanding the topic again.</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </HoverInteractWrapper>
            );
          })}
        </div>
      </div>
    </main>
  );
}

export default function StudyHallPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-csc-blue-dark" />
      </div>
    }>
      <StudyHallContent />
    </Suspense>
  );
}
