/**
 * Seed script to create Frontier Tower feedback forms
 *
 * Creates two forms:
 * 1. Report a Problem - Quick issue reporting (~6 fields, single step)
 * 2. Feedback & Suggestions - Comprehensive survey (~18 fields, 5 steps)
 *
 * Run with: npx tsx scripts/seed-feedback-forms.ts
 */

import { ConvexHttpClient } from "convex/browser";
import { api } from "../convex/_generated/api";

const CONVEX_URL = process.env.CONVEX_URL || "https://usable-bobcat-946.convex.cloud";

const client = new ConvexHttpClient(CONVEX_URL);

// =============================================================================
// Form 1: Report a Problem - Quick issue reporting
// =============================================================================

const reportProblemSchema = {
  steps: [
    {
      id: "report",
      title: "Report a Problem",
      description: "Help us keep Frontier Tower running smoothly",
      fields: [
        {
          id: "category",
          type: "select",
          label: "What's this about?",
          required: true,
          options: [
            { value: "facilities", label: "Facilities" },
            { value: "amenities", label: "Amenities (Gym/Meditation/Rooftop)" },
            { value: "wifi-tech", label: "WiFi & Tech" },
            { value: "cleanliness", label: "Cleanliness" },
            { value: "safety-security", label: "Safety/Security" },
            { value: "other", label: "Other" },
          ],
        },
        {
          id: "floor",
          type: "select",
          label: "Which floor or area?",
          required: true,
          options: [
            { value: "lobby", label: "Lobby" },
            { value: "floor-4", label: "Floor 4 - Robotics & Hard Tech" },
            { value: "floor-5", label: "Floor 5 - Movement & Fitness" },
            { value: "floor-6", label: "Floor 6 - Arts & Music" },
            { value: "floor-7", label: "Floor 7 - Maker Space" },
            { value: "floor-8", label: "Floor 8 - Neuro & Biotech" },
            { value: "floor-9", label: "Floor 9 - AI & Autonomous Systems" },
            { value: "floor-10", label: "Floor 10 - Accelerate" },
            { value: "floor-11", label: "Floor 11 - Health & Longevity" },
            { value: "floor-12-13", label: "Floor 12-13 - Ethereum & Decentralized Tech" },
            { value: "rooftop", label: "Rooftop" },
            { value: "basement", label: "Basement" },
            { value: "bathrooms", label: "Bathrooms" },
            { value: "common-areas", label: "Common Areas" },
            { value: "other", label: "Other" },
          ],
        },
        {
          id: "description",
          type: "textarea",
          label: "Describe the problem",
          required: true,
          placeholder: "What's the issue? Be as specific as possible...",
        },
        {
          id: "urgency",
          type: "radio",
          label: "How urgent is this?",
          required: true,
          options: [
            { value: "low", label: "Low (can wait)" },
            { value: "medium", label: "Medium (should be fixed soon)" },
            { value: "high", label: "High (needs immediate attention)" },
          ],
        },
        {
          id: "followUp",
          type: "radio",
          label: "Would you like someone to follow up?",
          required: true,
          options: [
            { value: "yes", label: "Yes" },
            { value: "no", label: "No" },
          ],
        },
        {
          id: "contact",
          type: "text",
          label: "Contact info (email or Telegram)",
          required: false,
          placeholder: "your@email.com or @telegram",
          description: "Only if you want us to follow up",
        },
      ],
    },
  ],
  settings: {
    submitButtonText: "Report Problem",
    successMessage: "Thanks for reporting! We'll look into this right away.",
  },
};

// =============================================================================
// Form 2: Feedback & Suggestions - Comprehensive survey
// =============================================================================

