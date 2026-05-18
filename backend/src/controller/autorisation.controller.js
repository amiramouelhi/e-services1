const prisma = require('../config/prisma')
const fs = require('fs')
const path = require('path')
const { generateCalculDA } = require('../utils/calculDA')

// GET ALL ORGANISATEURS
exports.getAllOrganisateurs = async (req, res) => {
  try {
    const organisateurs = await prisma.organisateur.findMany({
      orderBy: { nom: 'asc' }
    })
    res.json(organisateurs)
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Une erreur est survenue. Veuillez réessayer.' })
  }
}

// CREATE ORGANISATEUR
exports.createOrganisateur = async (req, res) => {
  try {
    const { nom, mf, rne, adresse, telephone, fax, email, nomResponsable } = req.body
    if (!nom?.trim()) return res.status(400).json({ error: 'Nom est obligatoire' })

    const organisateur = await prisma.organisateur.create({
      data: {
        nom: nom.trim(),
        mf: mf?.trim() || null,
        rne: rne?.trim() || null,
        adresse: adresse?.trim() || null,
        telephone: telephone?.trim() || null,
        fax: fax?.trim() || null,
        email: email?.trim() || null,
        nomResponsable: nomResponsable?.trim() || null,
      }
    })
    res.status(201).json(organisateur)
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Une erreur est survenue. Veuillez réessayer.' })
  }
}

// CREATE AUTORISATION SPECTACLE
exports.createAutorisationSpectacle = async (req, res) => {
  try {
    const {
      numeroAutorisation,
      dateDemande,
      isOrganisateur,
      organisateurId,
      sfat,
      hasArtistesEtrangers,
      dateCommission,
      nombreSpectacles,
      spectacles 
    } = req.body

    
    const findFile = (fieldname) =>
      (req.files || []).find(f => f.fieldname === fieldname)

    const pvCommission = findFile('pvCommission')?.filename || null

    const autorisation = await prisma.$transaction(async (tx) => {

      // 1. Create autorisation
      const newAutorisation = await tx.autorisationSpectacle.create({
        data: {
          numeroAutorisation:   numeroAutorisation?.trim() || null,
          dateDemande:          dateDemande ? new Date(dateDemande) : null,
          isOrganisateur:       isOrganisateur === 'true' || isOrganisateur === true,
          sfat:                 sfat?.trim() || null,
          hasArtistesEtrangers: hasArtistesEtrangers === 'true' || hasArtistesEtrangers === true,
          dateCommission:       dateCommission ? new Date(dateCommission) : null,
          pvCommission,
          nombreSpectacles:     parseInt(nombreSpectacles) || 1,
          organisateurId:       organisateurId ? parseInt(organisateurId) : null,
        }
      })

      // 2. Create spectacles
      const spectaclesData = JSON.parse(spectacles || '[]')

      for (let i = 0; i < spectaclesData.length; i++) {
        const sp = spectaclesData[i]

        const newSpectacle = await tx.spectacle.create({
          data: {
            categorieSpectacle: sp.categorieSpectacle || null,
            titreSpectacle:     sp.titreSpectacle || null,
            espaceSpectacle:    sp.espaceSpectacle || null,
            dateSpectacle:    new Date(sp.dateSpectacle),
            horaireSpectacle: sp.horaireSpectacle || null,
            lieuSpectacle:    sp.lieuSpectacle?.trim(),
            typeSpectacle:    sp.typeSpectacle,
            budget:           sp.budget ? parseFloat(sp.budget) : null,
            natureManif:      sp.natureManif || null,
            hasEtrangers:     sp.hasEtrangers || false,
            autorisationId:   newAutorisation.id
          }
        })

        // 3. Create artistes for each spectacle
        for (let j = 0; j < (sp.artistes || []).length; j++) {
          const art = sp.artistes[j]

          // Get identity file
          const identiteKey = `spectacle_${i}_artiste_${j}_identite`
          const identite = findFile(identiteKey)?.filename || null

          const newArtiste = await tx.artiste.create({
            data: {
              nom:         art.nom?.trim(),
              nationalite: art.nationalite,
              pays:        art.pays || null,
              identite,
              spectacleId: newSpectacle.id
            }
          })

          // 4. Create depenses for each artiste
          for (const dep of (art.depenses || [])) {
            const depenseKey = `spectacle_${i}_artiste_${j}_depense_${dep.type}`
            const fichier = findFile(depenseKey)?.filename || null

            await tx.depense.create({
              data: {
                type:      dep.type,
                montant:   parseFloat(dep.montant) || 0,
                fichier,
                artisteId: newArtiste.id
              }
            })
          }
        }
      }

      return await tx.autorisationSpectacle.findUnique({
        where: { id: newAutorisation.id },
        include: {
          organisateur: true,
          spectacles: {
            include: {
              artistes: {
                include: { depenses: true }
              }
            }
          }
        }
      })
    })

    // Fire-and-forget: generate the calcul DA PDF so it's ready when the user lands on facture page
    generateCalculDA(autorisation.id).catch((e) =>
      console.error('generateCalculDA failed for autorisation', autorisation.id, e)
    )

    res.status(201).json(autorisation)
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Une erreur est survenue. Veuillez réessayer.' })
  }
}

