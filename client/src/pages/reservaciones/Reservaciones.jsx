import ReservationShow from "@/components/ReservationShow";
import { getUser } from "@api_helper";
import useAuth from '@UserAuth';
import { useState, useEffect } from 'react';
const Reservaciones = () => {
  const { auth } = useAuth();
  const userID = auth?.userID;
  const [user, setUser] = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      if (!userID) return;
      const result = await getUser(userID);
      setUser(result);
    };
    fetchUser();
    }, [userID]);

  return(
    <div>
      <h1 className='text-5xl font-bold bh-text-blue mx-10'>¡Hola {user?.nombre}!</h1>
      <ReservationShow user = {user} estado="Confirmado" />
      <ReservationShow user = {user} estado="Pendiente" />
      <ReservationShow user = {user} estado="Completado" />
    </div>

);
};

export default Reservaciones;
