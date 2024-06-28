import React, { useState, useEffect } from "react";
import axios from "../api/axios";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import ReactCardFlip from "react-card-flip";
function ReservationCard({ reservacion, sala }) {
  const [isFlipped, setIsFlipped] = useState(false);
  const { Link, Nombre, Lugar } = sala;
  const { HoraInicio, HoraFin, ReservacionID, Estado } = reservacion;
  const DELETE_RESERVACION_URL = (reservacionID) =>
    `/reservaciones/set-deleted/${reservacionID}`;
  const fecha = new Date(HoraInicio).toLocaleDateString();
  const horaI = new Date(HoraInicio).toLocaleTimeString();
  const horaF = new Date(HoraFin).toLocaleTimeString();

  const [equipo, setEquipo] = useState([]);
  const HARDWARE_URL = `/reservaciones/hardware/${ReservacionID}`;

  useEffect(() => {
    const fetchEquipo = async () => {
      try {
        const response = await axios.get(HARDWARE_URL);
        setEquipo(response.data);
      } catch (error) {
        console.error(error);
      }
    };

    fetchEquipo();
  }, [HARDWARE_URL]);

  const manejoDePuntos = async (matricula, puntos) => {
    try {
      const response = await axios.put(`/usuarios/puntos`, {
        Matricula: matricula,
        PuntosToAdd: puntos,
      });
      return response.data;
    } catch (error) {
      console.error("Error updating user points:", error);
      throw error;
    }
  };

  const handleDelete = async (reservacionID) => {
    try {
      console.log("Marcando reservacion como eliminada: ", reservacionID);
      await axios.put(DELETE_RESERVACION_URL(reservacionID));
      await manejoDePuntos(reservacion.Matricula, -25);
      console.log(reservacion.Matricula);
      window.location.reload();
    } catch (error) {
      console.error("Error marcando reservacion como eliminada: ", error);
      alert("Error al intentar marcar la reservacion como eliminada");
    }
  };

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
  };

  return (
    <ReactCardFlip
      cardZIndex="1"
      isFlipped={isFlipped}
      flipDirection="horizontal"
      className="z-10"
    >
      <div className="m-5 inline-block h-[92%] w-[300px] snap-center overflow-hidden rounded-lg bg-white shadow-lg md:w-[350px]">
        <div className="relative">
          {Estado !== "Completado" ? (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <button className="absolute left-[95%] mt-4 h-12 w-12 -translate-x-full transform rounded-md bg-red-600 text-white lg:h-8 lg:w-8">
                  X
                </button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Cuidado</AlertDialogTitle>
                  <AlertDialogDescription>
                    Al confirmar esta acción estarás eliminando tu reservación,
                    por lo que si ya estaba confirmada no podrás recuperarla.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Salir</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() => handleDelete(reservacion.ReservacionID)}
                    data-cy="delete-button"
                  >
                    Cancelar Reservación
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          ) : null}
          <img
            src={`${Link}.png`}
            alt={`${Nombre} image`}
            className="h-80 w-full"
          />
        </div>
        <div className="px-5 py-4">
          <h3 className="text-xl font-bold">{Nombre}</h3>
          <p className="mb-4 text-xs">{Lugar}</p>
          <div className="flex">
            <div className="mr-3">
              <p className="font-semibold">Fecha</p>
              <p className="font-semibold">Hora de Inicio</p>
              <p className="font-semibold">Hora de Termino</p>
              <p className="font-semibold">Aparatos</p>
            </div>
            <div>
              <p>{fecha}</p>
              <p>{horaI}</p>
              <p>{horaF}</p>
              <ul className="space-y-1">
                {equipo.length === 0 ? (
                  <li>No Solicitó Equipo</li>
                ) : (
                  equipo.slice(0, 3).map((item, index) => (
                    <li key={index}>
                      {index === 2 && equipo.length > 3 ? (
                        <p
                          className="cursor-pointer rounded-md bg-blue text-center text-lg font-bold text-white"
                          onClick={handleFlip}
                        >
                          Ver más
                        </p>
                      ) : (
                        item.Nombre +
                        (item.Cantidad > 1 ? "  x" + item.Cantidad : "")
                      )}
                    </li>
                  ))
                )}
              </ul>
            </div>
          </div>
        </div>
      </div>
      <div
        onClick={handleFlip}
        className="m-5 min-h-[565px] inline-block h-[92%] w-[300px] cursor-pointer snap-center overflow-hidden rounded-lg bg-white shadow-lg md:w-[350px]"
      >
        <div className="p-5">
          {equipo.map((item, index) => (
            <li key={index}>
              {item.Nombre}{" "}
              {item.Cantidad > 1 ? (
                <b className="text-md">x{item.Cantidad}</b>
              ) : null}
            </li>
          ))}
        </div>
      </div>
    </ReactCardFlip>
  );
}

export default ReservationCard;
