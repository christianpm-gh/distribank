/**
 * watch-transactions.ts
 *
 * CLI que observa INSERTs en transaction_log de los 3 nodos distribuidos
 * usando PostgreSQL LISTEN/NOTIFY + patron Observer (EventEmitter).
 *
 * Uso: npm run watch:transactions
 */

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

import { Client, Notification } from 'pg';
import { EventEmitter } from 'events';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

// ── Tipos ──────────────────────────────────────────────────────────────

interface NodeConfig {
  label: string;
  envVar: string;
  color: string;
}

interface TransactionEvent {
  id: number;
  transaction_id: number;
  event_type: string;
  node_id: string;
  from_account_id: number;
  to_account_id: number;
  amount: number;
  status: string;
  created_at: string;
  source_node: string;
}

// ── ANSI ───────────────────────────────────────────────────────────────

const RST = '\x1b[0m';
const BOLD = '\x1b[1m';
const DIM = '\x1b[2m';

const C = {
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',
  boldGreen: '\x1b[1;32m',
} as const;

const EVENT_COLOR: Record<string, string> = {
  INITIATED: C.cyan,
  DEBIT_APPLIED: C.yellow,
  CREDIT_APPLIED: C.green,
  COMPLETED: C.boldGreen,
  FAILED: C.red,
  COMPENSATED: C.magenta,
};

const CHANNEL = 'transaction_log_events';

// ── Configuracion de nodos ─────────────────────────────────────────────

const NODE_CONFIGS: NodeConfig[] = [
  { label: 'nodo-a', envVar: 'NODE_A_DATABASE_URL', color: C.blue },
  { label: 'nodo-b', envVar: 'NODE_B_DATABASE_URL', color: C.magenta },
  { label: 'nodo-c', envVar: 'NODE_C_DATABASE_URL', color: C.cyan },
];

// ── NodeSubscriber (Observer: 1 instancia por nodo) ────────────────────

class NodeSubscriber extends EventEmitter {
  private client: Client | null = null;
  public connected = false;

  constructor(
    public readonly label: string,
    private readonly connectionString: string,
    public readonly color: string,
  ) {
    super();
  }

  async start(): Promise<void> {
    // Intentar con SSL primero; si falla (nodo local), reconectar sin SSL
    try {
      this.client = new Client({
        connectionString: this.connectionString,
        ssl: { rejectUnauthorized: false },
      });
      await this.client.connect();
    } catch {
      this.client = new Client({ connectionString: this.connectionString });
      await this.client.connect();
    }
    this.connected = true;

    await this.client.query(`LISTEN ${CHANNEL}`);

    this.client.on('notification', (msg: Notification) => {
      if (msg.channel !== CHANNEL || !msg.payload) return;
      try {
        const data = JSON.parse(msg.payload);
        const event: TransactionEvent = { ...data, source_node: this.label };
        this.emit('log', event);
      } catch {
        /* payload invalido, ignorar */
      }
    });

    this.client.on('error', (err: Error) => {
      this.emit('error', this.label, err);
    });
  }

  async stop(): Promise<void> {
    if (this.client) {
      await this.client.end().catch(() => {});
      this.client = null;
      this.connected = false;
    }
  }
}

// ── MessageQueue (cola FIFO para consola) ──────────────────────────────

class MessageQueue {
  private queue: string[] = [];
  private flushing = false;

  enqueue(event: TransactionEvent): void {
    this.queue.push(formatEvent(event));
    this.flush();
  }

  private flush(): void {
    if (this.flushing) return;
    this.flushing = true;
    while (this.queue.length > 0) {
      console.log(this.queue.shift());
    }
    this.flushing = false;
  }
}

// ── Formato de salida ──────────────────────────────────────────────────

function formatEvent(ev: TransactionEvent): string {
  const ts = new Date(ev.created_at).toLocaleTimeString('es-MX', { hour12: false });
  const evColor = EVENT_COLOR[ev.event_type] ?? C.white;
  const amt = Number(ev.amount).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  const sep = `${DIM}|${RST}`;

  return [
    `${DIM}[${ts}]${RST}`,
    `${BOLD}${evColor}${ev.event_type.padEnd(15)}${RST}`,
    `${C.white}tx:${ev.transaction_id}${RST}`,
    `${C.white}${ev.from_account_id} -> ${ev.to_account_id}${RST}`,
    `${BOLD}$${amt}${RST}`,
    `${evColor}${ev.node_id}${RST}`,
  ].join(` ${sep} `);
}

// ── Main ───────────────────────────────────────────────────────────────

async function main() {
  console.log(`\n${BOLD}${C.cyan}  DistriBank - Transaction Log Watcher${RST}`);
  console.log(`${DIM}  Patron Observer (LISTEN/NOTIFY) sobre 3 nodos${RST}\n`);

  const queue = new MessageQueue();
  const subscribers: NodeSubscriber[] = [];

  for (const cfg of NODE_CONFIGS) {
    const url = process.env[cfg.envVar];
    if (!url) {
      console.log(`  ${C.yellow}!${RST} ${cfg.label}: ${cfg.envVar} no definida, omitiendo`);
      continue;
    }
    subscribers.push(new NodeSubscriber(cfg.label, url, cfg.color));
  }

  if (subscribers.length === 0) {
    console.error(`\n${C.red}Error: ninguna DATABASE_URL configurada en .env${RST}`);
    process.exit(1);
  }

  // Conectar todos los suscriptores en paralelo
  const results = await Promise.allSettled(
    subscribers.map(async (sub) => {
      await sub.start();
      sub.on('log', (event: TransactionEvent) => queue.enqueue(event));
    }),
  );

  // Mostrar estado de conexion
  results.forEach((result, i) => {
    const sub = subscribers[i];
    if (result.status === 'fulfilled') {
      console.log(`  ${C.green}+${RST} ${sub.color}${sub.label}${RST}: conectado`);
    } else {
      console.log(`  ${C.red}x${RST} ${sub.color}${sub.label}${RST}: ${result.reason?.message ?? 'error'}`);
    }
  });

  const active = subscribers.filter((s) => s.connected).length;
  console.log(`\n${DIM}  ${active}/${subscribers.length} nodos activos. Esperando eventos... (Ctrl+C para salir)${RST}`);
  console.log(
    `${DIM}  ${'─'.repeat(90)}${RST}\n`,
  );

  // Shutdown graceful
  const shutdown = async () => {
    console.log(`\n${DIM}  Cerrando conexiones...${RST}`);
    await Promise.all(subscribers.map((s) => s.stop()));
    process.exit(0);
  };

  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
}

main().catch((err) => {
  console.error(`${C.red}Error fatal:${RST}`, err.message);
  process.exit(1);
});
