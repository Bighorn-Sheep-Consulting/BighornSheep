const express = require('express');
const reservationsController = require('../controllers/reservationsController');
const router = express.Router();

/*
    /reservaciones ES EL URL BASE
    ejemplo: https://dreamapi.azurewebsites.net/reservaciones/upcoming

    
    /reservaciones/ : GET -> devuelve todas las reservaciones
    /reservaciones/upcoming : GET -> devuelve todas las reservaciones futuras
    /reservaciones/1 : GET -> devuelve la reservacion con ID 1
    /reservaciones/ : POST -> crea una nueva reservacion
    /reservaciones/1 : PUT -> actualiza la reservacion con ID 1
    /reservaciones/stats : GET -> devuelve estadisticas de las reservaciones para el dashboard de administardor
*/

router.get('/', reservationsController.getAllReservations);
router.get('/upcoming', reservationsController.getUpcomingReservations);
router.get('/stats', reservationsController.getReservationStats);
router.get('/:id', reservationsController.getReservationById);
router.post('/', reservationsController.createReservation);
router.put('/:id', reservationsController.updateReservation);
router.delete('/:id', reservationsController.deleteReservation);


module.exports = router;
