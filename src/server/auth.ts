import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { db } from './db';
import { User, UserRole } from './types';

const JWT_SECRET = process.env.JWT_SECRET || 'churchflow-super-secret-jwt-key-2026';

export interface AuthenticatedRequest extends Request {
  user?: User;
  tenantId?: string;
  congregationId?: string;
}

export function generateToken(user: User): string {
  return jwt.sign(
    {
      userId: user.id,
      tenantId: user.tenantId,
      roleCode: user.roleCode,
      congregationId: user.congregationId
    },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
}

export function authMiddleware(req: AuthenticatedRequest, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Não autenticado. Token JWT ausente.' });
    return;
  }

  const token = authHeader.split(' ')[1];
  try {
    const payload = jwt.verify(token, JWT_SECRET) as {
      userId: string;
      tenantId?: string;
      roleCode: UserRole;
      congregationId?: string;
    };

    const user = db.users.find(u => u.id === payload.userId && u.isActive);
    if (!user) {
      res.status(401).json({ error: 'Usuário inativo ou inexistente.' });
      return;
    }

    req.user = user;
    req.tenantId = user.tenantId;
    req.congregationId = user.congregationId;
    next();
  } catch {
    res.status(401).json({ error: 'Token expirado ou inválido.' });
  }
}

export function requireRole(allowedRoles: UserRole[]) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ error: 'Não autenticado.' });
      return;
    }

    // SuperAdmin SaaS always has access
    if (req.user.roleCode === 'superadmin_saas') {
      next();
      return;
    }

    if (!allowedRoles.includes(req.user.roleCode)) {
      res.status(403).json({
        error: `Acesso negado. Ação restrita a perfis: ${allowedRoles.join(', ')}`
      });
      return;
    }

    next();
  };
}

export function requireTenant(req: AuthenticatedRequest, res: Response, next: NextFunction): void {
  if (!req.user) {
    res.status(401).json({ error: 'Não autenticado.' });
    return;
  }

  if (req.user.roleCode !== 'superadmin_saas' && !req.tenantId) {
    res.status(400).json({ error: 'Contexto de igreja (Tenant) não configurado.' });
    return;
  }

  next();
}
