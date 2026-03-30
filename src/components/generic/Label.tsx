const Label: React.FC<React.LabelHTMLAttributes<HTMLLabelElement>> = (
  props,
) => {
  return <label {...props} className="text-gray-300 text-sm font-medium" />;
};

export default Label;
