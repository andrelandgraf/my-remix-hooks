import { useMemo } from 'react';

/**
 * Use this function to deserialize generic data from the server.
 * A create alternative is to use remix-typedjson (https://github.com/kiliman/remix-typedjson).
 * @param {Object} value The value to deserialize
 * @returns
 */
export function useDeserialize<T extends object>(value: SerializeObject<T>): T {
  return useMemo(() => deserialize(value), [value]);
}

/**
 * Generic deserializer for data from the server.
 * Will parse `createdAt` and `updatedAt` fields to Date objects.
 * @param obj
 * @returns
 */
export function deserialize<T extends object>(obj: SerializeObject<T>): T {
  if (!obj || typeof obj !== 'object') return obj;
  if (Array.isArray(obj)) return obj.map(deserialize) as unknown as T;
  const newObj: any = {};
  for (const key of Object.keys(obj)) {
    const value = (obj as any)[key];
    if (typeof value === 'object') {
      newObj[key] = deserialize(value);
    } else {
      if (key === 'createdAt') {
        newObj[key] = new Date(value);
      } else if (key === 'updatedAt') {
        newObj[key] = new Date(value);
      } else {
        newObj[key] = value;
      }
    }
  }
  return newObj;
}

/**
 * Copied from the Remix Repository:
 */

// type-fest Merge start
type OmitIndexSignature<ObjectType> = {
  // eslint-disable-next-line @typescript-eslint/ban-types
  [KeyType in keyof ObjectType as {} extends Record<KeyType, unknown> ? never : KeyType]: ObjectType[KeyType];
};
type PickIndexSignature<ObjectType> = {
  // eslint-disable-next-line @typescript-eslint/ban-types
  [KeyType in keyof ObjectType as {} extends Record<KeyType, unknown> ? KeyType : never]: ObjectType[KeyType];
};
type Simplify<T> = { [KeyType in keyof T]: T[KeyType] };
type RequiredFilter<Type, Key extends keyof Type> = undefined extends Type[Key]
  ? Type[Key] extends undefined
    ? Key
    : never
  : Key;
type OptionalFilter<Type, Key extends keyof Type> = undefined extends Type[Key]
  ? Type[Key] extends undefined
    ? never
    : Key
  : never;
type EnforceOptional<ObjectType> = Simplify<
  {
    [Key in keyof ObjectType as RequiredFilter<ObjectType, Key>]: ObjectType[Key];
  } & {
    [Key in keyof ObjectType as OptionalFilter<ObjectType, Key>]?: Exclude<ObjectType[Key], undefined>;
  }
>;
type SimpleMerge<Destination, Source> = {
  [Key in keyof Destination | keyof Source]: Key extends keyof Source
    ? Source[Key]
    : Key extends keyof Destination
    ? Destination[Key]
    : never;
};
type Merge<Destination, Source> = EnforceOptional<
  SimpleMerge<PickIndexSignature<Destination>, PickIndexSignature<Source>> &
    SimpleMerge<OmitIndexSignature<Destination>, OmitIndexSignature<Source>>
>;
// type-fest Merge end

type JsonPrimitive = string | number | boolean | string | number | boolean | null;
// eslint-disable-next-line @typescript-eslint/ban-types
type NonJsonPrimitive = undefined | Function | symbol;

/*
 * `any` is the only type that can let you equate `0` with `1`
 * See https://stackoverflow.com/a/49928360/1490091
 */
type IsAny<T> = 0 extends 1 & T ? true : false;

// prettier-ignore
type Serialize<T> =
   IsAny<T> extends true ? any :
   T extends JsonPrimitive ? T :
   T extends NonJsonPrimitive ? never :
   T extends { toJSON(): infer U } ? U :
   T extends [] ? [] :
   T extends [unknown, ...unknown[]] ? SerializeTuple<T> :
   T extends ReadonlyArray<infer U> ? (U extends NonJsonPrimitive ? null : Serialize<U>)[] :
   T extends object ? SerializeObject<UndefinedToOptional<T>> :
   never;

/** JSON serialize [tuples](https://www.typescriptlang.org/docs/handbook/2/objects.html#tuple-types) */
type SerializeTuple<T extends [unknown, ...unknown[]]> = {
  [k in keyof T]: T[k] extends NonJsonPrimitive ? null : Serialize<T[k]>;
};

/** JSON serialize objects (not including arrays) and classes */
export type SerializeObject<T extends object> = {
  [k in keyof T as T[k] extends NonJsonPrimitive ? never : k]: Serialize<T[k]>;
};

/*
 * For an object T, if it has any properties that are a union with `undefined`,
 * make those into optional properties instead.
 *
 * Example: { a: string | undefined} --> { a?: string}
 */
type UndefinedToOptional<T extends object> = Merge<
  {
    // Property is not a union with `undefined`, keep as-is
    [k in keyof T as undefined extends T[k] ? never : k]: T[k];
  },
  {
    // Property _is_ a union with `defined`. Set as optional (via `?`) and remove `undefined` from the union
    [k in keyof T as undefined extends T[k] ? k : never]?: Exclude<T[k], undefined>;
  }
>;

type ArbitraryFunction = (...args: any[]) => unknown;

// must be a type since this is a subtype of response
// interfaces must conform to the types they extend
// eslint-disable-next-line @typescript-eslint/no-unnecessary-type-constraint
export type TypedResponse<T extends unknown = unknown> = Response & {
  json(): Promise<T>;
};

/**
 * Infer JSON serialized data type returned by a loader or action.
 *
 * For example:
 * `type LoaderData = SerializeFrom<typeof loader>`
 */
export type SerializeFrom<T extends any | ArbitraryFunction> = Serialize<
  T extends (...args: any[]) => infer Output
    ? Awaited<Output> extends TypedResponse<infer U>
      ? U
      : Awaited<Output>
    : Awaited<T>
>;
