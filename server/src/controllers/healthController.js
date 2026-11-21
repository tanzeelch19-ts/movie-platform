export const healthCheck = (req, res) => {
  res.json({ status: 'ok', storage: 'mongodb' })
}