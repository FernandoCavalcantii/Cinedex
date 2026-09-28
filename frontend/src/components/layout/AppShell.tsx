import { useEffect, useRef } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { useCatalogDwell } from "../../services/catalogTracking";
import { Header } from "./Header";
import { Sidebar } from "./Sidebar";
import styles from "./AppShell.module.css";

export function AppShell() {
  const { pathname, search } = useLocation();
  const mainRef = useRef<HTMLElement>(null);
  useCatalogDwell();

  useEffect(() => {
    mainRef.current?.scrollTo(0, 0);
  }, [pathname, search]);

  return (
    <div className={styles.shell}>
      <Header />
      <div className={styles.body}>
        <Sidebar />
        <main ref={mainRef} className={styles.main}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
