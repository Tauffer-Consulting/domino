import React from 'react';
import { Popover, IconButton, Typography } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import DragHandleIcon from '@mui/icons-material/DragHandle';
import Draggable from 'react-draggable';

import { IOperator, IIOProperty } from 'services/requests/piece';


function renderPieceProperties(operator: IOperator, key: 'input_schema' | 'output_schema' | 'secrets_schema') {
    const schema = operator[key];
    const properties = schema?.properties || {};
    return Object.entries(properties).map(([key, value]) => {
        const argument = value as IIOProperty;
        let typeName: string = argument.type;
        let valuesOptions: string[] = [];

        if (argument.allOf && argument.allOf.length > 0) {
            typeName = "enum";
            const typeClass = argument.allOf[0]['$ref'].split("/").pop();
            valuesOptions = schema?.definitions?.[typeClass].enum;
        }

        return (
            <Typography key={key} sx={{ padding: '0.5rem 1rem 0rem 1.5rem' }}>
                <strong>{key}</strong> [<em>{typeName}</em>] - {argument.description}.
                {argument.allOf && argument.allOf.length > 0 && (
                    <>
                        {' Options: '}
                        {valuesOptions.join(", ")}
                    </>
                )}
            </Typography>
        );
    });
}

interface PieceDocsPopoverProps {
    operator: IOperator;
    popoverOpen: boolean;
    handlePopoverClose: (event: React.MouseEvent<HTMLButtonElement>, reason: any) => void;
}

const PieceDocsPopover: React.FC<PieceDocsPopoverProps> = ({ operator, popoverOpen, handlePopoverClose }) => (
    <Draggable handle=".popover-handle" cancel=".popover-content">
        <Popover
            disableEnforceFocus
            disableAutoFocus
            disableScrollLock
            open={popoverOpen}
            anchorPosition={{ top: window.innerHeight / 2, left: window.innerWidth / 2 }}
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
                    paddingBottom: '2rem',
                    overflow: 'hidden',
                    '& .popover-handle': {
                        backgroundColor: '#323C3D',
                        padding: '0.5rem',
                        '& .drag-handle': {
                            cursor: 'move',
                            '& svg': {
                                color: '#f5f5f5'
                            }
                        },
                        '& .close-button': {
                            '& svg': {
                                color: '#f5f5f5'
                            }
                        }
                    },
                    '& .popover-content': {
                        maxHeight: '500px',
                        overflowY: 'auto',
                        '& .MuiTypography-root': {
                            '& strong': { fontWeight: 450 }
                        }
                    }
                }
            }}
        >
            <div className="popover-handle" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div className="drag-handle">
                    <DragHandleIcon />
                </div>
                <Typography sx={{ padding: '0rem', fontWeight: 500, fontSize: '1.4rem', color: "#f5f5f5", textAlign: "center" }}>{operator.name}</Typography>
                <div className="close-button">
                    <IconButton size="small" onClick={(event) => handlePopoverClose(event, 'closeButtonClick')}>
                        <CloseIcon />
                    </IconButton>
                </div>
            </div>
            <div className="popover-content">
                <Typography sx={{ padding: '1rem 1rem 0rem 1rem' }}>{operator.description}</Typography>
                <Typography sx={{ padding: '1rem 1rem 0rem 1rem', fontWeight: 500, fontSize: '1.3rem' }}>Input</Typography>
                {renderPieceProperties(operator, 'input_schema')}
                <Typography sx={{ padding: '1rem 1rem 0rem 1rem', fontWeight: 500, fontSize: '1.3rem' }}>Output</Typography>
                {renderPieceProperties(operator, 'output_schema')}
                {operator.secrets_schema && <Typography sx={{ padding: '1rem 1rem 0rem 1rem', fontWeight: 500, fontSize: '1.3rem' }}>Secrets</Typography>}
                {operator.secrets_schema && renderPieceProperties(operator, 'secrets_schema')}
            </div>
        </Popover>
    </Draggable>
);

export default PieceDocsPopover;
