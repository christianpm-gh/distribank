-- =============================================================================
-- DistriBank — Datos Nodo C
-- Criterio: customer_id % 3 = 2
-- Infraestructura: Supabase (schema public)
-- Clientes: 2 (Carlos), 5 (Valentina), 8 (Fernando), 11 (Beatriz),
--           14 (Jorge), 17 (Mónica), 20 (Iván), 23 (Gabriela),
--           26 (Tomás), 29 (Silvia)
-- Cuentas CHECKING: 2, 5, 8, 11, 14, 17, 20, 23, 26, 29
-- Cuentas CREDIT:   33 (cust2), 38 (cust11), 46 (cust20), 47 (cust26)
-- Tarjetas:         37–53
-- Transacciones:    31–45
-- Logs:             111–165
-- VIPs del nodo (week_tx ≥ 3):
--   Carlos(2): tx=9, Valentina(5): tx=4, Fernando(8): tx=5,
--   Beatriz(11): tx=3, Iván(20): tx=6, Tomás(26): tx=5
-- =============================================================================

-- BEGIN;

-- -----------------------------------------------------------------------------
-- customers
-- -----------------------------------------------------------------------------
INSERT INTO customers (id, name, curp, email, password, created_at) VALUES
(2,  'Carlos Mendoza López',      'MELC880925HDFRND06', 'carlos.mendoza@distribank.mx',
 '$2b$12$NoPqRsTuVwXyZaBC4De5FgHiJkLmLK9Xv3mN2pQ8wR1tY7uZoOeWsAi',  '2024-01-15 11:00:00'),
(5,  'Valentina Morales Ramos',   'MARV960702MDFRMLN5', 'valentina.morales@distribank.mx',
 '$2b$12$QrStUvWxYzABC4De5FgHiJkLmNoLK9Xv3mN2pQ8wR1tY7uZoOeWsAiBj', '2024-02-28 10:30:00'),
(8,  'Fernando Jiménez Solis',    'JISF840310HDFRMRN3', 'fernando.jimenez@distribank.mx',
 '$2b$12$TuVwXyZaBC4De5FgHiJkLmNoPqLK9Xv3mN2pQ8wR1tY7uZoOeWsAiBjCd', '2024-04-18 13:00:00'),
(11, 'Beatriz Luna Carrillo',     'LUCB010615MDFRRTN0', 'beatriz.luna@distribank.mx',
 '$2b$12$WxYzABCD5Ef6GhIjKlMnOpQr7LK9Xv3mN2pQ8wR1tY7uZoOeWsAiBjCdEf', '2024-03-25 15:10:00'),
(14, 'Jorge Campos Vela',         'CAVJ791104HDFRMLR1', 'jorge.campos@distribank.mx',
 '$2b$12$ZaBC4De5FgHiJkLmNoP67QrSLK9Xv3mN2pQ8wR1tY7uZoOeWsAiBjCdEfGh', '2024-01-20 08:40:00'),
(17, 'Mónica Salinas Peña',       'SAPM900821MDFRLNN8', 'monica.salinas@distribank.mx',
 '$2b$12$AbCDE5Ef6GhIjKlMnOpQr78SLK9Xv3mN2pQ8wR1tY7uZoOeWsAiBjCdEfGh', '2024-06-10 12:20:00'),
(20, 'Iván Elizalde Torres',      'ELTI820517HDFRLTV4', 'ivan.elizalde@distribank.mx',
 '$2b$12$BcDEF6Fg7HiJkLmNoP67QrStLK9Xv3mN2pQ8wR1tY7uZoOeWsAiBjCdEfGhI', '2024-02-10 09:15:00'),
(23, 'Gabriela Reyes Castañeda',  'RECG050312MDFRSBN2', 'gabriela.reyes@distribank.mx',
 '$2b$12$CdEFG7Gh8IjKlMnOpQr78StULK9Xv3mN2pQ8wR1tY7uZoOeWsAiBjCdEfGhIj', '2024-05-05 11:45:00'),
