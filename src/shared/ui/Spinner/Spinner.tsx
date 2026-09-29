import styles from "./Spinner.module.css"

export function Spinner({ label = 'Загрузка' }: { label?: string }) {
  return <span
    role="status"
    className={styles.spinnerWrap}
  >
    <span
      className={styles.spinner}
      aria-hidden="true"
    />
    {label}
  </span>
}

