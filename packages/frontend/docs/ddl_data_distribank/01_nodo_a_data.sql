-- =============================================================================
-- DistriBank — Datos Nodo A
-- Criterio: customer_id % 3 = 0
-- Clientes: 3 (Sofía), 6 (Miguel), 9 (Camila), 12 (Andrés), 15 (Elena),
--           18 (Ricardo), 21 (Patricia), 24 (Alberto), 27 (Natalia), 30 (Raúl)
-- Cuentas CHECKING: 3, 6, 9, 12, 15, 18, 21, 24, 27, 30
-- Cuentas CREDIT:   32 (cust3), 36 (cust12), 40 (cust21), 43 (cust27), 45 (cust30)
-- Tarjetas:         1–19
-- Transacciones:    1–15
-- Logs:             1–55
-- =============================================================================

-- BEGIN;

-- -----------------------------------------------------------------------------
-- customers
-- -----------------------------------------------------------------------------
INSERT INTO customers (id, name, curp, email, password, created_at) VALUES
(3,  'Sofía Hernández Torres',  'HETS950102MDFRRN07', 'sofia.hernandez@distribank.mx',
 '$2b$12$MnOpQrStUvWxYzAB3Cd4EfGhIjKlLK9Xv3mN2pQ8wR1tY7uZoOeWsA', '2024-02-01 08:20:00'),
(6,  'Miguel Ángel Vargas Ruiz','VARM830612HDFRZG04', 'miguel.vargas@distribank.mx',
 '$2b$12$RsTuVwXyZaBC4De5FgHiJkLmNoP67QrLK9Xv3mN2pQ8wR1tY7uZoOeW', '2024-03-20 16:25:00'),
(9,  'Camila Ortiz Vega',       'OVAC030720MDFRGM03', 'camila.ortiz@distribank.mx',
 '$2b$12$UvWxYzABCD5Ef6GhIjKlMnOpQr78StLK9Xv3mN2pQ8wR1tY7uZoOeWs', '2024-05-07 10:05:00'),
(12, 'Andrés Castillo Fuentes', 'CAFA921014HDFSNR03', 'andres.castillo@distribank.mx',
 '$2b$12$ZaBC4De5FgHiJkLmNoP67QrStLK9Xv3mN2pQ8wR1tY7uZoOeWsAiBjC', '2024-03-10 09:00:00'),
(15, 'Elena Gutiérrez Vázquez', 'VUGE950228MDFRZL01', 'elena.gutierrez@distribank.mx',
 '$2b$12$AbCD5Ef6GhIjKlMnOpQr78StULK9Xv3mN2pQ8wR1tY7uZoOeWsAiBjCd', '2024-04-05 11:30:00'),
(18, 'Ricardo Pérez Mendoza',   'PEMR801123HDFRCD09', 'ricardo.perez@distribank.mx',
 '$2b$12$BcDE6Fg7HiJkLmNoP67QrStUvLK9Xv3mN2pQ8wR1tY7uZoOeWsAiBjCd', '2024-02-18 14:45:00'),
(21, 'Patricia Díaz Lara',      'DIAP880301MDFRZP03', 'patricia.diaz@distribank.mx',
 '$2b$12$CdEF7Gh8IjKlMnOpQr78StUvWLK9Xv3mN2pQ8wR1tY7uZoOeWsAiBjCd', '2024-01-25 10:10:00'),
(24, 'Alberto Ramírez Flores',  'RAFA850920HDFRML04', 'alberto.ramirez@distribank.mx',
 '$2b$12$DeGF8Hi9JkLmNoP67QrStUvWxLK9Xv3mN2pQ8wR1tY7uZoOeWsAiBjCd', '2024-05-30 08:50:00'),
(27, 'Natalia Ruiz Castillo',   'RUCN940418MDFRZL09', 'natalia.ruiz@distribank.mx',
 '$2b$12$EfGH9Ij0KlMnOpQr78StUvWxYLK9Xv3mN2pQ8wR1tY7uZoOeWsAiBjCd', '2024-01-08 09:20:00'),
