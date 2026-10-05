import { v4 as uuidv4 } from 'uuid';
import bcrypt from 'bcryptjs';

// Global memory tables
export const memoryDb = {
  users: [],
  vehicles: [],
  vehiclepasses: [],
  gates: [],
  gateofficers: [],
  scanlogs: [],
  auditlogs: [],
};

// Helper to generate 24-char hex IDs mimicking ObjectId
export const generateId = () => {
  const timestamp = Math.floor(new Date().getTime() / 1000).toString(16).padStart(8, '0');
  const randomHex = Array.from({ length: 16 }, () => Math.floor(Math.random() * 16).toString(16)).join('');
  return timestamp + randomHex;
};

// Mock Document wrapper
export class MemoryDoc {
  constructor(data, collectionName) {
    Object.assign(this, data);
    if (!this._id) {
      this._id = generateId();
    }
    if (!this.createdAt) this.createdAt = new Date();
    if (!this.updatedAt) this.updatedAt = new Date();
    this._collectionName = collectionName;
  }

  async save() {
    this.updatedAt = new Date();
    const table = memoryDb[this._collectionName];
    const idx = table.findIndex((d) => d._id.toString() === this._id.toString());
    const plain = this.toObject();
    if (idx >= 0) {
      table[idx] = plain;
    } else {
      table.push(plain);
    }
    return this;
  }

  toObject() {
    const obj = {};
    for (const key of Object.keys(this)) {
      if (key !== '_collectionName' && typeof this[key] !== 'function') {
        obj[key] = this[key];
      }
    }
    return JSON.parse(JSON.stringify(obj));
  }

  async comparePassword(candidatePassword) {
    if (!this.passwordHash) return false;
    return await bcrypt.compare(candidatePassword, this.passwordHash);
  }
}

// Query helper
export class MemoryQuery {
  constructor(collectionName, filter = {}, isSingle = false) {
    this.collectionName = collectionName;
    this.filter = filter;
    this.isSingle = isSingle;
    this._populateFields = [];
    this._selectFields = null;
    this._sortObj = null;
    this._skipNum = 0;
    this._limitNum = null;
  }

  populate(field, select) {
    this._populateFields.push({ field, select });
    return this;
  }

  select(fields) {
    this._selectFields = fields;
    return this;
  }

  sort(sortObj) {
    this._sortObj = sortObj;
    return this;
  }

  skip(n) {
    this._skipNum = Number(n) || 0;
    return this;
  }

  limit(n) {
    this._limitNum = Number(n);
    return this;
  }

  async exec() {
    let items = memoryDb[this.collectionName] || [];

    // Filter matching
    items = items.filter((item) => matchFilter(item, this.filter));

    // Sort
    if (this._sortObj) {
      const keys = Object.keys(this._sortObj);
      if (keys.length > 0) {
        const key = keys[0];
        const dir = this._sortObj[key]; // 1 for asc, -1 for desc
        items.sort((a, b) => {
          const valA = a[key] instanceof Date ? a[key].getTime() : a[key];
          const valB = b[key] instanceof Date ? b[key].getTime() : b[key];
          if (valA < valB) return dir === 1 ? -1 : 1;
          if (valA > valB) return dir === 1 ? 1 : -1;
          return 0;
        });
      }
    }

    // Skip & Limit
    if (this._skipNum > 0) {
      items = items.slice(this._skipNum);
    }
    if (this._limitNum !== null && this._limitNum > 0) {
      items = items.slice(0, this._limitNum);
    }

    // Single doc handling
    if (this.isSingle) {
      const singleItem = items[0] || null;
      if (!singleItem) return null;
      const doc = new MemoryDoc(singleItem, this.collectionName);
      for (const { field, select } of this._populateFields) {
        await populateDocField(doc, field, select);
      }
      if (this._selectFields && typeof this._selectFields === 'string' && this._selectFields.startsWith('-')) {
        const excludeField = this._selectFields.substring(1);
        delete doc[excludeField];
      }
      return doc;
    }

    // Instantiate docs
    let docs = items.map((item) => new MemoryDoc(item, this.collectionName));

    // Populate
    for (const { field, select } of this._populateFields) {
      for (const doc of docs) {
        await populateDocField(doc, field, select);
      }
    }

    // Select stripping
    if (this._selectFields && typeof this._selectFields === 'string') {
      if (this._selectFields.startsWith('-')) {
        const excludeField = this._selectFields.substring(1);
        for (const doc of docs) {
          delete doc[excludeField];
        }
      }
    }

    return docs;
  }