(26, 'Tomás Aguilar Medina',      'AGMT770930HDFRMDN7', 'tomas.aguilar@distribank.mx',
 '$2b$12$DeGHF8Hi9JkLmNoP67QrStUvLK9Xv3mN2pQ8wR1tY7uZoOeWsAiBjCdEfGhIjK', '2024-03-12 14:00:00'),
(29, 'Silvia Ponce Guerrero',     'POGS911208MDFRNVL6', 'silvia.ponce@distribank.mx',
 '$2b$12$EfGHI9Ij0KlMnOpQr78StUvWLK9Xv3mN2pQ8wR1tY7uZoOeWsAiBjCdEfGhIjKl', '2024-04-28 16:30:00');


-- -----------------------------------------------------------------------------
-- accounts
-- -----------------------------------------------------------------------------
INSERT INTO accounts (
    id, account_number, account_type, balance,
    credit_limit, available_credit, overdraft_limit,
    last_limit_increase_at, status, week_transactions, created_at
) VALUES
-- CHECKING accounts
(2,  'DISTCHK0000000002', 'CHECKING', 42000.00, NULL, NULL,  2000.00,
 '2025-01-15 00:00:00',   'ACTIVE',  6,  '2024-01-15 11:05:00'),
(5,  'DISTCHK0000000005', 'CHECKING', 18500.00, NULL, NULL,   800.00,
 NULL,                    'ACTIVE',  4,  '2024-02-28 10:35:00'),
(8,  'DISTCHK0000000008', 'CHECKING',  6800.00, NULL, NULL,   500.00,
 NULL,                    'ACTIVE',  5,  '2024-04-18 13:05:00'),
(11, 'DISTCHK0000000011', 'CHECKING',  9300.00, NULL, NULL,   300.00,
 NULL,                    'ACTIVE',  2,  '2024-03-25 15:15:00'),
(14, 'DISTCHK0000000014', 'CHECKING',  3100.00, NULL, NULL,   150.00,
 NULL,                    'ACTIVE',  1,  '2024-01-20 08:45:00'),
(17, 'DISTCHK0000000017', 'CHECKING',  1200.00, NULL, NULL,   100.00,
 NULL,                    'ACTIVE',  2,  '2024-06-10 12:25:00'),
(20, 'DISTCHK0000000020', 'CHECKING', 22000.00, NULL, NULL,   700.00,
 '2024-10-05 00:00:00',   'ACTIVE',  4,  '2024-02-10 09:20:00'),
(23, 'DISTCHK0000000023', 'CHECKING',  4500.00, NULL, NULL,   200.00,
 NULL,                    'ACTIVE',  1,  '2024-05-05 11:50:00'),
(26, 'DISTCHK0000000026', 'CHECKING', 16000.00, NULL, NULL,   600.00,
 '2024-11-20 00:00:00',   'ACTIVE',  3,  '2024-03-12 14:05:00'),
(29, 'DISTCHK0000000029', 'CHECKING',    750.00, NULL, NULL,   100.00,
 NULL,                    'ACTIVE',  0,  '2024-04-28 16:35:00'),
-- CREDIT accounts
(33, 'DISTCRD0000000003', 'CREDIT',  -4800.00, 18000.00, 13200.00, NULL,
 '2025-02-01 00:00:00',   'ACTIVE',  3,  '2024-01-15 11:10:00'),
(38, 'DISTCRD0000000008', 'CREDIT',  -1500.00,  8000.00,  6500.00, NULL,
 NULL,                    'ACTIVE',  1,  '2024-03-25 15:20:00'),
(46, 'DISTCRD0000000016', 'CREDIT',  -2200.00, 10000.00,  7800.00, NULL,
 '2024-12-01 00:00:00',   'ACTIVE',  2,  '2024-02-10 09:25:00'),
(47, 'DISTCRD0000000017', 'CREDIT',  -7500.00, 15000.00,  7500.00, NULL,
 '2025-03-10 00:00:00',   'ACTIVE',  2,  '2024-03-12 14:10:00');