(30, 'Raúl Sánchez Espinoza',   'SAER841205HDFNCP01', 'raul.sanchez@distribank.mx',
 '$2b$12$FgHI0Jk1LmNoP67QrStUvWxYzLK9Xv3mN2pQ8wR1tY7uZoOeWsAiBjCd', '2024-04-14 15:30:00');


-- -----------------------------------------------------------------------------
-- accounts
-- -----------------------------------------------------------------------------
INSERT INTO accounts (
    id, account_number, account_type, balance,
    credit_limit, available_credit, overdraft_limit,
    last_limit_increase_at, status, week_transactions, created_at
) VALUES
-- CHECKING accounts (credit_limit=NULL, available_credit=NULL)
(3,  'DISTCHK0000000003', 'CHECKING', 87500.75, NULL, NULL, 1000.00,
 NULL,                    'ACTIVE', 15, '2024-02-01 08:25:00'),
(6,  'DISTCHK0000000006', 'CHECKING', 22100.00, NULL, NULL,  750.00,
 '2024-07-15 00:00:00',   'ACTIVE',  5, '2024-03-20 16:30:00'),
(9,  'DISTCHK0000000009', 'CHECKING',  1250.00, NULL, NULL,  300.00,
 NULL,                    'ACTIVE',  1, '2024-05-07 10:10:00'),
(12, 'DISTCHK0000000012', 'CHECKING', 34500.00, NULL, NULL,  500.00,
 NULL,                    'ACTIVE',  4, '2024-03-10 09:05:00'),
(15, 'DISTCHK0000000015', 'CHECKING',  5600.50, NULL, NULL,  200.00,
 NULL,                    'ACTIVE',  2, '2024-04-05 11:35:00'),
(18, 'DISTCHK0000000018', 'CHECKING', 18900.00, NULL, NULL,  600.00,
 '2024-08-01 00:00:00',   'ACTIVE',  6, '2024-02-18 14:50:00'),
(21, 'DISTCHK0000000021', 'CHECKING',  9200.00, NULL, NULL,  400.00,
 NULL,                    'ACTIVE',  3, '2024-01-25 10:15:00'),
(24, 'DISTCHK0000000024', 'CHECKING',  2100.75, NULL, NULL,  150.00,
 NULL,                    'ACTIVE',  1, '2024-05-30 08:55:00'),
(27, 'DISTCHK0000000027', 'CHECKING', 56000.00, NULL, NULL, 1500.00,
 '2024-09-10 00:00:00',   'ACTIVE',  8, '2024-01-08 09:25:00'),
(30, 'DISTCHK0000000030', 'CHECKING',   800.00, NULL, NULL,  350.00,
 NULL,                    'ACTIVE',  0, '2024-04-14 15:35:00'),
-- CREDIT accounts (overdraft_limit=NULL)
(32, 'DISTCRD0000000002', 'CREDIT',  -5200.00, 15000.00,  9800.00, NULL,
 '2025-03-01 00:00:00',   'ACTIVE',  2, '2024-02-01 08:30:00'),
(36, 'DISTCRD0000000006', 'CREDIT',  -2100.50,  8000.00,  5899.50, NULL,
 '2025-01-15 00:00:00',   'ACTIVE',  3, '2024-03-10 09:10:00'),
(40, 'DISTCRD0000000010', 'CREDIT',   -800.00,  6000.00,  5200.00, NULL,
 NULL,                    'ACTIVE',  2, '2024-01-25 10:20:00'),
(43, 'DISTCRD0000000013', 'CREDIT', -12000.00, 20000.00,  8000.00, NULL,
 '2025-02-10 00:00:00',   'ACTIVE',  4, '2024-01-08 09:30:00'),
(45, 'DISTCRD0000000015', 'CREDIT',  -3500.00, 10000.00,  6500.00, NULL,
 NULL,                    'ACTIVE',  3, '2024-04-14 15:40:00');


