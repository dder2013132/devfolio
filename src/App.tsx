import { useEffect } from "react";
import "./App.css";
import Hero from "./component/Hero";
import Projects from "./component/Projects";

function App() {
  const title = {
    first : "PacketScope",
    second : "PlayPort"
  }
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
        <Hero />
        <Projects title={title} />
      </main>
      <hr />
      <footer>YOU NEVER KNOW MY GITHUB ADDRESS</footer>
    </div>
  );
}

export default App;
