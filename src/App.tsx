import "./App.css";
import Hero from "./component/Hero";
import About from "./component/About";
import Projects from "./component/Projects";
import Header from "./component/Header";
import Contact from "./component/Contact";
import Footer from "./component/Footer";
import { projects } from "./data/projects";

function App() {
  return (
    <div>
      <Header />
      <hr />
      <main>
        <Hero />
        <About />
        <Projects projects={projects} />
        <Contact />
      </main>
      <hr />
      <Footer />
    </div>
  );
}

export default App;
