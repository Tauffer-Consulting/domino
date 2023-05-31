import { FC, useState } from 'react'

import { Box, Button, Grid, Link, Typography, CircularProgress} from '@mui/material'
import TextField from '@mui/material/TextField';

import { PublicLayout } from 'modules/layout'
import { useAuthentication } from 'context/authentication'
import { useNavigate } from 'react-router-dom'

/**
 * Sign up component
 * @TODO: differentiate more from the login page?
 */

export const SignUpPage: FC = () => {
  const { register, authLoading } = useAuthentication()
  const navigate = useNavigate()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  return (
    <PublicLayout>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center'
        }}
      >
        <Box
          sx={{
            margin: '0 auto',
            marginBottom: 2,
            maxWidth: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <img
            src='assets/logo2.png'
            alt='logo'
            style={{ width: '360px' }}
          />
        </Box>
      </Box>
      <Box sx={{ textAlign: 'center' }}>
        <Typography variant='h1' component='h1' sx={{ fontWeight: 'semi-bold' }}>Create an account</Typography>
      </Box>
      <Box
        component='form'
        onSubmit={(e: any) => e.preventDefault()}
        noValidate
        sx={{ mt: 1 }}
      >
        <TextField
          margin='normal'
          required
          fullWidth
          variant='outlined'
          id='email'
          label='E-mail address'
          name='email'
          autoComplete='email'
          autoFocus
          value={email}
          disabled={authLoading}
          onChange={(e) => setEmail(e.target.value)}
        />
        <TextField
          margin='normal'
          required
          fullWidth
          variant='outlined'
          name='password'
          label='Password'
          type='password'
          id='password'
          autoComplete='current-password'
          value={password}
          disabled={authLoading}
          onChange={(e) => setPassword(e.target.value)}
        />
        <Button
          type='submit'
          fullWidth
          variant='contained'
          disabled={authLoading || !email || !password}
          sx={{ mt: 3, mb: 2 }}
          onClick={() => register(email, password)}
        >
          {
            authLoading ? <CircularProgress size={20} /> :
            'Sign Up'
          }
        </Button>
        <Grid container>
          <Grid item xs>
            <Link href='/recover-password' variant='body2'>
              Forgot password?
            </Link>
          </Grid>
          <Grid item>
            <Link href="" variant='body2' onClick={() => navigate('/sign-in')}>
              {'Do you have an account? Sign In'}
            </Link>
          </Grid>
        </Grid>
        <Typography
          variant='body2'
          color='text.secondary'
          align='center'
          sx={{ mt: 4 }}
        >
          {'Copyright © '}
          <Link color='inherit' href='https://www.taufferconsulting.com/'>
            Tauffer Consulting
          </Link>
          {' 2022.'}
        </Typography>
      </Box>
    </PublicLayout>
  )
}

export default SignUpPage
