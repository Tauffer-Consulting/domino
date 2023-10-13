import NavigateNextIcon from "@mui/icons-material/NavigateNext";
import BreadcrumbsMui from "@mui/material/Breadcrumbs";
import Typography from "@mui/material/Typography";
import React from "react";
import { Link as RouterLink, useLocation } from "react-router-dom";

export const Breadcrumbs: React.FC = () => {
  const location = useLocation();
  const pathnames = location.pathname.split("/").filter((x) => x);

  return (
    <BreadcrumbsMui
      aria-label="Breadcrumb"
      maxItems={3}
      separator={<NavigateNextIcon fontSize="medium" />}
    >
      {pathnames.map((value, index) => {
        const last = index === pathnames.length - 1;
        const to = `/${pathnames.slice(0, index + 1).join("/")}`;
        const capitalizedValue = value.charAt(0).toUpperCase() + value.slice(1);

        return last ? (
          <Typography
            variant="h1"
            color="textPrimary"
            key={to}
            sx={{
              userSelect: "none",
            }}
          >
            {capitalizedValue}
          </Typography>
        ) : (
          <RouterLink
            to={to}
            key={to}
            style={{
              textDecoration: "none",
              transition: "opacity 0.3s",
              userSelect: "none",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.opacity = "0.7";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.opacity = "1";
            }}
          >
            <Typography variant="h1" color="textPrimary">
              {capitalizedValue}
            </Typography>
          </RouterLink>
        );
      })}
    </BreadcrumbsMui>
  );
};
