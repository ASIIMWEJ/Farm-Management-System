import React from 'react';
import { Container, Typography } from '@mui/material';
import BackButton from '@/components/BackButton';

export default function RecordTransactionPage() {
  return (
    <Container sx={{ py: 3 }}>
      <BackButton fallback="/finance" />
      <Typography variant="h4">New Financial Transaction</Typography>
      <Typography>Income and expense entry form will be placed here.</Typography>
    </Container>
  );
}