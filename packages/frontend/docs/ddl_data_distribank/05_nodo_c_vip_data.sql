-- =============================================================================
-- DistriBank — Datos Schema VIP
-- Schema: distribank_vip_customers (Nodo C / Supabase)
-- =============================================================================
-- CONTENIDO: réplica consolidada de los 19 clientes VIP (week_tx ≥ 3)
-- provenientes de los tres nodos. Ejecutar DESPUÉS de 04_ddl_vip_schema.sql.
--
-- CLIENTES POR NODO DE ORIGEN:
--   Nodo A (customer_id % 3 = 0):
--     Sofía(3), Miguel(6), Andrés(12), Ricardo(18),
--     Patricia(21), Natalia(27), Raúl(30)
--   Nodo B (customer_id % 3 = 1):
--     Ana(1), Diego(10), Daniela(13), Alejandra(19),
--     Cristina(25), Ernesto(28)
--   Nodo C (customer_id % 3 = 2 — nativos de este nodo):
--     Carlos(2), Valentina(5), Fernando(8), Beatriz(11),
--     Iván(20), Tomás(26)
--
-- TRANSACCIONES EXCLUIDAS DEL SCHEMA VIP:
--   T27 (Nodo B): from_account_id=16 → Samuel Flores, no-VIP (acc16 FROZEN)
--   T43 (Nodo C): from_account_id=29 → Silvia Ponce, no-VIP
--   Los logs correspondientes (100-101 y 156-159) también son excluidos.
--
-- VOLUMEN:
--   customers:       19 filas
--   accounts:        32 filas
--   customer_accounts: 19 filas
--   cards:           42 filas
--   transactions:    43 filas
--   transaction_log: 159 filas
-- =============================================================================

SET search_path TO distribank_vip_customers;

BEGIN;

-- =============================================================================
-- customers
-- =============================================================================

-- --- Nodo A ---
INSERT INTO customers (id, name, curp, email, password, created_at) VALUES
(3,  'Sofía Hernández Torres',  'HETS950102MDFRRN07', 'sofia.hernandez@distribank.mx',
 '$2b$12$MnOpQrStUvWxYzAB3Cd4EfGhIjKlLK9Xv3mN2pQ8wR1tY7uZoOeWsA', '2024-02-01 08:20:00'),
(6,  'Miguel Ángel Vargas Ruiz','VARM830612HDFRZG04', 'miguel.vargas@distribank.mx',
 '$2b$12$RsTuVwXyZaBC4De5FgHiJkLmNoP67QrLK9Xv3mN2pQ8wR1tY7uZoOeW', '2024-03-20 16:25:00'),
(12, 'Andrés Castillo Fuentes', 'CAFA921014HDFSNR03', 'andres.castillo@distribank.mx',
 '$2b$12$ZaBC4De5FgHiJkLmNoP67QrStLK9Xv3mN2pQ8wR1tY7uZoOeWsAiBjC', '2024-03-10 09:00:00'),
(18, 'Ricardo Pérez Mendoza',   'PEMR801123HDFRCD09', 'ricardo.perez@distribank.mx',
 '$2b$12$BcDE6Fg7HiJkLmNoP67QrStUvLK9Xv3mN2pQ8wR1tY7uZoOeWsAiBjCd', '2024-02-18 14:45:00'),
(21, 'Patricia Díaz Lara',      'DIAP880301MDFRZP03', 'patricia.diaz@distribank.mx',
 '$2b$12$CdEF7Gh8IjKlMnOpQr78StUvWLK9Xv3mN2pQ8wR1tY7uZoOeWsAiBjCd', '2024-01-25 10:10:00'),
(27, 'Natalia Ruiz Castillo',   'RUCN940418MDFRZL09', 'natalia.ruiz@distribank.mx',
 '$2b$12$EfGH9Ij0KlMnOpQr78StUvWxYLK9Xv3mN2pQ8wR1tY7uZoOeWsAiBjCd', '2024-01-08 09:20:00'),
(30, 'Raúl Sánchez Espinoza',   'SAER841205HDFNCP01', 'raul.sanchez@distribank.mx',
 '$2b$12$FgHI0Jk1LmNoP67QrStUvWxYzLK9Xv3mN2pQ8wR1tY7uZoOeWsAiBjCd', '2024-04-14 15:30:00');

-- --- Nodo B ---
INSERT INTO customers (id, name, curp, email, password, created_at) VALUES
(1,  'Ana García Reyes',       'GARA920315MDFRYNO8', 'ana.garcia@distribank.mx',
 '$2b$12$LK9Xv3mN2pQ8wR1tY7uZoOeWsAiBjCdEfGhIjKlMnOpQrStUvWxYz',     '2024-01-10 09:05:00'),
(10, 'Diego Torres Sandoval',  'TOSD860915HDFRND00', 'diego.torres@distribank.mx',
 '$2b$12$VwXyZaBC4De5FgHiJkLmNoP67Qr9StLK9Xv3mN2pQ8wR1tY7uZoOeWs',  '2024-05-22 15:50:00'),
(13, 'Daniela Herrera Sánchez','HESD000805MDFRNL06', 'daniela.herrera@distribank.mx',
 '$2b$12$WxYzABCD5Ef6GhIjKlMnOpQr78StULK9Xv3mN2pQ8wR1tY7uZoOeWsA',  '2024-03-18 11:20:00'),
(19, 'Alejandra Gómez Ruiz',   'GORA930714MDFRMJ05', 'alejandra.gomez@distribank.mx',
 '$2b$12$YzABCD5Ef6GhIjKlMnOpQr78StUvWLK9Xv3mN2pQ8wR1tY7uZoOeWsAiB','2024-02-28 13:15:00'),
(25, 'Cristina Vega Morales',  'VEMC960305MDFRLR02', 'cristina.vega@distribank.mx',
 '$2b$12$AbCD5Ef6GhIjKlMnOpQr78StUvWxYLK9Xv3mN2pQ8wR1tY7uZoOeWsAiBjC','2024-01-30 12:00:00'),
(28, 'Ernesto Gómez Salinas',  'GOSE760129HDFRMR03', 'ernesto.gomez@distribank.mx',
 '$2b$12$BcDE6Fg7HiJkLmNoP67QrStUvWxYzLK9Xv3mN2pQ8wR1tY7uZoOeWsAiBjC','2024-03-05 09:50:00');

-- --- Nodo C ---
INSERT INTO customers (id, name, curp, email, password, created_at) VALUES
(2,  'Carlos Mendoza López',    'MELC880925HDFRND06', 'carlos.mendoza@distribank.mx',
 '$2b$12$NoPqRsTuVwXyZaBC4De5FgHiJkLmLK9Xv3mN2pQ8wR1tY7uZoOeWsAi',  '2024-01-15 11:00:00'),
(5,  'Valentina Morales Ramos', 'MARV960702MDFRMLN5', 'valentina.morales@distribank.mx',
 '$2b$12$QrStUvWxYzABC4De5FgHiJkLmNoLK9Xv3mN2pQ8wR1tY7uZoOeWsAiBj', '2024-02-28 10:30:00'),
(8,  'Fernando Jiménez Solis',  'JISF840310HDFRMRN3', 'fernando.jimenez@distribank.mx',
 '$2b$12$TuVwXyZaBC4De5FgHiJkLmNoPqLK9Xv3mN2pQ8wR1tY7uZoOeWsAiBjCd', '2024-04-18 13:00:00'),
