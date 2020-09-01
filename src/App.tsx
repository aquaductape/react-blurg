import React, { useState, useEffect, useRef } from "react";
import logo from "./logo.svg";
import "./App.css";
import Blurg from "./Blurg";

const Card = () => {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current!.focus();
  }, []);

  return (
    <div className="card">
      <div className="title">Card</div>
      <div className="content">
        Lorem ipsum dolor sit amet consectetur adipisicing elit. Voluptatum,
        rerum?
      </div>
      <div className="form">
        <input type="text" placeholder="wuf" ref={inputRef} />
        <button>Click me</button>
      </div>
    </div>
  );
};

function App() {
  const [toggle, setToggle] = useState(false);
  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>
          Edit <code>src/App.tsx</code> and save to reload.
        </p>
        <button onClick={() => setToggle(true)}>Open Card</button>
        <div style={{ height: "227px" }}>
          {toggle && (
            <Blurg
              onBlur={(e: React.FocusEvent) => {
                setToggle(false);
              }}
            >
              <Card></Card>
            </Blurg>
          )}
        </div>
        <a
          className="App-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn React
        </a>
        <a
          className="App-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Burn React
        </a>
      </header>
    </div>
  );
}

export default App;
