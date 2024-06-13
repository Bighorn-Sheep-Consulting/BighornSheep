const sql = require("mssql");
const config = require("../configs/config");
const moment = require('moment-timezone');

module.exports = {
    createReservation: async (req, res) => {
        const {
            Matricula,
            ZonaID,
            HoraInicio,
            HoraFin,
            Proposito,
            Estado = "", // Optional
            Alumnos = [], // Obligatory, default to an empty array
            Hardware = [], // Optional, default to an empty array
        } = req.body;
    
        // Validate required fields
        if (!Matricula || !ZonaID || !HoraInicio || !HoraFin || !Proposito || !Alumnos.length) {
            return res.status(400).send({
                message: "Missing required fields",
                missingFields: [
                    !Matricula && "Matricula",
                    !ZonaID && "ZonaID",
                    !HoraInicio && "HoraInicio",
                    !HoraFin && "HoraFin",
                    !Proposito && "Proposito",
                    !Alumnos.length && "Alumnos",
                ].filter(Boolean),
            });
        }
    
        const newHoraInicio = moment(HoraInicio).tz('America/Los_Angeles').format('YYYY-MM-DDTHH:mm:ss.SSSZ');
        const newHoraFin = moment(HoraFin).tz('America/Los_Angeles').format('YYYY-MM-DDTHH:mm:ss.SSSZ');

        try {
            let pool = await sql.connect(config);

        // Check for overlapping reservations
        const overlapResult = await pool
            .request()
            .input("ZonaID", sql.Int, ZonaID)
            .input("HoraInicio", sql.DateTimeOffset, newHoraInicio)
            .input("HoraFin", sql.DateTimeOffset, newHoraFin)
            .execute("sp_CheckOverlappingReservations");

        const overlappingReservations = overlapResult.recordset;
        if (overlappingReservations.length > 0) {
            // Find nearest available alternatives
            const alternativesResult = await pool
                .request()
                .input("ZonaID", sql.Int, ZonaID)
                .input("HoraInicio", sql.DateTimeOffset, newHoraInicio)
                .input("HoraFin", sql.DateTimeOffset, newHoraFin)
                .execute("sp_FindNearestAlternatives");

            const alternatives = alternativesResult.recordset;
            if (alternatives.length > 0) {
                return res.status(409).send({
                    message: "Overlapping reservations found. Here are some alternatives:",
                    overlappingReservations,
                    alternatives
                });
            } else {
                return res.status(409).send({
                    message: "Overlapping reservations found, and no suitable alternatives available within the same zone.",
                    overlappingReservations
                });
            }
        }
    
            const alumnoTable = new sql.Table("AlumnoType");
            alumnoTable.columns.add("Matricula", sql.VarChar(10));
            alumnoTable.columns.add("Rol", sql.NVarChar(50));
            Alumnos.forEach((alumno) => {
                alumnoTable.rows.add(alumno.Matricula, alumno.Rol || "Estudiante");
            });
    
            const hardwareTable = new sql.Table("HardwareType");
            hardwareTable.columns.add("HardwareID", sql.Int);
            hardwareTable.columns.add("Cantidad", sql.Int);
            Hardware.forEach((hardware) => {
                hardwareTable.rows.add(hardware.HardwareID, hardware.Cantidad);
            });
    
            await pool
                .request()
                .input("Matricula", sql.VarChar(10), Matricula)
                .input("ZonaID", sql.Int, ZonaID)
                .input("HoraInicio", sql.DateTimeOffset, newHoraInicio)
                .input("HoraFin", sql.DateTimeOffset, newHoraFin)
                .input("Proposito", sql.NVarChar(255), Proposito)
                .input("Estado", sql.NVarChar(50), Estado)
                .input("Alumnos", alumnoTable)
                .input("Hardware", hardwareTable)
                .execute("sp_InsertCompleteReservacion");
    
            res.status(201).send("Complete reservation added successfully");
        } catch (err) {
            console.error("Error:", err);
            res.status(500).send({ message: "Error with DB", error: err });
        }
    },
    // Get upcoming reservations by Matricula
    getUpcomingReservations: async (req, res) => {
        const { Matricula } = req.params;
    
        // Validate required fields
        if (!Matricula) {
            return res.status(400).send({
                message: "Missing required field: Matricula"
            });
        }
    
        try {
            let pool = await sql.connect(config);
            let result = await pool
                .request()
                .input("Matricula", sql.VarChar(10), Matricula)
                .execute("sp_GetUserReservationsByMatricula");
    
            res.status(201).send(result.recordset);
        } catch (err) {
            console.error("Error occurred while fetching upcoming reservations");
            console.error(err);
            res.status(500).send({ message: "Error with DB", error: err });
        }
    },
    checkNumberInDB: async (req, res) => {
        const { Telefono } = req.query;
    
        // Validate required fields
        if (!Telefono) {
            return res.status(400).send({
                message: "Missing required field: Telefono"
            });
        }
    
        try {
            let pool = await sql.connect(config);
            let result = await pool
                .request()
                .input("Telefono", sql.VarChar(20), Telefono)
                .output("Existe", sql.Bit)
                .execute("sp_BuscarTelefonoEnUsuario");
    
            // Get the output value
            let result2 = await pool
                .request()
                .input("Telefono", sql.VarChar(20), Telefono)
                .output("Matricula", sql.VarChar(10))
                .output("Existe", sql.Bit)
                .execute("sp_BuscarMatriculaPorTelefono");
    
            // Get the output value
            const existe = result.output.Existe;
            const matricula = result2.output.Matricula;
    
            res.status(200).send({ existe , matricula});
        } catch (err) {
            console.error("Error occurred while revising the phone number in the DB");
            console.error(err);
            res.status(500).send({ message: "Error with DB", error: err });
        }
    },
    findMatriculaWithNumber: async (req, res) => {
        const { Telefono } = req.query;
    
        // Validate required fields
        if (!Telefono) {
            return res.status(400).send({
                message: "Missing required field: Telefono"
            });
        }
    
        try {
            let pool = await sql.connect(config);
            let result = await pool
                .request()
                .input("Telefono", sql.VarChar(20), Telefono)
                .output("Matricula", sql.VarChar(10))
                .output("Existe", sql.Bit)
                .execute("sp_BuscarMatriculaPorTelefono");
    
            // Get the output value
            const existe = result.output.Existe;
            const matricula = result.output.Matricula;

    
            res.status(200).send({ existe , matricula});
        } catch (err) {
            console.error("Error occurred while revising the phone number in the DB");
            console.error(err);
            res.status(500).send({ message: "Error with DB", error: err });
        }
    },

    // find possible reservations around a future date

    // implement hardcoded information so that the LLM does not hallucinate errors 
    // I am talking about like "confimado" and the matricula
    
    
    // update my future reservations
    // delete my future reservations
};