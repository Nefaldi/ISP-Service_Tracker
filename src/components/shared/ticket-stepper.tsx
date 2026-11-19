import React from "react";
import { Check } from "lucide-react";

interface TicketStepperProps {
  currentStatus: string;
}

const STEPS = [
  { key: "OPEN", label: "Open", stepNum: 1 },
  { key: "ASSIGNED", label: "Assigned", stepNum: 2 },
  { key: "IN_PROGRESS", label: "In Progress", stepNum: 3 },
  { key: "RESOLVED", label: "Resolved", stepNum: 4 },
  { key: "CLOSED", label: "Closed", stepNum: 5 },
];

function getStepIndex(status: string): number {
  switch (status) {
    case "OPEN":
      return 0;
    case "ASSIGNED":
      return 1;
    case "IN_PROGRESS":
      return 2;
    case "RESOLVED":
      return 3;
    case "CLOSED":
      return 4;
    default:
      return 0;
  }
}

export function TicketStepper({ currentStatus }: TicketStepperProps) {
  const currentIndex = getStepIndex(currentStatus);

  return (
    <div className="w-full rounded-[12px] border border-[#E2E8F0] bg-white p-6">
      {/* Header Stepper with SSE status indicator */}
      <div className="flex items-center justify-between pb-6 mb-6 border-b border-[#E2E8F0]">
        <h2 className="text-[16px] font-semibold text-[#0F172A]">
          Status Alur Pengerjaan Tiket
        </h2>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#EFF6FF] border border-[#BFDBFE] text-[#1D4ED8] text-xs font-medium">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#3B82F6] opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-[#1D4ED8]"></span>
          </span>
          <span>Live Tracking Terhubung</span>
        </div>
      </div>

      {/* Stepper Progress Elements */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between relative gap-6 sm:gap-2">
        {/* Horizontal Connecting Line for Desktop */}
        <div className="hidden sm:block absolute top-[18px] left-[5%] right-[5%] h-[2px] bg-[#E2E8F0] -z-0" />

        {STEPS.map((step, idx) => {
          const isDone = idx < currentIndex;
          const isActive = idx === currentIndex;
          const isUpcoming = idx > currentIndex;

          return (
            <div
              key={step.key}
              className="relative z-10 flex flex-row sm:flex-col items-center gap-3 sm:gap-2 text-left sm:text-center w-full sm:w-auto"
            >
              {/* Stepper Circle (UI_CONTEXT 4.2) */}
              {isDone && (
                <div className="h-[36px] w-[36px] rounded-full bg-[#1D4ED8] text-white flex items-center justify-center font-bold text-[14px] shrink-0">
                  <Check className="h-4 w-4 stroke-[3]" />
                </div>
              )}

              {isActive && (
                <div className="h-[36px] w-[36px] rounded-full bg-white border-2 border-[#1D4ED8] text-[#1D4ED8] shadow-[0_0_0_4px_#DBEAFE] flex items-center justify-center font-bold text-[14px] shrink-0">
                  {step.stepNum}
                </div>
              )}

              {isUpcoming && (
                <div className="h-[36px] w-[36px] rounded-full bg-white border border-[#CBD5E1] text-[#64748B] flex items-center justify-center font-bold text-[14px] shrink-0">
                  {step.stepNum}
                </div>
              )}

              {/* Step Label (UI_CONTEXT 4.2: 14px semibold) */}
              <div>
                <span
                  className={`block text-[14px] font-semibold leading-tight ${
                    isActive
                      ? "text-[#1D4ED8]"
                      : isDone
                      ? "text-[#0F172A]"
                      : "text-[#64748B]"
                  }`}
                >
                  {step.label}
                </span>
                <span className="block text-[11px] text-[#64748B] sm:hidden">
                  {isActive
                    ? "Sedang berlangsung"
                    : isDone
                    ? "Selesai"
                    : "Menunggu tahap sebelumnya"}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