(11, 'Beatriz Luna Carrillo',   'LUCB010615MDFRRTN0', 'beatriz.luna@distribank.mx',
 '$2b$12$WxYzABCD5Ef6GhIjKlMnOpQr7LK9Xv3mN2pQ8wR1tY7uZoOeWsAiBjCdEf', '2024-03-25 15:10:00'),
(20, 'Iván Elizalde Torres',    'ELTI820517HDFRLTV4', 'ivan.elizalde@distribank.mx',
 '$2b$12$BcDEF6Fg7HiJkLmNoP67QrStLK9Xv3mN2pQ8wR1tY7uZoOeWsAiBjCdEfGhI', '2024-02-10 09:15:00'),
(26, 'Tomás Aguilar Medina',    'AGMT770930HDFRMDN7', 'tomas.aguilar@distribank.mx',
 '$2b$12$DeGHF8Hi9JkLmNoP67QrStUvLK9Xv3mN2pQ8wR1tY7uZoOeWsAiBjCdEfGhIjK', '2024-03-12 14:00:00');


-- =============================================================================
-- accounts  (32 filas: 7+5 Nodo A, 6+4 Nodo B, 6+4 Nodo C)
-- =============================================================================

-- --- Nodo A — CHECKING ---
INSERT INTO accounts (
    id, account_number, account_type, balance,
    credit_limit, available_credit, overdraft_limit,
    last_limit_increase_at, status, week_transactions, created_at
) VALUES
(3,  'DISTCHK0000000003', 'CHECKING', 87500.75, NULL, NULL, 1000.00, NULL,                   'ACTIVE', 15, '2024-02-01 08:25:00'),
(6,  'DISTCHK0000000006', 'CHECKING', 22100.00, NULL, NULL,  750.00, '2024-07-15 00:00:00',  'ACTIVE',  5, '2024-03-20 16:30:00'),
(12, 'DISTCHK0000000012', 'CHECKING', 34500.00, NULL, NULL,  500.00, NULL,                   'ACTIVE',  4, '2024-03-10 09:05:00'),
(18, 'DISTCHK0000000018', 'CHECKING', 18900.00, NULL, NULL,  600.00, '2024-08-01 00:00:00',  'ACTIVE',  6, '2024-02-18 14:50:00'),
(21, 'DISTCHK0000000021', 'CHECKING',  9200.00, NULL, NULL,  400.00, NULL,                   'ACTIVE',  3, '2024-01-25 10:15:00'),
(27, 'DISTCHK0000000027', 'CHECKING', 56000.00, NULL, NULL, 1500.00, '2024-09-10 00:00:00',  'ACTIVE',  8, '2024-01-08 09:25:00'),
(30, 'DISTCHK0000000030', 'CHECKING',   800.00, NULL, NULL,  350.00, NULL,                   'ACTIVE',  0, '2024-04-14 15:35:00');

-- --- Nodo A — CREDIT ---
INSERT INTO accounts (
    id, account_number, account_type, balance,
    credit_limit, available_credit, overdraft_limit,
    last_limit_increase_at, status, week_transactions, created_at
) VALUES
(32, 'DISTCRD0000000002', 'CREDIT',  -5200.00, 15000.00,  9800.00, NULL, '2025-03-01 00:00:00', 'ACTIVE', 2, '2024-02-01 08:30:00'),
(36, 'DISTCRD0000000006', 'CREDIT',  -2100.50,  8000.00,  5899.50, NULL, '2025-01-15 00:00:00', 'ACTIVE', 3, '2024-03-10 09:10:00'),
(40, 'DISTCRD0000000010', 'CREDIT',   -800.00,  6000.00,  5200.00, NULL, NULL,                  'ACTIVE', 2, '2024-01-25 10:20:00'),
(43, 'DISTCRD0000000013', 'CREDIT', -12000.00, 20000.00,  8000.00, NULL, '2025-02-10 00:00:00', 'ACTIVE', 4, '2024-01-08 09:30:00'),
(45, 'DISTCRD0000000015', 'CREDIT',  -3500.00, 10000.00,  6500.00, NULL, NULL,                  'ACTIVE', 3, '2024-04-14 15:40:00');

-- --- Nodo B — CHECKING ---
INSERT INTO accounts (
    id, account_number, account_type, balance,
    credit_limit, available_credit, overdraft_limit,
    last_limit_increase_at, status, week_transactions, created_at
) VALUES
(1,  'DISTCHK0000000001', 'CHECKING', 15420.50, NULL, NULL,   500.00, NULL,                  'ACTIVE',  8, '2024-01-10 09:10:00'),
(10, 'DISTCHK0000000010', 'CHECKING', 46000.00, NULL, NULL,  2000.00, '2024-09-10 00:00:00', 'ACTIVE', 12, '2024-05-22 15:55:00'),
(13, 'DISTCHK0000000013', 'CHECKING', 11500.00, NULL, NULL,   400.00, NULL,                  'ACTIVE',  5, '2024-03-18 11:25:00'),
(19, 'DISTCHK0000000019', 'CHECKING', 28000.00, NULL, NULL,   800.00, '2024-08-01 00:00:00', 'ACTIVE',  7, '2024-02-28 13:20:00'),
(25, 'DISTCHK0000000025', 'CHECKING', 19500.00, NULL, NULL,   700.00, NULL,                  'ACTIVE',  4, '2024-01-30 12:05:00'),
(28, 'DISTCHK0000000028', 'CHECKING',  7200.00, NULL, NULL,   350.00, NULL,                  'ACTIVE',  3, '2024-03-05 09:55:00');

-- --- Nodo B — CREDIT ---
INSERT INTO accounts (
    id, account_number, account_type, balance,
    credit_limit, available_credit, overdraft_limit,
    last_limit_increase_at, status, week_transactions, created_at
) VALUES
(31, 'DISTCRD0000000001', 'CREDIT',  -3200.00, 20000.00, 16800.00, NULL, '2025-03-01 00:00:00', 'ACTIVE', 6, '2024-01-10 09:15:00'),
(35, 'DISTCRD0000000005', 'CREDIT',      0.00, 25000.00, 25000.00, NULL, '2025-08-15 00:00:00', 'ACTIVE', 0, '2024-05-22 16:00:00'),
(39, 'DISTCRD0000000009', 'CREDIT',  -4500.00, 12000.00,  7500.00, NULL, '2025-01-20 00:00:00', 'ACTIVE', 3, '2024-02-28 13:25:00'),
(42, 'DISTCRD0000000012', 'CREDIT',  -9800.00, 18000.00,  8200.00, NULL, '2025-04-05 00:00:00', 'ACTIVE', 5, '2024-01-30 12:10:00');

