// AddExpenses.jsx
import React, { useState, useEffect } from 'react';
import { Box, Button, TextField, Typography, Card, Modal, Snackbar, IconButton } from "@mui/material";
import AddIcon from '@mui/icons-material/Add';
import CloseIcon from '@mui/icons-material/Close';
import DeleteIcon from '@mui/icons-material/Delete';
import { useTheme } from '@mui/material/styles';
import { tokens } from '../../theme';
import { db } from '../../firebase';
import { collection, addDoc, getDocs, query, where, deleteDoc, doc } from 'firebase/firestore';
import { useAuth } from '../../AuthContext';
import { useNavigate } from 'react-router-dom';

const AddExpenses = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const [groupFormValues, setGroupFormValues] = useState({ name: '', budget: '' });
  const [groups, setGroups] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [open, setOpen] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [error, setError] = useState(null);

  useEffect(() => {
    if (currentUser) {
      fetchGroups();
      fetchExpenses();
    }
  }, [currentUser]);

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const handleSnackbarClose = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setSnackbarOpen(false);
  };

  const handleGroupInputChange = (e) => {
    const { name, value } = e.target;
    setGroupFormValues({
      ...groupFormValues,
      [name]: value
    });
  };

  const handleGroupSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    try {
      const docRef = await addDoc(collection(db, "expenseGroups"), {
        ...groupFormValues,
        userId: currentUser.uid,
        budget: parseFloat(groupFormValues.budget)
      });
      setGroups([...groups, { ...groupFormValues, id: docRef.id, budget: parseFloat(groupFormValues.budget) }]);
      setGroupFormValues({ name: '', budget: '' });
      setSnackbarMessage('Group created');
      setSnackbarOpen(true);
      handleClose();
    } catch (e) {
      setError(e.message);
      console.error("Error adding group: ", e);
    }
  };

  const fetchGroups = async () => {
    setError(null);
    try {
      const q = query(collection(db, "expenseGroups"), where("userId", "==", currentUser.uid));
      const querySnapshot = await getDocs(q);
      const groupsData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setGroups(groupsData);
    } catch (e) {
      setError(e.message);
      console.error("Error fetching groups: ", e);
    }
  };

  const fetchExpenses = async () => {
    setError(null);
    try {
      const q = query(collection(db, "expenses"), where("userId", "==", currentUser.uid));
      const querySnapshot = await getDocs(q);
      const expensesData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setExpenses(expensesData);
    } catch (e) {
      setError(e.message);
      console.error("Error fetching expenses: ", e);
    }
  };

  const deleteGroup = async (id) => {
    setError(null);
    try {
      await deleteDoc(doc(db, "expenseGroups", id));
      setGroups(groups.filter(group => group.id !== id));
      setSnackbarMessage('Group deleted');
      setSnackbarOpen(true);
    } catch (e) {
      setError(e.message);
      console.error("Error deleting group: ", e);
    }
  };

  const navigateToGroup = (groupId) => {
    navigate(`/group/${groupId}`);
  };

  const deleteExpense = async (id) => {
    setError(null);
    try {
      await deleteDoc(doc(db, "expenses", id));
      setExpenses(expenses.filter(expense => expense.id !== id));
      setSnackbarMessage('Expense deleted');
      setSnackbarOpen(true);
    } catch (e) {
      setError(e.message);
      console.error("Error deleting expense: ", e);
    }
  };

  return (
    <Box m="20px">
      <Typography variant="h4">Manage Expense Groups</Typography>

      <Box display="flex" justifyContent="flex-start" alignItems="center" mt="20px" mb="40px">
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
            },
          }}
        >
          <AddIcon sx={{ fontSize: '80px', color: colors.greenAccent[500] }} />
          <Typography variant="h6" sx={{ mt: 1 }}>Add Group</Typography>
        </Card>

        {groups.map((group) => (
          <Box key={group.id} sx={{ position: 'relative', marginLeft: '20px' }}>
            <Card
              sx={{
                cursor: 'pointer',
                width: '200px',
                height: '200px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                backgroundColor: 'rgba(0, 255, 0, 0.1)',
                border: `2px solid ${colors.greenAccent[500]}`,
                borderRadius: '10px',
                padding: '16px',
                '&:hover': {
                  backgroundColor: 'rgba(0, 255, 0, 0.2)',
                },
                position: 'relative',
              }}
            >
              <Typography sx={{ fontSize: '20px', color: colors.greenAccent[500] }}>{group.name}</Typography>
              <Typography sx={{ fontSize: '16px', color: colors.greenAccent[500] }}>
                Budget: £{parseFloat(group.budget).toFixed(2)}
              </Typography>
              <Box className="hover-buttons" sx={{ display: 'flex', flexDirection: 'column', position: 'absolute', top: '10px', right: '10px' }}>
                <Button
                  variant="contained"
                  color="primary"
                  size="small"
                  onClick={() => navigateToGroup(group.id)}
                  sx={{ marginBottom: '8px' }}
                >
                  Open Group
                </Button>
                <Button
                  variant="contained"
                  color="secondary"
                  size="small"
                  onClick={() => deleteGroup(group.id)}
                >
                  Delete Group
                </Button>
              </Box>
            </Card>
          </Box>
        ))}
      </Box>

      <Modal open={open} onClose={handleClose}>
        <Box
          component="form"
          onSubmit={handleGroupSubmit}
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: 400,
            bgcolor: 'background.paper',
            border: '2px solid #000',
            boxShadow: 24,
            p: 4,
          }}
        >
          <Typography variant="h6" component="h2">Create Expense Group</Typography>
          <TextField
            fullWidth
            label="Group Name"
            name="name"
            value={groupFormValues.name}
            onChange={handleGroupInputChange}
            variant="outlined"
            margin="normal"
          />
          <TextField
            fullWidth
            label="Budget"
            name="budget"
            type="number"
            value={groupFormValues.budget}
            onChange={handleGroupInputChange}
            variant="outlined"
            margin="normal"
            InputProps={{
              startAdornment: <Typography>£</Typography>,
            }}
          />
          <Box mt="20px" display="flex" justifyContent="flex-end">
            <Button type="submit" variant="contained" color="primary">
              Create Group
            </Button>
          </Box>
        </Box>
      </Modal>

      {error && (
        <Box mt="20px" color="red">
          <Typography variant="body1">{error}</Typography>
        </Box>
      )}

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
        message={snackbarMessage}
        action={
          <>
            <IconButton size="small" aria-label="close" color="inherit" onClick={handleSnackbarClose}>
              <CloseIcon fontSize="small" />
            </IconButton>
          </>
        }
      />

      <Box mt="20px">
        <Typography variant="h5" fontWeight="600">Recent Expenses</Typography>
        {expenses.map((expense) => (
          <Box
            key={expense.id}
            display="flex"
            justifyContent="space-between"
            alignItems="center"
            borderBottom={`4px solid ${colors.primary[500]}`}
            p="15px"
            mt="10px"
          >
            <Box>
              <Typography
                color={colors.greenAccent[500]}
                variant="h5"
                fontWeight="600"
              >
                {expense.title}
              </Typography>
              <Typography color={colors.grey[100]}>
                {expense.category} ({expense.mainCategory})
              </Typography>
              <Typography color={colors.grey[100]}>
                {expense.date} {expense.time}
              </Typography>
              <Typography color={colors.grey[100]}>
                Group: {groups.find(group => group.id === expense.groupId)?.name}
              </Typography>
            </Box>
            <Box display="flex" alignItems="center">
              <Typography
                color={colors.greenAccent[500]}
                variant="h6"
                fontWeight="600"
                sx={{
                  backgroundColor: colors.primary[500],
                  padding: "5px 10px",
                  borderRadius: "4px",
                  marginRight: "10px",
                }}
              >
                £{expense.amount}
              </Typography>
              <IconButton
                onClick={() => deleteExpense(expense.id)}
                sx={{ color: colors.redAccent[500] }}
              >
                <DeleteIcon />
              </IconButton>
            </Box>
          </Box>
        ))}
      </Box>
    </Box>
  );
};

export default AddExpenses;
