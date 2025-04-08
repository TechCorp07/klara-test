// ErrorBoundary.js
import React from 'react';
import { toast } from 'react-toastify';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  
  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error', error, errorInfo);
    toast.error("An unexpected error occurred. Please try again later.");
  }
  
  render() {
    if (this.state.hasError) {
      return <div className="p-4 text-center">Something went wrong.</div>;
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