-- -----------------------------------------------------------------------------
-- customer_accounts
-- -----------------------------------------------------------------------------
INSERT INTO customer_accounts (customer_id, checking_account_id, credit_account_id) VALUES
(2,  2,  33),
(5,  5,  NULL),
(8,  8,  NULL),
(11, 11, 38),
(14, 14, NULL),
(17, 17, NULL),
(20, 20, 46),
(23, 23, NULL),
(26, 26, 47),
(29, 29, NULL);


-- -----------------------------------------------------------------------------
-- cards  (IDs 37–53)
-- -----------------------------------------------------------------------------
INSERT INTO cards (id, account_id, card_number, card_type, cvv, expiration_date, status, daily_limit, issued_at) VALUES
-- Cuenta 2 (CHECKING) — titular + adicional (Carlos, VIP)
(37, 2,  '4111000000000037', 'DEBIT',  '701', '2028-01-31', 'ACTIVE',  10000.00, '2024-01-15 11:10:00'),
(38, 2,  '4111000000000038', 'DEBIT',  '702', '2028-01-31', 'ACTIVE',   3000.00, '2024-07-01 09:00:00'),
-- Cuenta 5 (CHECKING)
(39, 5,  '4111000000000039', 'DEBIT',  '703', '2027-09-30', 'ACTIVE',   5000.00, '2024-02-28 10:40:00'),
-- Cuenta 8 (CHECKING)
(40, 8,  '4111000000000040', 'DEBIT',  '704', '2027-03-31', 'ACTIVE',   3000.00, '2024-04-18 13:10:00'),
-- Cuenta 11 (CHECKING)
(41, 11, '4111000000000041', 'DEBIT',  '705', '2028-06-30', 'ACTIVE',   4000.00, '2024-03-25 15:20:00'),
-- Cuenta 14 (CHECKING)
(42, 14, '4111000000000042', 'DEBIT',  '706', '2027-06-30', 'ACTIVE',   2000.00, '2024-01-20 08:50:00'),
-- Cuenta 17 (CHECKING)
(43, 17, '4111000000000043', 'DEBIT',  '707', '2026-09-30', 'ACTIVE',   1000.00, '2024-06-10 12:30:00'),
-- Cuenta 20 (CHECKING) — (Iván, VIP)
(44, 20, '4111000000000044', 'DEBIT',  '708', '2028-09-30', 'ACTIVE',   8000.00, '2024-02-10 09:30:00'),
-- Cuenta 23 (CHECKING)
(45, 23, '4111000000000045', 'DEBIT',  '709', '2027-12-31', 'ACTIVE',   2500.00, '2024-05-05 11:55:00'),
-- Cuenta 26 (CHECKING) — (Tomás, VIP)
(46, 26, '4111000000000046', 'DEBIT',  '710', '2028-03-31', 'ACTIVE',   6000.00, '2024-03-12 14:10:00'),
-- Cuenta 29 (CHECKING) — vencida (Silvia)
(47, 29, '4111000000000047', 'DEBIT',  '711', '2025-04-30', 'EXPIRED',     NULL, '2023-04-28 09:00:00'),
-- Cuenta 33 (CREDIT) — titular + extensión (Carlos, VIP)
(48, 33, '5500000000000048', 'CREDIT', '801', '2028-01-31', 'ACTIVE',  18000.00, '2024-01-15 11:15:00'),
(49, 33, '5500000000000049', 'CREDIT', '802', '2027-07-31', 'ACTIVE',   5000.00, '2024-08-15 10:00:00'),
-- Cuenta 38 (CREDIT) — (Beatriz, VIP)
(50, 38, '5500000000000050', 'CREDIT', '803', '2028-06-30', 'ACTIVE',   8000.00, '2024-03-25 15:25:00'),
-- Cuenta 46 (CREDIT) — (Iván, VIP)
(51, 46, '5500000000000051', 'CREDIT', '804', '2028-09-30', 'ACTIVE',  10000.00, '2024-02-10 09:35:00'),
-- Cuenta 47 (CREDIT) — titular + extensión (Tomás, VIP)
(52, 47, '5500000000000052', 'CREDIT', '805', '2028-03-31', 'ACTIVE',  15000.00, '2024-03-12 14:15:00'),
(53, 47, '5500000000000053', 'CREDIT', '806', '2027-09-30', 'BLOCKED',  4000.00, '2024-10-01 11:00:00');


