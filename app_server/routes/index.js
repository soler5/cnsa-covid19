const express = require('express');
const router = express.Router();
const ctrlLocations = require('../controllers/locations');

/* pages */
router.get('/', ctrlLocations.homelist);
router.get('/graficos', ctrlLocations.graficos);
router.get('/mapa', ctrlLocations.mapa);
router.get('/spain', ctrlLocations.spain);

module.exports = router;
