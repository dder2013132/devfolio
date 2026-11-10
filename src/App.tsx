import { useEffect, useRef } from "react";
import "./App.css";

function App() {
  const packetRef = useRef<HTMLDivElement>(null);
  const playportRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    console.log("Effect 실행!");

    return () => {
      console.log("Effect 정리!");
    };
  }, []);
  return (
    <div>
      <header>
        <p>DEVFOLIO®</p>
        <p>MENU</p>
      </header>
      <hr />
      <main>
        <section className="hero">
          <p className="heroName">●SOFTWARE ENGINEER</p>
          <h1 className="heroTitle">
            <span className="mask">
              <span className="fadeIn first">CODE.</span>
            </span>
            <span className="mask">
              <span className="fadeIn third accent">CREATE.</span>
            </span>
            <span className="mask">
              <span className="fadeIn second">EVOLVE.</span>
            </span>
          </h1>
          <p style={{ fontSize: "15px" }}>Building software with purpose.</p>
          <p style={{ fontSize: "15px" }}>SCROLL TO EXPLORE</p>
        </section>
        <section className="Card">
          <h2>SELECTED WORK</h2>
          <div className="projectCard" ref={packetRef}>
            <h3>PacketScope</h3>
          </div>
          <div className="projectCard" ref={playportRef}>
            <h3>PlayPort</h3>
          </div>
        </section>
      </main>
      <hr />
      <footer>YOU NEVER KNOW MY GITHUB ADDRESS</footer>
    </div>
  );
}

export default App;