-- --- Nodo C — CHECKING ---
INSERT INTO accounts (
    id, account_number, account_type, balance,
    credit_limit, available_credit, overdraft_limit,
    last_limit_increase_at, status, week_transactions, created_at
) VALUES
(2,  'DISTCHK0000000002', 'CHECKING', 42000.00, NULL, NULL, 2000.00, '2025-01-15 00:00:00', 'ACTIVE', 6, '2024-01-15 11:05:00'),
(5,  'DISTCHK0000000005', 'CHECKING', 18500.00, NULL, NULL,  800.00, NULL,                  'ACTIVE', 4, '2024-02-28 10:35:00'),
(8,  'DISTCHK0000000008', 'CHECKING',  6800.00, NULL, NULL,  500.00, NULL,                  'ACTIVE', 5, '2024-04-18 13:05:00'),
(11, 'DISTCHK0000000011', 'CHECKING',  9300.00, NULL, NULL,  300.00, NULL,                  'ACTIVE', 2, '2024-03-25 15:15:00'),
(20, 'DISTCHK0000000020', 'CHECKING', 22000.00, NULL, NULL,  700.00, '2024-10-05 00:00:00', 'ACTIVE', 4, '2024-02-10 09:20:00'),
(26, 'DISTCHK0000000026', 'CHECKING', 16000.00, NULL, NULL,  600.00, '2024-11-20 00:00:00', 'ACTIVE', 3, '2024-03-12 14:05:00');

-- --- Nodo C — CREDIT ---
INSERT INTO accounts (
    id, account_number, account_type, balance,
    credit_limit, available_credit, overdraft_limit,
    last_limit_increase_at, status, week_transactions, created_at
) VALUES
(33, 'DISTCRD0000000003', 'CREDIT',  -4800.00, 18000.00, 13200.00, NULL, '2025-02-01 00:00:00', 'ACTIVE', 3, '2024-01-15 11:10:00'),
(38, 'DISTCRD0000000008', 'CREDIT',  -1500.00,  8000.00,  6500.00, NULL, NULL,                  'ACTIVE', 1, '2024-03-25 15:20:00'),
(46, 'DISTCRD0000000016', 'CREDIT',  -2200.00, 10000.00,  7800.00, NULL, '2024-12-01 00:00:00', 'ACTIVE', 2, '2024-02-10 09:25:00'),
(47, 'DISTCRD0000000017', 'CREDIT',  -7500.00, 15000.00,  7500.00, NULL, '2025-03-10 00:00:00', 'ACTIVE', 2, '2024-03-12 14:10:00');


-- =============================================================================
-- customer_accounts  (19 filas)
-- =============================================================================
INSERT INTO customer_accounts (customer_id, checking_account_id, credit_account_id) VALUES
-- Nodo A
(3,  3,  32),
(6,  6,  NULL),
(12, 12, 36),
(18, 18, NULL),
(21, 21, 40),
(27, 27, 43),
(30, 30, 45),
-- Nodo B
(1,  1,  31),
(10, 10, 35),
(13, 13, NULL),
(19, 19, 39),
(25, 25, 42),
(28, 28, NULL),
-- Nodo C
(2,  2,  33),
(5,  5,  NULL),
(8,  8,  NULL),
(11, 11, 38),
(20, 20, 46),
(26, 26, 47);


-- =============================================================================
-- cards  (42 filas)
-- Excluidas: tarjetas de cuentas no-VIP
--   Nodo A: 4(acc9-Camila), 6(acc15-Elena), 9(acc24-Alberto)
--   Nodo B: 22(acc4-Roberto), 23(acc7-Lucía), 26(acc16-Samuel), 28(acc22-Hugo)
--   Nodo C: 42(acc14-Jorge), 43(acc17-Mónica), 45(acc23-Gabriela), 47(acc29-Silvia)
-- =============================================================================

-- --- Nodo A (16 cards) ---
INSERT INTO cards (id, account_id, card_number, card_type, cvv, expiration_date, status, daily_limit, issued_at) VALUES
(1,  3,  '4111000000000001', 'DEBIT',  '123', '2027-01-31', 'ACTIVE',   5000.00, '2024-02-01 09:10:00'),
(2,  3,  '4111000000000002', 'DEBIT',  '456', '2027-01-31', 'ACTIVE',   2000.00, '2024-03-15 10:00:00'),
(3,  6,  '4111000000000003', 'DEBIT',  '789', '2027-09-30', 'ACTIVE',   8000.00, '2024-03-20 16:35:00'),
(5,  12, '4111000000000005', 'DEBIT',  '654', '2028-03-31', 'ACTIVE',  10000.00, '2024-03-10 09:10:00'),
(7,  18, '4111000000000007', 'DEBIT',  '111', '2027-12-31', 'ACTIVE',   6000.00, '2024-02-18 14:55:00'),
(8,  21, '4111000000000008', 'DEBIT',  '222', '2028-06-30', 'ACTIVE',   4000.00, '2024-01-25 10:20:00'),
(10, 27, '4111000000000010', 'DEBIT',  '444', '2028-09-30', 'ACTIVE',  15000.00, '2024-01-08 09:30:00'),
(11, 27, '4111000000000011', 'DEBIT',  '555', '2027-03-31', 'ACTIVE',   5000.00, '2024-06-01 10:00:00'),
(12, 30, '4111000000000012', 'DEBIT',  '666', '2025-01-31', 'EXPIRED',     NULL, '2023-01-15 09:00:00'),
(13, 32, '5500000000000013', 'CREDIT', '777', '2027-01-31', 'ACTIVE',  15000.00, '2024-02-01 09:15:00'),
(14, 32, '5500000000000014', 'CREDIT', '888', '2027-01-31', 'ACTIVE',   5000.00, '2024-06-10 11:00:00'),
(15, 36, '5500000000000015', 'CREDIT', '999', '2028-03-31', 'ACTIVE',   8000.00, '2024-03-10 09:15:00'),
(16, 40, '5500000000000016', 'CREDIT', '100', '2027-06-30', 'ACTIVE',   6000.00, '2024-01-25 10:25:00'),
(17, 43, '5500000000000017', 'CREDIT', '200', '2028-09-30', 'ACTIVE',  20000.00, '2024-01-08 09:35:00'),
(18, 43, '5500000000000018', 'CREDIT', '300', '2027-09-30', 'BLOCKED', 10000.00, '2024-07-20 14:00:00'),
(19, 45, '5500000000000019', 'CREDIT', '400', '2028-03-31', 'ACTIVE',  10000.00, '2024-04-14 15:45:00');

-- --- Nodo B (13 cards) ---
INSERT INTO cards (id, account_id, card_number, card_type, cvv, expiration_date, status, daily_limit, issued_at) VALUES
(20, 1,  '4111000000000020', 'DEBIT',  '501', '2027-01-31', 'ACTIVE',   5000.00, '2024-01-10 09:15:00'),
(21, 1,  '4111000000000021', 'DEBIT',  '502', '2027-01-31', 'ACTIVE',   2000.00, '2024-03-20 10:30:00'),
(24, 10, '4111000000000024', 'DEBIT',  '505', '2028-09-30', 'ACTIVE',  15000.00, '2024-05-22 16:00:00'),
(25, 13, '4111000000000025', 'DEBIT',  '506', '2027-06-30', 'ACTIVE',   4000.00, '2024-03-18 11:30:00'),
(27, 19, '4111000000000027', 'DEBIT',  '508', '2028-03-31', 'ACTIVE',   7000.00, '2024-02-28 13:30:00'),
(29, 25, '4111000000000029', 'DEBIT',  '510', '2028-06-30', 'ACTIVE',   8000.00, '2024-01-30 12:10:00'),
(30, 28, '4111000000000030', 'DEBIT',  '511', '2027-12-31', 'ACTIVE',   3000.00, '2024-03-05 10:00:00'),
(31, 31, '5500000000000031', 'CREDIT', '601', '2027-01-31', 'ACTIVE',  20000.00, '2024-01-10 09:20:00'),
(32, 31, '5500000000000032', 'CREDIT', '602', '2027-06-30', 'ACTIVE',   8000.00, '2024-05-15 11:00:00'),
(33, 35, '5500000000000033', 'CREDIT', '603', '2028-09-30', 'ACTIVE',  25000.00, '2024-05-22 16:05:00'),
(34, 39, '5500000000000034', 'CREDIT', '604', '2028-03-31', 'ACTIVE',  12000.00, '2024-02-28 13:35:00'),
(35, 42, '5500000000000035', 'CREDIT', '605', '2028-06-30', 'ACTIVE',  18000.00, '2024-01-30 12:15:00'),
(36, 42, '5500000000000036', 'CREDIT', '606', '2027-03-31', 'BLOCKED',  5000.00, '2024-08-10 09:00:00');

