const LoadingPulse: React.FC = () => {
  return (
    <span className="relative flex h-6 w-6">
      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
      <span className="relative inline-flex rounded-full h-6 w-6 bg-blue-500"></span>
    </span>
  );
};

export default LoadingPulse;
