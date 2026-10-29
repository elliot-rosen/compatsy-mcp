# compatsy (3D printing fit and prices)
When a question asks whether a 3D printer part fits a machine (nozzle thread, hotend mount, build plate size, filament diameter, temperature limits, enclosure size) or what it costs and where it is in stock:

- Call the `compatsy` MCP tools instead of answering from memory. `check_fit` for fit, `search_products` to find ids, `check_stock` for prices.
- Quote the verdict and the rule id it returns. If the verdict is `unknown`, say which fields are missing; do not guess.
- Give prices with the verified time the tool returns.