-- --- Nodo C (13 cards) ---
INSERT INTO cards (id, account_id, card_number, card_type, cvv, expiration_date, status, daily_limit, issued_at) VALUES
(37, 2,  '4111000000000037', 'DEBIT',  '701', '2028-01-31', 'ACTIVE',  10000.00, '2024-01-15 11:10:00'),
(38, 2,  '4111000000000038', 'DEBIT',  '702', '2028-01-31', 'ACTIVE',   3000.00, '2024-07-01 09:00:00'),
(39, 5,  '4111000000000039', 'DEBIT',  '703', '2027-09-30', 'ACTIVE',   5000.00, '2024-02-28 10:40:00'),
(40, 8,  '4111000000000040', 'DEBIT',  '704', '2027-03-31', 'ACTIVE',   3000.00, '2024-04-18 13:10:00'),
(41, 11, '4111000000000041', 'DEBIT',  '705', '2028-06-30', 'ACTIVE',   4000.00, '2024-03-25 15:20:00'),
(44, 20, '4111000000000044', 'DEBIT',  '708', '2028-09-30', 'ACTIVE',   8000.00, '2024-02-10 09:30:00'),
(46, 26, '4111000000000046', 'DEBIT',  '710', '2028-03-31', 'ACTIVE',   6000.00, '2024-03-12 14:10:00'),
(48, 33, '5500000000000048', 'CREDIT', '801', '2028-01-31', 'ACTIVE',  18000.00, '2024-01-15 11:15:00'),
(49, 33, '5500000000000049', 'CREDIT', '802', '2027-07-31', 'ACTIVE',   5000.00, '2024-08-15 10:00:00'),
(50, 38, '5500000000000050', 'CREDIT', '803', '2028-06-30', 'ACTIVE',   8000.00, '2024-03-25 15:25:00'),
(51, 46, '5500000000000051', 'CREDIT', '804', '2028-09-30', 'ACTIVE',  10000.00, '2024-02-10 09:35:00'),
(52, 47, '5500000000000052', 'CREDIT', '805', '2028-03-31', 'ACTIVE',  15000.00, '2024-03-12 14:15:00'),
(53, 47, '5500000000000053', 'CREDIT', '806', '2027-09-30', 'BLOCKED',  4000.00, '2024-10-01 11:00:00');


-- =============================================================================
-- transactions  (43 filas)
-- T27 (Nodo B) y T43 (Nodo C) excluidas: from_account de clientes no-VIP.
-- to_account_id puede no existir en este schema — la FK fue eliminada.
-- =============================================================================

-- --- Nodo A (T1–T15, 15 transacciones) ---
INSERT INTO transactions (
    id, transaction_uuid, from_account_id, to_account_id, card_id,
    amount, transaction_type, status, initiated_at, completed_at
) VALUES
(1,  '00000000-0000-4000-8000-000000000001', 3,  6,  NULL,  2500.00, 'TRANSFER',   'COMPLETED',   '2025-06-01 10:00:00', '2025-06-01 10:00:05'),
(2,  '00000000-0000-4000-8000-000000000002', 6,  3,  NULL,  1800.00, 'TRANSFER',   'COMPLETED',   '2025-06-02 09:00:00', '2025-06-02 09:00:03'),
(3,  '00000000-0000-4000-8000-000000000003', 12, 9,  NULL,  5000.00, 'DEPOSIT',    'COMPLETED',   '2025-06-03 14:30:00', '2025-06-03 14:30:02'),
(4,  '00000000-0000-4000-8000-000000000004', 27, 18, NULL, 12000.00, 'TRANSFER',   'COMPLETED',   '2025-06-04 09:00:00', '2025-06-04 09:00:04'),
(5,  '00000000-0000-4000-8000-000000000005', 3,  9,  1,      850.00, 'PURCHASE',   'COMPLETED',   '2025-06-05 12:15:00', '2025-06-05 12:15:04'),
(6,  '00000000-0000-4000-8000-000000000006', 32, 21, 13,   3200.00, 'PURCHASE',   'COMPLETED',   '2025-06-06 18:00:00', '2025-06-06 18:00:06'),
(7,  '00000000-0000-4000-8000-000000000007', 36, 12, 15,   1500.00, 'PURCHASE',   'COMPLETED',   '2025-06-07 11:00:00', '2025-06-07 11:00:05'),
(8,  '00000000-0000-4000-8000-000000000008', 18, 24, NULL,  3000.00, 'TRANSFER',   'COMPLETED',   '2025-06-08 10:00:00', '2025-06-08 10:00:03'),
(9,  '00000000-0000-4000-8000-000000000009', 27, 30, NULL,  5500.00, 'TRANSFER',   'COMPLETED',   '2025-06-09 16:00:00', '2025-06-09 16:00:04'),
(10, '00000000-0000-4000-8000-000000000010', 40, 6,  16,     900.00, 'PURCHASE',   'COMPLETED',   '2025-06-10 08:00:00', '2025-06-10 08:00:04'),
(11, '00000000-0000-4000-8000-000000000011', 43, 27, 17,   4500.00, 'PURCHASE',   'COMPLETED',   '2025-06-11 15:20:00', '2025-06-11 15:20:06'),
(12, '00000000-0000-4000-8000-000000000012', 21, 15, NULL,   700.00, 'TRANSFER',   'PENDING',     '2025-06-12 13:00:00', NULL),
(13, '00000000-0000-4000-8000-000000000013', 30, 18, NULL,   400.00, 'TRANSFER',   'COMPLETED',   '2025-06-13 09:30:00', '2025-06-13 09:30:02'),
(14, '00000000-0000-4000-8000-000000000014', 6,  12, NULL,  2000.00, 'TRANSFER',   'FAILED',      '2025-06-14 17:00:00', '2025-06-14 17:00:01'),
(15, '00000000-0000-4000-8000-000000000015', 45, 30, 19,   6000.00, 'PURCHASE',   'ROLLED_BACK', '2025-06-15 14:00:00', '2025-06-15 14:05:00');

