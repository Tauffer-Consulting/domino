import { FC, useState } from 'react'

import { PersonAdd } from '@mui/icons-material'
import {
  Card,
  CardHeader,
  CardContent,
  Box,
  Typography,
  Button,
  Alert
} from '@mui/material'
import TextField from '@mui/material/TextField'

// import { useWorkspaceSettings } from 'modules/workspaces/workspace-settings.context'

/**
 * @todo integrate with backend
 * @returns Users card component
 */
export const UsersCard: FC = () => {
  const [user, setUser] = useState('')
  // const { workspaceData } = useWorkspaceSettings()

  return (
    <Card variant='outlined' sx={{ height: "100%" }} style={{opacity: 0.50, pointerEvents: "none" }}>
      <CardHeader title='Users' titleTypographyProps={{ variant: 'h6' }}/>
      <CardContent>
        <Box>
          <Typography variant='subtitle1'>Invite user</Typography>
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: '1fr 64px',
              gap: 1,
              mt: 1
            }}
          >
            <TextField
              value={user}
              onChange={(e) => setUser(e.target.value)}
              fullWidth
              variant='outlined'
              id='user'
              label='User e-mail'
              type='email'
              name='user'
              disabled={true}
            />
            {/* <Button disabled={!user} color='primary' variant='contained'> */}
            <Button disabled={true} color='primary' variant='contained'>
              <PersonAdd />
            </Button>
          </Box>
        </Box>

        <Alert severity='info' sx={{ mt: 1 }}>
          Coming soon.
        </Alert>
        {/* {!!workspaceData?.users?.length ? (
          <List>
            {workspaceData.users.map((user, index) => (
              <ListItem key={index}>
                <ListItemAvatar>
                  <Avatar>
                    <Person />
                  </Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary={`user ${user.user_id}`}
                  secondary={user.permission}
                />
              </ListItem>
            ))}
          </List>
        ) : (
          <Alert severity='warning' sx={{ mt: 1 }}>
            No users!
          </Alert>
        )} */}
      </CardContent>
    </Card>
  )
}
