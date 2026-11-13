import { useEffect, useRef, useState } from "react";
import styles from "../css/About.module.css";

const skills = {
  backend: ["Java", "Servlet", "JSP", "JDBC"],
  database: ["PostgreSQL"],
  systems: ["C", "Win32 API"],
  frontend: ["React", "TypeScript", "CSS"],
};

function About() {
  const [isVisible, setIsVisible] = useState(false);
  const aboutRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    const element = aboutRef.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        } else if (entry.boundingClientRect.top > 0) {
          setIsVisible(false);
        }
      },
      {
        threshold: 0.3,
      },
    );

    observer.observe(element);

    return () => observer.disconnect();
  }, []);

  return (
    <div id="About" ref={aboutRef} className={styles.about}>
      <div
        className={`${styles.aboutPanel} ${isVisible ? styles.visible : ""}`}
      >
        {/* 시스템 헤더 */}
        <div className={styles.systemHeader}>
          <span className={styles.systemStatus}>
            <span className={styles.statusDot}></span>
            SYSTEM ONLINE
          </span>
          <span>DEVFOLIO / PROFILE_v1.0</span>
        </div>

        {/* 기존 콘텐츠 */}
        <div className={styles.aboutContent}>
          <section className={styles.aboutCard}>
            <span className={styles.sectionLabel}>01 / IDENTITY</span>

            <h1 className={styles.aboutTitle}>
              BEYOND
              <br />
              THE <span>CODE.</span>
            </h1>

            <div className={styles.aboutDescription}>
              <h3>Building systems, understanding their flow.</h3>
              <p>
                I'm a developer interested in backend systems, database
                structures, and low-level programming.
              </p>
            </div>

            <div className={styles.aboutSignature}>
              <span>&gt;_</span>
              <span>BUILDING WHAT'S NEXT_</span>
            </div>
            <div className={styles.miniTerminal}>
              <div className={styles.terminalLine}>
                <span className={styles.terminalPrompt}>~/devfolio $</span>
                <span>whoami</span>
              </div>

              <p>role: fullstack developer</p>
              <p>focus: systems & data flow</p>
              <p>status: always learning</p>

              <div className={styles.terminalLine}>
                <span className={styles.terminalPrompt}>~/devfolio $</span>
                <span>cat current-project.txt</span>
              </div>

              <p>project: PacketScope</p>
              <p>language: C / Win32 API</p>
              <p>status: in development</p>

              <div className={styles.terminalLine}>
                <span className={styles.terminalPrompt}>~/devfolio $</span>
                <span className={styles.cursor}></span>
              </div>
            </div>
          </section>

          <section className={styles.aboutCard}>
            <span className={styles.sectionLabel}>02 / CAPABILITIES</span>

            <h2>TECH STACK</h2>

            {Object.entries(skills).map(([category, skillList], index) => (
              <div key={category} className={styles.skillGroup}>
                <h3>
                  <span className={styles.skillIndex}>
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  {category.toUpperCase()}
                </h3>

                <div className={styles.skillList}>
                  {skillList.map((skill) => (
                    <span key={skill} className={styles.skillTag}>
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </section>
        </div>
      </div>

      <div>d</div>
    </div>
  );
}

export default About;
