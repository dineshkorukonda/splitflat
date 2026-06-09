import { AppTitle } from "@/components/app-title";
import { LoginForm } from "@/components/login-form";
import { isAuthenticated } from "@/lib/auth";
import { redirect } from "next/navigation";

type LoginPageProps = {
  searchParams: Promise<{ from?: string }>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  if (await isAuthenticated()) {
    redirect("/");
  }

  const params = await searchParams;
  const redirectTo = params.from && params.from !== "/login" ? params.from : "/";

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-10">
      <div className="card w-full max-w-sm p-6">
        <div className="mb-6 text-center">
          <div className="flex justify-center">
            <AppTitle />
          </div>
          <p className="mt-3 text-[13px] leading-relaxed text-[var(--text-secondary)]">
            Viewing is open to everyone. Sign in with the shared flat password to
            add expenses, settle up, and edit icons.
          </p>
        </div>
        <LoginForm redirectTo={redirectTo} />
      </div>
    </div>
  );
}
