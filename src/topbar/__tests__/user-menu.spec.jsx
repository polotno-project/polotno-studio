import React from 'react';
import { act, fireEvent, render, screen } from '@testing-library/react';
import { UserMenu } from '../user-menu';
import { useProject } from '../../project';

vi.mock('../../project', () => ({
  useProject: vi.fn(),
}));

window.puter = {
  auth: {
    getUser: vi.fn().mockResolvedValue({ username: 'testuser' }),
    signOut: vi.fn(),
  },
};

async function openPopUp() {
  const opoUpButton = screen.getByRole('button', { 'aria-haspopup': 'menu' });

  await act(async () => fireEvent.click(opoUpButton));
}

describe('UserMenu component', () => {
  it('should render login button when cloud is disabled', async () => {
    useProject.mockReturnValue({ cloudEnabled: false, signIn: vi.fn() });

    render(<UserMenu />);
    await openPopUp();

    const loginButton = screen.getByText('Login');
    expect(loginButton).toBeInTheDocument();
  });

  it('should display user info when cloud is enabled', async () => {
    useProject.mockReturnValue({ cloudEnabled: true });

    render(<UserMenu />);
    await openPopUp();

    const userInfo = await screen.findByText(/logged as testuser/i);
    expect(userInfo).toBeInTheDocument();
  });

  it('should call signOut on logout click when cloud is enabled', async () => {
    useProject.mockReturnValue({ cloudEnabled: true });

    render(<UserMenu />);
    await openPopUp();

    const logoutButton = await screen.findByRole('menuitem', {
      name: /logout/i,
    });
    fireEvent.click(logoutButton);

    expect(window.puter.auth.signOut).toHaveBeenCalled();
  });
});
