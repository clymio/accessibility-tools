import { Box, Button, Typography } from '@mui/material';
import { useRouter } from 'next/router';

export default function Custom404() {
  const router = useRouter();
  const handleGoBack = () => {
    router.back();
  };
  return (
    <Box display='flex' flexDirection='column' gap={2} alignItems='center' justifyContent='center' height='100vh'>
      <Typography variant='h1'>Page not found</Typography>
      <Button role='link' onClick={handleGoBack}>
        <Typography>Go back</Typography>
      </Button>
    </Box>
  );
}
