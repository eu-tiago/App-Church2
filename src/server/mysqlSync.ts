import { pool, query, execute } from './mysql';
import { db } from './db';
import {
  Member,
  Visitor,
  Cell,
  EventRegistration,
  FinancialTransaction,
  AuditLog
} from './types';

/**
 * Initializes and synchronizes memory state with the remote MySQL database.
 */
export async function initMySQLSync(): Promise<void> {
  try {
    console.log('[MySQL] Synchronizing database state with srv1940.hstgr.io...');

    // Sync Members from MySQL
    const mysqlMembers = await query<any>('SELECT * FROM members WHERE membership_status != "falecido"');
    if (mysqlMembers && mysqlMembers.length > 0) {
      console.log(`[MySQL] Loaded ${mysqlMembers.length} members from MySQL.`);
      for (const m of mysqlMembers) {
        const existingIdx = db.members.findIndex(em => em.id === m.id);
        const mappedMember: Member = {
          id: m.id,
          tenantId: m.tenant_id,
          congregationId: m.congregation_id,
          name: m.name,
          phone: m.phone,
          email: m.email,
          membershipStatus: m.membership_status,
          isLeader: Boolean(m.is_leader),
          notes: m.notes,
          createdAt: m.created_at ? new Date(m.created_at).toISOString() : new Date().toISOString(),
          updatedAt: m.updated_at ? new Date(m.updated_at).toISOString() : new Date().toISOString()
        };

        if (existingIdx >= 0) {
          db.members[existingIdx] = mappedMember;
        } else {
          db.members.push(mappedMember);
        }
      }
    }

    // Sync Visitors from MySQL
    const mysqlVisitors = await query<any>('SELECT * FROM visitors');
    if (mysqlVisitors && mysqlVisitors.length > 0) {
      console.log(`[MySQL] Loaded ${mysqlVisitors.length} visitors from MySQL.`);
      for (const v of mysqlVisitors) {
        const existingIdx = db.visitors.findIndex(ev => ev.id === v.id);
        const mappedVisitor: Visitor = {
          id: v.id,
          tenantId: v.tenant_id,
          congregationId: v.congregation_id,
          name: v.name,
          phone: v.phone,
          email: v.email,
          firstVisitDate: v.first_visit_date ? new Date(v.first_visit_date).toISOString().split('T')[0] : '2026-11-01',
          funnelStage: v.funnel_stage,
          notes: v.notes,
          convertedToMemberId: v.converted_to_member_id,
          createdAt: v.created_at ? new Date(v.created_at).toISOString() : new Date().toISOString()
        };

        if (existingIdx >= 0) {
          db.visitors[existingIdx] = mappedVisitor;
        } else {
          db.visitors.push(mappedVisitor);
        }
      }
    }

    // Sync Cells from MySQL
    const mysqlCells = await query<any>('SELECT * FROM cells');
    if (mysqlCells && mysqlCells.length > 0) {
      console.log(`[MySQL] Loaded ${mysqlCells.length} cells from MySQL.`);
      for (const c of mysqlCells) {
        const existingIdx = db.cells.findIndex(ec => ec.id === c.id);
        const mappedCell: Cell = {
          id: c.id,
          tenantId: c.tenant_id,
          congregationId: c.congregation_id,
          code: c.code,
          name: c.name,
          type: c.type,
          dayOfWeek: c.day_of_week,
          meetingTime: c.meeting_time,
          address: c.address,
          neighborhood: c.neighborhood,
          city: c.city || 'São Paulo',
          state: c.state || 'SP',
          leaderId: c.leader_id,
          openingDate: c.opening_date ? new Date(c.opening_date).toISOString().split('T')[0] : '2025-01-01',
          maxCapacity: c.max_capacity || 15,
          status: c.status,
          notes: c.notes,
          createdAt: c.created_at ? new Date(c.created_at).toISOString() : new Date().toISOString()
        };

        if (existingIdx >= 0) {
          db.cells[existingIdx] = mappedCell;
        } else {
          db.cells.push(mappedCell);
        }
      }
    }

    // Sync Registrations from MySQL
    const mysqlRegs = await query<any>('SELECT * FROM event_registrations');
    if (mysqlRegs && mysqlRegs.length > 0) {
      console.log(`[MySQL] Loaded ${mysqlRegs.length} event registrations from MySQL.`);
      for (const r of mysqlRegs) {
        const existingIdx = db.eventRegistrations.findIndex(er => er.id === r.id);
        const mappedReg: EventRegistration = {
          id: r.id,
          tenantId: r.tenant_id,
          eventId: r.event_id,
          lotId: r.lot_id,
          lotName: 'Lote Geral',
          code: r.code,
          attendeeName: r.attendee_name,
          attendeeEmail: r.attendee_email,
          attendeePhone: r.attendee_phone,
          unitPrice: Number(r.unit_price),
          discountAmount: 0,
          finalAmount: Number(r.final_amount),
          paymentMethod: r.payment_method,
          paymentStatus: r.payment_status,
          qrCodeToken: r.qr_code_token,
          checkedIn: Boolean(r.checked_in),
          checkedInAt: r.checked_in_at ? new Date(r.checked_in_at).toISOString() : undefined,
          createdAt: r.created_at ? new Date(r.created_at).toISOString() : new Date().toISOString()
        };

        if (existingIdx >= 0) {
          db.eventRegistrations[existingIdx] = mappedReg;
        } else {
          db.eventRegistrations.push(mappedReg);
        }
      }
    }

    console.log('[MySQL] Synchronization complete! All tables connected.');
  } catch (err: any) {
    console.error('[MySQL] Synchronization warning:', err.message);
  }
}

