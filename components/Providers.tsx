"use client";

import { useEffect } from "react";
import { useStore } from "@/store/store";
import { useInputDevices } from "@/hooks/useInputDevices";
import WsProvider from "./WsProvider";
import ModalHost from "./ModalHost";
import StartupConnect from "./StartupConnect";

export default function Providers({ children }: { children: React.ReactNode }) {
  const setTheme = useStore((s) => s.setTheme);
  const initPresets = useStore((s) => s.initPresets);

  useInputDevices();

  useEffect(() => {
    // sync theme state with the class set by the inline head script
    const isDark = document.documentElement.classList.contains("dark");
    setTheme(isDark ? "dark" : "light");
    initPresets();
  }, [setTheme, initPresets]);

  return (
    <>
      <WsProvider />
      {children}
      <ModalHost />
      <StartupConnect />
    </>
  );
}
