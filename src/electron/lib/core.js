class CoreLib {
  static paginateQuery(qry = {}, filter = {}, opt = {}) {
    if (opt.paginate === false) {
      delete filter.limit;
      delete filter.page;
    }
    if (filter.limit === 'off' || filter.limit === false) return qry;
    if (filter.limit && filter.page) {
      qry.offset = (filter.page - 1) * filter.limit;
      qry.limit = filter.limit + 1;
    }
    return qry;
  }

  static paginateResult(result = [], data = {}) {
    if (result.length > 0) {
      result = result.map(r => r?.toJSON());
    }
    if (data.limit === 'off' || data.limit === false) {
      return {
        result
      };
    }
    if (typeof data.limit === 'undefined' && typeof data.page === 'undefined') return result;
    const res = {
      result,
      meta: {}
    };
    if (data.limit && data.page) {
      res.meta.current_page = data.page;
      if (res.result.length > data.limit) {
        res.result.pop();
        res.meta.next_page = data.page + 1;
      }
    }
    if (data.page > 1) res.meta.prev_page = data.page - 1;
    if (result) {
      return res;
    }
  }
}

export default CoreLib;
