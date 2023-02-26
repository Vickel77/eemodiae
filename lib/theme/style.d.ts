import "styled-components";

declare module "styled-components" {
  export interface DefaultTheme {
    type: "light" | "dark";
    background: string;
    hover: string;
    headerFont: string;
    textFont: string;
    decorFont: string;
    colors: {
      default: string;
      primary: string;
      secondary: string;
      danger: string;
      muted: string;
      disabled: string;
      defaultAccent: string;
      primaryAccent: string;
      dangerAccent: string;
      white: string;
    };
  }
}
