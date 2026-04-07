-- =============================================================================
-- DistriBank — Datos Nodo B
-- Criterio: customer_id % 3 = 1
-- Clientes: 1 (Ana), 4 (Roberto), 7 (Lucía), 10 (Diego), 13 (Daniela),
--           16 (Samuel), 19 (Alejandra), 22 (Hugo), 25 (Cristina), 28 (Ernesto)
-- Cuentas CHECKING: 1, 4, 7, 10, 13, 16, 19, 22, 25, 28
-- Cuentas CREDIT:   31 (cust1), 35 (cust10), 39 (cust19), 42 (cust25)
-- Tarjetas:         20–36
-- Transacciones:    16–30
-- Logs:             56–110
-- VIPs del nodo:    1, 10, 13, 19, 25, 28  (week_tx ≥ 3)
-- =============================================================================

-- BEGIN;

-- -----------------------------------------------------------------------------
-- customers
-- -----------------------------------------------------------------------------
INSERT INTO customers (id, name, curp, email, password, created_at) VALUES
(1,  'Ana García Reyes',       'GARA920315MDFRYNO8', 'ana.garcia@distribank.mx',
 '$2b$12$LK9Xv3mN2pQ8wR1tY7uZoOeWsAiBjCdEfGhIjKlMnOpQrStUvWxYz',     '2024-01-10 09:05:00'),
(4,  'Roberto Ramírez Castro', 'RACR751230HDFRBS02', 'roberto.ramirez@distribank.mx',
 '$2b$12$PqRsTuVwXyZaBC4De5FgHiJkLmNoBP9Xv4nO3qR2sT1uV8wZoYeXsAt',   '2024-02-14 14:05:00'),
(7,  'Lucía Moreno Jiménez',   'MOJL910818MDFRMR01', 'lucia.moreno@distribank.mx',
 '$2b$12$StUvWxYzABCD5Ef6GhIjKlMnOpQr78SLK9Xv3mN2pQ8wR1tY7uZoOeW',   '2024-04-02 09:35:00'),
(10, 'Diego Torres Sandoval',  'TOSD860915HDFRND00', 'diego.torres@distribank.mx',
 '$2b$12$VwXyZaBC4De5FgHiJkLmNoP67Qr9StLK9Xv3mN2pQ8wR1tY7uZoOeWs',  '2024-05-22 15:50:00'),
(13, 'Daniela Herrera Sánchez','HESD000805MDFRNL06', 'daniela.herrera@distribank.mx',
 '$2b$12$WxYzABCD5Ef6GhIjKlMnOpQr78StULK9Xv3mN2pQ8wR1tY7uZoOeWsA',  '2024-03-18 11:20:00'),
(16, 'Samuel Flores Ortega',   'FLOS870402HDFRLM07', 'samuel.flores@distribank.mx',
 '$2b$12$XyZaBC4De5FgHiJkLmNoP67QrStUvLK9Xv3mN2pQ8wR1tY7uZoOeWsAi', '2024-06-01 08:00:00'),
(19, 'Alejandra Gómez Ruiz',   'GORA930714MDFRMJ05', 'alejandra.gomez@distribank.mx',
 '$2b$12$YzABCD5Ef6GhIjKlMnOpQr78StUvWLK9Xv3mN2pQ8wR1tY7uZoOeWsAiB','2024-02-28 13:15:00'),
(22, 'Hugo Martínez Torres',   'MATH790608HDFRRC08', 'hugo.martinez@distribank.mx',
 '$2b$12$ZaBC4De5FgHiJkLmNoP67QrStUvWxLK9Xv3mN2pQ8wR1tY7uZoOeWsAiBj','2024-04-22 10:40:00'),
(25, 'Cristina Vega Morales',  'VEMC960305MDFRLR02', 'cristina.vega@distribank.mx',
 '$2b$12$AbCD5Ef6GhIjKlMnOpQr78StUvWxYLK9Xv3mN2pQ8wR1tY7uZoOeWsAiBjC','2024-01-30 12:00:00'),
(28, 'Ernesto Gómez Salinas',  'GOSE760129HDFRMR03', 'ernesto.gomez@distribank.mx',
 '$2b$12$BcDE6Fg7HiJkLmNoP67QrStUvWxYzLK9Xv3mN2pQ8wR1tY7uZoOeWsAiBjC','2024-03-05 09:50:00');