-- --- Nodo B (T16–T26, T28–T30, 14 transacciones) ---
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
-- T27 excluida (from_account_id=16, Samuel Flores, no-VIP)
(28, '00000000-0000-4000-8000-000000000028', 10, 13, NULL,  3000.00, 'TRANSFER',   'PENDING',     '2025-06-13 09:00:00', NULL),
(29, '00000000-0000-4000-8000-000000000029', 39, 1,  34,   2100.00, 'PURCHASE',   'COMPLETED',   '2025-06-14 19:00:00', '2025-06-14 19:00:05'),
(30, '00000000-0000-4000-8000-000000000030', 31, 7,  32,   7500.00, 'PURCHASE',   'ROLLED_BACK', '2025-06-15 13:00:00', '2025-06-15 13:05:00');

-- --- Nodo C (T31–T42, T44–T45, 14 transacciones) ---
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
-- T43 excluida (from_account_id=29, Silvia Ponce, no-VIP)
(44, '00000000-0000-4000-8000-000000000044', 5,  23, NULL,  9000.00, 'TRANSFER',   'FAILED',      '2025-06-14 18:00:00', '2025-06-14 18:00:01'),
(45, '00000000-0000-4000-8000-000000000045', 33, 29, 49,   8500.00, 'PURCHASE',   'ROLLED_BACK', '2025-06-15 11:00:00', '2025-06-15 11:05:00');


-- =============================================================================
-- transaction_log  (159 filas)
-- Nodo A: logs 1–55   (todos incluidos)
-- Nodo B: logs 56–99, 102–110  (excluidos 100–101 → T27 no-VIP)
-- Nodo C: logs 111–155, 160–165  (excluidos 156–159 → T43 no-VIP)
-- =============================================================================

-- --- Nodo A (55 logs) ---
INSERT INTO transaction_log (id, transaction_id, event_type, details, created_at) VALUES
(1,  1, 'INITIATED',     '{"ip": "192.168.1.10", "channel": "app_mobile"}',                                       '2025-06-01 10:00:00'),
(2,  1, 'DEBIT_APPLIED', '{"account_id": 3,  "prev_balance": 90000.75, "new_balance": 87500.75}',                 '2025-06-01 10:00:01'),
(3,  1, 'CREDIT_APPLIED','{"account_id": 6,  "prev_balance": 19600.00, "new_balance": 22100.00}',                 '2025-06-01 10:00:03'),
(4,  1, 'COMPLETED',     '{"latency_ms": 5000}',                                                                  '2025-06-01 10:00:05'),
(5,  2, 'INITIATED',     '{"ip": "10.0.1.55", "channel": "app_web"}',                                            '2025-06-02 09:00:00'),
(6,  2, 'DEBIT_APPLIED', '{"account_id": 6,  "prev_balance": 22100.00, "new_balance": 20300.00}',                 '2025-06-02 09:00:01'),
(7,  2, 'CREDIT_APPLIED','{"account_id": 3,  "prev_balance": 87500.75, "new_balance": 89300.75}',                 '2025-06-02 09:00:02'),
(8,  2, 'COMPLETED',     '{"latency_ms": 3000}',                                                                  '2025-06-02 09:00:03'),
(9,  3, 'INITIATED',     '{"channel": "branch_teller", "teller_id": "TLR-021"}',                                 '2025-06-03 14:30:00'),
(10, 3, 'DEBIT_APPLIED', '{"account_id": 12, "prev_balance": 39500.00, "new_balance": 34500.00}',                 '2025-06-03 14:30:01'),
(11, 3, 'CREDIT_APPLIED','{"account_id": 9,  "prev_balance": -3750.00, "new_balance": 1250.00}',                  '2025-06-03 14:30:01'),
(12, 3, 'COMPLETED',     '{"latency_ms": 2000}',                                                                  '2025-06-03 14:30:02'),
(13, 4, 'INITIATED',     '{"ip": "172.16.0.5", "channel": "app_mobile"}',                                        '2025-06-04 09:00:00'),
(14, 4, 'DEBIT_APPLIED', '{"account_id": 27, "prev_balance": 68000.00, "new_balance": 56000.00}',                 '2025-06-04 09:00:01'),
(15, 4, 'CREDIT_APPLIED','{"account_id": 18, "prev_balance": 6900.00,  "new_balance": 18900.00}',                 '2025-06-04 09:00:02'),
(16, 4, 'COMPLETED',     '{"latency_ms": 4000}',                                                                  '2025-06-04 09:00:04'),
(17, 5, 'INITIATED',     '{"card_id": 1, "channel": "pos", "merchant": "Supermercados La Feria"}',               '2025-06-05 12:15:00'),
(18, 5, 'DEBIT_APPLIED', '{"account_id": 3,  "prev_balance": 88350.75, "new_balance": 87500.75}',                 '2025-06-05 12:15:02'),
(19, 5, 'CREDIT_APPLIED','{"account_id": 9,  "prev_balance": 400.00,   "new_balance": 1250.00}',                  '2025-06-05 12:15:03'),
(20, 5, 'COMPLETED',     '{"latency_ms": 4000}',                                                                  '2025-06-05 12:15:04'),
(21, 6, 'INITIATED',     '{"card_id": 13, "channel": "ecommerce", "merchant": "Liverpool Online"}',              '2025-06-06 18:00:00'),
(22, 6, 'DEBIT_APPLIED', '{"account_id": 32, "prev_balance": -2000.00, "new_balance": -5200.00}',                 '2025-06-06 18:00:02'),
(23, 6, 'CREDIT_APPLIED','{"account_id": 21, "prev_balance": 6000.00,  "new_balance": 9200.00}',                  '2025-06-06 18:00:04'),
(24, 6, 'COMPLETED',     '{"latency_ms": 6000}',                                                                  '2025-06-06 18:00:06'),
(25, 7, 'INITIATED',     '{"card_id": 15, "channel": "pos", "merchant": "Coppel Sucursal 42"}',                  '2025-06-07 11:00:00'),
(26, 7, 'DEBIT_APPLIED', '{"account_id": 36, "prev_balance": -600.50,  "new_balance": -2100.50}',                 '2025-06-07 11:00:02'),
(27, 7, 'CREDIT_APPLIED','{"account_id": 12, "prev_balance": 33000.00, "new_balance": 34500.00}',                 '2025-06-07 11:00:03'),
(28, 7, 'COMPLETED',     '{"latency_ms": 5000}',                                                                  '2025-06-07 11:00:05'),
(29, 8, 'INITIATED',     '{"ip": "192.168.2.30", "channel": "app_web"}',                                         '2025-06-08 10:00:00'),
(30, 8, 'DEBIT_APPLIED', '{"account_id": 18, "prev_balance": 21900.00, "new_balance": 18900.00}',                 '2025-06-08 10:00:01'),
(31, 8, 'CREDIT_APPLIED','{"account_id": 24, "prev_balance": -899.25,  "new_balance": 2100.75}',                  '2025-06-08 10:00:02'),
(32, 8, 'COMPLETED',     '{"latency_ms": 3000}',                                                                  '2025-06-08 10:00:03'),
(33, 9, 'INITIATED',     '{"ip": "10.0.2.10", "channel": "app_mobile"}',                                         '2025-06-09 16:00:00'),
(34, 9, 'DEBIT_APPLIED', '{"account_id": 27, "prev_balance": 61500.00, "new_balance": 56000.00}',                 '2025-06-09 16:00:01'),
(35, 9, 'CREDIT_APPLIED','{"account_id": 30, "prev_balance": -4700.00, "new_balance": 800.00}',                   '2025-06-09 16:00:03'),
(36, 9, 'COMPLETED',     '{"latency_ms": 4000}',                                                                  '2025-06-09 16:00:04'),
(37, 10,'INITIATED',     '{"card_id": 16, "channel": "pos", "merchant": "Farmacia Benavides"}',                  '2025-06-10 08:00:00'),
(38, 10,'DEBIT_APPLIED', '{"account_id": 40, "prev_balance": 100.00,   "new_balance": -800.00}',                  '2025-06-10 08:00:01'),
(39, 10,'CREDIT_APPLIED','{"account_id": 6,  "prev_balance": 21200.00, "new_balance": 22100.00}',                 '2025-06-10 08:00:02'),
(40, 10,'COMPLETED',     '{"latency_ms": 4000}',                                                                  '2025-06-10 08:00:04'),
(41, 11,'INITIATED',     '{"card_id": 17, "channel": "ecommerce", "merchant": "Electrónica Total"}',             '2025-06-11 15:20:00'),
(42, 11,'DEBIT_APPLIED', '{"account_id": 43, "prev_balance": -7500.00, "new_balance": -12000.00}',                '2025-06-11 15:20:02'),
(43, 11,'CREDIT_APPLIED','{"account_id": 27, "prev_balance": 51500.00, "new_balance": 56000.00}',                 '2025-06-11 15:20:04'),
(44, 11,'COMPLETED',     '{"latency_ms": 6000}',                                                                  '2025-06-11 15:20:06'),
(45, 12,'INITIATED',     '{"ip": "192.168.3.21", "channel": "app_mobile"}',                                      '2025-06-12 13:00:00'),
(46, 13,'INITIATED',     '{"channel": "branch_teller", "teller_id": "TLR-009"}',                                 '2025-06-13 09:30:00'),
(47, 13,'DEBIT_APPLIED', '{"account_id": 30, "prev_balance": 1200.00,  "new_balance": 800.00}',                   '2025-06-13 09:30:01'),
(48, 13,'CREDIT_APPLIED','{"account_id": 18, "prev_balance": 18500.00, "new_balance": 18900.00}',                 '2025-06-13 09:30:01'),
(49, 13,'COMPLETED',     '{"latency_ms": 2000}',                                                                  '2025-06-13 09:30:02'),
(50, 14,'INITIATED',     '{"ip": "10.0.1.55", "channel": "app_web"}',                                            '2025-06-14 17:00:00'),
(51, 14,'FAILED',        '{"reason": "insufficient_funds", "balance": 22100.00, "decline_code": "51"}',           '2025-06-14 17:00:01'),
(52, 15,'INITIATED',     '{"card_id": 19, "channel": "ecommerce", "merchant": "Coppel en Línea"}',               '2025-06-15 14:00:00'),
(53, 15,'DEBIT_APPLIED', '{"account_id": 45, "prev_balance": 2500.00,  "new_balance": -3500.00}',                 '2025-06-15 14:00:30'),
(54, 15,'CREDIT_APPLIED','{"account_id": 30, "prev_balance": -5200.00, "new_balance": 800.00}',                   '2025-06-15 14:01:00'),
(55, 15,'COMPENSATED',   '{"reason": "reconciliation_error", "original_tx_id": 15, "compensation": {"account_45_restored": 2500.00, "account_30_restored": -5200.00}}', '2025-06-15 14:05:00');

