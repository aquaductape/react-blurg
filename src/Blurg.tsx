import React, { ReactChild, ReactChildren, useEffect, useRef } from "react";
import { IOS } from "./browserInfo";

if (IOS) {
  if (typeof window !== undefined) {
    const html = document.querySelector("html")!;
    html.style.cursor = "pointer";
    html.style.webkitTapHighlightColor = "rgba(0, 0, 0, 0)";
  }
}

type BlurgProps = {
  children: ReactChild | ReactChildren | boolean | null;
  onBlur: (e: React.FocusEvent) => void;
};

const Blurg = ({ children, onBlur }: BlurgProps) => {
  useEffect(() => {
    // mainRef.current?.focus();
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key.match(/escape/i)) {
        onBlur(e as any);
      }
    };

    document.addEventListener("keydown", onKeyDown);

    return () => {
      document.removeEventListener("keydown", onKeyDown);
    };
  }, []);

  const attr = {} as any;

  // if (IOS) {
  // attr.onMouseOut = (e: React.FocusEvent) => {
  //   if (!e.currentTarget.contains(e.relatedTarget as Node)) {
  //     console.log("not related!", e.relatedTarget);
  //     onBlur(e);
  //   }
  // };
  // } else {
  attr.onBlur = (e: React.FocusEvent) => {
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
      console.log("not related!", e.relatedTarget);
      onBlur(e);
    }
  };
  // }

  return (
    <div
      // onTouch
      tabIndex={0}
      {...attr}
    >
      {children}
    </div>
  );
};

export default Blurg;