const feedbackSchema = {
  steps: [
    {
      id: "about-you",
      title: "About You",
      description: "Optional - helps us understand your perspective",
      fields: [
        {
          id: "membershipType",
          type: "select",
          label: "What type of member are you?",
          required: false,
          options: [
            { value: "coworking", label: "Coworking Member" },
            { value: "private-office", label: "Private Office" },
            { value: "day-pass", label: "Day Pass" },
            { value: "event-guest", label: "Event Guest" },
            { value: "other", label: "Other" },
          ],
        },
        {
          id: "primaryFloors",
          type: "checkbox",
          label: "Which floor(s) do you primarily use?",
          required: false,
          options: [
            { value: "floor-4", label: "Floor 4 - Robotics & Hard Tech" },
            { value: "floor-5", label: "Floor 5 - Movement & Fitness" },
            { value: "floor-6", label: "Floor 6 - Arts & Music" },
            { value: "floor-7", label: "Floor 7 - Maker Space" },
            { value: "floor-8", label: "Floor 8 - Neuro & Biotech" },
            { value: "floor-9", label: "Floor 9 - AI & Autonomous Systems" },
            { value: "floor-10", label: "Floor 10 - Accelerate" },
            { value: "floor-11", label: "Floor 11 - Health & Longevity" },
            { value: "floor-12-13", label: "Floor 12-13 - Ethereum & Decentralized Tech" },
            { value: "common-areas", label: "Common Areas/Lobby" },
          ],
        },
        {
          id: "tenure",
          type: "select",
          label: "How long have you been a Frontier Tower citizen?",
          required: false,
          options: [
            { value: "less-than-1-month", label: "Less than 1 month" },
            { value: "1-3-months", label: "1-3 months" },
            { value: "3-6-months", label: "3-6 months" },
            { value: "6-12-months", label: "6-12 months" },
            { value: "more-than-year", label: "More than a year" },
          ],
        },
      ],
    },
    {
      id: "facilities-amenities",
      title: "Facilities & Amenities",
      description: "Rate your experience and share ideas",
      fields: [
        {
          id: "facilitiesSatisfaction",
          type: "select",
          label: "Overall, how satisfied are you with the facilities?",
          required: true,
          options: [
            { value: "very-dissatisfied", label: "Very Dissatisfied" },
            { value: "dissatisfied", label: "Dissatisfied" },
            { value: "neutral", label: "Neutral" },
            { value: "satisfied", label: "Satisfied" },
            { value: "very-satisfied", label: "Very Satisfied" },
          ],
        },
        {
          id: "amenitiesUsed",
          type: "checkbox",
          label: "Which amenities do you use regularly?",
          required: false,
          options: [
            { value: "coworking-lounge", label: "Coworking Lounge" },
            { value: "private-offices", label: "Private Offices" },
            { value: "gym", label: "Gym/Fitness Center" },
            { value: "meditation", label: "Meditation Space" },
            { value: "rooftop", label: "Rooftop Lounge" },
            { value: "event-space", label: "Event Space" },
            { value: "basement", label: "Basement/Nightclub" },
            { value: "phone-booths", label: "Phone Booths" },
          ],
        },
        {
          id: "amenitiesImprovement",
          type: "textarea",
          label: "What facilities or amenities could be improved?",
          required: false,
          placeholder: "Any specific issues or suggestions...",
        },
        {
          id: "amenitiesWanted",
          type: "textarea",
          label: "What amenities would you like to see added?",
          required: false,
          placeholder: "Dream big - what would make FT even better?",
        },
      ],
    },
    {
      id: "events-community",
      title: "Events & Community",
      description: "Help us build the community you want",
      fields: [
        {
          id: "eventTypes",
          type: "checkbox",
          label: "What types of events would you like more of?",
          required: false,
          options: [
            { value: "networking", label: "Networking Events" },
            { value: "workshops", label: "Technical Workshops" },
            { value: "hackathons", label: "Hackathons" },
            { value: "wellness", label: "Wellness & Fitness Classes" },
            { value: "social", label: "Social Gatherings" },
            { value: "talks-panels", label: "Talks & Panels" },
            { value: "art-music", label: "Art/Music Events" },
            { value: "cross-floor", label: "Cross-Floor Collaborations" },
          ],
        },
        {
          id: "eventTimes",
          type: "checkbox",
          label: "When do you prefer events?",
          required: false,
          options: [
            { value: "morning", label: "Morning (before 10am)" },
            { value: "lunch", label: "Lunch (12-2pm)" },
            { value: "after-work", label: "After Work (5-7pm)" },
            { value: "evening", label: "Evening (after 7pm)" },
            { value: "weekends", label: "Weekends" },
          ],
        },
        {
          id: "communityRating",
          type: "select",
          label: "How connected do you feel to other citizens?",
          required: false,
          options: [
            { value: "not-at-all", label: "Not at all connected" },
            { value: "slightly", label: "Slightly connected" },
            { value: "moderately", label: "Moderately connected" },
            { value: "very", label: "Very connected" },
            { value: "extremely", label: "Extremely connected" },
          ],
        },
        {
          id: "communityIdeas",
          type: "textarea",
          label: "Ideas for improving community connection?",
          required: false,
          placeholder: "What would help you connect with other citizens?",
        },
      ],
    },
    {
      id: "labs-innovation",
      title: "Labs & Innovation",
      description: "Feedback on the themed floors",
      fields: [
        {
          id: "labsInterest",
          type: "checkbox",
          label: "Which lab themes interest you most?",
          required: false,
          options: [
            { value: "ai", label: "AI & Autonomous Systems" },
            { value: "robotics", label: "Robotics & Hard Tech" },
            { value: "biotech", label: "Biotech & Neuro" },
            { value: "longevity", label: "Health & Longevity" },
            { value: "ethereum", label: "Ethereum & Decentralized Tech" },
            { value: "arts-music", label: "Arts & Music" },
            { value: "maker", label: "Maker Space" },
          ],
        },
        {
          id: "labsSuggestions",
          type: "textarea",
          label: "Suggestions for lab programming or resources?",
          required: false,
          placeholder: "Workshops, equipment, speakers, collaborations...",
        },
      ],
    },
    {
      id: "general-wrapup",
      title: "General & Wrap-up",
      description: "Final thoughts",
      fields: [
        {
          id: "loveMost",
          type: "textarea",
          label: "What do you love most about Frontier Tower?",
          required: false,
          placeholder: "What keeps you coming back?",
        },
        {
          id: "improvements",
          type: "textarea",
          label: "What's one thing you'd change?",
          required: false,
          placeholder: "If you could wave a magic wand...",
        },
        {
          id: "nps",
          type: "select",
          label: "How likely are you to recommend Frontier Tower to a friend or colleague?",
          required: true,
          options: [
            { value: "0", label: "0 - Not at all likely" },
            { value: "1", label: "1" },
            { value: "2", label: "2" },
            { value: "3", label: "3" },
            { value: "4", label: "4" },
            { value: "5", label: "5" },
            { value: "6", label: "6" },
            { value: "7", label: "7" },
            { value: "8", label: "8" },
            { value: "9", label: "9" },
            { value: "10", label: "10 - Extremely likely" },
          ],
        },
        {
          id: "followUp",
          type: "radio",
          label: "Would you like someone to reach out about your feedback?",
          required: true,
          options: [
            { value: "yes", label: "Yes" },
            { value: "no", label: "No" },
          ],
        },
        {
          id: "contact",
          type: "text",
          label: "Contact info (email or Telegram)",
          required: false,
          placeholder: "your@email.com or @telegram",
        },
      ],
    },
  ],
  settings: {
    submitButtonText: "Submit Feedback",
    successMessage:
      "Thank you for sharing your thoughts! Your feedback helps shape the future of Frontier Tower.",
  },
};

