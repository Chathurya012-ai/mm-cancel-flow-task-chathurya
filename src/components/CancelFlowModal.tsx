"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { useRouter } from "next/navigation";

const AVATAR_SRC = "/mihailo-profile.jpeg";
const TOO_EXPENSIVE = "Too expensive";

type Variant = "A" | "B";
type Step = 1 | 2 | 3;

function classNames(...arr: (string | false | null | undefined)[]) {
  return arr.filter(Boolean).join(" ");
}

function ModalHeader({ onClose }: { onClose: () => void }) {
  return (
    <div className="mb-4 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <img
          src={AVATAR_SRC}
          alt="Mihoilo account avatar"
          className="w-8 h-8 rounded-full border border-white shadow"
        />
        <span className="text-lg font-semibold">Mihiolo</span>
      </div>
      <button
        onClick={onClose}
        className="rounded-lg px-3 py-1 text-sm text-gray-700 hover:bg-gray-100 active:scale-[.98]"
        aria-label="Close"
      >
        ✕
      </button>
    </div>
  );
}

type StepBodyProps = {
  step: Step;
  selectedReason: string;
  setSelectedReason: (r: string) => void;
  otherReason: string;
  setOtherReason: (r: string) => void;
  error: string | null;
  setError: (e: string | null) => void;
  csrf: string;
  variant: Variant;
  setStep: (s: Step) => void;
  acceptOffer: (p: { reason: string; price: number | null }) => Promise<void> | void;
  loading: boolean;
  setLoading: (l: boolean) => void;
  reasonOptions: string[];
  onClose: () => void;
  onContinueFromStep1: () => void;
  offerEligible: boolean;
  price: number | null;
  step2Mode: "offer" | "feedback";
  onCanceled?: () => void; // NEW
};

