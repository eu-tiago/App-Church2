import mysql from 'mysql2/promise';

export const mysqlConfig = {
  host: process.env.MYSQL_HOST || 'srv1940.hstgr.io',
  port: Number(process.env.MYSQL_PORT) || 3306,
  user: process.env.MYSQL_USER || 'u664081426_church',
  password: process.env.MYSQL_PASSWORD || '1qaz#2wsX',
  database: process.env.MYSQL_DATABASE || 'u664081426_church',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  connectTimeout: 8000
};

export const pool = mysql.createPool(mysqlConfig);

export interface MySQLHealthStatus {
  connected: boolean;
  host: string;
  database: string;
  tablesCount: number;
  latencyMs: number;
  tables: string[];
  error?: string;
}

export async function checkMySQLHealth(): Promise<MySQLHealthStatus> {
  const start = Date.now();
  try {
    const [rows] = await pool.query('SHOW TABLES');
    const latencyMs = Date.now() - start;
    const tables = (rows as any[]).map(r => Object.values(r)[0] as string);

    return {
      connected: true,
      host: mysqlConfig.host,
      database: mysqlConfig.database,
      tablesCount: tables.length,
      latencyMs,
      tables
    };
  } catch (err: any) {
    return {
      connected: false,
      host: mysqlConfig.host,
      database: mysqlConfig.database,
      tablesCount: 0,
      latencyMs: Date.now() - start,
      tables: [],
      error: err.message
    };
  }
}

/**
 * Execute a query with error handling
 */
export async function query<T = any>(sql: string, params: any[] = []): Promise<T[]> {
  const [rows] = await pool.query(sql, params);
  return rows as T[];
}

/**
 * Execute an insert/update/delete statement with error handling
 */
export async function execute(sql: string, params: any[] = []): Promise<any> {
  const [result] = await pool.execute(sql, params);
  return result;
}
