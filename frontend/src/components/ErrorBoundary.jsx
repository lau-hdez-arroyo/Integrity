import React from 'react';
import { Box, Alert, Button, Container } from '@mui/material';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <Container>
          <Box sx={{ padding: 4, textAlign: 'center' }}>
            <Alert severity="error" sx={{ marginBottom: 2 }}>
              <strong>Oops! Something went wrong</strong>
              <p>{this.state.error?.message}</p>
            </Alert>
            <Button variant="contained" onClick={this.handleReset}>
              Try again
            </Button>
          </Box>
        </Container>
      );
    }

    return this.props.children;
  }
}
