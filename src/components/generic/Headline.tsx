import type { PropsWithChildren } from "react";

const Headline = (props: PropsWithChildren) => {
  const { children } = props;
  return (
    <h2 className="text-2xl/7 font-bold text-white sm:truncate sm:text-3xl sm:tracking-tight">
      {children}
    </h2>
  );
};

export default Headline;
