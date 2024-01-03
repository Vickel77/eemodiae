import type { AppProps } from "next/app";
import {
  ThemeProvider,
  GlobalStyleComponent,
  createGlobalStyle,
} from "styled-components";
import { light, dark } from "../lib/theme";
import { useEffect, useState } from "react";
import NProgress from "nprogress";
import "../styles/globals.css";
import Router from "next/router";
import AOS from "aos";
import "aos/dist/aos.css";
import Script from "next/script";
import { AuthContextProvider } from "../context/AuthContext";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function MyApp({ Component, pageProps }: AppProps) {
  const [isLightMode, setIsLightMode] = useState<boolean>(true);

  useEffect(() => {
    AOS.init({
      offset: 200,
      duration: 1000,
      once: false,
    });
    AOS.refresh();
  }, []);

  const handleRouteChange = (url: any) => {
    NProgress.start();
  };

  const handleRouteChangeComplete = (url: any) => {
    NProgress.done();
  };

  Router.events.on("routeChangeStart", handleRouteChange);
  Router.events.on("routeChangeError", handleRouteChangeComplete);
  Router.events.on("routeChangeComplete", handleRouteChangeComplete);

  return (
    <ThemeProvider theme={isLightMode ? light : dark}>
      <AuthContextProvider>
        <Component {...pageProps} />
        <ToastContainer />
      </AuthContextProvider>
      <Script
        src="https://upload-widget.cloudinary.com/global/all.js"
        type="text/javascript"
        defer
      />
    </ThemeProvider>
  );
}

export default MyApp;
