import styles from "./Avatar.module.css"

export function Avatar({ name }: { name: string }) {
  const shortName = name.substring(name.length - 4);

  return <span
    className={styles.avatar}
    aria-hidden="true"
  >
    {shortName}
  </span>
}