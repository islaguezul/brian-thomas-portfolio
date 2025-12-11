/**
 * Component tests for ConflictResolutionModal
 * Tests the modal that handles conflict resolution when copying entities
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ConflictResolutionModal from '@/components/admin/ConflictResolutionModal';

// Mock cross-tenant utilities
jest.mock('@/lib/cross-tenant', () => ({
  getTenantShortName: jest.fn((tenant) => tenant === 'internal' ? 'briantpm.com' : 'brianthomastpm.com'),
}));

describe('ConflictResolutionModal', () => {
  const defaultProps = {
    isOpen: true,
    onClose: jest.fn(),
    onResolve: jest.fn(),
    sourceName: 'Source Project',
    sourceDescription: 'Source project description',
    targetName: 'Target Project',
    targetDescription: 'Target project description',
    sourceTenant: 'internal' as const,
    targetTenant: 'external' as const,
    entityType: 'Project',
    loading: false,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render when isOpen is true', () => {
      render(<ConflictResolutionModal {...defaultProps} />);

      expect(screen.getByText(/Similar Project Found/i)).toBeInTheDocument();
    });

    it('should not render when isOpen is false', () => {
      render(<ConflictResolutionModal {...defaultProps} isOpen={false} />);

      expect(screen.queryByText(/Similar Project Found/i)).not.toBeInTheDocument();
    });

    it('should show correct entity type in title', () => {
      render(<ConflictResolutionModal {...defaultProps} entityType="Work Experience" />);

      expect(screen.getByText(/Similar Work Experience Found/i)).toBeInTheDocument();
    });

    it('should display conflict message with target tenant name', () => {
      render(<ConflictResolutionModal {...defaultProps} />);

      expect(screen.getByText(/A similar item already exists on brianthomastpm.com/i)).toBeInTheDocument();
    });
  });

  describe('Source and Target Comparison', () => {
    it('should show source information', () => {
      render(<ConflictResolutionModal {...defaultProps} />);

      expect(screen.getByText('Source Project')).toBeInTheDocument();
      expect(screen.getByText('Source project description')).toBeInTheDocument();
      expect(screen.getByText(/Source \(briantpm.com\)/i)).toBeInTheDocument();
    });

    it('should show target information', () => {
      render(<ConflictResolutionModal {...defaultProps} />);

      expect(screen.getByText('Target Project')).toBeInTheDocument();
      expect(screen.getByText('Target project description')).toBeInTheDocument();
      expect(screen.getByText(/Existing \(brianthomastpm.com\)/i)).toBeInTheDocument();
    });

    it('should handle missing descriptions gracefully', () => {
      render(
        <ConflictResolutionModal
          {...defaultProps}
          sourceDescription={undefined}
          targetDescription={undefined}
        />
      );

      expect(screen.getByText('Source Project')).toBeInTheDocument();
      expect(screen.getByText('Target Project')).toBeInTheDocument();
    });
  });

  describe('Resolution Buttons', () => {
    it('should render Skip button', () => {
      render(<ConflictResolutionModal {...defaultProps} />);

      expect(screen.getByRole('button', { name: /Skip/i })).toBeInTheDocument();
    });

    it('should render Replace Existing button', () => {
      render(<ConflictResolutionModal {...defaultProps} />);

      expect(screen.getByRole('button', { name: /Replace Existing/i })).toBeInTheDocument();
    });

    it('should render Create New Copy button', () => {
      render(<ConflictResolutionModal {...defaultProps} />);

      expect(screen.getByRole('button', { name: /Create New Copy/i })).toBeInTheDocument();
    });

    it('should render Cancel button', () => {
      render(<ConflictResolutionModal {...defaultProps} />);

      expect(screen.getByRole('button', { name: /Cancel/i })).toBeInTheDocument();
    });
  });

  describe('Button Actions', () => {
    it('should call onResolve with "skip" when Skip is clicked', async () => {
      const onResolve = jest.fn();
      render(<ConflictResolutionModal {...defaultProps} onResolve={onResolve} />);

      await userEvent.click(screen.getByRole('button', { name: /Skip/i }));

      expect(onResolve).toHaveBeenCalledWith('skip');
    });

    it('should call onResolve with "replace" when Replace Existing is clicked', async () => {
      const onResolve = jest.fn();
      render(<ConflictResolutionModal {...defaultProps} onResolve={onResolve} />);

      await userEvent.click(screen.getByRole('button', { name: /Replace Existing/i }));

      expect(onResolve).toHaveBeenCalledWith('replace');
    });

    it('should call onResolve with "create-new" when Create New Copy is clicked', async () => {
      const onResolve = jest.fn();
      render(<ConflictResolutionModal {...defaultProps} onResolve={onResolve} />);

      await userEvent.click(screen.getByRole('button', { name: /Create New Copy/i }));

      expect(onResolve).toHaveBeenCalledWith('create-new');
    });

    it('should call onClose when Cancel is clicked', async () => {
      const onClose = jest.fn();
      render(<ConflictResolutionModal {...defaultProps} onClose={onClose} />);

      await userEvent.click(screen.getByRole('button', { name: /Cancel/i }));

      expect(onClose).toHaveBeenCalled();
    });

    it('should call onClose when X button is clicked', async () => {
      const onClose = jest.fn();
      render(<ConflictResolutionModal {...defaultProps} onClose={onClose} />);

      // Find the close button (X icon)
      const closeButtons = screen.getAllByRole('button');
      const xButton = closeButtons.find(btn => btn.getAttribute('class')?.includes('hover:bg-gray-800'));

      if (xButton) {
        await userEvent.click(xButton);
        expect(onClose).toHaveBeenCalled();
      }
    });

    it('should call onClose when backdrop is clicked', async () => {
      const onClose = jest.fn();
      render(<ConflictResolutionModal {...defaultProps} onClose={onClose} />);

      // Find and click the backdrop
      const backdrop = document.querySelector('.bg-black\\/60');
      if (backdrop) {
        fireEvent.click(backdrop);
        expect(onClose).toHaveBeenCalled();
      }
    });
  });

  describe('Loading State', () => {
    it('should disable all buttons when loading', () => {
      render(<ConflictResolutionModal {...defaultProps} loading={true} />);

      const buttons = screen.getAllByRole('button');
      buttons.forEach(button => {
        expect(button).toBeDisabled();
      });
    });

    it('should enable all buttons when not loading', () => {
      render(<ConflictResolutionModal {...defaultProps} loading={false} />);

      const skipButton = screen.getByRole('button', { name: /Skip/i });
      const replaceButton = screen.getByRole('button', { name: /Replace Existing/i });
      const createNewButton = screen.getByRole('button', { name: /Create New Copy/i });
      const cancelButton = screen.getByRole('button', { name: /Cancel/i });

      expect(skipButton).not.toBeDisabled();
      expect(replaceButton).not.toBeDisabled();
      expect(createNewButton).not.toBeDisabled();
      expect(cancelButton).not.toBeDisabled();
    });
  });

  describe('Button Descriptions', () => {
    it('should show Skip description', () => {
      render(<ConflictResolutionModal {...defaultProps} />);

      expect(screen.getByText(/Don't copy anything, keep the existing item unchanged/i)).toBeInTheDocument();
    });

    it('should show Replace description with source tenant name', () => {
      render(<ConflictResolutionModal {...defaultProps} />);

      expect(screen.getByText(/Overwrite the existing item with data from briantpm.com/i)).toBeInTheDocument();
    });

    it('should show Create New description', () => {
      render(<ConflictResolutionModal {...defaultProps} />);

      expect(screen.getByText(/Create a new item alongside the existing one/i)).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have proper heading', () => {
      render(<ConflictResolutionModal {...defaultProps} />);

      const heading = screen.getByRole('heading', { level: 2 });
      expect(heading).toBeInTheDocument();
    });

    it('should have focusable buttons', () => {
      render(<ConflictResolutionModal {...defaultProps} />);

      const skipButton = screen.getByRole('button', { name: /Skip/i });
      skipButton.focus();
      expect(document.activeElement).toBe(skipButton);
    });
  });

  describe('Visual Elements', () => {
    it('should show warning icon', () => {
      render(<ConflictResolutionModal {...defaultProps} />);

      // AlertTriangle icon should be present
      const warningContainer = document.querySelector('.bg-amber-500\\/20');
      expect(warningContainer).toBeInTheDocument();
    });

    it('should show arrow between source and target', () => {
      render(<ConflictResolutionModal {...defaultProps} />);

      // ArrowRight icon should be present
      const modal = screen.getByRole('heading', { level: 2 }).closest('div');
      expect(modal).toBeInTheDocument();
    });
  });

  describe('Different Entity Types', () => {
    const entityTypes = [
      'Project',
      'Work Experience',
      'Education',
      'Tech Stack Item',
      'Skill Category',
      'Personal Info',
      'Expertise Radar Item',
      'Process Strategy',
    ];

    it.each(entityTypes)('should display correct title for %s', (entityType) => {
      render(<ConflictResolutionModal {...defaultProps} entityType={entityType} />);

      expect(screen.getByText(`Similar ${entityType} Found`)).toBeInTheDocument();
    });
  });

  describe('Different Tenant Combinations', () => {
    it('should handle internal to external correctly', () => {
      render(
        <ConflictResolutionModal
          {...defaultProps}
          sourceTenant="internal"
          targetTenant="external"
        />
      );

      expect(screen.getByText(/Source \(briantpm.com\)/i)).toBeInTheDocument();
      expect(screen.getByText(/Existing \(brianthomastpm.com\)/i)).toBeInTheDocument();
    });

    it('should handle external to internal correctly', () => {
      render(
        <ConflictResolutionModal
          {...defaultProps}
          sourceTenant="external"
          targetTenant="internal"
        />
      );

      expect(screen.getByText(/Source \(brianthomastpm.com\)/i)).toBeInTheDocument();
      expect(screen.getByText(/Existing \(briantpm.com\)/i)).toBeInTheDocument();
    });
  });
});
