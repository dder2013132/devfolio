import styles from "../css/Contact.module.css";

function Contact() {
  return (
    <section id="Contact" className={styles.contact}>
      <span className={styles.sectionLabel}>03 / CONTACT</span>

      <div className={styles.contactContent}>
        <div className={styles.contactMessage}>
          <h2 className={styles.contactTitle}>
            LET'S BUILD
            <br />
            SOMETHING
            <br />
            <span>TOGETHER.</span>
          </h2>

          <p className={styles.description}>Always curious. Always learning.</p>
        </div>

        <div className={styles.contactDetails}>
          <div className={styles.contactLinks}>
            <a href="mailto:YOUR_EMAIL">
              EMAIL <span>↗</span>
            </a>

            <a href="YOUR_GITHUB_URL" target="_blank" rel="noopener noreferrer">
              GITHUB <span>↗</span>
            </a>
          </div>

          <p className={styles.location}>BASED IN SENDAI, JAPAN</p>
        </div>
      </div>
    </section>
  );
}

export default Contact;
