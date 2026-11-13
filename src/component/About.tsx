import { useState } from "react";
import styles from "../css/About.module.css";

const skills = {
  backend: ["Java", "Servlet", "JSP", "JDBC"],
  database: ["PostgreSQL"],
  systems: ["C", "Win32 API"],
  frontend: ["React", "TypeScript", "CSS"],
};

function About() {
  const [isVisible, setIsVisible] = useState(false);
  return (
    <div id="About" className={styles.about}>
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
            <h1>ABOUT ME</h1>
            <h3>Building systems, understanding their flow.</h3>
            <p>
              I'm a developer interested in backend systems, database
              structures, and low-level programming.
            </p>
          </section>

          <section className={styles.aboutCard}>
            <h2>TECH STACK</h2>

            {Object.entries(skills).map(([category, skillList]) => (
              <div key={category}>
                <h3>{category.toUpperCase()}</h3>

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

      <div>
        <button onClick={() => setIsVisible(!isVisible)}>d</button>
      </div>
    </div>
  );
}

export default About;
