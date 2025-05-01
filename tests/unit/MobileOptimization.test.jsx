import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { MobileOptimizationProvider } from '../../contexts/MobileOptimizationContext';
import TouchFriendlyForm from '../../components/ui/TouchFriendlyForm';
import TouchFriendlyNavigation from '../../components/ui/TouchFriendlyNavigation';
import ResponsiveTable from '../../components/ui/ResponsiveTable';
import ResponsiveCard from '../../components/ui/ResponsiveCard';
import LazyLoadImage from '../../components/ui/LazyLoadImage';

// Mock the context
jest.mock('../../contexts/MobileOptimizationContext', () => ({
  useMobileOptimization: jest.fn(),
  MobileOptimizationProvider: ({ children }) => <div>{children}</div>
}));

// Import the actual implementation to use its mock
const { useMobileOptimization } = require('../contexts/MobileOptimizationContext');

describe('Mobile Optimization Components', () => {
  beforeEach(() => {
    // Reset mocks before each test
    jest.clearAllMocks();
  });

  describe('TouchFriendlyForm Component', () => {
    const testFields = [
      { name: 'name', label: 'Name', type: 'text' },
      { name: 'email', label: 'Email', type: 'email' },
      { name: 'message', label: 'Message', type: 'textarea' }
    ];

    test('renders form fields correctly', () => {
      useMobileOptimization.mockReturnValue({
        isMobile,
        touchEnabled: false
      });

      render(<TouchFriendlyForm fields={testFields} onSubmit={() => {}} />);
      
      expect(screen.getByLabelText(/Name/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Email/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Message/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Submit/i })).toBeInTheDocument();
    });

    test('applies mobile-specific classes when on mobile', () => {
      useMobileOptimization.mockReturnValue({
        isMobile,
        touchEnabled: true
      });

      render(<TouchFriendlyForm fields={testFields} onSubmit={() => {}} />);
      
      const nameField = screen.getByLabelText(/Name/i).closest('.mb-3');
      expect(nameField).toHaveClass('touch-friendly-input');
    });

    test('calls onSubmit with form values when submitted', async () => {
      useMobileOptimization.mockReturnValue({
        isMobile,
        touchEnabled: false
      });

      const handleSubmit = jest.fn();
      render(<TouchFriendlyForm fields={testFields} onSubmit={handleSubmit} />);
      
      // Fill out the form
      fireEvent.change(screen.getByLabelText(/Name/i), { target: { value: 'John Doe' } });
      fireEvent.change(screen.getByLabelText(/Email/i), { target: { value: 'john@example.com' } });
      fireEvent.change(screen.getByLabelText(/Message/i), { target: { value: 'Hello world' } });
      
      // Submit the form
      fireEvent.click(screen.getByRole('button', { name: /Submit/i }));
      
      // Check if onSubmit was called with the correct values
      expect(handleSubmit).toHaveBeenCalledWith({
        name: 'John Doe',
        email: 'john@example.com',
        message: 'Hello world'
      });
    });
  });

  describe('TouchFriendlyNavigation Component', () => {
    const testItems = [
      { id: 'home', label: 'Home', icon: 'house' },
      { id: 'profile', label: 'Profile', icon: 'person' },
      { id: 'settings', label: 'Settings', icon: 'gear' }
    ];

    test('renders horizontal navigation on desktop', () => {
      useMobileOptimization.mockReturnValue({
        isMobile,
        isTablet: false
      });

      render(<TouchFriendlyNavigation items={testItems} />);
      
      expect(screen.getByText(/Home/i)).toBeInTheDocument();
      expect(screen.getByText(/Profile/i)).toBeInTheDocument();
      expect(screen.getByText(/Settings/i)).toBeInTheDocument();
      
      // Should be rendered horizontal navbar
      expect(screen.getByRole('navigation')).toHaveClass('navbar');
    });

    test('renders bottom tab navigation on mobile when not collapsible', () => {
      useMobileOptimization.mockReturnValue({
        isMobile,
        isTablet: false
      });

      render(<TouchFriendlyNavigation items={testItems} orientation="horizontal" collapsible={false} />);
      
      // Should be rendered bottom tab bar
      expect(screen.getByRole('navigation')).toHaveClass('mobile-tab-nav');
    });

    test('renders hamburger menu on mobile when collapsible', () => {
      useMobileOptimization.mockReturnValue({
        isMobile,
        isTablet: false
      });

      render(<TouchFriendlyNavigation items={testItems} />);
      
      // Should have a toggle button (hamburger)
      expect(screen.getByRole('button', { name: /toggle navigation/i })).toBeInTheDocument();
    });

    test('calls onItemClick when an item is clicked', () => {
      useMobileOptimization.mockReturnValue({
        isMobile,
        isTablet: false
      });

      const handleItemClick = jest.fn();
      render(<TouchFriendlyNavigation items={testItems} onItemClick={handleItemClick} />);
      
      // Click on an item
      fireEvent.click(screen.getByText(/Profile/i));
      
      // Check if onItemClick was called with the correct item
      expect(handleItemClick).toHaveBeenCalledWith(testItems[1]);
    });
  });

  describe('ResponsiveTable Component', () => {
    const testColumns = [
      { key: 'id', header: 'ID' },
      { key: 'name', header: 'Name' },
      { key: 'email', header: 'Email' }
    ];
    
    const testData = [
      { id, name: 'John Doe', email: 'john@example.com' },
      { id, name: 'Jane Smith', email: 'jane@example.com' }
    ];

    test('renders table correctly on desktop', () => {
      useMobileOptimization.mockReturnValue({
        isMobile: false
      });

      render(<ResponsiveTable columns={testColumns} data={testData} />);
      
      // Should render a standard table
      expect(screen.getByRole('table')).toBeInTheDocument();
      expect(screen.getAllByRole('row')).toHaveLength(3); // Header + 2 data rows
      expect(screen.getAllByRole('columnheader')).toHaveLength(3);
      expect(screen.getAllByRole('cell')).toHaveLength(6);
    });

    test('renders cards on mobile instead of table', () => {
      useMobileOptimization.mockReturnValue({
        isMobile: true
      });

      render(<ResponsiveTable columns={testColumns} data={testData} />);
      
      // Should not render a standard table
      expect(screen.queryByRole('table')).not.toBeInTheDocument();
      
      // Should render cards instead
      const cards = screen.getAllByTestId('responsive-table-card');
      expect(cards).toHaveLength(2);
      
      // Each card should contain all the data
      expect(cards[0]).toHaveTextContent('John Doe');
      expect(cards[0]).toHaveTextContent('john@example.com');
    });

    test('calls onRowClick when a row/card is clicked', () => {
      useMobileOptimization.mockReturnValue({
        isMobile: false
      });

      const handleRowClick = jest.fn();
      render(<ResponsiveTable columns={testColumns} data={testData} onRowClick={handleRowClick} />);
      
      // Click on a row
      fireEvent.click(screen.getAllByRole('row')[1]);
      
      // Check if onRowClick was called with the correct row data
      expect(handleRowClick).toHaveBeenCalledWith(testData[0]);
    });
  });

  describe('ResponsiveCard Component', () => {
    test('renders card with title and content', () => {
      useMobileOptimization.mockReturnValue({
        isMobile,
        isTablet: false
      });

      render(
        <ResponsiveCard 
          title="Test Card" 
          content="This is a test card content"
        />
      );
      
      expect(screen.getByText('Test Card')).toBeInTheDocument();
      expect(screen.getByText('This is a test card content')).toBeInTheDocument();
    });

    test('applies full width class on mobile', () => {
      useMobileOptimization.mockReturnValue({
        isMobile,
        isTablet: false
      });

      render(
        <ResponsiveCard 
          title="Test Card" 
          content="This is a test card content"
        />
      );
      
      const card = screen.getByText('Test Card').closest('.card');
      expect(card).toHaveClass('w-100');
    });

    test('renders actions differently on mobile vs desktop', () => {
      // Test desktop layout
      useMobileOptimization.mockReturnValue({
        isMobile,
        isTablet: false
      });

      const actions = [
        { label: 'Edit', variant: 'primary', onClick: jest.fn() },
        { label: 'Delete', variant: 'danger', onClick: jest.fn() }
      ];

      const { rerender } = render(
        <ResponsiveCard 
          title="Test Card" 
          content="This is a test card content"
          actions={actions}
        />
      );
      
      // On desktop, actions should be in a horizontal layout
      let actionsContainer = screen.getByText('Edit').closest('.card-actions');
      expect(actionsContainer).toHaveClass('d-flex');
      
      // Test mobile layout
      useMobileOptimization.mockReturnValue({
        isMobile,
        isTablet: false
      });
      
      rerender(
        <ResponsiveCard 
          title="Test Card" 
          content="This is a test card content"
          actions={actions}
        />
      );
      
      // On mobile, actions should be in a vertical layout
      actionsContainer = screen.getByText('Edit').closest('.card-actions');
      expect(actionsContainer.firstChild).toHaveClass('d-grid');
    });
  });

  describe('LazyLoadImage Component', () => {
    // Mock IntersectionObserver
    const mockIntersectionObserver = jest.fn();
    mockIntersectionObserver.mockReturnValue({
      observe: jest.fn(),
      unobserve: jest.fn(),
      disconnect: jest.fn()
    });
    window.IntersectionObserver = mockIntersectionObserver;

    test('renders placeholder initially', () => {
      useMobileOptimization.mockReturnValue({
        isMobile,
        connectionStatus: 'fast'
      });

      render(
        <LazyLoadImage 
          src="test-image.jpg" 
          alt="Test Image"
        />
      );
      
      // Should show loading spinner initially
      expect(screen.getByRole('status')).toBeInTheDocument();
      
      // Image should exist but be invisible
      const image = screen.getByAltText('Test Image');
      expect(image).toHaveStyle('opacity: 0');
    });

    test('loads lower quality image on mobile with slow connection', () => {
      useMobileOptimization.mockReturnValue({
        isMobile,
        connectionStatus: 'slow'
      });

      render(
        <LazyLoadImage 
          src="test-image.jpg" 
          alt="Test Image"
        />
      );
      
      // Simulate intersection observer callback
      const [[callback]] = mockIntersectionObserver.mock.calls;
      callback([{ isIntersecting: true }]);
      
      // Image source should be modified for low quality
      const image = screen.getByAltText('Test Image');
      expect(image.src).toContain('low-quality');
    });

    test('shows image when loaded', () => {
      useMobileOptimization.mockReturnValue({
        isMobile,
        connectionStatus: 'fast'
      });

      render(
        <LazyLoadImage 
          src="test-image.jpg" 
          alt="Test Image"
        />
      );
      
      // Simulate intersection observer callback
      const [[callback]] = mockIntersectionObserver.mock.calls;
      callback([{ isIntersecting: true }]);
      
      // Simulate image load
      const image = screen.getByAltText('Test Image');
      fireEvent.load(image);
      
      // Image should be visible
      expect(image).toHaveStyle('opacity: 1');
      
      // Loading spinner should be hidden
      expect(screen.queryByRole('status')).not.toBeVisible();
    });
  });
});
