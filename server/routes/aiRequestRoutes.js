const express = require("express");
const aiRequestController = require("../controllers/aiRequestController");
const router = express.Router();


/**
 * @swagger
 * /ai/reservation:
 *   post:
 *     summary: Crear una nueva reservación por medio de LLM
 *     description: Agrega una nueva reservación a la base de datos.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/NewReservation'
 *     responses:
 *       201:
 *         description: Reservación creada exitosamente.
 *       500:
 *         description: Error del servidor o problema de conectividad con la base de datos.
 *       400:
 *         description: Faltan campos requeridos.
 *     tags:
 *       - Reservaciones
 * components:
 *   schemas:
 *     NewReservation:
 *       type: object
 *       required:
 *         - Matricula
 *         - SalaID
 *         - HoraInicio
 *         - HoraFin
 *         - Proposito
 *         - Estado
 *       properties:
 *         Matricula:
 *           type: string
 *           description: Matricula del Alumno creando la reservación.
 *         SalaID:
 *           type: integer
 *           description: Identificador de la sala reservada.
 *         HoraInicio:
 *           type: string
 *           format: date-time
 *           description: Tiempo de inicio de la reservación.
 *         HoraFin:
 *           type: string
 *           format: date-time
 *           description: Tiempo de finalización de la reservación.
 *         Proposito:
 *           type: string
 *           description: Propósito de la reservación.
 *         Estado:
 *           type: string
 *           description: Estado actual de la reservación.
 *         Alumnos:
 *           type: array
 *           description: Lista de alumnos que participan en la reservación.
 *           items:
 *             type: object
 *             required:
 *               - Matricula
 *             properties:
 *               Matricula:
 *                 type: integer
 *                 description: Matrícula del alumno.
 *               Rol:
 *                 type: string
 *                 description: Rol del alumno en la reservación.
 *                 default: 'Estudiante'
 *                 enum:
 *                   - 'Leader'
 *                   - 'Estudiante'
 *         Hardware:
 *           type: array
 *           description: Lista de hardware solicitado para la reservación.
 *           items:
 *             type: object
 *             required:
 *               - HardwareID
 *               - Cantidad
 *             properties:
 *               HardwareID:
 *                 type: integer
 *                 description: Identificador del tipo de hardware.
 *               Cantidad:
 *                 type: integer
 *                 description: Cantidad de hardware solicitado.
 */
router.post("/reservation", aiRequestController.createReservation);

/**
 * @swagger
 * /ai/reservations/{Matricula}:
 *   get:
 *     summary: Obtener próximas reservaciones por matrícula
 *     description: Recupera todas las reservaciones futuras para un alumno específico usando su matrícula.
 *     parameters:
 *       - in: path
 *         name: Matricula
 *         required: true
 *         schema:
 *           type: string
 *         description: Matricula del Alumno.
 *     responses:
 *       200:
 *         description: Lista de reservaciones futuras.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   Matricula:
 *                     type: string
 *                     description: Matricula del Alumno.
 *                   HoraInicio:
 *                     type: string
 *                     format: date-time
 *                     description: Tiempo de inicio de la reservación.
 *                   HoraFin:
 *                     type: string
 *                     format: date-time
 *                     description: Tiempo de finalización de la reservación.
 *                   NombreZona:
 *                     type: string
 *                     description: Nombre de la zona de instalación.
 *                   NombreUsuario:
 *                     type: string
 *                     description: Nombre del usuario.
 *                   LinkSala:
 *                     type: string
 *                     description: Enlace a la sala.
 *       500:
 *         description: Error del servidor o problema de conectividad con la base de datos.
 *       400:
 *         description: Faltan campos requeridos.
 *     tags:
 *       - Reservaciones
 */
router.get("/reservations/:Matricula", aiRequestController.getUpcomingReservations);

/**
 * @swagger
 * /ai/checkNumber:
 *   get:
 *     summary: Verificar si un número de teléfono existe en la base de datos
 *     description: Verifica si un número de teléfono específico está registrado en la base de datos.
 *     parameters:
 *       - in: query
 *         name: Telefono
 *         required: true
 *         schema:
 *           type: string
 *         description: Número de teléfono a verificar.
 *     responses:
 *       200:
 *         description: Resultado de la verificación del número de teléfono.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   Telefono:
 *                     type: string
 *                     description: Número de teléfono del usuario.
 *                   NombreUsuario:
 *                     type: string
 *                     description: Nombre del usuario.
 *       500:
 *         description: Error del servidor o problema de conectividad con la base de datos.
 *       400:
 *         description: Faltan campos requeridos.
 *     tags:
 *       - Usuarios
 */
router.get("/checkNumber", aiRequestController.checkNumberInDB);

/**
 * @swagger
 * /ai/matricula:
 *   get:
 *     summary: Buscar matrícula por número de teléfono
 *     description: Busca la matrícula asociada a un número de teléfono específico en la base de datos.
 *     parameters:
 *       - in: query
 *         name: Telefono
 *         required: true
 *         schema:
 *           type: string
 *         description: Número de teléfono para buscar la matrícula.
 *     responses:
 *       200:
 *         description: Resultado de la búsqueda de la matrícula.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 existe:
 *                   type: boolean
 *                   description: Indica si el número de teléfono existe en la base de datos.
 *                 matricula:
 *                   type: string
 *                   description: Matrícula asociada al número de teléfono.
 *       400:
 *         description: Faltan campos requeridos.
 *       500:
 *         description: Error del servidor o problema de conectividad con la base de datos.
 *     tags:
 *       - Matrículas
 */
router.get("/matricula", aiRequestController.findMatriculaWithNumber);


module.exports = router