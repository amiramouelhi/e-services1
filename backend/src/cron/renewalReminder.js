const cron = require('node-cron')
const prisma = require('../config/prisma')
const transporter = require('../config/mailer')

// Runs every day at 8:00 AM
cron.schedule('0 8 * * *', async () => {
  console.log('🔔 Running renewal reminder check...')

  const today = new Date()

  const depots = await prisma.depot.findMany({
    where: {
      statut: { in: ['PAYE', 'CERTIFIE', 'EN_ATTENTE_RENOUVELLEMENT'] },
      dateExpiration: { not: null }
    },
    include: {
      deposant: true,
      oeuvre: { include: { categorie: true } },
      user: { select: { email: true } }
    }
  })

  for (const depot of depots) {
    const expiration = new Date(depot.dateExpiration)
    const diffMs = expiration - today
    const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24))

    const deposantEmail = depot.deposant?.email || depot.user?.email
    if (!deposantEmail) continue

    const nomDeposant = depot.deposant?.nomComplet_fr ||
                        depot.deposant?.nomComplet_ar ||
                        depot.deposant?.raisonSociale || 'Déposant'

    const titreOeuvre = depot.oeuvre?.titre_fr ||
                        depot.oeuvre?.titre_ar || 'Oeuvre'

    // 30 days before → change statut + send first email
    if (diffDays === 30) {
      await prisma.depot.update({
        where: { id: depot.id },
        data: { statut: 'EN_ATTENTE_RENOUVELLEMENT' }
      })
      await sendReminderEmail(transporter, deposantEmail, nomDeposant, titreOeuvre, diffDays, expiration)
      console.log(`📧 30-day reminder sent to ${deposantEmail}`)
    }

    // Every 7 days reminder (23, 16, 9 days before)
    else if (diffDays === 23 || diffDays === 16 || diffDays === 9) {
      await sendReminderEmail(transporter, deposantEmail, nomDeposant, titreOeuvre, diffDays, expiration)
      console.log(`📧 ${diffDays}-day reminder sent to ${deposantEmail}`)
    }

    // 1 day before → final warning
    else if (diffDays === 1) {
      await sendFinalWarningEmail(transporter, deposantEmail, nomDeposant, titreOeuvre, expiration)
      console.log(`📧 Final warning sent to ${deposantEmail}`)
    }

    // Expired → change statut
    else if (diffDays <= 0 && depot.statut !== 'RENOUVELE') {
      await prisma.depot.update({
        where: { id: depot.id },
        data: { statut: 'REJETE' }
      })
      console.log(`⚠️ Depot ${depot.id} expired`)
    }
  }
})

async function sendReminderEmail(transporter, to, nom, titre, days, expiration) {
  await transporter.sendMail({
    from: `"OTDAV" <${process.env.EMAIL_USER}>`,
    to,
    subject: `Rappel: Renouvellement de dépôt dans ${days} jours`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #1a3c6e; padding: 20px; text-align: center;">
          <h2 style="color: white; margin: 0;">OTDAV</h2>
          <p style="color: #ccc; margin: 5px 0;">Organisme Tunisien des Droits d'Auteur et des Droits Voisins</p>
        </div>
        <div style="padding: 30px; background: #f9f9f9;">
          <p>Madame/Monsieur <strong>${nom}</strong>,</p>
          <p>Nous vous informons que votre dépôt pour l'oeuvre <strong>"${titre}"</strong> expire dans <strong>${days} jours</strong>.</p>
          <p>Date d'expiration: <strong>${new Date(expiration).toLocaleDateString('fr-FR')}</strong></p>
          <p>Veuillez vous présenter à l'OTDAV pour renouveler votre dépôt avant cette date.</p>
          <br/>
          <p>Cordialement,</p>
          <p><strong>L'équipe OTDAV</strong></p>
        </div>
        <div style="background: #1a3c6e; padding: 10px; text-align: center;">
          <p style="color: #ccc; font-size: 12px; margin: 0;">
            المؤسسة التونسية لحقوق المؤلف والحقوق المجاورة
          </p>
        </div>
      </div>
    `
  })
}

async function sendFinalWarningEmail(transporter, to, nom, titre, expiration) {
  await transporter.sendMail({
    from: `"OTDAV" <${process.env.EMAIL_USER}>`,
    to,
    subject: `⚠️ URGENT: Votre dépôt expire DEMAIN`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #ef4444; padding: 20px; text-align: center;">
          <h2 style="color: white; margin: 0;">⚠️ OTDAV - AVERTISSEMENT FINAL</h2>
        </div>
        <div style="padding: 30px; background: #f9f9f9;">
          <p>Madame/Monsieur <strong>${nom}</strong>,</p>
          <p style="color: #ef4444; font-weight: bold;">Votre dépôt pour l'oeuvre "${titre}" expire DEMAIN le ${new Date(expiration).toLocaleDateString('fr-FR')}.</p>
          <p>Présentez-vous immédiatement à l'OTDAV pour renouveler votre dépôt.</p>
          <br/>
          <p>Cordialement,</p>
          <p><strong>L'équipe OTDAV</strong></p>
        </div>
      </div>
    `
  })
}

module.exports = {}