const Input: React.FC<React.InputHTMLAttributes<HTMLInputElement>> = (
  props,
) => {
  return (
    <input
      {...props}
      className="w-full dark:bg-[#16191d] bg-white border border-gray-600 text-white p-2 rounded-md focus:ring-2 focus:ring-yellow-500 outline-none"
    />
  );
};

export default Input;
