import styles from "../css/Hero.module.css";
import HeroGraphic from "./HeroGraphic";

function Hero() {
  return (
    <section className={styles.hero}>
      <div className={styles.heroContent}>
        <div className={styles.heroHeading}>
          <p className={styles.heroName}>01 / SOFTWARE ENGINEER</p>
          <h1 className={styles.heroTitle}>
            <span className={styles.mask}>
              <span className={`${styles.fadeIn} ${styles.first}`}>CODE.</span>
            </span>
            <span className={styles.mask}>
              <span
                className={`${styles.fadeIn} ${styles.third} ${styles.accent}`}
              >
                CREATE.
              </span>
            </span>
            <span className={styles.mask}>
              <span className={`${styles.fadeIn} ${styles.second}`}>
                EVOLVE.
              </span>
            </span>
          </h1>
        </div>
        <div className={styles.heroDetails}>
          <div className={styles.heroDescription}>
            <p>Building software with purpose.</p>
            <span>BACKEND / SYSTEMS / WEB DEVELOPMENT</span>
          </div>
          <a
            href="#About"
            className={styles.scrollLink}
            onClick={(event) => {
              event.preventDefault();

              document.getElementById("About")?.scrollIntoView({
                behavior: "smooth",
                block: "center",
              });
            }}
          >
            <span className={styles.scrollIcon}>
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M12 4V20 M6 14L12 20L18 14" />
              </svg>
            </span>
            <span>SCROLL TO EXPLORE</span>
          </a>
        </div>
      </div>
      <HeroGraphic />
    </section>
  );
}

export default Hero;
