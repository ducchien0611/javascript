import type {
  AuthenticationResponseJSON,
  ExperimentalPublicKeyCredentialWithAuthenticatorAttestationResponse,
  PublicKeyCredentialCreationOptionsJSON,
} from '@clerk/types';

import ClerkExpoPasskeys from './ClerkExpoPasskeysModule';

export class IosPasskeys {
  public static async create(credentials: PublicKeyCredentialCreationOptionsJSON) {
    try {
      const response = await ClerkExpoPasskeys.create(
        credentials.challenge,
        credentials.rp.id,
        credentials.user.id,
        credentials.user.displayName,
      );
      return IosPasskeys.parseCreateResult(response);
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  private static parseCreateResult(result: any): ExperimentalPublicKeyCredentialWithAuthenticatorAttestationResponse {
    return {
      id: result.credentialID,
      rawId: result.credentialID,
      type: 'public-key',
      response: {
        clientDataJSON: result.response.rawClientDataJSON,
        attestationObject: result.response.rawAttestationObject,
        transports: [],
      },
      authenticatorAttachment: 'platform',
    };
  }

  public static async get(credentials: any) {
    try {
      const response = await ClerkExpoPasskeys.get(
        credentials.challenge,
        credentials.rpId,
        credentials.allowCredentials?.map(({ id }: { id: string }) => id) ?? [],
      );
      return IosPasskeys.parseAuthenticationResult(response);
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  private static parseAuthenticationResult(result: any): AuthenticationResponseJSON {
    return {
      id: result.credentialID,
      rawId: result.credentialID,
      type: 'public-key',
      response: {
        clientDataJSON: result.response.rawClientDataJSON,
        authenticatorData: result.response.rawAuthenticatorData,
        signature: result.response.signature,
        userHandle: result.userID,
      },
    };
  }
}
