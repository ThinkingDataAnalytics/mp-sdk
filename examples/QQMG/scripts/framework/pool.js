/**
 * 对象池
 */
const POOL_INSTANCE = Symbol('POOL');

export default class Pool {
    constructor() {
        this[POOL_INSTANCE] = {};
    }

    getPoolByName(poolName) {
        if (!this[POOL_INSTANCE][poolName]) {
            this[POOL_INSTANCE][poolName] = [];
        }

        return this[POOL_INSTANCE][poolName];
    }

    getObjectsByClassName(poolName, className) {
        const pool = this.getPoolByName(poolName);

        if (pool.length > 0) {
            return pool.shift();
        }

        let ClassName = className;
        return new ClassName();
    }

    recycle(poolName, recycledObject) {
        this.getPoolByName(poolName).push(recycledObject);
    }
}