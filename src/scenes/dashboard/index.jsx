import React, { useState, useEffect } from 'react';
import { Box, Button, Typography, Switch, FormControl, InputLabel, Select, MenuItem } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { tokens } from "../../theme";
import GroupIcon from "@mui/icons-material/Group";
import RecentActorsIcon from "@mui/icons-material/RecentActors";
import WorkIcon from "@mui/icons-material/Work";
import PoundIcon from '@mui/icons-material/CurrencyPound';
import Header from "../../components/Header";
import StatBox from "../../components/StatBox";
import { format } from 'date-fns';
import { useAuth } from "../../AuthContext";
import { collection, query, where, getDocs, serverTimestamp ,addDoc} from 'firebase/firestore';
import { db } from '../../firebase';
import { Bar } from 'react-chartjs-2';
import 'chart.js/auto'; 

const ColdIcon = () => (
  <svg width="50" height="50" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 2C11.45 2 11 2.45 11 3V8.58L9.71 7.29C9.32 6.9 8.69 6.9 8.29 7.29C7.9 7.68 7.9 8.31 8.29 8.71L10.59 11H5C4.45 11 4 11.45 4 12C4 12.55 4.45 13 5 13H10.59L8.29 15.29C7.9 15.68 7.9 16.31 8.29 16.71C8.68 17.1 9.31 17.1 9.71 16.71L11 15.42V21C11 21.55 11.45 22 12 22C12.55 22 13 21.55 13 21V15.42L14.29 16.71C14.68 17.1 15.31 17.1 15.71 16.71C16.1 16.31 16.1 15.68 15.71 15.29L13.41 13H19C19.55 13 20 12.55 20 12C20 11.45 19.55 11 19 11H13.41L15.71 8.71C16.1 8.32 16.1 7.69 15.71 7.29C15.32 6.9 14.69 6.9 14.29 7.29L13 8.58V3C13 2.45 12.55 2 12 2Z" fill="#0000FF"/>
  </svg>
);

const WarmIcon = () => (
  <svg width="50" height="50" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M17 5C17 4.45 16.55 4 16 4H8C7.45 4 7 4.45 7 5V19C7 19.55 7.45 20 8 20H16C16.55 20 17 19.55 17 19V5ZM10 18H14V6H10V18ZM12 1C12.55 1 13 1.45 13 2V3C13 3.55 12.55 4 12 4C11.45 4 11 3.55 11 3V2C11 1.45 11.45 1 12 1ZM6 22C6.55 22 7 22.45 7 23V24C7 24.55 6.55 25 6 25C5.45 25 5 24.55 5 24V23C5 22.45 5.45 22 6 22ZM18 22C18.55 22 19 22.45 19 23V24C19 24.55 18.55 25 18 25C17.45 25 17 24.55 17 24V23C17 22.45 17.45 22 18 22ZM4 13H2V14C2 14.55 2.45 15 3 15H4V13ZM20 13V14C20 14.55 20.45 15 21 15H22V13H20ZM3 10C2.45 10 2 9.55 2 9V8H3C3.55 8 4 8.45 4 9C4 9.55 3.55 10 3 10ZM21 8V9C21 9.55 20.55 10 20 10H19C18.45 10 18 9.55 18 9V8H21ZM12 5C11.45 5 11 5.45 11 6V7C11 7.55 11.45 8 12 8C12.55 8 13 7.55 13 7V6C13 5.45 12.55 5 12 5Z" fill="#FF9900"/>
  </svg>
);

const HotIcon = () => (
  <svg width="50" height="50" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 2C11.45 2 11 2.45 11 3V8.58L9.71 7.29C9.32 6.9 8.69 6.9 8.29 7.29C7.9 7.68 7.9 8.31 8.29 8.71L10.59 11H5C4.45 11 4 11.45 4 12C4 12.55 4.45 13 5 13H10.59L8.29 15.29C7.9 15.68 7.9 16.31 8.29 16.71C8.68 17.1 9.31 17.1 9.71 16.71L11 15.42V21C11 21.55 11.45 22 12 22C12.55 22 13 21.55 13 21V15.42L14.29 16.71C14.68 17.1 15.31 17.1 15.71 16.71C16.1 16.31 16.1 15.68 15.71 15.29L13.41 13H19C19.55 13 20 12.55 20 12C20 11.45 19.55 11 19 11H13.41L15.71 8.71C16.1 8.32 16.1 7.69 15.71 7.29C15.32 6.9 14.69 6.9 14.29 7.29L13 8.58V3C13 2.45 12.55 2 12 2Z" fill="#FF0000"/>
  </svg>
);

