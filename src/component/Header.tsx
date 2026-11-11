import styles from "../css/Header.module.css";

function Header() {
  return (
    <header className={styles.header}>
      <p className={styles.title}>DEVFOLIO®</p>
      <p className={styles.menu}>MENU</p>
    </header>
  );
}

export default Header;
