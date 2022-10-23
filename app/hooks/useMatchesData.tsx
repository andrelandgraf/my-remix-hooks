import { useMatches } from '@remix-run/react';

/**
 * Similar to useRouteData from remix-utils (https://github.com/sergiodxa/remix-utils#useroutedata)
 * Instead of using the route id to query the data, it just uses the property key of the object you query.
 * Update: Easier to use and won't break if you change the route that returns the data.
 * Downside: Will fail if you have multiple routes that return data with the same key.
 * @param {string} key The key of the data you want to query
 * @returns
 */
export function useMatchesData(key: string) {
  const routeModules = useMatches();
  const route = routeModules.find((route) => route.data && route.data[key] !== undefined);
  return route?.data[key];
}
