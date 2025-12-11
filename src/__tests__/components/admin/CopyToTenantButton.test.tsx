/**
 * Component tests for CopyToTenantButton
 * Tests the button that copies entities to another tenant with conflict handling
 */

import React from 'react';
import { render, screen, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import CopyToTenantButton from '@/components/admin/CopyToTenantButton';

// Mock adminFetch
jest.mock('@/lib/admin-fetch', () => ({
  adminFetch: jest.fn(),
}));

// Mock cross-tenant utilities
jest.mock('@/lib/cross-tenant', () => ({
  getTenantShortName: jest.fn((tenant) => tenant === 'internal' ? 'briantpm.com' : 'brianthomastpm.com'),
  getOppositeTenant: jest.fn((tenant) => tenant === 'internal' ? 'external' : 'internal'),
}));

// Mock useOtherTenantData hook
jest.mock('@/hooks/useOtherTenantData', () => ({
  getCurrentTenantFromClient: jest.fn(() => 'internal'),
}));

// Mock ConflictResolutionModal
jest.mock('@/components/admin/ConflictResolutionModal', () => {
  return function MockConflictResolutionModal({
    isOpen,
    onClose,
    onResolve,
    sourceName,
    targetName,
  }: {
    isOpen: boolean;
    onClose: () => void;
    onResolve: (resolution: string) => void;
    sourceName: string;
    targetName: string;
  }) {
    if (!isOpen) return null;
    return (
      <div data-testid="conflict-modal">
        <p>Source: {sourceName}</p>
        <p>Target: {targetName}</p>
        <button onClick={() => onResolve('skip')}>Skip</button>
        <button onClick={() => onResolve('replace')}>Replace</button>
        <button onClick={() => onResolve('create-new')}>Create New</button>
        <button onClick={onClose}>Cancel</button>
      </div>
    );
  };
});

import { adminFetch } from '@/lib/admin-fetch';
import { getCurrentTenantFromClient } from '@/hooks/useOtherTenantData';

const mockAdminFetch = adminFetch as jest.MockedFunction<typeof adminFetch>;
const mockGetCurrentTenant = getCurrentTenantFromClient as jest.MockedFunction<typeof getCurrentTenantFromClient>;

describe('CopyToTenantButton', () => {
  const defaultProps = {
    entityType: 'projects' as const,
    entityId: 1,
    entityName: 'Test Project',
    entityDescription: 'A test project description',
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockGetCurrentTenant.mockReturnValue('internal');
  });

  describe('Rendering', () => {
    it('should render copy button', () => {
      render(<CopyToTenantButton {...defaultProps} />);

      const button = screen.getByRole('button');
      expect(button).toBeInTheDocument();
    });

    it('should show correct tooltip with target tenant name', () => {
      render(<CopyToTenantButton {...defaultProps} />);

      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('title', 'Copy to brianthomastpm.com');
    });

    it('should show label when showLabel is true', () => {
      render(<CopyToTenantButton {...defaultProps} showLabel />);

      expect(screen.getByText(/Copy to brianthomastpm.com/i)).toBeInTheDocument();
    });

    it('should not show label by default', () => {
      render(<CopyToTenantButton {...defaultProps} />);

      expect(screen.queryByText(/Copy to brianthomastpm.com/i)).not.toBeInTheDocument();
    });

    it('should apply custom className', () => {
      render(<CopyToTenantButton {...defaultProps} className="custom-class" />);

      const button = screen.getByRole('button');
      expect(button).toHaveClass('custom-class');
    });
  });

  describe('Copy Operation', () => {
    it('should call API with correct parameters on click', async () => {
      mockAdminFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true }),
      } as Response);

      render(<CopyToTenantButton {...defaultProps} />);

      const button = screen.getByRole('button');
      await userEvent.click(button);

      expect(mockAdminFetch).toHaveBeenCalledWith('/api/admin/cross-tenant/copy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          entityType: 'projects',
          entityId: 1,
          conflictResolution: 'create-new',
          targetEntityId: undefined,
        }),
      });
    });

    it('should call onCopied callback after successful copy', async () => {
      const onCopied = jest.fn();
      mockAdminFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true }),
      } as Response);

      render(<CopyToTenantButton {...defaultProps} onCopied={onCopied} />);

      const button = screen.getByRole('button');
      await userEvent.click(button);

      await waitFor(() => {
        expect(onCopied).toHaveBeenCalled();
      });
    });
  });

  describe('Loading State', () => {
    it('should show loading spinner during copy operation', async () => {
      let resolvePromise: (value: Response) => void;
      const pendingPromise = new Promise<Response>((resolve) => {
        resolvePromise = resolve;
      });
      mockAdminFetch.mockReturnValue(pendingPromise);

      render(<CopyToTenantButton {...defaultProps} />);

      const button = screen.getByRole('button');
      await userEvent.click(button);

      expect(button).toBeDisabled();

      // Resolve the promise
      await act(async () => {
        resolvePromise!({
          ok: true,
          json: async () => ({ success: true }),
        } as Response);
      });
    });

    it('should disable button while loading', async () => {
      let resolvePromise: (value: Response) => void;
      const pendingPromise = new Promise<Response>((resolve) => {
        resolvePromise = resolve;
      });
      mockAdminFetch.mockReturnValue(pendingPromise);

      render(<CopyToTenantButton {...defaultProps} />);

      const button = screen.getByRole('button');
      await userEvent.click(button);

      expect(button).toBeDisabled();

      await act(async () => {
        resolvePromise!({
          ok: true,
          json: async () => ({ success: true }),
        } as Response);
      });
    });
  });

  describe('Success State', () => {
    it('should show success state after copy', async () => {
      mockAdminFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true }),
      } as Response);

      render(<CopyToTenantButton {...defaultProps} />);

      const button = screen.getByRole('button');
      await userEvent.click(button);

      // Success state is shown by a CheckCircle icon (green)
      await waitFor(() => {
        const btn = screen.getByRole('button');
        expect(btn.innerHTML).toContain('text-green-400');
      }, { timeout: 3000 });
    });
  });

  describe('Error State', () => {
    it('should show error state on copy failure', async () => {
      mockAdminFetch.mockResolvedValueOnce({
        ok: false,
      } as Response);

      render(<CopyToTenantButton {...defaultProps} />);

      const button = screen.getByRole('button');
      await userEvent.click(button);

      // Error state is shown by an AlertCircle icon (red)
      await waitFor(() => {
        expect(screen.getByRole('button').innerHTML).toContain('text-red-400');
      }, { timeout: 3000 });
    });
  });

  describe('Conflict Detection', () => {
    it('should show conflict modal when duplicate detected', async () => {
      const checkForConflict = jest.fn().mockResolvedValue({
        exists: true,
        targetId: 5,
        targetName: 'Existing Project',
        targetDescription: 'Existing description',
      });

      render(
        <CopyToTenantButton
          {...defaultProps}
          checkForConflict={checkForConflict}
        />
      );

      const button = screen.getByRole('button');
      await userEvent.click(button);

      await waitFor(() => {
        expect(screen.getByTestId('conflict-modal')).toBeInTheDocument();
      });
    });

    it('should not show conflict modal when no duplicate', async () => {
      const checkForConflict = jest.fn().mockResolvedValue({
        exists: false,
      });

      mockAdminFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true }),
      } as Response);

      render(
        <CopyToTenantButton
          {...defaultProps}
          checkForConflict={checkForConflict}
        />
      );

      const button = screen.getByRole('button');
      await userEvent.click(button);

      expect(screen.queryByTestId('conflict-modal')).not.toBeInTheDocument();
    });

    it('should call API with skip resolution when skip is clicked', async () => {
      const checkForConflict = jest.fn().mockResolvedValue({
        exists: true,
        targetId: 5,
        targetName: 'Existing Project',
      });

      render(
        <CopyToTenantButton
          {...defaultProps}
          checkForConflict={checkForConflict}
        />
      );

      const button = screen.getByRole('button');
      await userEvent.click(button);

      await waitFor(() => {
        expect(screen.getByTestId('conflict-modal')).toBeInTheDocument();
      });

      // Click skip
      const skipButton = screen.getByRole('button', { name: 'Skip' });
      await userEvent.click(skipButton);

      // Modal should close, no API call
      expect(screen.queryByTestId('conflict-modal')).not.toBeInTheDocument();
      expect(mockAdminFetch).not.toHaveBeenCalled();
    });

    it('should call API with replace resolution when replace is clicked', async () => {
      const checkForConflict = jest.fn().mockResolvedValue({
        exists: true,
        targetId: 5,
        targetName: 'Existing Project',
      });

      mockAdminFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true }),
      } as Response);

      render(
        <CopyToTenantButton
          {...defaultProps}
          checkForConflict={checkForConflict}
        />
      );

      const button = screen.getByRole('button');
      await userEvent.click(button);

      await waitFor(() => {
        expect(screen.getByTestId('conflict-modal')).toBeInTheDocument();
      });

      // Click replace
      const replaceButton = screen.getByRole('button', { name: 'Replace' });
      await userEvent.click(replaceButton);

      await waitFor(() => {
        expect(mockAdminFetch).toHaveBeenCalledWith('/api/admin/cross-tenant/copy', expect.objectContaining({
          body: expect.stringContaining('"conflictResolution":"replace"'),
        }));
      });
    });

    it('should call API with create-new resolution when create new is clicked', async () => {
      const checkForConflict = jest.fn().mockResolvedValue({
        exists: true,
        targetId: 5,
        targetName: 'Existing Project',
      });

      mockAdminFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true }),
      } as Response);

      render(
        <CopyToTenantButton
          {...defaultProps}
          checkForConflict={checkForConflict}
        />
      );

      const button = screen.getByRole('button');
      await userEvent.click(button);

      await waitFor(() => {
        expect(screen.getByTestId('conflict-modal')).toBeInTheDocument();
      });

      // Click create new
      const createNewButton = screen.getByRole('button', { name: 'Create New' });
      await userEvent.click(createNewButton);

      await waitFor(() => {
        expect(mockAdminFetch).toHaveBeenCalledWith('/api/admin/cross-tenant/copy', expect.objectContaining({
          body: expect.stringContaining('"conflictResolution":"create-new"'),
        }));
      });
    });

    it('should close modal when cancel is clicked', async () => {
      const checkForConflict = jest.fn().mockResolvedValue({
        exists: true,
        targetId: 5,
        targetName: 'Existing Project',
      });

      render(
        <CopyToTenantButton
          {...defaultProps}
          checkForConflict={checkForConflict}
        />
      );

      const button = screen.getByRole('button');
      await userEvent.click(button);

      await waitFor(() => {
        expect(screen.getByTestId('conflict-modal')).toBeInTheDocument();
      });

      // Click cancel
      const cancelButton = screen.getByRole('button', { name: 'Cancel' });
      await userEvent.click(cancelButton);

      expect(screen.queryByTestId('conflict-modal')).not.toBeInTheDocument();
    });
  });

  describe('Different Tenants', () => {
    it('should show correct target tenant when current is external', () => {
      mockGetCurrentTenant.mockReturnValue('external');

      render(<CopyToTenantButton {...defaultProps} showLabel />);

      expect(screen.getByText(/Copy to briantpm.com/i)).toBeInTheDocument();
    });
  });
});
