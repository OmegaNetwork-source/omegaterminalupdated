import React from "react";
import styles from "./ProfileSidebar.module.css";

export type ProfileSidebarProps = {
  username?: string;
  onClose?: () => void;
};

export const ProfileSidebar: React.FC<ProfileSidebarProps> = ({
  username,
  onClose,
}) => {
  return (
    <div className={styles.container}>
      <div className={styles.header}>Profile</div>
      <div className={styles.content}>
        <div>Username: {username || "(not set)"}</div>
      </div>
      <div className={styles.actions}>
        {onClose ? (
          <button className={styles.button} onClick={onClose}>
            Close
          </button>
        ) : null}
      </div>
    </div>
  );
};
