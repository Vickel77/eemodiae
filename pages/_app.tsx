import type { AppProps } from "next/app";
import { ThemeProvider } from "styled-components";
import { light, dark } from "../lib/theme";
import { useEffect, useState } from "react";
import NProgress from "nprogress";
import "../styles/globals.css";
import Router from "next/router";
import AOS from "aos";
import "aos/dist/aos.css";
import Script from "next/script";
import { AuthContextProvider } from "../context/AuthContext";
import { ToastContainer } from "react-toastify";
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
        <Script src="https://upload-widget.cloudinary.com/global/all.js" />
        <Script
          id="google-analytics"
          strategy="afterInteractive"
        >{`(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','GTM-5KRL4VDM');`}</Script>
        <Component {...pageProps} />
        <ToastContainer />
      </AuthContextProvider>
    </ThemeProvider>
  );
}

export default MyApp;
