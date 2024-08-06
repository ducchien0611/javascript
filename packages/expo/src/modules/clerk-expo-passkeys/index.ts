import type {
  AuthenticationResponseJSON,
  ExperimentalPublicKeyCredentialWithAuthenticatorAttestationResponse,
  PublicKeyCredentialCreationOptionsJSON,
  PublicKeyCredentialRequestOptionsJSON,
} from '@clerk/types';
import { Platform } from 'react-native';

import { AndroidPasskeys } from './src/AndroidPasskeys';
// Import the native module. On web, it will be resolved to ClerkExpoPasskeys.web.ts
// and on native platforms to ClerkExpoPasskeys.ts
import { IosPasskeys } from './src/IOSPasskeys';

export async function create(
  credentials: PublicKeyCredentialCreationOptionsJSON,
): Promise<ExperimentalPublicKeyCredentialWithAuthenticatorAttestationResponse | null> {
  if (Platform.OS === 'android') {
    return AndroidPasskeys.create(credentials);
  } else if (Platform.OS === 'ios') {
    return IosPasskeys.create(credentials);
  } else {
    throw new Error('Not supoorted');
  }
}

export async function get(
  credentials: PublicKeyCredentialRequestOptionsJSON,
): Promise<AuthenticationResponseJSON | null> {
  if (Platform.OS === 'android') {
    return AndroidPasskeys.get(credentials);
  } else if (Platform.OS === 'ios') {
    return IosPasskeys.get(credentials);
  } else {
    throw new Error('Not supoorted');
  }
}
