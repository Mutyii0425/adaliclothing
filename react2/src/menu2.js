import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Box, Button, Drawer, IconButton } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

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
  

  return (
    <Drawer anchor="left" open={sideMenuActive} onClose={toggleSideMenu}>
      <Box
        sx={{
          width: 250,
          padding: '20px',
          display: 'flex',
          flexDirection: 'column',
          gap: '15px',
        }}
      >
        <IconButton onClick={toggleSideMenu} sx={{ alignSelf: 'flex-end' }}>
          <CloseIcon />
        </IconButton>
        <Button component={Link} to="/" sx={{ fontSize: '20px', color: '#333' }}>
          Kezdőlap
        </Button>
        <Button component={Link} to="/oterm" sx={{ fontSize: '20px', color: '#333' }}>
          Termékek
        </Button>
        <Button component={Link} to="/add" sx={{ textAlign:'center', fontSize: '20px', color: '#333' }}>
          Töltsd fel a ruháidat
        </Button>
        <Button component={Link} to="/vinted" sx={{ textAlign:'center', fontSize: '20px', color: '#333' }}>
          Felhasznalók által feltöltött ruhák
        </Button>
        <Button component={Link} to="/vision" sx={{ textAlign:'center', fontSize: '20px', color: '#333' }}>
          Termék Tanácsadó
        </Button>
        <Button component={Link} to="/rolunk" sx={{ textAlign:'center', fontSize: '20px', color: '#333' }}>
          Rólunk
        </Button>
        {isAdmin && (
          <Button 
            component={Link} 
            to="/admin" 
            sx={{ 
              textAlign: 'center', 
              fontSize: '20px', 
              color: '#fff',
              backgroundColor: '#60BA97',
              '&:hover': {
                backgroundColor: '#4e9d7e'
              }
            }}
          >
            Admin Felület
          </Button>
        )}
      </Box>
    </Drawer>
  );
};

export default Menu;
