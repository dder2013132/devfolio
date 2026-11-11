import "./App.css";
import Hero from "./component/Hero";
import Projects from "./component/Projects";
import Header from "./component/Header";
import Footer from "./component/Footer";
import type { Project } from "./types/project";

function App() {
  const projects: Project[] = [
    {
      id: 1,
      title: "PacketScope",
      description:
        "A real-time network packet capture and analysis tool built with C and the Win32 API.",
      category: "Network / Desktop Application",
      techStack: ["C", "Win32 API", "Npcap", "Multithreading"],
      githubUrl: "https://github.com/dder2013132/PacketScope.git",
    },
    {
      id: 2,
      title: "PlayPort",
      description:
        "A Java-based e-commerce web application featuring game browsing, shopping carts, and order processing.",
      category: "Web / E-Commerce",
      techStack: ["Java", "Servlet", "JSP", "JDBC", "PostgreSQL", "Maven"],
      githubUrl: "https://github.com/dder2013132/gamestore.git",
    },
  ];
  return (
    <div>
      <Header />
      <hr />
      <main>
        <Hero />
        <Projects projects={projects} />
      </main>
      <hr />
      <Footer />
    </div>
  );
}

export default App;
