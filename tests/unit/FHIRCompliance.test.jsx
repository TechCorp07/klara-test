import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import FHIRCompliance from '../../components/ehr/FHIRCompliance';
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

describe('FHIRCompliance Component', () => {
  beforeEach(() => {
    // Reset mocks before each test
    jest.clearAllMocks();
  });

  test('renders loading state initially', () => {
    render(<FHIRCompliance />);
    expect(screen.getByRole('status')).toBeInTheDocument();
    expect(screen.getByText(/loading FHIR resources/i)).toBeInTheDocument();
  });

  test('renders FHIR resources after loading', async () => {
    render(<FHIRCompliance />);
    
    // Wait for loading to finish
    await waitFor(() => {
      expect(screen.getByText(/FHIR Compliance/i)).toBeInTheDocument();
    });
    
    // Check if resource list is displayed
    expect(screen.getByText(/FHIR Resources/i)).toBeInTheDocument();
    expect(screen.getByText(/Patient/i)).toBeInTheDocument();
    expect(screen.getByText(/Observation/i)).toBeInTheDocument();
    expect(screen.getByText(/MedicationRequest/i)).toBeInTheDocument();
  });

  test('shows validation status badges correctly', async () => {
    render(<FHIRCompliance />);
    
    // Wait for loading to finish
    await waitFor(() => {
      expect(screen.getByText(/FHIR Compliance/i)).toBeInTheDocument();
    });
    
    // Check if validation status badges are displayed correctly
    expect(screen.getByText(/Valid/i)).toBeInTheDocument();
    expect(screen.getByText(/Warning/i)).toBeInTheDocument();
    expect(screen.getByText(/Error/i)).toBeInTheDocument();
  });

  test('displays resource details when a resource is selected', async () => {
    render(<FHIRCompliance />);
    
    // Wait for loading to finish
    await waitFor(() => {
      expect(screen.getByText(/FHIR Compliance/i)).toBeInTheDocument();
    });
    
    // Find and click on a resource (Patient)
    const patientResource = screen.getByText(/Patient/i);
    fireEvent.click(patientResource);
    
    // Check if resource details are displayed
    expect(screen.getByText(/Resource Content:/i)).toBeInTheDocument();
    expect(screen.getByText(/Version:/i)).toBeInTheDocument();
    expect(screen.getByText(/Status:/i)).toBeInTheDocument();
  });

  test('validates a resource when Validate button is clicked', async () => {
    const onValidateMock = jest.fn();
    render(<FHIRCompliance onValidate={onValidateMock} />);
    
    // Wait for loading to finish
    await waitFor(() => {
      expect(screen.getByText(/FHIR Compliance/i)).toBeInTheDocument();
    });
    
    // Find and click on a resource (Patient)
    const patientResource = screen.getByText(/Patient/i);
    fireEvent.click(patientResource);
    
    // Find and click the Validate button
    const validateButton = screen.getByText(/Validate/i);
    fireEvent.click(validateButton);
    
    // Check if validation results are displayed
    await waitFor(() => {
      expect(screen.getByText(/Validation Results:/i)).toBeInTheDocument();
    });
    
    // Check if onValidate callback was called
    expect(onValidateMock).toHaveBeenCalled();
  });

  test('exports a resource when Export button is clicked', async () => {
    const onExportMock = jest.fn();
    render(<FHIRCompliance onExport={onExportMock} />);
    
    // Wait for loading to finish
    await waitFor(() => {
      expect(screen.getByText(/FHIR Compliance/i)).toBeInTheDocument();
    });
    
    // Find and click on a resource (Patient)
    const patientResource = screen.getByText(/Patient/i);
    fireEvent.click(patientResource);
    
    // Select export format
    const formatSelect = screen.getByRole('combobox');
    fireEvent.change(formatSelect, { target: { value: 'json' } });
    
    // Find and click the Export button
    const exportButton = screen.getByText(/Export/i);
    fireEvent.click(exportButton);
    
    // Check if export status changes to "Exporting..."
    expect(screen.getByText(/Exporting.../i)).toBeInTheDocument();
    
    // Wait for export to complete
    await waitFor(() => {
      expect(screen.getByText(/Exported/i)).toBeInTheDocument();
    });
    
    // Check if onExport callback was called
    expect(onExportMock).toHaveBeenCalled();
  });

  test('filters resources by type when resourceType prop is provided', async () => {
    render(<FHIRCompliance resourceType="Patient" />);
    
    // Wait for loading to finish
    await waitFor(() => {
      expect(screen.getByText(/FHIR Compliance/i)).toBeInTheDocument();
    });
    
    // Check if only Patient resources are displayed
    expect(screen.getByText(/Patient/i)).toBeInTheDocument();
    expect(screen.queryByText(/Observation/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/MedicationRequest/i)).not.toBeInTheDocument();
  });

  test('refreshes resources when Refresh button is clicked', async () => {
    render(<FHIRCompliance />);
    
    // Wait for loading to finish
    await waitFor(() => {
      expect(screen.getByText(/FHIR Compliance/i)).toBeInTheDocument();
    });
    
    // Find and click the Refresh button
    const refreshButton = screen.getByText(/Refresh/i);
    fireEvent.click(refreshButton);
    
    // Check if loading state is shown again
    expect(screen.getByRole('status')).toBeInTheDocument();
    
    // Wait for loading to finish again
    await waitFor(() => {
      expect(screen.getByText(/FHIR Compliance/i)).toBeInTheDocument();
    });
    
    // Verify resources are displayed again
    expect(screen.getByText(/Patient/i)).toBeInTheDocument();
    expect(screen.getByText(/Observation/i)).toBeInTheDocument();
    expect(screen.getByText(/MedicationRequest/i)).toBeInTheDocument();
  });
});
