function errorHandler(err, req, res, next) {
  console.error(err) // log the real error in terminal only

  // Prisma unique constraint
  if (err.code === 'P2002') {
    return res.status(409).json({ error: 'Cet enregistrement existe déjà' })
  }

  // Prisma record not found
  if (err.code === 'P2025') {
    return res.status(404).json({ error: 'Enregistrement non trouvé' })
  }

  // Prisma foreign key constraint — can't delete because record is used elsewhere
  if (err.code === 'P2003') {
    return res.status(409).json({ error: 'Impossible de supprimer cet enregistrement car il est lié à d\'autres données' })
  }

  // Generic error — never show real message in production
  res.status(500).json({ error: 'Une erreur est survenue. Veuillez réessayer.' })
}

module.exports = { errorHandler }