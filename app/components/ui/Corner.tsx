export const Corner = ({ className = "" }: { className?: string }) => (
  <div className={`absolute w-24 h-24 ${className}`}>
    <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-indigo-400/50 to-transparent" />
    <div className="absolute top-0 left-0 h-full w-[1px] bg-gradient-to-b from-transparent via-indigo-400/50 to-transparent" />
  </div>
);
