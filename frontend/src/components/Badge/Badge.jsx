import React from "react";
import { Stack, Badge as BootstrapBadge } from "react-bootstrap";
import "./Badge.css";

export const Badge = ({ data }) => {
  return data.map((d, index) => (
    <Stack direction="horizontal" gap={2} key={index}>
      <BootstrapBadge bg="danger" className="badge">
        {d}
      </BootstrapBadge>
    </Stack>
  ));
};

export default Badge;
