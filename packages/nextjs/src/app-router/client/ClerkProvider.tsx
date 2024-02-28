'use client';
import { ClerkProvider as ReactClerkProvider } from '@clerk/clerk-react';
import { useRouter } from 'next/navigation';
import React from 'react';

import { ClerkNextOptionsProvider } from '../../client-boundary/NextOptionsContext';
import { useSafeLayoutEffect } from '../../client-boundary/useSafeLayoutEffect';
import type { NextClerkProviderProps } from '../../types';
import { mergeNextClerkPropsWithEnv } from '../../utils/mergeNextClerkPropsWithEnv';
import { invalidateCacheAction } from './invalidateCacheAction';
import { useAwaitableNavigate } from './useAwaitableNavigate';

declare global {
  export interface Window {
    __clerk_nav_await: Array<(value: void) => void>;
    __clerk_nav: (to: string) => Promise<void>;
  }
}

export const ClientClerkProvider = (props: NextClerkProviderProps) => {
  const { __unstable_invokeMiddlewareOnAuthStateChange = true } = props;
  const router = useRouter();
  const navigate = useAwaitableNavigate();

  useSafeLayoutEffect(() => {
    window.__unstable__onBeforeSetActive = () => {
      return invalidateCacheAction();
    };

    window.__unstable__onAfterSetActive = () => {
      if (__unstable_invokeMiddlewareOnAuthStateChange) {
        return router.refresh();
      }
    };
  }, []);

  const mergedProps = mergeNextClerkPropsWithEnv({ ...props, navigate });
  return (
    <ClerkNextOptionsProvider options={mergedProps}>
      {/*// @ts-ignore*/}
      <ReactClerkProvider {...mergedProps} />
    </ClerkNextOptionsProvider>
  );
};
