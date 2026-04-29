const SecondaryButton: React.FC<
  React.ButtonHTMLAttributes<HTMLButtonElement>
> = ({ children, ...props }) => {
  return (
    <button
      className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-3 px-6 rounded-md transition-all shadow-md active:scale-95"
      {...props}
    >
      {children}
    </button>
  );
};

export default SecondaryButton;
