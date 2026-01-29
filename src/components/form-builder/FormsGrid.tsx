"use client";

import { motion, AnimatePresence } from "motion/react";
import { FormCard } from "./FormCard";
import { Id } from "@/../convex/_generated/dataModel";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.3,
    },
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    transition: {
      duration: 0.2,
    },
  },
};

interface FormData {
  _id: Id<"forms">;
  name: string;
  slug: string;
  status: "draft" | "published" | "archived";
  submissionCount: number;
  updatedAt: number;
}

interface FormsGridProps {
  forms: FormData[];
  onDuplicate: (formId: Id<"forms">) => void;
  duplicatingId?: Id<"forms"> | null;
}

export function FormsGrid({ forms, onDuplicate, duplicatingId }: FormsGridProps) {
  return (
    <motion.div
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <AnimatePresence mode="popLayout">
        {forms.map((form) => (
          <motion.div
            key={form._id}
            variants={itemVariants}
            layout
            exit="exit"
          >
            <FormCard
              form={form}
              onDuplicate={() => onDuplicate(form._id)}
              isLoading={form._id === duplicatingId}
            />
          </motion.div>
        ))}
      </AnimatePresence>
    </motion.div>
  );
}