-- -----------------------------------------------------------------------------
-- transactions  (IDs 31–45, todas intra-nodo)
-- -----------------------------------------------------------------------------
INSERT INTO transactions (
    id, transaction_uuid, from_account_id, to_account_id, card_id,
    amount, transaction_type, status, initiated_at, completed_at
) VALUES
(31, '00000000-0000-4000-8000-000000000031', 2,  5,  NULL, 10000.00, 'TRANSFER',   'COMPLETED',   '2025-06-01 09:00:00', '2025-06-01 09:00:04'),
(32, '00000000-0000-4000-8000-000000000032', 5,  2,  NULL,  4500.00, 'TRANSFER',   'COMPLETED',   '2025-06-02 10:00:00', '2025-06-02 10:00:03'),
(33, '00000000-0000-4000-8000-000000000033', 8,  11, NULL,  2200.00, 'DEPOSIT',    'COMPLETED',   '2025-06-03 11:00:00', '2025-06-03 11:00:02'),
(34, '00000000-0000-4000-8000-000000000034', 26, 20, NULL,  5000.00, 'TRANSFER',   'COMPLETED',   '2025-06-04 13:00:00', '2025-06-04 13:00:04'),
(35, '00000000-0000-4000-8000-000000000035', 2,  8,  37,   3500.00, 'PURCHASE',   'COMPLETED',   '2025-06-05 15:00:00', '2025-06-05 15:00:05'),
(36, '00000000-0000-4000-8000-000000000036', 33, 14, 48,   6200.00, 'PURCHASE',   'COMPLETED',   '2025-06-06 11:30:00', '2025-06-06 11:30:06'),
(37, '00000000-0000-4000-8000-000000000037', 38, 11, 50,   1800.00, 'PURCHASE',   'COMPLETED',   '2025-06-07 14:00:00', '2025-06-07 14:00:05'),
(38, '00000000-0000-4000-8000-000000000038', 20, 26, NULL,  7500.00, 'TRANSFER',   'COMPLETED',   '2025-06-08 08:30:00', '2025-06-08 08:30:04'),
(39, '00000000-0000-4000-8000-000000000039', 26, 29, NULL,  3200.00, 'TRANSFER',   'COMPLETED',   '2025-06-09 17:00:00', '2025-06-09 17:00:03'),
(40, '00000000-0000-4000-8000-000000000040', 46, 5,  51,    900.00, 'PURCHASE',   'COMPLETED',   '2025-06-10 12:00:00', '2025-06-10 12:00:04'),
(41, '00000000-0000-4000-8000-000000000041', 47, 26, 52,   4200.00, 'PURCHASE',   'COMPLETED',   '2025-06-11 10:00:00', '2025-06-11 10:00:05'),
(42, '00000000-0000-4000-8000-000000000042', 11, 17, NULL,  1100.00, 'TRANSFER',   'PENDING',     '2025-06-12 16:00:00', NULL),
(43, '00000000-0000-4000-8000-000000000043', 29, 20, NULL,   350.00, 'TRANSFER',   'COMPLETED',   '2025-06-13 10:30:00', '2025-06-13 10:30:02'),
(44, '00000000-0000-4000-8000-000000000044', 5,  23, NULL,  9000.00, 'TRANSFER',   'FAILED',      '2025-06-14 18:00:00', '2025-06-14 18:00:01'),
(45, '00000000-0000-4000-8000-000000000045', 33, 29, 49,   8500.00, 'PURCHASE',   'ROLLED_BACK', '2025-06-15 11:00:00', '2025-06-15 11:05:00');


