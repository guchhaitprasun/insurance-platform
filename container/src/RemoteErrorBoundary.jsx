import React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import ErrorOutline from '@mui/icons-material/ErrorOutline';

/**
 * Catches errors from remote MFEs so we see the real error in console
 * instead of the generic cross-origin "Script error".
 */
export default class RemoteErrorBoundary extends React.Component {
  state = { hasError: false, error: null };

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('[Remote MFE error]', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <Box
          role="alert"
          sx={{
            p: 3,
            borderRadius: 2,
            bgcolor: 'error.dark',
            border: '1px solid',
            borderColor: 'error.main',
            textAlign: 'center',
          }}
        >
          <ErrorOutline sx={{ fontSize: 48, color: 'error.main', mb: 1 }} />
          <Typography variant="h6" gutterBottom>Something went wrong</Typography>
          <Typography color="text.secondary" sx={{ mb: 2 }}>
            {this.state.error?.message || 'Unknown error'}
          </Typography>
          <Button
            variant="contained"
            color="primary"
            onClick={() => this.setState({ hasError: false, error: null })}
          >
            Try again
          </Button>
        </Box>
      );
    }
    return this.props.children;
  }
}