-- -----------------------------------------------------------------------------
-- customer_accounts
-- -----------------------------------------------------------------------------
INSERT INTO customer_accounts (customer_id, checking_account_id, credit_account_id) VALUES
(3,  3,  32),
(6,  6,  NULL),
(9,  9,  NULL),
(12, 12, 36),
(15, 15, NULL),
(18, 18, NULL),
(21, 21, 40),
(24, 24, NULL),
(27, 27, 43),
(30, 30, 45);


-- -----------------------------------------------------------------------------
-- cards
-- -----------------------------------------------------------------------------
INSERT INTO cards (id, account_id, card_number, card_type, cvv, expiration_date, status, daily_limit, issued_at) VALUES
-- Cuenta 3 (CHECKING) — tarjeta titular + adicional
(1,  3,  '4111000000000001', 'DEBIT',  '123', '2027-01-31', 'ACTIVE',   5000.00, '2024-02-01 09:10:00'),
(2,  3,  '4111000000000002', 'DEBIT',  '456', '2027-01-31', 'ACTIVE',   2000.00, '2024-03-15 10:00:00'),
-- Cuenta 6 (CHECKING)
(3,  6,  '4111000000000003', 'DEBIT',  '789', '2027-09-30', 'ACTIVE',   8000.00, '2024-03-20 16:35:00'),
-- Cuenta 9 (CHECKING)
(4,  9,  '4111000000000004', 'DEBIT',  '321', '2026-03-31', 'ACTIVE',   1500.00, '2024-05-07 10:15:00'),
-- Cuenta 12 (CHECKING)
(5,  12, '4111000000000005', 'DEBIT',  '654', '2028-03-31', 'ACTIVE',  10000.00, '2024-03-10 09:10:00'),
-- Cuenta 15 (CHECKING) — bloqueada
(6,  15, '4111000000000006', 'DEBIT',  '987', '2027-06-30', 'BLOCKED',  1000.00, '2024-04-05 11:40:00'),
-- Cuenta 18 (CHECKING)
(7,  18, '4111000000000007', 'DEBIT',  '111', '2027-12-31', 'ACTIVE',   6000.00, '2024-02-18 14:55:00'),
-- Cuenta 21 (CHECKING)
(8,  21, '4111000000000008', 'DEBIT',  '222', '2028-06-30', 'ACTIVE',   4000.00, '2024-01-25 10:20:00'),
-- Cuenta 24 (CHECKING)
(9,  24, '4111000000000009', 'DEBIT',  '333', '2026-09-30', 'ACTIVE',   2000.00, '2024-05-30 09:00:00'),
-- Cuenta 27 (CHECKING) — titular + adicional
(10, 27, '4111000000000010', 'DEBIT',  '444', '2028-09-30', 'ACTIVE',  15000.00, '2024-01-08 09:30:00'),
(11, 27, '4111000000000011', 'DEBIT',  '555', '2027-03-31', 'ACTIVE',   5000.00, '2024-06-01 10:00:00'),
-- Cuenta 30 (CHECKING) — vencida
(12, 30, '4111000000000012', 'DEBIT',  '666', '2025-01-31', 'EXPIRED',     NULL, '2023-01-15 09:00:00'),
-- Cuenta 32 (CREDIT) — titular + extensión
(13, 32, '5500000000000013', 'CREDIT', '777', '2027-01-31', 'ACTIVE',  15000.00, '2024-02-01 09:15:00'),
(14, 32, '5500000000000014', 'CREDIT', '888', '2027-01-31', 'ACTIVE',   5000.00, '2024-06-10 11:00:00'),
-- Cuenta 36 (CREDIT)
(15, 36, '5500000000000015', 'CREDIT', '999', '2028-03-31', 'ACTIVE',   8000.00, '2024-03-10 09:15:00'),
-- Cuenta 40 (CREDIT)
(16, 40, '5500000000000016', 'CREDIT', '100', '2027-06-30', 'ACTIVE',   6000.00, '2024-01-25 10:25:00'),
-- Cuenta 43 (CREDIT) — titular + extensión bloqueada
(17, 43, '5500000000000017', 'CREDIT', '200', '2028-09-30', 'ACTIVE',  20000.00, '2024-01-08 09:35:00'),
(18, 43, '5500000000000018', 'CREDIT', '300', '2027-09-30', 'BLOCKED', 10000.00, '2024-07-20 14:00:00'),
-- Cuenta 45 (CREDIT)
(19, 45, '5500000000000019', 'CREDIT', '400', '2028-03-31', 'ACTIVE',  10000.00, '2024-04-14 15:45:00');


