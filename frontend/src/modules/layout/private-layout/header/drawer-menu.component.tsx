import {
  AccountTree as AccountTreeIcon,
  BlurCircular,
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
  Logout as LogoutIcon,
  Person as PersonIcon,
  Toc,
  Workspaces
} from '@mui/icons-material'
import {
  Box,
  Divider,
  IconButton,
  List,
  Toolbar,
  useTheme
} from '@mui/material'
import { FC } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import MenuIcon from '@mui/icons-material/Menu'
import { useAuthentication } from 'context/authentication'
import { useWorkspaces } from 'context/workspaces/workspaces.context'
import { DrawerMenuItem } from './drawer-menu-item.component'
import { AppBar, Drawer, DrawerHeader } from './drawer-menu.style'


interface IDrawerMenuProps {
  isOpen: boolean
  handleClose: () => void
}

/**
 * Drawer menu.
 * @todo move AppBar into its own component (or to header.component)
 */
export const DrawerMenu: FC<IDrawerMenuProps> = ({
  isOpen,
  handleClose
}) => {
  const theme = useTheme()
  const { logout } = useAuthentication()
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const { workspace } = useWorkspaces()

  return (
    <Box sx={{ display: 'flex' }}>
      <AppBar position='fixed'>
        <Toolbar>
          <IconButton color='inherit' edge='start' onClick={handleClose}>
            {theme.direction === 'rtl' ? <ChevronLeftIcon /> : <MenuIcon />}
          </IconButton>
          <img
            src='../../../../../assets/logo2.png'
            alt='logo'
            style={{ width: '160px', marginRight: '8px', marginLeft: '20px' }}
          />
          <IconButton
            component='p'
            sx={{
              color: 'inherit',
              fontSize: '1.2rem',
              fontWeight: 100,
              ml: 'auto',
              alignItems: 'center',
              display: { xs: 'none', md: 'flex' }
            }}
            onClick={
              () =>
                !!workspace
                  ? navigate('/workspace-settings')
                  : null /* go to selected workspace setting */
            }
          >
            <BlurCircular
              sx={{
                mr: 1
              }}
            />
            {workspace?.workspace_name
              ? workspace?.workspace_name
              : 'No workspace selected'}
          </IconButton>
        </Toolbar>
      </AppBar>
      <Drawer variant='permanent' open={isOpen}>
        <DrawerHeader>
          <IconButton onClick={handleClose}>
            {theme.direction === 'rtl' ? (
              <ChevronRightIcon />
            ) : (
              <ChevronLeftIcon />
            )}
          </IconButton>
        </DrawerHeader>
        <Divider />
        <List disablePadding>
          <DrawerMenuItem
            selected={pathname === '/workspaces'}
            onClick={() => navigate('/workspaces')}
            icon={<Workspaces />}
            label={'Workspaces'}
            isMenuOpen={isOpen}
          />
        </List>
        <Divider />
        <List>
          <DrawerMenuItem
            selected={pathname === '/workflows'}
            onClick={() =>
              workspace?.id ? navigate('/workflows') : ''
            }
            icon={<Toc />}
            label={'Workflows'}
            isMenuOpen={isOpen}
            disabled={!workspace?.id}
          />

          <DrawerMenuItem
            selected={pathname === '/workflows-editor'}
            onClick={() => (workspace?.id ? navigate('/workflows-editor') : '')}
            icon={<AccountTreeIcon />}
            label={'Workflow Editor'}
            isMenuOpen={isOpen}
            disabled={!workspace?.id}
          />
        </List>
        <Divider />
        <List>
          <DrawerMenuItem
            selected={pathname === '/profile'}
            onClick={() => navigate('/profile')}
            icon={<PersonIcon />}
            label={'Profile'}
            isMenuOpen={isOpen}
            disabled
          />
          <DrawerMenuItem
            selected={false}
            onClick={() => logout()}
            icon={<LogoutIcon />}
            label={'Logout'}
            isMenuOpen={isOpen}
          />
        </List>
      </Drawer>
    </Box>
  )
}
