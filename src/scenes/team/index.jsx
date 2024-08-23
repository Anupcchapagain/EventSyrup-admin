import React, { useState, useEffect } from 'react';
import { Box, Typography, useTheme, Card, Button, TextField, Modal, MenuItem, IconButton } from "@mui/material";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';
import { tokens } from "../../theme";
import AdminPanelSettingsOutlinedIcon from "@mui/icons-material/AdminPanelSettingsOutlined";
import LockOpenOutlinedIcon from '@mui/icons-material/LockOpenOutlined';
import SecurityOutlinedIcon from "@mui/icons-material/SecurityOutlined";
import AddIcon from '@mui/icons-material/Add';
import EventIcon from '@mui/icons-material/Event';
import Header from "../../components/Header";
import { collection, getDocs, addDoc, doc, updateDoc, deleteDoc, query, where } from "firebase/firestore";
import { db } from "../../firebase";
import { useAuth } from "../../AuthContext";
import { useNavigate } from 'react-router-dom';
import { format, isValid } from 'date-fns';

const positions = ['Bartenders', 'Chefs', 'Driver', 'Host', 'Runners', 'Bar Backs', 'DJs', 'Artists', 'Cleaners'];

const ManageTeams = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [teamMembers, setTeamMembers] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [selectedMember, setSelectedMember] = useState(null);
  const [open, setOpen] = useState(false);
  const [formValues, setFormValues] = useState({
    name: '',
    age: '',
    phone: '',
    email: '',
    access: 'user',
    position: 'Bartenders'
  });
  const [rotas, setRotas] = useState([]);
  const [eventGroups, setEventGroups] = useState([]); // Added eventGroups state

  useEffect(() => {
    if (currentUser) {
      fetchTeamMembers();
      fetchRotas();
      fetchEventGroups(); // Fetch event groups
    }
  }, [currentUser]);

  const fetchTeamMembers = async () => {
    if (!currentUser) return;
    const q = query(collection(db, "teamMembers"), where("userId", "==", currentUser.uid));
    const querySnapshot = await getDocs(q);
    const teamData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    setTeamMembers(teamData);
  };

  const fetchRotas = async () => {
    if (!currentUser) return;
    const q = query(collection(db, "rotas"), where("userId", "==", currentUser.uid));
    const querySnapshot = await getDocs(q);
    const rotaData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    setRotas(rotaData);
  };

  const fetchEventGroups = async () => { // Function to fetch event groups
    if (!currentUser) return;
    const q = query(collection(db, "expenseGroups"), where("userId", "==", currentUser.uid));
    const querySnapshot = await getDocs(q);
    const eventData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    setEventGroups(eventData);
  };

  const handleOpen = () => setOpen(true);
  const handleClose = () => {
    setOpen(false);
    setSelectedMember(null);
    setFormValues({
      name: '',
      age: '',
      phone: '',
      email: '',
      access: 'user',
      position: 'Bartenders'
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormValues({
      ...formValues,
      [name]: value
    });
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!currentUser) return;
    const memberData = { ...formValues, userId: currentUser.uid };
    if (selectedMember) {
      await updateDoc(doc(db, "teamMembers", selectedMember.id), memberData);
    } else {
      await addDoc(collection(db, "teamMembers"), memberData);
    }
    fetchTeamMembers();
    handleClose();
  };

  const handleEdit = (member) => {
    setSelectedMember(member);
    setFormValues(member);
    handleOpen();
  };

  const handleDelete = async (id) => {
    await deleteDoc(doc(db, "teamMembers", id));
    fetchTeamMembers();
  };

  const requestSearch = (searchValue) => {
    setSearchText(searchValue);
    const filteredRows = teamMembers.filter((row) => {
      return Object.keys(row).some((field) => {
        return row[field].toString().toLowerCase().includes(searchValue.toLowerCase());
      });
    });
    setTeamMembers(filteredRows);
  };

  const clearSearch = () => {
    setSearchText("");
    fetchTeamMembers();
  };

  const handleCreateRota = () => {
    navigate("/rota");
  };

  const columns = [
    // Remove ID column to hide user IDs
    // { field: "id", headerName: "ID" },
    {
      field: "name",
      headerName: "Name",
      flex: 1,
      cellClassName: "name-column--cell",
    },
    {
      field: "age",
      headerName: "Age",
      type: "number",
      headerAlign: "left",
      align: "left",
    },
    {
      field: "phone",
      headerName: "Phone Number",
      flex: 1,
    },
    {
      field: "email",
      headerName: "Email",
      flex: 1,
    },
    {
      field: "position",
      headerName: "Position",
      flex: 1,
      renderCell: (params) => (
        <TextField
          select
          value={params.value}
          onChange={(e) => {
            const updatedPosition = e.target.value;
            setTeamMembers(teamMembers.map(member => member.id === params.row.id ? { ...member, position: updatedPosition } : member));
          }}
          variant="standard"
          InputProps={{
            disableUnderline: true,
            style: { color: colors.grey[100], backgroundColor: 'transparent' }
          }}
        >
          {positions.map((option) => (
            <MenuItem key={option} value={option}>
              {option}
            </MenuItem>
          ))}
        </TextField>
      )
    },
    {
      field: "access",
      headerName: "Access Level",
      flex: 1,
      renderCell: ({ row: { access } }) => {
        return (
          <Box
            width="60%"
            m="0 auto"
            p="5px"
            display="flex"
            justifyContent="center"
            backgroundColor={
              access === "admin"
                ? colors.greenAccent[600]
                : access === "manager"
                ? colors.greenAccent[700]
                : colors.greenAccent[700]
            }
            borderRadius="4px"
          >
            {access === "admin" && <AdminPanelSettingsOutlinedIcon />}
            {access === "manager" && <SecurityOutlinedIcon />}
            {access === "user" && <LockOpenOutlinedIcon />}
            <Typography color={colors.grey[100]} sx={{ ml: "5px" }}>
              {access}
            </Typography>
          </Box>
        );
      },
    },
    {
      field: "actions",
      headerName: "Actions",
      flex: 1,
      renderCell: (params) => (
        <Box>
          <Button onClick={() => handleEdit(params.row)} color="primary">Edit</Button>
          <Button onClick={() => handleDelete(params.row.id)} color="secondary">Delete</Button>
        </Box>
      )
    },
  ];

  const groupedRotas = rotas.reduce((acc, rota) => {
    const dateKey = isValid(new Date(rota.start)) ? format(new Date(rota.start), 'yyyy-MM-dd') : 'Invalid Date';
    if (!acc[dateKey]) {
      acc[dateKey] = [];
    }
    acc[dateKey].push(rota);
    return acc;
  }, {});

  return (
    <Box m="20px">
      <Header title="Manage Your Teams" subtitle="" />

      <Box
        display="flex"
        justifyContent="flex-start"
        alignItems="center"
        mt="20px"
        mb="40px"
      >
        <Card 
          onClick={handleOpen} 
          sx={{ 
            cursor: 'pointer', 
            width: '200px', 
            height: '200px', 
            display: 'flex', 
            flexDirection: 'column',
            justifyContent: 'center', 
            alignItems: 'center', 
            backgroundColor: 'rgba(0, 255, 0, 0.1)', 
            border: `2px dashed ${colors.greenAccent[500]}`, 
            borderRadius: '10px',
            '&:hover': {
              backgroundColor: 'rgba(0, 255, 0, 0.2)',
            }
          }}
        >
          <AddIcon sx={{ fontSize: '80px', color: colors.greenAccent[500], mb: '10px' }} />
          <Typography>Add Team Member</Typography>
        </Card>

        <Card 
          onClick={handleCreateRota}
          sx={{ 
            cursor: 'pointer', 
            width: '200px', 
            height: '200px', 
            display: 'flex', 
            flexDirection: 'column',
            justifyContent: 'center', 
            alignItems: 'center', 
            backgroundColor: 'rgba(0, 255, 0, 0.1)', 
            border: `2px dashed ${colors.greenAccent[500]}`, 
            borderRadius: '10px',
            '&:hover': {
              backgroundColor: 'rgba(0, 255, 0, 0.2)',
            },
            marginLeft: '20px'
          }}
        >
          <EventIcon sx={{ fontSize: '80px', color: colors.greenAccent[500], mb: '10px' }} />
          <Typography>Create Rota</Typography>
        </Card>
      </Box>

      <Box
        m="40px 0 0 0"
        height="75vh"
        sx={{
          "& .MuiDataGrid-root": {
            border: "none",
          },
          "& .MuiDataGrid-cell": {
            borderBottom: "none",
            color: colors.grey[100],
          },
          "& .name-column--cell": {
            color: colors.greenAccent[300],
          },
          "& .MuiDataGrid-columnHeaders": {
            backgroundColor: colors.blueAccent[700],
            borderBottom: "none",
            color: colors.grey[100],
          },
          "& .MuiDataGrid-virtualScroller": {
            backgroundColor: colors.primary[400],
          },
          "& .MuiDataGrid-footerContainer": {
            borderTop: "none",
            backgroundColor: colors.blueAccent[700],
            color: colors.grey[100],
          },
          "& .MuiCheckbox-root": {
            color: `${colors.greenAccent[200]} !important`,
          },
        }}
      >
        <DataGrid 
          checkboxSelection 
          rows={teamMembers} 
          columns={columns} 
          components={{ Toolbar: GridToolbar }}
          componentsProps={{
            toolbar: {
              search: {
                value: searchText,
                onChange: (event) => requestSearch(event.target.value),
                clearSearch: clearSearch,
              }
            },
          }}
        />
      </Box>

      <Box mt="40px">
        <Typography variant="h5" gutterBottom>
          Scheduled Rotas
        </Typography>
        {Object.keys(groupedRotas).map(dateKey => (
          <Card key={dateKey} sx={{ mb: 2, p: 2, border: `1px solid ${colors.greenAccent[500]}`, borderRadius: '10px', backgroundColor: 'rgba(0, 255, 0, 0.1)' }}>
            <Typography variant="h6">{isValid(new Date(dateKey)) ? format(new Date(dateKey), 'MMMM do, yyyy') : 'Invalid Date'}</Typography>
            {groupedRotas[dateKey].map(rota => (
              <Typography key={rota.id} variant="body1">
                {`Staff: ${teamMembers.find((member) => member.id === rota.staffId)?.name || 'Unknown'} is appointed for ${isValid(new Date(rota.start)) ? format(new Date(rota.start), 'h:mm a') : 'Unknown'} to ${isValid(new Date(rota.end)) ? format(new Date(rota.end), 'h:mm a') : 'Unknown'} for ${eventGroups.find((event) => event.id === rota.eventId)?.name || 'Unknown'}.`}
              </Typography>
            ))}
          </Card>
        ))}
      </Box>

      <Modal open={open} onClose={handleClose}>
        <Box 
          component="form" 
          onSubmit={handleFormSubmit} 
          sx={{ 
            position: 'absolute', 
            top: '50%', 
            left: '50%', 
            transform: 'translate(-50%, -50%)', 
            width: 400, 
            bgcolor: 'background.paper', 
            border: '2px solid #000', 
            boxShadow: 24, 
            p: 4 
          }}
        >
          <Typography variant="h6" component="h2">{selectedMember ? 'Edit Team Member' : 'Add Team Member'}</Typography>
          <TextField
            fullWidth
            label="Name"
            name="name"
            value={formValues.name}
            onChange={handleInputChange}
            variant="outlined"
            margin="normal"
          />
          <TextField
            fullWidth
            label="Age"
            name="age"
            type="number"
            value={formValues.age}
            onChange={handleInputChange}
            variant="outlined"
            margin="normal"
          />
          <TextField
            fullWidth
            label="Phone"
            name="phone"
            value={formValues.phone}
            onChange={handleInputChange}
            variant="outlined"
            margin="normal"
          />
          <TextField
            fullWidth
            label="Email"
            name="email"
            value={formValues.email}
            onChange={handleInputChange}
            variant="outlined"
            margin="normal"
          />
          <TextField
            select
            fullWidth
            label="Position"
            name="position"
            value={formValues.position}
            onChange={handleInputChange}
            variant="standard"
            InputProps={{
              disableUnderline: true,
              style: { color: colors.grey[100], backgroundColor: 'transparent' }
            }}
          >
            {positions.map((option) => (
              <MenuItem key={option} value={option}>
                {option}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            select
            fullWidth
            label="Access Level"
            name="access"
            value={formValues.access}
            onChange={handleInputChange}
            variant="outlined"
            margin="normal"
          >
            <MenuItem value="admin">Admin</MenuItem>
            <MenuItem value="manager">Manager</MenuItem>
            <MenuItem value="user">User</MenuItem>
          </TextField>
          <Box mt="20px" display="flex" justifyContent="flex-end">
            <Button type="submit" variant="contained" color="primary">
              {selectedMember ? 'Save Changes' : 'Add Member'}
            </Button>
          </Box>
        </Box>
      </Modal>
    </Box>
  );
};

const QuickSearchToolbar = ({ value, onChange, clearSearch }) => (
  <Box sx={{ p: 0.5, pb: 0 }}>
    <TextField
      variant="standard"
      value={value}
      onChange={onChange}
      placeholder="Search…"
      InputProps={{
        startAdornment: <SearchIcon fontSize="small" />,
        endAdornment: (
          <IconButton
            title="Clear"
            aria-label="Clear"
            size="small"
            style={{ visibility: value ? 'visible' : 'hidden' }}
            onClick={clearSearch}
          >
            <ClearIcon fontSize="small" />
          </IconButton>
        ),
      }}
      sx={{ width: 250 }}
    />
  </Box>
);

export default ManageTeams;
