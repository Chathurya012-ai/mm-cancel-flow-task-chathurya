'use client';

import CancelSubscriptionPage from '@/components/cancel/CancelSubscriptionPage';

export default function CancelPage() {
  return (
    <CancelSubscriptionPage 
      csrf="__dev_csrf__" 
      variant="A" 
      onClose={() => history.back()} 
    />
  );
}

