import React, { useState, useContext, useEffect } from 'react';
import { Box, IconButton, Badge, Menu, MenuItem, Typography, Button, TextField, InputAdornment } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { useNavigate } from 'react-router-dom';
import { signOut, updateEmail, updatePassword, reauthenticateWithCredential, EmailAuthProvider } from 'firebase/auth';
import { collection, query, orderBy, onSnapshot, deleteDoc, doc } from 'firebase/firestore';
import { auth, db } from '../../firebase';
import { ColorModeContext, tokens } from '../../theme';
import LightModeOutlinedIcon from "@mui/icons-material/LightModeOutlined";
import DarkModeOutlinedIcon from "@mui/icons-material/DarkModeOutlined";
import NotificationsOutlinedIcon from "@mui/icons-material/NotificationsOutlined";
import SettingsOutlinedIcon from "@mui/icons-material/SettingsOutlined";
import LogoutOutlinedIcon from "@mui/icons-material/LogoutOutlined";
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';

const Topbar = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const colorMode = useContext(ColorModeContext);
  const navigate = useNavigate();

  const [notificationCount, setNotificationCount] = useState(0);
  const [notifications, setNotifications] = useState([]);
  const [notificationAnchorEl, setNotificationAnchorEl] = useState(null);
  const notificationOpen = Boolean(notificationAnchorEl);

  const [settingsAnchorEl, setSettingsAnchorEl] = useState(null);
  const settingsOpen = Boolean(settingsAnchorEl);

  const [newEmail, setNewEmail] = useState(auth.currentUser.email);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);

  useEffect(() => {
    const q = query(
      collection(db, 'notifications'),
      orderBy('timestamp', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const newNotifications = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));

      setNotifications(newNotifications);
      if (!notificationOpen) {
        setNotificationCount(newNotifications.length);
      }
    });

    return () => unsubscribe();
  }, [notificationOpen]);

  const handleNotificationClick = (event) => {
    setNotificationAnchorEl(event.currentTarget);
    setNotificationCount(0);
  };

  const handleNotificationClose = () => {
    setNotificationAnchorEl(null);
  };

  const handleSettingsClick = (event) => {
    setSettingsAnchorEl(event.currentTarget);
  };

  const handleSettingsClose = () => {
    setSettingsAnchorEl(null);
    setIsUpdatingPassword(false); // Reset the password update state when closing settings
  };

  const handleUpdateEmail = async () => {
    try {
      await updateEmail(auth.currentUser, newEmail);
      alert('Email updated successfully');
    } catch (error) {
      alert('Error updating email: ' + error.message);
    }
  };

  const handleUpdatePassword = () => {
    setIsUpdatingPassword(true);
    setNewPassword('');
    setConfirmPassword('');
  };

  const handleSaveNewPassword = async () => {
    if (newPassword !== confirmPassword) {
      alert('Passwords do not match');
      return;
    }

    try {
      // Re-authenticate the user before updating the password
      const credential = EmailAuthProvider.credential(
        auth.currentUser.email,
        currentPassword
      );
      await reauthenticateWithCredential(auth.currentUser, credential);

      // Now update the password
      await updatePassword(auth.currentUser, newPassword);
      alert('Password updated successfully');
      setIsUpdatingPassword(false);
    } catch (error) {
      if (error.code === 'auth/wrong-password') {
        alert('The current password is incorrect.');
      } else {
        alert('Error updating password: ' + error.message);
      }
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/login');
    } catch (error) {
      console.error("Error signing out: ", error);
    }
  };

  const handleClearAll = async () => {
    try {
      const batch = notifications.map(notification =>
        deleteDoc(doc(db, 'notifications', notification.id))
      );
      await Promise.all(batch);
      setNotificationAnchorEl(null);
    } catch (error) {
      console.error('Error clearing notifications: ', error);
    }
  };

  const toggleShowPassword = () => {
    setShowPassword(!showPassword);
  };

  return (
    <Box display="flex" justifyContent="space-between" p={2}>
      <Box></Box>

      <Box display="flex">
        <IconButton onClick={colorMode.toggleColorMode}>
          {theme.palette.mode === "dark" ? (
            <DarkModeOutlinedIcon />
          ) : (
            <LightModeOutlinedIcon />
          )}
        </IconButton>

        <IconButton onClick={handleNotificationClick}>
          <Badge badgeContent={notificationCount} color="error">
            <NotificationsOutlinedIcon />
          </Badge>
        </IconButton>
        <Menu
          anchorEl={notificationAnchorEl}
          open={notificationOpen}
          onClose={handleNotificationClose}
          PaperProps={{
            sx: {
              width: 300,
              maxWidth: '100%',
            },
          }}
        >
          <Box display="flex" justifyContent="space-between" alignItems="center" p={1}>
            <Typography variant="h6">Notifications</Typography>
            <Button size="small" onClick={handleClearAll}>Clear All</Button>
          </Box>
          {notifications.length === 0 ? (
            <MenuItem onClick={handleNotificationClose}>
              <Typography>No notifications available</Typography>
            </MenuItem>
          ) : (
            notifications.map((notification) => (
              <MenuItem key={notification.id} onClick={handleNotificationClose}>
                <Typography>{notification.message}</Typography>
              </MenuItem>
            ))
          )}
        </Menu>

        <IconButton onClick={handleSettingsClick}>
          <SettingsOutlinedIcon />
        </IconButton>
        <Menu
          anchorEl={settingsAnchorEl}
          open={settingsOpen}
          onClose={handleSettingsClose}
          PaperProps={{
            sx: {
              padding: 2,
              width: 300,
              maxWidth: '100%',
            },
          }}
        >
          {[
            <Typography key="account-title" variant="h6" align="center" gutterBottom>
              Account Settings
            </Typography>,
            <TextField
              key="email-field"
              label="Email"
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              fullWidth
              margin="normal"
            />,
            <Button
              key="update-email-button"
              onClick={handleUpdateEmail}
              variant="contained"
              fullWidth
              sx={{ mb: 2 }}
            >
              Update Email
            </Button>,
            !isUpdatingPassword && (
              <Button
                key="update-password-button"
                onClick={handleUpdatePassword}
                variant="contained"
                fullWidth
              >
                Update Password
              </Button>
            ),
            isUpdatingPassword && (
              <div key="password-fields">
                <TextField
                  label="Current Password"
                  type={showPassword ? 'text' : 'password'}
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  fullWidth
                  margin="normal"
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton onClick={toggleShowPassword}>
                          {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
                <TextField
                  label="New Password"
                  type={showPassword ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  fullWidth
                  margin="normal"
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton onClick={toggleShowPassword}>
                          {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
                <TextField
                  label="Confirm Password"
                  type={showPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  fullWidth
                  margin="normal"
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton onClick={toggleShowPassword}>
                          {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
                <Button
                  onClick={handleSaveNewPassword}
                  variant="contained"
                  fullWidth
                >
                  Save New Password
                </Button>
              </div>
            )
          ]}
        </Menu>

        <IconButton onClick={handleLogout}>
          <LogoutOutlinedIcon />
        </IconButton>
      </Box>
    </Box>
  );
};

export default Topbar;