const Dashboard = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const { currentUser } = useAuth();
  const emailPrefix = currentUser?.email.split('@')[0];
  const [setExpectedStaff] = useState(0);
  const [ setScannedStaff] = useState(0);

  const [totalExpenses, setTotalExpenses] = useState(0);
  const [expensesData, setExpensesData] = useState([]);
  const [totalBudget, setTotalBudget] = useState(0);
  const [groups, setGroups] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState('');
  const categories = ['Food', 'Transport', 'Lodging', 'Others'];
  const [recentParticipants, setRecentParticipants] = useState([]);
  const [isRFIDReaderActive, setIsRFIDReaderActive] = useState(false);
  const [rfidScanInterval, setRFIDScanInterval] = useState(null);

 

  const [lighting, setLighting] = useState({
    red: false,
    green: false,
    blue: false,
  });

  const handleLightingChange = async (color) => {
    const updatedLighting = {
      ...lighting,
      [color]: !lighting[color],
    };
    setLighting(updatedLighting);

    await fetch('http://192.168.1.84:5000/set_color', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        red: updatedLighting.red ? 1 : 0,
        green: updatedLighting.green ? 1 : 0,
        blue: updatedLighting.blue ? 1 : 0,
      }),
    });
  };

  const [temperature, setTemperature] = useState(25);
  const [temperatureError, setTemperatureError] = useState('');

  useEffect(() => {
    if (currentUser) {
      fetchExpenses();
      fetchGroups();
      fetchTemperature();
      fetchTodaysRota();
      fetchScannedStaff();
    }
  }, [currentUser, selectedGroup]);

  const fetchTodaysRota = async () => {
    const today = format(new Date(), 'yyyy-MM-dd');
    const q = query(
      collection(db, 'rotas'),
      where('start', '>=', new Date(today)),
      where('end', '<=', new Date(today + 'T23:59:59'))
    );

    const querySnapshot = await getDocs(q);
    setExpectedStaff(querySnapshot.docs.length);
  };

  const fetchScannedStaff = async () => {
    const today = format(new Date(), 'yyyy-MM-dd');
    const q = query(
      collection(db, 'recentParticipants'),
      where('timestamp', '>=', new Date(today)),
      where('timestamp', '<=', new Date(today + 'T23:59:59')),
      where('personType', '==', 'staff') 
    );

    const querySnapshot = await getDocs(q);
    setScannedStaff(querySnapshot.docs.length);
  };


  const fetchTemperature = async () => {
    try {
      const response = await fetch('http://192.168.1.84:5000/temperature');
      const data = await response.json();
      if (data.error) {
        setTemperatureError(data.error);
      } else {
        setTemperature(data.temperature);
        setTemperatureError('');
      }
    } catch (error) {
      console.error('Error fetching temperature:', error);
      setTemperatureError('Error fetching temperature data');
    }
  };

  const fetchExpenses = async () => {
    let q = query(collection(db, "expenses"), where("userId", "==", currentUser.uid));
    if (selectedGroup) {
      q = query(q, where("groupId", "==", selectedGroup));
    }
    const querySnapshot = await getDocs(q);
    const expenses = querySnapshot.docs.map(doc => doc.data());

    const expensesByCategory = categories.map(category => {
      return expenses
        .filter(expense => expense.category === category)
        .reduce((total, expense) => total + parseFloat(expense.amount || 0), 0);
    });

    const total = expenses.reduce((total, expense) => total + parseFloat(expense.amount || 0), 0);

    setExpensesData(expensesByCategory);
    setTotalExpenses(total);
  };

  const fetchGroups = async () => {
    const q = query(collection(db, "expenseGroups"), where("userId", "==", currentUser.uid));
    const querySnapshot = await getDocs(q);
    const groups = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    const totalBudget = groups.reduce((total, group) => total + parseFloat(group.budget || 0), 0);
    setGroups(groups);
    setTotalBudget(totalBudget);
  };

  const logNotification = async (message) => {
    try {
      await addDoc(collection(db, 'notifications'), {
        message: message,
        timestamp: serverTimestamp(),
      });
    } catch (error) {
      console.error('Error logging notification:', error);
    }
  };

  const fetchRecentParticipant = async (rfid) => {
    try {
      const alreadyExists = recentParticipants.some(participant => participant.rfid === rfid);
      
      if (alreadyExists) {
        console.log('RFID already scanned:', rfid);
        return;
      }
  
      const q = query(collection(db, 'RFIDs'), where('rfid', '==', rfid));
      const querySnapshot = await getDocs(q);
      if (!querySnapshot.empty) {
        const participantData = querySnapshot.docs[0].data();
  
        setRecentParticipants(prevParticipants => {
          if (!prevParticipants.some(participant => participant.rfid === rfid)) {
            const updatedParticipants = [
              ...prevParticipants,
              { ...participantData, rfid: rfid, timestamp: new Date() }
            ];
  
            // Log the notification for every participant
            logNotification(`${participantData.personName} has tapped in.`);
  
            return updatedParticipants;
          } else {
            return prevParticipants;
          }
        });
      } else {
        console.log('No matching participant found.');
      }
    } catch (error) {
      console.error('Error fetching recent participant:', error);
    }
  };
  

