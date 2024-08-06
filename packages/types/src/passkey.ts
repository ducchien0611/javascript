import type { DeletedObjectResource } from './deletedObject';
import type { PasskeyJSON } from './json';
import type { ClerkResource } from './resource';
import type { SnakeToCamel } from './utils';
import type { PasskeyVerificationResource } from './verification';

type UpdatePasskeyJSON = Pick<PasskeyJSON, 'name'>;

export type UpdatePasskeyParams = Partial<SnakeToCamel<UpdatePasskeyJSON>>;

export interface PasskeyResource extends ClerkResource {
  id: string;
  name: string | null;
  verification: PasskeyVerificationResource | null;
  lastUsedAt: Date | null;
  updatedAt: Date;
  createdAt: Date;

  update: (params: UpdatePasskeyParams) => Promise<PasskeyResource>;
  delete: () => Promise<DeletedObjectResource>;
}

export type PublicKeyCredentialCreationOptionsWithoutExtensions = Omit<
  Required<PublicKeyCredentialCreationOptions>,
  'extensions'
>;

export type PublicKeyCredentialRequestOptionsWithoutExtensions = Omit<
  Required<PublicKeyCredentialRequestOptions>,
  'extensions'
>;

export type PublicKeyCredentialWithAuthenticatorAttestationResponse = Omit<
  PublicKeyCredential,
  'response' | 'getClientExtensionResults'
> & {
  response: Omit<AuthenticatorAttestationResponse, 'getAuthenticatorData' | 'getPublicKey' | 'getPublicKeyAlgorithm'>;
};

export type PublicKeyCredentialWithAuthenticatorAssertionResponse = Omit<
  PublicKeyCredential,
  'response' | 'getClientExtensionResults'
> & {
  response: AuthenticatorAssertionResponse;
};

// Those types are being used from expo apps
export type ExperimentalPublicKeyCredentialWithAuthenticatorAttestationResponse = {
  type: string;
  id: string;
  rawId: string;
  authenticatorAttachment: string | null;
  response: {
    clientDataJSON: string;
    attestationObject: string;
    transports: string[];
  };
};

export interface AuthenticatorAssertionResponseJSON {
  clientDataJSON: string;
  authenticatorData: string;
  signature: string;
  userHandle?: string;
}

export interface AuthenticationResponseJSON {
  id: string;
  rawId: string;
  response: AuthenticatorAssertionResponseJSON;
  authenticatorAttachment?: AuthenticatorAttachment;
  clientExtensionResults?: AuthenticationExtensionsClientOutputs;
  type: PublicKeyCredentialType;
}
