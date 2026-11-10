"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Spinner, CheckCircle, Warning } from "@phosphor-icons/react";

export default function AuthCallbackPage() {
  const router = useRouter();
  const [status, setStatus] = useState<"processing" | "success" | "error">("processing");
  const [errorMessage, setErrorMessage] = useState<string>("");

  useEffect(() => {
    async function handleAuth() {
      if (!supabase) {
        setStatus("error");
        setErrorMessage("Supabase client belum dikonfigurasi.");
        setTimeout(() => router.replace("/"), 2500);
        return;
      }

      try {
        const { data, error } = await supabase.auth.getSession();
        if (error) {
          throw error;
        }

        if (data.session) {
          setStatus("success");
          setTimeout(() => {
            router.replace("/");
          }, 800);
        } else {
          // If no immediate session, give auth state listener a moment
          const { data: authListener } = supabase.auth.onAuthStateChange(
            (event, session) => {
              if (session) {
                setStatus("success");
                authListener.subscription.unsubscribe();
                router.replace("/");
              }
            }
          );
        }
      } catch (err: unknown) {
        setStatus("error");
        setErrorMessage(
          err instanceof Error ? err.message : "Terjadi kesalahan saat otentikasi Google."
        );
        setTimeout(() => router.replace("/"), 3000);
      }
    }

    handleAuth();
  }, [router]);

  return (
    <div className="min-h-screen bg-[#050507] text-white flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-sm rounded-3xl bg-[#0b0d14] border border-white/12 p-6 flex flex-col items-center text-center gap-4 shadow-2xl">
        {status === "processing" && (
          <>
            <Spinner className="w-8 h-8 text-[#ff5722] animate-spin" />
            <h2 className="text-base font-semibold">Memverifikasi Akun Google...</h2>
            <p className="text-xs text-white/55">
              Mohon tunggu sejenak, kami sedang menyinkronkan profil Anda via Supabase.
            </p>
          </>
        )}

        {status === "success" && (
          <>
            <CheckCircle weight="fill" className="w-10 h-10 text-emerald-400" />
            <h2 className="text-base font-semibold text-emerald-400">Berhasil Masuk!</h2>
            <p className="text-xs text-white/55">Mengalihkan ke Command Center...</p>
          </>
        )}

        {status === "error" && (
          <>
            <Warning weight="fill" className="w-10 h-10 text-rose-500" />
            <h2 className="text-base font-semibold text-rose-400">Gagal Masuk</h2>
            <p className="text-xs text-white/55">{errorMessage}</p>
            <p className="text-[11px] text-white/35">Mengembalikan ke halaman utama...</p>
          </>
        )}
      </div>
    </div>
  );
}
