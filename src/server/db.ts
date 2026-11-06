import bcrypt from 'bcryptjs';
import {
  Tenant,
  TenantSettings,
  Congregation,
  User,
  Member,
  Visitor,
  Cell,
  CellMeeting,
  CellAttendanceRecord,
  PastoralFollowup,
  Ministry,
  EventItem,
  EventTicketLot,
  EventRegistration,
  EventExpense,
  FinancialAccount,
  FinancialCategory,
  FinancialCostCenter,
  FinancialTransaction,
  PaymentIntegration,
  PaymentWebhookEvent,
  AuditLog,
  Plan
} from './types';

export interface DatabaseState {
  plans: Plan[];
  tenants: Tenant[];
  tenantSettings: TenantSettings[];
  congregations: Congregation[];
  users: User[];
  members: Member[];
  visitors: Visitor[];
  cells: Cell[];
  cellMeetings: CellMeeting[];
  cellAttendance: CellAttendanceRecord[];
  pastoralFollowups: PastoralFollowup[];
  ministries: Ministry[];
  events: EventItem[];
  eventTicketLots: EventTicketLot[];
  eventRegistrations: EventRegistration[];
  eventExpenses: EventExpense[];
  financialAccounts: FinancialAccount[];
  financialCategories: FinancialCategory[];
  financialCostCenters: FinancialCostCenter[];
  financialTransactions: FinancialTransaction[];
  paymentIntegrations: PaymentIntegration[];
  paymentWebhookEvents: PaymentWebhookEvent[];
  auditLogs: AuditLog[];
}

