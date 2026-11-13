import styles from "../css/Header.module.css";

function Header() {
  return (
    <header className={styles.header}>
      <a href="#" className={styles.title}>
        DEVFOLIO®
      </a>
      <nav id="title" className={styles.nav}>
        <a href="#About" className={styles.menu}>
          ABOUT
        </a>
        <a href="#Projects" className={styles.menu}>
          PROJECTS
        </a>
        <a href="" className={styles.menu}>
          CONTACT
        </a>
      </nav>
    </header>
  );
}

export default Header;
