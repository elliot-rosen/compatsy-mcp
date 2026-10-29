# compatsy-mcp

[compatsy](https://compatsy.com/) answers "does this part fit that machine, and where is it in stock?" Each category has its own MCP endpoint:

| Category | Covers | Endpoint |
|---|---|---|
| 3D printing | printers, nozzles, hotends, build plates, filament, enclosures | `https://compatsy.com/3d-printing/mcp` |
| Home espresso | machines, tampers, puck screens, distribution tools, dosing funnels, baskets | `https://compatsy.com/home-espresso/mcp` |

Specs carry their source and confidence, fit verdicts cite the rule that decided them, and prices come with the time they were last verified.

This repo is the quickstart for the hosted MCP server. Nothing runs locally except an optional stdio bridge.

## Connect

**Remote (preferred).** Any client that supports Streamable HTTP:

```json
{ "mcpServers": { "compatsy-3d-printing": { "url": "https://compatsy.com/3d-printing/mcp" } } }
```

**stdio via npx.** For clients that only launch local servers:

```json
{ "mcpServers": { "compatsy-espresso": { "command": "npx", "args": ["-y", "github:elliot-rosen/compatsy-mcp"], "env": { "COMPATSY_MCP_URL": "https://compatsy.com/home-espresso/mcp" } } } }
```

Claude Code: `claude mcp add --transport http compatsy-3d-printing https://compatsy.com/3d-printing/mcp`

No account or key. Calls are rate limited per session. The bridge defaults to `https://compatsy.com/mcp` (3D printing); set `COMPATSY_MCP_URL` to another endpoint from the table.

## Tools

| Tool | What it does | Read-only |
|---|---|---|
| `search_products` | Find products by name or category plus spec filters | yes |
| `get_product` | Full specs with source and confidence, every offer with verified time | yes |
| `compare` | Side-by-side spec table for 2 to 10 products | yes |
| `check_fit` | Verdict for a part and a machine, with the rule id and version, or the missing fields | yes |
| `check_stock` | Price and availability per merchant, re-verified when over an hour old | yes |
| `report_issue` | Flag a wrong spec, price or verdict. Reports never edit facts | no |

## Example calls

```json
{"name": "search_products", "arguments": {"query": "hardened nozzle 0.4", "category": "nozzle", "limit": 5}}
{"name": "get_product", "arguments": {"product_id": "prusa-mk4s"}}
{"name": "compare", "arguments": {"product_ids": ["bambu-lab-p1s", "prusa-core-one"]}}
{"name": "check_fit", "arguments": {"subject_id": "<nozzle id from search_products>", "target_id": "prusa-mk4s"}}
{"name": "check_stock", "arguments": {"product_id": "prusa-mk4s"}}
{"name": "report_issue", "arguments": {"entity_type": "product", "entity_id": "prusa-mk4s", "field": "nozzle_thread", "claim": "MK4S uses the Nextruder thread"}}
```

Example prompts that use them well:

- "Will a V6 nozzle fit my Prusa MK4S? If it needs an adapter, say which."
- "Which hardened 0.6 mm nozzles fit a Bambu Lab P1S, cheapest in stock first?"
- "Compare the Core One and the P1S on build volume and enclosure."
- "Which puck screens fit a Breville Barista Express, in stock?"

## Verdicts

`fits`, `fits_with_adapter`, `does_not_fit` or `unknown`. Unknown is an answer: it lists the spec fields that are missing rather than guessing. Every rule needs two independent sources, one from the manufacturer, before it can decide anything.

## Editor rules

`rules/cursor.mdc` and `rules/windsurf.md` tell Cursor or Windsurf agents when to call compatsy instead of guessing fitment from memory.

## Links

- Methodology: https://compatsy.com/3d-printing/methodology and https://compatsy.com/home-espresso/methodology
- Open data: https://compatsy.com/data
- Privacy: https://compatsy.com/3d-printing/privacy
- OpenAPI: https://compatsy.com/api/v1/openapi.json
- Support: support@compatsy.com
