import NavigateNextIcon from "@mui/icons-material/NavigateNext";
import BreadcrumbsMui from "@mui/material/Breadcrumbs";
import Typography from "@mui/material/Typography";
import React from "react";
import { Link as RouterLink, useLocation } from "react-router-dom";

export const Breadcrumbs: React.FC = () => {
  const location = useLocation();
  const pathnames = location.pathname.split("/").filter((x) => x);

  const formatBreadcrumbLabel = (value: string) => {
    // Remove dashes and other special characters and add spaces
    const formattedValue = value
      .replace(/[-_]+/g, " ")
      .replace(/([a-z])([A-Z])/g, "$1 $2");

    // Capitalize the first letter of each word
    const words = formattedValue.split(" ");
    const capitalizedWords = words.map((word) => {
      return word.charAt(0).toUpperCase() + word.slice(1);
    });

    return capitalizedWords.join(" ");
  };

  return (
    <BreadcrumbsMui
      aria-label="Breadcrumb"
      maxItems={3}
      separator={<NavigateNextIcon fontSize="medium" />}
    >
      {pathnames.map((value, index) => {
        const last = index === pathnames.length - 1;
        const to = `/${pathnames.slice(0, index + 1).join("/")}`;
        const formattedValue = formatBreadcrumbLabel(value);

        return last ? (
          <Typography
            variant="h1"
            color="textPrimary"
            key={to}
            sx={{
              userSelect: "none",
            }}
          >
            {formattedValue}
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
              {formattedValue}
            </Typography>
          </RouterLink>
        );
      })}
    </BreadcrumbsMui>
  );
};
