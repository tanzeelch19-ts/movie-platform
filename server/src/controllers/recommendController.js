import { getRecommendations } from '../services/recommend.js'

export const recommendations = async (req, res) => {
  const results = await getRecommendations(req.user.id)
  res.json({ results })
}