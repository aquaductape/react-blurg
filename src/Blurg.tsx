import uuid from "uuid-random";
import React, { ReactChild, ReactChildren, useEffect, useRef } from "react";
import { IOS, IOS13 } from "./browserInfo";

if (IOS && !IOS13) {
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

let eventQue: { id: string; callback: (e: any) => void }[] = [];

const Blurg = ({ children, onBlur }: BlurgProps) => {
  const idRef = useRef(uuid());
  useEffect(() => {
    const id = idRef.current;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key.match(/escape/i)) {
        // console.log(idRef.current);
        // onBlur(e as any);
        const event = eventQue.pop();
        if (event) {
          event.callback(e);
        }
      }
    };
    // mainRef.current?.focus();
    if (!eventQue.length) {
      document.addEventListener("keydown", onKeyDown);
    }

    eventQue.push({
      id,
      callback: (e: any) => onBlur(e),
    });

    return () => {
      if (!eventQue.length) {
        document.removeEventListener("keydown", onKeyDown);
      }
    };
  }, []);

  return (
    <div
      // onTouch
      tabIndex={-1}
      onBlur={(e: React.FocusEvent) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node)) {
          const id = idRef.current;
          // console.log("not related!", e.relatedTarget);
          console.log(id);
          const idx = eventQue.findIndex((item) => item.id === id);
          eventQue = eventQue.slice(0, idx);
          onBlur(e);
        }
      }}
      // {...attr}
    >
      <div>{idRef.current}</div>
      {children}
    </div>
  );
};

export default Blurg;
