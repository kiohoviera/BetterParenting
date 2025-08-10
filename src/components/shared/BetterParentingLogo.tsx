interface LogoProps {
  className?: string;
}

export const BetterParentingLogo = ({ className = "w-8 h-8" }: LogoProps) => {
  return (
    <div className={`relative ${className}`}>
      <svg
        viewBox="0 0 40 40"
        className="w-full h-full"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Background circle */}
        <circle
          cx="20"
          cy="20"
          r="18"
          className="fill-primary"
        />
        
        {/* White circle inside */}
        <circle
          cx="20"
          cy="20"
          r="10"
          className="fill-white"
        />
      </svg>
    </div>
  );
};