// GET /autorisations/spectacles/:id/calcul-da — generate if missing, stream PDF
exports.getCalculDAPdf = async (req, res) => {
  try {
    const id = parseInt(req.params.id)
    if (isNaN(id)) return res.status(400).json({ error: 'ID invalide' })

    const existing = await prisma.autorisationSpectacle.findUnique({ where: { id }, select: { id: true } })
    if (!existing) return res.status(404).json({ error: 'Autorisation non trouvée' })

    const pdfPath = path.join(__dirname, '..', '..', 'uploads', 'calcul', `calcul_DA_${id}.pdf`)
    await generateCalculDA(id)
    if (!fs.existsSync(pdfPath)) {
      return res.status(500).json({ error: 'Échec de la génération du PDF' })
    }

    res.setHeader('Content-Type', 'application/pdf')
    res.setHeader('Content-Disposition', `inline; filename="calcul_DA_${id}.pdf"`)
    fs.createReadStream(pdfPath).pipe(res)
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Une erreur est survenue lors de la génération du PDF.' })
  }
}

// GET ALL AUTORISATIONS
exports.getAllAutorisations = async (req, res) => {
  try {
    const autorisations = await prisma.autorisationSpectacle.findMany({
      orderBy: { dateCreation: 'desc' },
      include: {
        organisateur: true,
        spectacles: {
          include: {
            artistes: {
              include: { depenses: true }
            }
          }
        }
      }
    })
    res.json(autorisations)
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Une erreur est survenue. Veuillez réessayer.' })
  }
}

// GET AUTORISATION BY ID
exports.getAutorisationById = async (req, res) => {
  try {
    const id = parseInt(req.params.id)
    if (isNaN(id)) return res.status(400).json({ error: 'ID invalide' })

    const autorisation = await prisma.autorisationSpectacle.findUnique({
      where: { id },
      include: {
        organisateur: true,
        spectacles: {
          include: {
            artistes: {
              include: { depenses: true }
            }
          }
        }
      }
    })

    if (!autorisation) return res.status(404).json({ error: 'Autorisation non trouvée' })
    res.json(autorisation)
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Une erreur est survenue. Veuillez réessayer.' })
  }
}

exports.payerAutorisation = async (req, res) => {
  try {
    const id = parseInt(req.params.id)
    if (isNaN(id)) return res.status(400).json({ error: 'ID invalide' })

    const fichierFacture = (req.files || []).find(f => f.fieldname === 'fichierFacture')?.filename || null
    if (!fichierFacture) {
      return res.status(400).json({ error: 'Le fichier facture est obligatoire' })
    }

    const { numeroFacture } = req.body

    const autorisation = await prisma.autorisationSpectacle.update({
      where: { id },
      data: {
        fichierFacture,
        numeroFacture: numeroFacture?.trim() || null,
        paiementProofUrl: fichierFacture,
        paiementRecuAt: new Date(),
        statut: 'PAIEMENT_RECU'
      }
    })

    res.json({ message: 'Paiement enregistré avec succès', autorisation })
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Une erreur est survenue. Veuillez réessayer.' })
  }
}

// BULK CREATE ORGANISATEURS
exports.bulkCreateOrganisateurs = async (req, res) => {
  try {
    const { organisateurs } = req.body
    if (!organisateurs?.length) {
      return res.status(400).json({ error: 'Aucun organisateur fourni' })
    }

    const created = await prisma.organisateur.createMany({
      data: organisateurs.map(o => ({
        nom:       o.nom?.trim(),
        mf:        o.mf?.trim()        || null,
        adresse:   o.adresse?.trim()   || null,
        telephone: o.telephone?.trim() || null,
      })),
      skipDuplicates: true
    })

    res.json({ message: `${created.count} organisateurs importés avec succès`, count: created.count })
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Une erreur est survenue. Veuillez réessayer.' })
  }
}
