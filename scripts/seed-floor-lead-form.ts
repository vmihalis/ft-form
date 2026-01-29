/**
 * Seed script to create the Floor Lead Application form
 *
 * This script creates the dynamic form that replaces the legacy /apply form.
 * Run with: npx tsx scripts/seed-floor-lead-form.ts
 *
 * Phase 16 Migration - MIGRATE-01, MIGRATE-02
 */

import { ConvexHttpClient } from "convex/browser";
import { api } from "../convex/_generated/api";

const CONVEX_URL = process.env.CONVEX_URL || "https://usable-bobcat-946.convex.cloud";

const client = new ConvexHttpClient(CONVEX_URL);

// Floor Lead Application schema - 19 fields across 5 steps
const formSchema = {
  steps: [
    {
      id: "applicant-info",
      title: "Applicant Info",
      description: "Tell us about yourself",
      fields: [
        {
          id: "fullName",
          type: "text",
          label: "Full Name",
          required: true,
          placeholder: "Your full name",
        },
        {
          id: "email",
          type: "email",
          label: "Email",
          required: true,
          placeholder: "you@example.com",
          description: "We'll use this to contact you about your application",
        },
        {
          id: "linkedIn",
          type: "url",
          label: "LinkedIn Profile",
          required: false,
          placeholder: "https://linkedin.com/in/yourprofile",
        },
        {
          id: "role",
          type: "text",
          label: "Current Role",
          required: true,
          placeholder: "e.g., Founder at TechCo, Research Scientist",
          description: "Your current professional role or title",
        },
        {
          id: "bio",
          type: "textarea",
          label: "Bio",
          required: true,
          placeholder: "Tell us about your background, expertise, and what drives you...",
          description: "Tell us what makes you uniquely qualified",
        },
      ],
    },
    {
      id: "your-proposal",
      title: "Your Proposal",
      description: "Tell us about your initiative",
      fields: [
        {
          id: "floor",
          type: "select",
          label: "Which floor?",
          required: true,
          description: "Select the floor for your initiative",
          options: [
            { value: "floor-4", label: "Floor 4 - Robotics & Hard Tech" },
            { value: "floor-5", label: "Floor 5 - Movement Floor & Fitness Center" },
            { value: "floor-6", label: "Floor 6 - Arts & Music" },
            { value: "floor-7", label: "Floor 7 - Frontier Maker Space" },
            { value: "floor-8", label: "Floor 8 - Neuro & Biotech" },
            { value: "floor-9", label: "Floor 9 - AI & Autonomous Systems" },
            { value: "floor-10", label: "Floor 10 - Frontier @ Accelerate" },
            { value: "floor-11", label: "Floor 11 - Health & Longevity" },
            { value: "floor-12", label: "Floor 12 - Ethereum & Decentralized Tech" },
            { value: "floor-13", label: "Floor 13 - Ethereum & Decentralized Tech" },
          ],
        },
        {
          id: "initiativeName",
          type: "text",
          label: "Initiative Name",
          required: true,
          placeholder: "e.g., The Longevity Collective",
          description: "A memorable name for your floor community",
        },
        {
          id: "tagline",
          type: "text",
          label: "Tagline",
          required: true,
          placeholder: "A short, catchy description of your vision",
          description: "Maximum 100 characters",
          maxLength: 100,
        },
        {
          id: "values",
          type: "textarea",
          label: "Core Values",
          required: true,
          placeholder: "What principles will guide your floor community?",
          description: "What principles will guide your community?",
        },
        {
          id: "targetCommunity",
          type: "textarea",
          label: "Target Community",
          required: true,
          placeholder: "Who would be ideal members of your floor community?",
          description: "Describe your ideal community members",
        },
        {
          id: "estimatedSize",
          type: "select",
          label: "Estimated Community Size",
          required: true,
          description: "How many people do you expect to join your community?",
          options: [
            { value: "1-10", label: "1-10 members" },
            { value: "11-25", label: "11-25 members" },
            { value: "26-50", label: "26-50 members" },
            { value: "51-100", label: "51-100 members" },
            { value: "100+", label: "100+ members" },
          ],
        },
      ],
    },
    {
      id: "your-roadmap",
      title: "Your Roadmap",
      description: "Share your phased plan for building this community",
      fields: [
        {
          id: "phase1Mvp",
          type: "textarea",
          label: "Phase 1: MVP (First 3 months)",
          required: true,
          placeholder: "What's the minimum viable version of your floor community? What will you launch with?",
          description: "Describe your initial launch plan",
        },
        {
          id: "phase2Expansion",
          type: "textarea",
          label: "Phase 2: Expansion (3-6 months)",
          required: true,
          placeholder: "How will you grow and expand the community? What new initiatives or events will you add?",
          description: "Describe your growth strategy",
        },
        {
          id: "phase3LongTerm",
          type: "textarea",
          label: "Phase 3: Long-term Vision (6+ months)",
          required: true,
          placeholder: "What's your long-term vision for this floor? How will it evolve and contribute to Frontier Tower?",
          description: "Describe your long-term vision",
        },
      ],
    },
    {
      id: "impact",
      title: "Impact",
      description: "How will your floor benefit the Frontier Tower community?",
      fields: [
        {
          id: "benefitToFT",
          type: "textarea",
          label: "Benefit to Frontier Tower Members",
          required: true,
          placeholder: "Describe how your floor will add value to the broader Frontier Tower community...",
          description: "Be specific about the value you'll create",
        },
      ],
    },
    {
      id: "logistics",
      title: "Logistics",
      description: "Help us understand the practical details",
      fields: [
        {
          id: "existingCommunity",
          type: "textarea",
          label: "Existing Community",
          required: true,
          placeholder: "Do you have an existing community? Describe your current network or communities you're part of.",
          description: "Tell us about any existing community or network you can bring",
        },
        {
          id: "spaceNeeds",
          type: "textarea",
          label: "Space Requirements",
          required: true,
          placeholder: "What physical space do you need? Consider desks, meeting rooms, event space, specialized equipment, storage, etc.",
          description: "Describe your ideal space setup and any special requirements",
        },
        {
          id: "startDate",
          type: "date",
          label: "Preferred Start Date",
          required: true,
          description: "When would you like to launch your initiative? (approximate is fine)",
        },
        {
          id: "additionalNotes",
          type: "textarea",
          label: "Additional Notes",
          required: false,
          placeholder: "Anything else you'd like us to know? Questions, concerns, special circumstances, or additional context.",
        },
      ],
    },
  ],
  settings: {
    submitButtonText: "Submit Application",
    successMessage: "Thank you for your application! We'll be in touch soon.",
  },
};

