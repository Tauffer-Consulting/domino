import ClearIcon from "@mui/icons-material/Clear";
import DownloadIcon from "@mui/icons-material/Download";
import IosShareIcon from "@mui/icons-material/IosShare";
import SaveIcon from "@mui/icons-material/Save";
import SettingsSuggestIcon from "@mui/icons-material/Settings";
import { Button, Grid, Menu, MenuItem, styled } from "@mui/material";
import { type ModalRef } from "components/Modal";
import { useStorage } from "context/storage/useStorage";
import {
  type Differences,
  findDifferencesInJsonImported,
  importJsonWorkflow,
  validateJsonImported,
} from "features/workflowEditor/utils";
import React, { useCallback, useRef, useState } from "react";
import { toast } from "react-toastify";
import * as yup from "yup";

import {
  DifferencesModal,
  MyWorkflowExamplesGalleryModal,
  WorkflowExamplesGalleryModal,
} from "../Modals";

interface Props {
  handleSettings: (event: any) => void;
  handleSave: () => void;
  handleExport: () => void;
  handleImported: (json: any) => void;
  handleClear: () => void;
}

const VisuallyHiddenInput = styled("input")({
  clip: "rect(0 0 0 0)",
  clipPath: "inset(50%)",
  height: 1,
  overflow: "hidden",
  position: "absolute",
  bottom: 0,
  left: 0,
  whiteSpace: "nowrap",
  width: 1,
});

export const ButtonsMenu: React.FC<Props> = ({
  handleSettings,
  handleSave,
  handleExport,
  handleImported,
  handleClear,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const incompatiblePiecesModalRef = useRef<ModalRef>(null);
  const workflowsGalleryModalRef = useRef<ModalRef>(null);
  const myWorkflowsGalleryModalRef = useRef<ModalRef>(null);
  const localStorage = useStorage();

  const [menuElement, setMenuElement] = useState<null | HTMLElement>(null);
  const importMenuOpen = Boolean(menuElement);

  const handleClickImportMenu = useCallback(
    (event: React.MouseEvent<HTMLButtonElement>) => {
      setMenuElement(event.currentTarget);
    },
    [],
  );

  const handleImportFromFile = useCallback(() => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
    setMenuElement(null);
  }, [fileInputRef]);

  const handleImportFromExamples = useCallback(() => {
    setMenuElement(null);
    workflowsGalleryModalRef.current?.open();
  }, [workflowsGalleryModalRef]);

  const [incompatiblesPieces, setIncompatiblesPieces] = useState<Differences[]>(
    [],
  );

  const handleImportedJson = useCallback((json: any) => {
    try {
      validateJsonImported(json);
      const pieces = localStorage.getItem<Piece[]>("pieces");
      const differences = findDifferencesInJsonImported(
        json,
        pieces as Piece[],
      );

      if (differences.length) {
        toast.error("Some repositories are missing or incompatible version");

        setIncompatiblesPieces(differences);
        incompatiblePiecesModalRef.current?.open();
        return;
      }

      handleImported(json);
    } catch (e: any) {
      if (e instanceof yup.ValidationError) {
        toast.error("This JSON file is incompatible or corrupted");
      } else {
        console.error(e);
      }
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }, []);

  return (
    <Grid
      container
      spacing={1}
      direction="row"
      justifyContent="flex-end"
      alignItems="center"
      style={{ marginBottom: 10 }}
    >
      <Grid item>
        <Button
          color="primary"
          variant="contained"
          startIcon={<SettingsSuggestIcon />}
          onClick={handleSettings}
        >
          Settings
        </Button>
      </Grid>
      <Grid item>
        <Button
          color="primary"
          variant="contained"
          startIcon={<SaveIcon />}
          onClick={handleSave}
        >
          Create
        </Button>
      </Grid>
      <Grid item>
        <Button
          color="primary"
          variant="contained"
          startIcon={<IosShareIcon />}
          onClick={handleExport}
        >
          Export
        </Button>
      </Grid>
      <Grid item>
        <Button
          variant="contained"
          startIcon={<DownloadIcon />}
          id="import-button"
          aria-controls={importMenuOpen ? "import-menu" : undefined}
          aria-haspopup="true"
          aria-expanded={importMenuOpen ? "true" : undefined}
          onClick={handleClickImportMenu}
        >
          <VisuallyHiddenInput
            type="file"
            onChange={async (e) => {
              const json = await importJsonWorkflow(e);
              handleImportedJson(json);
            }}
            ref={fileInputRef}
          />
          Import
        </Button>
        <Menu
          id="import-menu"
          anchorEl={menuElement}
          open={importMenuOpen}
          onClose={() => {
            setMenuElement(null);
          }}
          MenuListProps={{
            "aria-labelledby": "import-button",
          }}
        >
          <MenuItem onClick={handleImportFromFile}>from file</MenuItem>
          <MenuItem onClick={handleImportFromExamples}>
            from examples gallery
          </MenuItem>
          <MenuItem
            onClick={() => {
              myWorkflowsGalleryModalRef.current?.open();
            }}
          >
            from my workflows
          </MenuItem>
        </Menu>
        <WorkflowExamplesGalleryModal
          ref={workflowsGalleryModalRef}
          confirmFn={handleImportedJson}
        />
        <MyWorkflowExamplesGalleryModal
          ref={myWorkflowsGalleryModalRef}
          confirmFn={handleImportedJson}
        />
        <DifferencesModal
          incompatiblesPieces={incompatiblesPieces}
          ref={incompatiblePiecesModalRef}
        />
      </Grid>
      <Grid item>
        <Button
          color="primary"
          variant="contained"
          startIcon={<ClearIcon />}
          onClick={handleClear}
        >
          Clear
        </Button>
      </Grid>
    </Grid>
  );
};
