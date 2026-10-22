import { fireEvent, render, screen } from '@testing-library/react';
import { signIn } from 'next-auth/react';
import SignInPage from '../../pages/signin';

vi.mock('next-auth/react', () => ({ signIn: vi.fn() }));
vi.mock('../../components/navbar', () => ({ default: () => <nav /> }));

const renderSignIn = (props = {}) =>
  render(
    <SignInPage devLogin callbackUrl='/classes' error={null} {...props} />
  );

describe('development sign in', () => {
  beforeEach(() => vi.clearAllMocks());

  it('explains local sign in and selects the seeded teacher by default', () => {
    renderSignIn();

    expect(screen.getByText('Local development only')).toBeVisible();
    expect(screen.getByRole('radio', { name: 'Teacher' })).toBeChecked();
    expect(screen.getByLabelText('Email')).toHaveValue(
      'teacher@classroom.local'
    );
    const form = screen
      .getByRole('button', { name: 'Sign in' })
      .closest('form');
    expect(form).toHaveAttribute('method', 'post');
    expect(form).toHaveAttribute('action', '/api/auth/dev-login');
    expect(form).toHaveFormValues({ callbackUrl: '/classes' });
    expect(signIn).not.toHaveBeenCalled();
  });

  it.each(['Admin', 'Teacher', 'Student'])(
    'uses the selected %s account email',
    role => {
      renderSignIn();

      fireEvent.click(screen.getByRole('radio', { name: role }));

      expect(screen.getByRole('radio', { name: role })).toBeChecked();
      expect(screen.getByLabelText('Email')).toHaveValue(
        `${role.toLowerCase()}@classroom.local`
      );
    }
  );

  it('allows a custom email without leaving a seeded role selected', () => {
    renderSignIn();

    fireEvent.change(screen.getByLabelText('Email'), {
      target: { value: 'new@classroom.local' }
    });

    expect(screen.getByLabelText('Email')).toHaveValue('new@classroom.local');
    expect(
      screen
        .getAllByRole('radio')
        .every(radio => !(radio as HTMLInputElement).checked)
    ).toBe(true);
    expect(
      screen.getByText('A new email creates a local user with no role.')
    ).toBeVisible();
  });

  it('announces a sign in error while keeping the form available', () => {
    renderSignIn({ error: 'AccessDenied' });

    expect(screen.getByRole('alert')).toHaveTextContent(
      'Sign in did not complete (AccessDenied).'
    );
    expect(screen.getByLabelText('Email')).toBeVisible();
  });

  it('keeps the Auth0 redirect when development sign in is disabled', () => {
    renderSignIn({ devLogin: false });

    expect(screen.queryByRole('radio')).not.toBeInTheDocument();
    expect(signIn).toHaveBeenCalledWith('auth0', { callbackUrl: '/classes' });
  });

  it('offers an Auth0 retry after an error outside development', () => {
    renderSignIn({ devLogin: false, error: 'AccessDenied' });
    expect(signIn).not.toHaveBeenCalled();

    fireEvent.click(screen.getByRole('button', { name: 'Try again' }));

    expect(signIn).toHaveBeenCalledWith('auth0', { callbackUrl: '/classes' });
  });
});
