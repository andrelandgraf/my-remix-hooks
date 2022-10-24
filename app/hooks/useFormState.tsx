import { Fetcher, useFetcher } from '@remix-run/react';
import { useActionData } from '@remix-run/react';
import { useTransition } from '@remix-run/react';
import { useEffect, useState } from 'react';

export type FormStateData = {
  form: {
    state: 'success' | 'error';
    error: string | null;
  };
};

type FormState = 'idle' | 'submitting' | 'succeeded' | 'failed';

type TransitionState = ReturnType<typeof useTransition>['state'] | ReturnType<typeof useFetcher>['state'];
type TransitionType = ReturnType<typeof useTransition>['type'] | ReturnType<typeof useFetcher>['type'];

function getFormState(
  transitionState: TransitionState,
  transitionType: TransitionType,
  actionData: FormStateData | undefined,
): FormState {
  return transitionState === 'submitting' || (transitionState === 'loading' && transitionType === 'actionReload')
    ? 'submitting'
    : transitionState === 'idle' && actionData?.form.state === 'error'
    ? 'failed'
    : transitionState === 'idle' && actionData?.form.state === 'success'
    ? 'succeeded'
    : 'idle';
}

function useStateHelper(
  transitionState: TransitionState,
  transitionType: TransitionType,
  actionData: FormStateData | undefined,
  resetMs: number | 'never' = 5000,
) {
  const initState = getFormState(transitionState, transitionType, actionData);
  const [state, setState] = useState<FormState>(initState);

  /**
   * useEffect to sync transition state with local state
   */
  useEffect(() => {
    setState(getFormState(transitionState, transitionType, actionData));
  }, [transitionState, transitionType, actionData]);

  /**
   * useEffect to set timeout to reset the form state to idle
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
    isSubmitting: state === 'submitting',
    hasSucceeded: state === 'succeeded',
    hasFailed: state === 'failed',
  };
}

/**
 * Global transition state of the app
 * @param resetMs How long to wait before resetting the form state to idle
 */
export function useFormState(resetMs: number | 'never' = 5000) {
  const transition = useTransition();
  const data = useActionData<FormStateData>();
  return useStateHelper(transition.state, transition.type, data, resetMs);
}

/**
 * Fetcher-scoped transition state
 * @param fetcher The fetcher to use
 * @param resetMs How long to wait before resetting the form state to idle
 */
export function useFetcherState(fetcher: Fetcher<FormStateData>, resetMs: number | 'never' = 5000) {
  return useStateHelper(fetcher.state, fetcher.type, fetcher.data, resetMs);
}

export function toFormStateData(errorMessage?: string): FormStateData {
  return {
    form: {
      state: errorMessage ? 'error' : 'success',
      error: errorMessage || null,
    },
  };
}