-- -----------------------------------------------------------------------------
-- transaction_log  (IDs 111–165)
-- Distribución:
--   T31–T41, T43: COMPLETED → 4 eventos c/u  = 48 logs
--   T42: PENDING  → 1 evento                  =  1 log
--   T44: FAILED   → 2 eventos                 =  2 logs
--   T45: ROLLED_BACK → 4 eventos              =  4 logs
--   Total: 55 logs
-- -----------------------------------------------------------------------------
INSERT INTO transaction_log (id, transaction_id, event_type, details, created_at) VALUES
-- T31: TRANSFER COMPLETED (acc2 → acc5, 10000.00) — Carlos→Valentina
(111, 31, 'INITIATED',     '{"ip": "192.168.20.5", "channel": "app_mobile"}',                                      '2025-06-01 09:00:00'),
(112, 31, 'DEBIT_APPLIED', '{"account_id": 2,  "prev_balance": 52000.00, "new_balance": 42000.00}',                '2025-06-01 09:00:01'),
(113, 31, 'CREDIT_APPLIED','{"account_id": 5,  "prev_balance": 8500.00,  "new_balance": 18500.00}',                '2025-06-01 09:00:02'),
(114, 31, 'COMPLETED',     '{"latency_ms": 4000}',                                                                 '2025-06-01 09:00:04'),
-- T32: TRANSFER COMPLETED (acc5 → acc2, 4500.00) — Valentina→Carlos
(115, 32, 'INITIATED',     '{"ip": "10.0.20.11", "channel": "app_web"}',                                          '2025-06-02 10:00:00'),
(116, 32, 'DEBIT_APPLIED', '{"account_id": 5,  "prev_balance": 23000.00, "new_balance": 18500.00}',                '2025-06-02 10:00:01'),
(117, 32, 'CREDIT_APPLIED','{"account_id": 2,  "prev_balance": 37500.00, "new_balance": 42000.00}',                '2025-06-02 10:00:02'),
(118, 32, 'COMPLETED',     '{"latency_ms": 3000}',                                                                 '2025-06-02 10:00:03'),
-- T33: DEPOSIT COMPLETED (acc8 → acc11, 2200.00) — Fernando→Beatriz
(119, 33, 'INITIATED',     '{"channel": "branch_teller", "teller_id": "TLR-055"}',                                '2025-06-03 11:00:00'),
(120, 33, 'DEBIT_APPLIED', '{"account_id": 8,  "prev_balance": 9000.00,  "new_balance": 6800.00}',                '2025-06-03 11:00:01'),
(121, 33, 'CREDIT_APPLIED','{"account_id": 11, "prev_balance": 7100.00,  "new_balance": 9300.00}',                '2025-06-03 11:00:01'),
(122, 33, 'COMPLETED',     '{"latency_ms": 2000}',                                                                 '2025-06-03 11:00:02'),
-- T34: TRANSFER COMPLETED (acc26 → acc20, 5000.00) — Tomás→Iván
(123, 34, 'INITIATED',     '{"ip": "172.16.20.3", "channel": "app_mobile"}',                                      '2025-06-04 13:00:00'),
(124, 34, 'DEBIT_APPLIED', '{"account_id": 26, "prev_balance": 21000.00, "new_balance": 16000.00}',               '2025-06-04 13:00:01'),
(125, 34, 'CREDIT_APPLIED','{"account_id": 20, "prev_balance": 17000.00, "new_balance": 22000.00}',               '2025-06-04 13:00:03'),
(126, 34, 'COMPLETED',     '{"latency_ms": 4000}',                                                                 '2025-06-04 13:00:04'),
-- T35: PURCHASE COMPLETED (acc2 → acc8, card37, 3500.00) — Carlos→Fernando
(127, 35, 'INITIATED',     '{"card_id": 37, "channel": "pos", "merchant": "Palacio de Hierro Perisur"}',          '2025-06-05 15:00:00'),
(128, 35, 'DEBIT_APPLIED', '{"account_id": 2,  "prev_balance": 45500.00, "new_balance": 42000.00}',               '2025-06-05 15:00:02'),
(129, 35, 'CREDIT_APPLIED','{"account_id": 8,  "prev_balance": 3300.00,  "new_balance": 6800.00}',                '2025-06-05 15:00:04'),
(130, 35, 'COMPLETED',     '{"latency_ms": 5000}',                                                                 '2025-06-05 15:00:05'),
-- T36: PURCHASE COMPLETED (acc33 → acc14, card48, 6200.00) — Carlos credit→Jorge
(131, 36, 'INITIATED',     '{"card_id": 48, "channel": "ecommerce", "merchant": "Apple Store MX"}',               '2025-06-06 11:30:00'),
(132, 36, 'DEBIT_APPLIED', '{"account_id": 33, "prev_balance": 1400.00,  "new_balance": -4800.00}',               '2025-06-06 11:30:02'),
(133, 36, 'CREDIT_APPLIED','{"account_id": 14, "prev_balance": -3100.00, "new_balance": 3100.00}',                '2025-06-06 11:30:04'),
(134, 36, 'COMPLETED',     '{"latency_ms": 6000}',                                                                 '2025-06-06 11:30:06'),
-- T37: PURCHASE COMPLETED (acc38 → acc11, card50, 1800.00) — Beatriz credit→Beatriz checking
(135, 37, 'INITIATED',     '{"card_id": 50, "channel": "pos", "merchant": "Superama Santa Fe"}',                  '2025-06-07 14:00:00'),
(136, 37, 'DEBIT_APPLIED', '{"account_id": 38, "prev_balance": 300.00,   "new_balance": -1500.00}',               '2025-06-07 14:00:02'),
(137, 37, 'CREDIT_APPLIED','{"account_id": 11, "prev_balance": 7500.00,  "new_balance": 9300.00}',                '2025-06-07 14:00:03'),
(138, 37, 'COMPLETED',     '{"latency_ms": 5000}',                                                                 '2025-06-07 14:00:05'),
-- T38: TRANSFER COMPLETED (acc20 → acc26, 7500.00) — Iván→Tomás
(139, 38, 'INITIATED',     '{"ip": "192.168.21.9", "channel": "app_web"}',                                        '2025-06-08 08:30:00'),
(140, 38, 'DEBIT_APPLIED', '{"account_id": 20, "prev_balance": 29500.00, "new_balance": 22000.00}',               '2025-06-08 08:30:01'),
(141, 38, 'CREDIT_APPLIED','{"account_id": 26, "prev_balance": 8500.00,  "new_balance": 16000.00}',               '2025-06-08 08:30:03'),
(142, 38, 'COMPLETED',     '{"latency_ms": 4000}',                                                                 '2025-06-08 08:30:04'),
-- T39: TRANSFER COMPLETED (acc26 → acc29, 3200.00) — Tomás→Silvia
(143, 39, 'INITIATED',     '{"ip": "172.16.20.3", "channel": "app_mobile"}',                                      '2025-06-09 17:00:00'),
(144, 39, 'DEBIT_APPLIED', '{"account_id": 26, "prev_balance": 19200.00, "new_balance": 16000.00}',               '2025-06-09 17:00:01'),
(145, 39, 'CREDIT_APPLIED','{"account_id": 29, "prev_balance": -2450.00, "new_balance": 750.00}',                 '2025-06-09 17:00:02'),
(146, 39, 'COMPLETED',     '{"latency_ms": 3000}',                                                                 '2025-06-09 17:00:03'),
-- T40: PURCHASE COMPLETED (acc46 → acc5, card51, 900.00) — Iván credit→Valentina
(147, 40, 'INITIATED',     '{"card_id": 51, "channel": "pos", "merchant": "Sanborns Insurgentes"}',               '2025-06-10 12:00:00'),
(148, 40, 'DEBIT_APPLIED', '{"account_id": 46, "prev_balance": -1300.00, "new_balance": -2200.00}',               '2025-06-10 12:00:01'),
(149, 40, 'CREDIT_APPLIED','{"account_id": 5,  "prev_balance": 17600.00, "new_balance": 18500.00}',               '2025-06-10 12:00:02'),
(150, 40, 'COMPLETED',     '{"latency_ms": 4000}',                                                                 '2025-06-10 12:00:04'),
-- T41: PURCHASE COMPLETED (acc47 → acc26, card52, 4200.00) — Tomás credit→Tomás checking
(151, 41, 'INITIATED',     '{"card_id": 52, "channel": "ecommerce", "merchant": "Liverpool Online"}',             '2025-06-11 10:00:00'),
(152, 41, 'DEBIT_APPLIED', '{"account_id": 47, "prev_balance": -3300.00, "new_balance": -7500.00}',               '2025-06-11 10:00:02'),
(153, 41, 'CREDIT_APPLIED','{"account_id": 26, "prev_balance": 11800.00, "new_balance": 16000.00}',               '2025-06-11 10:00:04'),
(154, 41, 'COMPLETED',     '{"latency_ms": 5000}',                                                                 '2025-06-11 10:00:05'),
-- T42: TRANSFER PENDING (acc11 → acc17, 1100.00) — Beatriz→Mónica
(155, 42, 'INITIATED',     '{"ip": "192.168.20.33", "channel": "app_mobile"}',                                    '2025-06-12 16:00:00'),
-- T43: TRANSFER COMPLETED (acc29 → acc20, 350.00) — Silvia→Iván
(156, 43, 'INITIATED',     '{"channel": "branch_teller", "teller_id": "TLR-062"}',                                '2025-06-13 10:30:00'),
(157, 43, 'DEBIT_APPLIED', '{"account_id": 29, "prev_balance": 1100.00,  "new_balance": 750.00}',                 '2025-06-13 10:30:01'),
(158, 43, 'CREDIT_APPLIED','{"account_id": 20, "prev_balance": 21650.00, "new_balance": 22000.00}',               '2025-06-13 10:30:01'),
(159, 43, 'COMPLETED',     '{"latency_ms": 2000}',                                                                 '2025-06-13 10:30:02'),
-- T44: TRANSFER FAILED (acc5 → acc23, 9000.00) — fondos insuficientes
(160, 44, 'INITIATED',     '{"ip": "10.0.20.11", "channel": "app_web"}',                                          '2025-06-14 18:00:00'),
(161, 44, 'FAILED',        '{"reason": "insufficient_funds", "balance": 18500.00, "amount_requested": 9000.00, "decline_code": "51"}', '2025-06-14 18:00:01'),
-- T45: PURCHASE ROLLED_BACK (acc33 → acc29, card49, 8500.00) — Carlos credit→Silvia
(162, 45, 'INITIATED',     '{"card_id": 49, "channel": "ecommerce", "merchant": "Coppel en Línea"}',              '2025-06-15 11:00:00'),
(163, 45, 'DEBIT_APPLIED', '{"account_id": 33, "prev_balance": 3700.00,  "new_balance": -4800.00}',               '2025-06-15 11:00:30'),
(164, 45, 'CREDIT_APPLIED','{"account_id": 29, "prev_balance": -7750.00, "new_balance": 750.00}',                 '2025-06-15 11:01:00'),
(165, 45, 'COMPENSATED',   '{"reason": "duplicate_order_detection", "original_tx_id": 45, "compensation": {"account_33_restored": 3700.00, "account_29_restored": -7750.00}}', '2025-06-15 11:05:00');


-- -----------------------------------------------------------------------------
-- Reseteo de secuencias
-- -----------------------------------------------------------------------------
SELECT setval('customers_id_seq',       (SELECT MAX(id) FROM customers));
SELECT setval('accounts_id_seq',        (SELECT MAX(id) FROM accounts));
SELECT setval('cards_id_seq',           (SELECT MAX(id) FROM cards));
SELECT setval('transactions_id_seq',    (SELECT MAX(id) FROM transactions));
SELECT setval('transaction_log_id_seq', (SELECT MAX(id) FROM transaction_log));

-- COMMIT;
