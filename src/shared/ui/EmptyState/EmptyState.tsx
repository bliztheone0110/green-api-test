import type { ReactNode } from "react";
import { Icon } from "../Icon";
import styles from "./EmptyState.module.css"

export function EmptyState({ title, description, action }: { title: string; description: string; action?: ReactNode }) {
  return <div className={styles.empty}>
    <span className={styles.emptyIcon}>
      <Icon
        name="chat"
        width="30"
        height="30"
      />
    </span>
    <h2>
      {title}
    </h2>
    <p>
      {description}
    </p>
    {action}
  </div>
}
