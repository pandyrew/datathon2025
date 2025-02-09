export const Blob = ({ className }: { className?: string }) => (
  <div
    className={`absolute rounded-full mix-blend-multiply filter blur-3xl animate-blob ${className}`}
  />
);
