import React from "react";

const AppLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="relative min-h-screen">
      <div
        className="absolute inset-0 z-0 bg-cover bg-center brightness-75"
        style={{ backgroundImage: "url('/empire-state-compressed.jpg')" }}
      aria-hidden="true"
    />
    <div className="absolute inset-0 z-0 bg-black/30" aria-hidden="true" />
    <main className="relative z-10 min-h-screen">
      {children}
    </main>
  </div>
);

export default AppLayout;
