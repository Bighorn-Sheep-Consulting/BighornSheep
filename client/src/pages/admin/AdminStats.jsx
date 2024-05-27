import React, { useState, useEffect } from "react";
import axios from "../../api/axios";
import {
  Box,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  CardHeader,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TableContainer,
  Snackbar,
  Alert,
  IconButton,
  Drawer,
} from "@mui/material";
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  LineChart,
  Line,
  Legend,
  ResponsiveContainer,
} from "recharts";
import Sidebar from "./Sidebar";
import { MenuOutlined } from "@mui/icons-material";
import {
  idToSalasMap,
  roleToNameMap,
} from "../../components/interfaces/constants";

const STATS_URL = "/api/statistics";

const COLORS = [
  "#0088FE",
  "#00C49F",
  "#FFBB28",
  "#FF8042",
  "#FF0000",
  "#800080",
  "#00FF00",
  "#FFFF00",
];

const AdminStats = () => {
  const [stats, setStats] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await axios.get(STATS_URL);
        console.log("Statistics response:", response.data);
        setStats(response.data);
      } catch (error) {
        console.error("Error fetching statistics:", error);
      }
    };

    fetchStats();
  }, []);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  if (!stats) {
    return <Typography>Loading...</Typography>;
  }

  const popularRooms = stats.popularRooms.map((room) => ({
    ...room,
    name: idToSalasMap[room.ZonaID],
  }));

  const userTypeBreakdown = stats.userTypeBreakdown.map((user) => ({
    ...user,
    name: roleToNameMap[user.Role],
  }));

  const estadoOptions = {
    Pendiente: "Pendiente",
    Confirmado: "Confirmado",
    Cancelado: "Cancelado",
    Completado: "Completado",
  };

  const statusBreakdown = stats.statusBreakdown.map((status) => ({
    ...status,
    name: estadoOptions[status.Estado] || status.Estado,
  }));

  const formatHour = (hour) => {
    const ampm = hour < 12 ? "AM" : "PM";
    const formattedHour = hour % 12 || 12;
    return `${formattedHour} ${ampm}`;
  };

  const formatMonthYear = (data) => {
    return data.map((item) => ({
      ...item,
      monthYear: `${item.month}/${item.year}`,
    }));
  };

  return (
    <Box className="flex min-h-screen flex-col md:flex-row">
      <Drawer anchor="left" open={sidebarOpen} onClose={toggleSidebar}>
        <Sidebar isOpen={sidebarOpen} toggleSidebar={toggleSidebar} />
      </Drawer>
      <Box className="flex-grow bg-gray-50 p-4" component={Paper}>
        <IconButton
          className="absolute left-4 top-4 z-50 bg-white p-2 text-gray-700 shadow-md sm:hidden"
          onClick={toggleSidebar}
        >
          <MenuOutlined className="h-6 w-6" />
        </IconButton>
        <Typography variant="h4" gutterBottom className="text-center">
          Admin Dashboard - Estadísticas
        </Typography>

        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <Card>
              <CardHeader title="Reservaciones Totales" />
              <CardContent>
                <Typography variant="h5">{stats.totalReservations}</Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={4}>
            <Card>
              <CardHeader title="Usuarios Activos" />
              <CardContent>
                <Typography variant="h5">{stats.activeUsers}</Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={4}>
            <Card>
              <CardHeader title="Cuarto Más Popular" />
              <CardContent>
                <Typography variant="h5">
                  {popularRooms.length > 0 ? popularRooms[0].name : "N/A"}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        <Grid container spacing={3} className="mt-4">
          <Grid item xs={12} md={6}>
            <Paper>
              <Typography variant="h6" className="p-4">
                Desglose de Reservaciones por Estado
              </Typography>
              <ResponsiveContainer width="100%" height={400}>
                <PieChart>
                  <Pie
                    data={statusBreakdown}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) =>
                      `${name}: ${(percent * 100).toFixed(0)}%`
                    }
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="count"
                  >
                    {statusBreakdown.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </Paper>
          </Grid>

          <Grid item xs={12} md={6}>
            <Paper>
              <Typography variant="h6" className="p-4">
                Reservaciones por Tipo de Usuario
              </Typography>
              <ResponsiveContainer width="100%" height={400}>
                <PieChart>
                  <Pie
                    data={userTypeBreakdown}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) =>
                      `${name}: ${(percent * 100).toFixed(0)}%`
                    }
                    outerRadius={80}
                    fill="#82ca9d"
                    dataKey="count"
                  >
                    {userTypeBreakdown.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </Paper>
          </Grid>

          <Grid item xs={12}>
            <Paper>
              <Typography variant="h6" className="p-4">
                Cuartos Más Populares
              </Typography>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart
                  data={popularRooms}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="name"
                    label={{
                      value: "Room",
                      position: "insideBottom",
                      offset: -5,
                    }}
                  />
                  <YAxis
                    label={{
                      value: "Count",
                      angle: -90,
                      position: "insideLeft",
                    }}
                  />
                  <Tooltip />
                  <Bar dataKey="count" fill="#8884d8" />
                  <Legend />
                </BarChart>
              </ResponsiveContainer>
            </Paper>
          </Grid>

          <Grid item xs={12}>
            <Paper>
              <Typography variant="h6" className="p-4">
                Reservaciones por Hora del Día
              </Typography>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart
                  data={stats.reservationsByTime.map((item) => ({
                    ...item,
                    hour: formatHour(item.hour),
                  }))}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="hour"
                    label={{
                      value: "Hour",
                      position: "insideBottom",
                      offset: -5,
                    }}
                  />
                  <YAxis
                    label={{
                      value: "Count",
                      angle: -90,
                      position: "insideLeft",
                    }}
                  />
                  <Tooltip />
                  <Bar dataKey="count" fill="#82ca9d" />
                  <Legend />
                </BarChart>
              </ResponsiveContainer>
            </Paper>
          </Grid>

          <Grid item xs={12}>
            <Paper>
              <Typography variant="h6" className="p-4">
                Tendencia de Reservas Mensuales
              </Typography>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart
                  data={formatMonthYear(stats.monthlyTrend)}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="monthYear"
                    label={{
                      value: "Month/Year",
                      position: "insideBottom",
                      offset: -5,
                    }}
                  />
                  <YAxis
                    label={{
                      value: "Count",
                      angle: -90,
                      position: "insideLeft",
                    }}
                  />
                  <Tooltip />
                  <Line type="monotone" dataKey="count" stroke="#8884d8" />
                  <Legend />
                </LineChart>
              </ResponsiveContainer>
            </Paper>
          </Grid>

          <Grid item xs={12}>
            <Paper>
              <Typography variant="h6" className="p-4">
                Actividad de Usuarios
              </Typography>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Matricula</TableCell>
                      <TableCell>Reservaciones</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {stats.userEngagement.map((user) => (
                      <TableRow key={user.Matricula}>
                        <TableCell>{user.Matricula}</TableCell>
                        <TableCell>{user.count}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
};

export default AdminStats;