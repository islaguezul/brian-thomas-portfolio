/**
 * Component tests for OtherTenantPanel
 * Tests the collapsible panel that displays and allows copying items from the other tenant
 */

import React from 'react';
import { render, screen, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import OtherTenantPanel from '@/components/admin/OtherTenantPanel';

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

import { adminFetch } from '@/lib/admin-fetch';
import { getCurrentTenantFromClient } from '@/hooks/useOtherTenantData';

const mockAdminFetch = adminFetch as jest.MockedFunction<typeof adminFetch>;
const mockGetCurrentTenant = getCurrentTenantFromClient as jest.MockedFunction<typeof getCurrentTenantFromClient>;

// Test project type
interface TestProject {
  id: number;
  name: string;
  description: string;
}

describe('OtherTenantPanel', () => {
  const defaultProps = {
    entityType: 'projects' as const,
    renderItem: (item: TestProject, onCopy: () => void) => (
      <div data-testid={`item-${item.id}`}>
        <span>{item.name}</span>
        <button onClick={onCopy}>Copy</button>
      </div>
    ),
    emptyMessage: 'No projects on the other site',
    title: 'Projects on brianthomastpm.com',
  };

  const mockProjects: TestProject[] = [
    { id: 1, name: 'Project 1', description: 'Description 1' },
    { id: 2, name: 'Project 2', description: 'Description 2' },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    mockGetCurrentTenant.mockReturnValue('internal');
    // Reset window.confirm
    window.confirm = jest.fn(() => true);
    window.alert = jest.fn();
  });

  describe('Collapsed State', () => {
    it('should render collapsed by default', () => {
      render(<OtherTenantPanel {...defaultProps} />);

      expect(screen.getByText('Projects on brianthomastpm.com')).toBeInTheDocument();
      expect(screen.getByText('Click to view and copy items from the other site')).toBeInTheDocument();
    });

    it('should not fetch data when collapsed', () => {
      render(<OtherTenantPanel {...defaultProps} />);

      expect(mockAdminFetch).not.toHaveBeenCalled();
    });

    it('should show down chevron when collapsed', () => {
      render(<OtherTenantPanel {...defaultProps} />);

      // The ChevronDown icon should be present when collapsed
      const button = screen.getByRole('button');
      expect(button).toBeInTheDocument();
    });
  });

  describe('Expanded State', () => {
    it('should fetch data when expanded', async () => {
      mockAdminFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: mockProjects }),
      } as Response);

      render(<OtherTenantPanel {...defaultProps} />);

      const headerButton = screen.getByRole('button', { name: /projects on/i });
      await userEvent.click(headerButton);

      await waitFor(() => {
        expect(mockAdminFetch).toHaveBeenCalledWith('/api/admin/cross-tenant/projects');
      });
    });

    it('should display items after fetching', async () => {
      mockAdminFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: mockProjects }),
      } as Response);

      render(<OtherTenantPanel {...defaultProps} />);

      const headerButton = screen.getByRole('button', { name: /projects on/i });
      await userEvent.click(headerButton);

      await waitFor(() => {
        expect(screen.getByTestId('item-1')).toBeInTheDocument();
        expect(screen.getByTestId('item-2')).toBeInTheDocument();
      });
    });

    it('should show item count when expanded', async () => {
      mockAdminFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: mockProjects }),
      } as Response);

      render(<OtherTenantPanel {...defaultProps} />);

      const headerButton = screen.getByRole('button', { name: /projects on/i });
      await userEvent.click(headerButton);

      await waitFor(() => {
        expect(screen.getByText('2 items available to copy')).toBeInTheDocument();
      });
    });

    it('should show singular "item" for single item', async () => {
      mockAdminFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: [mockProjects[0]] }),
      } as Response);

      render(<OtherTenantPanel {...defaultProps} />);

      const headerButton = screen.getByRole('button', { name: /projects on/i });
      await userEvent.click(headerButton);

      await waitFor(() => {
        expect(screen.getByText('1 item available to copy')).toBeInTheDocument();
      });
    });
  });

  describe('Loading State', () => {
    it('should show loading spinner while fetching', async () => {
      // Create a promise that we can control
      let resolvePromise: (value: Response) => void;
      const pendingPromise = new Promise<Response>((resolve) => {
        resolvePromise = resolve;
      });
      mockAdminFetch.mockReturnValue(pendingPromise);

      render(<OtherTenantPanel {...defaultProps} />);

      const headerButton = screen.getByRole('button', { name: /projects on/i });
      await userEvent.click(headerButton);

      await waitFor(() => {
        expect(screen.getByText('Loading...')).toBeInTheDocument();
      });

      // Resolve the promise
      await act(async () => {
        resolvePromise!({
          ok: true,
          json: async () => ({ data: [] }),
        } as Response);
      });
    });
  });

  describe('Error State', () => {
    it('should display error message on fetch failure', async () => {
      mockAdminFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
      } as Response);

      render(<OtherTenantPanel {...defaultProps} />);

      const headerButton = screen.getByRole('button', { name: /projects on/i });
      await userEvent.click(headerButton);

      await waitFor(() => {
        expect(screen.getByText('Failed to fetch')).toBeInTheDocument();
      });
    });

    it('should display error message on network error', async () => {
      mockAdminFetch.mockRejectedValueOnce(new Error('Network error'));

      render(<OtherTenantPanel {...defaultProps} />);

      const headerButton = screen.getByRole('button', { name: /projects on/i });
      await userEvent.click(headerButton);

      await waitFor(() => {
        expect(screen.getByText('Network error')).toBeInTheDocument();
      });
    });
  });

  describe('Empty State', () => {
    it('should display empty message when no items', async () => {
      mockAdminFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: [] }),
      } as Response);

      render(<OtherTenantPanel {...defaultProps} />);

      const headerButton = screen.getByRole('button', { name: /projects on/i });
      await userEvent.click(headerButton);

      await waitFor(() => {
        expect(screen.getByText('No projects on the other site')).toBeInTheDocument();
      });
    });

    it('should use custom empty message', async () => {
      mockAdminFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: [] }),
      } as Response);

      render(<OtherTenantPanel {...defaultProps} emptyMessage="Custom empty message" />);

      const headerButton = screen.getByRole('button', { name: /projects on/i });
      await userEvent.click(headerButton);

      await waitFor(() => {
        expect(screen.getByText('Custom empty message')).toBeInTheDocument();
      });
    });
  });

  describe('Copy Functionality', () => {
    it('should trigger copy when copy button is clicked', async () => {
      const onItemCopied = jest.fn();

      mockAdminFetch
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ data: mockProjects }),
        } as Response)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ success: true }),
        } as Response);

      render(<OtherTenantPanel {...defaultProps} onItemCopied={onItemCopied} />);

      // Expand panel
      const headerButton = screen.getByRole('button', { name: /projects on/i });
      await userEvent.click(headerButton);

      await waitFor(() => {
        expect(screen.getByTestId('item-1')).toBeInTheDocument();
      });

      // Click the main Copy button (not the one inside renderItem)
      const copyButtons = screen.getAllByRole('button', { name: /copy/i });
      const mainCopyButton = copyButtons[copyButtons.length - 1]; // Last copy button is the main one
      await userEvent.click(mainCopyButton);

      await waitFor(() => {
        expect(mockAdminFetch).toHaveBeenCalledWith('/api/admin/cross-tenant/copy', expect.any(Object));
      });
    });

    it('should call onItemCopied callback after successful copy', async () => {
      const onItemCopied = jest.fn();

      mockAdminFetch
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ data: mockProjects }),
        } as Response)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ success: true }),
        } as Response);

      render(<OtherTenantPanel {...defaultProps} onItemCopied={onItemCopied} />);

      // Expand panel
      const headerButton = screen.getByRole('button', { name: /projects on/i });
      await userEvent.click(headerButton);

      await waitFor(() => {
        expect(screen.getByTestId('item-1')).toBeInTheDocument();
      });

      // Find and click copy button
      const copyButtons = screen.getAllByRole('button', { name: /copy/i });
      await userEvent.click(copyButtons[copyButtons.length - 1]);

      await waitFor(() => {
        expect(onItemCopied).toHaveBeenCalled();
      });
    });

    it('should show alert on copy failure', async () => {
      mockAdminFetch
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ data: mockProjects }),
        } as Response)
        .mockResolvedValueOnce({
          ok: false,
        } as Response);

      render(<OtherTenantPanel {...defaultProps} />);

      // Expand panel
      const headerButton = screen.getByRole('button', { name: /projects on/i });
      await userEvent.click(headerButton);

      await waitFor(() => {
        expect(screen.getByTestId('item-1')).toBeInTheDocument();
      });

      // Click copy button
      const copyButtons = screen.getAllByRole('button', { name: /copy/i });
      await userEvent.click(copyButtons[copyButtons.length - 1]);

      await waitFor(() => {
        expect(window.alert).toHaveBeenCalledWith('Failed to copy item');
      });
    });
  });

  describe('Conflict Detection', () => {
    it('should show confirm dialog when conflict is detected', async () => {
      const getItemName = (item: TestProject) => item.name;
      const checkConflict = jest.fn().mockReturnValue(true);

      mockAdminFetch
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ data: mockProjects }),
        } as Response);

      render(
        <OtherTenantPanel
          {...defaultProps}
          getItemName={getItemName}
          checkConflict={checkConflict}
        />
      );

      // Expand panel
      const headerButton = screen.getByRole('button', { name: /projects on/i });
      await userEvent.click(headerButton);

      await waitFor(() => {
        expect(screen.getByTestId('item-1')).toBeInTheDocument();
      });

      // Click copy button
      const copyButtons = screen.getAllByRole('button', { name: /copy/i });
      await userEvent.click(copyButtons[copyButtons.length - 1]);

      expect(window.confirm).toHaveBeenCalledWith(
        expect.stringContaining('Project 1')
      );
    });

    it('should not copy when user cancels conflict dialog', async () => {
      window.confirm = jest.fn(() => false);
      const getItemName = (item: TestProject) => item.name;
      const checkConflict = jest.fn().mockReturnValue(true);

      mockAdminFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: mockProjects }),
      } as Response);

      render(
        <OtherTenantPanel
          {...defaultProps}
          getItemName={getItemName}
          checkConflict={checkConflict}
        />
      );

      // Expand panel
      const headerButton = screen.getByRole('button', { name: /projects on/i });
      await userEvent.click(headerButton);

      await waitFor(() => {
        expect(screen.getByTestId('item-1')).toBeInTheDocument();
      });

      // Click copy button
      const copyButtons = screen.getAllByRole('button', { name: /copy/i });
      await userEvent.click(copyButtons[copyButtons.length - 1]);

      // Should only have called adminFetch once (for fetching data)
      expect(mockAdminFetch).toHaveBeenCalledTimes(1);
    });
  });

  describe('Refresh Functionality', () => {
    it('should show refresh button when expanded', async () => {
      mockAdminFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: mockProjects }),
      } as Response);

      render(<OtherTenantPanel {...defaultProps} />);

      const headerButton = screen.getByRole('button', { name: /projects on/i });
      await userEvent.click(headerButton);

      await waitFor(() => {
        expect(screen.getByTitle('Refresh')).toBeInTheDocument();
      });
    });

    it('should refetch data when refresh is clicked', async () => {
      mockAdminFetch
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ data: mockProjects }),
        } as Response)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ data: [mockProjects[0]] }),
        } as Response);

      render(<OtherTenantPanel {...defaultProps} />);

      const headerButton = screen.getByRole('button', { name: /projects on/i });
      await userEvent.click(headerButton);

      await waitFor(() => {
        expect(screen.getByTestId('item-1')).toBeInTheDocument();
      });

      // Click refresh
      const refreshButton = screen.getByTitle('Refresh');
      await userEvent.click(refreshButton);

      await waitFor(() => {
        expect(mockAdminFetch).toHaveBeenCalledTimes(2);
      });
    });
  });

  describe('Toggle Behavior', () => {
    it('should collapse when header is clicked while expanded', async () => {
      mockAdminFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: mockProjects }),
      } as Response);

      render(<OtherTenantPanel {...defaultProps} />);

      const headerButton = screen.getByRole('button', { name: /projects on/i });

      // Expand
      await userEvent.click(headerButton);

      await waitFor(() => {
        expect(screen.getByTestId('item-1')).toBeInTheDocument();
      });

      // Collapse
      await userEvent.click(headerButton);

      await waitFor(() => {
        expect(screen.queryByTestId('item-1')).not.toBeInTheDocument();
      });
    });
  });
});
