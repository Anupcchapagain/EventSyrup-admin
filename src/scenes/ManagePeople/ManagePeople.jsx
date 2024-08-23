import React, { useState, useEffect } from 'react';
import { Box, Button, TextField, Typography, Modal, Select, MenuItem, CircularProgress, Card, CardContent, IconButton } from '@mui/material';
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { getFirestore, doc, setDoc, collection, query, where, getDocs, deleteDoc } from "firebase/firestore";
import Animation from './Animation';
import Header from '../../components/Header';
import CloseIcon from '@mui/icons-material/Close';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';

const auth = getAuth();
const db = getFirestore();

const ManagePeople = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [scanStatus, setScanStatus] = useState(null);
  const [rfid, setRfid] = useState('');
  const [personType, setPersonType] = useState('');
  const [personId, setPersonId] = useState('');
  const [personName, setPersonName] = useState('');
  const [personEmail, setPersonEmail] = useState('');
  const [personPhone, setPersonPhone] = useState('');
  const [people, setPeople] = useState([]);
  const [teamMembers, setTeamMembers] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, user => {
      if (user) {
        setUser(user);
        fetchTeamMembers(user.uid);
        fetchPeople(user.uid);
      } else {
        setUser(null);
      }
    });
    return () => unsubscribe();
  }, []);

  const fetchPeople = async (userId) => {
    try {
      const q = query(collection(db, 'RFIDs'), where('userId', '==', userId));
      const querySnapshot = await getDocs(q);
      const peopleData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setPeople(peopleData);
    } catch (error) {
      console.error('Error fetching people:', error);
    }
  };

  const fetchTeamMembers = async (userId) => {
    try {
      const q = query(collection(db, 'teamMembers'), where('userId', '==', userId));
      const querySnapshot = await getDocs(q);
      const teamData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setTeamMembers(teamData);
    } catch (error) {
      console.error('Error fetching team members:', error);
    }
  };

  const handleAssignRFID = async () => {
    if (user && rfid && personType) {
      setLoading(true);
      setScanStatus('scanning');
      try {
        let assignedName;
        if (personType === 'staff') {
          assignedName = teamMembers.find(member => member.id === personId)?.name;
        } else if (personType === 'audience') {
          assignedName = `${personName} (Audience)`;
        }
  
        // Use the RFID as the document ID
        const rfidDoc = doc(db, 'RFIDs', rfid.trim());
        await setDoc(rfidDoc, {
          rfid: rfid.trim(), // The actual UID from the RFID card
          personType,
          personId: personType === 'staff' ? personId : rfidDoc.id,
          personName: assignedName,
          personEmail: personType === 'audience' ? personEmail : '',
          personPhone: personType === 'audience' ? personPhone : '',
          userId: user.uid
        });
  
        setScanStatus('success');
        fetchPeople(user.uid); // Refresh the list
        resetForm(); // Reset the form fields
      } catch (error) {
        console.error('Error assigning RFID:', error);
        setScanStatus('failure');
      } finally {
        setLoading(false);
      }
    } else {
      setScanStatus('failure');
    }
  };

  const resetForm = () => {
    setRfid('');
    setPersonType('');
    setPersonId('');
    setPersonName('');
    setPersonEmail('');
    setPersonPhone('');
    setScanStatus(null);
  };

  const handleScanRFID = async () => {
    setLoading(true);
    setScanStatus('scanning');
    setTimeout(async () => {
      try {
        const scannedRfid = await readRFID(); // Fetch the RFID from the Raspberry Pi

        setRfid(scannedRfid); // Set the RFID to the actual scanned value
        handleAssignRFID();
      } catch (error) {
        console.error('Error scanning RFID:', error);
        setScanStatus('failure');
      } finally {
        setLoading(false);
      }
    }, 2000);
  };

  const readRFID = async () => {
    try {
      const response = await fetch('http://192.168.1.84:5000/scan_rfid'); // Ensure this URL is correct
      const data = await response.json();
      return data.rfid_uid; // Return the actual RFID UID from the server
    } catch (error) {
      console.error('Error fetching RFID UID:', error);
      throw new Error('Failed to read RFID.');
    }
  };

  const handleDeleteRFID = async (id) => {
    try {
      await deleteDoc(doc(db, 'RFIDs', id));
      fetchPeople(user.uid); // Refresh the list
    } catch (error) {
      console.error('Error deleting RFID:', error);
    }
  };

  return (
    <Box m="20px">
      <Header title="Manage People" subtitle="Assign RFID cards to staff and audience members" />
      <Box 
        onClick={() => setModalOpen(true)}
        sx={{ 
          cursor: 'pointer', 
          width: '200px', 
          height: '200px', 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          backgroundColor: 'rgba(0, 255, 0, 0.1)', 
          border: `2px dashed #4caf50`, 
          borderRadius: '10px',
          '&:hover': {
            backgroundColor: 'rgba(0, 255, 0, 0.2)',
          }
        }}
      >
        <AddIcon sx={{ fontSize: '80px', color: '#4caf50' }} />
      </Box>
      <Box display="flex" flexWrap="wrap" gap={2} mt={2}>
        {people.map(person => (
          <Card key={person.id} sx={{ width: 300, cursor: 'pointer', position: 'relative' }}>
            <CardContent>
              <Typography variant="h6">{person.personName}</Typography>
              <Typography color="textSecondary">{person.personType}</Typography>
              <IconButton 
                onClick={(e) => {
                  e.stopPropagation();
                  handleDeleteRFID(person.id);
                }}
                sx={{ position: 'absolute', top: 8, right: 8 }}
              >
                <DeleteIcon />
              </IconButton>
            </CardContent>
          </Card>
        ))}
      </Box>
      <Modal open={modalOpen} onClose={() => setModalOpen(false)}>
        <Box 
          display="flex" 
          flexDirection="column" 
          justifyContent="center" 
          alignItems="center"
          p={4} 
          bgcolor="background.paper" 
          boxShadow={3} 
          borderRadius={8}
          width={400}
          mx="auto"
          mt="10%"
        >
          <IconButton 
            onClick={() => {
              resetForm();
              setModalOpen(false);
            }} 
            sx={{ alignSelf: 'flex-end' }}
          >
            <CloseIcon />
          </IconButton>
          <Typography variant="h6" mb={2}>Assign RFID Card</Typography>
          <Select
            value={personType}
            onChange={(e) => setPersonType(e.target.value)}
            displayEmpty
            fullWidth
            margin="dense"
          >
            <MenuItem value="" disabled>Select person type</MenuItem>
            <MenuItem value="staff">Staff</MenuItem>
            <MenuItem value="audience">Audience</MenuItem>
          </Select>
          {personType === 'staff' && (
            <Select
              value={personId}
              onChange={(e) => setPersonId(e.target.value)}
              displayEmpty
              fullWidth
              margin="dense"
            >
              <MenuItem value="" disabled>Select staff member</MenuItem>
              {teamMembers.map(member => (
                <MenuItem key={member.id} value={member.id}>
                  {member.name}
                </MenuItem>
              ))}
            </Select>
          )}
          {personType === 'audience' && (
            <>
              <TextField
                label="Name"
                fullWidth
                margin="dense"
                value={personName}
                onChange={(e) => setPersonName(e.target.value)}
              />
              <TextField
                label="Email"
                fullWidth
                margin="dense"
                value={personEmail}
                onChange={(e) => setPersonEmail(e.target.value)}
              />
              <TextField
                label="Phone"
                fullWidth
                margin="dense"
                value={personPhone}
                onChange={(e) => setPersonPhone(e.target.value)}
              />
            </>
          )}
          <Button 
            variant="contained" 
            color="primary" 
            onClick={handleScanRFID} 
            disabled={loading}
            sx={{ mt: 2 }}
          >
            {loading ? <CircularProgress size={24} /> : 'Scan RFID'}
          </Button>
          {scanStatus === 'scanning' && <CircularProgress sx={{ mt: 2 }} />}
          {scanStatus === 'success' && <Animation type="success" />}
          {scanStatus === 'failure' && <Animation type="failure" />}
        </Box>
      </Modal>
    </Box>
  );
};

export default ManagePeople;
