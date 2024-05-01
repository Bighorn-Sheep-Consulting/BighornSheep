import { useState, useEffect } from "react";
import axios from "../../api/axios";
import {
  PencilIcon,
  TrashIcon,
  InformationCircleIcon,
} from "@heroicons/react/solid";
import EditReservationModal from "../../components/EditReservationModal";
import ViewReservationInfoModal from "@/components/ViewReservationInfoModal";
import Loading from "../../components/Loading";
import MultiSelectFilter from "../../components/MultiSelectFilter";
import DropdownFilter from "../../components/DropdownFilter";
import { idToSalasMap } from "../../components/interfaces/constants";
interface Reservation {
  ReservacionID: number;
  Matricula: string;
  HoraInicio: string;
  HoraFin: string;
  Proposito: string;
  Estado: string;
  ZonaID: number;
  isDeleted: boolean;
}

// PENDIENTE: DECIDIR QUE HACER CON LAS RESERVACIONES QUE SALEN EN PENDIENTE

const RESERVACIONES_URL = "/reservaciones";
const DELETE_RESERVACION_URL = (reservacionID: number) =>
  `/reservaciones/set-deleted/${reservacionID}`;
const UPDATE_RESERVACION_URL = (reservacionID: number) =>
  `/reservaciones/${reservacionID}`;
const SALAS_URL = "/salas";

