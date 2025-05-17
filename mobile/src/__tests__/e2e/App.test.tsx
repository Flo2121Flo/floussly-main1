import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { NavigationContainer } from '@react-navigation/native';
import App from '../../App';

describe('App E2E Tests', () => {
  it('renders splash screen and navigates to login', async () => {
    const { getByTestId, getByText } = render(
      <NavigationContainer>
        <App />
      </NavigationContainer>
    );

    // Check if splash screen is rendered
    expect(getByTestId('splash-screen')).toBeTruthy();

    // Wait for splash screen to disappear
    await waitFor(() => {
      expect(getByTestId('login-screen')).toBeTruthy();
    });
  });

  it('handles login flow correctly', async () => {
    const { getByTestId, getByText } = render(
      <NavigationContainer>
        <App />
      </NavigationContainer>
    );

    // Wait for login screen
    await waitFor(() => {
      expect(getByTestId('login-screen')).toBeTruthy();
    });

    // Fill in login form
    fireEvent.changeText(getByTestId('email-input'), 'test@example.com');
    fireEvent.changeText(getByTestId('password-input'), 'password123');

    // Submit login form
    fireEvent.press(getByTestId('login-button'));

    // Wait for dashboard
    await waitFor(() => {
      expect(getByTestId('dashboard-screen')).toBeTruthy();
    });
  });

  it('handles money transfer flow', async () => {
    const { getByTestId, getByText } = render(
      <NavigationContainer>
        <App />
      </NavigationContainer>
    );

    // Wait for dashboard
    await waitFor(() => {
      expect(getByTestId('dashboard-screen')).toBeTruthy();
    });

    // Navigate to send money
    fireEvent.press(getByTestId('send-money-button'));

    // Fill transfer form
    fireEvent.changeText(getByTestId('recipient-input'), '1234567890');
    fireEvent.changeText(getByTestId('amount-input'), '100');
    fireEvent.changeText(getByTestId('description-input'), 'Test transfer');

    // Submit transfer
    fireEvent.press(getByTestId('confirm-transfer-button'));

    // Wait for success message
    await waitFor(() => {
      expect(getByText('Transfer successful')).toBeTruthy();
    });
  });

  it('handles QR code scanning', async () => {
    const { getByTestId } = render(
      <NavigationContainer>
        <App />
      </NavigationContainer>
    );

    // Wait for dashboard
    await waitFor(() => {
      expect(getByTestId('dashboard-screen')).toBeTruthy();
    });

    // Navigate to QR scanner
    fireEvent.press(getByTestId('scan-qr-button'));

    // Check if camera permission is requested
    await waitFor(() => {
      expect(getByTestId('camera-permission-dialog')).toBeTruthy();
    });

    // Mock camera permission granted
    fireEvent.press(getByTestId('grant-permission-button'));

    // Check if camera is initialized
    await waitFor(() => {
      expect(getByTestId('camera-view')).toBeTruthy();
    });
  });

  it('handles profile settings', async () => {
    const { getByTestId, getByText } = render(
      <NavigationContainer>
        <App />
      </NavigationContainer>
    );

    // Wait for dashboard
    await waitFor(() => {
      expect(getByTestId('dashboard-screen')).toBeTruthy();
    });

    // Navigate to profile
    fireEvent.press(getByTestId('profile-button'));

    // Check if profile screen is loaded
    await waitFor(() => {
      expect(getByTestId('profile-screen')).toBeTruthy();
    });

    // Update profile information
    fireEvent.changeText(getByTestId('name-input'), 'John Doe');
    fireEvent.changeText(getByTestId('phone-input'), '+1234567890');

    // Save changes
    fireEvent.press(getByTestId('save-profile-button'));

    // Check for success message
    await waitFor(() => {
      expect(getByText('Profile updated successfully')).toBeTruthy();
    });
  });
}); 