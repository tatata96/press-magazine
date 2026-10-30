import {adminGraphQL} from "./admin-client";

type AccessScopesData = {
  currentAppInstallation: {accessScopes: {handle: string}[]};
};

// Read-only check that authentication works. Returns scope handles only, no store data.
export async function verifyAccessScopes(): Promise<string[]> {
  const data = await adminGraphQL<AccessScopesData>(`
    query {
      currentAppInstallation {
        accessScopes {
          handle
        }
      }
    }
  `);

  return data.currentAppInstallation.accessScopes.map((scope) => scope.handle);
}
