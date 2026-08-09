/**
 * Таблица заказов. Это рабочий список Ксении: кто оплатил, с каким email
 * и телефоном, кого звать в закрытый чат.
 *
 * node:sqlite из стандартной библиотеки — ноль новых зависимостей. Модуль
 * помечен экспериментальным и при старте печатает ExperimentalWarning;
 * API DatabaseSync стабилен с Node 22.5, проект и так требует >= 22.15.
 *
 * Строка появляется при создании заказа и обновляется при каждом опросе
 * статуса. Единственный источник правды об оплате — всё равно шлюз
 * (getOrderStatusExtended.do), здесь лежит последнее известное значение.
 *
 * Только для сервера: node:sqlite в браузере не существует.
 */

import { DatabaseSync } from 'node:sqlite';
import { mkdirSync } from 'node:fs';
import path from 'node:path';
import type { OrderStatus } from './gateway.ts';

export type OrderRow = {
    orderId: string;
    orderNumber: string;
    productId: string;
    amountKopecks: number;
    name: string;
    email: string;
    phone: string | null;
    /** ISO. */
    createdAt: string;
    lastStatus: number | null;
    lastCheckedAt: string | null;
};

/**
 * Файл базы обязан пережить деплой. При выкладке через git pull это выходит
 * само; при выкладке в новую директорию базу нужно перенести руками — вместе
 * с соседними `-wal` и `-shm`, если они не пустые.
 *
 * Расширение .sqlite3 вместо .db: по нему просмотрщики базы (DB Browser,
 * TablePlus, расширения редакторов) опознают формат без ручной настройки.
 */
function databaseFile(): string {
    return process.env.ORDERS_DB ?? path.join(process.cwd(), 'data', 'orders.sqlite3');
}

let db: DatabaseSync | null = null;

function connection(): DatabaseSync {
    if (db) return db;

    const file = databaseFile();
    mkdirSync(path.dirname(file), { recursive: true });

    db = new DatabaseSync(file);
    // WAL: чтение статуса не блокируется записью нового заказа.
    db.exec('PRAGMA journal_mode = WAL');
    db.exec(`
        CREATE TABLE IF NOT EXISTS orders (
            orderId       TEXT PRIMARY KEY,
            orderNumber   TEXT NOT NULL,
            productId     TEXT NOT NULL,
            amountKopecks INTEGER NOT NULL,
            name          TEXT NOT NULL,
            email         TEXT NOT NULL,
            phone         TEXT,
            createdAt     TEXT NOT NULL,
            lastStatus    INTEGER,
            lastCheckedAt TEXT
        )
    `);

    return db;
}

export type NewOrder = Omit<OrderRow, 'createdAt' | 'lastStatus' | 'lastCheckedAt'>;

export function saveOrder(order: NewOrder): void {
    connection()
        .prepare(
            `INSERT INTO orders
                (orderId, orderNumber, productId, amountKopecks, name, email, phone, createdAt)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
        )
        .run(
            order.orderId,
            order.orderNumber,
            order.productId,
            order.amountKopecks,
            order.name,
            order.email,
            order.phone,
            new Date().toISOString()
        );
}

export function updateStatus(orderId: string, status: OrderStatus): void {
    connection()
        .prepare('UPDATE orders SET lastStatus = ?, lastCheckedAt = ? WHERE orderId = ?')
        .run(status, new Date().toISOString(), orderId);
}

export function listOrders(limit = 100): OrderRow[] {
    return connection()
        .prepare('SELECT * FROM orders ORDER BY createdAt DESC LIMIT ?')
        .all(limit) as unknown as OrderRow[];
}
