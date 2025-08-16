"use client";

import { useState } from "react";
import CancelFlowModal from "@/components/CancelFlowModal";
import Image from "next/image";

const mockUser = { email: "user@example.com", id: "1" };

export default function ProfilePage() {
  const [showAdvancedSettings, setShowAdvancedSettings] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);

  // drives badge + next payment
  const [subscriptionStatus, setSubscriptionStatus] =
    useState<"active" | "canceled">("active");
  const [nextPayment, setNextPayment] = useState<string | null>("September 15");


  const handleCanceled = () => {
    setSubscriptionStatus("canceled");
    setNextPayment(null);
    console.log("Subscription canceled");
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center">
      {/* background image (blurred) + dark shade */}
      <div
        className="absolute inset-0 -z-10 overflow-hidden pointer-events-none"
        aria-hidden="true"
      >
        <img
          src="/empire-state-compressed.jpg"
          alt=""
          className="h-full w-full object-cover blur-[2px] scale-110"
        />
        <div className="absolute inset-0 bg-black/20" />
      </div>

      {/* card */}
      <div className="relative z-10 bg-white/80 backdrop-blur-md rounded-2xl shadow-xl p-6 max-w-3xl w-full text-gray-800">
        {/* header */}
        <div className="flex items-center gap-4 mb-4">
          <Image
            src="/mihailo-profile.jpeg"
            alt="Profile"
            width={96}
            height={96}
            className="w-24 h-24 rounded-full border-4 border-white shadow-lg"
          />
          <h1 className="text-2xl font-bold">My Profile</h1>
        </div>

        {/* account info */}
        <div className="px-6 py-6 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900 mb-4">
            Account Information
          </h2>
          <div className="space-y-3">
            <div>
              <p className="text-sm font-medium text-gray-500">Email</p>
              <p className="mt-1 text-md text-gray-900">{mockUser.email}</p>
            </div>

            {/* status row */}
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 text-gray-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <p className="text-sm font-medium text-gray-900">
                  Subscription status
                </p>
              </div>
              <span
                className={
                  "inline-flex items-center rounded-full px-3 py-1 text-sm ring-1 " +
                  (subscriptionStatus === "canceled"
                    ? "bg-red-50 text-red-700 ring-red-200"
                    : "bg-green-50 text-green-700 ring-green-200")
                }
              >
                {subscriptionStatus === "canceled" ? "Canceled" : "Active"}
              </span>
            </div>

            {/* next payment row */}
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 text-gray-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
                <p className="text-sm font-medium text-gray-900">Next payment</p>
              </div>
              <p
                className={
                  "text-sm font-medium " +
                  (subscriptionStatus === "active" && nextPayment
                    ? "text-gray-900"
                    : "text-gray-400")
                }
              >
                {subscriptionStatus === "active" && nextPayment
                  ? nextPayment
                  : "—"}
              </p>
            </div>
          </div>
        </div>

        {/* support */}
        <div className="px-6 py-6 border-b border-gray-200">
          <button
            onClick={() => console.log("Support contact clicked")}
            title="Send email to support"
            className="inline-flex items-center justify-center w-full px-4 py-3 bg-[#8952fc] text-white rounded-lg hover:bg-[#7b40fc] transition-colors"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 mr-2"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            <span className="text-sm">Contact support</span>
          </button>
        </div>

        {/* manage subscription */}
        <div className="px-6 py-6">
          <button
            onClick={() => setShowAdvancedSettings((v) => !v)}
            className="inline-flex items-center justify-center w-full px-4 py-3 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 shadow-sm group"
          >
            <span className="text-sm font-medium">Manage Subscription</span>
            <svg
              className={`w-4 h-4 ml-2 transition-transform duration-200 ${
                showAdvancedSettings ? "rotate-180" : ""
              }`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </button>

          {/* collapsible */}
          <div
            className={`overflow-hidden transition-all duration-300 ease-in-out ${
              showAdvancedSettings
                ? "max-h-[800px] opacity-100 mt-4"
                : "max-h-0 opacity-0"
            }`}
          >
            <div className="space-y-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
              <button
                onClick={() => console.log("Update card clicked")}
                className="inline-flex items-center justify-center w-full px-4 py-3 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 shadow-sm"
              >
                <span className="text-sm font-medium">Update payment method</span>
              </button>

              <button
                onClick={() => console.log("Invoice history clicked")}
                className="inline-flex items-center justify-center w-full px-4 py-3 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 shadow-sm"
              >
                <span className="text-sm font-medium">View billing history</span>
              </button>

              <button
                onClick={() => setModalOpen(true)}
                className="inline-flex items-center justify-center w-full px-4 py-3 bg-white border border-red-200 text-red-600 rounded-lg hover:bg-red-50 hover:border-red-300 transition-all duration-200 shadow-sm group"
              >
                <span className="text-sm font-medium">Cancel Migrate Mate</span>
              </button>
            </div>
          </div>
        </div>

        {/* modal */}
        <CancelFlowModal
          open={modalOpen}
          onClose={() => setModalOpen(false)}
          onCanceled={handleCanceled}
        />
      </div>
    </div>
  );
}
