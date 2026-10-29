#!/usr/bin/env node
// stdio <-> Streamable HTTP bridge for clients that only launch local MCP servers.
// Reads newline-delimited JSON-RPC on stdin, POSTs each message to the remote endpoint,
// and writes every JSON-RPC message from the response (JSON or SSE) to stdout. No dependencies.
const URL_ = process.env.COMPATSY_MCP_URL || "https://compatsy.com/mcp";
let session = null;
let queue = Promise.resolve();

function emit(msg) { process.stdout.write(`${JSON.stringify(msg)}\n`); }

function fromSse(text) {
  const out = [];
  for (const block of text.split(/\r?\n\r?\n/)) {
    const data = block.split(/\r?\n/).filter((l) => l.startsWith("data:")).map((l) => l.slice(5).trimStart()).join("\n");
    if (data) { try { out.push(JSON.parse(data)); } catch { /* ignore keep-alives */ } }
  }
  return out;
}

async function forward(line) {
  let msg;
  try { msg = JSON.parse(line); } catch { emit({ jsonrpc: "2.0", id: null, error: { code: -32700, message: "Parse error" } }); return; }
  const headers = { "content-type": "application/json", accept: "application/json, text/event-stream", "user-agent": "compatsy-mcp/0.1.0" };
  if (session) headers["mcp-session-id"] = session;
  try {
    const res = await fetch(URL_, { method: "POST", headers, body: JSON.stringify(msg) });
    const sid = res.headers.get("mcp-session-id");
    if (sid) session = sid;
    if (res.status === 202 || res.status === 204) return;
    const text = await res.text();
    const type = res.headers.get("content-type") || "";
    const messages = type.includes("text/event-stream") ? fromSse(text) : text ? [JSON.parse(text)] : [];
    for (const m of [].concat(...messages)) emit(m);
    if (!res.ok && messages.length === 0 && msg.id !== undefined) emit({ jsonrpc: "2.0", id: msg.id, error: { code: -32603, message: `HTTP ${res.status}` } });
  } catch (e) {
    if (msg.id !== undefined) emit({ jsonrpc: "2.0", id: msg.id, error: { code: -32603, message: `compatsy-mcp: ${e instanceof Error ? e.message : String(e)}` } });
  }
}

let buf = "";
process.stdin.setEncoding("utf8");
process.stdin.on("data", (chunk) => {
  buf += chunk;
  let i;
  while ((i = buf.indexOf("\n")) >= 0) {
    const line = buf.slice(0, i).trim();
    buf = buf.slice(i + 1);
    if (line) queue = queue.then(() => forward(line));
  }
});
// On EOF, pending requests finish and stdout drains before Node exits on its own.
process.stdin.on("end", () => { void queue; });