-- -----------------------------------------------------------------------------
-- accounts
-- -----------------------------------------------------------------------------
INSERT INTO accounts (
    id, account_number, account_type, balance,
    credit_limit, available_credit, overdraft_limit,
    last_limit_increase_at, status, week_transactions, created_at
) VALUES
-- CHECKING accounts
(1,  'DISTCHK0000000001', 'CHECKING', 15420.50, NULL, NULL,   500.00,
 NULL,                    'ACTIVE',  8,  '2024-01-10 09:10:00'),
(4,  'DISTCHK0000000004', 'CHECKING',  3200.00, NULL, NULL,   200.00,
 NULL,                    'ACTIVE',  1,  '2024-02-14 14:10:00'),
(7,  'DISTCHK0000000007', 'CHECKING',  1100.25, NULL, NULL,   200.00,
 NULL,                    'ACTIVE',  2,  '2024-04-02 09:40:00'),
(10, 'DISTCHK0000000010', 'CHECKING', 46000.00, NULL, NULL,  2000.00,
 '2024-09-10 00:00:00',   'ACTIVE',  12, '2024-05-22 15:55:00'),
(13, 'DISTCHK0000000013', 'CHECKING', 11500.00, NULL, NULL,   400.00,
 NULL,                    'ACTIVE',  5,  '2024-03-18 11:25:00'),
(16, 'DISTCHK0000000016', 'CHECKING',   450.00, NULL, NULL,   100.00,
 NULL,                    'FROZEN',  0,  '2024-06-01 08:05:00'),
(19, 'DISTCHK0000000019', 'CHECKING', 28000.00, NULL, NULL,   800.00,
 '2024-08-01 00:00:00',   'ACTIVE',  7,  '2024-02-28 13:20:00'),
(22, 'DISTCHK0000000022', 'CHECKING',  3700.50, NULL, NULL,   250.00,
 NULL,                    'ACTIVE',  2,  '2024-04-22 10:45:00'),
(25, 'DISTCHK0000000025', 'CHECKING', 19500.00, NULL, NULL,   700.00,
 NULL,                    'ACTIVE',  4,  '2024-01-30 12:05:00'),
(28, 'DISTCHK0000000028', 'CHECKING',  7200.00, NULL, NULL,   350.00,
 NULL,                    'ACTIVE',  3,  '2024-03-05 09:55:00'),
-- CREDIT accounts
(31, 'DISTCRD0000000001', 'CREDIT',  -3200.00, 20000.00, 16800.00, NULL,
 '2025-03-01 00:00:00',   'ACTIVE',  6,  '2024-01-10 09:15:00'),
(35, 'DISTCRD0000000005', 'CREDIT',      0.00, 25000.00, 25000.00, NULL,
 '2025-08-15 00:00:00',   'ACTIVE',  0,  '2024-05-22 16:00:00'),
(39, 'DISTCRD0000000009', 'CREDIT',  -4500.00, 12000.00,  7500.00, NULL,
 '2025-01-20 00:00:00',   'ACTIVE',  3,  '2024-02-28 13:25:00'),
(42, 'DISTCRD0000000012', 'CREDIT',  -9800.00, 18000.00,  8200.00, NULL,
 '2025-04-05 00:00:00',   'ACTIVE',  5,  '2024-01-30 12:10:00');


-- -----------------------------------------------------------------------------
-- customer_accounts
-- -----------------------------------------------------------------------------
INSERT INTO customer_accounts (customer_id, checking_account_id, credit_account_id) VALUES
(1,  1,  31),
(4,  4,  NULL),
(7,  7,  NULL),
(10, 10, 35),
(13, 13, NULL),
(16, 16, NULL),
(19, 19, 39),
(22, 22, NULL),
(25, 25, 42),
(28, 28, NULL);


