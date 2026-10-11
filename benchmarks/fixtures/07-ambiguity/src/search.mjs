export const search = (records, query) =>
  records.filter(record => record.title.toLowerCase().includes(query.toLowerCase()));
