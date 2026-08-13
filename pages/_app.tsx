"use client";
import type { AppProps } from "next/app";
import { ThemeProvider } from "styled-components";
import { light, dark } from "../lib/theme";
import { useEffect } from "react";
import NProgress from "nprogress";
import "../styles/globals.css";
import "../styles/appearance.css";
import "../styles/dvc-viewer.css";
import "../styles/dvc-experimental.css";
import "../styles/bookstore.css";
import "../styles/redesign.css";
import Router from "next/router";
import AOS from "aos";
import "aos/dist/aos.css";
import Script from "next/script";
import { AuthContextProvider } from "../context/AuthContext";
import {
  AppearanceProvider,
  useAppearance,
} from "../context/AppearanceContext";
import {
  FloatingAudioPlayer,
  PlatformAudioProvider,
} from "../components/audio";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function ThemedApp({ Component, pageProps }: AppProps) {
  const { mode } = useAppearance();

  useEffect(() => {
    AOS.init({
      offset: 200,
      duration: 1000,
      once: false,
    });
    AOS.refresh();
  }, []);

  useEffect(() => {
    const handleRouteChange = () => NProgress.start();
    const handleRouteChangeComplete = () => NProgress.done();
    Router.events.on("routeChangeStart", handleRouteChange);
    Router.events.on("routeChangeError", handleRouteChangeComplete);
    Router.events.on("routeChangeComplete", handleRouteChangeComplete);
    return () => {
      Router.events.off("routeChangeStart", handleRouteChange);
      Router.events.off("routeChangeError", handleRouteChangeComplete);
      Router.events.off("routeChangeComplete", handleRouteChangeComplete);
    };
  }, []);

  return (
    <ThemeProvider theme={mode === "day" ? light : dark}>
      <AuthContextProvider>
        <PlatformAudioProvider>
          <Script src="https://upload-widget.cloudinary.com/global/all.js" />
          <Script
            async
            src="https://www.googletagmanager.com/gtag/js?id=G-18EV56QJ14"
          ></Script>
          <Script id="g-tag">
            {`window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());

          gtag('config', 'G-18EV56QJ14');`}
          </Script>
          <Component {...pageProps} />
          <FloatingAudioPlayer />
          <ToastContainer />
        </PlatformAudioProvider>
      </AuthContextProvider>
    </ThemeProvider>
  );
}

function MyApp(props: AppProps) {
  return (
    <AppearanceProvider>
      <ThemedApp {...props} />
    </AppearanceProvider>
  );
}

export default MyApp;
