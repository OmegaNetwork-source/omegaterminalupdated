import React from "react";
import styles from "./ReferralDashboard.module.css";

export type ReferralDashboardProps = {
  apiBase?: string;
};

export const ReferralDashboard: React.FC<ReferralDashboardProps> = ({
  apiBase,
}) => {
  return (
    <div className={styles.container}>
      <div className={styles.title}>Referral Dashboard</div>
      <div className={styles.meta}>API: {apiBase || "(not configured)"}</div>
    </div>
  );
};
