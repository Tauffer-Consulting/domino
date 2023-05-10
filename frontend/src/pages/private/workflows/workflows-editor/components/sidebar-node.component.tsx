import { Box, Typography } from '@mui/material'
import { IOperator } from 'services/requests/piece'

// @ts-ignore: Unreachable code error
export const OperatorSidebarNode: FC<{ operator: IOperator }> = ({ operator }) => {
  // Drag and drop from sidebar to Workflow area
  // @ts-ignore: Unreachable code error
  const onDragStart = (event, nodeData) => {
    var data = JSON.stringify(nodeData.nodeData)
    event.dataTransfer.setData('application/reactflow', data)
    event.dataTransfer.effectAllowed = 'move'
  }

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
      <Typography variant='body1' sx={{ width: '100%', textOverflow: "ellipsis", overflow: "hidden", maxWidth: '180px'}}>
        {operator?.name ?? '-'}
      </Typography>
    </Box>
  )
}

export default OperatorSidebarNode
