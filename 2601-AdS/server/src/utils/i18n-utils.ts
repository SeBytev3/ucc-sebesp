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
  const suffix = lng.charAt(0).toUpperCase() + lng.slice(1).toLowerCase(); // Es or En

  fields.forEach(field => {
    const localizedKey = `${field}${suffix}`;
    if (obj[localizedKey] !== undefined) {
      (result as any)[field] = obj[localizedKey];
    }
    
    // Clean up bilingual fields if desired, or just leave them
    delete (result as any)[`${field}Es`];
    delete (result as any)[`${field}En`];
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
