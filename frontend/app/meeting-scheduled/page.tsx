'use client';

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

export default function MeetingScheduledPage() {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setOpen(true);
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-tr from-[#f5eee7] via-white to-[#ece9e6]">
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent
          className="
            sm:max-w-[410px] 
            bg-white 
            rounded-2xl 
            p-0
            shadow-2xl
            border-[1.5px] border-[#ece3d7]
            "
          style={{
            fontFamily: `ui-serif, 'Playfair Display', 'Noto Serif', serif`,
          }}
        >
          <DialogHeader className="px-8 pt-8">
            <DialogTitle
              className="
                text-[1.95rem] 
                font-extrabold 
                font-serif 
                tracking-tight
                text-[#866353]
                text-center
              "
              style={{
                fontFamily: `'Playfair Display', serif`,
                letterSpacing: '-0.01em'
              }}
            >
              Thank You for Scheduling!
            </DialogTitle>
          </DialogHeader>
          <div className="flex flex-col items-center text-center px-8 pb-8">
            <div className="text-5xl mb-3 select-none">✨</div>
            <div className="text-lg font-medium text-gray-800 mb-1" style={{ fontFamily: "ui-serif, 'Noto Serif', serif" }}>
              Your meeting is confirmed.
            </div>
            <div 
              className="text-gray-500 text-base mb-7"
              style={{ fontFamily: "'Noto Sans', sans-serif" }}
            >
              Thank you for booking with Emilio Beaufort.<br />
              You will receive a confirmation email soon.<br />
              We look forward to connecting!
            </div>
            <Button
              onClick={() => router.push("/")}
              className="
                w-full
                rounded-xl
                bg-[#866353]
                text-white
                font-semibold
                py-2
                text-lg
                hover:bg-[#a78d75]
                transition-colors
                shadow-sm
                mb-2
              "
              style={{
                fontFamily: "'Noto Sans', sans-serif",
                letterSpacing: '0.01em'
              }}
            >
              Back to Home
            </Button>
            <button
              className="
                mt-1
                text-sm
                text-[#866353]
                underline
                hover:text-[#5a402b]
                transition-colors
                bg-transparent
              "
              onClick={() => setOpen(false)}
              style={{
                fontFamily: "'Noto Sans', sans-serif"
              }}
            >
              Close this message
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
