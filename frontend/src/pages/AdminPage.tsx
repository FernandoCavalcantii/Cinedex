import { Link } from "react-router-dom";
import { PageHeader } from "../components/layout/PageHeader";
import styles from "./AdminPage.module.css";

export function AdminPage() {
  return (
    <section>
      <PageHeader title="Admin" />
      <Link className={styles.card} to="/admin/metrics">
        <span className={styles.art} aria-hidden="true">
          <svg viewBox="0 0 320 140" fill="none">
            <rect x="18" y="78" width="22" height="40" rx="3" fill="#2a3d30" />
            <rect x="50" y="58" width="22" height="60" rx="3" fill="#39e75f" fillOpacity="0.45" />
            <rect x="82" y="40" width="22" height="78" rx="3" fill="#39e75f" />
            <rect x="114" y="64" width="22" height="54" rx="3" fill="#39e75f" fillOpacity="0.7" />
            <path d="M160 96l28-22 24 10 36-40 28 16" stroke="#8cffae" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
            <circle cx="188" cy="74" r="3.5" fill="#8cffae" />
            <circle cx="212" cy="84" r="3.5" fill="#8cffae" />
            <circle cx="248" cy="44" r="3.5" fill="#8cffae" />
            <circle cx="276" cy="60" r="3.5" fill="#8cffae" />
            <path d="M18 118h284" stroke="#2e3033" strokeWidth="1" />
          </svg>
        </span>
        <span className={styles.copy}>
          <span className={styles.kicker}>Open</span>
          <span className={styles.name}>Metrics</span>
          <span className={styles.line}>Catalog size, reviews, and who's talking.</span>
        </span>
      </Link>
    </section>
  );
}
