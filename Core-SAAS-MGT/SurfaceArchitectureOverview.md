                 ┌────────────────────┐
                 │ Queens Applications │
                 └─────────┬──────────┘
                           │
                    API Gateway Layer
                           │
          ┌────────────────┴────────────────┐
          │                                 │
 ┌────────▼────────┐              ┌────────▼────────┐
 │ Reward Engine   │              │ Wallet Service  │
 │ (Off-chain)     │              │ Custody Layer   │
 └────────┬────────┘              └────────┬────────┘
          │                                 │
          └──────────────┬──────────────────┘
                         │
              Blockchain Settlement Layer
                         │
         ┌───────────────┼────────────────┐
         │               │                │
      Token Mint     Smart Contracts   Treasury
         │               │                │
         └───────────────┴────────────────┘
                         │
                  Public Blockchain