import { FC, SyntheticEvent, useState } from 'react'

import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Alert,
  Box,
  ToggleButton,
  ToggleButtonGroup,
  Typography
} from '@mui/material'

import { useWorkflowsEditor } from 'context/workflows/workflows-editor.context'
import { IOperator } from 'services/requests/piece'
import OperatorSidebarNode from './sidebar-node.component'

/**
 * @todo cleanup comments when no longer needed
 * @todo move operators rules to create workflow context
 * @todo improve loading/error/empty states
 * @todo use (randomly generated?) colors to visually group operators from same repo
 * @todo apply these colors on workflow area as well
 */
const SidebarAddNode: FC = () => {
  const {
    repositories,
    repositoriesLoading,
    repositoryOperators,
    nodeDirection,
    toggleNodeDirection
  } = useWorkflowsEditor()

  const [operators, setOperators] = useState<IOperator[]>([])
  /** controls the selected accordion, if any */
  const [expandedRepo, setExpandedRepo] = useState<string | false>(false)

  /** controls if an accordion is loading operators */
  const [loadingOperators, setLoadingOperators] = useState<string | false>(
    false
  )

  return (
    <Box className='add-node-panel' sx={{ padding: "0px 0px 0px 0px" }}>
      <Box sx={{ display: 'flex', flexDirection: 'column', mb: 1 }}>

        <ToggleButtonGroup
          value={nodeDirection}
          exclusive
          onChange={toggleNodeDirection}
          aria-label='Node direction'
          sx={{
            width: '100%',
            display: 'grid',
            gridTemplateColumns: '1fr 1fr'
          }}
        >
          <ToggleButton
            value='horizontal'
            aria-label='left aligned'
            sx={{ padding: '0px 0px 0px 0px', width: '120px' }}
          >
            horizontal
          </ToggleButton>
          <ToggleButton
            value='vertical'
            aria-label='centered'
            sx={{ padding: '0px 0px 0px 0px', width: '120px' }}
          >
            vertical
          </ToggleButton>
        </ToggleButtonGroup>

        {/* <TextField
          variant='outlined'
          margin='normal'
          label='Search repository'
          type='search'
          name='search-form'
          id='search-form'
          className='search-input'
          value={search}
        onChange={(e) => handleSearch(e.target.value)}
        /> */}
      </Box>

      {repositoriesLoading && (
        <Alert severity='info'>Loading repositories...</Alert>
      )}
      {!repositoriesLoading &&
        repositories.map((repo) => (
          <Accordion
            TransitionProps={{ unmountOnExit: true }}
            expanded={expandedRepo === repo.id}
            key={repo.id}
            onChange={(event: SyntheticEvent, expanded: boolean) => {
              if (loadingOperators) return
              if (expanded) {
                // Load operators from state object
                setLoadingOperators(repo.id)
                setExpandedRepo(repo.id)
                setOperators(repositoryOperators[repo.id])
                setLoadingOperators(false)
              } else {
                setExpandedRepo(false)
              }
            }}
          >
            <AccordionSummary
              expandIcon={<ExpandMoreIcon />}
            >
              <Typography
                sx={{
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  WebkitLineClamp: '2',
                  WebkitBoxOrient: 'vertical',
                  maxWidth: '180px'
                }}
              >
                {repo.label}
              </Typography>
              
            </AccordionSummary>
            <AccordionDetails
              sx={{
                margin: "0px 0px 0px 0px",
                padding: "0px 0px 0px 0px"
              }}
            >
              {!!loadingOperators && loadingOperators === repo.id && (
                <Alert severity='info'>Loading operators...</Alert>
              )}
              {expandedRepo === repo.id &&
                operators.length &&
                operators.map((operator) => (
                  <OperatorSidebarNode operator={operator} key={operator.id} />
                ))}
            </AccordionDetails>
          </Accordion>
        ))
      }
    </Box >
  )
}

export default SidebarAddNode
