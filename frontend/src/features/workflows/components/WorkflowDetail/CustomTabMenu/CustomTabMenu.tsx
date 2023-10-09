import { Box, Tab, Tabs } from "@mui/material";
import React, { type ReactNode } from "react";

interface Props {
  tabTitles: string[];
  children?: ReactNode;
  value: number;
  handleChange: (_event: React.SyntheticEvent, newValue: number) => void;
}

export const CustomTabMenu: React.FC<Props> = ({
  value,
  handleChange,
  children,
  tabTitles,
}) => (
  <>
    <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
      <Tabs
        value={value}
        onChange={handleChange}
        aria-label="basic tabs example"
        variant="fullWidth"
      >
        {tabTitles.map((title, idx) => (
          <Tab
            sx={{ flex: 1 }}
            key={`${title.trim().toLocaleLowerCase()}-${idx}`}
            label={title}
            id={`${title.trim().toLocaleLowerCase()}-${idx}`}
          />
        ))}
      </Tabs>
    </Box>
    {children}
  </>
);
