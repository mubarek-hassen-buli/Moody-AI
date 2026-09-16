import React from "react";
import { cn } from "@/lib/utils";

interface PhoneFrameProps {
  children: React.ReactNode;
  className?: string;
  badge?: string;
}

export const PhoneFrame: React.FC<PhoneFrameProps> = ({ children, className = "", badge }) => {
  return (
    <div className={cn("relative mx-auto flex flex-col items-center select-none", className)}>
      {badge && (
        <div className="absolute -top-3 z-30 px-3 py-1 bg-primary text-white text-xs font-semibold rounded-full shadow-md">
          {badge}
        </div>
      )}

      {/* Device Outer Frame */}
      <div className="relative w-[320px] sm:w-[350px] h-[640px] sm:h-[680px] bg-[#1c1c1e] rounded-[52px] p-3 shadow-2xl shadow-primary/15 border-4 border-[#2c2c2e] ring-1 ring-black/20">
        {/* Dynamic Island / Notch */}
        <div className="absolute top-6 left-1/2 -translate-x-1/2 z-30 w-24 h-5 bg-black rounded-full flex items-center justify-end px-2.5">
          <div className="w-2.5 h-2.5 rounded-full bg-[#0d0d0f] border border-white/10" />
        </div>

        {/* Screen Display */}
        <div className="relative w-full h-full bg-[#FDF6F0] rounded-[42px] overflow-hidden flex flex-col pt-9 pb-4 text-[#1A1A1A]">
          {/* Status Bar */}
          <div className="px-6 flex justify-between items-center text-[10px] font-semibold text-neutral-800 tracking-wider">
            <span>9:41</span>
            <div className="flex items-center gap-1.5">
              <span>5G</span>
              <div className="w-5 h-2.5 border border-neutral-800 rounded-[3px] p-[1px] flex items-center">
                <div className="w-full h-full bg-neutral-800 rounded-[1.5px]" />
              </div>
            </div>
          </div>

          {/* Screen Content */}
          <div className="flex-1 overflow-y-auto px-4 pt-2 no-scrollbar">
            {children}
          </div>

          {/* Bottom Home Indicator */}
          <div className="pt-2 pb-1 flex justify-center">
            <div className="w-28 h-1 bg-neutral-300 rounded-full" />
          </div>
        </div>
      </div>
    </div>
  );
};
