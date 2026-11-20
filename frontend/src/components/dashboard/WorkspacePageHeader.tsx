import type { ReactNode } from "react";
import styles from "./WorkspacePage.module.css";

type WorkspacePageHeaderProps = {
  title: string;
  description: string;
  aside?: ReactNode;
};

export function WorkspacePageHeader({ title, description, aside }: WorkspacePageHeaderProps) {
  return (
    <header className={styles.masthead}>
      <div className={styles.titleBlock}>
        <h1>{title}</h1>
        <p>{description}</p>
      </div>
      {aside && <div className={styles.mastheadSide}>{aside}</div>}
    </header>
  );
}
