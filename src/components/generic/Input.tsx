const Input: React.FC<React.InputHTMLAttributes<HTMLInputElement>> = (
  props,
) => {
  const { className = "", type, ...rest } = props;
  const dateThemeClass =
    type === "date" ? "[color-scheme:light] dark:[color-scheme:dark]" : "";

  return (
    <input
      {...rest}
      type={type}
      className={`w-full dark:bg-[#16191d] bg-white border border-gray-600 text-white p-2 rounded-md focus:ring-2 focus:ring-yellow-500 outline-none ${dateThemeClass} ${className}`.trim()}
    />
  );
};

export default Input;
