
'use client';

import { useState } from 'react';
import CancelFlowModal from '@/components/CancelFlowModal';

export default function ProfilePage() {
  const [open, setOpen] = useState(false);
  const userId = '1'; // Replace with real user ID if available

  return (
    <main className="mx-auto max-w-3xl p-6">
      {/* ...the rest of your profile UI... */}

      <button
        onClick={() => setOpen(true)}
        className="rounded-xl bg-red-600 px-4 py-2 font-medium text-white shadow hover:bg-red-700"
      >
        Cancel MigrateMate
      </button>

      <CancelFlowModal open={open} onClose={() => setOpen(false)} userId={userId} />
    </main>
  );
}
