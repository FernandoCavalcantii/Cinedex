import styles from "./BrandBackdrop.module.css";

/** Earlier detail fallback. To restore it, render this instead of MoviePlaceholderBg and add `brandSheet` on the detail sheet. */
export function BrandBackdrop() {
  return <div className={styles.brandBackdrop} aria-hidden="true" />;
}