-- -----------------------------------------------------------------------------
-- cards
-- -----------------------------------------------------------------------------
INSERT INTO cards (id, account_id, card_number, card_type, cvv, expiration_date, status, daily_limit, issued_at) VALUES
-- Cuenta 1 (CHECKING) — titular + adicional
(20, 1,  '4111000000000020', 'DEBIT',  '501', '2027-01-31', 'ACTIVE',   5000.00, '2024-01-10 09:15:00'),
(21, 1,  '4111000000000021', 'DEBIT',  '502', '2027-01-31', 'ACTIVE',   2000.00, '2024-03-20 10:30:00'),
-- Cuenta 4 (CHECKING) — bloqueada
(22, 4,  '4111000000000022', 'DEBIT',  '503', '2026-06-30', 'BLOCKED',  1000.00, '2024-02-14 14:15:00'),
-- Cuenta 7 (CHECKING)
(23, 7,  '4111000000000023', 'DEBIT',  '504', '2026-12-31', 'ACTIVE',   2500.00, '2024-04-02 09:45:00'),
-- Cuenta 10 (CHECKING)
(24, 10, '4111000000000024', 'DEBIT',  '505', '2028-09-30', 'ACTIVE',  15000.00, '2024-05-22 16:00:00'),
-- Cuenta 13 (CHECKING)
(25, 13, '4111000000000025', 'DEBIT',  '506', '2027-06-30', 'ACTIVE',   4000.00, '2024-03-18 11:30:00'),
-- Cuenta 16 (CHECKING)
(26, 16, '4111000000000026', 'DEBIT',  '507', '2026-03-31', 'ACTIVE',    800.00, '2024-06-01 08:10:00'),
-- Cuenta 19 (CHECKING)
(27, 19, '4111000000000027', 'DEBIT',  '508', '2028-03-31', 'ACTIVE',   7000.00, '2024-02-28 13:30:00'),
-- Cuenta 22 (CHECKING)
(28, 22, '4111000000000028', 'DEBIT',  '509', '2027-09-30', 'ACTIVE',   3000.00, '2024-04-22 10:50:00'),
-- Cuenta 25 (CHECKING)
(29, 25, '4111000000000029', 'DEBIT',  '510', '2028-06-30', 'ACTIVE',   8000.00, '2024-01-30 12:10:00'),
-- Cuenta 28 (CHECKING)
(30, 28, '4111000000000030', 'DEBIT',  '511', '2027-12-31', 'ACTIVE',   3000.00, '2024-03-05 10:00:00'),
-- Cuenta 31 (CREDIT) — titular + extensión
(31, 31, '5500000000000031', 'CREDIT', '601', '2027-01-31', 'ACTIVE',  20000.00, '2024-01-10 09:20:00'),
(32, 31, '5500000000000032', 'CREDIT', '602', '2027-06-30', 'ACTIVE',   8000.00, '2024-05-15 11:00:00'),
-- Cuenta 35 (CREDIT)
(33, 35, '5500000000000033', 'CREDIT', '603', '2028-09-30', 'ACTIVE',  25000.00, '2024-05-22 16:05:00'),
-- Cuenta 39 (CREDIT)
(34, 39, '5500000000000034', 'CREDIT', '604', '2028-03-31', 'ACTIVE',  12000.00, '2024-02-28 13:35:00'),
-- Cuenta 42 (CREDIT) — titular + extensión bloqueada
(35, 42, '5500000000000035', 'CREDIT', '605', '2028-06-30', 'ACTIVE',  18000.00, '2024-01-30 12:15:00'),
(36, 42, '5500000000000036', 'CREDIT', '606', '2027-03-31', 'BLOCKED',  5000.00, '2024-08-10 09:00:00');


