import { Button } from "@/components/ui/button";

export default function ApplyPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <h1 className="text-4xl font-bold">Floor Lead Application</h1>
      <p className="mt-4 text-muted-foreground">
        Apply to lead a floor at Frontier Tower
      </p>
      <Button className="mt-8">Begin Application</Button>
    </main>
  );
}
