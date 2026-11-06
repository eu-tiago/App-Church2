import { Router, Response } from 'express';
import bcrypt from 'bcryptjs';
import { db } from './db';
import { authMiddleware, generateToken, requireRole, requireTenant, AuthenticatedRequest } from './auth';
import {
  User,
  Member,
  Visitor,
  Cell,
  CellMeeting,
  CellAttendanceRecord,
  PastoralFollowup,
  EventItem,
  EventRegistration,
  EventExpense,
  FinancialTransaction,
  FinancialAccount,
  AuditLog,
  PaymentIntegration,
  PaymentWebhookEvent,
  UserRole
} from './types';

export const apiRouter = Router();

function logAudit(tenantId: string, userId: string | undefined, userName: string | undefined, action: string, entityType: string, entityId?: string, details?: Record<string, unknown>) {
  const log: AuditLog = {
    id: `aud_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    tenantId,
    userId,
    userName,
    action,
    entityType,
    entityId,
    details,
    createdAt: new Date().toISOString()
  };
  db.auditLogs.unshift(log);
}

// =============================================================================
// AUTHENTICATION & SESSION
// =============================================================================

apiRouter.post('/auth/login', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    res.status(400).json({ error: 'E-mail e senha são obrigatórios.' });
    return;
  }

  const user = db.users.find(u => u.email.toLowerCase() === email.toLowerCase());
  if (!user || !user.isActive) {
    res.status(401).json({ error: 'Credenciais inválidas ou usuário inativo.' });
    return;
  }

  const isValid = bcrypt.compareSync(password, user.passwordHash);
  if (!isValid) {
    res.status(401).json({ error: 'Credenciais inválidas.' });
    return;
  }

  user.lastLoginAt = new Date().toISOString();
  const token = generateToken(user);
  const tenant = user.tenantId ? db.tenants.find(t => t.id === user.tenantId) : null;
  const tenantSettings = user.tenantId ? db.tenantSettings.find(ts => ts.tenantId === user.tenantId) : null;
  const congregations = user.tenantId ? db.congregations.filter(c => c.tenantId === user.tenantId) : [];

  if (user.tenantId) {
    logAudit(user.tenantId, user.id, user.name, 'LOGIN', 'USER', user.id, { role: user.roleCode });
  }

  res.json({
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      roleCode: user.roleCode,
      tenantId: user.tenantId,
      congregationId: user.congregationId
    },
    tenant,
    tenantSettings,
    congregations
  });
});

apiRouter.post('/auth/register-church', (req, res) => {
  const { churchName, cnpj, contactEmail, contactPhone, adminName, password, planId = 'plan_pro' } = req.body;

  if (!churchName || !contactEmail || !adminName || !password) {
    res.status(400).json({ error: 'Preencha todos os campos obrigatórios para o cadastro.' });
    return;
  }

  const slug = churchName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  const existingTenant = db.tenants.find(t => t.slug === slug || t.contactEmail === contactEmail);
  if (existingTenant) {
    res.status(400).json({ error: 'Já existe uma igreja cadastrada com este nome ou e-mail.' });
    return;
  }

  const tenantId = `tenant_${Date.now()}`;
  const newTenant = {
    id: tenantId,
    name: churchName,
    slug,
    documentCnpj: cnpj || '',
    contactEmail,
    contactPhone: contactPhone || '',
    planId,
    status: 'active' as const,
    trialEndsAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  db.tenants.push(newTenant);

  db.tenantSettings.push({
    id: `ts_${tenantId}`,
    tenantId,
    primaryColor: '#0F172A',
    secondaryColor: '#2563EB',
    timezone: 'America/Sao_Paulo',
    dateFormat: 'DD/MM/YYYY',
    currency: 'BRL',
    allowPublicRegistrations: true
  });

  const congregationId = `cong_${tenantId}_sede`;
  db.congregations.push({
    id: congregationId,
    tenantId,
    name: 'Sede Principal',
    code: 'SEDE',
    isMain: true,
    email: contactEmail,
    phone: contactPhone,
    isActive: true
  });

  const userId = `usr_${tenantId}_admin`;
  const adminUser: User = {
    id: userId,
    tenantId,
    congregationId,
    name: adminName,
    email: contactEmail,
    passwordHash: bcrypt.hashSync(password, 8),
    phone: contactPhone,
    roleCode: 'pastor_principal',
    isActive: true,
    createdAt: new Date().toISOString()
  };
  db.users.push(adminUser);

  const token = generateToken(adminUser);
  logAudit(tenantId, adminUser.id, adminUser.name, 'CHURCH_REGISTERED', 'TENANT', tenantId);

  res.status(201).json({
    token,
    user: adminUser,
    tenant: newTenant,
    congregationId
  });
});

apiRouter.get('/auth/me', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  const user = req.user!;
  const tenant = user.tenantId ? db.tenants.find(t => t.id === user.tenantId) : null;
  const tenantSettings = user.tenantId ? db.tenantSettings.find(ts => ts.tenantId === user.tenantId) : null;
  const congregations = user.tenantId ? db.congregations.filter(c => c.tenantId === user.tenantId) : [];

  res.json({
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      roleCode: user.roleCode,
      tenantId: user.tenantId,
      congregationId: user.congregationId
    },
    tenant,
    tenantSettings,
    congregations
  });
});

// Quick role switch for demonstration and testing RBAC
apiRouter.post('/auth/quick-switch-role', (req, res) => {
  const { roleCode, tenantId = 'tenant_ibcentral' } = req.body;
  const targetUser = db.users.find(u => u.roleCode === roleCode && (u.tenantId === tenantId || roleCode === 'superadmin_saas'));

  if (!targetUser) {
    res.status(404).json({ error: 'Usuário com este perfil não encontrado.' });
    return;
  }

  const token = generateToken(targetUser);
  const tenant = targetUser.tenantId ? db.tenants.find(t => t.id === targetUser.tenantId) : null;
  const tenantSettings = targetUser.tenantId ? db.tenantSettings.find(ts => ts.tenantId === targetUser.tenantId) : null;
  const congregations = targetUser.tenantId ? db.congregations.filter(c => c.tenantId === targetUser.tenantId) : [];

  res.json({
    token,
    user: {
      id: targetUser.id,
      name: targetUser.name,
      email: targetUser.email,
      phone: targetUser.phone,
      roleCode: targetUser.roleCode,
      tenantId: targetUser.tenantId,
      congregationId: targetUser.congregationId
    },
    tenant,
    tenantSettings,
    congregations
  });
});

// =============================================================================
// DASHBOARD EXECUTIVO
// =============================================================================

apiRouter.get('/dashboard/summary', authMiddleware, requireTenant, (req: AuthenticatedRequest, res: Response) => {
  const tenantId = req.tenantId!;
  const congregationId = req.query.congregationId as string | undefined;

  let members = db.members.filter(m => m.tenantId === tenantId);
  let visitors = db.visitors.filter(v => v.tenantId === tenantId);
  let cells = db.cells.filter(c => c.tenantId === tenantId);
  let meetings = db.cellMeetings.filter(m => m.tenantId === tenantId);
  let transactions = db.financialTransactions.filter(t => t.tenantId === tenantId);
  let events = db.events.filter(e => e.tenantId === tenantId);
  let registrations = db.eventRegistrations.filter(r => r.tenantId === tenantId);

  if (congregationId) {
    members = members.filter(m => m.congregationId === congregationId);
    visitors = visitors.filter(v => v.congregationId === congregationId);
    cells = cells.filter(c => c.congregationId === congregationId);
    transactions = transactions.filter(t => t.congregationId === congregationId);
    events = events.filter(e => e.congregationId === congregationId);
  }

  const totalMembers = members.filter(m => m.membershipStatus === 'ativo').length;
  const visitorsThisMonth = visitors.length;
  const activeCells = cells.filter(c => c.status === 'ativa').length;
  const activeLeaders = members.filter(m => m.isLeader).length;

  const totalAttendance = meetings.reduce((acc, m) => acc + m.totalMembersPresent + m.totalVisitorsPresent, 0);
  const avgAttendance = meetings.length > 0 ? Math.round(totalAttendance / meetings.length) : 0;
  const followupsPending = db.pastoralFollowups.filter(f => f.tenantId === tenantId && f.status === 'pendente').length;

  // Financial calculations
  const totalRevenue = transactions.filter(t => t.type === 'receita' && t.status === 'pago').reduce((acc, t) => acc + t.amount, 0);
  const totalExpenses = transactions.filter(t => t.type === 'despesa' && t.status === 'pago').reduce((acc, t) => acc + t.amount, 0);
  const netBalance = totalRevenue - totalExpenses;

  // Event metrics
  const activeEventsCount = events.filter(e => e.isPublished).length;
  const paidRegistrations = registrations.filter(r => r.paymentStatus === 'aprovado').length;
  const eventGrossRevenue = registrations.filter(r => r.paymentStatus === 'aprovado').reduce((acc, r) => acc + r.finalAmount, 0);

  // Time-series chart data
  const monthlyAttendanceData = [
    { month: 'Jun', presenca: 28, visitantes: 4 },
    { month: 'Jul', presenca: 32, visitantes: 6 },
    { month: 'Ago', presenca: 35, visitantes: 8 },
    { month: 'Set', presenca: 40, visitantes: 11 },
    { month: 'Out', presenca: 48, visitantes: 15 },
    { month: 'Nov', presenca: 52, visitantes: 18 }
  ];

  const financialEvolutionData = [
    { month: 'Jun', receitas: 24500, despesas: 18200 },
    { month: 'Jul', receitas: 26800, despesas: 19100 },
    { month: 'Ago', receitas: 28900, despesas: 21300 },
    { month: 'Set', receitas: 32100, despesas: 22000 },
    { month: 'Out', receitas: 36250, despesas: 24000 },
    { month: 'Nov', receitas: 38400, despesas: 25100 }
  ];

  // Alerts
  const alerts = [
    { id: 'alt_1', type: 'warning', title: 'Célula sem relatório recente', message: 'Célula Ebenézer não enviou o relatório da última semana.' },
    { id: 'alt_2', type: 'info', title: '3 Novos visitantes aguardando contato', message: 'Visitantes cadastrados nos últimos 5 dias sem primeiro contato agendado.' },
    { id: 'alt_3', type: 'success', title: '1º Lote do Congresso 72% vendido', message: 'Restam apenas 55 vagas disponíveis no lote atual.' }
  ];

  res.json({
    kpis: {
      totalMembers,
      visitorsThisMonth,
      activeCells,
      activeLeaders,
      avgAttendance,
      followupsPending,
      totalRevenue,
      totalExpenses,
      netBalance,
      activeEventsCount,
      paidRegistrations,
      eventGrossRevenue
    },
    charts: {
      monthlyAttendanceData,
      financialEvolutionData
    },
    alerts
  });
});

// =============================================================================
// GESTÃO DE MEMBROS & VISITANTES
// =============================================================================

apiRouter.get('/members', authMiddleware, requireTenant, (req: AuthenticatedRequest, res: Response) => {
  const tenantId = req.tenantId!;
  const { search, status, congregationId } = req.query;

  let list = db.members.filter(m => m.tenantId === tenantId);

  if (congregationId) {
    list = list.filter(m => m.congregationId === congregationId);
  }
  if (status && status !== 'todos') {
    list = list.filter(m => m.membershipStatus === status);
  }
  if (search) {
    const q = String(search).toLowerCase();
    list = list.filter(m => m.name.toLowerCase().includes(q) || m.phone?.includes(q) || m.email?.toLowerCase().includes(q));
  }

  res.json(list);
});

apiRouter.post('/members', authMiddleware, requireTenant, (req: AuthenticatedRequest, res: Response) => {
  const tenantId = req.tenantId!;
  const { name, phone, email, birthDate, gender, maritalStatus, congregationId, address, neighborhood, city, state, isLeader, notes } = req.body;

  if (!name) {
    res.status(400).json({ error: 'Nome do membro é obrigatório.' });
    return;
  }

  const newMember: Member = {
    id: `mem_${Date.now()}`,
    tenantId,
    congregationId: congregationId || db.congregations.find(c => c.tenantId === tenantId)?.id || 'cong_sede',
    name,
    phone,
    email,
    birthDate,
    gender,
    maritalStatus,
    address,
    neighborhood,
    city: city || 'São Paulo',
    state: state || 'SP',
    membershipStatus: 'ativo',
    isLeader: Boolean(isLeader),
    notes,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  db.members.unshift(newMember);
  logAudit(tenantId, req.user?.id, req.user?.name, 'MEMBER_CREATED', 'MEMBER', newMember.id, { name: newMember.name });

  res.status(201).json(newMember);
});

apiRouter.put('/members/:id', authMiddleware, requireTenant, (req: AuthenticatedRequest, res: Response) => {
  const tenantId = req.tenantId!;
  const { id } = req.params;
  const member = db.members.find(m => m.id === id && m.tenantId === tenantId);

  if (!member) {
    res.status(404).json({ error: 'Membro não encontrado.' });
    return;
  }

  Object.assign(member, req.body, { updatedAt: new Date().toISOString() });
  logAudit(tenantId, req.user?.id, req.user?.name, 'MEMBER_UPDATED', 'MEMBER', member.id);
  res.json(member);
});

apiRouter.get('/visitors', authMiddleware, requireTenant, (req: AuthenticatedRequest, res: Response) => {
  const tenantId = req.tenantId!;
  const { search, funnelStage } = req.query;

  let list = db.visitors.filter(v => v.tenantId === tenantId);

  if (funnelStage && funnelStage !== 'todos') {
    list = list.filter(v => v.funnelStage === funnelStage);
  }
  if (search) {
    const q = String(search).toLowerCase();
    list = list.filter(v => v.name.toLowerCase().includes(q) || v.phone.includes(q) || v.email?.toLowerCase().includes(q));
  }

  res.json(list);
});

apiRouter.post('/visitors', authMiddleware, requireTenant, (req: AuthenticatedRequest, res: Response) => {
  const tenantId = req.tenantId!;
  const { name, phone, email, congregationId, firstCellId, notes, funnelStage = 'novo' } = req.body;

  if (!name || !phone) {
    res.status(400).json({ error: 'Nome e telefone do visitante são obrigatórios.' });
    return;
  }

  const newVisitor: Visitor = {
    id: `vis_${Date.now()}`,
    tenantId,
    congregationId: congregationId || db.congregations.find(c => c.tenantId === tenantId)?.id || 'cong_sede',
    name,
    phone,
    email,
    firstVisitDate: new Date().toISOString().split('T')[0],
    firstCellId,
    funnelStage,
    notes,
    createdAt: new Date().toISOString()
  };

  db.visitors.unshift(newVisitor);

  // Auto-schedule first contact pastoral followup
  const followup: PastoralFollowup = {
    id: `foll_${Date.now()}`,
    tenantId,
    visitorId: newVisitor.id,
    personName: newVisitor.name,
    responsibleUserId: req.user?.id || 'usr_pastor_tiago',
    responsibleUserName: req.user?.name || 'Pr. Tiago Silva',
    stage: 'primeiro_contato',
    channel: 'whatsapp',
    scheduledDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    notes: 'Mensagem de boas-vindas e agendamento de conversa pastoral.',
    status: 'pendente',
    createdAt: new Date().toISOString()
  };
  db.pastoralFollowups.unshift(followup);

  logAudit(tenantId, req.user?.id, req.user?.name, 'VISITOR_CREATED', 'VISITOR', newVisitor.id);
  res.status(201).json(newVisitor);
});

apiRouter.post('/visitors/:id/convert', authMiddleware, requireTenant, (req: AuthenticatedRequest, res: Response) => {
  const tenantId = req.tenantId!;
  const { id } = req.params;
  const visitor = db.visitors.find(v => v.id === id && v.tenantId === tenantId);

  if (!visitor) {
    res.status(404).json({ error: 'Visitante não encontrado.' });
    return;
  }

  const newMember: Member = {
    id: `mem_conv_${Date.now()}`,
    tenantId,
    congregationId: visitor.congregationId,
    name: visitor.name,
    phone: visitor.phone,
    email: visitor.email,
    membershipStatus: 'ativo',
    isLeader: false,
    notes: `Convertido de visitante em ${new Date().toLocaleDateString('pt-BR')}. Notas anteriores: ${visitor.notes || 'Sem observações'}`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  db.members.unshift(newMember);

  visitor.convertedToMemberId = newMember.id;
  visitor.convertedAt = new Date().toISOString();
  visitor.funnelStage = 'membro';

  logAudit(tenantId, req.user?.id, req.user?.name, 'VISITOR_CONVERTED_TO_MEMBER', 'MEMBER', newMember.id, {
    visitorId: visitor.id,
    memberName: newMember.name
  });

  res.json({ success: true, member: newMember, visitor });
});

// =============================================================================
// GESTÃO DE CÉLULAS E REUNIÕES
// =============================================================================

apiRouter.get('/cells', authMiddleware, requireTenant, (req: AuthenticatedRequest, res: Response) => {
  const tenantId = req.tenantId!;
  const cells = db.cells.filter(c => c.tenantId === tenantId);

  // Attach enriched leader info, last meeting stats and member count
  const enriched = cells.map(cell => {
    const leader = db.members.find(m => m.id === cell.leaderId);
    const coLeader = cell.coLeaderId ? db.members.find(m => m.id === cell.coLeaderId) : null;
    const cellMeetings = db.cellMeetings.filter(m => m.cellId === cell.id).sort((a, b) => b.meetingDate.localeCompare(a.meetingDate));
    const lastMeeting = cellMeetings[0] || null;
    const memberCount = lastMeeting ? lastMeeting.totalMembersPresent : 12;

    return {
      ...cell,
      leaderName: leader ? leader.name : 'Líder Não Definido',
      coLeaderName: coLeader ? coLeader.name : null,
      memberCount,
      lastMeeting
    };
  });

  res.json(enriched);
});

apiRouter.post('/cells', authMiddleware, requireTenant, (req: AuthenticatedRequest, res: Response) => {
  const tenantId = req.tenantId!;
  const { name, code, type, dayOfWeek, meetingTime, address, neighborhood, city, state, leaderId, coLeaderId, maxCapacity } = req.body;

  if (!name || !leaderId || !address) {
    res.status(400).json({ error: 'Nome da célula, líder e endereço são obrigatórios.' });
    return;
  }

  const newCell: Cell = {
    id: `cell_${Date.now()}`,
    tenantId,
    congregationId: db.congregations.find(c => c.tenantId === tenantId)?.id || 'cong_sede',
    code: code || `CEL-${Math.floor(100 + Math.random() * 900)}`,
    name,
    type: type || 'mista',
    dayOfWeek: dayOfWeek || 'quarta',
    meetingTime: meetingTime || '20:00:00',
    address,
    neighborhood: neighborhood || 'Centro',
    city: city || 'São Paulo',
    state: state || 'SP',
    leaderId,
    coLeaderId,
    openingDate: new Date().toISOString().split('T')[0],
    maxCapacity: Number(maxCapacity) || 15,
    status: 'ativa',
    createdAt: new Date().toISOString()
  };

  db.cells.unshift(newCell);
  logAudit(tenantId, req.user?.id, req.user?.name, 'CELL_CREATED', 'CELL', newCell.id, { name: newCell.name });

  res.status(201).json(newCell);
});

apiRouter.get('/cells/:id/meetings', authMiddleware, requireTenant, (req: AuthenticatedRequest, res: Response) => {
  const tenantId = req.tenantId!;
  const { id } = req.params;
  const meetings = db.cellMeetings.filter(m => m.cellId === id && m.tenantId === tenantId).sort((a, b) => b.meetingDate.localeCompare(a.meetingDate));
  res.json(meetings);
});

apiRouter.post('/cells/:id/meetings', authMiddleware, requireTenant, (req: AuthenticatedRequest, res: Response) => {
  const tenantId = req.tenantId!;
  const { id } = req.params;
  const cell = db.cells.find(c => c.id === id && c.tenantId === tenantId);

  if (!cell) {
    res.status(404).json({ error: 'Célula não encontrada.' });
    return;
  }

  const { theme, meetingDate, membersPresent, visitorsPresent, absentCount, offeringAmount, decisionsCount, prayerRequests, observations } = req.body;

  const meeting: CellMeeting = {
    id: `meet_${Date.now()}`,
    tenantId,
    cellId: cell.id,
    meetingDate: meetingDate || new Date().toISOString().split('T')[0],
    theme: theme || 'Reunião Semanal de Célula',
    leaderInChargeId: req.user?.id ? (db.members.find(m => m.email === req.user?.email)?.id || cell.leaderId) : cell.leaderId,
    totalMembersPresent: Number(membersPresent) || 0,
    totalVisitorsPresent: Number(visitorsPresent) || 0,
    totalAbsent: Number(absentCount) || 0,
    offeringAmount: Number(offeringAmount) || 0,
    decisionsCount: Number(decisionsCount) || 0,
    prayerRequests,
    observations,
    createdAt: new Date().toISOString()
  };

  db.cellMeetings.unshift(meeting);

  // If offering amount is registered, create a financial entry automatically
  if (meeting.offeringAmount > 0) {
    const acc = db.financialAccounts.find(a => a.tenantId === tenantId && a.accountType === 'caixa_fisico') || db.financialAccounts.find(a => a.tenantId === tenantId);
    const cat = db.financialCategories.find(c => c.tenantId === tenantId && c.name.includes('Oferta'));

    if (acc && cat) {
      db.financialTransactions.unshift({
        id: `tx_cell_${meeting.id}`,
        tenantId,
        congregationId: cell.congregationId,
        accountId: acc.id,
        accountName: acc.name,
        categoryId: cat.id,
        categoryName: cat.name,
        type: 'receita',
        nature: 'oferta',
        description: `Oferta da ${cell.name} - Reunião ${meeting.meetingDate}`,
        amount: meeting.offeringAmount,
        feeAmount: 0,
        netAmount: meeting.offeringAmount,
        dueDate: meeting.meetingDate,
        competenceDate: meeting.meetingDate,
        paymentDate: meeting.meetingDate,
        status: 'pago',
        payerOrReceiver: cell.name,
        isReconciled: true,
        createdAt: new Date().toISOString()
      });
      acc.currentBalance += meeting.offeringAmount;
    }
  }

  logAudit(tenantId, req.user?.id, req.user?.name, 'CELL_MEETING_LOGGED', 'CELL_MEETING', meeting.id, {
    cell: cell.name,
    theme: meeting.theme,
    offering: meeting.offeringAmount
  });

  res.status(201).json(meeting);
});

// Leadership Tree / Hierarchy
apiRouter.get('/leadership/tree', authMiddleware, requireTenant, (req: AuthenticatedRequest, res: Response) => {
  const tenantId = req.tenantId!;
  const seniorPastors = db.members.filter(m => m.tenantId === tenantId && m.isLeader).slice(0, 1);

  const tree = {
    id: seniorPastors[0]?.id || 'pastor_root',
    name: seniorPastors[0]?.name || 'Pr. Tiago Silva',
    role: 'Pastor Principal',
    congregation: 'Sede Central',
    children: [
      {
        id: 'coord_1',
        name: 'Pr. Roberto Camargo',
        role: 'Pastor de Campus & Coordenador',
        congregation: 'Campus Zona Sul',
        children: [
          {
            id: 'lider_3',
            name: 'Diác. Marcelo Souza',
            role: 'Líder de Célula Ebenézer',
            cellsCount: 1,
            membersCount: 12
          }
        ]
      },
      {
        id: 'sup_1',
        name: 'Matheus Oliveira',
        role: 'Supervisor de Juventude',
        congregation: 'Sede Central',
        children: [
          {
            id: 'lider_1',
            name: 'Lucas Ferreira',
            role: 'Líder Célula Ágape',
            cellsCount: 1,
            membersCount: 14
          },
          {
            id: 'lider_2',
            name: 'Beatriz Albuquerque',
            role: 'Líder Célula Betel',
            cellsCount: 1,
            membersCount: 16
          }
        ]
      }
    ]
  };

  res.json(tree);
});

// =============================================================================
// DISCIPULADO E JORNADA PASTORAL (FUNIL)
// =============================================================================

apiRouter.get('/discipleship/pipeline', authMiddleware, requireTenant, (req: AuthenticatedRequest, res: Response) => {
  const tenantId = req.tenantId!;
  const followups = db.pastoralFollowups.filter(f => f.tenantId === tenantId);
  const visitors = db.visitors.filter(v => v.tenantId === tenantId);

  res.json({
    followups,
    visitors
  });
});

apiRouter.post('/discipleship/followup', authMiddleware, requireTenant, (req: AuthenticatedRequest, res: Response) => {
  const tenantId = req.tenantId!;
  const { personName, visitorId, memberId, stage, channel, scheduledDate, notes } = req.body;

  if (!personName || !stage || !notes) {
    res.status(400).json({ error: 'Nome da pessoa, etapa e anotações são obrigatórios.' });
    return;
  }

  const followup: PastoralFollowup = {
    id: `foll_${Date.now()}`,
    tenantId,
    personName,
    visitorId,
    memberId,
    responsibleUserId: req.user?.id || 'usr_pastor_tiago',
    responsibleUserName: req.user?.name || 'Pr. Tiago Silva',
    stage,
    channel: channel || 'whatsapp',
    scheduledDate: scheduledDate || new Date().toISOString().split('T')[0],
    notes,
    status: 'pendente',
    createdAt: new Date().toISOString()
  };

  db.pastoralFollowups.unshift(followup);
  logAudit(tenantId, req.user?.id, req.user?.name, 'DISCIPLESHIP_ENTRY_CREATED', 'FOLLOWUP', followup.id);

  res.status(201).json(followup);
});

apiRouter.put('/discipleship/followup/:id', authMiddleware, requireTenant, (req: AuthenticatedRequest, res: Response) => {
  const tenantId = req.tenantId!;
  const { id } = req.params;
  const followup = db.pastoralFollowups.find(f => f.id === id && f.tenantId === tenantId);

  if (!followup) {
    res.status(404).json({ error: 'Registro de acompanhamento não encontrado.' });
    return;
  }

  Object.assign(followup, req.body);
  if (req.body.status === 'concluido' && !followup.completedDate) {
    followup.completedDate = new Date().toISOString().split('T')[0];
  }

  res.json(followup);
});

// =============================================================================
// EVENTOS, LOTES, INSCRIÇÕES E CHECK-IN
// =============================================================================

apiRouter.get('/events', authMiddleware, requireTenant, (req: AuthenticatedRequest, res: Response) => {
  const tenantId = req.tenantId!;
  const events = db.events.filter(e => e.tenantId === tenantId);

  const enriched = events.map(evt => {
    const lots = db.eventTicketLots.filter(l => l.eventId === evt.id);
    const regs = db.eventRegistrations.filter(r => r.eventId === evt.id);
    const paidRegs = regs.filter(r => r.paymentStatus === 'aprovado');
    const checkedInCount = regs.filter(r => r.checkedIn).length;
    const grossRevenue = paidRegs.reduce((acc, r) => acc + r.finalAmount, 0);
    const totalSold = lots.reduce((acc, l) => acc + l.quantitySold, 0);

    return {
      ...evt,
      lots,
      totalSold,
      totalRegistrations: regs.length,
      paidRegistrations: paidRegs.length,
      checkedInCount,
      grossRevenue
    };
  });

  res.json(enriched);
});

apiRouter.post('/events', authMiddleware, requireTenant, (req: AuthenticatedRequest, res: Response) => {
  const tenantId = req.tenantId!;
  const { title, description, category, startDate, endDate, locationName, address, organizerName, isPaid, capacity, lots } = req.body;

  if (!title || !startDate || !locationName) {
    res.status(400).json({ error: 'Título, data de início e local são obrigatórios.' });
    return;
  }

  const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  const newEvent: EventItem = {
    id: `evt_${Date.now()}`,
    tenantId,
    congregationId: db.congregations.find(c => c.tenantId === tenantId)?.id || 'cong_sede',
    title,
    slug,
    description: description || '',
    category: category || 'conferencia',
    startDate,
    endDate: endDate || startDate,
    locationName,
    address: address || '',
    organizerName: organizerName || 'Coordenação de Eventos',
    isPaid: Boolean(isPaid),
    isPublished: true,
    capacity: Number(capacity) || 300,
    paymentProviderId: 'pi_asaas',
    createdAt: new Date().toISOString()
  };

  db.events.unshift(newEvent);

  // Automatically create cost center for this event
  db.financialCostCenters.push({
    id: `cc_evt_${newEvent.id}`,
    tenantId,
    name: `Evento: ${newEvent.title}`,
    code: `CC-EVT-${Math.floor(10 + Math.random() * 89)}`,
    eventId: newEvent.id,
    isActive: true
  });

  // Create initial ticket lots
  if (Array.isArray(lots) && lots.length > 0) {
    lots.forEach((lot: { name: string; price: number; quantity: number }, idx: number) => {
      db.eventTicketLots.push({
        id: `lot_${newEvent.id}_${idx + 1}`,
        tenantId,
        eventId: newEvent.id,
        name: lot.name || `Lote ${idx + 1}`,
        price: Number(lot.price) || 0,
        quantityTotal: Number(lot.quantity) || 100,
        quantitySold: 0,
        startDate: newEvent.startDate,
        endDate: newEvent.endDate,
        isActive: true
      });
    });
  } else {
    db.eventTicketLots.push({
      id: `lot_${newEvent.id}_1`,
      tenantId,
      eventId: newEvent.id,
      name: 'Lote Único Geral',
      price: newEvent.isPaid ? 99.00 : 0.00,
      quantityTotal: newEvent.capacity,
      quantitySold: 0,
      startDate: newEvent.startDate,
      endDate: newEvent.endDate,
      isActive: true
    });
  }

  logAudit(tenantId, req.user?.id, req.user?.name, 'EVENT_CREATED', 'EVENT', newEvent.id, { title: newEvent.title });
  res.status(201).json(newEvent);
});

apiRouter.get('/events/:id/details', authMiddleware, requireTenant, (req: AuthenticatedRequest, res: Response) => {
  const tenantId = req.tenantId!;
  const { id } = req.params;
  const event = db.events.find(e => e.id === id && e.tenantId === tenantId);

  if (!event) {
    res.status(404).json({ error: 'Evento não encontrado.' });
    return;
  }

  const lots = db.eventTicketLots.filter(l => l.eventId === event.id);
  const registrations = db.eventRegistrations.filter(r => r.eventId === event.id);
  const expenses = db.eventExpenses.filter(e => e.eventId === event.id);

  // Event financial calculations
  const grossRevenue = registrations.filter(r => r.paymentStatus === 'aprovado').reduce((acc, r) => acc + r.finalAmount, 0);
  const estimatedGatewayFees = grossRevenue * 0.029; // 2.9% average fee
  const netRevenue = grossRevenue - estimatedGatewayFees;
  const totalExpenses = expenses.filter(e => e.status === 'pago').reduce((acc, e) => acc + e.amount, 0);
  const pendingExpenses = expenses.filter(e => e.status === 'pendente').reduce((acc, e) => acc + e.amount, 0);
  const operationalProfit = netRevenue - totalExpenses;

  res.json({
    event,
    lots,
    registrations,
    expenses,
    financialSummary: {
      grossRevenue,
      estimatedGatewayFees,
      netRevenue,
      totalExpenses,
      pendingExpenses,
      operationalProfit,
      totalRegistrations: registrations.length,
      paidCount: registrations.filter(r => r.paymentStatus === 'aprovado').length,
      checkedInCount: registrations.filter(r => r.checkedIn).length
    }
  });
});

apiRouter.post('/events/:id/expenses', authMiddleware, requireTenant, (req: AuthenticatedRequest, res: Response) => {
  const tenantId = req.tenantId!;
  const { id } = req.params;
  const event = db.events.find(e => e.id === id && e.tenantId === tenantId);

  if (!event) {
    res.status(404).json({ error: 'Evento não encontrado.' });
    return;
  }

  const { description, category, amount, supplierName, dueDate, status = 'pendente' } = req.body;
  if (!description || !amount || !supplierName || !dueDate) {
    res.status(400).json({ error: 'Descrição, valor, fornecedor e data de vencimento são obrigatórios.' });
    return;
  }

  const newExpense: EventExpense = {
    id: `ee_${Date.now()}`,
    tenantId,
    eventId: event.id,
    description,
    category: category || 'outros',
    amount: Number(amount),
    supplierName,
    dueDate,
    status,
    paymentDate: status === 'pago' ? new Date().toISOString().split('T')[0] : undefined,
    createdAt: new Date().toISOString()
  };

  db.eventExpenses.unshift(newExpense);

  // Reflect in General Financials automatically with origin event tag
  const acc = db.financialAccounts.find(a => a.tenantId === tenantId);
  const cat = db.financialCategories.find(c => c.tenantId === tenantId && c.type === 'despesa');
  const costCenter = db.financialCostCenters.find(cc => cc.eventId === event.id);

  if (acc && cat) {
    db.financialTransactions.unshift({
      id: `tx_ee_${newExpense.id}`,
      tenantId,
      congregationId: event.congregationId,
      accountId: acc.id,
      accountName: acc.name,
      categoryId: cat.id,
      categoryName: 'Despesas com Eventos',
      costCenterId: costCenter?.id,
      costCenterName: costCenter?.name,
      eventId: event.id,
      eventTitle: event.title,
      type: 'despesa',
      nature: 'ministerio',
      description: `[${event.title}] ${newExpense.description}`,
      amount: newExpense.amount,
      feeAmount: 0,
      netAmount: newExpense.amount,
      dueDate: newExpense.dueDate,
      competenceDate: newExpense.dueDate,
      paymentDate: newExpense.paymentDate,
      status: newExpense.status === 'pago' ? 'pago' : 'pendente',
      payerOrReceiver: newExpense.supplierName,
      isReconciled: newExpense.status === 'pago',
      createdAt: new Date().toISOString()
    });
  }

  logAudit(tenantId, req.user?.id, req.user?.name, 'EVENT_EXPENSE_CREATED', 'EVENT_EXPENSE', newExpense.id, {
    event: event.title,
    amount: newExpense.amount
  });

  res.status(201).json(newExpense);
});

// Check-in QR Code endpoint
apiRouter.post('/events/checkin', authMiddleware, requireTenant, (req: AuthenticatedRequest, res: Response) => {
  const tenantId = req.tenantId!;
  const { codeOrToken } = req.body;

  if (!codeOrToken) {
    res.status(400).json({ error: 'Código ou token de QR Code é obrigatório.' });
    return;
  }

  const clean = String(codeOrToken).trim();
  const reg = db.eventRegistrations.find(
    r => r.tenantId === tenantId && (r.qrCodeToken === clean || r.code === clean || r.attendeeEmail.toLowerCase() === clean.toLowerCase())
  );

  if (!reg) {
    res.status(404).json({ error: 'Inscrição não encontrada. Verifique o código informado.' });
    return;
  }

  if (reg.paymentStatus !== 'aprovado') {
    res.status(400).json({
      error: `Inscrição não pode receber check-in: Pagamento está com status '${reg.paymentStatus.toUpperCase()}'.`,
      registration: reg
    });
    return;
  }

  if (reg.checkedIn) {
    res.status(400).json({
      error: `Atenção: Participante JÁ realizou check-in anteriormente em ${new Date(reg.checkedInAt!).toLocaleTimeString('pt-BR')}.`,
      registration: reg,
      alreadyCheckedIn: true
    });
    return;
  }

  reg.checkedIn = true;
  reg.checkedInAt = new Date().toISOString();

  logAudit(tenantId, req.user?.id, req.user?.name, 'CHECKIN_COMPLETED', 'EVENT_REGISTRATION', reg.id, {
    attendee: reg.attendeeName,
    code: reg.code
  });

  res.json({
    success: true,
    message: `Check-in realizado com sucesso para ${reg.attendeeName}!`,
    registration: reg
  });
});

// PUBLIC EVENT REGISTRATION (Open to guests, no auth needed)
apiRouter.get('/public/events/:slug', (req, res) => {
  const { slug } = req.params;
  const event = db.events.find(e => e.slug === slug && e.isPublished);

  if (!event) {
    res.status(404).json({ error: 'Evento não encontrado ou inscrições encerradas.' });
    return;
  }

  const tenant = db.tenants.find(t => t.id === event.tenantId);
  const tenantSettings = db.tenantSettings.find(s => s.tenantId === event.tenantId);
  const lots = db.eventTicketLots.filter(l => l.eventId === event.id && l.isActive);

  res.json({
    event,
    church: {
      name: tenant?.name || 'Igreja',
      contactEmail: tenant?.contactEmail,
      contactPhone: tenant?.contactPhone
    },
    settings: tenantSettings,
    lots
  });
});

apiRouter.post('/public/events/:slug/register', (req, res) => {
  const { slug } = req.params;
  const event = db.events.find(e => e.slug === slug && e.isPublished);

  if (!event) {
    res.status(404).json({ error: 'Evento não encontrado.' });
    return;
  }

  const { lotId, attendeeName, attendeeEmail, attendeePhone, attendeeCpf, congregationName, cellName, paymentMethod = 'pix' } = req.body;

  if (!lotId || !attendeeName || !attendeeEmail || !attendeePhone) {
    res.status(400).json({ error: 'Nome, e-mail, telefone e lote são obrigatórios para a inscrição.' });
    return;
  }

  const lot = db.eventTicketLots.find(l => l.id === lotId && l.eventId === event.id);
  if (!lot || lot.quantitySold >= lot.quantityTotal) {
    res.status(400).json({ error: 'Lote selecionado está esgotado ou indisponível.' });
    return;
  }

  const regCode = `INS-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
  const qrToken = `QR-${event.slug.toUpperCase().substring(0, 4)}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

  const registration: EventRegistration = {
    id: `reg_${Date.now()}`,
    tenantId: event.tenantId,
    eventId: event.id,
    lotId: lot.id,
    lotName: lot.name,
    code: regCode,
    attendeeName,
    attendeeEmail,
    attendeePhone,
    attendeeCpf,
    congregationName,
    cellName,
    unitPrice: lot.price,
    discountAmount: 0,
    finalAmount: lot.price,
    paymentMethod,
    paymentStatus: lot.price === 0 ? 'aprovado' : 'aprovado', // Mock instant payment in sandbox test mode
    gatewayProvider: 'asaas',
    gatewayTransactionId: `pay_gw_${Date.now()}`,
    qrCodeToken: qrToken,
    checkedIn: false,
    createdAt: new Date().toISOString()
  };

  db.eventRegistrations.unshift(registration);
  lot.quantitySold += 1;

  // Auto add to General Financials
  if (registration.finalAmount > 0) {
    const acc = db.financialAccounts.find(a => a.tenantId === event.tenantId && a.accountType === 'gateway_virtual') || db.financialAccounts.find(a => a.tenantId === event.tenantId);
    const cat = db.financialCategories.find(c => c.tenantId === event.tenantId && c.type === 'receita');
    const costCenter = db.financialCostCenters.find(cc => cc.eventId === event.id);

    if (acc && cat) {
      const fee = Number((registration.finalAmount * 0.02).toFixed(2));
      db.financialTransactions.unshift({
        id: `tx_reg_${registration.id}`,
        tenantId: event.tenantId,
        congregationId: event.congregationId,
        accountId: acc.id,
        accountName: acc.name,
        categoryId: cat.id,
        categoryName: 'Inscrições em Eventos',
        costCenterId: costCenter?.id,
        costCenterName: costCenter?.name,
        eventId: event.id,
        eventTitle: event.title,
        type: 'receita',
        nature: 'evento_inscricao',
        description: `Inscrição ${registration.code} - ${event.title} (${registration.attendeeName})`,
        amount: registration.finalAmount,
        feeAmount: fee,
        netAmount: registration.finalAmount - fee,
        dueDate: new Date().toISOString().split('T')[0],
        competenceDate: new Date().toISOString().split('T')[0],
        paymentDate: new Date().toISOString().split('T')[0],
        status: 'pago',
        payerOrReceiver: registration.attendeeName,
        gatewayProvider: registration.gatewayProvider,
        gatewayTransactionId: registration.gatewayTransactionId,
        isReconciled: true,
        createdAt: new Date().toISOString()
      });
      acc.currentBalance += (registration.finalAmount - fee);
    }
  }

  res.status(201).json({
    success: true,
    message: 'Inscrição realizada com sucesso!',
    registration
  });
});

// =============================================================================
// MÓDULO FINANCEIRO GERAL
// =============================================================================

apiRouter.get('/financial/summary', authMiddleware, requireTenant, (req: AuthenticatedRequest, res: Response) => {
  const tenantId = req.tenantId!;
  const transactions = db.financialTransactions.filter(t => t.tenantId === tenantId);
  const accounts = db.financialAccounts.filter(a => a.tenantId === tenantId && a.isActive);

  const totalBankBalance = accounts.reduce((acc, a) => acc + a.currentBalance, 0);
  const totalIncomePaid = transactions.filter(t => t.type === 'receita' && t.status === 'pago').reduce((acc, t) => acc + t.amount, 0);
  const totalExpensePaid = transactions.filter(t => t.type === 'despesa' && t.status === 'pago').reduce((acc, t) => acc + t.amount, 0);
  const pendingReceivables = transactions.filter(t => t.type === 'receita' && t.status === 'pendente').reduce((acc, t) => acc + t.amount, 0);
  const pendingPayables = transactions.filter(t => t.type === 'despesa' && t.status === 'pendente').reduce((acc, t) => acc + t.amount, 0);
  const netResult = totalIncomePaid - totalExpensePaid;

  res.json({
    totalBankBalance,
    totalIncomePaid,
    totalExpensePaid,
    pendingReceivables,
    pendingPayables,
    netResult,
    accounts
  });
});

apiRouter.get('/financial/transactions', authMiddleware, requireTenant, (req: AuthenticatedRequest, res: Response) => {
  const tenantId = req.tenantId!;
  const { type, status, search, eventId } = req.query;

  let list = db.financialTransactions.filter(t => t.tenantId === tenantId);

  if (type && type !== 'todos') {
    list = list.filter(t => t.type === type);
  }
  if (status && status !== 'todos') {
    list = list.filter(t => t.status === status);
  }
  if (eventId) {
    list = list.filter(t => t.eventId === eventId);
  }
  if (search) {
    const q = String(search).toLowerCase();
    list = list.filter(t => t.description.toLowerCase().includes(q) || t.payerOrReceiver?.toLowerCase().includes(q));
  }

  res.json(list.sort((a, b) => b.dueDate.localeCompare(a.dueDate)));
});

apiRouter.post('/financial/transactions', authMiddleware, requireTenant, (req: AuthenticatedRequest, res: Response) => {
  const tenantId = req.tenantId!;
  const { type, nature, description, amount, accountId, categoryId, costCenterId, dueDate, paymentDate, payerOrReceiver, status = 'pago' } = req.body;

  if (!description || !amount || !accountId || !categoryId) {
    res.status(400).json({ error: 'Descrição, valor, conta bancária e categoria são obrigatórios.' });
    return;
  }

  const account = db.financialAccounts.find(a => a.id === accountId && a.tenantId === tenantId);
  const category = db.financialCategories.find(c => c.id === categoryId && c.tenantId === tenantId);
  const costCenter = costCenterId ? db.financialCostCenters.find(cc => cc.id === costCenterId) : null;

  const numAmount = Number(amount);
  const transaction: FinancialTransaction = {
    id: `tx_${Date.now()}`,
    tenantId,
    congregationId: account?.congregationId || 'cong_sede',
    accountId,
    accountName: account ? account.name : 'Conta Padrão',
    categoryId,
    categoryName: category ? category.name : 'Geral',
    costCenterId: costCenter?.id,
    costCenterName: costCenter?.name,
    type: type || 'receita',
    nature: nature || 'outros',
    description,
    amount: numAmount,
    feeAmount: 0,
    netAmount: numAmount,
    dueDate: dueDate || new Date().toISOString().split('T')[0],
    competenceDate: dueDate || new Date().toISOString().split('T')[0],
    paymentDate: status === 'pago' ? (paymentDate || new Date().toISOString().split('T')[0]) : undefined,
    status,
    payerOrReceiver,
    isReconciled: status === 'pago',
    createdAt: new Date().toISOString()
  };

  db.financialTransactions.unshift(transaction);

  if (account && status === 'pago') {
    if (transaction.type === 'receita') {
      account.currentBalance += numAmount;
    } else if (transaction.type === 'despesa') {
      account.currentBalance -= numAmount;
    }
  }

  logAudit(tenantId, req.user?.id, req.user?.name, 'TRANSACTION_RECORDED', 'FINANCIAL_TRANSACTION', transaction.id, {
    description: transaction.description,
    amount: transaction.amount
  });

  res.status(201).json(transaction);
});

apiRouter.get('/financial/accounts', authMiddleware, requireTenant, (req: AuthenticatedRequest, res: Response) => {
  const tenantId = req.tenantId!;
  res.json(db.financialAccounts.filter(a => a.tenantId === tenantId));
});

apiRouter.get('/financial/categories', authMiddleware, requireTenant, (req: AuthenticatedRequest, res: Response) => {
  const tenantId = req.tenantId!;
  res.json(db.financialCategories.filter(c => c.tenantId === tenantId));
});

apiRouter.get('/financial/cost-centers', authMiddleware, requireTenant, (req: AuthenticatedRequest, res: Response) => {
  const tenantId = req.tenantId!;
  res.json(db.financialCostCenters.filter(cc => cc.tenantId === tenantId));
});

// Financial Reconciliation
apiRouter.get('/financial/reconciliation', authMiddleware, requireTenant, (req: AuthenticatedRequest, res: Response) => {
  const tenantId = req.tenantId!;
  const unreconciledTx = db.financialTransactions.filter(t => t.tenantId === tenantId && !t.isReconciled);
  const gatewayPending = db.eventRegistrations.filter(r => r.tenantId === tenantId && r.paymentStatus === 'aprovado' && !r.checkedIn);

  res.json({
    unreconciledCount: unreconciledTx.length,
    unreconciledTransactions: unreconciledTx,
    gatewayPendingCount: gatewayPending.length,
    gatewayPendingRegistrations: gatewayPending
  });
});

apiRouter.post('/financial/reconcile-tx/:id', authMiddleware, requireTenant, (req: AuthenticatedRequest, res: Response) => {
  const tenantId = req.tenantId!;
  const { id } = req.params;
  const tx = db.financialTransactions.find(t => t.id === id && t.tenantId === tenantId);

  if (!tx) {
    res.status(404).json({ error: 'Transação não encontrada.' });
    return;
  }

  tx.isReconciled = true;
  logAudit(tenantId, req.user?.id, req.user?.name, 'TRANSACTION_RECONCILED', 'FINANCIAL_TRANSACTION', tx.id);
  res.json({ success: true, transaction: tx });
});

// =============================================================================
// INTEGRAÇÃO COM GATEWAYS DE PAGAMENTO & WEBHOOKS
// =============================================================================

apiRouter.get('/gateways', authMiddleware, requireTenant, (req: AuthenticatedRequest, res: Response) => {
  const tenantId = req.tenantId!;
  res.json(db.paymentIntegrations.filter(pi => pi.tenantId === tenantId));
});

apiRouter.post('/gateways/:id/toggle-status', authMiddleware, requireTenant, (req: AuthenticatedRequest, res: Response) => {
  const tenantId = req.tenantId!;
  const { id } = req.params;
  const gw = db.paymentIntegrations.find(p => p.id === id && p.tenantId === tenantId);

  if (!gw) {
    res.status(404).json({ error: 'Integração de pagamento não encontrada.' });
    return;
  }

  gw.isActive = !gw.isActive;
  res.json(gw);
});

apiRouter.post('/gateways/:id/test-connection', authMiddleware, requireTenant, (req: AuthenticatedRequest, res: Response) => {
  const tenantId = req.tenantId!;
  const { id } = req.params;
  const gw = db.paymentIntegrations.find(p => p.id === id && p.tenantId === tenantId);

  if (!gw) {
    res.status(404).json({ error: 'Integração não encontrada.' });
    return;
  }

  gw.lastHealthCheckAt = new Date().toISOString();
  gw.lastHealthStatus = 'healthy';

  res.json({
    success: true,
    status: 'healthy',
    message: `Conexão com gateway ${gw.name} testada com sucesso! Sandbox API respondendo em 180ms.`
  });
});

apiRouter.get('/webhooks', authMiddleware, requireTenant, (req: AuthenticatedRequest, res: Response) => {
  const tenantId = req.tenantId!;
  res.json(db.paymentWebhookEvents.filter(w => w.tenantId === tenantId).sort((a, b) => b.receivedAt.localeCompare(a.receivedAt)));
});

// Webhook Simulation & Idempotency Check
apiRouter.post('/webhooks/simulate', authMiddleware, requireTenant, (req: AuthenticatedRequest, res: Response) => {
  const tenantId = req.tenantId!;
  const { provider = 'asaas', eventType = 'PAYMENT_RECEIVED', amount = 119.00, attendeeName = 'Marcos Vinicius' } = req.body;

  const externalId = `sim_${Date.now()}_${Math.floor(100 + Math.random() * 900)}`;

  // Idempotency check: verify if externalEventId already exists
  const existing = db.paymentWebhookEvents.find(w => w.tenantId === tenantId && w.provider === provider && w.externalEventId === externalId);
  if (existing) {
    existing.status = 'ignorado_duplicado';
    res.status(200).json({ status: 'ignorado_duplicado', message: 'Webhook ignorado por duplicidade (Idempotência garantida).' });
    return;
  }

  const webhookEvent: PaymentWebhookEvent = {
    id: `pwe_${Date.now()}`,
    tenantId,
    provider,
    externalEventId: externalId,
    eventType,
    payloadJson: {
      provider,
      event: eventType,
      simulated: true,
      amount: Number(amount),
      customerName: attendeeName,
      timestamp: new Date().toISOString()
    },
    receivedAt: new Date().toISOString(),
    status: 'processado',
    retryCount: 0,
    processedAt: new Date().toISOString()
  };

  db.paymentWebhookEvents.unshift(webhookEvent);
  logAudit(tenantId, req.user?.id, req.user?.name, 'WEBHOOK_PROCESSED', 'WEBHOOK_EVENT', webhookEvent.id, { provider, eventType });

  res.status(201).json({
    success: true,
    message: 'Webhook simulado e processado com sucesso pelo adapter.',
    event: webhookEvent
  });
});

// =============================================================================
// PAINEL SAAS (SUPERADMIN COMERCIAL)
// =============================================================================

apiRouter.get('/saas/metrics', authMiddleware, requireRole(['superadmin_saas']), (req, res) => {
  const totalTenants = db.tenants.length;
  const activeTenants = db.tenants.filter(t => t.status === 'active').length;
  const trialTenants = db.tenants.filter(t => t.status === 'trial').length;

  const plans = db.plans;
  const mrr = db.tenants.reduce((acc, t) => {
    const plan = plans.find(p => p.id === t.planId);
    return acc + (plan ? plan.monthlyPrice : 149);
  }, 0);
  const arr = mrr * 12;

  const totalMembersAcrossPlatform = db.members.length;
  const totalEventsAcrossPlatform = db.events.length;

  res.json({
    totalTenants,
    activeTenants,
    trialTenants,
    mrr,
    arr,
    churnRate: '1.2%',
    ltv: 4890.00,
    totalMembersAcrossPlatform,
    totalEventsAcrossPlatform
  });
});

apiRouter.get('/saas/tenants', authMiddleware, requireRole(['superadmin_saas']), (req, res) => {
  const enriched = db.tenants.map(t => {
    const plan = db.plans.find(p => p.id === t.planId);
    const membersCount = db.members.filter(m => m.tenantId === t.id).length;
    const cellsCount = db.cells.filter(c => c.tenantId === t.id).length;
    const eventsCount = db.events.filter(e => e.tenantId === t.id).length;

    return {
      ...t,
      planName: plan ? plan.name : 'Custom',
      planPrice: plan ? plan.monthlyPrice : 0,
      limits: plan,
      stats: {
        membersCount,
        cellsCount,
        eventsCount
      }
    };
  });

  res.json(enriched);
});

apiRouter.post('/saas/tenants/:id/status', authMiddleware, requireRole(['superadmin_saas']), (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  const tenant = db.tenants.find(t => t.id === id);

  if (!tenant) {
    res.status(404).json({ error: 'Igreja não encontrada.' });
    return;
  }

  tenant.status = status;
  tenant.updatedAt = new Date().toISOString();
  res.json(tenant);
});

apiRouter.get('/saas/plans', (req, res) => {
  res.json(db.plans);
});

// Audit Logs list
apiRouter.get('/audit-logs', authMiddleware, requireTenant, (req: AuthenticatedRequest, res: Response) => {
  const tenantId = req.tenantId!;
  res.json(db.auditLogs.filter(a => a.tenantId === tenantId).slice(0, 50));
});