-- -----------------------------------------------------------------------------
-- transactions
-- -----------------------------------------------------------------------------
INSERT INTO transactions (
    id, transaction_uuid, from_account_id, to_account_id, card_id,
    amount, transaction_type, status, initiated_at, completed_at
) VALUES
(16, '00000000-0000-4000-8000-000000000016', 1,  10, NULL,  8000.00, 'TRANSFER',   'COMPLETED',   '2025-06-01 10:30:00', '2025-06-01 10:30:04'),
(17, '00000000-0000-4000-8000-000000000017', 10, 1,  NULL,  3500.00, 'TRANSFER',   'COMPLETED',   '2025-06-02 11:00:00', '2025-06-02 11:00:03'),
(18, '00000000-0000-4000-8000-000000000018', 13, 7,  NULL,  1200.00, 'TRANSFER',   'COMPLETED',   '2025-06-03 09:15:00', '2025-06-03 09:15:02'),
(19, '00000000-0000-4000-8000-000000000019', 25, 22, NULL,  4500.00, 'TRANSFER',   'COMPLETED',   '2025-06-04 14:00:00', '2025-06-04 14:00:03'),
(20, '00000000-0000-4000-8000-000000000020', 31, 13, 31,   2800.00, 'PURCHASE',   'COMPLETED',   '2025-06-05 10:00:00', '2025-06-05 10:00:05'),
(21, '00000000-0000-4000-8000-000000000021', 35, 10, 33,  15000.00, 'PURCHASE',   'COMPLETED',   '2025-06-06 12:00:00', '2025-06-06 12:00:06'),
(22, '00000000-0000-4000-8000-000000000022', 39, 19, 34,   3200.00, 'PURCHASE',   'COMPLETED',   '2025-06-07 16:30:00', '2025-06-07 16:30:05'),
(23, '00000000-0000-4000-8000-000000000023', 42, 25, 35,   5500.00, 'PURCHASE',   'COMPLETED',   '2025-06-08 09:00:00', '2025-06-08 09:00:06'),
(24, '00000000-0000-4000-8000-000000000024', 1,  22, NULL,  1500.00, 'TRANSFER',   'COMPLETED',   '2025-06-09 11:30:00', '2025-06-09 11:30:02'),
(25, '00000000-0000-4000-8000-000000000025', 19, 28, NULL,  6000.00, 'TRANSFER',   'COMPLETED',   '2025-06-10 15:00:00', '2025-06-10 15:00:04'),
(26, '00000000-0000-4000-8000-000000000026', 28, 4,  NULL,  2200.00, 'TRANSFER',   'COMPLETED',   '2025-06-11 08:30:00', '2025-06-11 08:30:03'),
(27, '00000000-0000-4000-8000-000000000027', 16, 7,  NULL,   800.00, 'TRANSFER',   'FAILED',      '2025-06-12 12:00:00', '2025-06-12 12:00:01'),
(28, '00000000-0000-4000-8000-000000000028', 10, 13, NULL,  3000.00, 'TRANSFER',   'PENDING',     '2025-06-13 09:00:00', NULL),
(29, '00000000-0000-4000-8000-000000000029', 39, 1,  34,   2100.00, 'PURCHASE',   'COMPLETED',   '2025-06-14 19:00:00', '2025-06-14 19:00:05'),
(30, '00000000-0000-4000-8000-000000000030', 31, 7,  32,   7500.00, 'PURCHASE',   'ROLLED_BACK', '2025-06-15 13:00:00', '2025-06-15 13:05:00');


