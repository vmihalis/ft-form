import { Button } from "@/components/ui/button";

export default function AdminPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <h1 className="text-4xl font-bold">Admin Dashboard</h1>
      <p className="mt-4 text-muted-foreground">
        Manage floor lead applications
      </p>
      <Button variant="outline" className="mt-8">
        View Applications
      </Button>
    </main>
  );
}