  // Thenable for await
  then(resolve, reject) {
    return this.exec().then(resolve, reject);
  }
}

// Populate single doc field
const populateDocField = async (doc, fieldPath, select) => {
  const targetId = doc[fieldPath];
  if (!targetId) return;

  const idStr = targetId._id ? targetId._id.toString() : targetId.toString();

  let targetCollection = '';
  if (fieldPath === 'ownerId' || fieldPath === 'userId' || fieldPath === 'officerId' || fieldPath === 'approvedBy') {
    targetCollection = 'users';
  } else if (fieldPath === 'vehicleId') {
    targetCollection = 'vehicles';
  } else if (fieldPath === 'passId') {
    targetCollection = 'vehiclepasses';
  } else if (fieldPath === 'gateId' || fieldPath === 'assignedGateId') {
    targetCollection = 'gates';
  }

  if (targetCollection) {
    const raw = (memoryDb[targetCollection] || []).find((d) => d._id.toString() === idStr);
    if (raw) {
      const populatedDoc = new MemoryDoc(raw, targetCollection);
      if (select && typeof select === 'string') {
        const selectKeys = select.split(' ').filter(Boolean);
        const filteredObj = { _id: populatedDoc._id };
        selectKeys.forEach((k) => {
          filteredObj[k] = populatedDoc[k];
        });
        doc[fieldPath] = filteredObj;
      } else {
        doc[fieldPath] = populatedDoc;
      }
    }
  }
};

// Filter matcher
const matchFilter = (item, filter) => {
  if (!filter || Object.keys(filter).length === 0) return true;

  for (const [key, val] of Object.entries(filter)) {
    if (key === '$or' && Array.isArray(val)) {
      const orMatched = val.some((subFilter) => matchFilter(item, subFilter));
      if (!orMatched) return false;
      continue;
    }

    const itemVal = item[key];

    if (val && typeof val === 'object' && !(val instanceof RegExp) && !(val instanceof Date)) {
      if (val.$in && Array.isArray(val.$in)) {
        const match = val.$in.some((inVal) => {
          const targetStr = inVal?._id ? inVal._id.toString() : inVal?.toString();
          const curStr = itemVal?._id ? itemVal._id.toString() : itemVal?.toString();
          return curStr === targetStr;
        });
        if (!match) return false;
        continue;
      }
      if (val.$gte !== undefined) {
        const gteVal = new Date(val.$gte).getTime();
        const curVal = new Date(itemVal).getTime();
        if (curVal < gteVal) return false;
      }
      if (val.$lte !== undefined) {
        const lteVal = new Date(val.$lte).getTime();
        const curVal = new Date(itemVal).getTime();
        if (curVal > lteVal) return false;
      }
      if (val.$ne !== undefined) {
        if (itemVal === val.$ne) return false;
      }
      if (val.$eq !== undefined) {
        if (itemVal !== val.$eq) return false;
      }
      continue;
    }

    if (val instanceof RegExp) {
      if (!val.test(String(itemVal || ''))) return false;
      continue;
    }

    // Direct value comparison
    const curValStr = itemVal?._id ? itemVal._id.toString() : itemVal?.toString();
    const expectedValStr = val?._id ? val._id.toString() : val?.toString();

    if (curValStr !== expectedValStr) {
      return false;
    }
  }
  return true;
};