function StepBody(props: StepBodyProps) {
  const {
    step,
    selectedReason,
    setSelectedReason,
    otherReason,
    setOtherReason,
    error,
    setError,
    csrf,
    variant,
    setStep,
    acceptOffer,
    loading,
    reasonOptions,
    onContinueFromStep1,
    offerEligible,
    price,
    step2Mode,
    onCanceled,
  } = props;

  // feedback-only state
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // STEP 1
  if (step === 1) {
    return (
      <motion.div
        key="step-1"
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 }}
        className="space-y-4"
      >
        <h3 className="text-lg font-semibold">Why are you canceling?</h3>
        <div className="space-y-2">
          {reasonOptions.map((r) => (
            <label
              key={r}
              className={classNames(
                "flex cursor-pointer items-center gap-3 rounded-xl border p-3",
                selectedReason === r
                  ? "border-violet-500 bg-violet-50"
                  : "border-gray-200"
              )}
            >
              <input
                type="radio"
                name="reason"
                value={r}
                checked={selectedReason === r}
                onChange={() => setSelectedReason(r)}
                className="accent-violet-600"
              />
              <span>{r}</span>
            </label>
          ))}
          {selectedReason === "Other" && (
            <input
              value={otherReason}
              onChange={(e) => setOtherReason(e.target.value)}
              placeholder="Please specify"
              className="w-full rounded-xl border border-gray-200 p-3"
            />
          )}
        </div>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <div className="flex justify-end gap-3">
          <button
            className="rounded-lg border px-4 py-2"
            onClick={() => setError(null)}
            disabled={loading}
          >
            Clear
          </button>
          <button
            disabled={!selectedReason || loading}
            onClick={onContinueFromStep1}
            className="rounded-lg bg-violet-600 px-4 py-2 font-medium text-white disabled:opacity-50"
          >
            Continue
          </button>
        </div>
      </motion.div>
    );
  }

  // STEP 2 (OFFER)
  if (step === 2 && step2Mode === "offer") {
    if (!offerEligible) {
      setStep(3);
      return null;
    }
    return (
      <motion.div
        key="step-2-offer"
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 }}
        className="space-y-4"
      >
        <h3 className="text-center text-xl font-bold">Wait! Get a special offer</h3>
        {variant === "B" ? (
          <>
            <p className="text-center text-base font-semibold text-violet-700">
              Variant B offers $10 off ($25→$15, $29→$19).
            </p>
            {price !== null && (
              <p className="text-center text-sm text-gray-600">
                Stay for <b>${price}/mo</b>
              </p>
            )}
          </>
        ) : (
          <p className="text-center text-sm text-gray-600">
            Stay for the regular price.
          </p>
        )}
        <div className="flex justify-center gap-3 pt-2">
          <button
            onClick={() => acceptOffer({ reason: selectedReason, price })}
            disabled={loading}
            className="rounded-xl bg-black px-6 py-2 font-semibold text-white disabled:opacity-50"
          >
            Yes, I’ll stay
          </button>
          <button
            onClick={() => setStep(3)}
            className="rounded-xl border px-6 py-2"
            disabled={loading}
          >
            No, cancel anyway
          </button>
        </div>
        <div className="pt-2 text-center text-xs text-gray-500">
          You can switch back anytime.
        </div>
      </motion.div>
    );
  }

  // STEP 2 (FEEDBACK)
  if (step === 2 && step2Mode === "feedback") {
    const submitFeedback = async () => {
      setSubmitting(true);
      try {
        await fetch("/api/cancel/feedback", {
          method: "POST",
          headers: { "Content-Type": "application/json", "CSRF-Token": csrf },
          body: JSON.stringify({ rating, comment, reason: selectedReason }),
        });
      } catch {}
      setSubmitting(false);
      setStep(3);
    };

    return (
      <motion.div
        key="step-2-feedback"
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 }}
        className="space-y-4"
      >
        <h3 className="text-center text-xl font-bold">Before you go, how was your experience?</h3>
        <div className="flex justify-center gap-2">
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              key={n}
              onClick={() => setRating(n)}
              className={classNames(
                "h-9 w-9 rounded-full border text-sm",
                rating >= n ? "bg-violet-600 text-white border-violet-600" : "border-gray-300"
              )}
              aria-label={`Rate ${n}`}
            >
              {n}
            </button>
          ))}
        </div>
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Any feedback to improve?"
          rows={3}
          className="w-full resize-none rounded-xl border border-gray-200 p-3"
        />
        <div className="flex justify-end gap-3">
          <button onClick={() => setStep(3)} className="rounded-lg border px-4 py-2" disabled={submitting}>
            Skip
          </button>
          <button
            onClick={submitFeedback}
            className="rounded-lg bg-violet-600 px-4 py-2 font-medium text-white disabled:opacity-50"
            disabled={submitting || rating === 0}
          >
            Submit feedback
          </button>
        </div>
      </motion.div>
    );
  }

  // STEP 3 (CONFIRM)
  return (
    <motion.div
      key="step-3"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-4"
    >
      <h3 className="text-lg font-semibold">Confirm cancellation</h3>
      <p className="text-sm text-gray-600">
        Reason: <b>{selectedReason}</b>
        {selectedReason === "Other" && otherReason ? ` — ${otherReason}` : ""}
      </p>
      <div className="flex justify-end gap-3">
        <button className="rounded-lg border px-4 py-2" onClick={() => setStep(1)}>
          Back
        </button>
        <button
          className="rounded-lg bg-red-600 px-4 py-2 font-medium text-white"
          disabled={props.loading}
          onClick={async () => {
            props.setLoading(true);
            props.setError(null);
            const res = await fetch("/api/subscription/cancel", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                "CSRF-Token": props.csrf,
              },
            });
            const data = await res.json().catch(() => null);
            if (res.ok && (data?.ok || data?.status === "canceled")) {
              props.onCanceled?.();
              props.onClose();
            } else {
              props.setError(data?.error || "Could not cancel subscription.");
            }
            props.setLoading(false);
          }}
        >
          Confirm cancel
        </button>
      </div>
    </motion.div>
  );
}

export interface CancelFlowModalProps {
  open: boolean;
  onClose: () => void;
  onCanceled?: () => void; // parent can flip status
}

