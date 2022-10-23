import type { Fetcher } from '@remix-run/react';
import { useActionData } from '@remix-run/react';
import { useTransition } from '@remix-run/react';
import { useEffect, useRef, useState } from 'react';

export type FormStateData = {
  form: {
    state: 'success' | 'error';
    error: string | null;
  };
};

type FormState = 'idle' | 'submitting' | 'succeeded' | 'failed';

/**
 * Global transition state of the app
 * @param resetMs How long to wait before resetting the form state to idle
 */
export function useFormState(resetMs: number | 'never' = 5000) {
  const transition = useTransition();
  const data = useActionData<FormStateData>();
  const initState =
    transition.state === 'submitting'
      ? 'submitting'
      : transition.state === 'idle' && data?.form.state === 'error'
      ? 'failed'
      : transition.state === 'idle' && data?.form.state === 'success'
      ? 'succeeded'
      : 'idle';
  const [state, setState] = useState<FormState>(initState);

  /**
   * useEffect only to set timeout to reset the form state to idle
   * (enhance the experience with JavaScript)
   */
  useEffect(() => {
    let timeout: number;
    if (resetMs !== 'never' && state === 'succeeded') {
      timeout = window.setTimeout(() => setState('idle'), resetMs);
    }
    return () => {
      window.clearTimeout(timeout);
    };
  }, [state, resetMs]);

  return {
    state,
    isLoading: transition.state === 'submitting' || transition.state === 'loading',
    isSubmitting: state === 'submitting',
    hasSucceeded: state === 'succeeded',
    hasFailed: state === 'failed',
  };
}

/**
 * Fetcher-scoped transition state
 * @param fetcher The fetcher to use
 * @param resetMs How long to wait before resetting the form state to idle
 */
export function useFetcherState(fetcher: Fetcher<FormStateData>, resetMs: number | 'never' = 5000) {
  const initState =
    fetcher.state === 'submitting'
      ? 'submitting'
      : fetcher.state === 'idle' && fetcher.data?.form.state === 'error'
      ? 'failed'
      : fetcher.state === 'idle' && fetcher.data?.form.state === 'success'
      ? 'succeeded'
      : 'idle';
  const [state, setState] = useState<FormState>(initState);

  /**
   * useEffect only to set timeout to reset the form state to idle
   * (enhance the experience with JavaScript)
   */
  useEffect(() => {
    let timeout: number;
    if (resetMs !== 'never' && state === 'succeeded') {
      timeout = window.setTimeout(() => setState('idle'), resetMs);
    }
    return () => {
      window.clearTimeout(timeout);
    };
  }, [state, resetMs]);

  return {
    state,
    isLoading: fetcher.state === 'submitting' || fetcher.state === 'loading',
    isSubmitting: state === 'submitting',
    hasSucceeded: state === 'succeeded',
    hasFailed: state === 'failed',
  };
}

export function toFormStateData(errorMessage?: string): FormStateData {
  return {
    form: {
      state: errorMessage ? 'error' : 'success',
      error: errorMessage || null,
    },
  };
}