-- --- Nodo B (53 logs — excluidos 100–101 de T27) ---
INSERT INTO transaction_log (id, transaction_id, event_type, details, created_at) VALUES
(56, 16,'INITIATED',     '{"ip": "192.168.10.5", "channel": "app_web"}',                                         '2025-06-01 10:30:00'),
(57, 16,'DEBIT_APPLIED', '{"account_id": 1,  "prev_balance": 23420.50, "new_balance": 15420.50}',                 '2025-06-01 10:30:01'),
(58, 16,'CREDIT_APPLIED','{"account_id": 10, "prev_balance": 38000.00, "new_balance": 46000.00}',                 '2025-06-01 10:30:02'),
(59, 16,'COMPLETED',     '{"latency_ms": 4000}',                                                                  '2025-06-01 10:30:04'),
(60, 17,'INITIATED',     '{"ip": "10.0.5.20", "channel": "app_mobile"}',                                         '2025-06-02 11:00:00'),
(61, 17,'DEBIT_APPLIED', '{"account_id": 10, "prev_balance": 49500.00, "new_balance": 46000.00}',                 '2025-06-02 11:00:01'),
(62, 17,'CREDIT_APPLIED','{"account_id": 1,  "prev_balance": 11920.50, "new_balance": 15420.50}',                 '2025-06-02 11:00:02'),
(63, 17,'COMPLETED',     '{"latency_ms": 3000}',                                                                  '2025-06-02 11:00:03'),
(64, 18,'INITIATED',     '{"channel": "branch_teller", "teller_id": "TLR-035"}',                                 '2025-06-03 09:15:00'),
(65, 18,'DEBIT_APPLIED', '{"account_id": 13, "prev_balance": 12700.00, "new_balance": 11500.00}',                 '2025-06-03 09:15:01'),
(66, 18,'CREDIT_APPLIED','{"account_id": 7,  "prev_balance": -99.75,   "new_balance": 1100.25}',                  '2025-06-03 09:15:01'),
(67, 18,'COMPLETED',     '{"latency_ms": 2000}',                                                                  '2025-06-03 09:15:02'),
(68, 19,'INITIATED',     '{"ip": "172.16.1.8", "channel": "app_web"}',                                           '2025-06-04 14:00:00'),
(69, 19,'DEBIT_APPLIED', '{"account_id": 25, "prev_balance": 24000.00, "new_balance": 19500.00}',                 '2025-06-04 14:00:01'),
(70, 19,'CREDIT_APPLIED','{"account_id": 22, "prev_balance": -799.50,  "new_balance": 3700.50}',                  '2025-06-04 14:00:02'),
(71, 19,'COMPLETED',     '{"latency_ms": 3000}',                                                                  '2025-06-04 14:00:03'),
(72, 20,'INITIATED',     '{"card_id": 31, "channel": "pos", "merchant": "Coppel Sucursal 118"}',                 '2025-06-05 10:00:00'),
(73, 20,'DEBIT_APPLIED', '{"account_id": 31, "prev_balance": -400.00,  "new_balance": -3200.00}',                 '2025-06-05 10:00:02'),
(74, 20,'CREDIT_APPLIED','{"account_id": 13, "prev_balance": 8700.00,  "new_balance": 11500.00}',                 '2025-06-05 10:00:03'),
(75, 20,'COMPLETED',     '{"latency_ms": 5000}',                                                                  '2025-06-05 10:00:05'),
(76, 21,'INITIATED',     '{"card_id": 33, "channel": "ecommerce", "merchant": "Samsung Store MX"}',              '2025-06-06 12:00:00'),
(77, 21,'DEBIT_APPLIED', '{"account_id": 35, "prev_balance": 15000.00, "new_balance": 0.00}',                     '2025-06-06 12:00:02'),
(78, 21,'CREDIT_APPLIED','{"account_id": 10, "prev_balance": 31000.00, "new_balance": 46000.00}',                 '2025-06-06 12:00:04'),
(79, 21,'COMPLETED',     '{"latency_ms": 6000}',                                                                  '2025-06-06 12:00:06'),
(80, 22,'INITIATED',     '{"card_id": 34, "channel": "pos", "merchant": "Liverpool Perisur"}',                   '2025-06-07 16:30:00'),
(81, 22,'DEBIT_APPLIED', '{"account_id": 39, "prev_balance": -1300.00, "new_balance": -4500.00}',                 '2025-06-07 16:30:02'),
(82, 22,'CREDIT_APPLIED','{"account_id": 19, "prev_balance": 24800.00, "new_balance": 28000.00}',                 '2025-06-07 16:30:03'),
(83, 22,'COMPLETED',     '{"latency_ms": 5000}',                                                                  '2025-06-07 16:30:05'),
(84, 23,'INITIATED',     '{"card_id": 35, "channel": "ecommerce", "merchant": "Mercado Libre MX"}',              '2025-06-08 09:00:00'),
(85, 23,'DEBIT_APPLIED', '{"account_id": 42, "prev_balance": -4300.00, "new_balance": -9800.00}',                 '2025-06-08 09:00:02'),
(86, 23,'CREDIT_APPLIED','{"account_id": 25, "prev_balance": 14000.00, "new_balance": 19500.00}',                 '2025-06-08 09:00:04'),
(87, 23,'COMPLETED',     '{"latency_ms": 6000}',                                                                  '2025-06-08 09:00:06'),
(88, 24,'INITIATED',     '{"ip": "192.168.10.5", "channel": "app_mobile"}',                                      '2025-06-09 11:30:00'),
(89, 24,'DEBIT_APPLIED', '{"account_id": 1,  "prev_balance": 16920.50, "new_balance": 15420.50}',                 '2025-06-09 11:30:01'),
(90, 24,'CREDIT_APPLIED','{"account_id": 22, "prev_balance": 2200.50,  "new_balance": 3700.50}',                  '2025-06-09 11:30:01'),
(91, 24,'COMPLETED',     '{"latency_ms": 2000}',                                                                  '2025-06-09 11:30:02'),
(92, 25,'INITIATED',     '{"ip": "10.0.3.44", "channel": "app_web"}',                                            '2025-06-10 15:00:00'),
(93, 25,'DEBIT_APPLIED', '{"account_id": 19, "prev_balance": 34000.00, "new_balance": 28000.00}',                 '2025-06-10 15:00:01'),
(94, 25,'CREDIT_APPLIED','{"account_id": 28, "prev_balance": 1200.00,  "new_balance": 7200.00}',                  '2025-06-10 15:00:03'),
(95, 25,'COMPLETED',     '{"latency_ms": 4000}',                                                                  '2025-06-10 15:00:04'),
(96, 26,'INITIATED',     '{"channel": "branch_teller", "teller_id": "TLR-018"}',                                 '2025-06-11 08:30:00'),
(97, 26,'DEBIT_APPLIED', '{"account_id": 28, "prev_balance": 9400.00,  "new_balance": 7200.00}',                  '2025-06-11 08:30:01'),
(98, 26,'CREDIT_APPLIED','{"account_id": 4,  "prev_balance": 1000.00,  "new_balance": 3200.00}',                  '2025-06-11 08:30:02'),
(99, 26,'COMPLETED',     '{"latency_ms": 3000}',                                                                  '2025-06-11 08:30:03'),
-- logs 100–101 (T27, Samuel Flores no-VIP): EXCLUIDOS
(102,28,'INITIATED',     '{"ip": "10.0.5.20", "channel": "app_web"}',                                            '2025-06-13 09:00:00'),
(103,29,'INITIATED',     '{"card_id": 34, "channel": "ecommerce", "merchant": "Amazon MX"}',                     '2025-06-14 19:00:00'),
(104,29,'DEBIT_APPLIED', '{"account_id": 39, "prev_balance": -2400.00, "new_balance": -4500.00}',                 '2025-06-14 19:00:02'),
(105,29,'CREDIT_APPLIED','{"account_id": 1,  "prev_balance": 13320.50, "new_balance": 15420.50}',                 '2025-06-14 19:00:03'),
(106,29,'COMPLETED',     '{"latency_ms": 5000}',                                                                  '2025-06-14 19:00:05'),
(107,30,'INITIATED',     '{"card_id": 32, "channel": "pos", "merchant": "Sanborns Insurgentes"}',                '2025-06-15 13:00:00'),
(108,30,'DEBIT_APPLIED', '{"account_id": 31, "prev_balance": 4300.00,  "new_balance": -3200.00}',                 '2025-06-15 13:00:30'),
(109,30,'CREDIT_APPLIED','{"account_id": 7,  "prev_balance": -6399.75, "new_balance": 1100.25}',                  '2025-06-15 13:01:00'),
(110,30,'COMPENSATED',   '{"reason": "pos_terminal_error", "original_tx_id": 30, "compensation": {"account_31_restored": 4300.00, "account_7_restored": -6399.75}}', '2025-06-15 13:05:00');

