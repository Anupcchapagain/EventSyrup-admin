import React, { useState, useEffect } from 'react';
import { Box, Button, TextField, Modal, MenuItem, Typography, Card } from '@mui/material';
import { ArrowBack as ArrowBackIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { addDoc, collection, query, where, getDocs, doc, updateDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import { useAuth } from '../../AuthContext';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider, MobileTimePicker } from '@mui/x-date-pickers';
import { format, parse, startOfWeek, getDay, isValid } from 'date-fns';

const locales = {
  'en-US': require('date-fns/locale/en-US')
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales
});

const Rota = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [events, setEvents] = useState([]);
  const [teamMembers, setTeamMembers] = useState([]);
  const [eventGroups, setEventGroups] = useState([]);
  const [selectedEventGroup, setSelectedEventGroup] = useState('');
  const [selectedTeamMember, setSelectedTeamMember] = useState('');
  const [shiftStart, setShiftStart] = useState(new Date());
  const [shiftEnd, setShiftEnd] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [rotaGroups, setRotaGroups] = useState([]);

  useEffect(() => {
    if (currentUser) {
      fetchEventGroups();
      fetchTeamMembers();
      fetchEvents();
    }
  }, [currentUser]);

  useEffect(() => {
    if (events.length) {
      groupEventsByDate(events);
    }
  }, [events]);

  const fetchEventGroups = async () => {
    if (currentUser) {
      const q = query(collection(db, 'expenseGroups'), where('userId', '==', currentUser.uid));
      const querySnapshot = await getDocs(q);
      const eventData = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setEventGroups(eventData);
    }
  };

  const fetchTeamMembers = async () => {
    if (currentUser) {
      const q = query(collection(db, 'teamMembers'), where('userId', '==', currentUser.uid));
      const querySnapshot = await getDocs(q);
      const teamData = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setTeamMembers(teamData);
    }
  };

  const fetchEvents = async () => {
    if (currentUser) {
      const q = query(collection(db, 'rotas'), where('userId', '==', currentUser.uid));
      const querySnapshot = await getDocs(q);
      const eventsData = querySnapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          ...data,
          start: data.start?.toDate ? data.start.toDate() : new Date(data.start),
          end: data.end?.toDate ? data.end.toDate() : new Date(data.end),
          title: `${data.staffId} - ${data.eventId}`, // Temporary title until names are resolved
          id: doc.id
        };
      });
      setEvents(eventsData);
    }
  };

  const groupEventsByDate = (eventsData) => {
    const groups = eventsData.reduce((acc, event) => {
      const dateKey = isValid(new Date(event.start)) ? format(new Date(event.start), 'yyyy-MM-dd') : 'Invalid Date';
      if (!acc[dateKey]) {
        acc[dateKey] = [];
      }
      acc[dateKey].push(event);
      return acc;
    }, {});
    setRotaGroups(groups);
  };

  const handleOpen = () => setOpen(true);
  const handleClose = () => {
    setOpen(false);
    setSelectedEventGroup('');
    setSelectedTeamMember('');
    setShiftStart(new Date());
    setShiftEnd(new Date());
  };

  const handleEventSelect = ({ start }) => {
    setSelectedDate(start);
    handleOpen();
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    const rotaData = {
      eventId: selectedEventGroup,
      staffId: selectedTeamMember,
      start: shiftStart,
      end: shiftEnd,
      userId: currentUser.uid
    };
    await addDoc(collection(db, 'rotas'), rotaData);
    fetchEvents(); // Refresh the events
    handleClose();
  };

  const handleBack = () => {
    navigate('/team');
  };

  const handleRotaEdit = async (rota) => {
    setSelectedEventGroup(rota.eventId);
    setSelectedTeamMember(rota.staffId);
    setShiftStart(rota.start);
    setShiftEnd(rota.end);
    setOpen(true);
  };

  const getTitle = (eventId, staffId) => {
    const eventName = eventGroups.find(event => event.id === eventId)?.name || 'Unknown';
    const staffName = teamMembers.find(member => member.id === staffId)?.name || 'Unknown';
    return `${staffName} - ${eventName}`;
  };

  useEffect(() => {
    setEvents(prevEvents => 
      prevEvents.map(event => ({
        ...event,
        title: getTitle(event.eventId, event.staffId)
      }))
    );
  }, [teamMembers, eventGroups]);

  return (
    <Box m="20px">
      <Button startIcon={<ArrowBackIcon />} onClick={handleBack}>
        Back
      </Button>
      <Calendar
        localizer={localizer}
        events={events}
        startAccessor="start"
        endAccessor="end"
        style={{ height: 500, margin: '50px' }}
        selectable
        onSelectSlot={handleEventSelect}
      />
      <Typography variant="h6" component="h2" mt="20px">
        Event Groups
      </Typography>
      <Box>
        {Object.keys(rotaGroups).map((dateKey) => (
          <Card key={dateKey} sx={{ mb: 2, p: 2, border: `1px solid green`, borderRadius: '10px', backgroundColor: 'rgba(0, 255, 0, 0.1)' }}>
            <Typography variant="h6">{isValid(new Date(dateKey)) ? format(new Date(dateKey), 'MMMM do, yyyy') : 'Invalid Date'}</Typography>
            {rotaGroups[dateKey].map((rota) => (
              <Box key={rota.id}>
                <Typography variant="body1">
                  {`Staff: ${teamMembers.find((member) => member.id === rota.staffId)?.name || 'Unknown'} is appointed for ${isValid(new Date(rota.start)) ? format(new Date(rota.start), 'h:mm a') : 'Unknown'} to ${isValid(new Date(rota.end)) ? format(new Date(rota.end), 'h:mm a') : 'Unknown'} for ${eventGroups.find((event) => event.id === rota.eventId)?.name || 'Unknown'}.`}
                </Typography>
                <Button onClick={() => handleRotaEdit(rota)} color="primary" sx={{ mt: 1 }}>
                  Edit
                </Button>
              </Box>
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
          <Typography variant="h6" component="h2">
            Add/Edit Rota
          </Typography>
          <TextField
            select
            fullWidth
            label="Event Group"
            name="eventGroup"
            value={selectedEventGroup}
            onChange={(e) => setSelectedEventGroup(e.target.value)}
            variant="outlined"
            margin="normal"
          >
            {eventGroups.map((event) => (
              <MenuItem key={event.id} value={event.id}>
                {event.name}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            select
            fullWidth
            label="Staff"
            name="staffId"
            value={selectedTeamMember}
            onChange={(e) => setSelectedTeamMember(e.target.value)}
            variant="outlined"
            margin="normal"
          >
            {teamMembers.map((member) => (
              <MenuItem key={member.id} value={member.id}>
                {member.name}
              </MenuItem>
            ))}
          </TextField>
          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <MobileTimePicker
              label="Shift Start"
              value={shiftStart}
              onChange={setShiftStart}
              renderInput={(params) => <TextField {...params} fullWidth margin="normal" />}
            />
            <MobileTimePicker
              label="Shift End"
              value={shiftEnd}
              onChange={setShiftEnd}
              renderInput={(params) => <TextField {...params} fullWidth margin="normal" />}
            />
          </LocalizationProvider>
          <Button type="submit" variant="contained" color="primary">
            Save Rota
          </Button>
        </Box>
      </Modal>
    </Box>
  );
};

export default Rota;
