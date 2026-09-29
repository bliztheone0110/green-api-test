import type { ReactNode } from "react";
import styles from "./ErrorNotice.module.css"


export function ErrorNotice({ children }: { children: ReactNode }) {
  return <div
    role="alert"
    className={styles.errorNotice}
  >
    {children}
  </div>
}