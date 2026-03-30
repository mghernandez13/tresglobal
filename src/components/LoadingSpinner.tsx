type LoadingSpinnerProps = {
  width?: number;
  height?: number;
};

const LoadingSpinner: React.FC<LoadingSpinnerProps> = (props) => {
  const { width, height } = props;
  return (
    <div className="flex w-full justify-center my-4">
      <svg
        className={`animate-spin text-yellow-600`}
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        width={width}
        height={height}
        viewBox="0 0 24 24"
      >
        <circle
          className="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="4"
        ></circle>
        <path
          className="opacity-100"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        ></path>
      </svg>
    </div>
  );
};

export default LoadingSpinner;
