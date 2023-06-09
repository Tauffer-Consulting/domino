import {
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon
} from '@mui/icons-material'
import {
  AppBar,
  Box,
  Divider,
  IconButton,
  ListItem,
  Typography,
  useTheme
} from '@mui/material'
import { FC, ReactNode, useState } from 'react'
import {
  Drawer,
  DrawerHeader
} from 'modules/layout/private-layout/header/drawer-menu.style'
import SidebarAddNode from './sidebar-add-node.component'


interface PermanentDrawerRightWorkflowsProps {
  isOpen?: boolean
  handleClose: () => void
  children?: ReactNode
  sidePanel?: ReactNode
}

export const PermanentDrawerRightWorkflows: FC<
  PermanentDrawerRightWorkflowsProps
> = ({ isOpen, handleClose }) => {
  const theme = useTheme()
  const [openDrawer, setOpenDrawer] = useState(true)

  return (
    <Box sx={{ overflow: 'auto' }}>
      <AppBar
        position='fixed'
        sx={{ backgroundColor: theme.palette.background.paper }}
      >
        <Drawer variant='permanent' anchor='right' open={openDrawer}>
          <DrawerHeader sx={{ marginTop: '4rem' }}>
            {openDrawer && (
              <Typography
                variant='h1'
                sx={{ display: 'flex', flex: 1 }}
              >
                Pieces
              </Typography>
            )}
            <IconButton onClick={() => setOpenDrawer(!openDrawer)} edge='start'>
              {openDrawer ? (
                <ChevronRightIcon />
              ) : (
                <ChevronLeftIcon />
              )}
            </IconButton>
          </DrawerHeader>
          {openDrawer && (
            <>
              <Divider />
              <ListItem>
                <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <SidebarAddNode />
                </Box>
              </ListItem>
            </>
          )}
        </Drawer>
      </AppBar>
    </Box>
  )
}
