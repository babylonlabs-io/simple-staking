/**
 * Fetches a Keybase profile picture URL based on a Keybase identity.
 * This function fetches the image URL from the Keybase API.
 *
 * @param keybaseId The Keybase identity (e.g., "EF5AC70C00BECEDC")
 * @returns A Promise that resolves to the image URL or null if not found
 */
export async function fetchKeybaseImageUrl(
  keybaseId: string,
): Promise<string | null> {
  if (!keybaseId) return null;

  try {
    const response = await fetch(
      `https://keybase.io/_/api/1.0/user/lookup.json?key_suffix=${keybaseId}&fields=pictures`,
      { mode: "cors" },
    );

    if (response.ok) {
      const data = await response.json();

      if (
        data.status.code === 0 &&
        data.them &&
        data.them.length > 0 &&
        data.them[0].pictures?.primary?.url
      ) {
        return data.them[0].pictures.primary.url;
      }
    }

    return null;
  } catch (error) {
    console.error("Error fetching Keybase image:", error);
    return null;
  }
}
