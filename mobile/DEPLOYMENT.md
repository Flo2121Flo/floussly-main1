# Floussly Mobile App Deployment Guide

## Prerequisites

1. **Development Environment Setup**
   - Node.js (v16 or later)
   - Xcode (for iOS development)
   - Android Studio (for Android development)
   - Expo CLI (`npm install -g expo-cli`)
   - EAS CLI (`npm install -g eas-cli`)

2. **Accounts Required**
   - Apple Developer Account ($99/year)
   - Google Play Developer Account ($25 one-time)
   - Expo Account (free)

## Initial Setup

1. **Install Dependencies**
   ```bash
   cd mobile
   npm install
   ```

2. **Configure Environment**
   - Copy `.env.example` to `.env`
   - Fill in required environment variables

3. **Configure App Signing**

   ### iOS
   - Generate certificates in Apple Developer Portal
   - Create provisioning profiles
   - Update `eas.json` with your Apple credentials

   ### Android
   - Generate keystore file
   - Create service account for Google Play Console
   - Update `eas.json` with your Android credentials

## Building the App

### Development Build
```bash
# iOS
eas build --profile development --platform ios

# Android
eas build --profile development --platform android
```

### Production Build
```bash
# iOS
eas build --profile production --platform ios

# Android
eas build --profile production --platform android
```

## Submitting to Stores

### App Store (iOS)
1. Create app in App Store Connect
2. Fill in app metadata
3. Upload screenshots and app preview
4. Submit for review:
   ```bash
   eas submit --platform ios
   ```

### Play Store (Android)
1. Create app in Google Play Console
2. Fill in store listing
3. Upload screenshots and app preview
4. Submit for review:
   ```bash
   eas submit --platform android
   ```

## Store Listing Requirements

### App Store
- App name: "Floussly"
- Subtitle: "Your Financial Freedom Partner"
- Description: [See below]
- Keywords: finance, money transfer, banking, mobile payment
- Support URL: https://floussly.com/support
- Marketing URL: https://floussly.com
- Privacy Policy URL: https://floussly.com/privacy

### Play Store
- App name: "Floussly"
- Short description: "Your Financial Freedom Partner"
- Full description: [See below]
- Category: Finance
- Content rating: Everyone
- Contact details: support@floussly.com

## App Descriptions

### App Store Description
```
Floussly is your all-in-one financial companion, making money management simple and secure.

Key Features:
• Fast & Secure Money Transfers
• Real-time Transaction Tracking
• Smart Financial Insights
• Group Savings (Daret & Tontine)
• QR Code Payments
• Agent Network
• Multi-language Support

Download Floussly today and experience financial freedom!
```

### Play Store Description
```
Floussly - Your Financial Freedom Partner

Transform your financial life with Floussly, the all-in-one mobile banking solution designed for modern users.

FEATURES:
• Instant Money Transfers
• Secure Transactions
• Financial Analytics
• Group Savings
• QR Payments
• Agent Network
• Multi-language Support

SECURITY:
• Biometric Authentication
• End-to-end Encryption
• Real-time Fraud Detection
• Secure Storage

Download now and join thousands of satisfied users!
```

## Asset Requirements

### App Icons
- iOS: 1024x1024 px
- Android: 512x512 px (adaptive icon)

### Screenshots
- iPhone: 6.5" Display (1290x2796 px)
- iPad: 12.9" Display (2048x2732 px)
- Android: Various sizes (see Play Console)

### App Preview
- 30-second video showcasing key features
- Resolution: 1920x1080 px
- Format: MP4

## Testing Checklist

1. **Functionality**
   - [ ] User registration/login
   - [ ] Money transfers
   - [ ] QR code scanning
   - [ ] Location services
   - [ ] Push notifications
   - [ ] Biometric authentication

2. **UI/UX**
   - [ ] All screens render correctly
   - [ ] Navigation works smoothly
   - [ ] Dark/light mode
   - [ ] Accessibility features
   - [ ] Loading states
   - [ ] Error handling

3. **Performance**
   - [ ] App launch time
   - [ ] Screen transitions
   - [ ] Memory usage
   - [ ] Battery consumption
   - [ ] Network requests

4. **Security**
   - [ ] Data encryption
   - [ ] Secure storage
   - [ ] API security
   - [ ] Input validation
   - [ ] Session management

## Troubleshooting

### Common Issues
1. **Build Failures**
   - Check EAS build logs
   - Verify credentials
   - Update dependencies

2. **Store Rejections**
   - Review guidelines
   - Check metadata
   - Test on multiple devices

3. **Performance Issues**
   - Profile app using React Native Performance Monitor
   - Check for memory leaks
   - Optimize images and assets

## Support

For deployment support:
- Email: dev@floussly.com
- Slack: #mobile-deployment
- Documentation: https://docs.floussly.com/mobile 