import { useEffect, useRef } from "react";

const WELCOME_DURATION_MS = 3000;

type LoginWelcomeProps = {
  onDone: () => void;
};

export default function LoginWelcome({ onDone }: LoginWelcomeProps) {
  const onDoneRef = useRef(onDone);
  onDoneRef.current = onDone;

  useEffect(() => {
    const timer = window.setTimeout(() => onDoneRef.current(), WELCOME_DURATION_MS);
    return () => window.clearTimeout(timer);
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-6 overflow-hidden bg-neutral-950 text-white">
      <div className="absolute -top-24 -right-24 w-[28rem] h-[28rem] rounded-full bg-violet-600/20 blur-3xl animate-pulse" />
      <div className="absolute -bottom-24 -left-24 w-[24rem] h-[24rem] rounded-full bg-fuchsia-600/10 blur-3xl" />

      <div className="relative flex flex-col items-center text-center page-enter">
        <img
          src="/logo.png"
          alt="Black-Market"
          className="w-24 h-24 rounded-3xl object-cover shadow-[0_0_60px_-10px_rgba(139,92,246,0.6)] mb-8"
        />
        <p className="text-lg sm:text-2xl font-bold leading-relaxed text-neutral-100 max-w-xl">
          کاربر گرامی، به داشبورد هایپر بلک مارکت خوش آمدید
        </p>
        <div className="mt-8 h-1 w-40 rounded-full bg-white/10 overflow-hidden">
          <div className="h-full w-full origin-right bg-violet-500 animate-[welcome-bar_3s_linear_forwards]" />
        </div>
      </div>

      <style>{`
        @keyframes welcome-bar {
          from { transform: scaleX(1); }
          to { transform: scaleX(0); }
        }
      `}</style>
    </div>
  );
}