-- -----------------------------------------------------------------------------
-- transactions
-- Todas intra-nodo: from_account y to_account pertenecen a clientes del Nodo A.
-- -----------------------------------------------------------------------------
INSERT INTO transactions (
    id, transaction_uuid, from_account_id, to_account_id, card_id,
    amount, transaction_type, status, initiated_at, completed_at
) VALUES
(1,  '00000000-0000-4000-8000-000000000001', 3,  6,  NULL, 2500.00, 'TRANSFER',   'COMPLETED',   '2025-06-01 10:00:00', '2025-06-01 10:00:05'),
(2,  '00000000-0000-4000-8000-000000000002', 6,  3,  NULL, 1800.00, 'TRANSFER',   'COMPLETED',   '2025-06-02 09:00:00', '2025-06-02 09:00:03'),
(3,  '00000000-0000-4000-8000-000000000003', 12, 9,  NULL, 5000.00, 'DEPOSIT',    'COMPLETED',   '2025-06-03 14:30:00', '2025-06-03 14:30:02'),
(4,  '00000000-0000-4000-8000-000000000004', 27, 18, NULL,12000.00, 'TRANSFER',   'COMPLETED',   '2025-06-04 09:00:00', '2025-06-04 09:00:04'),
(5,  '00000000-0000-4000-8000-000000000005', 3,  9,  1,     850.00, 'PURCHASE',   'COMPLETED',   '2025-06-05 12:15:00', '2025-06-05 12:15:04'),
(6,  '00000000-0000-4000-8000-000000000006', 32, 21, 13,  3200.00, 'PURCHASE',   'COMPLETED',   '2025-06-06 18:00:00', '2025-06-06 18:00:06'),
(7,  '00000000-0000-4000-8000-000000000007', 36, 12, 15,  1500.00, 'PURCHASE',   'COMPLETED',   '2025-06-07 11:00:00', '2025-06-07 11:00:05'),
(8,  '00000000-0000-4000-8000-000000000008', 18, 24, NULL, 3000.00, 'TRANSFER',   'COMPLETED',   '2025-06-08 10:00:00', '2025-06-08 10:00:03'),
(9,  '00000000-0000-4000-8000-000000000009', 27, 30, NULL, 5500.00, 'TRANSFER',   'COMPLETED',   '2025-06-09 16:00:00', '2025-06-09 16:00:04'),
(10, '00000000-0000-4000-8000-000000000010', 40, 6,  16,    900.00, 'PURCHASE',   'COMPLETED',   '2025-06-10 08:00:00', '2025-06-10 08:00:04'),
(11, '00000000-0000-4000-8000-000000000011', 43, 27, 17,  4500.00, 'PURCHASE',   'COMPLETED',   '2025-06-11 15:20:00', '2025-06-11 15:20:06'),
(12, '00000000-0000-4000-8000-000000000012', 21, 15, NULL,  700.00, 'TRANSFER',   'PENDING',     '2025-06-12 13:00:00', NULL),
(13, '00000000-0000-4000-8000-000000000013', 30, 18, NULL,  400.00, 'TRANSFER',   'COMPLETED',   '2025-06-13 09:30:00', '2025-06-13 09:30:02'),
(14, '00000000-0000-4000-8000-000000000014', 6,  12, NULL, 2000.00, 'TRANSFER',   'FAILED',      '2025-06-14 17:00:00', '2025-06-14 17:00:01'),
(15, '00000000-0000-4000-8000-000000000015', 45, 30, 19,  6000.00, 'PURCHASE',   'ROLLED_BACK', '2025-06-15 14:00:00', '2025-06-15 14:05:00');


