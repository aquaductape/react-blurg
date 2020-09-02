// import uuid from "uuid-random";
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
  closeAllOnEscape?: boolean;
};

let callbackStack: {
  id: number;
  node: HTMLDivElement | null;
  callback: (e: any) => void;
}[] = [];

let counter = {
  counter: 0,
  get() {
    return this.counter;
  },
  increase() {
    this.counter++;
  },
  decrease() {
    if (this.counter < 0) {
      this.reset();
      return;
    }

    this.counter--;
  },
  reset() {
    this.counter = 0;
  },
};

const Blurg = ({ children, onBlur, closeAllOnEscape = false }: BlurgProps) => {
  const mainRef = useRef<HTMLDivElement>(null);
  const removedByCallBackRef = useRef(false);

  useEffect(() => {
    const main = mainRef.current!;
    const removedByCallBack = removedByCallBackRef.current;
    const id = counter.get();

    counter.increase();

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key.match(/escape/i)) {
        if (closeAllOnEscape) {
          callbackStack[0].callback(e);
          callbackStack = [];

          counter.reset();

          removedByCallBackRef.current = true;
          return;
        }

        const event = callbackStack.pop();

        if (event) {
          event.callback(e);
          removedByCallBackRef.current = true;
          counter.decrease();

          if (callbackStack.length) {
            callbackStack[counter.get() - 1].node?.focus();
          }
        }
      }
    };

    if (!callbackStack.length) {
      document.addEventListener("keydown", onKeyDown);
    }

    callbackStack.push({
      id,
      node: main,
      callback: (e: any) => onBlur(e),
    });
    console.log(id, callbackStack);

    main?.focus();

    return () => {
      if (!removedByCallBackRef.current) {
        counter.decrease();
        callbackStack = callbackStack.slice(0, counter.get());
        console.log("not removed by callback", counter.get(), callbackStack);
      }
      if (!callbackStack.length) {
        document.removeEventListener("keydown", onKeyDown);
      }
    };
  }, []);

  return (
    <div
      tabIndex={-1}
      ref={mainRef}
      onBlur={(e: React.FocusEvent) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node)) {
          counter.decrease();

          callbackStack = callbackStack.slice(0, counter.get());
          console.log(counter.get(), callbackStack);
          onBlur(e);
          removedByCallBackRef.current = true;
        }
      }}
    >
      {children}
    </div>
  );
};

export default Blurg;
