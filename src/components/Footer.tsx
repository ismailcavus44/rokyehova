import styles from "./Footer.module.css";

type Props = {
  brand: string;
  withStickyBar?: boolean;
};

export function Footer({ brand, withStickyBar = false }: Props) {
  return (
    <footer
      className={[styles.footer, withStickyBar ? styles.withSticky : ""]
        .filter(Boolean)
        .join(" ")}
    >
      <p className={styles.text}>
        {brand} © {new Date().getFullYear()}
      </p>
    </footer>
  );
}