export default function CancelFlowModal({ open, onClose, onCanceled }: CancelFlowModalProps) {
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
    "Other",
  ];

  const [selectedReason, setSelectedReason] = useState("");
  const [otherReason, setOtherReason] = useState("");
  const [csrf, setCsrf] = useState("test-csrf-token"); // Default for testing
  const [step, setStep] = useState<Step>(1);
  const [variant, setVariant] = useState<Variant>("A");
  const [offerEligible, setOfferEligible] = useState(false);
  const [price, setPrice] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [step2Mode, setStep2Mode] = useState<"offer" | "feedback">("feedback");

  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    fetch("/api/csrf").then(() => {
      const m = document.cookie.match(/(?:^|; )csrf=([^;]+)/);
      setCsrf(m?.[1] ?? "test-csrf-token"); // Use default if missing
    });
  }, [open]);

  useEffect(() => {
    setOfferEligible(false);
    setPrice(null);
  }, [selectedReason]);

  const onContinueFromStep1 = async () => {
    if (!selectedReason) {
      setError("Please select a reason");
      return;
    }
    setError(null);
    setLoading(true);

    if (selectedReason !== TOO_EXPENSIVE) {
      setStep2Mode("feedback");
      setOfferEligible(false);
      setVariant("A");
      setPrice(null);
      setStep(2);
      setLoading(false);
      return;
    }

    try {
      const r = await fetch(`/api/cancel/variant?reason=too_expensive`);
      const d = await r.json().catch(() => null);
      if (r.ok && d?.offerEligible) {
        setOfferEligible(true);
        if (d?.variant === "A" || d?.variant === "B") setVariant(d.variant);
        if (typeof d?.price === "number") setPrice(d.price);
        setStep2Mode("offer");
      } else {
        setOfferEligible(false);
        setStep2Mode("feedback");
      }
      setStep(2);
    } catch {
      setOfferEligible(false);
      setStep2Mode("feedback");
      setStep(2);
    } finally {
      setLoading(false);
    }
  };

  const acceptOffer = async ({ reason, price }: { reason: string; price: number | null }) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/cancel/apply-offer", {
        method: "POST",
        headers: { "Content-Type": "application/json", "CSRF-Token": csrf },
        body: JSON.stringify({ variant, reason, price }),
      });
      const d = await res.json().catch(() => null);
      if (!res.ok) {
        setError(d?.error || "Could not apply offer.");
      } else {
        onClose();
      }
    } catch {
      setError("Network error.");
    } finally {
      setLoading(false);
    }
  };

  const modalVariants = useMemo(
    () => ({
      initial: { opacity: 0, y: 16, scale: 0.98 },
      animate: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.2 } },
      exit: { opacity: 0, y: 16, scale: 0.98, transition: { duration: 0.15 } },
    }),
    []
  );

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-40">
      <div className="absolute inset-0 -z-20 bg-black/50" aria-hidden />
      <div className="fixed inset-0 z-50 grid place-items-center overflow-y-auto" role="dialog" aria-modal="true">
        <AnimatePresence>
          <motion.div
            key="modal"
            ref={modalRef}
            variants={modalVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className="relative w-full max-w-xl overflow-visible rounded-2xl border border-white/10 bg-white/80 p-5 shadow-2xl backdrop-blur-xl ring-1 ring-white/10 md:p-6"
            tabIndex={-1}
          >
            <div aria-hidden className="pointer-events-none absolute inset-0 z-10 overflow-hidden rounded-2xl">
              <div className="absolute -top-20 -left-16 h-72 w-72 rounded-full bg-violet-500/20 blur-3xl" />
              <div className="absolute -bottom-24 -right-10 h-72 w-72 rounded-full bg-blue-400/20 blur-3xl" />
            </div>

            <ModalHeader onClose={onClose} />

            <div className="sticky top-0 z-10 mb-4 flex items-center gap-2 rounded-xl bg-white/80 py-2 backdrop-blur-xl">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className={classNames(
                    "h-1.5 flex-1 rounded-full",
                    (step as number) >= i ? "bg-violet-600" : "bg-gray-200"
                  )}
                />
              ))}
            </div>

            <div className="relative min-h-[240px]">
              {loading && (
                <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/60 backdrop-blur-sm">
                  <div className="h-8 w-8 animate-spin rounded-full border-4 border-violet-400 border-t-transparent" />
                </div>
              )}
              <AnimatePresence mode="wait">
                <StepBody
                  step={step}
                  selectedReason={selectedReason}
                  setSelectedReason={setSelectedReason}
                  otherReason={otherReason}
                  setOtherReason={setOtherReason}
                  error={error}
                  setError={setError}
                  csrf={csrf}
                  variant={variant}
                  setStep={setStep}
                  acceptOffer={acceptOffer}
                  loading={loading}
                  setLoading={setLoading}
                  reasonOptions={reasonOptions}
                  onClose={onClose}
                  onContinueFromStep1={onContinueFromStep1}
                  offerEligible={offerEligible}
                  price={price}
                  step2Mode={step2Mode}
                  onCanceled={onCanceled}
                />
              </AnimatePresence>
            </div>

            <div className="mt-5 text-center text-xs text-gray-500">
              Step {step} / 3 · Variant {variant}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
