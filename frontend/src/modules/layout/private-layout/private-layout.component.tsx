import { Box, Container } from '@mui/material'
import { FC, ReactNode } from 'react'
import { Header } from './header/header.component'

type IPrivateLayoutProps = {
  children: ReactNode
  sidePanel?: ReactNode
}

export const PrivateLayout: FC<IPrivateLayoutProps> = ({
  children
}) => {
  return (
    <Box sx={{ display: 'flex', width: '100%', marginTop: '3rem' }}>
      <Header />

      <Container component='main' maxWidth={false} sx={{ padding: 3 }}>
        <Box sx={{ paddingLeft: 0 }}>{children}</Box>
      </Container>

    </Box>
  )
}

export default PrivateLayout
