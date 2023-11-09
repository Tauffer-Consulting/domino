import BuildIcon from "@mui/icons-material/Build";
import CreateNewFolderIcon from "@mui/icons-material/CreateNewFolder";
import FolderIcon from "@mui/icons-material/Folder";
import Box from "@mui/material/Box";
import Tab from "@mui/material/Tab";
import Tabs from "@mui/material/Tabs";
import Typography from "@mui/material/Typography";
import SelectInput from "components/SelectInput";
import TextInput from "components/TextInput";
import * as React from "react";
interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}
function CustomTabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          <Typography>{children}</Typography>
        </Box>
      )}
    </div>
  );
}
function a11yProps(index: number) {
  return {
    id: `simple-tab-${index}`,
    "aria-controls": `simple-tabpanel-${index}`,
  };
}
export default function CustomTab() {
  const [value, setValue] = React.useState(0);
  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };
  const tabStyle = {
    border: "1px solid #e0e0e0",
    borderRadius: "4px",
    textAlign: "center",
    "&.Mui-selected": {
      backgroundColor: "#e0e0e0",
      color: "primary.main",
      borderBottom: "2px solid #3f51b5",
    },
    "&:hover": {
      backgroundColor: "#f5f5f5",
      opacity: 1,
    },
  };
  return (
    <Box sx={{ width: "100%" }}>
      <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
        <Tabs
          value={value}
          onChange={handleChange}
          aria-label="piece folder tabs"
          variant="fullWidth"
          centered
        >
          <Tab label="Create new folder" {...a11yProps(0)} sx={tabStyle} />
          <Tab label="select existing folder" {...a11yProps(1)} sx={tabStyle} />
        </Tabs>
      </Box>
      <CustomTabPanel value={value} index={0}>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            flexDirection: "column",
            gap: 3,
          }}
        >
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 2,
              width: "100%",
            }}
          >
            <CreateNewFolderIcon />
            <TextInput
              name="folderName"
              label="Folder Name"
              defaultValue=""
              registerOptions={{ required: "Folder name is required" }}
            />
          </Box>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 2,
              width: "100%",
            }}
          >
            <BuildIcon />
            <TextInput
              name="PieceName"
              label="Piece Name"
              defaultValue=""
              registerOptions={{ required: "Piece name is required" }}
            />
          </Box>
        </Box>
      </CustomTabPanel>
      <CustomTabPanel value={value} index={1}>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            flexDirection: "column",
            gap: 3,
          }}
        >
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 2,
              width: "100%",
            }}
          >
            <FolderIcon />
            <SelectInput
              name="folderName"
              label="Existing Folder"
              options={["Piece 1", "Piece 2", "Piece 3"]}
              emptyValue
            />
          </Box>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 2,
              width: "100%",
            }}
          >
            <BuildIcon />
            <TextInput
              name="PieceName"
              label="Piece Name"
              defaultValue=""
              registerOptions={{ required: "Piece name is required" }}
            />
          </Box>
        </Box>
      </CustomTabPanel>
    </Box>
  );
}
