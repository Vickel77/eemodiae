import { DefaultTheme } from "styled-components";

const light: DefaultTheme = {
  type: "light",
  background: "#FBFBFF",
  hover: "#F8FCFF",
  headerFont: "Fjalla One",
  textFont:"Dosis",
  decorFont:"Sacramento",
  colors: {
    default: "#444444",
    primary: "#3624A7",
    secondary: "#657ED4",
    danger: "#FF331F",
    muted: "#909090",
    disabled: "#C4C4C4",
    defaultAccent: "#EEEEEE",
    // primaryAccent: "#FF331F",
    primaryAccent: "#E2E7FA",
    dangerAccent: "#FBD2E0",
    white: "#FFFFFF",
  },
};

const dark: DefaultTheme = {
  type: "dark",
  background: "#051521",
  hover: "#F8FCFF",
  headerFont: "Fjalla One",
  textFont:"Dosis",
  decorFont:"Sacramento",
  colors: {
    default: "#DDDDDD",
    primary: "#2196F3",
    secondary: "#657ED4",
    danger: "#FF4444",
    muted: "#909090",
    disabled: "#909090",
    defaultAccent: "#06253D",
    primaryAccent: "#D3EAFD",
    dangerAccent: "#FBD2E0",
    white: "#FFFFFF",
  },
};

export { light, dark };