function createInitialDatabase(): DatabaseState {
  const hash = (pass: string) => bcrypt.hashSync(pass, 8);

  const plans: Plan[] = [
    {
      id: 'plan_starter',
      code: 'STARTER',
      name: 'Starter',
      monthlyPrice: 149.00,
      annualPrice: 1490.00,
      maxMembers: 150,
      maxUsers: 5,
      maxCells: 15,
      maxEventsPerMonth: 2,
      hasFinancialModule: true,
      hasPaymentGateway: false,
      hasBiAnalytics: false,
      hasMultiCongregations: false,
    },
    {
      id: 'plan_pro',
      code: 'PRO',
      name: 'Pro',
      monthlyPrice: 299.00,
      annualPrice: 2990.00,
      maxMembers: 600,
      maxUsers: 15,
      maxCells: 50,
      maxEventsPerMonth: 8,
      hasFinancialModule: true,
      hasPaymentGateway: true,
      hasBiAnalytics: true,
      hasMultiCongregations: true,
    },
    {
      id: 'plan_enterprise',
      code: 'ENTERPRISE',
      name: 'Enterprise',
      monthlyPrice: 599.00,
      annualPrice: 5990.00,
      maxMembers: 3000,
      maxUsers: 50,
      maxCells: 250,
      maxEventsPerMonth: 30,
      hasFinancialModule: true,
      hasPaymentGateway: true,
      hasBiAnalytics: true,
      hasMultiCongregations: true,
    }
  ];

  const tenants: Tenant[] = [
    {
      id: 'tenant_ibcentral',
      name: 'Igreja Batista Central',
      slug: 'ibcentral',
      documentCnpj: '12.345.678/0001-90',
      contactEmail: 'contato@ibcentral.com.br',
      contactPhone: '(11) 4500-8000',
      planId: 'plan_pro',
      status: 'active',
      createdAt: '2025-01-15T10:00:00Z',
      updatedAt: '2026-11-01T10:00:00Z'
    },
    {
      id: 'tenant_graca',
      name: 'Comunidade Cristã da Graça',
      slug: 'comunidade-graca',
      documentCnpj: '98.765.432/0001-11',
      contactEmail: 'pastor@comunidadegraca.org.br',
      contactPhone: '(21) 3200-4400',
      planId: 'plan_starter',
      status: 'active',
      createdAt: '2025-06-20T14:30:00Z',
      updatedAt: '2026-10-15T09:00:00Z'
    }
  ];

  const tenantSettings: TenantSettings[] = [
    {
      id: 'ts_ibcentral',
      tenantId: 'tenant_ibcentral',
      primaryColor: '#0F172A',
      secondaryColor: '#2563EB',
      logoUrl: '',
      timezone: 'America/Sao_Paulo',
      dateFormat: 'DD/MM/YYYY',
      currency: 'BRL',
      allowPublicRegistrations: true
    },
    {
      id: 'ts_graca',
      tenantId: 'tenant_graca',
      primaryColor: '#1E293B',
      secondaryColor: '#0D9488',
      timezone: 'America/Sao_Paulo',
      dateFormat: 'DD/MM/YYYY',
      currency: 'BRL',
      allowPublicRegistrations: true
    }
  ];

  const congregations: Congregation[] = [
    {
      id: 'cong_sede',
      tenantId: 'tenant_ibcentral',
      name: 'Sede Central',
      code: 'SEDE',
      isMain: true,
      phone: '(11) 4500-8000',
      email: 'sede@ibcentral.com.br',
      address: 'Av. Paulista, 1800',
      city: 'São Paulo',
      state: 'SP',
      isActive: true
    },
    {
      id: 'cong_zonasul',
      tenantId: 'tenant_ibcentral',
      name: 'Campus Zona Sul',
      code: 'ZSUL',
      isMain: false,
      phone: '(11) 5600-9900',
      email: 'zonasul@ibcentral.com.br',
      address: 'Av. Washington Luís, 4500',
      city: 'São Paulo',
      state: 'SP',
      isActive: true
    },
    {
      id: 'cong_graca_matriz',
      tenantId: 'tenant_graca',
      name: 'Templo Principal',
      code: 'MATRIZ',
      isMain: true,
      phone: '(21) 3200-4400',
      email: 'matriz@comunidadegraca.org.br',
      address: 'Rua das Laranjeiras, 300',
      city: 'Rio de Janeiro',
      state: 'RJ',
      isActive: true
    }
  ];

  const users: User[] = [
    {
      id: 'usr_pastor_tiago',
      tenantId: 'tenant_ibcentral',
      congregationId: 'cong_sede',
      name: 'Pr. Tiago Silva',
      email: 'pastor@ibcentral.com.br',
      passwordHash: hash('pastor123'),
      phone: '(11) 98765-4321',
      roleCode: 'pastor_principal',
      isActive: true,
      createdAt: '2025-01-15T10:00:00Z'
    },
    {
      id: 'usr_lider_matheus',
      tenantId: 'tenant_ibcentral',
      congregationId: 'cong_sede',
      name: 'Matheus Oliveira (Líder)',
      email: 'lider@ibcentral.com.br',
      passwordHash: hash('lider123'),
      phone: '(11) 99123-4567',
      roleCode: 'lider_celula',
      isActive: true,
      createdAt: '2025-02-01T10:00:00Z'
    },
    {
      id: 'usr_tesoureira_carla',
      tenantId: 'tenant_ibcentral',
      congregationId: 'cong_sede',
      name: 'Carla Mendes (Tesoureira)',
      email: 'tesouraria@ibcentral.com.br',
      passwordHash: hash('tesouraria123'),
      phone: '(11) 97654-3210',
      roleCode: 'tesoureiro',
      isActive: true,
      createdAt: '2025-02-10T11:00:00Z'
    },
    {
      id: 'usr_eventos_leticia',
      tenantId: 'tenant_ibcentral',
      congregationId: 'cong_sede',
      name: 'Letícia Ramos (Eventos)',
      email: 'eventos@ibcentral.com.br',
      passwordHash: hash('eventos123'),
      phone: '(11) 98111-2233',
      roleCode: 'responsavel_eventos',
      isActive: true,
      createdAt: '2025-03-01T09:00:00Z'
    },
    {
      id: 'usr_superadmin',
      tenantId: undefined, // SaaS platform owner
      name: 'Diretoria SaaS (ChurchFlow)',
      email: 'admin@churchflow.com.br',
      passwordHash: hash('admin123'),
      phone: '(11) 99999-0000',
      roleCode: 'superadmin_saas',
      isActive: true,
      createdAt: '2024-12-01T00:00:00Z'
    }
  ];

  const members: Member[] = [
    {
      id: 'mem_1',
      tenantId: 'tenant_ibcentral',
      congregationId: 'cong_sede',
      name: 'Pr. Tiago Silva',
      phone: '(11) 98765-4321',
      email: 'pastor@ibcentral.com.br',
      birthDate: '1980-05-12',
      gender: 'M',
      maritalStatus: 'casado',
      address: 'Rua Bela Cintra, 1200',
      neighborhood: 'Consolação',
      city: 'São Paulo',
      state: 'SP',
      conversionDate: '1998-07-20',
      baptismDate: '1998-11-15',
      membershipStatus: 'ativo',
      isLeader: true,
      createdAt: '2025-01-15T10:00:00Z',
      updatedAt: '2026-11-01T10:00:00Z'
    },
    {
      id: 'mem_2',
      tenantId: 'tenant_ibcentral',
      congregationId: 'cong_sede',
      name: 'Matheus Oliveira',
      phone: '(11) 99123-4567',
      email: 'lider@ibcentral.com.br',
      birthDate: '1992-09-18',
      gender: 'M',
      maritalStatus: 'casado',
      address: 'Rua Augusta, 2100',
      neighborhood: 'Cerqueira César',
      city: 'São Paulo',
      state: 'SP',
      conversionDate: '2015-03-10',
      baptismDate: '2015-06-21',
      membershipStatus: 'ativo',
      isLeader: true,
      createdAt: '2025-02-01T10:00:00Z',
      updatedAt: '2026-10-20T10:00:00Z'
    },
    {
      id: 'mem_3',
      tenantId: 'tenant_ibcentral',
      congregationId: 'cong_sede',
      name: 'Carla Mendes',
      phone: '(11) 97654-3210',
      email: 'tesouraria@ibcentral.com.br',
      birthDate: '1987-11-03',
      gender: 'F',
      maritalStatus: 'solteiro',
      address: 'Alameda Santos, 980',
      neighborhood: 'Jardins',
      city: 'São Paulo',
      state: 'SP',
      membershipStatus: 'ativo',
      isLeader: true,
      createdAt: '2025-02-10T11:00:00Z',
      updatedAt: '2026-10-10T11:00:00Z'
    },
    {
      id: 'mem_4',
      tenantId: 'tenant_ibcentral',
      congregationId: 'cong_sede',
      name: 'Lucas Ferreira',
      phone: '(11) 98333-4455',
      email: 'lucas.f@gmail.com',
      birthDate: '1995-02-14',
      gender: 'M',
      maritalStatus: 'solteiro',
      address: 'Rua Haddock Lobo, 400',
      neighborhood: 'Cerqueira César',
      city: 'São Paulo',
      state: 'SP',
      conversionDate: '2021-08-15',
      baptismDate: '2021-12-05',
      membershipStatus: 'ativo',
      isLeader: false,
      createdAt: '2025-04-10T14:00:00Z',
      updatedAt: '2026-09-12T14:00:00Z'
    },
    {
      id: 'mem_5',
      tenantId: 'tenant_ibcentral',
      congregationId: 'cong_sede',
      name: 'Beatriz Albuquerque',
      phone: '(11) 97444-5566',
      email: 'beatriz.a@hotmail.com',
      birthDate: '1996-07-25',
      gender: 'F',
      maritalStatus: 'casado',
      address: 'Rua Oscar Freire, 850',
      neighborhood: 'Pinheiros',
      city: 'São Paulo',
      state: 'SP',
      conversionDate: '2022-04-10',
      baptismDate: '2022-09-18',
      membershipStatus: 'ativo',
      isLeader: false,
      createdAt: '2025-05-18T10:00:00Z',
      updatedAt: '2026-10-01T10:00:00Z'
    },
    {
      id: 'mem_6',
      tenantId: 'tenant_ibcentral',
      congregationId: 'cong_zonasul',
      name: 'Pr. Roberto Camargo',
      phone: '(11) 98999-1212',
      email: 'roberto.camargo@ibcentral.com.br',
      birthDate: '1975-03-30',
      gender: 'M',
      maritalStatus: 'casado',
      address: 'Av. Santo Amaro, 2200',
      neighborhood: 'Brooklin',
      city: 'São Paulo',
      state: 'SP',
      membershipStatus: 'ativo',
      isLeader: true,
      createdAt: '2025-03-01T08:00:00Z',
      updatedAt: '2026-11-01T08:00:00Z'
    }
  ];

  const visitors: Visitor[] = [
    {
      id: 'vis_1',
      tenantId: 'tenant_ibcentral',
      congregationId: 'cong_sede',
      name: 'Gabriel Siqueira',
      phone: '(11) 97111-2244',
      email: 'gabriel.siqueira@email.com',
      firstVisitDate: '2026-10-18',
      firstCellId: 'cell_agape',
      invitedByMemberId: 'mem_4',
      funnelStage: 'integracao',
      notes: 'Gostou muito da recepção dos jovens na célula Ágape. Deseja iniciar discipulado.',
      createdAt: '2026-10-18T20:30:00Z'
    },
    {
      id: 'vis_2',
      tenantId: 'tenant_ibcentral',
      congregationId: 'cong_sede',
      name: 'Fernanda Rocha',
      phone: '(11) 98222-3355',
      email: 'fernanda.rocha@uol.com.br',
      firstVisitDate: '2026-10-25',
      firstCellId: 'cell_betel',
      funnelStage: 'primeiro_contato',
      notes: 'Visitou culto de domingo. Mensagem de boas-vindas enviada pelo WhatsApp.',
      createdAt: '2026-10-25T11:45:00Z'
    },
    {
      id: 'vis_3',
      tenantId: 'tenant_ibcentral',
      congregationId: 'cong_sede',
      name: 'Thiago Nogueira',
      phone: '(11) 99444-8899',
      email: 'thiago.nog@yahoo.com',
      firstVisitDate: '2026-11-01',
      firstCellId: 'cell_agape',
      funnelStage: 'novo',
      notes: 'Chegou pelo convite do Instagram do congresso de jovens.',
      createdAt: '2026-11-01T19:00:00Z'
    }
  ];

  const cells: Cell[] = [
    {
      id: 'cell_agape',
      tenantId: 'tenant_ibcentral',
      congregationId: 'cong_sede',
      code: 'CEL-001',
      name: 'Célula Ágape (Jovens)',
      type: 'jovens',
      dayOfWeek: 'quarta',
      meetingTime: '20:00:00',
      address: 'Rua Augusta, 2100 - Apto 82',
      neighborhood: 'Cerqueira César',
      city: 'São Paulo',
      state: 'SP',
      leaderId: 'mem_2',
      coLeaderId: 'mem_4',
      supervisorId: 'mem_1',
      openingDate: '2025-02-15',
      maxCapacity: 15,
      status: 'ativa',
      notes: 'Célula em forte crescimento com foco em universitários e jovens profissionais.',
      createdAt: '2025-02-15T18:00:00Z'
    },
    {
      id: 'cell_betel',
      tenantId: 'tenant_ibcentral',
      congregationId: 'cong_sede',
      code: 'CEL-002',
      name: 'Célula Betel (Casais & Famílias)',
      type: 'casais',
      dayOfWeek: 'quinta',
      meetingTime: '19:30:00',
      address: 'Alameda Santos, 980',
      neighborhood: 'Jardins',
      city: 'São Paulo',
      state: 'SP',
      leaderId: 'mem_3',
      coLeaderId: 'mem_5',
      supervisorId: 'mem_1',
      openingDate: '2025-03-01',
      maxCapacity: 18,
      status: 'ativa',
      notes: 'Encontros quinzenais presenciais com estudo de finanças familiares cristãs.',
      createdAt: '2025-03-01T10:00:00Z'
    },
    {
      id: 'cell_ebenezer',
      tenantId: 'tenant_ibcentral',
      congregationId: 'cong_zonasul',
      code: 'CEL-003',
      name: 'Célula Ebenézer (Mista)',
      type: 'mista',
      dayOfWeek: 'sexta',
      meetingTime: '20:00:00',
      address: 'Av. Santo Amaro, 2200',
      neighborhood: 'Brooklin',
      city: 'São Paulo',
      state: 'SP',
      leaderId: 'mem_6',
      openingDate: '2025-04-10',
      maxCapacity: 20,
      status: 'ativa',
      createdAt: '2025-04-10T12:00:00Z'
    }
  ];

  const cellMeetings: CellMeeting[] = [
    {
      id: 'meet_1',
      tenantId: 'tenant_ibcentral',
      cellId: 'cell_agape',
      meetingDate: '2026-10-29',
      theme: 'Identidade em Cristo e Propósito',
      leaderInChargeId: 'mem_2',
      totalMembersPresent: 11,
      totalVisitorsPresent: 3,
      totalAbsent: 2,
      offeringAmount: 145.00,
      decisionsCount: 1,
      prayerRequests: 'Oração pela saúde da mãe do Lucas e aprovação no TCC do Gabriel.',
      observations: 'Reunião calorosa. Gabriel e Fernanda participaram ativamente da dinâmica.',
      createdAt: '2026-10-29T22:30:00Z'
    },
    {
      id: 'meet_2',
      tenantId: 'tenant_ibcentral',
      cellId: 'cell_agape',
      meetingDate: '2026-10-22',
      theme: 'Comunhão e Servir ao Próximo',
      leaderInChargeId: 'mem_2',
      totalMembersPresent: 10,
      totalVisitorsPresent: 2,
      totalAbsent: 3,
      offeringAmount: 120.00,
      decisionsCount: 0,
      prayerRequests: 'Oração por recolocação profissional dos jovens da célula.',
      createdAt: '2026-10-22T22:15:00Z'
    },
    {
      id: 'meet_3',
      tenantId: 'tenant_ibcentral',
      cellId: 'cell_betel',
      meetingDate: '2026-10-30',
      theme: 'A Aliança no Casamento e Resolução de Conflitos',
      leaderInChargeId: 'mem_3',
      totalMembersPresent: 14,
      totalVisitorsPresent: 1,
      totalAbsent: 1,
      offeringAmount: 280.00,
      decisionsCount: 0,
      observations: 'Excelente presença de 7 casais. Jantar compartilhado.',
      createdAt: '2026-10-30T22:00:00Z'
    }
  ];

  const cellAttendance: CellAttendanceRecord[] = [
    {
      id: 'att_1',
      tenantId: 'tenant_ibcentral',
      meetingId: 'meet_1',
      memberId: 'mem_2',
      attendeeName: 'Matheus Oliveira (Líder)',
      isPresent: true,
      isVisitor: false
    },
    {
      id: 'att_2',
      tenantId: 'tenant_ibcentral',
      meetingId: 'meet_1',
      memberId: 'mem_4',
      attendeeName: 'Lucas Ferreira (Colíder)',
      isPresent: true,
      isVisitor: false
    },
    {
      id: 'att_3',
      tenantId: 'tenant_ibcentral',
      meetingId: 'meet_1',
      visitorId: 'vis_1',
      attendeeName: 'Gabriel Siqueira (Visitante)',
      isPresent: true,
      isVisitor: true,
      notes: 'Segunda presença'
    }
  ];

  const pastoralFollowups: PastoralFollowup[] = [
    {
      id: 'foll_1',
      tenantId: 'tenant_ibcentral',
      visitorId: 'vis_1',
      personName: 'Gabriel Siqueira',
      responsibleUserId: 'usr_lider_matheus',
      responsibleUserName: 'Matheus Oliveira',
      stage: 'integracao',
      channel: 'whatsapp',
      scheduledDate: '2026-11-06',
      notes: 'Combinado café no sábado para apresentar o discipulado 1 a 1 e o material de novos convertidos.',
      status: 'pendente',
      createdAt: '2026-10-30T10:00:00Z'
    },
    {
      id: 'foll_2',
      tenantId: 'tenant_ibcentral',
      visitorId: 'vis_2',
      personName: 'Fernanda Rocha',
      responsibleUserId: 'usr_pastor_tiago',
      responsibleUserName: 'Pr. Tiago Silva',
      stage: 'primeiro_contato',
      channel: 'whatsapp',
      completedDate: '2026-10-27',
      notes: 'Enviada mensagem oficial da pastoral dando as boas-vindas. Fernanda agradeceu com carinho.',
      status: 'concluido',
      createdAt: '2026-10-26T14:00:00Z'
    }
  ];

  const ministries: Ministry[] = [
    {
      id: 'min_louvor',
      tenantId: 'tenant_ibcentral',
      congregationId: 'cong_sede',
      name: 'Ministério de Louvor & Adoração',
      description: 'Responsável pela música, bandas dos cultos e direção do louvor comunitário.',
      leaderId: 'mem_4',
      leaderName: 'Lucas Ferreira',
      memberCount: 16,
      createdAt: '2025-01-20T10:00:00Z'
    },
    {
      id: 'min_comunicacao',
      tenantId: 'tenant_ibcentral',
      congregationId: 'cong_sede',
      name: 'Comunicação & Mídia',
      description: 'Transmissão ao vivo, fotografia, redes sociais e design de campanhas.',
      leaderId: 'mem_5',
      leaderName: 'Beatriz Albuquerque',
      memberCount: 12,
      createdAt: '2025-02-05T10:00:00Z'
    },
    {
      id: 'min_intercessao',
      tenantId: 'tenant_ibcentral',
      congregationId: 'cong_sede',
      name: 'Intercessão & Oração',
      description: 'Plantão de oração semanal, vigílias e apoio espiritual nos cultos.',
      leaderId: 'mem_3',
      leaderName: 'Carla Mendes',
      memberCount: 22,
      createdAt: '2025-01-25T10:00:00Z'
    }
  ];

  const events: EventItem[] = [
    {
      id: 'evt_conexao2026',
      tenantId: 'tenant_ibcentral',
      congregationId: 'cong_sede',
      title: 'Congresso Conexão Jovem 2026: Avivamento & Missão',
      slug: 'conexao-jovem-2026',
      description: 'O maior congresso da juventude da região. Três dias intensos de adoração, pregação transformadora, workshops temáticos e integração com jovens de mais de 40 células.',
      category: 'congresso',
      startDate: '2026-11-20T19:00:00Z',
      endDate: '2026-11-22T22:00:00Z',
      locationName: 'Auditório Principal - IBC Central',
      address: 'Av. Paulista, 1800 - Bela Vista, São Paulo - SP',
      organizerName: 'Ministério de Jovens IBC',
      isPaid: true,
      isPublished: true,
      capacity: 450,
      cancellationPolicy: 'Cancelamento com reembolso integral até 7 dias antes do evento.',
      termsAndConditions: 'O ingresso dá direito ao kit do participante e acesso a todas as plenárias.',
      paymentProviderId: 'pi_asaas',
      createdAt: '2026-09-01T10:00:00Z'
    },
    {
      id: 'evt_retiro_casais',
      tenantId: 'tenant_ibcentral',
      congregationId: 'cong_sede',
      title: 'Retiro de Casais: Renovando os Votos',
      slug: 'retiro-casais-2026',
      description: 'Final de semana em hotel fazenda focado em fortalecimento matrimonial, dinâmicas de casal e renovação dos votos conjugais.',
      category: 'encontro_casais',
      startDate: '2026-12-05T18:00:00Z',
      endDate: '2026-12-07T16:00:00Z',
      locationName: 'Hotel Fazenda Recanto Verde',
      address: 'Estrada do Sol, km 42 - Atibaia - SP',
      organizerName: 'Pastoral Familiar',
      isPaid: true,
      isPublished: true,
      capacity: 60,
      paymentProviderId: 'pi_mercadopago',
      createdAt: '2026-09-15T10:00:00Z'
    }
  ];

  const eventTicketLots: EventTicketLot[] = [
    {
      id: 'lot_promo',
      tenantId: 'tenant_ibcentral',
      eventId: 'evt_conexao2026',
      name: 'Lote Promocional (Early Bird)',
      price: 89.00,
      quantityTotal: 100,
      quantitySold: 100,
      startDate: '2026-09-01T00:00:00Z',
      endDate: '2026-09-30T23:59:59Z',
      isActive: false
    },
    {
      id: 'lot_primeiro',
      tenantId: 'tenant_ibcentral',
      eventId: 'evt_conexao2026',
      name: '1º Lote Oficial',
      price: 119.00,
      quantityTotal: 200,
      quantitySold: 145,
      startDate: '2026-10-01T00:00:00Z',
      endDate: '2026-11-10T23:59:59Z',
      isActive: true
    },
    {
      id: 'lot_segundo',
      tenantId: 'tenant_ibcentral',
      eventId: 'evt_conexao2026',
      name: '2º Lote Final',
      price: 149.00,
      quantityTotal: 150,
      quantitySold: 0,
      startDate: '2026-11-11T00:00:00Z',
      endDate: '2026-11-20T18:00:00Z',
      isActive: true
    }
  ];

  const eventRegistrations: EventRegistration[] = [
    {
      id: 'reg_001',
      tenantId: 'tenant_ibcentral',
      eventId: 'evt_conexao2026',
      lotId: 'lot_primeiro',
      lotName: '1º Lote Oficial',
      code: 'INS-2026-8801',
      attendeeName: 'Lucas Ferreira',
      attendeeEmail: 'lucas.f@gmail.com',
      attendeePhone: '(11) 98333-4455',
      attendeeCpf: '321.654.987-00',
      congregationName: 'Sede Central',
      cellName: 'Célula Ágape (Jovens)',
      unitPrice: 119.00,
      discountAmount: 0.00,
      finalAmount: 119.00,
      paymentMethod: 'pix',
      paymentStatus: 'aprovado',
      gatewayProvider: 'asaas',
      gatewayTransactionId: 'pay_asaas_88991122',
      qrCodeToken: 'QR-CX26-LUCAS-8801',
      checkedIn: true,
      checkedInAt: '2026-11-05T10:00:00Z',
      createdAt: '2026-10-15T14:20:00Z'
    },
    {
      id: 'reg_002',
      tenantId: 'tenant_ibcentral',
      eventId: 'evt_conexao2026',
      lotId: 'lot_primeiro',
      lotName: '1º Lote Oficial',
      code: 'INS-2026-8802',
      attendeeName: 'Gabriel Siqueira',
      attendeeEmail: 'gabriel.siqueira@email.com',
      attendeePhone: '(11) 97111-2244',
      attendeeCpf: '112.233.445-56',
      congregationName: 'Sede Central',
      cellName: 'Célula Ágape (Jovens)',
      unitPrice: 119.00,
      discountAmount: 0.00,
      finalAmount: 119.00,
      paymentMethod: 'credit_card',
      paymentStatus: 'aprovado',
      gatewayProvider: 'asaas',
      gatewayTransactionId: 'pay_asaas_99112233',
      qrCodeToken: 'QR-CX26-GABRIEL-8802',
      checkedIn: false,
      createdAt: '2026-10-20T19:40:00Z'
    },
    {
      id: 'reg_003',
      tenantId: 'tenant_ibcentral',
      eventId: 'evt_conexao2026',
      lotId: 'lot_primeiro',
      lotName: '1º Lote Oficial',
      code: 'INS-2026-8803',
      attendeeName: 'Renata Vasconcelos',
      attendeeEmail: 'renata.v@outlook.com',
      attendeePhone: '(11) 98777-6655',
      unitPrice: 119.00,
      discountAmount: 0.00,
      finalAmount: 119.00,
      paymentMethod: 'pix',
      paymentStatus: 'pendente',
      gatewayProvider: 'asaas',
      gatewayTransactionId: 'pay_asaas_00112233',
      qrCodeToken: 'QR-CX26-RENATA-8803',
      checkedIn: false,
      createdAt: '2026-11-04T21:10:00Z'
    }
  ];

  const eventExpenses: EventExpense[] = [
    {
      id: 'ee_1',
      tenantId: 'tenant_ibcentral',
      eventId: 'evt_conexao2026',
      description: 'Kit do Participante (Mochila saco, pulseira LED e bloco de anotações)',
      category: 'materiais',
      amount: 4200.00,
      supplierName: 'Brindes Corporativos Paulistano Ltda',
      dueDate: '2026-11-10',
      paymentDate: '2026-11-01',
      status: 'pago',
      createdAt: '2026-10-10T10:00:00Z'
    },
    {
      id: 'ee_2',
      tenantId: 'tenant_ibcentral',
      eventId: 'evt_conexao2026',
      description: 'Painel de LED e Mesa de Luz Adicional',
      category: 'som_iluminacao',
      amount: 3500.00,
      supplierName: 'ProAudio & Visual Eventos',
      dueDate: '2026-11-18',
      status: 'pendente',
      createdAt: '2026-10-25T11:00:00Z'
    },
    {
      id: 'ee_3',
      tenantId: 'tenant_ibcentral',
      eventId: 'evt_conexao2026',
      description: 'Coffee Break & Água para Voluntários e Preletores',
      category: 'alimentacao',
      amount: 1800.00,
      supplierName: 'Sabor & Arte Buffet',
      dueDate: '2026-11-19',
      status: 'pendente',
      createdAt: '2026-10-28T14:00:00Z'
    }
  ];

  const financialAccounts: FinancialAccount[] = [
    {
      id: 'acc_itau',
      tenantId: 'tenant_ibcentral',
      congregationId: 'cong_sede',
      name: 'Itaú Unibanco - Conta Operacional',
      bankName: 'Itaú (341)',
      accountType: 'corrente',
      agency: '0340',
      accountNumber: '48291-5',
      currentBalance: 78420.50,
      isActive: true
    },
    {
      id: 'acc_asaas_virtual',
      tenantId: 'tenant_ibcentral',
      congregationId: 'cong_sede',
      name: 'Conta Digital Asaas (Inscrições)',
      bankName: 'Asaas IP S.A.',
      accountType: 'gateway_virtual',
      agency: '0001',
      accountNumber: '994821-0',
      currentBalance: 24355.00,
      isActive: true
    },
    {
      id: 'acc_caixa',
      tenantId: 'tenant_ibcentral',
      congregationId: 'cong_sede',
      name: 'Caixa Físico / Tesouraria',
      bankName: 'Cofre Matriz',
      accountType: 'caixa_fisico',
      currentBalance: 3120.00,
      isActive: true
    }
  ];

  const financialCategories: FinancialCategory[] = [
    { id: 'cat_dizimo', tenantId: 'tenant_ibcentral', name: 'Dízimos', type: 'receita', code: '1.01' },
    { id: 'cat_oferta', tenantId: 'tenant_ibcentral', name: 'Ofertas de Culto & Células', type: 'receita', code: '1.02' },
    { id: 'cat_evento', tenantId: 'tenant_ibcentral', name: 'Inscrições em Eventos', type: 'receita', code: '1.03' },
    { id: 'cat_doacao', tenantId: 'tenant_ibcentral', name: 'Doações Específicas', type: 'receita', code: '1.04' },
    { id: 'cat_aluguel', tenantId: 'tenant_ibcentral', name: 'Locação & Condomínio', type: 'despesa', code: '2.01' },
    { id: 'cat_utilidades', tenantId: 'tenant_ibcentral', name: 'Energia, Água e Internet', type: 'despesa', code: '2.02' },
    { id: 'cat_ministerio', tenantId: 'tenant_ibcentral', name: 'Investimento Ministerial', type: 'despesa', code: '2.03' },
    { id: 'cat_eventos_despesa', tenantId: 'tenant_ibcentral', name: 'Despesas com Eventos', type: 'despesa', code: '2.04' },
    { id: 'cat_folha', tenantId: 'tenant_ibcentral', name: 'Sustento Pastoral & Colaboradores', type: 'despesa', code: '2.05' }
  ];

  const financialCostCenters: FinancialCostCenter[] = [
    { id: 'cc_geral', tenantId: 'tenant_ibcentral', name: 'Administração Geral Sede', code: 'CC-01', isActive: true },
    { id: 'cc_jovens', tenantId: 'tenant_ibcentral', name: 'Ministério de Jovens & Conexão', code: 'CC-02', eventId: 'evt_conexao2026', isActive: true },
    { id: 'cc_familias', tenantId: 'tenant_ibcentral', name: 'Pastoral Familiar', code: 'CC-03', eventId: 'evt_retiro_casais', isActive: true },
    { id: 'cc_missoes', tenantId: 'tenant_ibcentral', name: 'Missões e Ação Social', code: 'CC-04', isActive: true }
  ];

  const financialTransactions: FinancialTransaction[] = [
    {
      id: 'tx_001',
      tenantId: 'tenant_ibcentral',
      congregationId: 'cong_sede',
      accountId: 'acc_itau',
      accountName: 'Itaú Unibanco - Conta Operacional',
      categoryId: 'cat_dizimo',
      categoryName: 'Dízimos',
      costCenterId: 'cc_geral',
      costCenterName: 'Administração Geral Sede',
      type: 'receita',
      nature: 'dizimo',
      description: 'Dízimos identificados via PIX - Outubro Sem 4',
      amount: 18450.00,
      feeAmount: 0.00,
      netAmount: 18450.00,
      dueDate: '2026-10-31',
      competenceDate: '2026-10-01',
      paymentDate: '2026-10-31',
      status: 'pago',
      payerOrReceiver: 'Diversos Membros',
      isReconciled: true,
      createdAt: '2026-10-31T20:00:00Z'
    },
    {
      id: 'tx_002',
      tenantId: 'tenant_ibcentral',
      congregationId: 'cong_sede',
      accountId: 'acc_asaas_virtual',
      accountName: 'Conta Digital Asaas (Inscrições)',
      categoryId: 'cat_evento',
      categoryName: 'Inscrições em Eventos',
      costCenterId: 'cc_jovens',
      costCenterName: 'Ministério de Jovens & Conexão',
      eventId: 'evt_conexao2026',
      eventTitle: 'Congresso Conexão Jovem 2026',
      type: 'receita',
      nature: 'evento_inscricao',
      description: 'Lote 1 Inscrições - Congresso Conexão 2026 (145 ingressos)',
      amount: 17255.00,
      feeAmount: 345.10,
      netAmount: 16909.90,
      dueDate: '2026-10-30',
      competenceDate: '2026-10-01',
      paymentDate: '2026-10-30',
      status: 'pago',
      gatewayProvider: 'asaas',
      gatewayTransactionId: 'batch_asaas_102026',
      isReconciled: true,
      createdAt: '2026-10-30T18:00:00Z'
    },
    {
      id: 'tx_003',
      tenantId: 'tenant_ibcentral',
      congregationId: 'cong_sede',
      accountId: 'acc_caixa',
      accountName: 'Caixa Físico / Tesouraria',
      categoryId: 'cat_oferta',
      categoryName: 'Ofertas de Culto & Células',
      costCenterId: 'cc_geral',
      costCenterName: 'Administração Geral Sede',
      type: 'receita',
      nature: 'oferta',
      description: 'Ofertas das Células Ágape e Betel referente a Outubro',
      amount: 545.00,
      feeAmount: 0.00,
      netAmount: 545.00,
      dueDate: '2026-10-31',
      competenceDate: '2026-10-01',
      paymentDate: '2026-10-31',
      status: 'pago',
      payerOrReceiver: 'Líderes de Célula',
      isReconciled: true,
      createdAt: '2026-10-31T21:00:00Z'
    },
    {
      id: 'tx_004',
      tenantId: 'tenant_ibcentral',
      congregationId: 'cong_sede',
      accountId: 'acc_itau',
      accountName: 'Itaú Unibanco - Conta Operacional',
      categoryId: 'cat_aluguel',
      categoryName: 'Locação & Condomínio',
      costCenterId: 'cc_geral',
      costCenterName: 'Administração Geral Sede',
      type: 'despesa',
      nature: 'aluguel',
      description: 'Locação Prédio Sede Central - Venc. 05/Nov',
      amount: 9800.00,
      feeAmount: 0.00,
      netAmount: 9800.00,
      dueDate: '2026-11-05',
      competenceDate: '2026-11-01',
      paymentDate: '2026-11-04',
      status: 'pago',
      payerOrReceiver: 'Imobiliária Paulista Prime',
      isReconciled: true,
      createdAt: '2026-11-04T10:00:00Z'
    },
    {
      id: 'tx_005',
      tenantId: 'tenant_ibcentral',
      congregationId: 'cong_sede',
      accountId: 'acc_itau',
      accountName: 'Itaú Unibanco - Conta Operacional',
      categoryId: 'cat_eventos_despesa',
      categoryName: 'Despesas com Eventos',
      costCenterId: 'cc_jovens',
      costCenterName: 'Ministério de Jovens & Conexão',
      eventId: 'evt_conexao2026',
      eventTitle: 'Congresso Conexão Jovem 2026',
      type: 'despesa',
      nature: 'ministerio',
      description: 'Pagamento Kits do Congresso Conexão 2026',
      amount: 4200.00,
      feeAmount: 0.00,
      netAmount: 4200.00,
      dueDate: '2026-11-01',
      competenceDate: '2026-11-01',
      paymentDate: '2026-11-01',
      status: 'pago',
      payerOrReceiver: 'Brindes Corporativos Paulistano Ltda',
      isReconciled: true,
      createdAt: '2026-11-01T15:00:00Z'
    }
  ];

  const paymentIntegrations: PaymentIntegration[] = [
    {
      id: 'pi_asaas',
      tenantId: 'tenant_ibcentral',
      provider: 'asaas',
      name: 'Asaas Brasil (PIX & Cartão Automático)',
      apiKeyMasked: '$aact_YTU5Y...4982',
      isSandbox: true,
      isActive: true,
      lastHealthCheckAt: '2026-11-05T09:00:00Z',
      lastHealthStatus: 'healthy',
      createdAt: '2025-02-15T10:00:00Z'
    },
    {
      id: 'pi_mercadopago',
      tenantId: 'tenant_ibcentral',
      provider: 'mercadopago',
      name: 'Mercado Pago Checkout Transparente',
      apiKeyMasked: 'TEST-82910...9102',
      isSandbox: true,
      isActive: true,
      lastHealthCheckAt: '2026-11-04T12:00:00Z',
      lastHealthStatus: 'healthy',
      createdAt: '2025-03-01T14:00:00Z'
    },
    {
      id: 'pi_stripe',
      tenantId: 'tenant_ibcentral',
      provider: 'stripe',
      name: 'Stripe International Gateway',
      apiKeyMasked: 'sk_test_51Mz...a891',
      isSandbox: true,
      isActive: false,
      lastHealthCheckAt: '2026-10-10T11:00:00Z',
      lastHealthStatus: 'untested',
      createdAt: '2025-05-10T16:00:00Z'
    }
  ];

  const paymentWebhookEvents: PaymentWebhookEvent[] = [
    {
      id: 'pwe_01',
      tenantId: 'tenant_ibcentral',
      provider: 'asaas',
      externalEventId: 'evt_asaas_991823',
      eventType: 'PAYMENT_RECEIVED',
      payloadJson: {
        event: 'PAYMENT_RECEIVED',
        payment: {
          id: 'pay_asaas_88991122',
          customer: 'cus_00192',
          value: 119.00,
          netValue: 116.80,
          billingType: 'PIX',
          status: 'RECEIVED',
          description: 'Inscrição Congresso Conexão 2026 - Lucas Ferreira'
        }
      },
      receivedAt: '2026-10-15T14:20:00Z',
      status: 'processado',
      retryCount: 0,
      processedAt: '2026-10-15T14:20:02Z'
    },
    {
      id: 'pwe_02',
      tenantId: 'tenant_ibcentral',
      provider: 'asaas',
      externalEventId: 'evt_asaas_991824',
      eventType: 'PAYMENT_CONFIRMED',
      payloadJson: {
        event: 'PAYMENT_CONFIRMED',
        payment: {
          id: 'pay_asaas_99112233',
          value: 119.00,
          netValue: 114.50,
          billingType: 'CREDIT_CARD',
          status: 'CONFIRMED',
          description: 'Inscrição Congresso Conexão 2026 - Gabriel Siqueira'
        }
      },
      receivedAt: '2026-10-20T19:40:00Z',
      status: 'processado',
      retryCount: 0,
      processedAt: '2026-10-20T19:40:01Z'
    }
  ];

  const auditLogs: AuditLog[] = [
    {
      id: 'aud_1',
      tenantId: 'tenant_ibcentral',
      userId: 'usr_pastor_tiago',
      userName: 'Pr. Tiago Silva',
      action: 'LOGIN',
      entityType: 'AUTH',
      details: { role: 'pastor_principal', ip: '189.40.12.55' },
      createdAt: '2026-11-05T08:00:00Z'
    },
    {
      id: 'aud_2',
      tenantId: 'tenant_ibcentral',
      userId: 'usr_lider_matheus',
      userName: 'Matheus Oliveira',
      action: 'CELL_MEETING_CREATED',
      entityType: 'CELL_MEETING',
      entityId: 'meet_1',
      details: { cell: 'Célula Ágape', attendees: 14, offering: 145.00 },
      createdAt: '2026-10-29T22:30:00Z'
    },
    {
      id: 'aud_3',
      tenantId: 'tenant_ibcentral',
      userId: 'usr_eventos_leticia',
      userName: 'Letícia Ramos',
      action: 'CHECKIN_PERFORMED',
      entityType: 'EVENT_REGISTRATION',
      entityId: 'reg_001',
      details: { attendee: 'Lucas Ferreira', event: 'Congresso Conexão 2026' },
      createdAt: '2026-11-05T10:00:00Z'
    }
  ];

  return {
    plans,
    tenants,
    tenantSettings,
    congregations,
    users,
    members,
    visitors,
    cells,
    cellMeetings,
    cellAttendance,
    pastoralFollowups,
    ministries,
    events,
    eventTicketLots,
    eventRegistrations,
    eventExpenses,
    financialAccounts,
    financialCategories,
    financialCostCenters,
    financialTransactions,
    paymentIntegrations,
    paymentWebhookEvents,
    auditLogs
  };
}

// Global persistent database state in memory
export const db: DatabaseState = createInitialDatabase();
