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

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

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

function formatVipEvent(
  type: 'sync' | 'verified',
  txId: number,
  accountId: number,
  customerName: string,
  balance?: string,
): string {
  const ts = new Date().toLocaleTimeString('es-MX', { hour12: false });
  const sep = `${DIM}|${RST}`;

  if (type === 'sync') {
    const label = '\u2B50 VIP_SYNC';
    return [
      `${DIM}[${ts}]${RST}`,
      `${BOLD}${C.yellow}${label.padEnd(15)}${RST}`,
      `${C.white}tx:${txId}${RST}`,
      `${C.yellow}${customerName} (acc:${accountId}) \u2192 vip schema${RST}`,
      `${C.yellow}nodo-c${RST}`,
    ].join(` ${sep} `);
  }

  const label = '\u2713 VIP_VERIFIED';
  const bal = Number(balance).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return [
    `${DIM}[${ts}]${RST}`,
    `${BOLD}${C.boldGreen}${label.padEnd(15)}${RST}`,
    `${C.white}tx:${txId}${RST}`,
    `${C.boldGreen}acc:${accountId} balance=$${bal} confirmado${RST}`,
    `${C.boldGreen}nodo-c${RST}`,
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

  // ── VIP cache: cargar cuentas VIP desde Nodo C ──────────────────────
  const vipCache = new Map<number, string>(); // accountId → customerName
  let vipClient: Client | null = null;
  const nodeCUrl = process.env.NODE_C_DATABASE_URL;

  if (nodeCUrl) {
    try {
      vipClient = new Client({
        connectionString: nodeCUrl,
        ssl: { rejectUnauthorized: false },
      });
      await vipClient.connect();
      const res = await vipClient.query(`
        SELECT a.id, c.name
        FROM distribank_vip_customers.accounts a
        JOIN distribank_vip_customers.customer_accounts ca
          ON (ca.checking_account_id = a.id OR ca.credit_account_id = a.id)
        JOIN distribank_vip_customers.customers c
          ON c.id = ca.customer_id
      `);
      for (const row of res.rows) {
        vipCache.set(Number(row.id), row.name);
      }
      console.log(`  ${C.yellow}\u2B50${RST} VIP cache: ${vipCache.size} cuentas VIP cargadas desde nodo-c`);
    } catch {
      console.log(`  ${C.yellow}!${RST} VIP cache: no se pudo cargar (nodo-c inaccesible)`);
    }
  }

  // ── VIP check post-COMPLETED ────────────────────────────────────────
  async function handleVipCheck(event: TransactionEvent): Promise<void> {
    if (event.event_type !== 'COMPLETED' || vipCache.size === 0 || !vipClient) return;

    const fromName = vipCache.get(event.from_account_id);
    const toName = vipCache.get(event.to_account_id);
    if (!fromName && !toName) return;

    // Mostrar VIP_SYNC para cada cuenta VIP involucrada
    if (fromName) {
      console.log(formatVipEvent('sync', event.transaction_id, event.from_account_id, fromName));
    }
    if (toName) {
      console.log(formatVipEvent('sync', event.transaction_id, event.to_account_id, toName));
    }

    // Timeout: esperar a que el backend complete el sync VIP
    await sleep(3000);

    // Verificar balances en schema VIP
    try {
      if (fromName) {
        const res = await vipClient.query(
          'SELECT balance FROM distribank_vip_customers.accounts WHERE id = $1',
          [event.from_account_id],
        );
        const bal = res.rows[0]?.balance;
        console.log(formatVipEvent('verified', event.transaction_id, event.from_account_id, fromName, bal));
      }
      if (toName) {
        const res = await vipClient.query(
          'SELECT balance FROM distribank_vip_customers.accounts WHERE id = $1',
          [event.to_account_id],
        );
        const bal = res.rows[0]?.balance;
        console.log(formatVipEvent('verified', event.transaction_id, event.to_account_id, toName, bal));
      }
    } catch {
      console.log(`  ${C.red}!${RST} VIP verify: error al consultar schema VIP`);
    }
  }

  // Conectar todos los suscriptores en paralelo
  const results = await Promise.allSettled(
    subscribers.map(async (sub) => {
      await sub.start();
      sub.on('log', (event: TransactionEvent) => {
        queue.enqueue(event);
        handleVipCheck(event);
      });
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
    if (vipClient) await vipClient.end().catch(() => {});
    process.exit(0);
  };

  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
}

main().catch((err) => {
  console.error(`${C.red}Error fatal:${RST}`, err.message);
  process.exit(1);
});
