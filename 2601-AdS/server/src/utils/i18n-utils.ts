/**
 * Localizes an object by picking the correct fields based on the language.
 * Convention: fields ending in Es/En (e.g., nameEs, nameEn)
 */
export function localize<T extends Record<string, any>>(
  obj: T,
  lng: string,
  fields: string[]
): any {
  const result = { ...obj };
  const lowerLng = lng.slice(0, 2).toLowerCase(); // 'es' or 'en'
  const capitalizedLng = lowerLng.charAt(0).toUpperCase() + lowerLng.slice(1); // 'Es' or 'En'

  fields.forEach(field => {
    const keyWithCap = `${field}${capitalizedLng}`;
    const keyWithLower = `${field}${lowerLng}`;
    
    if (obj[keyWithCap] !== undefined) {
      (result as any)[field] = obj[keyWithCap];
    } else if (obj[keyWithLower] !== undefined) {
      (result as any)[field] = obj[keyWithLower];
    }

    // Remove source fields to avoid cluttering the response
    delete (result as any)[`${field}Es`];
    delete (result as any)[`${field}En`];
    delete (result as any)[`${field}es`];
    delete (result as any)[`${field}en`];
  });

  return result;
}

/**
 * Localizes an array of objects.
 */
export function localizeArray<T extends Record<string, any>>(
  arr: T[],
  lng: string,
  fields: string[]
): any[] {
  return arr.map(obj => localize(obj, lng, fields));
}
