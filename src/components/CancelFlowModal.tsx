"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import CancelSubscriptionPage from "./CancelSubscriptionPage";
import { createPortal } from "react-dom";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";

type Variant = "A" | "B";

function classNames(...arr: (string | false | null | undefined)[]) {
  return arr.filter(Boolean).join(" ");
}

interface CancelFlowModalProps {
  open: boolean;
  onClose: () => void;
  userId: string;
}

export default function CancelFlowModal({ open, onClose, userId }: CancelFlowModalProps) {
  const reasonOptions = [
    "Too expensive",
    "Not using enough",
    "Found a better alternative",
    "Technical issues",
    "Customer support",
    "Missing features",
    "Switching jobs",
    "No longer needed",
    "Company policy",
    "Temporary leave",
    "Other"
  ];
  const [selectedReason, setSelectedReason] = useState<string>("");
  const [otherReason, setOtherReason] = useState("");
  const [csrf, setCsrf] = useState("");
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [variant, setVariant] = useState<Variant>("A");
  const [reason, setReason] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLElement | null>(null);

  // fetch CSRF once the modal opens
  useEffect(() => {
    if (!open) return;
    fetch("/api/csrf").then(() => {
      const m = document.cookie.match(/(?:^|; )csrf=([^;]+)/);
      setCsrf(m?.[1] ?? "");
    });
  }, [open]);

  // Trap focus inside modal, return focus to trigger on close, support Enter/Esc
  useEffect(() => {
    if (!open) return;
    const focusable = modalRef.current?.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    if (focusable && focusable.length) {
      focusable[0].focus();
      const handleKey = (e: KeyboardEvent) => {
        if (e.key === "Escape") {
          e.preventDefault();
          onClose();
        }
        if (e.key === "Tab") {
          const first = focusable[0];
          const last = focusable[focusable.length - 1];
          if (e.shiftKey && document.activeElement === first) {
            e.preventDefault();
            last.focus();
          } else if (!e.shiftKey && document.activeElement === last) {
            e.preventDefault();
            first.focus();
          }
        }
        if (e.key === "Enter" && document.activeElement === focusable[0]) {
          // Only submit if on step 1 and input is focused
          if (step === 1) {
            (modalRef.current?.querySelector('form') as HTMLFormElement)?.requestSubmit();
          }
        }
      };
      modalRef.current?.addEventListener("keydown", handleKey);
      return () => modalRef.current?.removeEventListener("keydown", handleKey);
    }
  }, [open, step, onClose]);

  // Save trigger ref and restore focus on close
  useEffect(() => {
    if (open) {
      triggerRef.current = document.activeElement as HTMLElement;
    } else {
      triggerRef.current?.focus();
    }
  }, [open]);

  // click outside to close
  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === overlayRef.current) onClose();
  };

  async function startFlow(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const trimmed = reason.trim();
    if (trimmed.length < 2) {
      setError("Please provide a short reason.");
      setLoading(false);
      return;
    }
    if (trimmed.length > 200) {
    console.log('Sending to /api/cancel/start:', { userId, reason: trimmed });
      setError("Keep it under 200 characters.");
      setLoading(false);
      return;
    }
    try {
      const res = await fetch('/api/cancel/start', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-csrf': csrf, // 👈 must match the cookie set by /api/csrf
        },
        body: JSON.stringify({ userId, reason: trimmed }), // 👈 include userId!
      });
      const data = await res.json();
      console.log('start status', res.status, data);
      if (!res.ok) {
        setError(data?.error || 'Unable to start');
        return;
      }
      setVariant(data.variant);
      setStep(data.variant === 'A' ? 3 : 2);
    } catch (err) {
      setError('Network error.');
    }
    setLoading(false);
  }

  async function acceptOffer() {
    setLoading(true);
    try {
      const res = await fetch("/api/cancel/offer", { method: "POST", headers: { "x-csrf": csrf } });
      const d = await res.json();
      if (!res.ok) {
        setError(d?.error || "Could not apply offer.");
      } else {
        setToast("🎉 Discount applied! Your subscription continues.");
        setTimeout(() => setToast(null), 3000);
        onClose();
      }
    } catch (err) {
      setError("Network error.");
    }
    setLoading(false);
  }

  async function confirmCancel() {
    setLoading(true);
    try {
      const res = await fetch("/api/cancel/confirm", { method: "POST", headers: { "x-csrf": csrf } });
      const d = await res.json();
      if (!res.ok) {
        setError(d?.error || "Failed to confirm.");
      } else {
        setToast("✅ Cancellation scheduled.");
        setTimeout(() => setToast(null), 3000);
        onClose();
      }
    } catch (err) {
      setError("Network error.");
    }
    setLoading(false);
  }

  // Motion presets
  const modalVariants = useMemo(
    () => ({
      initial: { opacity: 0, y: 16, scale: 0.98 },
      animate: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.2 } },
      exit: { opacity: 0, y: 16, scale: 0.98, transition: { duration: 0.15 } },
    }),
    []
  );

  const stepVariants = {
    initial: { opacity: 0, x: 20 },
    animate: { opacity: 1, x: 0, transition: { duration: 0.2 } },
    exit: { opacity: 0, x: -20, transition: { duration: 0.15 } },
  };

  // Focus trap for accessibility
  useEffect(() => {
    if (!open) return;
    const focusable = modalRef.current?.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    if (focusable && focusable.length) {
      focusable[0].focus();
      const handleTab = (e: KeyboardEvent) => {
        if (e.key !== "Tab") return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      };
      modalRef.current?.addEventListener("keydown", handleTab);
      return () => modalRef.current?.removeEventListener("keydown", handleTab);
    }
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-40">
      {/* Full-bleed background image */}
      <div
        aria-hidden
        className="fixed inset-0 w-full h-full"
        style={{
          backgroundImage: "url('/empire-state-compressed.jpg')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          zIndex: 0,
        }}
      />
      {/* Overlay for shading */}
      <div className="fixed inset-0 w-full h-full bg-black/60 pointer-events-none z-10" aria-hidden />
      {/* Gradient blobs (optional, can remove if too busy) */}
      <div aria-hidden className="pointer-events-none fixed inset-0 overflow-hidden z-20">
        <div className="absolute -top-20 -left-16 h-72 w-72 rounded-full bg-violet-500/20 blur-3xl" />
        <div className="absolute -bottom-24 -right-10 h-72 w-72 rounded-full bg-blue-400/20 blur-3xl" />
      </div>
      {/* Modal content */}
      <div
        ref={overlayRef}
        onMouseDown={handleOverlayClick}
        className="fixed inset-0 z-50 grid place-items-center overflow-y-auto"
        role="dialog"
        aria-modal="true"
        aria-labelledby="cancel-modal-title"
        aria-describedby="cancel-modal-desc"
      >
        <AnimatePresence>
          <motion.div
            key="modal"
            ref={modalRef}
            variants={modalVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className="relative w-[92vw] max-w-lg rounded-2xl border border-white/10 bg-white/80 p-5 shadow-2xl backdrop-blur-xl md:p-6"
            tabIndex={-1}
          >
          {/* header */}
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="inline-flex h-2.5 w-2.5 animate-pulse rounded-full bg-violet-600" />
              <h2 className="text-lg font-semibold">Cancel subscription</h2>
            </div>
            <button
              onClick={onClose}
              className="rounded-lg px-3 py-1 text-sm text-gray-700 hover:bg-gray-100 active:scale-[.98]"
              aria-label="Close"
            >
              ✕
            </button>
          </div>

          {/* sticky stepper */}
          <div className="mb-4 flex items-center gap-2 sticky top-0 z-10 bg-white/80 backdrop-blur-xl py-2 rounded-xl">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className={classNames(
                  "h-1.5 flex-1 rounded-full",
                  step >= i ? "bg-violet-600" : "bg-gray-200"
                )}
              />
            ))}
          </div>

          {/* body */}
          <div className="relative min-h-[240px]">
            {loading && (
              <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/60 backdrop-blur-sm">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-violet-400 border-t-transparent" />
              </div>
            )}
            <AnimatePresence mode="wait">
              {step === 1 && (
                <motion.form
                  key="step1"
                  variants={stepVariants}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                  onSubmit={async (e) => {
                    e.preventDefault();
                    setError(null);
                    // Validation
                    if (!selectedReason) {
                      setError("Please select a reason.");
                      return;
                    }
                    if (selectedReason === "Other" && otherReason.trim().length < 2) {
                      setError("Please provide at least 2 characters for 'Other'.");
                      return;
                    }
                    let combined = selectedReason === "Other" ? otherReason.trim() : selectedReason;
                    if (combined.length < 2 || combined.length > 200) {
                      setError("Reason must be 2-200 characters.");
                      return;
                    }
                    setLoading(true);
                    try {
                      const res = await fetch('/api/cancel/start', {
                        method: 'POST',
                        headers: {
                          'Content-Type': 'application/json',
                          'x-csrf': csrf,
                        },
                        body: JSON.stringify({ userId, reason: combined }),
                      });
                      const data = await res.json();
                      if (!res.ok) {
                        setError(data?.error || 'Unable to start');
                        setLoading(false);
                        return;
                      }
                      setVariant(data.variant);
                      setStep(data.variant === 'A' ? 3 : 2);
                    } catch (err) {
                      setError('Network error.');
                    }
                    setLoading(false);
                  }}
                  className="space-y-4"
                >
                  <div className="space-y-2">
                    <label className="text-sm text-gray-700 font-medium mb-2 block">Why are you cancelling?</label>
                    <div className="max-h-48 overflow-y-auto flex flex-col gap-2">
                      {reasonOptions.map(option => (
                        <label key={option} className="flex items-center gap-2 bg-gray-50 rounded-lg px-3 py-2 cursor-pointer hover:bg-violet-50 transition">
                          <input
                            type="radio"
                            name="cancel-reason"
                            checked={selectedReason === option}
                            onChange={() => setSelectedReason(option)}
                            className="accent-violet-600 h-4 w-4 rounded-full"
                          />
                          <span className="text-sm text-gray-800">{option}</span>
                        </label>
                      ))}
                    </div>
                    {selectedReason === "Other" && (
                      <input
                        type="text"
                        value={otherReason}
                        onChange={e => setOtherReason(e.target.value)}
                        placeholder="Type your reason..."
                        className="mt-2 w-full rounded-xl border p-3 outline-none transition focus:ring-2 border-gray-200 focus:ring-violet-200"
                        maxLength={200}
                      />
                    )}
                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                      <span>Min 2, max 200 characters</span>
                      <span>{selectedReason === "Other" ? otherReason.length : selectedReason.length}/200</span>
                    </div>
                    {error && (
                      <p className="mt-2 text-xs text-red-600 animate-pulse">{error}</p>
                    )}
                  </div>
                  <motion.button
                    whileTap={{ scale: 0.98 }}
                    whileHover={{ scale: 1.03 }}
                    className="w-full rounded-xl bg-violet-600 py-3 font-medium text-white shadow hover:bg-violet-700 transition"
                    type="submit"
                    transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                  >
                    Next
                  </motion.button>
                </motion.form>
              )}

              {step === 2 && (
                <motion.div
                  key="step2"
                  variants={stepVariants}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                  className="flex flex-col md:flex-row gap-6 items-center md:items-stretch"
                >
                  <div className="w-full md:w-1/2 flex-shrink-0 flex items-center justify-center">
                    <Image
                      src="/empire-state-compressed.jpg"
                      alt="Offer"
                      width={480}
                      height={270}
                      className="rounded-xl object-cover w-full h-auto"
                      priority
                      style={{ width: "100%", height: "auto" }}
                    />
                  </div>
                  <div className="w-full md:w-1/2 flex flex-col justify-center">
                    <h3 className="mb-1 text-lg font-semibold">Wait! Get <span className="text-violet-700">$10 off</span></h3>
                    <p className="mb-4 text-sm text-gray-600">
                      Stay for <b>$15</b>/mo instead of <s>$25</s>, or <b>$19</b>/mo instead of <s>$29</s>.
                    </p>
                    <div className="space-y-3">
                      <motion.button
                        whileTap={{ scale: 0.98 }}
                        whileHover={{ scale: 1.03 }}
                        onClick={acceptOffer}
                        className="w-full rounded-xl bg-black py-3 font-medium text-white transition"
                        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                      >
                        Yes, I’ll stay
                      </motion.button>
                      <motion.button
                        whileTap={{ scale: 0.98 }}
                        whileHover={{ scale: 1.03 }}
                        onClick={() => setStep(3)}
                        className="w-full rounded-xl border py-3 font-medium transition"
                        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                      >
                        No, cancel anyway
                      </motion.button>
                    </div>
                  </div>
                </motion.div>
              )}

              {step === 3 && (
                  <CancelSubscriptionPage onClose={onClose} csrf={csrf} />
              )}
            </AnimatePresence>
          </div>

          <div className="mt-5 text-center text-xs text-gray-500">
            Step {step} / 3 · Variant {variant}
          </div>
          {/* Toast notification */}
          {toast && createPortal(
            <div className="fixed bottom-6 left-1/2 z-[9999] -translate-x-1/2 rounded-xl bg-black/90 px-6 py-3 text-white shadow-lg animate-fade-in">
              {toast}
            </div>,
            document.body
          )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
