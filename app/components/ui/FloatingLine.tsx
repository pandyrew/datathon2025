export const FloatingLine = ({ className = "" }: { className?: string }) => (
  <div 
    className={`absolute w-24 h-[1px] bg-gradient-to-r from-transparent via-indigo-400/30 to-transparent 
    animate-[float_15s_linear_infinite] ${className}`}
  />
); 