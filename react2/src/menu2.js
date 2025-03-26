import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Box,
  Button,
  Drawer,
  IconButton,
  Typography,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Avatar
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import HomeIcon from '@mui/icons-material/Home';
import ShoppingBagIcon from '@mui/icons-material/ShoppingBag';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import PeopleIcon from '@mui/icons-material/People';
import VisibilityIcon from '@mui/icons-material/Visibility';
import InfoIcon from '@mui/icons-material/Info';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import logo from './kep/fehlogo5.png'; 

const Menu = ({ sideMenuActive, toggleSideMenu }) => {
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const checkAdminStatus = () => {
      const userData = localStorage.getItem('user');
      if (userData) {
        const user = JSON.parse(userData);
        setIsAdmin(user.email === 'adaliclothing@gmail.com');
      }
    };
    
    checkAdminStatus();
  }, []);
  

  const menuItems = [
    { text: 'Kezdőlap', icon: <HomeIcon />, path: '/' },
    { text: 'Termékek', icon: <ShoppingBagIcon />, path: '/oterm' },
    { text: 'Töltsd fel a ruháidat', icon: <CloudUploadIcon />, path: '/add' },
    { text: 'Felhasználók által feltöltött ruhák', icon: <PeopleIcon />, path: '/vinted' },
    { text: 'Termék Tanácsadó', icon: <VisibilityIcon />, path: '/vision' },
    { text: 'Rólunk', icon: <InfoIcon />, path: '/rolunk' }
  ];

  return (
    <Drawer 
      anchor="left" 
      open={sideMenuActive} 
      onClose={toggleSideMenu}
      PaperProps={{
        sx: {
          width: 280,
          background: 'linear-gradient(to bottom, #2d2d2d, #1a1a1a)',
          color: '#fff',
          boxShadow: '0 0 20px rgba(0,0,0,0.3)'
        }
      }}
    >
      <Box sx={{ 
        display: 'flex', 
        flexDirection: 'column', 
        height: '100%' 
      }}>
    
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between',
          p: 2,
          borderBottom: '1px solid rgba(255,255,255,0.1)'
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Avatar 
              src={logo} 
              alt="Adali Clothing" 
              sx={{ 
                width: 40, 
                height: 40,
                backgroundColor: 'rgba(255,255,255,0.1)'
              }} 
            />
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              Adali Clothing
            </Typography>
          </Box>
          <IconButton 
            onClick={toggleSideMenu} 
            sx={{ 
              color: '#fff',
              '&:hover': {
                backgroundColor: 'rgba(255,255,255,0.1)'
              }
            }}
          >
            <CloseIcon />
          </IconButton>
        </Box>


        <List sx={{ flexGrow: 1, px: 1, py: 2 }}>
          {menuItems.map((item, index) => (
            <ListItem 
              key={index} 
              component={Link} 
              to={item.path}
              onClick={toggleSideMenu}
              sx={{
                borderRadius: '10px',
                mb: 1,
                color: '#fff',
                '&:hover': {
                  backgroundColor: 'rgba(255,255,255,0.1)',
                  transform: 'translateX(5px)',
                  transition: 'transform 0.2s ease-in-out'
                },
                transition: 'all 0.2s ease-in-out'
              }}
            >
              <ListItemIcon sx={{ color: '#60BA97', minWidth: '40px' }}>
                {item.icon}
              </ListItemIcon>
              <ListItemText 
                primary={item.text} 
                primaryTypographyProps={{ 
                  fontSize: '0.95rem',
                  fontWeight: 500
                }} 
              />
            </ListItem>
          ))}
        </List>


        {isAdmin && (
          <Box sx={{ p: 2 }}>
            <Divider sx={{ mb: 2, borderColor: 'rgba(255,255,255,0.1)' }} />
            <Button 
              component={Link} 
              to="/admin" 
              onClick={toggleSideMenu}
              startIcon={<AdminPanelSettingsIcon />}
              sx={{ 
                width: '100%',
                py: 1.2,
                textAlign: 'center', 
                fontSize: '0.95rem', 
                fontWeight: 600,
                color: '#fff',
                backgroundColor: '#60BA97',
                borderRadius: '10px',
                '&:hover': {
                  backgroundColor: '#4e9d7e',
                  boxShadow: '0 4px 12px rgba(96,186,151,0.3)'
                },
                transition: 'all 0.2s ease'
              }}
            >
              Admin Felület
            </Button>
          </Box>
        )}
      </Box>
    </Drawer>
  );
};

export default Menu;
