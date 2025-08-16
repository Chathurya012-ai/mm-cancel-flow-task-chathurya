"use client";
import Image from "next/image";

type CancelSubscriptionPageProps = {
  csrf: string;
  onClose?: () => void;
  variant: "A" | "B";
};

export default function CancelSubscriptionPage({ csrf, onClose, variant }: CancelSubscriptionPageProps) {
  return (
    <div className="relative min-h-dvh">
      {/* Absolute background layer */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div
          className="h-full w-full bg-cover bg-center bg-gray-100"
          aria-hidden="true"
        />
        <div className="absolute inset-0 bg-black/55" aria-hidden="true" />
      </div>
      {/* Centered glass card */}
      <main className="mx-auto w-full max-w-xl p-4 sm:p-6 lg:p-8">
        <div className="rounded-2xl bg-white/90 backdrop-blur-md ring-1 ring-white/10 shadow-xl">
          <div className="p-5 sm:p-7">
            {/* header */}
            <div className="flex items-center gap-3">
              <Image
                src="/mihoilo-profile.jpg"
                alt="Profile"
                width={80}
                height={80}
                className="rounded-full w-16 h-16 md:w-20 md:h-20 object-cover"
              />
              <div>
                <h2 className="text-xl sm:text-2xl font-semibold">Cancel subscription</h2>
                <p className="text-sm text-gray-600">Please tell us why you’re leaving</p>
              </div>
            </div>
            {/* … your progressive flow steps + buttons … */}
          </div>
        </div>
      </main>
    </div>
  );
}
