import React from 'react';

export default class ErrorBoundary extends React.Component {
    constructor(props) {
      super(props);
      this.state = { hasError: false };
    }
    
    static getDerivedStateFromError(error) {
      // Update state so the next render will show the fallback UI.
      return { hasError: true };
    }
  
    componentDidCatch(error, errorInfo) {
      console.log("Error rendering demo markdown description.");
    }
  
    render() {
      if (this.state.hasError) {
        // Quietly error.
        return null;
      }
  
      return this.props.children; 
    }
}