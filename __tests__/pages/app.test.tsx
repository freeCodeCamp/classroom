import type React from 'react';
import type { AppProps } from 'next/app';
import type { Session } from 'next-auth';
import MyApp from '../../pages/_app';
import DisplayNotification from '../../components/displayNotification';
import { fireEvent, render, screen } from '@testing-library/react';

function NotifyButton(): React.JSX.Element {
  return (
    <button onClick={() => DisplayNotification('Success', 'Class saved')}>
      Save
    </button>
  );
}

const appProps = {
  Component: NotifyButton,
  pageProps: { session: null }
} as unknown as AppProps<{ session?: Session | null }>;

describe('MyApp', () => {
  it('shows a notification in the app toast container', async () => {
    render(<MyApp {...appProps} />);

    fireEvent.click(screen.getByRole('button', { name: 'Save' }));

    expect(await screen.findByText('Class saved')).toBeInTheDocument();
  });
});