-- -----------------------------------------------------------------------------
-- transaction_log (IDs 56–110)
-- -----------------------------------------------------------------------------
INSERT INTO transaction_log (id, transaction_id, event_type, details, created_at) VALUES
-- T16: TRANSFER COMPLETED (acc1 → acc10, 8000.00)
(56, 16, 'INITIATED',     '{"ip": "192.168.10.5", "channel": "app_web"}',                                          '2025-06-01 10:30:00'),
(57, 16, 'DEBIT_APPLIED', '{"account_id": 1,  "prev_balance": 23420.50, "new_balance": 15420.50}',                 '2025-06-01 10:30:01'),
(58, 16, 'CREDIT_APPLIED','{"account_id": 10, "prev_balance": 38000.00, "new_balance": 46000.00}',                 '2025-06-01 10:30:02'),
(59, 16, 'COMPLETED',     '{"latency_ms": 4000}',                                                                  '2025-06-01 10:30:04'),
-- T17: TRANSFER COMPLETED (acc10 → acc1, 3500.00)
(60, 17, 'INITIATED',     '{"ip": "10.0.5.20", "channel": "app_mobile"}',                                         '2025-06-02 11:00:00'),
(61, 17, 'DEBIT_APPLIED', '{"account_id": 10, "prev_balance": 49500.00, "new_balance": 46000.00}',                 '2025-06-02 11:00:01'),
(62, 17, 'CREDIT_APPLIED','{"account_id": 1,  "prev_balance": 11920.50, "new_balance": 15420.50}',                 '2025-06-02 11:00:02'),
(63, 17, 'COMPLETED',     '{"latency_ms": 3000}',                                                                  '2025-06-02 11:00:03'),
-- T18: TRANSFER COMPLETED (acc13 → acc7, 1200.00)
(64, 18, 'INITIATED',     '{"channel": "branch_teller", "teller_id": "TLR-035"}',                                 '2025-06-03 09:15:00'),
(65, 18, 'DEBIT_APPLIED', '{"account_id": 13, "prev_balance": 12700.00, "new_balance": 11500.00}',                 '2025-06-03 09:15:01'),
(66, 18, 'CREDIT_APPLIED','{"account_id": 7,  "prev_balance": -99.75,   "new_balance": 1100.25}',                  '2025-06-03 09:15:01'),
(67, 18, 'COMPLETED',     '{"latency_ms": 2000}',                                                                  '2025-06-03 09:15:02'),
-- T19: TRANSFER COMPLETED (acc25 → acc22, 4500.00)
(68, 19, 'INITIATED',     '{"ip": "172.16.1.8", "channel": "app_web"}',                                           '2025-06-04 14:00:00'),
(69, 19, 'DEBIT_APPLIED', '{"account_id": 25, "prev_balance": 24000.00, "new_balance": 19500.00}',                 '2025-06-04 14:00:01'),
(70, 19, 'CREDIT_APPLIED','{"account_id": 22, "prev_balance": -799.50,  "new_balance": 3700.50}',                  '2025-06-04 14:00:02'),
(71, 19, 'COMPLETED',     '{"latency_ms": 3000}',                                                                  '2025-06-04 14:00:03'),
-- T20: PURCHASE COMPLETED (acc31 → acc13, card31, 2800.00)
(72, 20, 'INITIATED',     '{"card_id": 31, "channel": "pos", "merchant": "Coppel Sucursal 118"}',                 '2025-06-05 10:00:00'),
(73, 20, 'DEBIT_APPLIED', '{"account_id": 31, "prev_balance": -400.00,  "new_balance": -3200.00}',                 '2025-06-05 10:00:02'),
(74, 20, 'CREDIT_APPLIED','{"account_id": 13, "prev_balance": 8700.00,  "new_balance": 11500.00}',                 '2025-06-05 10:00:03'),
(75, 20, 'COMPLETED',     '{"latency_ms": 5000}',                                                                  '2025-06-05 10:00:05'),
-- T21: PURCHASE COMPLETED (acc35 → acc10, card33, 15000.00)
(76, 21, 'INITIATED',     '{"card_id": 33, "channel": "ecommerce", "merchant": "Samsung Store MX"}',              '2025-06-06 12:00:00'),
(77, 21, 'DEBIT_APPLIED', '{"account_id": 35, "prev_balance": 15000.00, "new_balance": 0.00}',                     '2025-06-06 12:00:02'),
(78, 21, 'CREDIT_APPLIED','{"account_id": 10, "prev_balance": 31000.00, "new_balance": 46000.00}',                 '2025-06-06 12:00:04'),
(79, 21, 'COMPLETED',     '{"latency_ms": 6000}',                                                                  '2025-06-06 12:00:06'),
-- T22: PURCHASE COMPLETED (acc39 → acc19, card34, 3200.00)
(80, 22, 'INITIATED',     '{"card_id": 34, "channel": "pos", "merchant": "Liverpool Perisur"}',                   '2025-06-07 16:30:00'),
(81, 22, 'DEBIT_APPLIED', '{"account_id": 39, "prev_balance": -1300.00, "new_balance": -4500.00}',                 '2025-06-07 16:30:02'),
(82, 22, 'CREDIT_APPLIED','{"account_id": 19, "prev_balance": 24800.00, "new_balance": 28000.00}',                 '2025-06-07 16:30:03'),
(83, 22, 'COMPLETED',     '{"latency_ms": 5000}',                                                                  '2025-06-07 16:30:05'),
-- T23: PURCHASE COMPLETED (acc42 → acc25, card35, 5500.00)
(84, 23, 'INITIATED',     '{"card_id": 35, "channel": "ecommerce", "merchant": "Mercado Libre MX"}',              '2025-06-08 09:00:00'),
(85, 23, 'DEBIT_APPLIED', '{"account_id": 42, "prev_balance": -4300.00, "new_balance": -9800.00}',                 '2025-06-08 09:00:02'),
(86, 23, 'CREDIT_APPLIED','{"account_id": 25, "prev_balance": 14000.00, "new_balance": 19500.00}',                 '2025-06-08 09:00:04'),
(87, 23, 'COMPLETED',     '{"latency_ms": 6000}',                                                                  '2025-06-08 09:00:06'),
-- T24: TRANSFER COMPLETED (acc1 → acc22, 1500.00)
(88, 24, 'INITIATED',     '{"ip": "192.168.10.5", "channel": "app_mobile"}',                                      '2025-06-09 11:30:00'),
(89, 24, 'DEBIT_APPLIED', '{"account_id": 1,  "prev_balance": 16920.50, "new_balance": 15420.50}',                 '2025-06-09 11:30:01'),
(90, 24, 'CREDIT_APPLIED','{"account_id": 22, "prev_balance": 2200.50,  "new_balance": 3700.50}',                  '2025-06-09 11:30:01'),
(91, 24, 'COMPLETED',     '{"latency_ms": 2000}',                                                                  '2025-06-09 11:30:02'),
-- T25: TRANSFER COMPLETED (acc19 → acc28, 6000.00)
(92, 25, 'INITIATED',     '{"ip": "10.0.3.44", "channel": "app_web"}',                                            '2025-06-10 15:00:00'),
(93, 25, 'DEBIT_APPLIED', '{"account_id": 19, "prev_balance": 34000.00, "new_balance": 28000.00}',                 '2025-06-10 15:00:01'),
(94, 25, 'CREDIT_APPLIED','{"account_id": 28, "prev_balance": 1200.00,  "new_balance": 7200.00}',                  '2025-06-10 15:00:03'),
(95, 25, 'COMPLETED',     '{"latency_ms": 4000}',                                                                  '2025-06-10 15:00:04'),
-- T26: TRANSFER COMPLETED (acc28 → acc4, 2200.00)
(96,  26, 'INITIATED',     '{"channel": "branch_teller", "teller_id": "TLR-018"}',                                '2025-06-11 08:30:00'),
(97,  26, 'DEBIT_APPLIED', '{"account_id": 28, "prev_balance": 9400.00,  "new_balance": 7200.00}',                 '2025-06-11 08:30:01'),
(98,  26, 'CREDIT_APPLIED','{"account_id": 4,  "prev_balance": 1000.00,  "new_balance": 3200.00}',                 '2025-06-11 08:30:02'),
(99,  26, 'COMPLETED',     '{"latency_ms": 3000}',                                                                 '2025-06-11 08:30:03'),
-- T27: TRANSFER FAILED (acc16 → acc7, 800.00) — cuenta FROZEN
(100, 27, 'INITIATED',     '{"ip": "192.168.11.2", "channel": "app_mobile"}',                                     '2025-06-12 12:00:00'),
(101, 27, 'FAILED',        '{"reason": "account_frozen", "account_id": 16, "decline_code": "62"}',                 '2025-06-12 12:00:01'),
-- T28: TRANSFER PENDING (acc10 → acc13, 3000.00)
(102, 28, 'INITIATED',     '{"ip": "10.0.5.20", "channel": "app_web"}',                                           '2025-06-13 09:00:00'),
-- T29: PURCHASE COMPLETED (acc39 → acc1, card34, 2100.00)
(103, 29, 'INITIATED',     '{"card_id": 34, "channel": "ecommerce", "merchant": "Amazon MX"}',                    '2025-06-14 19:00:00'),
(104, 29, 'DEBIT_APPLIED', '{"account_id": 39, "prev_balance": -2400.00, "new_balance": -4500.00}',                '2025-06-14 19:00:02'),
(105, 29, 'CREDIT_APPLIED','{"account_id": 1,  "prev_balance": 13320.50, "new_balance": 15420.50}',                '2025-06-14 19:00:03'),
(106, 29, 'COMPLETED',     '{"latency_ms": 5000}',                                                                 '2025-06-14 19:00:05'),
-- T30: PURCHASE ROLLED_BACK (acc31 → acc7, card32, 7500.00)
(107, 30, 'INITIATED',     '{"card_id": 32, "channel": "pos", "merchant": "Sanborns Insurgentes"}',               '2025-06-15 13:00:00'),
(108, 30, 'DEBIT_APPLIED', '{"account_id": 31, "prev_balance": 4300.00,  "new_balance": -3200.00}',               '2025-06-15 13:00:30'),
(109, 30, 'CREDIT_APPLIED','{"account_id": 7,  "prev_balance": -6399.75, "new_balance": 1100.25}',                '2025-06-15 13:01:00'),
(110, 30, 'COMPENSATED',   '{"reason": "pos_terminal_error", "original_tx_id": 30, "compensation": {"account_31_restored": 4300.00, "account_7_restored": -6399.75}}', '2025-06-15 13:05:00');


-- -----------------------------------------------------------------------------
-- Reseteo de secuencias
-- -----------------------------------------------------------------------------
SELECT setval('customers_id_seq',       (SELECT MAX(id) FROM customers));
SELECT setval('accounts_id_seq',        (SELECT MAX(id) FROM accounts));
SELECT setval('cards_id_seq',           (SELECT MAX(id) FROM cards));
SELECT setval('transactions_id_seq',    (SELECT MAX(id) FROM transactions));
SELECT setval('transaction_log_id_seq', (SELECT MAX(id) FROM transaction_log));

-- COMMIT;
