import { NavLink } from "react-router-dom";
import styles from "./Sidebar.module.css";

const NAV_ITEMS = [
  { to: "/", label: "Discover", end: true },
  { to: "/movies", label: "All Movies", end: true },
  { to: "/admin", label: "Admin", end: false },
];

export function Sidebar() {
  return (
    <aside className={styles.sidebar}>
      <nav className={styles.nav} aria-label="Primary">
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={({ isActive }) =>
              isActive ? `${styles.pill} ${styles.active}` : styles.pill
            }
          >
            {item.label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
