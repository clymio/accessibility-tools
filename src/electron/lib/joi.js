import Joi from 'joi';
import systemData from '../db/systemData.json';

const countryData = systemData.countries;

const COUNTRIES_CODES = countryData.map(c => c.id);
const STATE_CODES = countryData
  .map((c) => {
    if (c.states) {
      return c.states.map(s => s.id);
    }
    return [];
  })
  .flat();

(() => {
  Joi.url = (opt = {}) => {
    return Joi.string()
      .uri({
        scheme: ['http', 'https'],
        domain: {
          minDomainSegments: 2,
          maxDomainSegments: 10
        },
        ...opt
      })
      .messages({
        any: 'Please provide a valid URL'
      });
  };
  Joi.enum = (values = []) => {
    let arr = [];
    if (values instanceof Array) {
      arr = values;
    } else if (typeof values === 'object' && values) {
      arr = Object.keys(values);
    }
    const plainValues = arr;
    arr = new Set(arr);
    let s = Joi.string();
    return s.custom((value, helper) => {
      if (arr.has(value)) return value;
      if (arr.has(value.toUpperCase())) return value.toUpperCase();
      if (arr.has(value.toLowerCase())) return value.toLowerCase();
      return helper.message({
        custom: `Available values are: ${plainValues.join(',')}`
      });
    });
  };
  Joi.id = () => {
    return Joi.alternatives().try(Joi.string().min(30).max(36), Joi.number().min(0));
  };
  Joi.metaLimit = (allowAll = false, opt = {}) => {
    const max = opt.max || 100;
    if (allowAll) return Joi.alternatives().try(Joi.number().min(1).max(max), Joi.string().equal('off'), Joi.boolean().equal(false)).optional().default(10);
    return Joi.number().min(1).max(max).optional().default(10);
  };
  Joi.metaPage = (opt = {}) => {
    return Joi.number().min(1).optional().default(1);
  };
  Joi.metaSearch = (opt = {}) => {
    return Joi.string().min(1).max(50).optional();
  };
  Joi.country = (opt = {}) => {
    return Joi.enum(COUNTRIES_CODES);
  };
  Joi.state = (opt = {}) => {
    return Joi.enum(STATE_CODES);
  };
})();

class JoiLib {
  #schemas = {};
  schema(defFn, id) {
    if (!id) {
      let st = new Error().stack.split('\n');
      if (st[0] === 'Error') st.splice(0, 1);
      if (st[0].indexOf('JoiLib') !== -1) st.splice(0, 1);
      let line = st[0].split('(')[1] || '';
      line = line.split(')')[0] || '';
      if (!line) line = st[0];
      id = line;
    }
    if (this.#schemas[id]) return this.#schemas[id];
    let r = typeof defFn === 'function' ? defFn() : defFn;
    if (!r) return false;
    const arrayDefs = getSchemaArrays(r);
    if (arrayDefs.length > 0) r.__arrayDefs = arrayDefs;
    this.#schemas[id] = r;
    return r;
  }

  async validate(schema, input = {}, opt = {}) {
    if (typeof schema === 'string') schema = this.#schemas[schema];
    if (typeof schema !== 'object' || !schema) throw new Error('Invalid or missing schema definition');
    let isClean = opt.clean !== false;
    delete opt.clean;
    try {
      let vopt = { ...opt };
      if (schema.__arrayDefs) {
        input = convertInputArrays(schema.__arrayDefs, input);
      }
      let res = await schema.validateAsync(input, vopt);
      const keys = Object.keys(res || {});
      if (isClean) {
        for (let i = 0, len = keys.length; i < len; i++) {
          if (typeof res[keys[i]] === 'undefined') delete res[keys[i]];
        }
        return res;
      }
      for (let i = 0, len = keys.length; i < len; i++) {
        const val = res[keys[i]];
        if (typeof val !== 'undefined') {
          input[keys[i]] = val;
        }
      }
      return input;
    } catch (e) {
      handleJoiException(e, schema);
    }
  }
}

function handleJoiException(e, schema) {
  if (!e || !e.details || e.details.length === 0) {
    throw new Error('Please provide valid data');
  }
  let err = new Error('Request contains errors');
  err.data = {};
  err.data.fields = {};
  let fieldsWithAny = [];
  for (let i = 0, len = e.details.length; i < len; i++) {
    let d = e.details[i],
      fieldPath = d.path.join('.');
    if (!err.data.fields[fieldPath]) err.data.fields[fieldPath] = [];
    let msg = d.message,
      def = getSchemaField(schema, d.path);
    if (fieldsWithAny.indexOf(fieldPath) !== -1) continue;
    if (def) {
      let allMsg = def.schema?._preferences?.messages;
      if (allMsg) {
        if (allMsg[d.type]) {
          msg = allMsg[d.type].rendered;
        } else if (allMsg['any']) {
          msg = allMsg.any.rendered;
          fieldsWithAny.push(fieldPath);
        }
      }
    }
    if (msg.substr(0, fieldPath.length) === fieldPath) {
      msg = msg.substr(fieldPath.length + 1);
    }
    msg = msg.charAt(0).toUpperCase() + msg.substr(1);
    err.data.fields[fieldPath].push({
      code: d.type,
      message: msg
    });
  }
  throw err;
}

function getSchemaField(schema, path) {
  if (typeof path === 'string') path = [path];
  let r = [...path];
  let $p = schema;
  while (r.length > 0) {
    let f = r.pop();
    try {
      $p = $p._ids._byKey.get(f);
    } catch (e) {
      break;
    }
  }
  if ($p && $p.id === path[path.length - 1]) {
    return $p;
  }
  return null;
}

/**
 * Given a schema object, it will return an array of fields that are arrays.
 * */
function getSchemaArrays(schema, field = '', arrayFields = []) {
  if (schema.type === 'object') {
    const subs = schema._ids._byKey.values();
    for (const sc of subs) {
      getSchemaArrays(sc.schema, `${field === '' ? '' : `${field}.`}${sc.id || ''}`, arrayFields);
    }
  }
  if (schema.type === 'array') {
    arrayFields.push(field);
  }
  return arrayFields;
}

/**
 * Given an array of dotted fields that are defined as arrays, it will try to convert the input's field into arrays,
 * if they're not already arrays.
 * */
function convertInputArrays(fields, data) {
  for (let i = 0, len = fields.length; i < len; i++) {
    const f = fields[i];
    try {
      if (f === '') return data instanceof Array ? data : [data];
      if (typeof data !== 'object' || !data) return data;
      const subs = f.split('.');
      let fieldObj = data,
        isValid = true;
      for (let j = 0; j < subs.length - 1; j++) {
        const k = subs[j];
        if (typeof fieldObj[k] === 'object') {
          fieldObj = fieldObj[k];
        } else {
          isValid = false;
        }
      }
      if (!isValid) continue;
      const lastKey = subs.pop();
      if (typeof fieldObj[lastKey] === 'undefined' || fieldObj[lastKey] instanceof Array) continue;
      const currentValue = fieldObj[lastKey];
      if (typeof currentValue === 'string' && currentValue) {
        if (currentValue.indexOf(',') !== -1) {
          fieldObj[lastKey] = currentValue.split(',').map(v => v.trim());
        } else {
          fieldObj[lastKey] = [currentValue];
        }
      } else {
        fieldObj[lastKey] = [fieldObj[lastKey]];
      }
    } catch (e) {}
  }
  return data;
}

const joiLib = new JoiLib();
joiLib.Joi = Joi;

export default joiLib;