-- --- Nodo C (51 logs — excluidos 156–159 de T43) ---
INSERT INTO transaction_log (id, transaction_id, event_type, details, created_at) VALUES
(111,31,'INITIATED',     '{"ip": "192.168.20.5", "channel": "app_mobile"}',                                      '2025-06-01 09:00:00'),
(112,31,'DEBIT_APPLIED', '{"account_id": 2,  "prev_balance": 52000.00, "new_balance": 42000.00}',                 '2025-06-01 09:00:01'),
(113,31,'CREDIT_APPLIED','{"account_id": 5,  "prev_balance": 8500.00,  "new_balance": 18500.00}',                 '2025-06-01 09:00:02'),
(114,31,'COMPLETED',     '{"latency_ms": 4000}',                                                                  '2025-06-01 09:00:04'),
(115,32,'INITIATED',     '{"ip": "10.0.20.11", "channel": "app_web"}',                                           '2025-06-02 10:00:00'),
(116,32,'DEBIT_APPLIED', '{"account_id": 5,  "prev_balance": 23000.00, "new_balance": 18500.00}',                 '2025-06-02 10:00:01'),
(117,32,'CREDIT_APPLIED','{"account_id": 2,  "prev_balance": 37500.00, "new_balance": 42000.00}',                 '2025-06-02 10:00:02'),
(118,32,'COMPLETED',     '{"latency_ms": 3000}',                                                                  '2025-06-02 10:00:03'),
(119,33,'INITIATED',     '{"channel": "branch_teller", "teller_id": "TLR-055"}',                                 '2025-06-03 11:00:00'),
(120,33,'DEBIT_APPLIED', '{"account_id": 8,  "prev_balance": 9000.00,  "new_balance": 6800.00}',                  '2025-06-03 11:00:01'),
(121,33,'CREDIT_APPLIED','{"account_id": 11, "prev_balance": 7100.00,  "new_balance": 9300.00}',                  '2025-06-03 11:00:01'),
(122,33,'COMPLETED',     '{"latency_ms": 2000}',                                                                  '2025-06-03 11:00:02'),
(123,34,'INITIATED',     '{"ip": "172.16.20.3", "channel": "app_mobile"}',                                       '2025-06-04 13:00:00'),
(124,34,'DEBIT_APPLIED', '{"account_id": 26, "prev_balance": 21000.00, "new_balance": 16000.00}',                 '2025-06-04 13:00:01'),
(125,34,'CREDIT_APPLIED','{"account_id": 20, "prev_balance": 17000.00, "new_balance": 22000.00}',                 '2025-06-04 13:00:03'),
(126,34,'COMPLETED',     '{"latency_ms": 4000}',                                                                  '2025-06-04 13:00:04'),
(127,35,'INITIATED',     '{"card_id": 37, "channel": "pos", "merchant": "Palacio de Hierro Perisur"}',           '2025-06-05 15:00:00'),
(128,35,'DEBIT_APPLIED', '{"account_id": 2,  "prev_balance": 45500.00, "new_balance": 42000.00}',                 '2025-06-05 15:00:02'),
(129,35,'CREDIT_APPLIED','{"account_id": 8,  "prev_balance": 3300.00,  "new_balance": 6800.00}',                  '2025-06-05 15:00:04'),
(130,35,'COMPLETED',     '{"latency_ms": 5000}',                                                                  '2025-06-05 15:00:05'),
(131,36,'INITIATED',     '{"card_id": 48, "channel": "ecommerce", "merchant": "Apple Store MX"}',                '2025-06-06 11:30:00'),
(132,36,'DEBIT_APPLIED', '{"account_id": 33, "prev_balance": 1400.00,  "new_balance": -4800.00}',                 '2025-06-06 11:30:02'),
(133,36,'CREDIT_APPLIED','{"account_id": 14, "prev_balance": -3100.00, "new_balance": 3100.00}',                  '2025-06-06 11:30:04'),
(134,36,'COMPLETED',     '{"latency_ms": 6000}',                                                                  '2025-06-06 11:30:06'),
(135,37,'INITIATED',     '{"card_id": 50, "channel": "pos", "merchant": "Superama Santa Fe"}',                   '2025-06-07 14:00:00'),
(136,37,'DEBIT_APPLIED', '{"account_id": 38, "prev_balance": 300.00,   "new_balance": -1500.00}',                 '2025-06-07 14:00:02'),
(137,37,'CREDIT_APPLIED','{"account_id": 11, "prev_balance": 7500.00,  "new_balance": 9300.00}',                  '2025-06-07 14:00:03'),
(138,37,'COMPLETED',     '{"latency_ms": 5000}',                                                                  '2025-06-07 14:00:05'),
(139,38,'INITIATED',     '{"ip": "192.168.21.9", "channel": "app_web"}',                                         '2025-06-08 08:30:00'),
(140,38,'DEBIT_APPLIED', '{"account_id": 20, "prev_balance": 29500.00, "new_balance": 22000.00}',                 '2025-06-08 08:30:01'),
(141,38,'CREDIT_APPLIED','{"account_id": 26, "prev_balance": 8500.00,  "new_balance": 16000.00}',                 '2025-06-08 08:30:03'),
(142,38,'COMPLETED',     '{"latency_ms": 4000}',                                                                  '2025-06-08 08:30:04'),
(143,39,'INITIATED',     '{"ip": "172.16.20.3", "channel": "app_mobile"}',                                       '2025-06-09 17:00:00'),
(144,39,'DEBIT_APPLIED', '{"account_id": 26, "prev_balance": 19200.00, "new_balance": 16000.00}',                 '2025-06-09 17:00:01'),
(145,39,'CREDIT_APPLIED','{"account_id": 29, "prev_balance": -2450.00, "new_balance": 750.00}',                   '2025-06-09 17:00:02'),
(146,39,'COMPLETED',     '{"latency_ms": 3000}',                                                                  '2025-06-09 17:00:03'),
(147,40,'INITIATED',     '{"card_id": 51, "channel": "pos", "merchant": "Sanborns Insurgentes"}',                '2025-06-10 12:00:00'),
(148,40,'DEBIT_APPLIED', '{"account_id": 46, "prev_balance": -1300.00, "new_balance": -2200.00}',                 '2025-06-10 12:00:01'),
(149,40,'CREDIT_APPLIED','{"account_id": 5,  "prev_balance": 17600.00, "new_balance": 18500.00}',                 '2025-06-10 12:00:02'),
(150,40,'COMPLETED',     '{"latency_ms": 4000}',                                                                  '2025-06-10 12:00:04'),
(151,41,'INITIATED',     '{"card_id": 52, "channel": "ecommerce", "merchant": "Liverpool Online"}',              '2025-06-11 10:00:00'),
(152,41,'DEBIT_APPLIED', '{"account_id": 47, "prev_balance": -3300.00, "new_balance": -7500.00}',                 '2025-06-11 10:00:02'),
(153,41,'CREDIT_APPLIED','{"account_id": 26, "prev_balance": 11800.00, "new_balance": 16000.00}',                 '2025-06-11 10:00:04'),
(154,41,'COMPLETED',     '{"latency_ms": 5000}',                                                                  '2025-06-11 10:00:05'),
(155,42,'INITIATED',     '{"ip": "192.168.20.33", "channel": "app_mobile"}',                                     '2025-06-12 16:00:00'),
-- logs 156–159 (T43, Silvia Ponce no-VIP): EXCLUIDOS
(160,44,'INITIATED',     '{"ip": "10.0.20.11", "channel": "app_web"}',                                           '2025-06-14 18:00:00'),
(161,44,'FAILED',        '{"reason": "insufficient_funds", "balance": 18500.00, "amount_requested": 9000.00, "decline_code": "51"}', '2025-06-14 18:00:01'),
(162,45,'INITIATED',     '{"card_id": 49, "channel": "ecommerce", "merchant": "Coppel en Línea"}',               '2025-06-15 11:00:00'),
(163,45,'DEBIT_APPLIED', '{"account_id": 33, "prev_balance": 3700.00,  "new_balance": -4800.00}',                 '2025-06-15 11:00:30'),
(164,45,'CREDIT_APPLIED','{"account_id": 29, "prev_balance": -7750.00, "new_balance": 750.00}',                   '2025-06-15 11:01:00'),
(165,45,'COMPENSATED',   '{"reason": "duplicate_order_detection", "original_tx_id": 45, "compensation": {"account_33_restored": 3700.00, "account_29_restored": -7750.00}}', '2025-06-15 11:05:00');


-- -----------------------------------------------------------------------------
-- Reseteo de secuencias en el schema VIP
-- -----------------------------------------------------------------------------
SELECT setval('distribank_vip_customers.customers_id_seq',
              (SELECT MAX(id) FROM distribank_vip_customers.customers));
SELECT setval('distribank_vip_customers.accounts_id_seq',
              (SELECT MAX(id) FROM distribank_vip_customers.accounts));
SELECT setval('distribank_vip_customers.cards_id_seq',
              (SELECT MAX(id) FROM distribank_vip_customers.cards));
SELECT setval('distribank_vip_customers.transactions_id_seq',
              (SELECT MAX(id) FROM distribank_vip_customers.transactions));
SELECT setval('distribank_vip_customers.transaction_log_id_seq',
              (SELECT MAX(id) FROM distribank_vip_customers.transaction_log));

COMMIT;

RESET search_path;
