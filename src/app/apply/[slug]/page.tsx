import { DynamicFormPage } from "@/components/dynamic-form/DynamicFormPage";

interface PageProps {
  params: Promise<{ slug: string }>;
}

/**
 * Dynamic form page - renders forms by slug
 *
 * Server component that renders the client-side DynamicFormPage.
 * Loads published form data from Convex and renders
 * the appropriate form UI based on schema.
 *
 * Matches styling of original /apply page with glass-card effect.
 */
export default async function Page({ params }: PageProps) {
  const { slug } = await params;

  return <DynamicFormPage slug={slug} />;
}
