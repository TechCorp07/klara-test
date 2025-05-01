import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import HealthcareSystemIntegration from '../../components/ehr/HealthcareSystemIntegration';
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

describe('HealthcareSystemIntegration Component', () => {
  beforeEach(() => {
    // Reset mocks before each test
    jest.clearAllMocks();
  });

  test('renders loading state initially', () => {
    render(<HealthcareSystemIntegration />);
    expect(screen.getByRole('status')).toBeInTheDocument();
    expect(screen.getByText(/loading integrations/i)).toBeInTheDocument();
  });

  test('renders integration cards after loading', async () => {
    render(<HealthcareSystemIntegration />);
    
    // Wait for loading to finish
    await waitFor(() => {
      expect(screen.getByText(/Healthcare System Integrations/i)).toBeInTheDocument();
    });
    
    // Check if integration cards are displayed
    expect(screen.getByText(/Epic EHR/i)).toBeInTheDocument();
    expect(screen.getByText(/Cerner Millennium/i)).toBeInTheDocument();
    expect(screen.getByText(/Meditech Expanse/i)).toBeInTheDocument();
  });

  test('shows connection status badges correctly', async () => {
    render(<HealthcareSystemIntegration />);
    
    // Wait for loading to finish
    await waitFor(() => {
      expect(screen.getByText(/Healthcare System Integrations/i)).toBeInTheDocument();
    });
    
    // Check if status badges are displayed correctly
    expect(screen.getByText(/Connected/i)).toBeInTheDocument();
    expect(screen.getByText(/Disconnected/i)).toBeInTheDocument();
    expect(screen.getByText(/Error/i)).toBeInTheDocument();
  });

  test('shows connect button for disconnected systems', async () => {
    render(<HealthcareSystemIntegration />);
    
    // Wait for loading to finish
    await waitFor(() => {
      expect(screen.getByText(/Healthcare System Integrations/i)).toBeInTheDocument();
    });
    
    // Find the disconnected system card (Cerner)
    const cernerCard = screen.getByText(/Cerner Millennium/i).closest('.card');
    
    // Check if connect button is displayed
    const connectButton = within(cernerCard).getByText(/Connect/i);
    expect(connectButton).toBeInTheDocument();
  });

  test('shows sync and disconnect buttons for connected systems', async () => {
    render(<HealthcareSystemIntegration />);
    
    // Wait for loading to finish
    await waitFor(() => {
      expect(screen.getByText(/Healthcare System Integrations/i)).toBeInTheDocument();
    });
    
    // Find the connected system card (Epic)
    const epicCard = screen.getByText(/Epic EHR/i).closest('.card');
    
    // Check if sync and disconnect buttons are displayed
    const syncButton = within(epicCard).getByText(/Sync Now/i);
    const disconnectButton = within(epicCard).getByText(/Disconnect/i);
    expect(syncButton).toBeInTheDocument();
    expect(disconnectButton).toBeInTheDocument();
  });

  test('opens configuration modal when Add Integration button is clicked', async () => {
    render(<HealthcareSystemIntegration />);
    
    // Wait for loading to finish
    await waitFor(() => {
      expect(screen.getByText(/Healthcare System Integrations/i)).toBeInTheDocument();
    });
    
    // Find and click the Add Integration button
    const addButton = screen.getByText(/Add Integration/i);
    fireEvent.click(addButton);
    
    // Check if modal is displayed
    expect(screen.getByText(/Configure Healthcare System Integration/i)).toBeInTheDocument();
    expect(screen.getByText(/System Type/i)).toBeInTheDocument();
    expect(screen.getByText(/API Endpoint/i)).toBeInTheDocument();
    expect(screen.getByText(/API Key/i)).toBeInTheDocument();
  });

  test('connects to a system when Connect button is clicked', async () => {
    const onConnectMock = jest.fn();
    render(<HealthcareSystemIntegration onConnect={onConnectMock} />);
    
    // Wait for loading to finish
    await waitFor(() => {
      expect(screen.getByText(/Healthcare System Integrations/i)).toBeInTheDocument();
    });
    
    // Find the disconnected system card (Cerner)
    const cernerCard = screen.getByText(/Cerner Millennium/i).closest('.card');
    
    // Find and click the Connect button
    const connectButton = within(cernerCard).getByText(/Connect/i);
    fireEvent.click(connectButton);
    
    // Check if onConnect callback was called
    expect(onConnectMock).toHaveBeenCalled();
    
    // Wait for the UI to update
    await waitFor(() => {
      // The card should now show Sync Now and Disconnect buttons
      const updatedCard = screen.getByText(/Cerner Millennium/i).closest('.card');
      expect(within(updatedCard).getByText(/Sync Now/i)).toBeInTheDocument();
    });
  });

  test('disconnects from a system when Disconnect button is clicked', async () => {
    const onDisconnectMock = jest.fn();
    render(<HealthcareSystemIntegration onDisconnect={onDisconnectMock} />);
    
    // Wait for loading to finish
    await waitFor(() => {
      expect(screen.getByText(/Healthcare System Integrations/i)).toBeInTheDocument();
    });
    
    // Find the connected system card (Epic)
    const epicCard = screen.getByText(/Epic EHR/i).closest('.card');
    
    // Find and click the Disconnect button
    const disconnectButton = within(epicCard).getByText(/Disconnect/i);
    fireEvent.click(disconnectButton);
    
    // Check if onDisconnect callback was called
    expect(onDisconnectMock).toHaveBeenCalled();
    
    // Wait for the UI to update
    await waitFor(() => {
      // The card should now show Connect button
      const updatedCard = screen.getByText(/Epic EHR/i).closest('.card');
      expect(within(updatedCard).getByText(/Connect/i)).toBeInTheDocument();
    });
  });
});
