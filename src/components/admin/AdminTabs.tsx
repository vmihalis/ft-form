"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Plus } from "lucide-react";
import { motion } from "motion/react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { SubmissionsTable } from "./SubmissionsTable";
import { SubmissionSheet } from "./SubmissionSheet";
import { SubmissionRow } from "./submissions-columns";
import { FormsList } from "@/components/form-builder/FormsList";
import { ActivityFeed } from "./ActivityFeed";
import { Id } from "../../../convex/_generated/dataModel";

/**
 * Tab navigation for admin dashboard
 *
 * Three tabs:
 * - Dashboard: Activity feed showing recent submissions (default tab)
 * - Submissions: Dynamic form submissions table
 * - Forms: Form management with FormsList
 *
 * Tab state is synced to URL via ?tab= query param for bookmarking/sharing.
 */
export function AdminTabs() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // State for submissions tab
  const [selectedSubmission, setSelectedSubmission] =
    useState<SubmissionRow | null>(null);
  const [submissionSheetOpen, setSubmissionSheetOpen] = useState(false);

  // Handle submission row click
  const handleSubmissionClick = (submission: SubmissionRow) => {
    setSelectedSubmission(submission);
    setSubmissionSheetOpen(true);
  };

  // Get current tab from URL, default to "dashboard"
  const currentTab = searchParams.get("tab") || "dashboard";

  // Handle tab change - update URL
  const handleTabChange = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value === "dashboard") {
      // Remove tab param for default value (cleaner URL)
      params.delete("tab");
    } else {
      params.set("tab", value);
    }
    const queryString = params.toString();
    router.push(`/admin${queryString ? `?${queryString}` : ""}`);
  };

  return (
    <>
      <Tabs value={currentTab} onValueChange={handleTabChange}>
        <TabsList>
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="submissions">Submissions</TabsTrigger>
          <TabsTrigger value="forms">Forms</TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
            className="space-y-4"
          >
            <div className="flex justify-end">
              <Button asChild>
                <Link href="/admin/forms/new">
                  <Plus className="h-4 w-4 mr-2" />
                  Create Form
                </Link>
              </Button>
            </div>
            <ActivityFeed />
          </motion.div>
        </TabsContent>

        <TabsContent value="submissions">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
          >
            <SubmissionsTable onRowClick={handleSubmissionClick} />
          </motion.div>
        </TabsContent>

        <TabsContent value="forms">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
          >
            <FormsList />
          </motion.div>
        </TabsContent>
      </Tabs>

      {/* SubmissionSheet for submissions tab */}
      <SubmissionSheet
        submissionId={selectedSubmission?._id as Id<"submissions"> | null}
        open={submissionSheetOpen}
        onOpenChange={setSubmissionSheetOpen}
      />
    </>
  );
}
