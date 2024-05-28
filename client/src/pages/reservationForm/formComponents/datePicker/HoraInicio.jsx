import { useState } from "react";

const HoraInicio = ({ onHoraInicioSeleccionadaChange }) => {
  const [hour, setHour] = useState("7"); // Establecer por defecto a las 7 AM
  const [minute, setMinute] = useState("00");
  const [error, setError] = useState("");

  const handleHourChange = (e) => {
    validateTime(e.target.value, minute);
    setHour(e.target.value);
  };

  const handleMinuteChange = (e) => {
    validateTime(hour, e.target.value);
    setMinute(e.target.value);
  };

  const validateTime = (hour, minute) => {
    const hourInt = parseInt(hour);
    const minuteInt = parseInt(minute);
    console.log(hourInt);

    if (
      hourInt < 7 ||
      hourInt >= 21 ||
      (hourInt === 20 && minuteInt !== "00")
    ) {
      setError("Por favor selecciona una hora entre las 7 AM and 9 PM.");
    } else {
      setError("");
      updateTime(hour, minute);
    }
  };

  const updateTime = (hour, minute) => {
    onHoraInicioSeleccionadaChange(hour, minute);
  };

  return (
    <div>
      <h2 className="mb-2 text-xl font-bold">Hora de inicio</h2>
      <div className="flex items-center space-x-2 rounded-lg p-4 shadow-[0_5px_20px_-5px_rgba(0,0,0,0.3)]">
        <select
          className="rounded-md bg-white p-2.5 text-lg text-gray-900"
          value={hour}
          onChange={handleHourChange}
        >
          {Array.from({ length: 12 }, (_, i) => i + 1).map((h) => (
            <option key={h} value={h}>
              {h}
            </option>
          ))}
        </select>
        <span className="text-sm text-gray-700">:</span>
        <select
          className="rounded-md bg-white p-2.5 text-lg text-gray-900"
          value={minute}
          onChange={handleMinuteChange}
        >
          {["00", "15", "30", "45"].map((m) => (
            <option key={m} value={m}>
              {m}
            </option>
          ))}
        </select>
      </div>
      {error && <p className="mt-2 w-56 text-xs text-red-500">{error}</p>}
    </div>
  );
};

export default HoraInicio;
