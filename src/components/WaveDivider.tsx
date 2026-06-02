interface WaveDividerProps {
  flip?: boolean;
  from?: string;
  to?: string;
}

export default function WaveDivider({
  flip = false,
  from = "#f0f5fa",
  to = "#ffffff",
}: WaveDividerProps) {
  return (
    <div
      className="wave-divider"
      style={{
        transform: flip ? "rotate(180deg)" : undefined,
        marginTop: "-1px",
        marginBottom: "-1px",
      }}
    >
      <svg
        viewBox="0 0 1440 120"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-auto"
        preserveAspectRatio="none"
      >
        <path
          d="M0 60L48 52C96 44 192 28 288 24C384 20 480 28 576 40C672 52 768 68 864 72C960 76 1056 68 1152 56C1248 44 1344 28 1392 20L1440 12V120H1392C1344 120 1248 120 1152 120C1056 120 960 120 864 120C768 120 672 120 576 120C480 120 384 120 288 120C192 120 96 120 48 120H0V60Z"
          fill={to}
        />
        <path
          d="M0 80L48 72C96 64 192 48 288 44C384 40 480 48 576 56C672 64 768 72 864 76C960 80 1056 80 1152 72C1248 64 1344 48 1392 40L1440 32V120H1392C1344 120 1248 120 1152 120C1056 120 960 120 864 120C768 120 672 120 576 120C480 120 384 120 288 120C192 120 96 120 48 120H0V80Z"
          fill={to}
          opacity="0.5"
        />
      </svg>
    </div>
  );
}
