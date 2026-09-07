import { ArrowBack as ArrowBackIcon } from '@mui/icons-material';
import { IconButton, Tooltip } from '@mui/material';
import { useRouter } from 'next/router';

interface BackButtonProps {
  fallback?: string;
}

export default function BackButton({ fallback = '/dashboard' }: BackButtonProps) {
  const router = useRouter();

  const goBack = () => {
    if (window.history.length > 1) {
      router.back();
      return;
    }

    router.push(fallback);
  };

  return (
    <Tooltip title="Back">
      <IconButton aria-label="Back" onClick={goBack}>
        <ArrowBackIcon />
      </IconButton>
    </Tooltip>
  );
}