import { 
  S3Client, 
  PutObjectCommand, 
  GetObjectCommand 
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { 
  CognitoIdentityProviderClient, 
  SignUpCommand,
  ConfirmSignUpCommand,
  InitiateAuthCommand,
  ForgotPasswordCommand,
  ConfirmForgotPasswordCommand
} from '@aws-sdk/client-cognito-identity-provider';

// AWS configuration
const region = import.meta.env.VITE_AWS_REGION || 'eu-west-1';
const s3Bucket = import.meta.env.VITE_S3_BUCKET_NAME || 'floussly-user-data';
const cognitoClientId = import.meta.env.VITE_COGNITO_CLIENT_ID || '';
const cognitoUserPoolId = import.meta.env.VITE_COGNITO_USER_POOL_ID || '';

// Initialize S3 client
const s3Client = new S3Client({
  region,
  credentials: {
    accessKeyId: import.meta.env.VITE_AWS_ACCESS_KEY_ID || '',
    secretAccessKey: import.meta.env.VITE_AWS_SECRET_ACCESS_KEY || '',
  }
});

// Initialize Cognito client
const cognitoClient = new CognitoIdentityProviderClient({
  region,
  credentials: {
    accessKeyId: import.meta.env.VITE_AWS_ACCESS_KEY_ID || '',
    secretAccessKey: import.meta.env.VITE_AWS_SECRET_ACCESS_KEY || '',
  }
});

/**
 * Upload a file to S3
 * @param file The file to upload
 * @param key The S3 key (path/filename)
 * @param contentType The MIME type of the file
 * @returns Promise with the S3 URL of the uploaded file
 */
export async function uploadToS3(file: File, key: string, contentType?: string): Promise<string> {
  try {
    if (!import.meta.env.VITE_AWS_ACCESS_KEY_ID || !import.meta.env.VITE_AWS_SECRET_ACCESS_KEY) {
      throw new Error('AWS credentials not configured');
    }

    // Create the S3 upload command
    const command = new PutObjectCommand({
      Bucket: s3Bucket,
      Key: key,
      Body: await file.arrayBuffer(),
      ContentType: contentType || file.type,
    });

    // Upload the file
    await s3Client.send(command);

    // Return the URL to the file
    return `https://${s3Bucket}.s3.${region}.amazonaws.com/${key}`;
  } catch (error) {
    console.error('Error uploading to S3:', error);
    throw error;
  }
}

/**
 * Get a presigned URL for a file in S3 (valid for a limited time)
 * @param key The S3 key (path/filename)
 * @param expiresIn Expiration time in seconds (default: 3600 seconds = 1 hour)
 * @returns Promise with the presigned URL
 */
export async function getPresignedUrl(key: string, expiresIn: number = 3600): Promise<string> {
  try {
    if (!import.meta.env.VITE_AWS_ACCESS_KEY_ID || !import.meta.env.VITE_AWS_SECRET_ACCESS_KEY) {
      throw new Error('AWS credentials not configured');
    }
    
    const command = new GetObjectCommand({
      Bucket: s3Bucket,
      Key: key,
    });

    // Generate presigned URL
    return await getSignedUrl(s3Client, command, { expiresIn });
  } catch (error) {
    console.error('Error generating presigned URL:', error);
    throw error;
  }
}

/**
 * Register a new user in Cognito
 * @param username Username (usually email or phone)
 * @param password User's password
 * @param attributes Additional user attributes (name, phone, etc.)
 * @returns Promise with the operation result
 */
export async function signUp(
  username: string, 
  password: string, 
  attributes: { [key: string]: string }
): Promise<any> {
  try {
    if (!cognitoClientId || !cognitoUserPoolId) {
      throw new Error('Cognito not configured');
    }

    // Format attributes for Cognito
    const userAttributes = Object.entries(attributes).map(([key, value]) => ({
      Name: key,
      Value: value
    }));
    
    const command = new SignUpCommand({
      ClientId: cognitoClientId,
      Username: username,
      Password: password,
      UserAttributes: userAttributes
    });
    
    return await cognitoClient.send(command);
  } catch (error) {
    console.error('Error signing up user:', error);
    throw error;
  }
}

/**
 * Confirm user registration with verification code
 * @param username Username (email or phone)
 * @param confirmationCode The verification code sent to the user
 * @returns Promise with operation result
 */
export async function confirmSignUp(username: string, confirmationCode: string): Promise<any> {
  try {
    if (!cognitoClientId) {
      throw new Error('Cognito not configured');
    }

    const command = new ConfirmSignUpCommand({
      ClientId: cognitoClientId,
      Username: username,
      ConfirmationCode: confirmationCode
    });
    
    return await cognitoClient.send(command);
  } catch (error) {
    console.error('Error confirming sign up:', error);
    throw error;
  }
}

/**
 * Authenticate a user against Cognito
 * @param username Username (email or phone)
 * @param password User's password
 * @returns Promise with auth tokens
 */
export async function signIn(username: string, password: string): Promise<any> {
  try {
    if (!cognitoClientId) {
      throw new Error('Cognito not configured');
    }

    const command = new InitiateAuthCommand({
      ClientId: cognitoClientId,
      AuthFlow: 'USER_PASSWORD_AUTH',
      AuthParameters: {
        USERNAME: username,
        PASSWORD: password
      }
    });
    
    return await cognitoClient.send(command);
  } catch (error) {
    console.error('Error signing in:', error);
    throw error;
  }
}

/**
 * Initiate the password reset flow
 * @param username Username (email or phone)
 * @returns Promise with operation result
 */
export async function forgotPassword(username: string): Promise<any> {
  try {
    if (!cognitoClientId) {
      throw new Error('Cognito not configured');
    }

    const command = new ForgotPasswordCommand({
      ClientId: cognitoClientId,
      Username: username
    });
    
    return await cognitoClient.send(command);
  } catch (error) {
    console.error('Error initiating password reset:', error);
    throw error;
  }
}

/**
 * Complete the password reset with verification code
 * @param username Username (email or phone)
 * @param confirmationCode The verification code sent to the user
 * @param newPassword The new password
 * @returns Promise with operation result
 */
export async function confirmForgotPassword(
  username: string, 
  confirmationCode: string, 
  newPassword: string
): Promise<any> {
  try {
    if (!cognitoClientId) {
      throw new Error('Cognito not configured');
    }

    const command = new ConfirmForgotPasswordCommand({
      ClientId: cognitoClientId,
      Username: username,
      ConfirmationCode: confirmationCode,
      Password: newPassword
    });
    
    return await cognitoClient.send(command);
  } catch (error) {
    console.error('Error confirming password reset:', error);
    throw error;
  }
}

// Function to check if AWS credentials are configured
export function isAwsConfigured(): boolean {
  return !!(
    import.meta.env.VITE_AWS_ACCESS_KEY_ID && 
    import.meta.env.VITE_AWS_SECRET_ACCESS_KEY
  );
}

// Function to check if Cognito is configured
export function isCognitoConfigured(): boolean {
  return !!(cognitoClientId && cognitoUserPoolId);
}