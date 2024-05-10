import { ReactNode } from "react";

const withPoem = (Component: any) => {
  return (props: PoemModal) => {
    return <Component {...props} />;
  };
};

export default withPoem;
