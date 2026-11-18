import type { Project } from "../types/project";
import playportHome from "../assets/screenshots/playport/playport.webp";
import packetscopeHome from "../assets/screenshots/packetscope/packetscope.webp";
import kimbapHome from "../assets/screenshots/Kimbap/kimbap.webp";
import noodleMesHome from "../assets/screenshots/NoodleMES/noodleMES.webp";

export const projects: Project[] = [
    {
      id: 1,
      title: "PacketScope",
      description:
        "A real-time network packet capture and analysis tool built with C and the Win32 API.",
      category: "Network / Desktop Application",
      techStack: ["C", "Win32 API", "Npcap", "Multithreading"],
      githubUrl: "https://github.com/dder2013132/PacketScope.git",
      img: packetscopeHome,
    },
    {
      id: 2,
      title: "PlayPort",
      description:
        "A Java-based e-commerce web application featuring game browsing, shopping carts, and order processing.",
      category: "Web / E-Commerce",
      techStack: ["Java", "Servlet", "JSP", "JDBC", "PostgreSQL", "Maven"],
      githubUrl: "https://github.com/dder2013132/gamestore.git",
      img: playportHome,
    },
    {
      id: 3,
      title: "Kimbap",
      description:
        "A supply chain management system designed to manage material procurement, inventory, and logistics operations.",
      category: "Web / SCM",
      techStack: [],
      githubUrl: "https://github.com/wnsl1364/Kimbap.git",
      img: kimbapHome,
    },
    {
      id: 4,
      title: "NoodleMES",
      description:
        "A manufacturing execution system designed to manage production processes and manufacturing operations.",
      category: "Web / MES",
      techStack: [],
      githubUrl: "https://github.com/greenstar-gyul/NoodleMES.git",
      img: noodleMesHome,
    },
  ];