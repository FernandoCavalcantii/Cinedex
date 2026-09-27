import { useId } from "react";
import styles from "./PageHeader.module.css";

type PageHeaderProps = {
  title: string;
  info?: string;
};

export function PageHeader({ title, info }: PageHeaderProps) {
  const infoId = useId();

  return (
    <header>
      <div className={styles.titleRow}>
        <h1 className={styles.title}>{title}</h1>
        {info ? (
          <span className={styles.hint}>
            <button type="button" className={styles.info} aria-label={`About ${title}`} aria-describedby={infoId}>
              i
            </button>
            <span id={infoId} className={styles.tip} role="tooltip">
              {info}
            </span>
          </span>
        ) : null}
      </div>
    </header>
  );
}
