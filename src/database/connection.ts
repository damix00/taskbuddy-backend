import { Pool, QueryResult } from 'pg';
import * as fs from 'fs';
import * as path from 'path';

const pool = new Pool({
    user: process.env.DB_USER || 'postgres',
    host: process.env.DB_HOST || 'localhost',
    database: 'swoop',
    password: process.env.DB_PASSWORD || 'root',
    port: parseInt(process.env.DB_PORT || '5432'), // typescript moment
});

/**
 * Connect to the database
 */
export function connect() {
    return new Promise(async (resolve, reject) => {
        await _connect();
        resolve(true);
    });
}

export function disconnect() {
    return pool.end();
}

/**
 * Attempt to connect to the database every second until successful
 */
function _connect() {
    return new Promise((resolve, reject) => {
        pool.connect((err: Error) => {
            if (err) {
                console.log(err);
                setTimeout(_connect, 1000);
            }
            resolve(true);
        });
    });
}

/**
 * Execute a query on the database
 * @param query - the query to execute
 * @param params - the parameters to pass to the query
 * @returns {Promise<T[]>} - the result of the query
 */
export function executeQuery<T>(query: string, params: any[] = []): Promise<T[]> {
    return new Promise((resolve, reject) => {
        pool.query(query, params, (err: Error, result: QueryResult) => {
            if (err) {
                reject(err);
            } else {
                resolve(result.rows);
            }
        });
    });
}

/**
 * Execute a query on the database from a file
 * @param filePath - the path to the file containing the query
 * @param params - the parameters to pass to the query
 * @returns {Promise<T[]>} - the result of the query
 */
export async function executeFile<T>(filePath: string, params: any[] = []): Promise<T[]> {
    const query = fs.readFileSync(path.resolve(__dirname, filePath), 'utf8');
    const result = await executeQuery<T>(query, params);
    return result;
}