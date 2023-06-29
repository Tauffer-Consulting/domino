import React, { useCallback } from 'react'
import {
  Drawer,
  Grid,
  Typography,

  Accordion,
  AccordionSummary,
  AccordionDetails
} from '@mui/material'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

import { useWorkflowsEditor } from 'context/workflows/workflows-editor.context'
import { extractDefaultValues } from 'utils'
import PieceForm from '../piece-form.component'
import ContainerResourceForm from './container-resource-form.component';
import StorageForm from './storage-form.component';

interface ISidebarPieceFormProps {
  formId: string,
  schema: Record<string, unknown>,
  title: string,
  open: boolean,
  onClose: (event: any) => void,
}

const SidebarPieceForm: React.FC<ISidebarPieceFormProps> = (props) => {
  const {
    schema,
    formId,
    open,
    onClose,
    title,
  } = props

  //load forage

  const handleSaveForage = useCallback((data:any)=>{
    //save on forage with pieceFormsData using context
    /**
     * pieceFormsData : {
     *  formId: {
     *    containerResources: {},
     *    storage: {},
     *    inputs: {},
     *  }
     * }
     */
    console.log(data)
  },[])

  return (
    <Drawer
      anchor='left'
      open={open}
      onClose={onClose}
      sx={{
        "& .MuiDrawer-paper": { marginTop: "4rem", width: "33%", maxWidth: '500px', minWidth: '300px' }
      }}
      BackdropProps={{ style: { backgroundColor: "transparent" } }}
    >
      <div style={{ width: '100%', maxWidth: '500px', minWidth: '300px', paddingLeft: '20px', paddingRight: '20px' }}>
        <Typography
          variant='h5'
          component="h5"
          sx={{ marginTop: '20px', marginBottom: "20px" }}
        >
          {title}
        </Typography >

        <Grid container>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <Grid container spacing={2} sx={{ marginBottom: '20px' }}>
              <Grid item xs={10}>
                <Typography variant="subtitle2" component="div" sx={{ flexGrow: 1, borderBottom: "1px solid;" }}>Input Arguments</Typography>
              </Grid>
              <Grid item xs={12 - 10}>
                <Typography variant="subtitle2" component="div" sx={{ flexGrow: 1, borderBottom: "1px solid;" }}>Upstream</Typography>
              </Grid>
            </Grid>

            <Grid container sx={{ paddingBottom: "25px" }}>
              <Grid item xs={12} className='sidebar-jsonforms-grid'>
                <Grid item xs={12}>
                  {/* <PieceForm
                    formId={formId}
                    schema={formJsonSchema}
                    initialData={formData}
                    onChange={handleOnChange}
                  /> */}
                </Grid>

                <div style={{ marginBottom: '50px' }} />

                <Accordion
                  sx={{
                    '&.MuiAccordion-root:before': {
                      display: 'none',
                    },
                  }}>
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Typography variant="subtitle2" component="div" sx={{ flexGrow: 1, borderBottom: "1px solid;" }}>
                      Advanced Options
                    </Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    <StorageForm onChange={handleSaveForage}/>
                    <div style={{ marginBottom: '50px' }} />
                    <ContainerResourceForm onChange={handleSaveForage}/>
                  </AccordionDetails>
                </Accordion>
              </Grid>
            </Grid>
          </div>
        </Grid>
        <div style={{ marginBottom: '70px' }} />
      </div>
    </Drawer>
  )
}

export default SidebarPieceForm;
