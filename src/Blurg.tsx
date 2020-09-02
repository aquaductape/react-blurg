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
  /**
   * callback for on blur event
   */
  onBlur: (e: React.FocusEvent | KeyboardEvent) => void;
  /**
   * When true, closes all containers when pressing Escape
   *
   * Default: Closes current focused container when pressing Escape
   */
  closeAllOnEscape?: boolean;
  /**
   * When true, interacting outside the page such as URL bar, Developer Tools, switching applications (Alt Tab) ect will close all containers
   */
  closeOutsidePage?: boolean;
  /**
   * When false, upon initialize, container will not be focused to prevent overriding focus on component children. If there's no focusable children, the blur functionality will break.
   *
   * Default: Container focused upon initialize
   */
  focusOnContainer?: boolean;
  /**
   * Default: -1.
   * The tabIndex global attribute indicates that its element can be focused, and where it participates in sequential keyboard navigation
   */
  tabIndex?: number;
  /**
   * When false will inherit CSS focus outline
   *
   * Default: removes focus outline on container
   */
  removeFocusRing?: boolean;
};

type TCallbackStack = {
  id: number;
  node: HTMLDivElement | null;
  callback: (e: any) => void;
}[];

let callbackStack: TCallbackStack = [];

let counter = {
  counter: 0,
  get() {
    return this.counter;
  },
  set(num: number) {
    if (num < 0) {
      num = 0;
    }

    this.counter = num;
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

let alreadyRemoved = false;

const addMouseDown = () => {
  const onMouseDown = (e: MouseEvent) => {
    console.log("mousedown");
    alreadyRemoved = true;
    // const { activeElement, node } = lastFocused;
    callbackStack.some(({ node, callback }, idx) => {
      if (!node?.contains(e.target as Node)) {
        callback(e);
        callbackStack = callbackStack.slice(0, idx);
        counter.set(idx - 1);

        return true;
      }
    });

    document.removeEventListener("mousedown", onMouseDown);
  };

  document.addEventListener("mousedown", onMouseDown);
};

const Blurg = ({
  children,
  onBlur,
  closeAllOnEscape = false,
  closeOutsidePage = false,
  focusOnContainer = true,
  tabIndex = -1,
  removeFocusRing = true,
}: BlurgProps) => {
  const mainRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const main = mainRef.current!;
    const id = counter.get();

    counter.increase();

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key.match(/escape/i)) {
        alreadyRemoved = true;

        if (closeAllOnEscape) {
          callbackStack[0].callback(e);
          callbackStack = [];

          counter.reset();

          document.removeEventListener("keydown", onKeyDown, true);
          return;
        }

        const event = callbackStack.pop();

        if (event) {
          event.callback(e);
          counter.decrease();

          if (callbackStack.length) {
            console.log("event", callbackStack, counter.get() - 1);
            const idx = counter.get() ? counter.get() - 1 : 0;
            callbackStack[idx].node?.focus();
          }
        }

        if (!callbackStack.length) {
          document.removeEventListener("keydown", onKeyDown, true);
        }
      }
    };

    if (!callbackStack.length) {
      document.addEventListener("keydown", onKeyDown, true);
    }

    callbackStack.push({
      id,
      node: main,
      callback: (e: any) => onBlur(e),
    });
    console.log("added", id, callbackStack);

    if (focusOnContainer) {
      main?.focus();
    }

    return () => {
      if (
        !alreadyRemoved &&
        callbackStack.length &&
        main === callbackStack[callbackStack.length - 1].node
      ) {
        counter.decrease();
        callbackStack = callbackStack.slice(0, counter.get());
        console.log("not removed by callback", counter.get(), callbackStack);
      }
      console.log(callbackStack);
      if (!callbackStack.length) {
        document.removeEventListener("keydown", onKeyDown, true);
      }

      alreadyRemoved = false;
    };
  }, []);

  return (
    <div
      tabIndex={tabIndex}
      style={removeFocusRing ? { outline: "none" } : {}}
      ref={mainRef}
      onBlur={(e: React.FocusEvent) => {
        const targetOutsidePage =
          !closeOutsidePage &&
          !e.relatedTarget &&
          e.currentTarget.contains(document.activeElement) &&
          mainRef.current === callbackStack[callbackStack.length - 1].node;

        if (targetOutsidePage) {
          console.log("target outside of page", mainRef.current);
          addMouseDown();
          return;
        }

        const outsideContainer =
          !e.currentTarget.contains(e.relatedTarget as Node) &&
          (closeOutsidePage ||
            !e.currentTarget.contains(document.activeElement));

        if (outsideContainer) {
          alreadyRemoved = true;
          counter.decrease();

          callbackStack = callbackStack.slice(0, counter.get());
          console.log("remove cbStack by onBlur", counter.get(), callbackStack);
          onBlur(e);
        }
      }}
    >
      {children}
    </div>
  );
};

export default Blurg;
