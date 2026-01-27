import { Button } from "@/components/ui/button";

export default function AdminLoginPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <h1 className="text-4xl font-bold">Admin Login</h1>
      <p className="mt-4 text-muted-foreground">
        Enter password to access dashboard
      </p>
      <Button className="mt-8">Login</Button>
    </main>
  );
}
