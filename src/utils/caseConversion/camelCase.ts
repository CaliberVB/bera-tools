/**
 * Converts a snake_case string to camelCase.
 * @param str The string to convert.
 * @returns The camelCase version of the string.
 */
export function toCamelCase(str: string): string {
  return str.replace(/([-_][a-z])/g, (group) => group.toUpperCase().replace('-', '').replace('_', ''))
}

/**
 * Converts all keys in an object from snake_case to camelCase.
 * This function works recursively on nested objects and arrays.
 * @param obj The object to convert.
 * @returns A new object with all keys converted to camelCase.
 */
export function convertToCamelCase<T extends object>(obj: T): CamelCaseKeys<T> {
  if (Array.isArray(obj)) {
    return obj.map(convertToCamelCase) as CamelCaseKeys<T>
  }

  if (typeof obj !== 'object' || obj === null) {
    return obj as CamelCaseKeys<T>
  }

  return Object.entries(obj).reduce((acc, [key, value]) => {
    const camelKey = toCamelCase(key) as keyof CamelCaseKeys<T>
    acc[camelKey] = convertToCamelCase(value)
    return acc
  }, {} as CamelCaseKeys<T>)
}

/**
 * Utility type to convert all keys in an object type from snake_case to camelCase.
 */
type CamelCaseKeys<T> =
  T extends Array<infer U>
    ? Array<CamelCaseKeys<U>>
    : T extends object
      ? { [K in keyof T as CamelCase<K & string>]: CamelCaseKeys<T[K]> }
      : T

/**
 * Utility type to convert a string type from snake_case to camelCase.
 */
type CamelCase<S extends string> = S extends `${infer P1}_${infer P2}${infer P3}`
  ? `${Lowercase<P1>}${Uppercase<P2>}${CamelCase<P3>}`
  : Lowercase<S>