-- -----------------------------------------------------------------------------
-- transaction_log
-- 12 COMPLETED × 4 eventos = 48
--  1 PENDING   × 1 evento  =  1
--  1 COMPLETED × 4 eventos =  4  (T13)
--  1 FAILED    × 2 eventos =  2  (T14)
--  1 ROLLED_BACK × 4       =  4  (T15)
-- Total = 59 ... reajustado a 55 (T3 como DEPOSIT usa solo 3 eventos distintos)
-- Se usa la estructura estándar para consistencia académica.
-- -----------------------------------------------------------------------------
INSERT INTO transaction_log (id, transaction_id, event_type, details, created_at) VALUES
-- T1: TRANSFER COMPLETED (acc3 → acc6, 2500.00)
(1,  1, 'INITIATED',     '{"ip": "192.168.1.10", "channel": "app_mobile"}',                                       '2025-06-01 10:00:00'),
(2,  1, 'DEBIT_APPLIED', '{"account_id": 3,  "prev_balance": 90000.75, "new_balance": 87500.75}',                  '2025-06-01 10:00:01'),
(3,  1, 'CREDIT_APPLIED','{"account_id": 6,  "prev_balance": 19600.00, "new_balance": 22100.00}',                  '2025-06-01 10:00:03'),
(4,  1, 'COMPLETED',     '{"latency_ms": 5000}',                                                                   '2025-06-01 10:00:05'),
-- T2: TRANSFER COMPLETED (acc6 → acc3, 1800.00)
(5,  2, 'INITIATED',     '{"ip": "10.0.1.55", "channel": "app_web"}',                                             '2025-06-02 09:00:00'),
(6,  2, 'DEBIT_APPLIED', '{"account_id": 6,  "prev_balance": 22100.00, "new_balance": 20300.00}',                  '2025-06-02 09:00:01'),
(7,  2, 'CREDIT_APPLIED','{"account_id": 3,  "prev_balance": 87500.75, "new_balance": 89300.75}',                  '2025-06-02 09:00:02'),
(8,  2, 'COMPLETED',     '{"latency_ms": 3000}',                                                                   '2025-06-02 09:00:03'),
-- T3: DEPOSIT COMPLETED (acc12 → acc9, 5000.00)
(9,  3, 'INITIATED',     '{"channel": "branch_teller", "teller_id": "TLR-021"}',                                  '2025-06-03 14:30:00'),
(10, 3, 'DEBIT_APPLIED', '{"account_id": 12, "prev_balance": 39500.00, "new_balance": 34500.00}',                  '2025-06-03 14:30:01'),
(11, 3, 'CREDIT_APPLIED','{"account_id": 9,  "prev_balance": -3750.00, "new_balance": 1250.00}',                   '2025-06-03 14:30:01'),
(12, 3, 'COMPLETED',     '{"latency_ms": 2000}',                                                                   '2025-06-03 14:30:02'),
-- T4: TRANSFER COMPLETED (acc27 → acc18, 12000.00)
(13, 4, 'INITIATED',     '{"ip": "172.16.0.5", "channel": "app_mobile"}',                                         '2025-06-04 09:00:00'),
(14, 4, 'DEBIT_APPLIED', '{"account_id": 27, "prev_balance": 68000.00, "new_balance": 56000.00}',                  '2025-06-04 09:00:01'),
(15, 4, 'CREDIT_APPLIED','{"account_id": 18, "prev_balance": 6900.00,  "new_balance": 18900.00}',                  '2025-06-04 09:00:02'),
(16, 4, 'COMPLETED',     '{"latency_ms": 4000}',                                                                   '2025-06-04 09:00:04'),
-- T5: PURCHASE COMPLETED (acc3 → acc9, card1, 850.00)
(17, 5, 'INITIATED',     '{"card_id": 1, "channel": "pos", "merchant": "Supermercados La Feria"}',                '2025-06-05 12:15:00'),
(18, 5, 'DEBIT_APPLIED', '{"account_id": 3,  "prev_balance": 88350.75, "new_balance": 87500.75}',                  '2025-06-05 12:15:02'),
(19, 5, 'CREDIT_APPLIED','{"account_id": 9,  "prev_balance": 400.00,   "new_balance": 1250.00}',                  '2025-06-05 12:15:03'),
(20, 5, 'COMPLETED',     '{"latency_ms": 4000}',                                                                   '2025-06-05 12:15:04'),
-- T6: PURCHASE COMPLETED (acc32 → acc21, card13, 3200.00)
(21, 6, 'INITIATED',     '{"card_id": 13, "channel": "ecommerce", "merchant": "Liverpool Online"}',               '2025-06-06 18:00:00'),
(22, 6, 'DEBIT_APPLIED', '{"account_id": 32, "prev_balance": -2000.00, "new_balance": -5200.00}',                  '2025-06-06 18:00:02'),
(23, 6, 'CREDIT_APPLIED','{"account_id": 21, "prev_balance": 6000.00,  "new_balance": 9200.00}',                  '2025-06-06 18:00:04'),
(24, 6, 'COMPLETED',     '{"latency_ms": 6000}',                                                                   '2025-06-06 18:00:06'),
-- T7: PURCHASE COMPLETED (acc36 → acc12, card15, 1500.00)
(25, 7, 'INITIATED',     '{"card_id": 15, "channel": "pos", "merchant": "Coppel Sucursal 42"}',                   '2025-06-07 11:00:00'),
(26, 7, 'DEBIT_APPLIED', '{"account_id": 36, "prev_balance": -600.50,  "new_balance": -2100.50}',                  '2025-06-07 11:00:02'),
(27, 7, 'CREDIT_APPLIED','{"account_id": 12, "prev_balance": 33000.00, "new_balance": 34500.00}',                 '2025-06-07 11:00:03'),
(28, 7, 'COMPLETED',     '{"latency_ms": 5000}',                                                                   '2025-06-07 11:00:05'),
-- T8: TRANSFER COMPLETED (acc18 → acc24, 3000.00)
(29, 8, 'INITIATED',     '{"ip": "192.168.2.30", "channel": "app_web"}',                                          '2025-06-08 10:00:00'),
(30, 8, 'DEBIT_APPLIED', '{"account_id": 18, "prev_balance": 21900.00, "new_balance": 18900.00}',                  '2025-06-08 10:00:01'),
(31, 8, 'CREDIT_APPLIED','{"account_id": 24, "prev_balance": -899.25,  "new_balance": 2100.75}',                  '2025-06-08 10:00:02'),
(32, 8, 'COMPLETED',     '{"latency_ms": 3000}',                                                                   '2025-06-08 10:00:03'),
-- T9: TRANSFER COMPLETED (acc27 → acc30, 5500.00)
(33, 9, 'INITIATED',     '{"ip": "10.0.2.10", "channel": "app_mobile"}',                                          '2025-06-09 16:00:00'),
(34, 9, 'DEBIT_APPLIED', '{"account_id": 27, "prev_balance": 61500.00, "new_balance": 56000.00}',                 '2025-06-09 16:00:01'),
(35, 9, 'CREDIT_APPLIED','{"account_id": 30, "prev_balance": -4700.00, "new_balance": 800.00}',                   '2025-06-09 16:00:03'),
(36, 9, 'COMPLETED',     '{"latency_ms": 4000}',                                                                   '2025-06-09 16:00:04'),
-- T10: PURCHASE COMPLETED (acc40 → acc6, card16, 900.00)
(37, 10,'INITIATED',     '{"card_id": 16, "channel": "pos", "merchant": "Farmacia Benavides"}',                   '2025-06-10 08:00:00'),
(38, 10,'DEBIT_APPLIED', '{"account_id": 40, "prev_balance": 100.00,   "new_balance": -800.00}',                  '2025-06-10 08:00:01'),
(39, 10,'CREDIT_APPLIED','{"account_id": 6,  "prev_balance": 21200.00, "new_balance": 22100.00}',                 '2025-06-10 08:00:02'),
(40, 10,'COMPLETED',     '{"latency_ms": 4000}',                                                                   '2025-06-10 08:00:04'),
-- T11: PURCHASE COMPLETED (acc43 → acc27, card17, 4500.00)
(41, 11,'INITIATED',     '{"card_id": 17, "channel": "ecommerce", "merchant": "Electrónica Total"}',              '2025-06-11 15:20:00'),
(42, 11,'DEBIT_APPLIED', '{"account_id": 43, "prev_balance": -7500.00, "new_balance": -12000.00}',                '2025-06-11 15:20:02'),
(43, 11,'CREDIT_APPLIED','{"account_id": 27, "prev_balance": 51500.00, "new_balance": 56000.00}',                 '2025-06-11 15:20:04'),
(44, 11,'COMPLETED',     '{"latency_ms": 6000}',                                                                   '2025-06-11 15:20:06'),
-- T12: TRANSFER PENDING (acc21 → acc15, 700.00)
(45, 12,'INITIATED',     '{"ip": "192.168.3.21", "channel": "app_mobile"}',                                       '2025-06-12 13:00:00'),
-- T13: TRANSFER COMPLETED (acc30 → acc18, 400.00)
(46, 13,'INITIATED',     '{"channel": "branch_teller", "teller_id": "TLR-009"}',                                  '2025-06-13 09:30:00'),
(47, 13,'DEBIT_APPLIED', '{"account_id": 30, "prev_balance": 1200.00,  "new_balance": 800.00}',                   '2025-06-13 09:30:01'),
(48, 13,'CREDIT_APPLIED','{"account_id": 18, "prev_balance": 18500.00, "new_balance": 18900.00}',                 '2025-06-13 09:30:01'),
(49, 13,'COMPLETED',     '{"latency_ms": 2000}',                                                                   '2025-06-13 09:30:02'),
-- T14: TRANSFER FAILED (acc6 → acc12, 2000.00) — fondos insuficientes
(50, 14,'INITIATED',     '{"ip": "10.0.1.55", "channel": "app_web"}',                                             '2025-06-14 17:00:00'),
(51, 14,'FAILED',        '{"reason": "insufficient_funds", "balance": 22100.00, "decline_code": "51"}',            '2025-06-14 17:00:01'),
-- T15: PURCHASE ROLLED_BACK (acc45 → acc30, card19, 6000.00)
(52, 15,'INITIATED',     '{"card_id": 19, "channel": "ecommerce", "merchant": "Coppel en Línea"}',                '2025-06-15 14:00:00'),
(53, 15,'DEBIT_APPLIED', '{"account_id": 45, "prev_balance": 2500.00,  "new_balance": -3500.00}',                 '2025-06-15 14:00:30'),
(54, 15,'CREDIT_APPLIED','{"account_id": 30, "prev_balance": -5200.00, "new_balance": 800.00}',                   '2025-06-15 14:01:00'),
(55, 15,'COMPENSATED',   '{"reason": "reconciliation_error", "original_tx_id": 15, "compensation": {"account_45_restored": 2500.00, "account_30_restored": -5200.00}}', '2025-06-15 14:05:00');


-- -----------------------------------------------------------------------------
-- Reseteo de secuencias
-- -----------------------------------------------------------------------------
SELECT setval('customers_id_seq',       (SELECT MAX(id) FROM customers));
SELECT setval('accounts_id_seq',        (SELECT MAX(id) FROM accounts));
SELECT setval('cards_id_seq',           (SELECT MAX(id) FROM cards));
SELECT setval('transactions_id_seq',    (SELECT MAX(id) FROM transactions));
SELECT setval('transaction_log_id_seq', (SELECT MAX(id) FROM transaction_log));

-- COMMIT;
