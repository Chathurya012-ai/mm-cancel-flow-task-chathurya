// Mock DB util for local dev
export const db = {
  async saveCancelFeedback(userId: string, feedback: { rating: number; comment?: string; reason: string; ts: string }) {
    // In production, save to your database here
    console.log('Saved feedback:', { userId, ...feedback });
    return true;
  },
};
