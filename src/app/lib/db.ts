// Mock DB util for local dev
export const db = {
  async saveCancelFeedback(userId: string, feedback: { rating: number; comment?: string; reason: string; ts: string }) {
    // In production, save to your database here
    console.log('Saved feedback:', { userId, ...feedback });
    return true;
  },

  async cancelSubscription(userId: string, update: { status: string; canceled_at: string; next_payment_at: null }) {
    // In production, update the subscriptions table here
    console.log('Canceled subscription:', { userId, ...update });
    return true;
  },
};
