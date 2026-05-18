const express = require('express')
const router = express.Router()
const controller = require('../controller/autorisation.controller')
const authMiddleware = require('../middlewares/auth.middleware')
const adminMiddleware = require('../middlewares/admin.middleware')
const upload = require('../middlewares/upload.middleware')

// Allow any file field dynamically
const uploadAny = upload.any()

router.get('/organisateurs',          authMiddleware, controller.getAllOrganisateurs)
router.post('/organisateurs',         authMiddleware, controller.createOrganisateur)
router.post('/organisateurs/bulk',    adminMiddleware, controller.bulkCreateOrganisateurs)
router.post('/spectacles',            authMiddleware, uploadAny, controller.createAutorisationSpectacle)
router.get('/spectacles',             authMiddleware, controller.getAllAutorisations)
router.get('/spectacles/:id',         authMiddleware, controller.getAutorisationById)
router.put('/spectacles/:id/payer', authMiddleware, uploadAny, controller.payerAutorisation)
router.get('/spectacles/:id/calcul-da', authMiddleware, controller.getCalculDAPdf)

module.exports = router