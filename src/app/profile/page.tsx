'use client';

import { useState } from 'react';
import CancelFlowModal from '@/components/CancelFlowModal';
import Image from "next/image";

export default function ProfilePage() {
  const [open, setOpen] = useState(false);

  const handleCanceled = () => {
    // Your cancel logic here
    setOpen(false);
  };

  const [imgError, setImgError] = useState(false);

  return (
    <div className="relative min-h-screen flex items-center justify-center pb-[env(safe-area-inset-bottom)]">
      {/* background image (light blur + shade) */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none" aria-hidden="true">
        <Image
          src="/empire-state-compressed.jpg"
          alt=""
          fill
          className="object-cover blur-sm scale-110"
          priority
          onLoad={() => {
            console.log('Background image loaded successfully');
            setImgError(false);
          }}
          onError={() => {
            console.error('Background image failed to load');
            setImgError(true);
          }}
        />
        <div className="absolute inset-0 bg-black/20" />
        {imgError && (
          <div className="absolute top-4 right-4 z-10">
            <span className="inline-block rounded-full bg-red-600 text-white text-xs px-2 py-1 shadow">Image failed</span>
          </div>
        )}
      </div>

      {/* card (no blur) */}
      <div className="relative z-10 bg-white/80 rounded-2xl shadow-xl p-4 sm:p-6 max-w-[92vw] sm:max-w-3xl w-full text-gray-800">
        {/* Avatar & header */}
        <div className="flex items-center gap-4 mb-4">
          <img
            src="/mihailo-profile.jpeg"
            alt="Profile"
            className="w-20 h-20 sm:w-24 sm:h-24 rounded-full border-4 border-white shadow-lg"
          />
          <h1 className="text-xl sm:text-2xl font-bold">My Profile</h1>
        </div>

        {/* status row */}
        <div className="flex flex-col sm:flex-row items-center justify-between p-4 bg-gray-50 rounded-lg mb-2">
          <div className="flex items-center space-x-3 mb-2 sm:mb-0">
            {/* ...status icon... */}
            <span className="text-sm sm:text-base font-medium text-gray-900">Subscription status</span>
          </div>
          <span className="inline-flex items-center rounded-full px-3 py-1 text-sm sm:text-base ring-1 bg-green-50 text-green-700 ring-green-200">Active</span>
        </div>

        {/* next payment row */}
        <div className="flex flex-col sm:flex-row items-center justify-between p-4 bg-gray-50 rounded-lg mb-2">
          <div className="flex items-center space-x-3 mb-2 sm:mb-0">
            {/* ...payment icon... */}
            <span className="text-sm sm:text-base font-medium text-gray-900">Next payment</span>
          </div>
          <span className="text-sm sm:text-base font-medium text-gray-900">September 15</span>
        </div>

        {/* ...other profile UI... */}
        <button
          onClick={() => setOpen(true)}
          className="rounded-xl bg-red-600 px-4 py-2 font-medium text-white shadow hover:bg-red-700 text-sm sm:text-base"
        >
          Cancel MigrateMate
        </button>
        <CancelFlowModal open={open} onClose={() => setOpen(false)} onCanceled={handleCanceled} />
      </div>
    </div>
  );
}
