import React, { useState } from "react";

const reasons = [
  "Too expensive",
  "Platform not helpful",
  "Not enough relevant jobs",
  "Decided not to move",
  "Other"
];

interface CancelSubscriptionPageProps {
  onClose: () => void;
  csrf: string;
}

export default function CancelSubscriptionPage({ onClose, csrf }: CancelSubscriptionPageProps) {
  const [selectedReason, setSelectedReason] = useState("");

  return (
    <div
      className="fixed inset-0 min-h-screen min-w-full flex items-center justify-center bg-black/70"
      style={{
        backgroundImage: "url('/cityscape.png')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        zIndex: 0,
      }}
    >
      <div className="absolute inset-0 bg-black/60 z-0" aria-hidden />
      <div className="relative z-10 w-full max-w-md mx-auto p-6 bg-white rounded-2xl shadow-2xl flex flex-col items-center">
        <h1 className="text-2xl font-bold mb-2 text-center">What’s the main reason for cancelling?</h1>
        <p className="text-gray-600 text-sm mb-6 text-center">Please take a minute to let us know why:</p>
        <form className="w-full">
          <div className="space-y-3 mb-6">
            {reasons.map((reason) => (
              <label
                key={reason}
                className="flex items-center gap-2 cursor-pointer bg-gray-50 rounded-lg px-3 py-2 hover:bg-green-50 transition"
              >
                <input
                  type="radio"
                  name="cancel-reason"
                  value={reason}
                  checked={selectedReason === reason}
                  onChange={() => setSelectedReason(reason)}
                  required
                  className="accent-green-600 h-4 w-4 rounded-full"
                />
                <span className="text-gray-800 text-sm">{reason}</span>
              </label>
            ))}
          </div>
          <button
            type="button"
            className="w-full mb-3 py-3 rounded-xl bg-green-600 text-white font-semibold shadow hover:bg-green-700 transition"
          >
            Get 50% off | $12.50 <span className="line-through text-gray-200 ml-1">$25</span>
          </button>
          <button
            type="submit"
            className="w-full py-3 rounded-xl bg-gray-200 text-gray-700 font-semibold shadow disabled:opacity-60 disabled:cursor-not-allowed"
            disabled={!selectedReason}
          >
            Complete cancellation
          </button>
        </form>
      </div>
    </div>
  );
}
