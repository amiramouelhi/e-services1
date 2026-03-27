function errorHandler(err, req, res, next) {
  // Always log the real error in the terminal only
  console.error('=== ERROR ===', err)

  // Prisma known errors — show friendly messages
  if (err.code === 'P2002') {
    return res.status(409).json({ error: 'Cet enregistrement existe déjà' })
  }
  if (err.code === 'P2025') {
    return res.status(404).json({ error: 'Enregistrement non trouvé' })
  }
  if (err.code === 'P2003') {
    return res.status(409).json({ error: 'Impossible de supprimer — des données liées existent' })
  }
  if (err.code === 'P2014') {
    return res.status(409).json({ error: 'Relation invalide entre les données' })
  }

  // Never expose real error message to user
  res.status(500).json({ error: 'Une erreur est survenue. Veuillez réessayer.' })
}

module.exports = { errorHandler }