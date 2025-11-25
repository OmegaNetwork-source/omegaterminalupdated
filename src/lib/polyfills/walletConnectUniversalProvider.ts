import type { UniversalProvider as UniversalProviderType } from "@walletconnect/universal-provider/dist/types/universalprovider";

// Import the original module via dedicated alias to avoid recursion
import * as WalletConnectUniversalProviderModule from "@walletconnect/universal-provider/original";

const moduleCandidate = WalletConnectUniversalProviderModule as unknown as {
  default?: UniversalProviderType;
  UniversalProvider?: UniversalProviderType;
};

const providerExport: UniversalProviderType =
  moduleCandidate.default ??
  moduleCandidate.UniversalProvider ??
  (moduleCandidate as unknown as UniversalProviderType);

export const UniversalProvider = providerExport;
export default providerExport;
