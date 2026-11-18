import styles from "../css/Footer.module.css";

function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.footerInner}>
        <div className={styles.footerTop}>
          <span className={styles.logo}>
            DEVFOLIO<span>®</span>
          </span>

          <button
            type="button"
            className={styles.backToTop}
            onClick={() => {
              window.scrollTo({
                top: 0,
                behavior: window.matchMedia("(prefers-reduced-motion: reduce)")
                  .matches
                  ? "instant"
                  : "smooth",
              });
            }}
          >
            BACK TO TOP ↑
          </button>
        </div>

        <div className={styles.footerBottom}>
          <span>© {new Date().getFullYear()} JUNYOUNG LEE.</span>
          <span>DESIGNED & DEVELOPED BY ME.</span>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