async function main() {
  console.log("🚀 Seeding Floor Lead Application form...\n");

  try {
    // Check if form already exists
    const existingForm = await client.query(api.forms.getBySlug, { slug: "floor-lead" });
    if (existingForm) {
      console.log("✓ Form 'floor-lead' already exists and is published");
      console.log(`  Form ID: ${existingForm.formId}`);
      console.log(`  Version: ${existingForm.version}`);
      return;
    }

    // Step 1: Create the form
    console.log("1. Creating form...");
    const formId = await client.mutation(api.forms.create, {
      name: "Floor Lead Application",
      slug: "floor-lead",
      description: "Apply to lead a floor initiative at Frontier Tower",
    });
    console.log(`   ✓ Form created with ID: ${formId}`);

    // Step 2: Update with full schema
    console.log("2. Updating schema (19 fields, 5 steps)...");
    await client.mutation(api.forms.update, {
      formId,
      draftSchema: JSON.stringify(formSchema),
    });
    console.log("   ✓ Schema updated");

    // Step 3: Publish the form
    console.log("3. Publishing form...");
    const result = await client.mutation(api.forms.publish, { formId });
    console.log(`   ✓ Published as version ${result.version}`);

    console.log("\n✅ Floor Lead Application form created successfully!");
    console.log("   Slug: floor-lead");
    console.log("   URL: /apply/floor-lead");
  } catch (error) {
    console.error("❌ Error:", error);
    process.exit(1);
  }
}

main();
