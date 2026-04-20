# Lessons Learned

## Testing & Mocking
- **Prisma Mocking**: Switched from manual mocks to `jest-mock-extended` using the `prismaMock` pattern. This provides much better type safety and deep mocking capabilities for complex service logic.
- **Import Order**: Discovered that `prismaMock` MUST be imported before the service being tested to ensure the `prisma` singleton is properly mocked before the service module initializes.
- **Decimal Types**: Prisma `Decimal` fields in mocks require explicit casting or using `new Prisma.Decimal()` to avoid TypeScript errors in tests.

## Internationalization (i18n)
- **Database Localization**: Created a `localize` utility in `src/utils/i18n-utils.ts` to dry up the logic of selecting `*Es` or `*En` fields from database results based on the request language.
- **JWT Integration**: Storing the language preference (`lng`) directly in the JWT payload avoids a database lookup on every request while still allowing the backend to serve translated error messages and content automatically.

## API Documentation
- **Swagger as Source of Truth**: Using JSDoc comments (`swagger-jsdoc`) keeps documentation close to the code, but requires discipline to keep schemas in `swagger.ts` synced with Prisma models.
- **Type Safety**: The build process (`tsc`) revealed several hidden bugs in controllers (missing property checks, incorrect type casts) while setting up Swagger, proving the value of strict type checking even in "documentation" tasks.
