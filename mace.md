# Getting started with MACE's solver

_Codename Thallastra_

We're still working on a proper dev portal on this along with our SDK, but our API is now feature-complete enough to begin building upon.

## Currently deployed endpoints

- https://testnet.api.mace.ag/swaps/ v0.6.x
  - This endpoint always serves the latest version intended for public consumption
- https://testnet.api.beta.mace.ag/swaps/ v0.6.x (latest pre-release)
  - This endpoint may either serve the same version as prod, or the latest pre-release with a more stable configuration.
- https://testnet.api.alpha.mace.ag/swaps/ v0.6.x (latest pre-release)
  - This endpoints serves experimental and potentially unstable versions and configurations. We use this to conduct e2e integration tests and experiments.

## Breaking vs Non-breaking changes

We consider the following changes to be "breaking"

- Response objects properties having an incompatible change of type
  - For example, `number` to `string`.
  - This does not include objects having new properties added
- Response objects properties having a change of purpose
  - A number previously representing seconds now represents milliseconds
- Request objects requiring a new property
  - This does _not_ include the addition of new optional properties
- Request objects properties having a change of purpose
  - A number previously parsed as seconds is now parsed as milliseconds
- Request objects properties having an incompatible change of type
  - For example, `number` to `string`.
- Endpoints documented to _not_ require auth now requiring auth

We do _not_ consider the following changes to be "breaking"

- New error types being added or removed. Error variants should be considered "non-exhaustive"
  - While error types will always be `{ errorBacktrace?: string, errorMessage: string, errorKind: string | { [errorKind: string]: MaceError | object } }`, we may add or remove error types when internally restructuring our codebase. You may match against `errorKind`s as part of i18n efforts, but users of this API should always fall back to displaying the error message and all inner error messages as-is.

## Breaking changes

### v0.6.0 (pending)

- `/exchange-rate`
  - ignores the `amount` input
  - `minimum`, `median`, `maximum`, and `average` outputs are now 64-bit floats, representing a TWAP between the specified tokens, corrected by their decimals. e.g., if `2e18` of `tokenA` was swapped for `1e9` of `tokenB`, and `tokenA`'s decimals are 18 and `tokenB`'s decimals are 9, then the resulting price will be `0.5`.
  - Now returns a TWAP of the specified tokens instead of an aggregate quote price on all indexed exchanges
- `/exchange-amount` now serves similar functionality to that which `/exchange-rate` used to, but it is now based on the same TWAPs as used by `/exchange-rate`.
- Default gas price of `/get-best-routes` is now 1GWei instead of 0.1GWei

## Authentication

API key issuance is currently under development. For now, Thallastra is configured to accept any value in the `Authorization: Bearer` header. Authentication will be enforced on the production deploys 2 weeks after we start issuing API keys on the beta deploy. The alpha deploy is where we conduct our e2e experiments, so don't rely on it being consistent.

## Endpoint Documentation.

Every swaps endpoint has openapi documentation available at `/swaps/rapidoc`, so you can check out https://testnet.api.mace.ag/swaps/rapidoc for more information.

## Using our on-chain router

A 200 response from the `/get-best-routes` call maps 1:1 with the following partial interface of our contract. (GET `/router-address` for its address, which may change)

```sol
interface IMaceDexRouter {
    executeSwap(
        address inputToken, // May be 0x0...0 in the case of native token
        uint256 amountIn,
        uint256 amountOutMin,
        DexRouterLibrary.AdapterHops[] path,
        address recipient
    ) public payable
}
library DexRouterLibrary {
    // Structure for adapter hops
    struct AdapterHops {
        address adapter; // Address of the adapter
        Hop[] subPath; // Array of Hops representing the path
    }
    // Structure for individual swap hops
    struct Hop {
        address dexPair; // DEX pair address for the swap
        address outputToken; // Output token for this hop
        bytes extraCallData; // Additional call data for specific swaps
    }
}
```

While our solver can return multiple potential routes for a swap, using said multiple routes on-chain for a hybrid off/on chain solver solution is currently under development. Splitting input tokens into multiple routes to execute on-chain is also currently under development.
