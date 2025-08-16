'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence, easeIn, easeOut } from 'framer-motion';
import Image from 'next/image';
import { z } from 'zod';
import * as Dialog from '@radix-ui/react-dialog';
import * as RadioGroup from '@radix-ui/react-radio-group';

// Types
type Step = 'confirm' | 'reason' | 'downsell' | 'complete';
type Variant = 'A' | 'B';

interface CancelSubscriptionPageProps {
  csrf: string;
  onClose?: () => void;
  variant: Variant;
}

// Validation schema
const cancelRequestSchema = z.object({
  reason: z.string().min(2).max(200),
  downsell_variant: z.enum(['A', 'B']),
  accepted_downsell: z.boolean().optional(),
});

// Reasons data
const reasons = [
  { id: 'too_expensive', label: 'Too expensive', icon: '💰' },
  { id: 'not_helpful', label: 'Platform not helpful', icon: '🤔' },
  { id: 'no_jobs', label: 'Not enough relevant jobs', icon: '💼' },
  { id: 'not_moving', label: 'Decided not to move', icon: '🏠' },
  { id: 'other', label: 'Other', icon: '📝' },
];

// Downsell offers
const downsellOffers = {
  A: { original: 25, discounted: 12.50, percentage: 50 },
  B: { original: 29, discounted: 19, percentage: 34 },
};

