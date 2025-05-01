import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import AIRecommendations from '../../components/ai/AIRecommendations';
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

describe('AIRecommendations Component', () => {
  beforeEach(() => {
    // Reset mocks before each test
    jest.clearAllMocks();
  });

  test('renders loading state initially', () => {
    render(<AIRecommendations />);
    expect(screen.getByRole('status')).toBeInTheDocument();
    expect(screen.getByText(/loading recommendations/i)).toBeInTheDocument();
  });

  test('renders recommendations after loading', async () => {
    render(<AIRecommendations />);
    
    // Wait for loading to finish and recommendations to appear
    await waitFor(() => {
      expect(screen.getByText(/AI Recommendations/i)).toBeInTheDocument();
    });
    
    // Check if recommendations are displayed
    expect(screen.getByText(/Medication Adjustment Recommended/i)).toBeInTheDocument();
    expect(screen.getByText(/Staffing Optimization/i)).toBeInTheDocument();
    expect(screen.getByText(/Readmission Risk Alert/i)).toBeInTheDocument();
  });

  test('expands recommendation details when "Show More" is clicked', async () => {
    render(<AIRecommendations />);
    
    // Wait for loading to finish
    await waitFor(() => {
      expect(screen.getByText(/AI Recommendations/i)).toBeInTheDocument();
    });
    
    // Find and click the "Show More" button for the first recommendation
    const showMoreButton = screen.getAllByText(/Show More/i)[0];
    fireEvent.click(showMoreButton);
    
    // Check if details are displayed
    expect(screen.getByText(/Supporting Data:/i)).toBeInTheDocument();
    expect(screen.getByText(/Accept Recommendation/i)).toBeInTheDocument();
    expect(screen.getByText(/Dismiss/i)).toBeInTheDocument();
  });

  test('filters recommendations by type when specified', async () => {
    render(<AIRecommendations recommendationType="patient" />);
    
    // Wait for loading to finish
    await waitFor(() => {
      expect(screen.getByText(/AI Recommendations/i)).toBeInTheDocument();
    });
    
    // Check if only patient recommendations are displayed
    expect(screen.getByText(/Medication Adjustment Recommended/i)).toBeInTheDocument();
    expect(screen.getByText(/Preventive Screening Due/i)).toBeInTheDocument();
    
    // Check that resource recommendations are not displayed
    expect(screen.queryByText(/Staffing Optimization/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Equipment Maintenance Alert/i)).not.toBeInTheDocument();
  });

  test('refreshes recommendations when refresh button is clicked', async () => {
    render(<AIRecommendations />);
    
    // Wait for loading to finish
    await waitFor(() => {
      expect(screen.getByText(/AI Recommendations/i)).toBeInTheDocument();
    });
    
    // Find and click the refresh button
    const refreshButton = screen.getByText(/Refresh Recommendations/i);
    fireEvent.click(refreshButton);
    
    // Check if loading state is shown again
    expect(screen.getByRole('status')).toBeInTheDocument();
    
    // Wait for loading to finish again
    await waitFor(() => {
      expect(screen.getByText(/AI Recommendations/i)).toBeInTheDocument();
    });
    
    // Verify recommendations are displayed again
    expect(screen.getByText(/Medication Adjustment Recommended/i)).toBeInTheDocument();
  });
});
