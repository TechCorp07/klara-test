import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import MainframeMonitoring from '../../components/monitoring/MainframeMonitoring';
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

describe('MainframeMonitoring Component', () => {
  beforeEach(() => {
    // Reset mocks before each test
    jest.clearAllMocks();
  });

  test('renders loading state initially', () => {
    render(<MainframeMonitoring />);
    expect(screen.getByRole('status')).toBeInTheDocument();
    expect(screen.getByText(/loading monitoring data/i)).toBeInTheDocument();
  });

  test('renders monitoring dashboard after loading', async () => {
    render(<MainframeMonitoring />);
    
    // Wait for loading to finish
    await waitFor(() => {
      expect(screen.getByText(/Mainframe Monitoring/i)).toBeInTheDocument();
    });
    
    // Check if main sections are displayed
    expect(screen.getByText(/System Utilization/i)).toBeInTheDocument();
    expect(screen.getByText(/Alerts/i)).toBeInTheDocument();
    expect(screen.getByText(/Batch Jobs/i)).toBeInTheDocument();
  });

  test('displays utilization gauges correctly', async () => {
    render(<MainframeMonitoring />);
    
    // Wait for loading to finish
    await waitFor(() => {
      expect(screen.getByText(/Mainframe Monitoring/i)).toBeInTheDocument();
    });
    
    // Check if utilization gauges are displayed
    expect(screen.getByText(/CPU Utilization/i)).toBeInTheDocument();
    expect(screen.getByText(/Memory Utilization/i)).toBeInTheDocument();
    expect(screen.getByText(/Storage Utilization/i)).toBeInTheDocument();
    expect(screen.getByText(/Network Utilization/i)).toBeInTheDocument();
  });

  test('changes time range when buttons are clicked', async () => {
    render(<MainframeMonitoring />);
    
    // Wait for loading to finish
    await waitFor(() => {
      expect(screen.getByText(/Mainframe Monitoring/i)).toBeInTheDocument();
    });
    
    // Find and click the "Hour" time range button
    const hourButton = screen.getByText('Hour');
    fireEvent.click(hourButton);
    
    // Check if the button is now active
    expect(hourButton).toHaveClass('active');
    
    // Loading should occur again after changing time range
    expect(screen.getByRole('status')).toBeInTheDocument();
    
    // Wait for loading to finish again
    await waitFor(() => {
      expect(screen.getByText(/Mainframe Monitoring/i)).toBeInTheDocument();
    });
  });

  test('changes system when dropdown is changed', async () => {
    render(<MainframeMonitoring />);
    
    // Wait for loading to finish
    await waitFor(() => {
      expect(screen.getByText(/Mainframe Monitoring/i)).toBeInTheDocument();
    });
    
    // Find and change the system dropdown
    const systemSelect = screen.getByRole('combobox');
    fireEvent.change(systemSelect, { target: { value: 'mainframe-2' } });
    
    // Loading should occur again after changing system
    expect(screen.getByRole('status')).toBeInTheDocument();
    
    // Wait for loading to finish again
    await waitFor(() => {
      expect(screen.getByText(/Mainframe Monitoring/i)).toBeInTheDocument();
    });
  });

  test('toggles auto-refresh when switch is clicked', async () => {
    render(<MainframeMonitoring />);
    
    // Wait for loading to finish
    await waitFor(() => {
      expect(screen.getByText(/Mainframe Monitoring/i)).toBeInTheDocument();
    });
    
    // Find and click the auto-refresh toggle
    const autoRefreshToggle = screen.getByRole('checkbox', { name: /auto-refresh/i });
    expect(autoRefreshToggle).toBeChecked(); // Default is checked
    
    // Toggle it off
    fireEvent.click(autoRefreshToggle);
    expect(autoRefreshToggle).not.toBeChecked();
  });

  test('refreshes data when refresh button is clicked', async () => {
    render(<MainframeMonitoring />);
    
    // Wait for loading to finish
    await waitFor(() => {
      expect(screen.getByText(/Mainframe Monitoring/i)).toBeInTheDocument();
    });
    
    // Find and click the refresh button
    const refreshButton = screen.getByRole('button', { name: '' }); // The refresh button has no text, just an icon
    fireEvent.click(refreshButton);
    
    // Check if loading state is shown again
    expect(screen.getByRole('status')).toBeInTheDocument();
    
    // Wait for loading to finish again
    await waitFor(() => {
      expect(screen.getByText(/Mainframe Monitoring/i)).toBeInTheDocument();
    });
  });

  test('displays alerts correctly', async () => {
    render(<MainframeMonitoring />);
    
    // Wait for loading to finish
    await waitFor(() => {
      expect(screen.getByText(/Mainframe Monitoring/i)).toBeInTheDocument();
    });
    
    // Check if alerts are displayed
    expect(screen.getByText(/CPU utilization exceeded 90% for 5 minutes/i)).toBeInTheDocument();
    expect(screen.getByText(/Transaction failure rate above 1%/i)).toBeInTheDocument();
    expect(screen.getByText(/Scheduled maintenance in 24 hours/i)).toBeInTheDocument();
    
    // Check if severity badges are displayed
    expect(screen.getByText(/Critical/i)).toBeInTheDocument();
    expect(screen.getByText(/Warning/i)).toBeInTheDocument();
    expect(screen.getByText(/Info/i)).toBeInTheDocument();
  });

  test('displays batch jobs correctly', async () => {
    render(<MainframeMonitoring />);
    
    // Wait for loading to finish
    await waitFor(() => {
      expect(screen.getByText(/Mainframe Monitoring/i)).toBeInTheDocument();
    });
    
    // Check if batch jobs are displayed
    expect(screen.getByText(/Daily Patient Data Backup/i)).toBeInTheDocument();
    expect(screen.getByText(/Monthly Billing Processing/i)).toBeInTheDocument();
    expect(screen.getByText(/Weekly System Maintenance/i)).toBeInTheDocument();
    
    // Check if status badges are displayed
    expect(screen.getByText(/Running/i)).toBeInTheDocument();
    expect(screen.getByText(/Queued/i)).toBeInTheDocument();
    expect(screen.getByText(/Completed/i)).toBeInTheDocument();
  });
});
