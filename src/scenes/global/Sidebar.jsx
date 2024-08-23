// src/components/Sidebar.jsx
import { useState } from "react";
import { ProSidebar, Menu, MenuItem } from "react-pro-sidebar";
import "react-pro-sidebar/dist/css/styles.css";
import { Box, IconButton, Typography, useTheme } from "@mui/material";
import { Link } from "react-router-dom";
import HomeOutlinedIcon from "@mui/icons-material/HomeOutlined";
import PeopleOutlinedIcon from "@mui/icons-material/PeopleOutlined";
import ContactsOutlinedIcon from "@mui/icons-material/ContactsOutlined";
import ReceiptOutlinedIcon from "@mui/icons-material/ReceiptOutlined";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import MenuOutlinedIcon from "@mui/icons-material/MenuOutlined";
import { tokens } from "../../theme";

const Sidebar = ({ isSidebar }) => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const [collapsed, setCollapsed] = useState(false);

  return (
    <Box
      sx={{
        height: "100vh", // Ensure the sidebar takes full screen height
        display: "flex",
        flexDirection: "column", // Arrange items in a column
        justifyContent: "space-between", // Space items evenly
        "& .pro-sidebar-inner": {
          background: `${colors.primary[400]} !important`,
        },
        "& .pro-icon-wrapper": {
          backgroundColor: "transparent !important",
        },
        "& .pro-inner-item": {
          padding: "5px 35px 5px 20px !important",
        },
        "& .pro-inner-item:hover": {
          color: "#868dfb !important",
        },
        "& .pro-menu-item.active": {
          color: "#6870fa !important",
        },
      }}
    >
      <ProSidebar collapsed={collapsed} style={{ height: "100%" }}>
        <Menu
          iconShape="square"
          style={{
            display: "flex",
            flexDirection: "column",
            height: "100%", // Take full height of sidebar
            justifyContent: "space-between", // Space out items evenly
          }}
        >
          <MenuItem
            onClick={() => setCollapsed(!collapsed)}
            icon={collapsed ? <MenuOutlinedIcon /> : undefined}
            style={{
              margin: "10px 0 20px 0",
              color: colors.grey[100],
            }}
          >
            {!collapsed && (
              <Box
                display="flex"
                justifyContent="space-between"
                alignItems="center"
                ml="15px"
              >
                <Typography variant="h3" color={colors.grey[100]}>
                  Event Syrup
                </Typography>
                <IconButton onClick={() => setCollapsed(!collapsed)}>
                  <MenuOutlinedIcon />
                </IconButton>
              </Box>
            )}
          </MenuItem>

          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-around", // Distribute items evenly
              flexGrow: 1,
            }}
          >
            <MenuItem
              icon={<HomeOutlinedIcon />}
              style={{ color: colors.grey[100] }}
            >
              <Typography>Dashboard</Typography>
              <Link to="/" />
            </MenuItem>
            <MenuItem
              icon={<AttachMoneyIcon />}
              style={{ color: colors.grey[100] }}
            >
              <Typography>Add Expense</Typography>
              <Link to="/add-expense" />
            </MenuItem>
            <MenuItem
              icon={<PeopleOutlinedIcon />}
              style={{ color: colors.grey[100] }}
            >
              <Typography>Manage Team</Typography>
              <Link to="/team" />
            </MenuItem>
            <MenuItem
              icon={<ContactsOutlinedIcon />}
              style={{ color: colors.grey[100] }}
            >
              <Typography>Manage People</Typography>
              <Link to="/manage-people" />
            </MenuItem>
            <MenuItem
              icon={<ReceiptOutlinedIcon />}
              style={{ color: colors.grey[100] }}
            >
              <Typography>Calendar</Typography>
              <Link to="/calendar" />
            </MenuItem>
          </Box>
        </Menu>
      </ProSidebar>
    </Box>
  );
};

export default Sidebar;
