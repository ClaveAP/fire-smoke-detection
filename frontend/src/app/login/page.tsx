import type { Metadata } from "next";
import { LoginCard } from "@/components/auth/LoginCard";

export const metadata: Metadata = {
  title: "Masuk — AegisFlame",
};

export default function LoginPage() {
  return (
    <main className="min-h-screen bg-[#050507] text-[#f5f5f7] flex items-center justify-center px-4 py-10">
      <LoginCard />
    </main>
  );
}