const RecentReservations = () => {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [currentReservation, setCurrentReservation] = useState(null);
  const [isDataLoading, setIsDataLoading] = useState(true);
  const [selectedRooms, setSelectedRooms] = useState(new Set());
  const [selectedEstados, setSelectedEstados] = useState(new Set());
  const [searchMatricula, setSearchMatricula] = useState("");
  const [salas, setSalas] = useState([]);
  const [selectedRoom, setSelectedRoom] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const [isViewing, setIsViewing] = useState(false);
  const [sortField, setSortField] = useState("ReservacionID");
  const [sortOrder, setSortOrder] = useState("ASC");

  const estadoOptions = ["Pendiente", "Confirmado", "Cancelado", "Completado"];
  const salaOptions = Object.values(idToSalasMap);

  useEffect(() => {
    const fetchSalas = async () => {
      try {
        const response = await axios.get(SALAS_URL);
        setSalas(response.data);
      } catch (error) {
        console.error("Error fetching salas:", error);
      }
    };

    fetchSalas();
  }, []);

  useEffect(() => {
    const fetchReservations = async () => {
      try {
        const response = await axios.get(RESERVACIONES_URL);
        setReservations(response.data);
        setIsDataLoading(false);
      } catch (error) {
        console.error("Error fetching reservations:", error);
        setIsDataLoading(false);
      }
    };

    fetchReservations();
  }, []);

  // Ordenar las reservaciones por el campo especificado, en descendente o ascendente
  const sortReservations = (field: string) => {
    setSortField((prevField) => {
      const newOrder =
        prevField === field && sortOrder === "ASC" ? "DESC" : "ASC";
      setSortOrder(newOrder);

      setReservations((prevReservations) => {
        return [...prevReservations].sort((a, b) => {
          if (a[field] < b[field]) return newOrder === "ASC" ? -1 : 1;
          if (a[field] > b[field]) return newOrder === "ASC" ? 1 : -1;
          return 0;
        });
      });

      return field;
    });
  };

  const handleView = (reservacionID: number) => {
    setCurrentReservation(
      reservations.find(
        (res: Reservation) => res.ReservacionID === reservacionID,
      ),
    );
    setIsViewing(true);
    setShowDropdown(false);
    console.log("Viewing reservation with ID:", reservacionID);
  };

  const handleEdit = (reservacionID: number) => {
    setCurrentReservation(
      reservations.find(
        (res: Reservation) => res.ReservacionID === reservacionID,
      ),
    );
    setIsEditing(true);
    setShowDropdown(false);
    console.log("Editing reservation with ID:", reservacionID);
  };

  const closeModal = () => {
    setIsEditing(false);
    setCurrentReservation(null);
  };

  const updateReservation = async (updatedData: Reservation) => {
    try {
      console.log("Updating reservation:", updatedData);
      const response = await axios.put(
        UPDATE_RESERVACION_URL(updatedData.ReservacionID),
        updatedData,
      );

      setReservations(
        reservations.map((res: Reservation) =>
          res.ReservacionID === updatedData.ReservacionID
            ? { ...res, ...updatedData }
            : res,
        ),
      );
      alert("Reservacion actualizada exitosamente");
    } catch (error) {
      console.error("Error updating reservation:", error);
    }
  };

  // COMO LO HIZE EN EL BACKEND, NO SE ELIMINAN LAS RESERVACIONES, SOLO SE MARCAN COMO ELIMINADAS
  // POR LO QUE NO SE ELIMINAN DE LA BASE DE DATOS, SOLO SE ACTUALIZA EL ESTADO DE LA RESERVACION
  // ESTO ES PORQUE LOS IDS DE RESERVACIONES SON LLAVES FORANEAS EN OTRAS TABLAS Y NO SE PUEDEN ELIMINAR
  // A MENOS QUE SE ELIMINEN TODAS LAS REFERENCIAS A ESA RESERVACION COMO UNA CASCADA
  // pero no hize esto porque la informacion de reservaciones previas puede ser importante
  const handleDelete = async (reservacionID: number) => {
    const confirmDelete = window.confirm(
      "¿Seguro que quieres marcar esta reservacion como eliminada?",
    );
    if (confirmDelete) {
      try {
        console.log("Marcando reservacion como eliminada: ", reservacionID);
        const response = await axios.put(DELETE_RESERVACION_URL(reservacionID));

        console.log(response.data);
        setReservations(
          reservations.filter(
            (res: Reservation) => res.ReservacionID !== reservacionID,
          ),
        );
        alert("Reservacion marcada como eliminada");
      } catch (error) {
        console.error("Error marcando reservacion como eliminada: ", error);
        alert("Error al intentar marcar la reservacion como eliminada");
      }
    }
  };

  return (
    <div className="mx-2 mt-4 rounded-lg bg-white p-4 shadow-xl">
      <h2 className="mb-6 text-2xl font-bold text-gray-700">
        Todas las reservaciones
      </h2>
      <div className="filter-section mb-4">
        <div className="mb-3">
          <label
            htmlFor="searchMatricula"
            className="mb-2 block text-sm font-medium text-gray-900"
          >
            Buscar por matricula
          </label>
          <input
            id="searchMatricula"
            type="text"
            value={searchMatricula}
            onChange={(e) => setSearchMatricula(e.target.value)}
            placeholder="Filtrar por matricula"
            className="focus:ring-blue-500 focus:border-blue-500 block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900"
          />
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <MultiSelectFilter
            options={salaOptions}
            selectedOptions={selectedRooms as Set<string>}
            setSelectedOptions={setSelectedRooms}
            title="Filtrar por sala"
          />
          <MultiSelectFilter
            options={estadoOptions}
            selectedOptions={selectedEstados as Set<string>}
            setSelectedOptions={setSelectedEstados}
            title="Filtrar por estado"
          />
        </div>
      </div>
      <div className="overflow-x-auto rounded-lg">
        {isDataLoading ? (
          <Loading />
        ) : (
          <table className="min-w-full divide-y divide-gray-200 bg-white">
            <thead className="bg-gray-50">
              <tr>
                <th
                  onClick={() => sortReservations("ReservacionID")}
                  className="cursor-pointer px-6 py-3 text-left text-sm font-semibold uppercase tracking-wider text-gray-600 hover:bg-gray-100 hover:shadow"
                >
                  ID
                </th>
                <th
                  onClick={() => sortReservations("Matricula")}
                  className="cursor-pointer px-6 py-3 text-left text-sm font-semibold uppercase tracking-wider text-gray-600 hover:bg-gray-100 hover:shadow"
                >
                  Matricula
                </th>
                <th
                  onClick={() => sortReservations("HoraInicio")}
                  className="cursor-pointer px-6 py-3 text-left text-sm font-semibold uppercase tracking-wider text-gray-600 hover:bg-gray-100 hover:shadow"
                >
                  Hora Inicio
                </th>
                <th
                  className="cursor-pointer px-6 py-3 text-left text-sm font-semibold uppercase tracking-wider text-gray-600 hover:bg-gray-100 hover:shadow"
                  onClick={() => sortReservations("HoraFin")}
                >
                  Hora Fin
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold uppercase tracking-wider text-gray-600">
                  Proposito
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold uppercase tracking-wider text-gray-600">
                  Estado
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold uppercase tracking-wider text-gray-600">
                  Cuarto
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold uppercase tracking-wider text-gray-600">
                  Acciones
                </th>
              </tr>
            </thead>

            <tbody>
              {reservations
                .filter(
                  (res) =>
                    (searchMatricula
                      ? res.Matricula.toLowerCase().includes(
                          searchMatricula.toLowerCase(),
                        )
                      : true) &&
                    (selectedRooms.size > 0
                      ? selectedRooms.has(idToSalasMap[res.ZonaID])
                      : true) &&
                    (selectedEstados.size > 0
                      ? selectedEstados.has(res.Estado)
                      : true),
                )
                .map((res: Reservation, index: number) => (
                  <tr
                    key={res.ReservacionID}
                    className={index % 2 === 0 ? "bg-gray-50" : "bg-white"}
                  >
                    <td className="font-large whitespace-nowrap px-6 py-4 text-sm text-gray-900">
                      {res.ReservacionID}
                    </td>
                    <td className="font-large whitespace-nowrap px-6 py-4 text-sm">
                      {res.Matricula}
                    </td>
                    <td className="font-large whitespace-nowrap px-6 py-4 text-sm">
                      {new Date(res.HoraInicio).toLocaleString()}
                    </td>
                    <td className="font-large whitespace-nowrap px-6 py-4 text-sm">
                      {new Date(res.HoraFin).toLocaleString()}
                    </td>
                    <td className="font-large whitespace-nowrap px-6 py-4 text-sm">
                      {res.Proposito}
                    </td>
                    <td className="font-large whitespace-nowrap px-6 py-4 text-sm">
                      {res.Estado}
                    </td>
                    <td className="font-large whitespace-nowrap px-6 py-4 text-sm">
                      {idToSalasMap[res.ZonaID]}
                    </td>
                    <td className="font-large flex items-center justify-start space-x-2 whitespace-nowrap px-6 py-4 text-sm">
                      <button
                        onClick={() => handleView(res.ReservacionID)}
                        className="text-indigo-600 hover:text-indigo-900"
                        title="Ver"
                      >
                        <InformationCircleIcon className="inline h-5 w-5" />
                        <span className="hidden md:inline">Ver</span>
                      </button>

                      <button
                        onClick={() => handleEdit(res.ReservacionID)}
                        className="text-indigo-600 hover:text-indigo-900"
                        title="Editar"
                      >
                        <PencilIcon className="inline h-5 w-5" />
                        <span className="hidden md:inline">Editar</span>
                      </button>
                      <button
                        onClick={() => handleDelete(res.ReservacionID)}
                        className="text-red-600 hover:text-red-900"
                        title="Eliminar"
                      >
                        <TrashIcon className="inline h-5 w-5" />
                        <span className="hidden md:inline">Eliminar</span>
                      </button>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        )}
      </div>
      {currentReservation && isEditing && (
        <EditReservationModal
          isOpen={isEditing}
          closeModal={closeModal}
          reservation={currentReservation}
          updateReservation={updateReservation}
        />
      )}
      {currentReservation && isViewing && (
        <ViewReservationInfoModal
          isOpen={isViewing}
          closeModal={() => setIsViewing(false)}
          reservation={currentReservation}
        />
      )}
    </div>
  );
};

export default RecentReservations;