// =============================================================================
// Seed Functions
// =============================================================================

async function seedForm(
  name: string,
  slug: string,
  description: string,
  schema: typeof reportProblemSchema | typeof feedbackSchema
) {
  // Check if form already exists
  const existingForm = await client.query(api.forms.getBySlug, { slug });
  if (existingForm) {
    console.log(`✓ Form '${slug}' already exists and is published`);
    console.log(`  Form ID: ${existingForm.formId}`);
    console.log(`  Version: ${existingForm.version}`);
    return existingForm.formId;
  }

  // Step 1: Create the form
  console.log(`1. Creating form '${name}'...`);
  const formId = await client.mutation(api.forms.create, {
    name,
    slug,
    description,
  });
  console.log(`   ✓ Form created with ID: ${formId}`);

  // Step 2: Update with full schema
  const fieldCount = schema.steps.reduce((acc, step) => acc + step.fields.length, 0);
  console.log(`2. Updating schema (${fieldCount} fields, ${schema.steps.length} step(s))...`);
  await client.mutation(api.forms.update, {
    formId,
    draftSchema: JSON.stringify(schema),
  });
  console.log("   ✓ Schema updated");

  // Step 3: Publish the form
  console.log("3. Publishing form...");
  const result = await client.mutation(api.forms.publish, { formId });
  console.log(`   ✓ Published as version ${result.version}`);

  return formId;
}

async function main() {
  console.log("🚀 Seeding Frontier Tower feedback forms...\n");

  try {
    // Seed Report a Problem form
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("📝 Report a Problem Form");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");
    await seedForm(
      "Report a Problem",
      "report-problem",
      "Quick form for citizens to report issues around the tower",
      reportProblemSchema
    );
    console.log("\n✅ Report a Problem form ready!");
    console.log("   Slug: report-problem");
    console.log("   URL: /apply/report-problem\n");

    // Seed Feedback & Suggestions form
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("💬 Feedback & Suggestions Form");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");
    await seedForm(
      "Feedback & Suggestions",
      "feedback",
      "Share your thoughts, ideas, and suggestions for Frontier Tower",
      feedbackSchema
    );
    console.log("\n✅ Feedback & Suggestions form ready!");
    console.log("   Slug: feedback");
    console.log("   URL: /apply/feedback\n");

    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("🎉 All forms seeded successfully!");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");
  } catch (error) {
    console.error("❌ Error:", error);
    process.exit(1);
  }
}

main();
