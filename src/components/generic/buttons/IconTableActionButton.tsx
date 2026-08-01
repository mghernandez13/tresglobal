const IconTableActionButton = ({
  onClick,
  children,
  ...props
}: {
  onClick: () => void;
  children: React.ReactNode;
} & React.ButtonHTMLAttributes<HTMLButtonElement>) => {
  return (
    <button
      className="inline-flex items-center p-0.5 text-sm font-medium text-center text-gray-500 hover:text-gray-800 rounded-lg focus:outline-none dark:text-gray-400 dark:hover:text-gray-100 bg-transparent"
      onClick={onClick}
      {...props}
    >
      {children}
    </button>
  );
};

export default IconTableActionButton;
