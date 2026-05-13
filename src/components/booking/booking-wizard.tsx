'use client';

import React from 'react';
import { useBookingStore } from '@/stores/booking-store';
import { StepSchedule } from './step-schedule';
import { StepVehicle } from './step-vehicle';
import { StepEquipment } from './step-equipment';
import { StepReview } from './step-review';

const steps = [
  { id: 1, name: 'Schedule' },
  { id: 2, name: 'Vehicle' },
  { id: 3, name: 'Equipment' },
  { id: 4, name: 'Review' },
];

export function BookingWizard() {
  const currentStep = useBookingStore((state) => state.currentStep);

  return (
    <div className="flex flex-col h-full">
      {/* Progress Bar */}
      <div className="border-b border-[#E5E7EB] bg-[#F8F9FA] px-6 py-4">
        <nav aria-label="Progress">
          <ol role="list" className="flex items-center space-x-4 md:space-x-8">
            {steps.map((step, stepIdx) => (
              <li key={step.name} className="flex-1">
                {step.id < currentStep ? (
                  <div className="group flex flex-col border-l-4 border-[#2563EB] py-2 pl-4 transition-colors md:border-l-0 md:border-t-4 md:pb-0 md:pl-0 md:pt-4">
                    <span className="text-xs font-bold uppercase tracking-wide text-[#2563EB]">Step {step.id}</span>
                    <span className="text-sm font-medium">{step.name}</span>
                  </div>
                ) : step.id === currentStep ? (
                  <div className="flex flex-col border-l-4 border-[#2563EB] py-2 pl-4 md:border-l-0 md:border-t-4 md:pb-0 md:pl-0 md:pt-4" aria-current="step">
                    <span className="text-xs font-bold uppercase tracking-wide text-[#2563EB]">Step {step.id}</span>
                    <span className="text-sm font-medium">{step.name}</span>
                  </div>
                ) : (
                  <div className="group flex flex-col border-l-4 border-[#E5E7EB] py-2 pl-4 md:border-l-0 md:border-t-4 md:pb-0 md:pl-0 md:pt-4">
                    <span className="text-xs font-bold uppercase tracking-wide text-[#6B7280]">Step {step.id}</span>
                    <span className="text-sm font-medium">{step.name}</span>
                  </div>
                )}
              </li>
            ))}
          </ol>
        </nav>
      </div>

      {/* Step Content */}
      <div className="flex-1 p-6">
        {currentStep === 1 && <StepSchedule />}
        {currentStep === 2 && <StepVehicle />}
        {currentStep === 3 && <StepEquipment />}
        {currentStep === 4 && <StepReview />}
      </div>
    </div>
  );
}
