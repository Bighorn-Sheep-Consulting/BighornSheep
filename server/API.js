const express = require("express");
const sql = require("mssql");
const config = require("./config");
//var cors = require("cors");
// config no esta publico en github, crear archivo de config ustedes
//
const app = express();
app.use(express.json());
//app.use(cors());
// node API.js
app.get("/", (req, res) => {
  res.send("Ruta funcionando");
});

app.get("/test", (req, res) => {
  if (!connected) {
    connectToDB();
    res
      .status(500)
      .send("No se ha podido conectar a la base de datos, intentando conectar");
    return;
  }

  res.status(200).send("Conectado a la base de datos");
});

let connected = false;

const connectToDB = async () => {
  try {
    await sql.connect(config);
    console.log("Connected to database");
  } catch (err) {
    console.error("Database connection failed:", err);
  }
};

// Establecer conexion
sql
  .connect(config)
  .then((pool) => {
    if (pool.connecting) {
      console.log("Conecting to database");
    } else if (pool.connected) {
      console.log("Connected to database.");
      connected = true;
    }

    return pool;
  })
  .catch((err) => {
    console.error("Database connection failed:", err);
    connected = false;
  });

// Sacar todas las salas
app.get("/salas", (req, res) => {
  new sql.Request()
    .query("SELECT * FROM dbo.Salas")
    .then((result) => {
      res.json(result.recordset);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send({ message: "Error con DB", error: err });
    });
});

// Sacar todas las reservaciones

app.get("/reservaciones", (req, res) => {
  new sql.Request()
    .query("SELECT * FROM dbo.Reservaciones")
    .then((result) => {
      res.json(result.recordset);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send({ message: "Error con DB", error: err });
    });
});

// POST una reservacione

app.post("/reservaciones", (req, res) => {
  // Example of using destructuring to get fields from the request body
  const { Matricula, ZonaID, HoraInicio, HoraFin, Proposito, Estado } =
    req.body;

  const query = `
        INSERT INTO dbo.Reservaciones (Matricula, ZonaID, HoraInicio, HoraFin, Proposito, Estado)
        VALUES (@Matricula, @ZonaID, @HoraInicio, @HoraFin, @Proposito, @Estado);
    `;

  new sql.Request()
    .input("Matricula", sql.VarChar(10), Matricula)
    .input("ZonaID", sql.Int, ZonaID)
    .input("HoraInicio", sql.DateTime, HoraInicio)
    .input("HoraFin", sql.DateTime, HoraFin)
    .input("Proposito", sql.NVarChar(255), Proposito)
    .input("Estado", sql.NVarChar(50), Estado)
    .query(query)
    .then(() => {
      res.status(201).send("Reservation created successfully");
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send({ message: "Error con DB", error: err });
    });
});

// Reservaciones prontas (Solo las del futuro)

app.get("/reservaciones/upcoming", (req, res) => {
  const query = `
        SELECT * FROM dbo.Reservaciones
        WHERE HoraInicio > GETDATE()
        ORDER BY HoraInicio ASC;
    `;

  new sql.Request()
    .query(query)
    .then((result) => {
      res.json(result.recordset);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send({ message: "Error con DB", error: err });
    });
});

// GET Reservacion por ID

app.get("/reservaciones/:id", (req, res) => {
  const { id } = req.params;

  const query = `
        SELECT * FROM dbo.Reservaciones WHERE ReservacionID = @ReservacionID;
    `;

  new sql.Request()
    .input("ReservacionID", sql.Int, id)
    .query(query)
    .then((result) => {
      if (result.recordset.length > 0) {
        res.json(result.recordset[0]);
      } else {
        res.status(404).send("Reservation not found");
      }
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send({ message: "Error con DB", error: err });
    });
});

//Modificar (PUT) una reservacion

app.put("/reservaciones/:id", (req, res) => {
  const { id } = req.params;
  const { Matricula, ZonaID, HoraInicio, HoraFin, Proposito, Estado } =
    req.body;

  const query = `
        UPDATE dbo.Reservaciones
        SET Matricula = @Matricula, ZonaID = @ZonaID, HoraInicio = @HoraInicio, HoraFin = @HoraFin, Proposito = @Proposito, Estado = @Estado
        WHERE ReservacionID = @ReservacionID;
    `;

  new sql.Request()
    .input("ReservacionID", sql.Int, id)
    .input("Matricula", sql.VarChar(10), Matricula)
    .input("ZonaID", sql.Int, ZonaID)
    .input("HoraInicio", sql.DateTime, HoraInicio)
    .input("HoraFin", sql.DateTime, HoraFin)
    .input("Proposito", sql.NVarChar(255), Proposito)
    .input("Estado", sql.NVarChar(50), Estado)
    .query(query)
    .then(() => {
      res.status(200).send("Reservation updated successfully");
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send({ message: "Error con DB", error: err });
    });
});

// DELETE reservacion por ID
app.delete("/reservaciones/:id", (req, res) => {
  const { id } = req.params;

  const query = `
        DELETE FROM dbo.Reservaciones WHERE ReservacionID = @ReservacionID;
    `;

  new sql.Request()
    .input("ReservacionID", sql.Int, id)
    .query(query)
    .then(() => {
      res.status(200).send("Reservation deleted successfully");
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send({ message: "Error con DB", error: err });
    });
});

// Sacar los usuarios
app.get("/usuarios", (req, res) => {
  const query = `
        SELECT * FROM dbo.Usuarios;
    `;
  new sql.Request()
    .query(query)
    .then((result) => {
      res.json(result.recordset);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send({ message: "Error con DB", error: err });
    });
});

// Sacar los usuarios por matricula
app.get("/usuarios/:matricula", (req, res) => {
  const { matricula } = req.params;
  const query = `
        SELECT * FROM dbo.Usuarios WHERE Matricula = @Matricula;
    `;
  new sql.Request()
    .input("Matricula", sql.VarChar(10), matricula)
    .query(query)
    .then((result) => {
      if (result.recordset.length > 0) {
        res.json(result.recordset[0]);
      } else {
        res.status(404).send("User not found");
      }
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send({ message: "Error con DB", error: err });
    });
});

// POST un usuario
app.post("/usuarios", (req, res) => {
  const { Matricula, Nombre, Apellido, Correo, Telefono, Rol } = req.body;

  const query = `
        INSERT INTO dbo.Usuarios (Matricula, Nombre, Apellidos, Contraseña, Carrera, Semestre)
        VALUES (@Matricula, @Nombre, @Apellidos, @Contraseña, @Carrera, @Semestre);

       
    `;

  new sql.Request()
    .input("Matricula", sql.VarChar(10), Matricula)
    .input("Nombre", sql.NVarChar(50), Nombre)
    .input("Apellidos", sql.NVarChar(50), Apellido)
    .input("Contraseña", sql.NVarChar(50), Contraseña)
    .input("Carrera", sql.NVarChar(50), Carrera)
    .input("Semestre", sql.Int, Semestre)

    .query(query)
    .then(() => {
      res.status(201).send("User created successfully");
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send({ message: "Error con DB", error: err });
    });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});