export const healthCheck = (req, res) => {
  res.json({ status: 'ok', storage: 'json-file (data/db.json)' })
}