/**
 * Persists a new Member to MySQL asynchronously
 */
export async function persistMemberToMySQL(member: Member): Promise<void> {
  try {
    await execute(
      `INSERT INTO members (id, tenant_id, congregation_id, name, phone, email, membership_status, is_leader, notes)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE name = VALUES(name), phone = VALUES(phone), email = VALUES(email), membership_status = VALUES(membership_status)`,
      [
        member.id,
        member.tenantId,
        member.congregationId,
        member.name,
        member.phone || null,
        member.email || null,
        member.membershipStatus,
        member.isLeader ? 1 : 0,
        member.notes || null
      ]
    );
  } catch (err: any) {
    console.error('[MySQL] Error persisting member:', err.message);
  }
}

/**
 * Persists a new Visitor to MySQL asynchronously
 */
export async function persistVisitorToMySQL(visitor: Visitor): Promise<void> {
  try {
    await execute(
      `INSERT INTO visitors (id, tenant_id, congregation_id, name, phone, email, first_visit_date, funnel_stage, notes)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE funnel_stage = VALUES(funnel_stage), notes = VALUES(notes), converted_to_member_id = VALUES(converted_to_member_id)`,
      [
        visitor.id,
        visitor.tenantId,
        visitor.congregationId,
        visitor.name,
        visitor.phone,
        visitor.email || null,
        visitor.firstVisitDate || new Date().toISOString().split('T')[0],
        visitor.funnelStage,
        visitor.notes || null
      ]
    );
  } catch (err: any) {
    console.error('[MySQL] Error persisting visitor:', err.message);
  }
}

/**
 * Persists a Cell to MySQL asynchronously
 */
export async function persistCellToMySQL(cell: Cell): Promise<void> {
  try {
    await execute(
      `INSERT INTO cells (id, tenant_id, congregation_id, code, name, type, day_of_week, meeting_time, address, neighborhood, city, state, leader_id, opening_date, max_capacity, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE name = VALUES(name), status = VALUES(status), max_capacity = VALUES(max_capacity)`,
      [
        cell.id,
        cell.tenantId,
        cell.congregationId,
        cell.code,
        cell.name,
        cell.type,
        cell.dayOfWeek,
        cell.meetingTime,
        cell.address,
        cell.neighborhood,
        cell.city || 'São Paulo',
        cell.state || 'SP',
        cell.leaderId,
        cell.openingDate || new Date().toISOString().split('T')[0],
        cell.maxCapacity || 15,
        cell.status
      ]
    );
  } catch (err: any) {
    console.error('[MySQL] Error persisting cell:', err.message);
  }
}

/**
 * Persists an Event Registration to MySQL asynchronously
 */
export async function persistRegistrationToMySQL(reg: EventRegistration): Promise<void> {
  try {
    await execute(
      `INSERT INTO event_registrations
       (id, tenant_id, event_id, lot_id, code, attendee_name, attendee_email, attendee_phone, unit_price, final_amount, payment_method, payment_status, qr_code_token, checked_in)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE payment_status = VALUES(payment_status), checked_in = VALUES(checked_in)`,
      [
        reg.id,
        reg.tenantId,
        reg.eventId,
        reg.lotId,
        reg.code,
        reg.attendeeName,
        reg.attendeeEmail,
        reg.attendeePhone,
        reg.unitPrice,
        reg.finalAmount,
        reg.paymentMethod,
        reg.paymentStatus,
        reg.qrCodeToken,
        reg.checkedIn ? 1 : 0
      ]
    );
  } catch (err: any) {
    console.error('[MySQL] Error persisting registration:', err.message);
  }
}

/**
 * Persists a financial transaction to MySQL asynchronously
 */
export async function persistTransactionToMySQL(tx: FinancialTransaction): Promise<void> {
  try {
    await execute(
      `INSERT INTO financial_transactions
       (id, tenant_id, congregation_id, account_id, category_id, type, nature, description, amount, net_amount, due_date, competence_date, status, created_by_user_id)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        tx.id,
        tx.tenantId,
        tx.congregationId,
        tx.accountId,
        tx.categoryId,
        tx.type,
        tx.nature,
        tx.description,
        tx.amount,
        tx.netAmount,
        tx.dueDate,
        tx.competenceDate,
        tx.status,
        'usr_pastor_ricardo'
      ]
    );
  } catch (err: any) {
    console.error('[MySQL] Error persisting transaction:', err.message);
  }
}

/**
 * Persists an audit log to MySQL asynchronously
 */
export async function persistAuditLogToMySQL(log: AuditLog): Promise<void> {
  try {
    await execute(
      `INSERT INTO audit_logs (id, tenant_id, user_id, user_name, action, entity_type, entity_id, details)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        log.id,
        log.tenantId,
        log.userId || null,
        log.userName || null,
        log.action,
        log.entityType,
        log.entityId || null,
        log.details ? JSON.stringify(log.details) : null
      ]
    );
  } catch (err: any) {
    console.error('[MySQL] Error persisting audit log:', err.message);
  }
}