export default function CancelSubscriptionPage({ csrf, onClose, variant }: CancelSubscriptionPageProps) {
  const [currentStep, setCurrentStep] = useState<Step>('confirm');
  const [selectedReason, setSelectedReason] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [acceptedDownsell, setAcceptedDownsell] = useState<boolean | undefined>(undefined);

  // Handle reason selection
  const handleReasonSelect = useCallback((reason: string) => {
    setSelectedReason(reason);
    setError(null);
  }, []);

  // Handle step navigation
  const handleNextStep = useCallback(() => {
    if (currentStep === 'confirm') {
      setCurrentStep('reason');
    } else if (currentStep === 'reason' && selectedReason) {
      setCurrentStep('downsell');
    }
  }, [currentStep, selectedReason]);

  const handleBackStep = useCallback(() => {
    if (currentStep === 'reason') {
      setCurrentStep('confirm');
    } else if (currentStep === 'downsell') {
      setCurrentStep('reason');
    }
  }, [currentStep]);

  // Handle downsell response
  const handleDownsellResponse = useCallback(async (accepted: boolean) => {
    setAcceptedDownsell(accepted);
    setIsLoading(true);
    setError(null);

    try {
      const payload = {
        reason: selectedReason,
        downsell_variant: variant,
        accepted_downsell: accepted,
      };

      // Validate payload
      cancelRequestSchema.parse(payload);

      const response = await fetch('/api/cancel/start', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-csrf-token': csrf,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to process cancellation');
      }

      setCurrentStep('complete');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  }, [selectedReason, variant, csrf]);

  // Handle complete cancellation
  const handleCompleteCancellation = useCallback(async () => {
    await handleDownsellResponse(false);
  }, [handleDownsellResponse]);


  // Keyboard navigation for reasons
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (currentStep !== 'reason') return;
      
      const reasonElements = document.querySelectorAll('[data-reason]');
      const currentIndex = Array.from(reasonElements).findIndex(el => 
        el.getAttribute('data-reason') === selectedReason
      );

      if (e.key === 'ArrowDown' || e.key === 'ArrowRight') {
        e.preventDefault();
        const nextIndex = (currentIndex + 1) % reasonElements.length;
        const nextReason = reasonElements[nextIndex]?.getAttribute('data-reason');
        if (nextReason) setSelectedReason(nextReason);
      } else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') {
        e.preventDefault();
        const prevIndex = currentIndex <= 0 ? reasonElements.length - 1 : currentIndex - 1;
        const prevReason = reasonElements[prevIndex]?.getAttribute('data-reason');
        if (prevReason) setSelectedReason(prevReason);
      } else if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        if (selectedReason) handleNextStep();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [currentStep, selectedReason, handleNextStep]);

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        duration: 0.5,
        staggerChildren: 0.1 
      }
    },
  };

  const stepVariants = {
    hidden: { opacity: 0, x: 20 },
    visible: { 
      opacity: 1, 
      x: 0,
      transition: { duration: 0.3, ease: easeOut }
    },
    exit: { 
      opacity: 0, 
      x: -20,
      transition: { duration: 0.2, ease: easeIn }
    },
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 20, scale: 0.95 },
    visible: { 
      opacity: 1, 
      y: 0, 
      scale: 1,
      transition: { duration: 0.3, ease: easeOut }
    },
  };

  return (
    <div className="fixed inset-0 min-h-screen min-w-full flex items-center justify-center bg-black/70 z-50">
      {/* Background with parallax effect */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          // backgroundImage removed. Use neutral background.
          filter: 'brightness(0.6)',
        }}
      />
      
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/40" aria-hidden />
      
      {/* Main content */}
      <motion.div 
        className="relative z-10 w-full max-w-lg mx-auto p-6"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
                 <div className="bg-white/90 backdrop-blur-2xl rounded-2xl shadow-2xl border border-white/20 ring-1 ring-white/10 overflow-hidden">
                     {/* Header with profile image */}
           <div className="relative p-4 sm:p-6 pb-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="relative w-12 h-12 rounded-full overflow-hidden ring-2 ring-white/20">
                  <Image
                    src="/mihailo-profile.jpeg"
                    alt="Profile"
                    fill
                    className="object-cover"
                  />
                </div>
                                 <div>
                   <h1 className="text-xl font-bold text-gray-900 leading-tight">Cancel Subscription</h1>
                   <p className="text-sm text-gray-600">We&apos;re sorry to see you go</p>
                 </div>
              </div>
              
              {/* Help button */}
              <Dialog.Root>
                <Dialog.Trigger asChild>
                  <button className="text-sm text-gray-500 hover:text-gray-700 transition-colors">
                    Need help?
                  </button>
                </Dialog.Trigger>
                <Dialog.Portal>
                  <Dialog.Overlay className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50" />
                  <Dialog.Content className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg p-6 max-w-sm w-full mx-4 z-50">
                    <Dialog.Title className="text-lg font-semibold mb-2">
                      Need Help?
                    </Dialog.Title>
                    <Dialog.Description className="text-gray-600 mb-4">
                      If you&apos;re having trouble or have questions about your subscription, 
                      please contact our support team at support@example.com
                    </Dialog.Description>
                    <Dialog.Close asChild>
                      <button className="w-full py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                        Got it
                      </button>
                    </Dialog.Close>
                  </Dialog.Content>
                </Dialog.Portal>
              </Dialog.Root>
            </div>

            {/* Progress indicator */}
            <div className="flex items-center space-x-2 mb-6">
              {(['confirm', 'reason', 'downsell', 'complete'] as Step[]).map((step, index) => (
                <React.Fragment key={step}>
                  <div className={`w-2 h-2 rounded-full transition-colors ${
                    currentStep === step ? 'bg-blue-600' : 
                    ['confirm', 'reason', 'downsell', 'complete'].indexOf(currentStep) > index ? 'bg-green-500' : 'bg-gray-300'
                  }`} />
                  {index < 3 && (
                    <div className={`flex-1 h-0.5 transition-colors ${
                      ['confirm', 'reason', 'downsell', 'complete'].indexOf(currentStep) > index ? 'bg-green-500' : 'bg-gray-200'
                    }`} />
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>

                     {/* Step content */}
           <div className="px-4 sm:px-6 pb-6">
            <AnimatePresence mode="wait">
              {currentStep === 'confirm' && (
                <motion.div
                  key="confirm"
                  variants={stepVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  className="space-y-4"
                >
                  <div className="text-center">
                                         <h2 className="text-lg font-semibold text-gray-900 mb-2 leading-tight">
                       Are you sure you want to cancel?
                     </h2>
                    <p className="text-gray-600 text-sm">
                      We&apos;d love to understand why and see if we can help before you go.
                    </p>
                  </div>
                  
                  <div className="flex space-x-3 pt-4">
                                         <button
                       onClick={onClose}
                       className="flex-1 py-3 px-4 text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-300 focus-visible:ring-offset-2"
                     >
                       Keep subscription
                     </button>
                     <button
                       onClick={handleNextStep}
                       className="flex-1 py-3 px-4 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-300 focus-visible:ring-offset-2"
                     >
                       Continue
                     </button>
                  </div>
                </motion.div>
              )}

              {currentStep === 'reason' && (
                <motion.div
                  key="reason"
                  variants={stepVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  className="space-y-4"
                >
                  <div>
                                         <h2 id="reason-heading" className="text-lg font-semibold text-gray-900 mb-2 leading-tight">
                       What&apos;s the main reason for cancelling?
                     </h2>
                    <p className="text-gray-600 text-sm mb-4">
                      Please take a minute to let us know why:
                    </p>
                  </div>

                                     <RadioGroup.Root
                     value={selectedReason}
                     onValueChange={handleReasonSelect}
                     className="space-y-3"
                     role="radiogroup"
                     aria-labelledby="reason-heading"
                   >
                    {reasons.map((reason) => (
                                             <motion.div
                         key={reason.id}
                         variants={cardVariants}
                         whileHover={{ scale: 1.02, y: -2, transition: { duration: 0.2 } }}
                         whileTap={{ scale: 0.98 }}
                       >
                                                 <RadioGroup.Item
                           value={reason.id}
                           className="w-full"
                           data-reason={reason.id}
                           aria-checked={selectedReason === reason.id}
                           role="radio"
                         >
                                                     <div className={`
                             w-full p-4 rounded-xl border-2 cursor-pointer transition-all
                             ${selectedReason === reason.id 
                               ? 'border-blue-500 bg-blue-50 shadow-lg' 
                               : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-lg'
                             }
                             focus:outline-none focus:ring-2 focus:ring-blue-300 focus-visible:ring-2 focus-visible:ring-blue-300
                           `}>
                            <div className="flex items-center space-x-3">
                              <div className="text-2xl">{reason.icon}</div>
                              <span className="text-gray-800 font-medium">{reason.label}</span>
                              <div className="ml-auto w-4 h-4 rounded-full border-2 flex items-center justify-center">
                                {selectedReason === reason.id && (
                                  <div className="w-2 h-2 bg-blue-500 rounded-full" />
                                )}
                              </div>
                            </div>
                          </div>
                        </RadioGroup.Item>
                      </motion.div>
                    ))}
                  </RadioGroup.Root>

                                     {error && (
                     <motion.div
                       initial={{ opacity: 0, y: -10 }}
                       animate={{ opacity: 1, y: 0 }}
                       className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm"
                       aria-live="polite"
                       role="alert"
                     >
                       {error}
                     </motion.div>
                   )}

                  <div className="flex space-x-3 pt-4">
                                       <button
                     onClick={handleBackStep}
                     className="flex-1 py-3 px-4 text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-300 focus-visible:ring-offset-2"
                   >
                     Back
                   </button>
                   <button
                     onClick={handleNextStep}
                     disabled={!selectedReason}
                     className="flex-1 py-3 px-4 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-300 focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                   >
                     Continue
                   </button>
                  </div>
                </motion.div>
              )}

              {currentStep === 'downsell' && (
                <motion.div
                  key="downsell"
                  variants={stepVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  className="space-y-4"
                >
                  <div className="text-center">
                                         <h2 className="text-lg font-semibold text-gray-900 mb-2 leading-tight">
                       Wait! Before you go...
                     </h2>
                    <p className="text-gray-600 text-sm mb-6">
                      We&apos;d love to keep you as a customer. Here&apos;s a special offer:
                    </p>
                  </div>

                  <motion.div
                    variants={cardVariants}
                    className="bg-gradient-to-br from-green-50 to-blue-50 border-2 border-green-200 rounded-xl p-6 text-center"
                  >
                    <div className="text-3xl mb-2">🎉</div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">
                      {downsellOffers[variant].percentage}% OFF
                    </h3>
                    <div className="text-2xl font-bold text-green-600 mb-1">
                      ${downsellOffers[variant].discounted}
                    </div>
                    <div className="text-gray-500 line-through">
                      ${downsellOffers[variant].original}
                    </div>
                    <p className="text-sm text-gray-600 mt-2">
                      Limited time offer - save ${downsellOffers[variant].original - downsellOffers[variant].discounted} today!
                    </p>
                  </motion.div>

                  <div className="flex space-x-3 pt-4">
                    <button
                      onClick={handleBackStep}
                      className="flex-1 py-3 px-4 text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-300"
                    >
                      Back
                    </button>
                                         <button
                       onClick={() => handleDownsellResponse(true)}
                       disabled={isLoading}
                       className={`flex-1 py-3 px-4 text-white rounded-xl transition-all focus:outline-none focus:ring-2 disabled:opacity-50 ${
                         variant === 'A' 
                           ? 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 focus:ring-blue-300 shadow-lg hover:shadow-xl' 
                           : 'bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 focus:ring-green-300 shadow-lg hover:shadow-xl'
                       }`}
                     >
                       {isLoading ? 'Processing...' : 'Accept Offer'}
                     </button>
                  </div>

                  <button
                    onClick={handleCompleteCancellation}
                    disabled={isLoading}
                    className="w-full py-3 px-4 text-gray-600 bg-transparent border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-300 disabled:opacity-50"
                  >
                    {isLoading ? 'Processing...' : 'Complete cancellation'}
                  </button>
                </motion.div>
              )}

              {currentStep === 'complete' && (
                <motion.div
                  key="complete"
                  variants={stepVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  className="text-center space-y-4"
                >
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 260, damping: 20 }}
                    className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4"
                  >
                    <div className="text-2xl">✅</div>
                  </motion.div>

                  <div>
                                         <h2 className="text-lg font-semibold text-gray-900 mb-2 leading-tight">
                       {acceptedDownsell ? 'Offer Accepted!' : 'Cancellation Complete'}
                     </h2>
                    <p className="text-gray-600 text-sm">
                      {acceptedDownsell 
                        ? 'Thank you for staying with us! Your discount has been applied.'
                        : 'Your subscription has been cancelled. We hope to see you again soon!'
                      }
                    </p>
                  </div>

                  <button
                    onClick={onClose}
                    className="w-full py-3 px-4 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-300"
                  >
                    Close
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
