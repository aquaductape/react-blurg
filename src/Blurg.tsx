import React, { ReactChild, ReactChildren, useEffect, useRef } from "react";

type BlurgProps = {
  children: ReactChild | ReactChildren | boolean | null;
  onBlur: (e: React.FocusEvent) => void;
};
const Blurg = ({ children, onBlur }: BlurgProps) => {
  const mainRef = useRef<HTMLDivElement>(null);
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
  return (
    <div
      ref={mainRef}
      tabIndex={0}
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node)) {
          console.log("not related!", e.relatedTarget);
          onBlur(e);
        }
      }}
    >
      {children}
    </div>
  );
};

export default Blurg;
