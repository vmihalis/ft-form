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
 */
export default async function Page({ params }: PageProps) {
  const { slug } = await params;

  return (
    <main className="min-h-screen w-full max-w-3xl mx-auto px-4 py-8 sm:py-12">
      <DynamicFormPage slug={slug} />
    </main>
  );
}
