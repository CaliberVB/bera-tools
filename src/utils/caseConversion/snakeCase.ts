/**
 * Converts a camelCase or PascalCase string to snake_case.
 * @param str The string to convert.
 * @returns The snake_case version of the string.
 */
export function toSnakeCase(str: string): string {
  return str
    .replace(/([A-Z])/g, '_$1')
    .toLowerCase()
    .replace(/^_/, '')
}

/**
 * Converts all keys in an object from camelCase to snake_case.
 * This function works recursively on nested objects and arrays.
 * @param obj The object to convert.
 * @returns A new object with all keys converted to snake_case.
 */
export function convertToSnakeCase<T extends object>(obj: T): SnakeCaseKeys<T> {
  if (Array.isArray(obj)) {
    return obj.map(convertToSnakeCase) as SnakeCaseKeys<T>
  }

  if (typeof obj !== 'object' || obj === null) {
    return obj as SnakeCaseKeys<T>
  }

  return Object.entries(obj).reduce((acc, [key, value]) => {
    const snakeKey = toSnakeCase(key) as keyof SnakeCaseKeys<T>
    acc[snakeKey] = convertToSnakeCase(value)
    return acc
  }, {} as SnakeCaseKeys<T>)
}

/**
 * Utility type to convert all keys in an object type from camelCase to snake_case.
 */
type SnakeCaseKeys<T> =
  T extends Array<infer U>
    ? Array<SnakeCaseKeys<U>>
    : T extends object
      ? { [K in keyof T as SnakeCase<K & string>]: SnakeCaseKeys<T[K]> }
      : T

/**
 * Utility type to convert a string type from camelCase to snake_case.
 */
type SnakeCase<S extends string> = S extends `${infer T}${infer U}`
  ? U extends Uncapitalize<U>
    ? `${Lowercase<T>}${SnakeCase<U>}`
    : `${Lowercase<T>}_${SnakeCase<U>}`
  : S
