import {
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText
} from '@mui/material'
import Tooltip from '@mui/material/Tooltip'
import { FC, ReactNode } from 'react'

interface IDrawerMenuItemProps {
  disabled?: boolean
  isMenuOpen: boolean
  selected?: boolean
  icon: ReactNode
  label: string
  onClick: () => void
  className?: string
}

export const DrawerMenuItem: FC<IDrawerMenuItemProps> = ({
  disabled,
  isMenuOpen,
  selected,
  icon,
  label,
  onClick
}) => {
  return (
    <Tooltip title={label} placement='right'>
      <ListItem
        selected={selected}
        disablePadding
        sx={{ display: 'block' }}
        disabled={disabled}
      >
        <ListItemButton
          sx={{
            minHeight: 48,
            justifyContent: isMenuOpen ? 'initial' : 'center',
            px: 2.5
          }}
          onClick={onClick}
        >
          <ListItemIcon
            sx={{
              minWidth: 0,
              mr: isMenuOpen ? 3 : 'auto',
              justifyContent: 'center'
            }}
          >
            {icon}
          </ListItemIcon>
          <ListItemText
            primary={label}
            sx={{ display: isMenuOpen ? 'block' : 'none' }}
          />
        </ListItemButton>
      </ListItem>
    </Tooltip>
  )
}
