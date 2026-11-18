import styles from "../css/Footer.module.css";
import { scrollToTop } from "../utils/scroll";

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
            onClick={scrollToTop}
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
