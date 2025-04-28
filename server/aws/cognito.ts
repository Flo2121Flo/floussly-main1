import {
  CognitoIdentityProviderClient,
  AdminCreateUserCommand,
  AdminSetUserPasswordCommand,
  AdminInitiateAuthCommand,
  AdminRespondToAuthChallengeCommand,
  AdminGetUserCommand,
  AdminUpdateUserAttributesCommand,
  AdminDeleteUserCommand,
  AdminConfirmSignUpCommand,
  AdminResetUserPasswordCommand,
  AdminSetUserMFAPreferenceCommand,
  AdminUpdateUserAttributesCommandInput,
  AdminGetUserCommandInput,
  AdminDeleteUserCommandInput,
  AdminCreateUserCommandInput,
  AdminSetUserPasswordCommandInput,
  AdminInitiateAuthCommandInput,
  AdminRespondToAuthChallengeCommandInput,
  AdminConfirmSignUpCommandInput,
  AdminResetUserPasswordCommandInput,
  AdminSetUserMFAPreferenceCommandInput
} from '@aws-sdk/client-cognito-identity-provider';
import { config } from '../config';

export class CognitoService {
  private static instance: CognitoService;
  private cognitoClient: CognitoIdentityProviderClient;

  private constructor() {
    this.cognitoClient = new CognitoIdentityProviderClient({
      region: config.aws.region,
      credentials: {
        accessKeyId: config.aws.accessKeyId,
        secretAccessKey: config.aws.secretAccessKey
      }
    });
  }

  public static getInstance(): CognitoService {
    if (!CognitoService.instance) {
      CognitoService.instance = new CognitoService();
    }
    return CognitoService.instance;
  }

  async createUser(email: string, password: string, attributes: Record<string, string> = {}): Promise<string> {
    const input: AdminCreateUserCommandInput = {
      UserPoolId: config.cognito.userPoolId,
      Username: email,
      UserAttributes: Object.entries(attributes).map(([Name, Value]) => ({ Name, Value })),
      MessageAction: 'SUPPRESS',
      TemporaryPassword: password
    };

    const command = new AdminCreateUserCommand(input);
    const response = await this.cognitoClient.send(command);
    return response.User?.Username || '';
  }

  async setUserPassword(username: string, password: string): Promise<void> {
    const input: AdminSetUserPasswordCommandInput = {
      UserPoolId: config.cognito.userPoolId,
      Username: username,
      Password: password,
      Permanent: true
    };

    const command = new AdminSetUserPasswordCommand(input);
    await this.cognitoClient.send(command);
  }

  async authenticateUser(username: string, password: string): Promise<{
    accessToken: string;
    refreshToken: string;
    idToken: string;
  }> {
    const input: AdminInitiateAuthCommandInput = {
      UserPoolId: config.cognito.userPoolId,
      ClientId: config.cognito.clientId,
      AuthFlow: 'ADMIN_USER_PASSWORD_AUTH',
      AuthParameters: {
        USERNAME: username,
        PASSWORD: password
      }
    };

    const command = new AdminInitiateAuthCommand(input);
    const response = await this.cognitoClient.send(command);

    if (!response.AuthenticationResult) {
      throw new Error('Authentication failed');
    }

    return {
      accessToken: response.AuthenticationResult.AccessToken || '',
      refreshToken: response.AuthenticationResult.RefreshToken || '',
      idToken: response.AuthenticationResult.IdToken || ''
    };
  }

  async respondToAuthChallenge(
    username: string,
    session: string,
    challengeName: string,
    challengeResponses: Record<string, string>
  ): Promise<{
    accessToken: string;
    refreshToken: string;
    idToken: string;
  }> {
    const input: AdminRespondToAuthChallengeCommandInput = {
      UserPoolId: config.cognito.userPoolId,
      ClientId: config.cognito.clientId,
      ChallengeName: challengeName,
      Session: session,
      ChallengeResponses: challengeResponses
    };

    const command = new AdminRespondToAuthChallengeCommand(input);
    const response = await this.cognitoClient.send(command);

    if (!response.AuthenticationResult) {
      throw new Error('Challenge response failed');
    }

    return {
      accessToken: response.AuthenticationResult.AccessToken || '',
      refreshToken: response.AuthenticationResult.RefreshToken || '',
      idToken: response.AuthenticationResult.IdToken || ''
    };
  }

  async getUser(username: string): Promise<Record<string, string>> {
    const input: AdminGetUserCommandInput = {
      UserPoolId: config.cognito.userPoolId,
      Username: username
    };

    const command = new AdminGetUserCommand(input);
    const response = await this.cognitoClient.send(command);

    const attributes: Record<string, string> = {};
    response.UserAttributes?.forEach(attr => {
      if (attr.Name && attr.Value) {
        attributes[attr.Name] = attr.Value;
      }
    });

    return attributes;
  }

  async updateUserAttributes(username: string, attributes: Record<string, string>): Promise<void> {
    const input: AdminUpdateUserAttributesCommandInput = {
      UserPoolId: config.cognito.userPoolId,
      Username: username,
      UserAttributes: Object.entries(attributes).map(([Name, Value]) => ({ Name, Value }))
    };

    const command = new AdminUpdateUserAttributesCommand(input);
    await this.cognitoClient.send(command);
  }

  async deleteUser(username: string): Promise<void> {
    const input: AdminDeleteUserCommandInput = {
      UserPoolId: config.cognito.userPoolId,
      Username: username
    };

    const command = new AdminDeleteUserCommand(input);
    await this.cognitoClient.send(command);
  }

  async confirmSignUp(username: string): Promise<void> {
    const input: AdminConfirmSignUpCommandInput = {
      UserPoolId: config.cognito.userPoolId,
      Username: username
    };

    const command = new AdminConfirmSignUpCommand(input);
    await this.cognitoClient.send(command);
  }

  async resetUserPassword(username: string): Promise<void> {
    const input: AdminResetUserPasswordCommandInput = {
      UserPoolId: config.cognito.userPoolId,
      Username: username
    };

    const command = new AdminResetUserPasswordCommand(input);
    await this.cognitoClient.send(command);
  }

  async setUserMfaPreference(
    username: string,
    smsMfaSettings?: { enabled: boolean; preferred: boolean },
    softwareTokenMfaSettings?: { enabled: boolean; preferred: boolean }
  ): Promise<void> {
    const input: AdminSetUserMFAPreferenceCommandInput = {
      UserPoolId: config.cognito.userPoolId,
      Username: username,
      SMSMfaSettings: smsMfaSettings,
      SoftwareTokenMfaSettings: softwareTokenMfaSettings
    };

    const command = new AdminSetUserMFAPreferenceCommand(input);
    await this.cognitoClient.send(command);
  }
} 