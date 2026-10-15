import MyApp from '../../pages/_app';
import DisplayNotification from '../../components/displayNotification';
import { fireEvent, render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';

function NotifyButton() {
  return (
    <button onClick={() => DisplayNotification('Success', 'Class saved')}>
      Save
    </button>
  );
}

describe('MyApp', () => {
  it('shows a notification in the app toast container', async () => {
    render(<MyApp Component={NotifyButton} pageProps={{ session: null }} />);

    fireEvent.click(screen.getByRole('button', { name: 'Save' }));

    expect(await screen.findByText('Class saved')).toBeInTheDocument();
  });
});
