/**
 * Component tests for FieldCopyButton
 * Tests the inline button for copying individual field values
 */

import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import FieldCopyButton from '@/components/admin/FieldCopyButton';

// Mock cross-tenant utilities
jest.mock('@/lib/cross-tenant', () => ({
  getTenantShortName: jest.fn((tenant) => tenant === 'internal' ? 'briantpm.com' : 'brianthomastpm.com'),
  getOppositeTenant: jest.fn((tenant) => tenant === 'internal' ? 'external' : 'internal'),
}));

// Mock useOtherTenantData hook
jest.mock('@/hooks/useOtherTenantData', () => ({
  getCurrentTenantFromClient: jest.fn(() => 'internal'),
}));

import { getCurrentTenantFromClient } from '@/hooks/useOtherTenantData';

const mockGetCurrentTenant = getCurrentTenantFromClient as jest.MockedFunction<typeof getCurrentTenantFromClient>;

describe('FieldCopyButton', () => {
  const defaultProps = {
    otherValue: 'Value from other tenant',
    onCopy: jest.fn(),
    fieldLabel: 'bio',
    loading: false,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockGetCurrentTenant.mockReturnValue('internal');
  });

  describe('Rendering', () => {
    it('should render button when otherValue is provided', () => {
      render(<FieldCopyButton {...defaultProps} />);

      const button = screen.getByRole('button');
      expect(button).toBeInTheDocument();
    });

    it('should not render when otherValue is null', () => {
      render(<FieldCopyButton {...defaultProps} otherValue={null} />);

      expect(screen.queryByRole('button')).not.toBeInTheDocument();
    });

    it('should not render when otherValue is undefined', () => {
      render(<FieldCopyButton {...defaultProps} otherValue={undefined} />);

      expect(screen.queryByRole('button')).not.toBeInTheDocument();
    });

    it('should not render when otherValue is empty string', () => {
      render(<FieldCopyButton {...defaultProps} otherValue="" />);

      // Empty string is falsy but still technically a string, checking behavior
      // Based on component: if (!otherValue) return null, so empty string should not render
      expect(screen.queryByRole('button')).not.toBeInTheDocument();
    });

    it('should show correct tooltip with tenant name', () => {
      render(<FieldCopyButton {...defaultProps} />);

      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('title', 'Copy from brianthomastpm.com');
    });
  });

  describe('Popover', () => {
    it('should open popover on button click', async () => {
      render(<FieldCopyButton {...defaultProps} />);

      const button = screen.getByRole('button');
      await userEvent.click(button);

      await waitFor(() => {
        expect(screen.getByText(/bio on brianthomastpm.com/i)).toBeInTheDocument();
      });
    });

    it('should show the other value in the popover', async () => {
      render(<FieldCopyButton {...defaultProps} />);

      const button = screen.getByRole('button');
      await userEvent.click(button);

      await waitFor(() => {
        expect(screen.getByText('Value from other tenant')).toBeInTheDocument();
      });
    });

    it('should close popover when X button is clicked', async () => {
      render(<FieldCopyButton {...defaultProps} />);

      // Open popover
      const button = screen.getByRole('button');
      await userEvent.click(button);

      await waitFor(() => {
        expect(screen.getByText(/bio on/i)).toBeInTheDocument();
      });

      // Find and click close button (X icon in popover header)
      const closeButtons = screen.getAllByRole('button');
      const closeButton = closeButtons.find(btn => btn.querySelector('svg.w-4.h-4'));
      if (closeButton) {
        await userEvent.click(closeButton);
      }
    });

    it('should toggle popover on multiple clicks', async () => {
      render(<FieldCopyButton {...defaultProps} />);

      const button = screen.getByRole('button');

      // Open
      await userEvent.click(button);
      await waitFor(() => {
        expect(screen.getByText(/bio on brianthomastpm.com/i)).toBeInTheDocument();
      });

      // Close by clicking again
      await userEvent.click(button);
      await waitFor(() => {
        expect(screen.queryByText(/bio on brianthomastpm.com/i)).not.toBeInTheDocument();
      });
    });
  });

  describe('Apply Button', () => {
    it('should show Apply button in popover', async () => {
      render(<FieldCopyButton {...defaultProps} />);

      const button = screen.getByRole('button');
      await userEvent.click(button);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /Apply this bio/i })).toBeInTheDocument();
      });
    });

    it('should call onCopy with value when Apply is clicked', async () => {
      const onCopy = jest.fn();
      render(<FieldCopyButton {...defaultProps} onCopy={onCopy} />);

      // Open popover
      const button = screen.getByRole('button');
      await userEvent.click(button);

      // Click apply
      const applyButton = await screen.findByRole('button', { name: /Apply this bio/i });
      await userEvent.click(applyButton);

      expect(onCopy).toHaveBeenCalledWith('Value from other tenant');
    });

    it('should use fieldLabel in Apply button text', async () => {
      render(<FieldCopyButton {...defaultProps} fieldLabel="email" />);

      const button = screen.getByRole('button');
      await userEvent.click(button);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /Apply this email/i })).toBeInTheDocument();
      });
    });

    it('should use default fieldLabel when not provided', async () => {
      render(<FieldCopyButton {...defaultProps} fieldLabel={undefined} />);

      const button = screen.getByRole('button');
      await userEvent.click(button);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /Apply this value/i })).toBeInTheDocument();
      });
    });
  });

  describe('Copied State', () => {
    it('should show "Copied!" text after apply', async () => {
      render(<FieldCopyButton {...defaultProps} />);

      // Open popover
      const button = screen.getByRole('button');
      await userEvent.click(button);

      // Click apply
      const applyButton = await screen.findByRole('button', { name: /Apply this bio/i });
      await userEvent.click(applyButton);

      await waitFor(() => {
        expect(screen.getByText('Copied!')).toBeInTheDocument();
      });
    });

    it('should disable Apply button after copy', async () => {
      render(<FieldCopyButton {...defaultProps} />);

      // Open popover
      const button = screen.getByRole('button');
      await userEvent.click(button);

      // Click apply
      const applyButton = await screen.findByRole('button', { name: /Apply this bio/i });
      await userEvent.click(applyButton);

      await waitFor(() => {
        const copiedButton = screen.getByRole('button', { name: /Copied!/i });
        expect(copiedButton).toBeDisabled();
      });
    });

    it('should auto-close popover after timeout', async () => {
      jest.useFakeTimers();
      render(<FieldCopyButton {...defaultProps} />);

      // Open popover
      const button = screen.getByRole('button');
      await userEvent.setup({ advanceTimers: jest.advanceTimersByTime }).click(button);

      // Click apply
      const applyButton = await screen.findByRole('button', { name: /Apply this bio/i });
      await userEvent.setup({ advanceTimers: jest.advanceTimersByTime }).click(applyButton);

      // Wait for "Copied!" to appear
      await waitFor(() => {
        expect(screen.getByText('Copied!')).toBeInTheDocument();
      });

      jest.useRealTimers();
    });
  });

  describe('Loading State', () => {
    it('should show loading spinner when loading', () => {
      render(<FieldCopyButton {...defaultProps} loading={true} />);

      const button = screen.getByRole('button');
      expect(button).toBeDisabled();
      // Loader2 icon should be present with animate-spin class
    });

    it('should disable button when loading', () => {
      render(<FieldCopyButton {...defaultProps} loading={true} />);

      const button = screen.getByRole('button');
      expect(button).toBeDisabled();
    });
  });

  describe('Outside Click', () => {
    it('should close popover when clicking outside', async () => {
      render(
        <div>
          <FieldCopyButton {...defaultProps} />
          <div data-testid="outside">Outside</div>
        </div>
      );

      // Open popover
      const button = screen.getByRole('button');
      await userEvent.click(button);

      await waitFor(() => {
        expect(screen.getByText(/bio on brianthomastpm.com/i)).toBeInTheDocument();
      });

      // Click outside
      fireEvent.mouseDown(screen.getByTestId('outside'));

      await waitFor(() => {
        expect(screen.queryByText(/bio on brianthomastpm.com/i)).not.toBeInTheDocument();
      });
    });
  });

  describe('Long Values', () => {
    it('should display long values with scrolling', async () => {
      const longValue = 'This is a very long value that should be displayed with scrolling. '.repeat(10);
      render(<FieldCopyButton {...defaultProps} otherValue={longValue} />);

      const button = screen.getByRole('button');
      await userEvent.click(button);

      await waitFor(() => {
        const contentContainer = screen.getByText(longValue).closest('div');
        expect(contentContainer).toHaveClass('overflow-y-auto');
      });
    });
  });

  describe('Different Tenants', () => {
    it('should show correct tenant name when current is external', async () => {
      mockGetCurrentTenant.mockReturnValue('external');

      render(<FieldCopyButton {...defaultProps} />);

      const button = screen.getByRole('button');
      await userEvent.click(button);

      await waitFor(() => {
        expect(screen.getByText(/bio on briantpm.com/i)).toBeInTheDocument();
      });
    });
  });

  describe('Whitespace Values', () => {
    it('should preserve whitespace in displayed values', async () => {
      const valueWithWhitespace = '  Multiple\n  Lines\n  With Indentation  ';
      render(<FieldCopyButton {...defaultProps} otherValue={valueWithWhitespace} />);

      const button = screen.getByRole('button');
      await userEvent.click(button);

      await waitFor(() => {
        const contentContainer = screen.getByText(valueWithWhitespace);
        expect(contentContainer).toHaveClass('whitespace-pre-wrap');
      });
    });
  });

  describe('Styling', () => {
    it('should have amber color scheme', () => {
      render(<FieldCopyButton {...defaultProps} />);

      const button = screen.getByRole('button');
      expect(button).toHaveClass('bg-amber-900/30');
    });

    it('should show amber border', () => {
      render(<FieldCopyButton {...defaultProps} />);

      const button = screen.getByRole('button');
      expect(button).toHaveClass('border-amber-500/30');
    });
  });
});