const handleScan = (rfid) => {
    console.log(`RFID scanned: ${rfid}`);
    fetchRecentParticipant(rfid);  // Call the updated function
};

const handleRFIDToggle = async () => {
    const newStatus = !isRFIDReaderActive;
    setIsRFIDReaderActive(newStatus);

    if (newStatus) {
        const interval = setInterval(async () => {
            try {
                const response = await fetch('http://192.168.1.84:5000/scan_rfid');  
                const data = await response.json();
                console.log("Response data:", data);  // Log the entire response data

                if (response.ok && data.rfid_uid) {  // Use "rfid_uid" instead of "rfid"
                    const rfid = data.rfid_uid.trim();  // Use "rfid_uid" instead of "rfid"
                    console.log(`Received RFID from server: ${rfid}`);
                    handleScan(rfid);  // Handle the scanned RFID
                } else {
                    console.error('Error fetching scanned RFID:', data.error);
                }
            } catch (error) {
                console.error('Error fetching scanned RFID:', error);
            }
        }, 5000);

        setRFIDScanInterval(interval);
    } else {
        clearInterval(rfidScanInterval);
        setRFIDScanInterval(null);
    }
};


  

  const getTemperatureIcon = (temp) => {
    if (temp <= 0) return <ColdIcon />;
    if (temp > 0 && temp <= 25) return <WarmIcon />;
    return <HotIcon />;
  };

  const getTemperatureColor = (temp) => {
    if (temp <= 0) return colors.blueAccent[500];
    if (temp > 0 && temp <= 25) return colors.greenAccent[500];
    return colors.redAccent[500];
  };

  return (
    <Box m="20px">
      {/* HEADER */}
      <Box display="flex" justifyContent="space-between" alignItems="center">
        <Header title={`Hi, ${emailPrefix}`} subtitle="Welcome to your dashboard" />

        <Box>
          <Button
            sx={{
              backgroundColor: isRFIDReaderActive ? colors.redAccent[700] : colors.greenAccent[700],
              color: colors.grey[100],
              fontSize: "14px",
              fontWeight: "bold",
              padding: "10px 20px",
            }}
            onClick={handleRFIDToggle}
          >
            {isRFIDReaderActive ? 'Deactivate RFID' : 'Activate RFID'}
          </Button>
        </Box>
      </Box>

      {/* GRID & CHARTS */}
      <Box
        display="grid"
        gridTemplateColumns="repeat(12, 1fr)"
        gridAutoRows="minmax(140px, auto)"
        gap="20px"
      >
        {/* ROW 1 */}
        <Box
  gridColumn="span 3"
  backgroundColor={colors.primary[400]}
  display="flex"
  alignItems="center"
  justifyContent="center"
>
  <StatBox
    title={recentParticipants.length}
    subtitle="Total Participants"
    
    icon={
      <GroupIcon
        sx={{ color: colors.greenAccent[600], fontSize: "26px" }}
      />
    }
  />
</Box>
        <Box
          gridColumn="span 3"
          backgroundColor={colors.primary[400]}
          display="flex"
          alignItems="center"
          justifyContent="center"
        >
          <StatBox
            title={`£${totalExpenses.toFixed(2)}`}
            subtitle="Expenses"
            progress={totalBudget ? totalExpenses / totalBudget : 0}
            increase={`${totalBudget ? ((totalExpenses / totalBudget) * 100).toFixed(0) : 0}%`}
            icon={
              <PoundIcon
                sx={{ color: colors.greenAccent[600], fontSize: "26px" }}
              />
            }
          />
        </Box>
        <Box
  gridColumn="span 3"
  backgroundColor={colors.primary[400]}
  display="flex"
  alignItems="center"
  justifyContent="center"
>
  <StatBox
    title={recentParticipants.filter(participant => participant.personType === 'audience').length}
    subtitle="Total Audience"
    icon={
      <RecentActorsIcon
        sx={{ color: colors.greenAccent[600], fontSize: "26px" }}
      />
    }
  />
</Box>


<Box
  gridColumn="span 3"
  backgroundColor={colors.primary[400]}
  display="flex"
  alignItems="center"
  justifyContent="center"
>
  <StatBox
    title={recentParticipants.filter(participant => participant.personType === 'staff').length}
    subtitle="Staff Working"
    icon={
      <WorkIcon
        sx={{ color: colors.greenAccent[600], fontSize: "26px" }}
      />
    }
  />
</Box>


        {/* ROW 2 */}
        <Box
          gridColumn="span 8"
          gridRow="span 2"
          backgroundColor={colors.primary[400]}
        >
          <Box
            mt="25px"
            p="0 30px"
            display="flex"
            justifyContent="space-between"
            alignItems="center"
          >
            <Box>
              <Typography
                variant="h5"
                fontWeight="600"
                color={colors.grey[100]}
              >
                Your Expenses
              </Typography>
              <Typography
                variant="h3"
                fontWeight="bold"
                color={colors.greenAccent[500]}
              >
                £{totalExpenses.toFixed(2)}
              </Typography>
            </Box>
            <Box>
              <FormControl variant="outlined" sx={{ minWidth: 120 }}>
                <InputLabel id="group-select-label">Group</InputLabel>
                <Select
                  labelId="group-select-label"
                  id="group-select"
                  value={selectedGroup}
                  onChange={(e) => setSelectedGroup(e.target.value)}
                  label="Group"
                >
                  <MenuItem value="">
                    <em>All</em>
                  </MenuItem>
                  {groups.map((group) => (
                    <MenuItem key={group.id} value={group.id}>
                      {group.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>
          </Box>
          <Box height="calc(100% - 70px)">
            <Bar
              data={{
                labels: categories,
                datasets: [
                  {
                    label: 'Expenses',
                    data: expensesData,
                    backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0'],
                  },
                ],
              }}
              options={{
                responsive: true,
                scales: {
                  x: {
                    beginAtZero: true,
                  },
                  y: {
                    beginAtZero: true,
                  },
                },
              }}
            />
          </Box>
        </Box>

        {/* Recent Participants In */}
        <Box
          gridColumn="span 4"
          gridRow="span 2"
          backgroundColor={colors.primary[400]}
          overflow="auto"
        >
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
            borderBottom={`4px solid ${colors.primary[500]}`}
            colors={colors.grey[100]}
            p="15px"
          >
            <Typography color={colors.grey[100]} variant="h5" fontWeight="600">
              Recent Participants In
            </Typography>
          </Box>
          {recentParticipants.map((participant, index) => (
            <Box
              key={index}
              display="flex"
              justifyContent="space-between"
              alignItems="center"
              borderBottom={`4px solid ${colors.primary[500]}`}
              p="15px"
            >
              <Box>
                <Typography
                  color={colors.greenAccent[500]}
                  variant="h5"
                  fontWeight="600"
                >
                  {participant.personName}
                </Typography>
                <Typography color={colors.grey[100]}>
                  {participant.personEmail}
                </Typography>
                <Typography color={colors.grey[100]}>
                  {participant.personPhone}
                </Typography>
              </Box>
              <Typography
                color={colors.greenAccent[500]}
                variant="h6"
                fontWeight="600"
                sx={{
                  backgroundColor: colors.primary[500],
                  padding: "5px 10px",
                  borderRadius: "4px",
                }}
              >
                {new Date(participant.timestamp).toLocaleTimeString()}
              </Typography>
            </Box>
          ))}
        </Box>

        {/* ROW 3 */}


        <Box
          gridColumn="span 6"
          gridRow="span 2"
          backgroundColor={colors.primary[400]}
          p="30px"
        >
          <Typography
            variant="h5"
            fontWeight="600"
            sx={{ marginBottom: "15px" }}
          >
            Lighting Control
          </Typography>
          <Box display="flex" flexDirection="column" gap="10px">
            {['red', 'green', 'blue'].map((color) => (
              <Box
                key={color}
                display="flex"
                justifyContent="space-between"
                alignItems="center"
              >
                <Typography color={colors.grey[100]} variant="h6">
                  {color.charAt(0).toUpperCase() + color.slice(1)} Light
                </Typography>
                <Switch
                  checked={lighting[color]}
                  onChange={() => handleLightingChange(color)}
                  sx={{
                    '& .MuiSwitch-switchBase.Mui-checked': {
                      color: colors[color + 'Accent'][600],
                    },
                    '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                      backgroundColor: colors[color + 'Accent'][500],
                    },
                  }}
                />
              </Box>
            ))}
          </Box>
        </Box>

        <Box
          gridColumn="span 6"
          gridRow="span 2"
          backgroundColor={colors.primary[400]}
          p="30px"
          display="flex"
          flexDirection="column"
          alignItems="center"
        >
          <Typography
            variant="h5"
            fontWeight="600"
            sx={{ marginBottom: "15px" }}
          >
            Temperature Monitoring
          </Typography>
          <Box
            display="flex"
            flexDirection="column"
            alignItems="center"
            flex="1"
            color={getTemperatureColor(temperature)}
          >
            {getTemperatureIcon(temperature)}
            <Typography
              variant="h3"
              fontWeight="bold"
              sx={{ mt: "15px" }}
            >
              {temperatureError ? temperatureError : `${temperature}°C`}
            </Typography>
            <Typography>Detected Temperature</Typography>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default Dashboard;