export type UserRole =
  | 'superadmin_saas'
  | 'admin_igreja'
  | 'pastor_principal'
  | 'pastor_auxiliar'
  | 'coordenador'
  | 'supervisor_celulas'
  | 'lider_celula'
  | 'colider'
  | 'tesoureiro'
  | 'secretario'
  | 'responsavel_eventos'
  | 'responsavel_ministerio'
  | 'membro';

export interface Tenant {
  id: string;
  name: string;
  slug: string;
  documentCnpj?: string;
  contactEmail: string;
  contactPhone?: string;
  planId: string;
  status: 'trial' | 'active' | 'past_due' | 'suspended' | 'cancelled';
  trialEndsAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface TenantSettings {
  id: string;
  tenantId: string;
  primaryColor: string;
  secondaryColor: string;
  logoUrl?: string;
  timezone: string;
  dateFormat: string;
  currency: string;
  allowPublicRegistrations: boolean;
}

export interface Congregation {
  id: string;
  tenantId: string;
  name: string;
  code?: string;
  isMain: boolean;
  phone?: string;
  email?: string;
  address?: string;
  city?: string;
  state?: string;
  isActive: boolean;
}

export interface User {
  id: string;
  tenantId?: string; // null for superadmin_saas
  congregationId?: string;
  name: string;
  email: string;
  passwordHash: string;
  phone?: string;
  avatarUrl?: string;
  roleCode: UserRole;
  isActive: boolean;
  lastLoginAt?: string;
  createdAt: string;
}

export interface Member {
  id: string;
  tenantId: string;
  congregationId: string;
  name: string;
  photoUrl?: string;
  birthDate?: string;
  phone?: string;
  email?: string;
  cpf?: string;
  gender?: 'M' | 'F';
  maritalStatus?: 'solteiro' | 'casado' | 'viuvo' | 'divorciado' | 'outro';
  address?: string;
  neighborhood?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  conversionDate?: string;
  baptismDate?: string;
  membershipStatus: 'ativo' | 'inativo' | 'em_disciplina' | 'transferido' | 'falecido';
  isLeader: boolean;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Visitor {
  id: string;
  tenantId: string;
  congregationId: string;
  name: string;
  phone: string;
  email?: string;
  firstVisitDate: string;
  firstCellId?: string;
  invitedByMemberId?: string;
  funnelStage: 'novo' | 'primeiro_contato' | 'integracao' | 'discipulado' | 'membro' | 'desistente';
  notes?: string;
  convertedToMemberId?: string;
  convertedAt?: string;
  createdAt: string;
}

export interface Cell {
  id: string;
  tenantId: string;
  congregationId: string;
  code: string;
  name: string;
  type: 'mista' | 'jovens' | 'homens' | 'mulheres' | 'criancas' | 'casais' | 'empresarios';
  dayOfWeek: 'segunda' | 'terca' | 'quarta' | 'quinta' | 'sexta' | 'sabado' | 'domingo';
  meetingTime: string;
  address: string;
  neighborhood: string;
  city: string;
  state: string;
  postalCode?: string;
  leaderId: string;
  coLeaderId?: string;
  supervisorId?: string;
  coordinatorId?: string;
  openingDate: string;
  maxCapacity: number;
  status: 'ativa' | 'em_multiplicacao' | 'pausada' | 'encerrada';
  notes?: string;
  createdAt: string;
}

export interface CellMeeting {
  id: string;
  tenantId: string;
  cellId: string;
  meetingDate: string;
  theme: string;
  leaderInChargeId: string;
  totalMembersPresent: number;
  totalVisitorsPresent: number;
  totalAbsent: number;
  offeringAmount: number;
  decisionsCount: number;
  prayerRequests?: string;
  observations?: string;
  photoUrl?: string;
  createdAt: string;
}

export interface CellAttendanceRecord {
  id: string;
  tenantId: string;
  meetingId: string;
  memberId?: string;
  visitorId?: string;
  attendeeName: string;
  isPresent: boolean;
  isVisitor: boolean;
  notes?: string;
}

export interface PastoralFollowup {
  id: string;
  tenantId: string;
  visitorId?: string;
  memberId?: string;
  personName: string;
  responsibleUserId: string;
  responsibleUserName: string;
  stage: 'visitante' | 'primeiro_contato' | 'integracao' | 'discipulado' | 'membro_ativo' | 'lider_formacao';
  channel: 'presencial' | 'whatsapp' | 'ligacao' | 'visita_domiciliar';
  scheduledDate?: string;
  completedDate?: string;
  notes: string;
  status: 'pendente' | 'concluido' | 'cancelado';
  createdAt: string;
}

export interface Ministry {
  id: string;
  tenantId: string;
  congregationId: string;
  name: string;
  description?: string;
  leaderId: string;
  leaderName: string;
  memberCount: number;
  createdAt: string;
}

export interface EventItem {
  id: string;
  tenantId: string;
  congregationId: string;
  title: string;
  slug: string;
  description: string;
  bannerUrl?: string;
  category: 'congresso' | 'conferencia' | 'retiro' | 'acampamento' | 'encontro_casais' | 'seminario' | 'jovens' | 'arrecadacao' | 'outro';
  startDate: string;
  endDate: string;
  locationName: string;
  address: string;
  organizerName: string;
  isPaid: boolean;
  isPublished: boolean;
  capacity: number;
  cancellationPolicy?: string;
  termsAndConditions?: string;
  paymentProviderId?: string;
  createdAt: string;
}

export interface EventTicketLot {
  id: string;
  tenantId: string;
  eventId: string;
  name: string;
  price: number;
  quantityTotal: number;
  quantitySold: number;
  startDate: string;
  endDate: string;
  isActive: boolean;
}

export interface EventRegistration {
  id: string;
  tenantId: string;
  eventId: string;
  lotId: string;
  lotName: string;
  code: string;
  attendeeName: string;
  attendeeEmail: string;
  attendeePhone: string;
  attendeeCpf?: string;
  congregationName?: string;
  cellName?: string;
  unitPrice: number;
  discountAmount: number;
  finalAmount: number;
  paymentMethod: 'pix' | 'credit_card' | 'boleto' | 'cortesia';
  paymentStatus: 'pendente' | 'aprovado' | 'recusado' | 'reembolsado' | 'cancelado';
  gatewayProvider?: string;
  gatewayTransactionId?: string;
  qrCodeToken: string;
  checkedIn: boolean;
  checkedInAt?: string;
  createdAt: string;
}

export interface EventExpense {
  id: string;
  tenantId: string;
  eventId: string;
  description: string;
  category: 'alimentacao' | 'locacao' | 'som_iluminacao' | 'divulgacao' | 'palestrante' | 'hospedagem' | 'transporte' | 'materiais' | 'outros';
  amount: number;
  supplierName: string;
  dueDate: string;
  paymentDate?: string;
  status: 'pendente' | 'pago' | 'cancelado';
  createdAt: string;
}

export interface FinancialAccount {
  id: string;
  tenantId: string;
  congregationId: string;
  name: string;
  bankName: string;
  accountType: 'corrente' | 'poupanca' | 'caixa_fisico' | 'gateway_virtual';
  agency?: string;
  accountNumber?: string;
  currentBalance: number;
  isActive: boolean;
}

export interface FinancialCategory {
  id: string;
  tenantId: string;
  name: string;
  type: 'receita' | 'despesa';
  code?: string;
}

export interface FinancialCostCenter {
  id: string;
  tenantId: string;
  name: string;
  code?: string;
  eventId?: string;
  isActive: boolean;
}

export interface FinancialTransaction {
  id: string;
  tenantId: string;
  congregationId: string;
  accountId: string;
  accountName: string;
  categoryId: string;
  categoryName: string;
  costCenterId?: string;
  costCenterName?: string;
  eventId?: string;
  eventTitle?: string;
  type: 'receita' | 'despesa' | 'transferencia';
  nature: 'dizimo' | 'oferta' | 'evento_inscricao' | 'doacao' | 'aluguel' | 'utilidades' | 'ministerio' | 'folha' | 'outros';
  description: string;
  amount: number;
  feeAmount: number;
  netAmount: number;
  dueDate: string;
  competenceDate: string;
  paymentDate?: string;
  status: 'pendente' | 'pago' | 'cancelado' | 'estornado';
  payerOrReceiver?: string;
  memberId?: string;
  gatewayProvider?: string;
  gatewayTransactionId?: string;
  documentNumber?: string;
  isReconciled: boolean;
  createdAt: string;
}

export interface PaymentIntegration {
  id: string;
  tenantId: string;
  provider: 'asaas' | 'mercadopago' | 'stripe' | 'pagbank';
  name: string;
  apiKeyMasked: string;
  isSandbox: boolean;
  isActive: boolean;
  lastHealthCheckAt?: string;
  lastHealthStatus: 'healthy' | 'error' | 'untested';
  createdAt: string;
}

export interface PaymentWebhookEvent {
  id: string;
  tenantId: string;
  provider: 'asaas' | 'mercadopago' | 'stripe' | 'pagbank';
  externalEventId: string;
  eventType: string;
  payloadJson: Record<string, unknown>;
  receivedAt: string;
  status: 'pendente' | 'processado' | 'falha' | 'ignorado_duplicado';
  retryCount: number;
  errorMessage?: string;
  processedAt?: string;
}

export interface AuditLog {
  id: string;
  tenantId: string;
  userId?: string;
  userName?: string;
  action: string;
  entityType: string;
  entityId?: string;
  details?: Record<string, unknown>;
  createdAt: string;
}

export interface Plan {
  id: string;
  code: string;
  name: string;
  monthlyPrice: number;
  annualPrice: number;
  maxMembers: number;
  maxUsers: number;
  maxCells: number;
  maxEventsPerMonth: number;
  hasFinancialModule: boolean;
  hasPaymentGateway: boolean;
  hasBiAnalytics: boolean;
  hasMultiCongregations: boolean;
}
