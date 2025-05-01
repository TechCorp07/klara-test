import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import PredictiveAnalytics from '../../components/ai/PredictiveAnalytics';
import { MobileOptimizationProvider } from '../../contexts/MobileOptimizationContext';

// Mock the context
jest.mock('../../contexts/MobileOptimizationContext', () => ({
  useMobileOptimization: jest.fn().mockReturnValue({
    isMobile,
    isTablet,
    touchEnabled: false
  }),
  MobileOptimizationProvider: ({ children }) => <div>{children}</div>
}));

describe('PredictiveAnalytics Component', () => {
  beforeEach(() => {
    // Reset mocks before each test
    jest.clearAllMocks();
  });

  test('renders loading state initially', () => {
    render(<PredictiveAnalytics />);
    expect(screen.getByRole('status')).toBeInTheDocument();
    expect(screen.getByText(/loading predictions/i)).toBeInTheDocument();
  });

  test('renders all prediction sections after loading', async () => {
    render(<PredictiveAnalytics />);
    
    // Wait for loading to finish
    await waitFor(() => {
      expect(screen.getByText(/Predictive Analytics/i)).toBeInTheDocument();
    });
    
    // Check if all prediction sections are displayed
    expect(screen.getByText(/Predicted Admissions/i)).toBeInTheDocument();
    expect(screen.getByText(/Resource Predictions/i)).toBeInTheDocument();
    expect(screen.getByText(/Staffing Predictions/i)).toBeInTheDocument();
  });

  test('changes time range when buttons are clicked', async () => {
    render(<PredictiveAnalytics />);
    
    // Wait for loading to finish
    await waitFor(() => {
      expect(screen.getByText(/Predictive Analytics/i)).toBeInTheDocument();
    });
    
    // Find and click the "Month" time range button
    const monthButton = screen.getByText('Month');
    fireEvent.click(monthButton);
    
    // Check if the button is now active
    expect(monthButton).toHaveClass('active');
    
    // Loading should occur again after changing time range
    expect(screen.getByRole('status')).toBeInTheDocument();
    
    // Wait for loading to finish again
    await waitFor(() => {
      expect(screen.getByText(/Predictive Analytics/i)).toBeInTheDocument();
    });
  });

  test('filters prediction types when buttons are clicked', async () => {
    render(<PredictiveAnalytics />);
    
    // Wait for loading to finish
    await waitFor(() => {
      expect(screen.getByText(/Predictive Analytics/i)).toBeInTheDocument();
    });
    
    // Find and click the "Admissions" type button
    const admissionsButton = screen.getByText('Admissions');
    fireEvent.click(admissionsButton);
    
    // Check if the button is now active
    expect(admissionsButton).toHaveClass('active');
    
    // Loading should occur again after changing type
    expect(screen.getByRole('status')).toBeInTheDocument();
    
    // Wait for loading to finish again
    await waitFor(() => {
      expect(screen.getByText(/Predictive Analytics/i)).toBeInTheDocument();
    });
    
    // Check if only admissions section is displayed
    expect(screen.getByText(/Predicted Admissions/i)).toBeInTheDocument();
    expect(screen.queryByText(/Resource Predictions/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Staffing Predictions/i)).not.toBeInTheDocument();
  });

  test('refreshes predictions when refresh button is clicked', async () => {
    render(<PredictiveAnalytics />);
    
    // Wait for loading to finish
    await waitFor(() => {
      expect(screen.getByText(/Predictive Analytics/i)).toBeInTheDocument();
    });
    
    // Find and click the refresh button
    const refreshButton = screen.getByText(/Refresh Predictions/i);
    fireEvent.click(refreshButton);
    
    // Check if loading state is shown again
    expect(screen.getByRole('status')).toBeInTheDocument();
    
    // Wait for loading to finish again
    await waitFor(() => {
      expect(screen.getByText(/Predictive Analytics/i)).toBeInTheDocument();
    });
    
    // Verify predictions are displayed again
    expect(screen.getByText(/Predicted Admissions/i)).toBeInTheDocument();
  });

  test('displays correct admission metrics', async () => {
    render(<PredictiveAnalytics />);
    
    // Wait for loading to finish
    await waitFor(() => {
      expect(screen.getByText(/Predictive Analytics/i)).toBeInTheDocument();
    });
    
    // Check if admission metrics are displayed correctly
    expect(screen.getByText(/Predicted Admissions/i)).toBeInTheDocument();
    expect(screen.getByText(/Current vs. Predicted Admissions/i)).toBeInTheDocument();
    expect(screen.getByText(/Admissions by Day/i)).toBeInTheDocument();
    expect(screen.getByText(/Admissions by Category/i)).toBeInTheDocument();
  });
});
