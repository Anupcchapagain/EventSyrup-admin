// ExpenseGroup.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Box, Button, TextField, Typography, Card, Modal, Snackbar, IconButton, MenuItem } from "@mui/material";
import AddIcon from '@mui/icons-material/Add';
import CloseIcon from '@mui/icons-material/Close';
import DeleteIcon from '@mui/icons-material/Delete';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useTheme } from '@mui/material/styles';
import { tokens } from '../../theme';
import { db } from '../../firebase';
import { collection, addDoc, getDoc, getDocs, query, where, deleteDoc, doc } from 'firebase/firestore';
import { useAuth } from '../../AuthContext';
import Header from '../../components/Header'; // Add this line to import Header

const categories = ['Food', 'Transport', 'Lodging', 'Others'];
const mainCategories = ['Event', 'Staff', 'Participant'];

const ExpenseGroup = () => {
  const { groupId } = useParams();
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const [formValues, setFormValues] = useState({
    title: '',
    category: '',
    mainCategory: '',
    amount: '',
    description: ''
  });
  const [expenses, setExpenses] = useState([]);
  const [groupName, setGroupName] = useState('');
  const [groupBudget, setGroupBudget] = useState(0);
  const [open, setOpen] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [error, setError] = useState(null);

  useEffect(() => {
    if (currentUser) {
      fetchGroupDetails();
      fetchExpenses();
    }
  }, [currentUser]);

  const fetchGroupDetails = async () => {
    try {
      const groupDoc = await getDoc(doc(db, "expenseGroups", groupId));
      if (groupDoc.exists()) {
        setGroupName(groupDoc.data().name);
        setGroupBudget(groupDoc.data().budget);
      } else {
        console.error("No such document!");
      }
    } catch (e) {
      setError(e.message);
      console.error("Error fetching group details: ", e);
    }
  };

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const handleSnackbarClose = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setSnackbarOpen(false);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormValues({
      ...formValues,
      [name]: value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    const now = new Date();
    const date = now.toISOString().split('T')[0];
    const time = now.toTimeString().split(' ')[0];

    try {
      const docRef = await addDoc(collection(db, "expenses"), {
        ...formValues,
        userId: currentUser.uid,
        date,
        time,
        groupId
      });
      setExpenses([...expenses, { ...formValues, id: docRef.id, date, time, groupId }]);
      setFormValues({
        title: '',
        category: '',
        mainCategory: '',
        amount: '',
        description: ''
      });
      setSnackbarMessage('Expense saved');
      setSnackbarOpen(true);
      handleClose();
    } catch (e) {
      setError(e.message);
      console.error("Error adding document: ", e);
    }
  };

  const fetchExpenses = async () => {
    setError(null);
    try {
      const q = query(collection(db, "expenses"), where("userId", "==", currentUser.uid), where("groupId", "==", groupId));
      const querySnapshot = await getDocs(q);
      const expensesData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setExpenses(expensesData);
    } catch (e) {
      setError(e.message);
      console.error("Error fetching documents: ", e);
    }
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
      console.error("Error deleting document: ", e);
    }
  };

  const calculateTotalExpenses = () => {
    return expenses.reduce((total, expense) => total + parseFloat(expense.amount || 0), 0);
  };

  const handleBackClick = () => {
    navigate(-1); // Navigate back to the previous page
  };

  return (
    <Box m="20px">
      <Box display="flex" alignItems="center">
        <IconButton onClick={handleBackClick} sx={{ marginRight: '8px' }}>
          <ArrowBackIcon />
        </IconButton>
        <Header title={`${groupName} Expenses`} subtitle="" />
      </Box>

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
          <AddIcon sx={{ fontSize: '80px', color: colors.greenAccent[500] }} />
          <Typography variant="h6" sx={{ mt: 1 }}>Add Expense</Typography>
        </Card>
      </Box>

      <Modal open={open} onClose={handleClose}>
        <Box 
          component="form" 
          onSubmit={handleSubmit} 
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
          <Typography variant="h6" component="h2">Add Expense</Typography>
          <TextField
            fullWidth
            label="Expense Title"
            name="title"
            value={formValues.title}
            onChange={handleInputChange}
            variant="outlined"
            margin="normal"
          />
          <TextField
            select
            fullWidth
            label="Main Category"
            name="mainCategory"
            value={formValues.mainCategory}
            onChange={handleInputChange}
            variant="outlined"
            margin="normal"
          >
            {mainCategories.map((option) => (
              <MenuItem key={option} value={option}>
                {option}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            select
            fullWidth
            label="Expense Category"
            name="category"
            value={formValues.category}
            onChange={handleInputChange}
            variant="outlined"
            margin="normal"
          >
            {categories.map((option) => (
              <MenuItem key={option} value={option}>
                {option}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            fullWidth
            label="Amount"
            name="amount"
            type="number"
            value={formValues.amount}
            onChange={handleInputChange}
            variant="outlined"
            margin="normal"
            InputProps={{
              startAdornment: <Typography>£</Typography>,
            }}
          />
          <Typography color="textSecondary" variant="body2" sx={{ mt: 2 }}>
            Budget: £{groupBudget}
          </Typography>
          <Typography color="textSecondary" variant="body2" sx={{ mt: 2 }}>
            Total Expenses: £{calculateTotalExpenses() + parseFloat(formValues.amount || 0)}
          </Typography>
          <Box mt="20px" display="flex" justifyContent="flex-end">
            <Button type="submit" variant="contained" color="primary">
              Save this Expense
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
        <Typography variant="h5" fontWeight="600">
          Recent Expenses
        </Typography>
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

export default ExpenseGroup;
