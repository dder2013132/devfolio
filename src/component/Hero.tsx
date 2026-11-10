import styles from "../css/Hero.module.css";

function Hero() {
  return (
    <section className={styles.hero}>
      <p className={styles.heroName}>●SOFTWARE ENGINEER</p>
      <h1 className={styles.heroTitle}>
        <span className={styles.mask}>
          <span className={`${styles.fadeIn} ${styles.first}`}>CODE.</span>
        </span>
        <span className={styles.mask}>
          <span className={`${styles.fadeIn} ${styles.third} ${styles.accent}`}>CREATE.</span>
        </span>
        <span className={styles.mask}>
          <span className={`${styles.fadeIn} ${styles.second}`}>EVOLVE.</span>
        </span>
      </h1>
      <p style={{ fontSize: "15px" }}>Building software with purpose.</p>
      <p style={{ fontSize: "15px" }}>SCROLL TO EXPLORE</p>
    </section>
  );
}

export default Hero;