// Create a collection model interface
export const createMemoryModel = (collectionName) => {
  return {
    async create(data) {
      if (Array.isArray(data)) {
        return Promise.all(data.map((d) => this.create(d)));
      }
      const doc = new MemoryDoc(data, collectionName);
      memoryDb[collectionName].push(doc.toObject());
      return doc;
    },

    find(filter = {}) {
      return new MemoryQuery(collectionName, filter, false);
    },

    findOne(filter = {}) {
      return new MemoryQuery(collectionName, filter, true);
    },

    findById(id) {
      if (!id) return new MemoryQuery(collectionName, { _id: '__none__' }, true);
      const idStr = id._id ? id._id.toString() : id.toString();
      return new MemoryQuery(collectionName, { _id: idStr }, true);
    },

    async countDocuments(filter = {}) {
      const items = memoryDb[collectionName] || [];
      return items.filter((item) => matchFilter(item, filter)).length;
    },

    async updateMany(filter, update) {
      const items = memoryDb[collectionName] || [];
      let updatedCount = 0;
      for (const item of items) {
        if (matchFilter(item, filter)) {
          if (update.$set) {
            Object.assign(item, update.$set);
          } else {
            Object.assign(item, update);
          }
          item.updatedAt = new Date();
          updatedCount++;
        }
      }
      return { modifiedCount: updatedCount };
    },

    async deleteMany(filter = {}) {
      if (Object.keys(filter).length === 0) {
        memoryDb[collectionName] = [];
        return { deletedCount: 0 };
      }
      const before = memoryDb[collectionName].length;
      memoryDb[collectionName] = memoryDb[collectionName].filter((item) => !matchFilter(item, filter));
      return { deletedCount: before - memoryDb[collectionName].length };
    },

    async aggregate(pipeline) {
      let data = memoryDb[collectionName] || [];
      for (const stage of pipeline) {
        if (stage.$group) {
          const groupKey = stage.$group._id;
          const groups = new Map();
          for (const doc of data) {
            let keyVal = null;
            if (typeof groupKey === 'string' && groupKey.startsWith('$')) {
              keyVal = doc[groupKey.substring(1)];
            }
            const gKey = keyVal?._id ? keyVal._id.toString() : String(keyVal || '');
            if (!groups.has(gKey)) {
              groups.set(gKey, { _id: keyVal, docs: [] });
            }
            groups.get(gKey).docs.push(doc);
          }

          const results = [];
          for (const [k, grp] of groups.entries()) {
            const row = { _id: grp._id };
            for (const [field, acc] of Object.entries(stage.$group)) {
              if (field === '_id') continue;
              if (acc.$sum !== undefined) {
                if (acc.$sum === 1) {
                  row[field] = grp.docs.length;
                } else if (acc.$sum.$cond) {
                  const cond = acc.$sum.$cond[0];
                  const fieldName = cond.$eq[0].substring(1);
                  const expected = cond.$eq[1];
                  row[field] = grp.docs.filter((d) => d[fieldName] === expected).length;
                }
              }
            }
            results.push(row);
          }
          data = results;
        } else if (stage.$lookup) {
          const { from, localField, foreignField, as } = stage.$lookup;
          const targetTable = memoryDb[from] || [];
          for (const doc of data) {
            const localVal = doc[localField]?._id ? doc[localField]._id.toString() : doc[localField]?.toString();
            doc[as] = targetTable.filter((t) => t[foreignField]?.toString() === localVal);
          }
        } else if (stage.$unwind) {
          const path = stage.$unwind.path || stage.$unwind;
          const fieldName = path.startsWith('$') ? path.substring(1) : path;
          const unwound = [];
          for (const doc of data) {
            const arr = doc[fieldName];
            if (Array.isArray(arr) && arr.length > 0) {
              for (const item of arr) {
                const clone = { ...doc, [fieldName]: item };
                unwound.push(clone);
              }
            } else if (stage.$unwind.preserveNullAndEmptyArrays) {
              unwound.push({ ...doc, [fieldName]: null });
            }
          }
          data = unwound;
        } else if (stage.$project) {
          data = data.map((doc) => {
            const res = {};
            for (const [pKey, pVal] of Object.entries(stage.$project)) {
              if (pVal === 1) {
                res[pKey] = doc[pKey];
              } else if (typeof pVal === 'string' && pVal.startsWith('$')) {
                res[pKey] = doc[pVal.substring(1)];
              } else if (pVal && pVal.$ifNull) {
                const sourceField = pVal.$ifNull[0].substring(1);
                const parts = sourceField.split('.');
                let val = doc;
                for (const part of parts) {
                  val = val ? val[part] : undefined;
                }
                res[pKey] = val !== undefined && val !== null ? val : pVal.$ifNull[1];
              }
            }
            return res;
          });
        }
      }
      return data;
    },
  };
};
