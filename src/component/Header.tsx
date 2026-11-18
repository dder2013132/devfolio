import styles from "../css/Header.module.css";
import { useState, useEffect } from "react";

function Header() {
  const [activeSection, setActiveSection] = useState("");

  useEffect(() => {
    const sectionIds = ["About", "Projects", "Contact"];

    const handleScroll = () => {
      const centerY = window.innerHeight / 2;

      const currentSection = sectionIds.find((id) => {
        const section = document.getElementById(id);

        if (!section) return false;

        const rect = section.getBoundingClientRect();

        return rect.top <= centerY && rect.bottom > centerY;
      });

      setActiveSection(currentSection ?? "");
    };

    handleScroll();

    window.addEventListener("scroll", handleScroll);
    window.addEventListener("resize", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleScroll);
    };
  }, []);

  return (
    <header className={styles.header}>
      <a href="#" className={styles.title}>
        DEVFOLIO<span> ®</span>
      </a>
      <nav id="title" className={styles.nav}>
        <a
          href="#About"
          className={`${styles.menu} ${
            activeSection === "About" ? styles.active : ""
          }`}
          onClick={(event) => {
            event.preventDefault();

            document.getElementById("About")?.scrollIntoView({
              behavior: "smooth",
              block: "center",
            });
          }}
        >
          <span className={styles.navIndex}>01 /</span> ABOUT
        </a>
        <a
          href="#Projects"
          className={`${styles.menu} ${
            activeSection === "Projects" ? styles.active : ""
          }`}
        >
          <span className={styles.navIndex}>02 /</span> PROJECTS
        </a>
        <a
          href="#Contact"
          className={`${styles.menu} ${
            activeSection === "Contact" ? styles.active : ""
          }`}
        >
          <span className={styles.navIndex}>03 /</span> CONTACT
        </a>
      </nav>
    </header>
  );
}

export default Header;
