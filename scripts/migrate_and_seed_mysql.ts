import mysql from 'mysql2/promise';
import fs from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';

const dbConfig = {
  host: process.env.MYSQL_HOST || 'srv1940.hstgr.io',
  user: process.env.MYSQL_USER || 'u664081426_church',
  password: process.env.MYSQL_PASSWORD || '1qaz#2wsX',
  database: process.env.MYSQL_DATABASE || 'u664081426_church',
  multipleStatements: true,
  connectTimeout: 10000
};

async function migrateAndSeed() {
  console.log('Connecting to MySQL at', dbConfig.host, 'database:', dbConfig.database);
  const conn = await mysql.createConnection(dbConfig);
  console.log('Connected successfully!');

  // 1. Read SQL schema
  const schemaPath = path.resolve(process.cwd(), 'migrations/001_mysql_schema.sql');
  const schemaSql = fs.readFileSync(schemaPath, 'utf8');

  console.log('Executing schema migration (creating all 22+ tables)...');
  await conn.query(schemaSql);
  console.log('Schema migration executed successfully!');

  // 2. Verify created tables
  const [tables] = await conn.query('SHOW TABLES');
  console.log('Tables created in database:');
  const tableNames = (tables as any[]).map(t => Object.values(t)[0]);
  console.log(tableNames.join(', '));

  // 3. Seed initial data if plans/tenants empty
  console.log('Checking and seeding data...');

  const [existingPlans] = await conn.query('SELECT count(*) as count FROM plans');
  const plansCount = (existingPlans as any[])[0].count;

  if (plansCount === 0) {
    console.log('Seeding plans...');
    await conn.query(`
      INSERT INTO plans (id, code, name, description, monthly_price, annual_price, max_members, max_users, max_cells, max_events_per_month, has_financial_module, has_payment_gateway, has_bi_analytics, has_multi_congregations) VALUES
      ('plan_starter', 'STARTER', 'Starter', 'Ideal para congregações em crescimento', 149.00, 1490.00, 150, 5, 15, 2, TRUE, FALSE, FALSE, FALSE),
      ('plan_pro', 'PRO', 'Pro', 'Gestão completa com CRM, eventos e financeiro', 299.00, 2990.00, 600, 15, 50, 8, TRUE, TRUE, TRUE, TRUE),
      ('plan_enterprise', 'ENTERPRISE', 'Enterprise', 'Para ministérios em múltiplos campi e redes', 599.00, 5990.00, 3000, 50, 250, 30, TRUE, TRUE, TRUE, TRUE);
    `);
  }

  const [existingTenants] = await conn.query('SELECT count(*) as count FROM tenants');
  const tenantsCount = (existingTenants as any[])[0].count;

  if (tenantsCount === 0) {
    console.log('Seeding tenants & settings...');
    await conn.query(`
      INSERT INTO tenants (id, name, slug, document_cnpj, contact_email, contact_phone, subdomain, plan_id, status) VALUES
      ('tenant_ibcentral', 'Igreja Batista Central', 'ibcentral', '12.345.678/0001-90', 'contato@ibcentral.com.br', '(11) 4500-8000', 'ibcentral', 'plan_pro', 'active'),
      ('tenant_graca', 'Comunidade Cristã da Graça', 'comunidade-graca', '98.765.432/0001-11', 'pastor@comunidadegraca.org.br', '(21) 3200-4400', 'graca', 'plan_starter', 'active');
    `);

    await conn.query(`
      INSERT INTO tenant_settings (id, tenant_id, primary_color, secondary_color, timezone, date_format, currency, allow_public_registrations) VALUES
      ('ts_ibcentral', 'tenant_ibcentral', '#0F172A', '#2563EB', 'America/Sao_Paulo', 'DD/MM/YYYY', 'BRL', TRUE),
      ('ts_graca', 'tenant_graca', '#1E293B', '#0D9488', 'America/Sao_Paulo', 'DD/MM/YYYY', 'BRL', TRUE);
    `);
  }

  const [existingCongs] = await conn.query('SELECT count(*) as count FROM congregations');
  if ((existingCongs as any[])[0].count === 0) {
    console.log('Seeding congregations...');
    await conn.query(`
      INSERT INTO congregations (id, tenant_id, name, code, is_main, phone, email, postal_code, address, city, state, is_active) VALUES
      ('cong_sede', 'tenant_ibcentral', 'Campus Sede (Centro)', 'SEDE-01', TRUE, '(11) 4500-8001', 'sede@ibcentral.com.br', '01310-100', 'Av. Paulista, 1000', 'São Paulo', 'SP', TRUE),
      ('cong_zonasul', 'tenant_ibcentral', 'Campus Zona Sul', 'ZS-02', FALSE, '(11) 4500-8002', 'zonasul@ibcentral.com.br', '04038-000', 'Rua Domingos de Morais, 2500', 'São Paulo', 'SP', TRUE),
      ('cong_graca_sede', 'tenant_graca', 'Templo Principal', 'GRA-01', TRUE, '(21) 3200-4401', 'secretaria@comunidadegraca.org.br', '20040-002', 'Rua da Quitanda, 50', 'Rio de Janeiro', 'RJ', TRUE);
    `);
  }

  const [existingRoles] = await conn.query('SELECT count(*) as count FROM roles');
  if ((existingRoles as any[])[0].count === 0) {
    console.log('Seeding roles...');
    await conn.query(`
      INSERT INTO roles (id, code, name, description, is_system_role) VALUES
      ('role_superadmin_saas', 'superadmin_saas', 'Superadmin do SaaS', 'Acesso irrestrito a todos os tenants e faturamento global', TRUE),
      ('role_pastor_principal', 'pastor_principal', 'Pastor Titular / Presidente', 'Acesso total aos módulos da igreja e decisões financeiras', TRUE),
      ('role_pastor_campus', 'pastor_campus', 'Pastor de Campus', 'Gestão integral do campus local', TRUE),
      ('role_lider_redes', 'lider_redes', 'Coordenador / Supervisor de Células', 'Supervisão de líderes de células e membros', TRUE),
      ('role_lider_celula', 'lider_celula', 'Líder de Célula', 'Registro de reuniões, frequência e novos visitantes', TRUE),
      ('role_tesoureiro', 'tesoureiro', 'Tesouraria & Finanças', 'Lançamentos de caixa, DRE, conciliação e eventos', TRUE),
      ('role_secretaria', 'secretaria', 'Secretaria Eclesiástica', 'Cadastros de membros, atas e certificados', TRUE),
      ('role_admin_igreja', 'admin_igreja', 'Administrador Local', 'Configurações da igreja e gestão de usuários', TRUE);
    `);
  }

  const [existingUsers] = await conn.query('SELECT count(*) as count FROM users');
  if ((existingUsers as any[])[0].count === 0) {
    console.log('Seeding users...');
    const hash = (pass: string) => bcrypt.hashSync(pass, 8);
    const pass123 = hash('123456');

    await conn.query(`
      INSERT INTO users (id, tenant_id, congregation_id, name, email, password_hash, role_code, is_active) VALUES
      ('usr_superadmin', NULL, NULL, 'Administrador Global SaaS', 'admin@churchflow.com.br', '${pass123}', 'superadmin_saas', TRUE),
      ('usr_pastor_ricardo', 'tenant_ibcentral', 'cong_sede', 'Pr. Ricardo Oliveira', 'pastor@ibcentral.com.br', '${pass123}', 'pastor_principal', TRUE),
      ('usr_lider_felipe', 'tenant_ibcentral', 'cong_sede', 'Felipe Santos', 'felipe.lider@ibcentral.com.br', '${pass123}', 'lider_celula', TRUE),
      ('usr_tesoureiro_marcos', 'tenant_ibcentral', 'cong_sede', 'Marcos Vinicius', 'financeiro@ibcentral.com.br', '${pass123}', 'tesoureiro', TRUE),
      ('usr_admin_carla', 'tenant_ibcentral', 'cong_sede', 'Carla Mendes', 'carla.admin@ibcentral.com.br', '${pass123}', 'admin_igreja', TRUE),
      ('usr_pastor_graca', 'tenant_graca', 'cong_graca_sede', 'Pr. Carlos Eduardo', 'pastor@graca.com.br', '${pass123}', 'pastor_principal', TRUE);
    `);
  }

  const [existingMembers] = await conn.query('SELECT count(*) as count FROM members');
  if ((existingMembers as any[])[0].count === 0) {
    console.log('Seeding members...');
    await conn.query(`
      INSERT INTO members (id, tenant_id, congregation_id, name, phone, email, membership_status, is_leader, notes) VALUES
      ('mem_1', 'tenant_ibcentral', 'cong_sede', 'Pr. Ricardo Oliveira', '(11) 98765-4321', 'pastor@ibcentral.com.br', 'ativo', TRUE, 'Pastor Presidente'),
      ('mem_2', 'tenant_ibcentral', 'cong_sede', 'Felipe Santos', '(11) 97654-3210', 'felipe.santos@email.com', 'ativo', TRUE, 'Líder da Célula Conexão Jovem'),
      ('mem_3', 'tenant_ibcentral', 'cong_sede', 'Amanda Souza', '(11) 96543-2109', 'amanda.souza@email.com', 'ativo', TRUE, 'Co-líder da Célula Conexão'),
      ('mem_4', 'tenant_ibcentral', 'cong_sede', 'Lucas Alencar', '(11) 95432-1098', 'lucas.alencar@email.com', 'ativo', FALSE, 'Membro atuante no louvor'),
      ('mem_5', 'tenant_ibcentral', 'cong_zonasul', 'Juliana Paes', '(11) 94321-0987', 'juliana.paes@email.com', 'ativo', TRUE, 'Líder Célula Betel Zona Sul'),
      ('mem_6', 'tenant_ibcentral', 'cong_zonasul', 'Rodrigo Silva', '(11) 93210-9876', 'rodrigo.silva@email.com', 'ativo', FALSE, 'Membro batizado em 2025');
    `);
  }

  const [existingVisitors] = await conn.query('SELECT count(*) as count FROM visitors');
  if ((existingVisitors as any[])[0].count === 0) {
    console.log('Seeding visitors...');
    await conn.query(`
      INSERT INTO visitors (id, tenant_id, congregation_id, name, phone, email, first_visit_date, funnel_stage, notes) VALUES
      ('vis_1', 'tenant_ibcentral', 'cong_sede', 'Ana Souza', '(11) 91234-5678', 'ana.souza@email.com', '2026-11-02', 'novo', 'Visitou no domingo à noite com o namorado.'),
      ('vis_2', 'tenant_ibcentral', 'cong_sede', 'Mariana Costa', '(11) 98765-4321', 'mariana.costa@email.com', '2026-10-28', 'primeiro_contato', 'Gostou do louvor e pediu oração pela família.'),
      ('vis_3', 'tenant_ibcentral', 'cong_sede', 'Carlos Henrique', '(11) 96543-2109', 'carlos.henrique@email.com', '2026-10-20', 'integracao', 'Interessado em entrar para a célula de casais.'),
      ('vis_4', 'tenant_ibcentral', 'cong_sede', 'Juliana Silva', '(11) 94321-0987', 'juliana.silva@email.com', '2026-10-15', 'membro', 'Batismo agendado para o próximo mês.'),
      ('vis_5', 'tenant_ibcentral', 'cong_sede', 'Larissa Carvalho', '(11) 92109-8765', 'larissa.c@email.com', '2026-10-10', 'desistente', 'Mensagem enviada há 10 dias sem retorno.');
    `);
  }

  const [existingCells] = await conn.query('SELECT count(*) as count FROM cells');
  if ((existingCells as any[])[0].count === 0) {
    console.log('Seeding cells...');
    await conn.query(`
      INSERT INTO cells (id, tenant_id, congregation_id, code, name, type, day_of_week, meeting_time, address, neighborhood, leader_id, opening_date, status) VALUES
      ('cell_1', 'tenant_ibcentral', 'cong_sede', 'CEL-01', 'Célula Conexão Jovem', 'jovens', 'quarta', '20:00:00', 'Rua Augusta, 1200 - Ap 42', 'Consolação', 'mem_2', '2024-02-15', 'ativa'),
      ('cell_2', 'tenant_ibcentral', 'cong_zonasul', 'CEL-02', 'Célula Betel Casais', 'casais', 'quinta', '19:30:00', 'Rua Afonso Celso, 880', 'Vila Mariana', 'mem_5', '2024-05-10', 'ativa');
    `);
  }

  const [existingEvents] = await conn.query('SELECT count(*) as count FROM events');
  if ((existingEvents as any[])[0].count === 0) {
    console.log('Seeding events & lots...');
    await conn.query(`
      INSERT INTO events (id, tenant_id, congregation_id, title, slug, description, category, start_date, end_date, location_name, address, organizer_name, is_paid, is_published, capacity) VALUES
      ('evt_conexao_2026', 'tenant_ibcentral', 'cong_sede', 'Congresso Conexão Jovem 2026: Avivamento & Missão', 'conexao-jovem-2026', 'Três dias intensos de adoração, palavra e capacitação com preletores convidados.', 'congresso', '2026-11-20 19:30:00', '2026-11-22 22:00:00', 'Templo Central - Auditório Principal', 'Av. Paulista, 1000 - São Paulo/SP', 'Ministério Conexão Jovem', TRUE, TRUE, 450);
    `);

    await conn.query(`
      INSERT INTO event_ticket_lots (id, tenant_id, event_id, name, price, quantity_total, quantity_sold, start_date, end_date, is_active) VALUES
      ('lot_1', 'tenant_ibcentral', 'evt_conexao_2026', 'Lote 1 - Promocional (Early Bird)', 80.00, 150, 150, '2026-08-01 00:00:00', '2026-09-30 23:59:59', FALSE),
      ('lot_2', 'tenant_ibcentral', 'evt_conexao_2026', 'Lote 2 - Geral', 110.00, 200, 200, '2026-10-01 00:00:00', '2026-11-15 23:59:59', TRUE),
      ('lot_3', 'tenant_ibcentral', 'evt_conexao_2026', 'Lote 3 - Última Chamada', 140.00, 100, 0, '2026-11-16 00:00:00', '2026-11-20 18:00:00', TRUE);
    `);

    await conn.query(`
      INSERT INTO event_registrations (id, tenant_id, event_id, lot_id, code, attendee_name, attendee_email, attendee_phone, unit_price, final_amount, payment_method, payment_status, qr_code_token, checked_in) VALUES
      ('reg_demo_1', 'tenant_ibcentral', 'evt_conexao_2026', 'lot_2', 'CONEXAO-2026-1001', 'Gabriel Mendonça', 'gabriel.m@email.com', '(11) 98888-1111', 110.00, 110.00, 'pix', 'aprovado', 'QR-CONEXAO-GABRIEL-1001', FALSE),
      ('reg_demo_2', 'tenant_ibcentral', 'evt_conexao_2026', 'lot_2', 'CONEXAO-2026-1002', 'Beatriz Lima', 'beatriz.lima@email.com', '(11) 97777-2222', 110.00, 110.00, 'credit_card', 'aprovado', 'QR-CONEXAO-BEATRIZ-1002', TRUE);
    `);
  }

  const [existingFin] = await conn.query('SELECT count(*) as count FROM financial_accounts');
  if ((existingFin as any[])[0].count === 0) {
    console.log('Seeding financial accounts & categories...');
    await conn.query(`
      INSERT INTO financial_accounts (id, tenant_id, congregation_id, name, bank_name, account_type, initial_balance, current_balance, is_active) VALUES
      ('acc_itau', 'tenant_ibcentral', 'cong_sede', 'Conta Corrente Principal', 'Itaú Unibanco', 'corrente', 25000.00, 78450.00, TRUE),
      ('acc_asaas', 'tenant_ibcentral', 'cong_sede', 'Gateway Asaas (PIX/Cartão)', 'Asaas IP S.A.', 'gateway_virtual', 0.00, 38500.00, TRUE);
    `);

    await conn.query(`
      INSERT INTO financial_categories (id, tenant_id, name, type, code, is_system) VALUES
      ('cat_dizimo', 'tenant_ibcentral', 'Dízimos', 'receita', 'REC-01', TRUE),
      ('cat_oferta', 'tenant_ibcentral', 'Ofertas Gerais', 'receita', 'REC-02', TRUE),
      ('cat_evento', 'tenant_ibcentral', 'Inscrições de Eventos', 'receita', 'REC-03', TRUE),
      ('cat_aluguel', 'tenant_ibcentral', 'Aluguel do Templo', 'despesa', 'DESP-01', TRUE),
      ('cat_energia', 'tenant_ibcentral', 'Energia Elétrica & Água', 'despesa', 'DESP-02', TRUE),
      ('cat_missoes', 'tenant_ibcentral', 'Missões & Ação Social', 'despesa', 'DESP-03', TRUE);
    `);

    await conn.query(`
      INSERT INTO financial_cost_centers (id, tenant_id, name, code, event_id, is_active) VALUES
      ('fcc_adm', 'tenant_ibcentral', 'Administrativo & Pastoral', 'CC-01', NULL, TRUE),
      ('fcc_evento_conexao', 'tenant_ibcentral', 'Congresso Conexão Jovem 2026', 'CC-EVT-01', 'evt_conexao_2026', TRUE);
    `);

    await conn.query(`
      INSERT INTO payment_integrations (id, tenant_id, provider, name, api_key_encrypted, is_sandbox, is_active, last_health_status) VALUES
      ('pi_asaas', 'tenant_ibcentral', 'asaas', 'Asaas Produção (PIX & Cartão)', '$asaas_live_enc_key_demo_churchflow_99', TRUE, TRUE, 'healthy'),
      ('pi_mp', 'tenant_ibcentral', 'mercadopago', 'Mercado Pago Checkout Transparente', '$mp_live_enc_token_demo_churchflow_44', TRUE, TRUE, 'healthy');
    `);
  }

  console.log('Migration & Seeding completed successfully!');
  await conn.end();
}

migrateAndSeed().catch(err => {
  console.error('Migration failed:', err);
  process.exit(1);
});
