import React, { FC, useState } from 'react';
import { Box, Typography, Popover, IconButton, PopoverPosition } from '@mui/material'
import CloseIcon from '@mui/icons-material/Close';
import DragHandleIcon from '@mui/icons-material/DragHandle';
import HelpIcon from '@mui/icons-material/Help';
import Draggable from 'react-draggable';

import { IOperator, IIOProperty } from 'services/requests/piece';


const OperatorSidebarNode: FC<{ operator: IOperator }> = ({ operator }) => {
  const [popoverOpen, setPopoverOpen] = useState(false);
  const [anchorPosition, setAnchorPosition] = useState<PopoverPosition | undefined>(undefined);

  // Drag and drop from sidebar to Workflow area
  const onDragStart = (event: React.DragEvent<HTMLDivElement>, nodeData: any) => {
    var data = JSON.stringify(nodeData.nodeData)
    event.dataTransfer.setData('application/reactflow', data)
    event.dataTransfer.effectAllowed = 'move'
  }

  // Help popover
  const handlePopoverOpen = (event: React.MouseEvent<HTMLElement>) => {
    setPopoverOpen(true);
    const targetRect = event.currentTarget.getBoundingClientRect();
    const top = window.innerHeight / 2 - targetRect.height / 2;
    const left = window.innerWidth / 2 - targetRect.width / 2;
    setAnchorPosition({ top, left });
  };

  const handlePopoverClose = (event: React.MouseEvent<HTMLButtonElement>, reason: any) => {
    if (reason && reason === "backdropClick")
      return;
    setPopoverOpen(false);
  };

  return (
    <Box
      sx={{
        margin: '5px',
        border: '1px solid #ccc',
        padding: '0.5rem',
        borderRadius: '5px'
      }}
      onDragStart={(event) => onDragStart(event, { nodeData: operator })}
      draggable
    >
      <div style={{ display: "flex", alignItems: "center" }}>
        <Typography variant='body1' sx={{ width: '100%', textOverflow: "ellipsis", overflow: "hidden", maxWidth: '180px' }}>
          {operator?.name ?? '-'}
        </Typography>

        <IconButton sx={{ padding: 0 }} onClick={handlePopoverOpen}>
          <HelpIcon sx={{ height: "20px" }} />
        </IconButton>
      </div>

      <Draggable handle=".popover-handle" cancel=".popover-content">
        <Popover
          disableEnforceFocus
          disableAutoFocus
          disableScrollLock
          open={popoverOpen}
          anchorPosition={anchorPosition}
          anchorReference="anchorPosition"
          onClose={handlePopoverClose}
          anchorOrigin={{
            vertical: 'center',
            horizontal: 'center',
          }}
          transformOrigin={{
            vertical: 'center',
            horizontal: 'center',
          }}
          sx={{
            '& .MuiPopover-paper': {
              width: '600px',
              borderRadius: '5px',
              boxShadow: '0px 0px 10px 0px rgba(0,0,0,0.75)',
              backgroundColor: '#fff',
              color: '#000',
              paddingBottom: '0.5rem',
              overflow: 'hidden',
              '& .popover-handle': {
                backgroundColor: '#f5f5f5',
                padding: '0.5rem',
                '& .drag-handle': {
                  cursor: 'move',
                  '& svg': {
                    color: '#000'
                  }
                },
                '& .close-button': {
                  '& svg': {
                    color: '#000'
                  }
                }
              },
              '& .popover-content': {
                maxHeight: '500px',
                overflowY: 'auto',
                '& .MuiTypography-root': {
                  fontSize: '1rem',
                  '& strong': { fontWeight: 500 }
                }
              }
            }
          }}
        >
          <div className="popover-handle" style={{ display: 'flex', justifyContent: 'space-between' }}>
            <div className="drag-handle">
              <DragHandleIcon />
            </div>
            <div className="close-button">
              <IconButton size="small" onClick={(event) => handlePopoverClose(event, 'closeButtonClick')}>
                <CloseIcon />
              </IconButton>
            </div>
          </div>
          <Typography sx={{ padding: '0rem', fontWeight: 600, fontSize: '1.6rem', textAlign: "center" }}>{operator.name}</Typography>
          <div className="popover-content">
            <Typography sx={{ padding: '1rem', fontWeight: 600, fontSize: '1.2rem', paddingBottom: 0 }}>Input</Typography>
            {Object.entries(operator.input_schema.properties).map(([key, value]) => {
              const argument = value as IIOProperty;
              return (
                <Typography key={key} sx={{ padding: '0.5rem', paddingBottom: 0 }}>
                  <strong>{argument.title}</strong> [<em>{argument.type}</em>] - {argument.description}
                </Typography>
              );
            })}
            <Typography sx={{ padding: '1rem', fontWeight: 600, fontSize: '1.2rem', paddingBottom: 0 }}>Output</Typography>
            {Object.entries(operator.output_schema.properties).map(([key, value]) => {
              const argument = value as IIOProperty;
              return (
                <Typography key={key} sx={{ padding: '0.5rem', paddingBottom: 0 }}>
                  <strong>{argument.title}</strong> [<em>{argument.type}</em>] - {argument.description}
                </Typography>
              );
            })}
            {operator.secrets_schema && <Typography sx={{ padding: '1rem', fontWeight: 600, fontSize: '1.2rem', paddingBottom: 0 }}>Secrets</Typography>}
            {operator.secrets_schema && Object.entries(operator.secrets_schema.properties).map(([key, value]) => {
              const argument = value as IIOProperty;
              return (
                <Typography key={key} sx={{ padding: '0.5rem', paddingBottom: 0 }}>
                  <strong>{argument.title}</strong> [<em>{argument.type}</em>] - {argument.description}
                </Typography>
              );
            })}
          </div>

        </Popover>
      </Draggable>

    </Box >
  )
}

export default OperatorSidebarNode
