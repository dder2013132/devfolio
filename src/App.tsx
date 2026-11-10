import "./App.css";
import Hero from "./component/Hero";
import Projects from "./component/Projects";
import Header from "./component/Header";
import Footer from "./component/Footer";

function App() {
  const title = {
    first : "PacketScope",
    second : "PlayPort"
  }
  return (
    <div>
      <Header />
      <hr />
      <main>
        <Hero />
        <Projects title={title} />
      </main>
      <hr />
      <Footer />
    </div>
  );
}

export default App;
