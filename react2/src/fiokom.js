import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Box, 
  Container, 
  Typography, 
  Card, 
  CardContent,
  Avatar,
  Grid,
  Paper,
  Divider,
  IconButton,
  FormGroup,
  FormControlLabel,
  Switch,
  Badge,
  Stack
} from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';
import MenuIcon from '@mui/icons-material/Menu';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import SecurityIcon from '@mui/icons-material/Security';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import Menu from './menu2';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';


export default function Fiokom() {
  const [userData, setUserData] = useState(null);
  const [darkMode, setDarkMode] = useState(true);
  const [sideMenuActive, setSideMenuActive] = useState(false);
  const navigate = useNavigate();
  const cartItems = JSON.parse(localStorage.getItem('cartItems')) || [];
  const cartItemCount = cartItems.reduce((total, item) => total + item.mennyiseg, 0);
  

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user'));
    console.log("Retrieved user data:", user); 
    if (user) {
      setUserData({
        email: user.email,
        username: user.username
      });
    }
  }, []);
  

  const [orderStats, setOrderStats] = useState({
    totalOrders: 0,
    totalAmount: 0,
    lastOrderDate: null
  });
  
 useEffect(() => {
  const user = JSON.parse(localStorage.getItem('user'));
  if (user && user.f_azonosito) {
    fetch(`http://localhost:5000/api/order-stats/${user.f_azonosito}`)
      .then(res => res.json())
      .then(data => {
        console.log('Fetched order stats:', data); 
        setOrderStats({
          totalOrders: data.totalOrders || 0,
          totalAmount: data.totalAmount || 0,
          lastOrderDate: data.lastOrderDate
        });
      })
      .catch(err => console.log('Hiba:', err));
  }
}, []);
  

  const toggleSideMenu = () => {
    setSideMenuActive(!sideMenuActive);
  };

  const handleCartClick = () => {
    navigate('/kosar');
  };

  return (
    <Box sx={{ 
      backgroundColor: darkMode ? '#222' : '#f5f5f5',
      minHeight: '100vh',
      pb: 4,
      position: 'relative',
      '&::before': {
        content: '""',
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: darkMode ? '#333' : '#f5f5f5',
  backgroundImage: darkMode 
    ? 'radial-gradient(#444 1px, transparent 1px)'
    : 'radial-gradient(#e0e0e0 1px, transparent 1px)',
  backgroundSize: '20px 20px',
  color: darkMode ? 'white' : 'black',
  minHeight: '100vh',
  transition: 'all 0.3s ease-in-out' 
      }
    }}>
      <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              backgroundColor: darkMode ? '#333' : '#333',
              padding: '10px 20px',
              position: 'relative',
              width: '100%',
              boxSizing: 'border-box',
              borderBottom: '3px solid #ffffff', 
              boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)', 
              marginBottom: '10px', 
            }}
          >
            <IconButton
              onClick={toggleSideMenu}
              style={{ color: darkMode ? 'white' : 'white' }}
            >
              <MenuIcon />
            </IconButton>
          
            <Typography 
                 variant="h1"
                 sx={{
                   fontWeight: 'bold',
                   fontSize: {
                    xs: '1.1rem',    
                    sm: '1.5rem',    
                    md: '2rem'     
                  },
                   textAlign: 'center',
                   color: 'white',
                   position: 'absolute',
                  left: '50%',
                   transform: 'translateX(-50%)',
                   width: 'auto',
                   pointerEvents: 'none'
                 }}
               >
                 Adali Clothing
               </Typography>
        <IconButton
          onClick={handleCartClick}
          sx={{
            color: '#fff',
            '&:hover': {
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
            }
          }}
        >
          <Badge 
            badgeContent={cartItemCount} 
            color="primary"
            sx={{ 
              '& .MuiBadge-badge': { 
                backgroundColor: '#fff', 
                color: '#333' 
              } 
            }}
          >
            <ShoppingCartIcon />
          </Badge>
        </IconButton>
      </div>

      <Box sx={{
        position: 'fixed',
        top: 0,
        left: sideMenuActive ? 0 : '-250px',
        width: '250px',
        height: '100%',
        backgroundColor: '#fff',
        transition: 'left 0.3s',
        zIndex: 1200,
      }}>
        <Menu sideMenuActive={sideMenuActive} toggleSideMenu={toggleSideMenu} />
      </Box>

      <FormGroup sx={{ position: 'absolute', top: 60, right: 0, zIndex: 1 }}>
        <FormControlLabel
          control={
            <Switch
              checked={darkMode}
              onChange={() => setDarkMode(!darkMode)}
              color="primary"
            />
          }
          label={<Typography sx={{ color: darkMode ? 'white' : 'black' }}>Dark Mode</Typography>}
        />
      </FormGroup>

      <Container maxWidth="lg" sx={{ 
        mt: 8,
        backgroundColor: darkMode ? '#333' : '#f0f0f0',
        borderRadius: '16px',
        padding: '24px',
        position: 'relative',
        zIndex: 1,
        boxShadow: '0 8px 24px rgba(0,0,0,0.12)'
      }}>
        <Grid container spacing={4}>
          <Grid item xs={12} md={4}>
            <Card sx={{ 
              backgroundColor: darkMode ? '#1c1c1c' : 'white',
              color: darkMode ? 'white' : 'black',
              borderRadius: '16px',
              height: '100%'
            }}>
              <CardContent sx={{ textAlign: 'center', py: 4 }}>
                <Avatar 
                  sx={{ 
                    width: 120, 
                    height: 120, 
                    margin: '0 auto 20px',
                    backgroundColor: '#1976d2',
                    fontSize: '3rem'
                  }}
                >
                  {userData?.username?.charAt(0)?.toUpperCase() || 'A'}
                </Avatar>
                <Typography variant="h5" gutterBottom sx={{ fontWeight: 600 }}>
                  {userData?.username || 'Felhasználó'}
                </Typography>
                
                <Typography variant="body1" sx={{ color: darkMode ? '#aaa' : '#666' }}>
                  {userData?.email || 'Email cím nincs megadva'}
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={8}>
            <Stack spacing={3}>
              <Paper sx={{ 
                p: 3, 
                backgroundColor: darkMode ? '#1c1c1c' : 'white',
                color: darkMode ? 'white' : 'black',
                borderRadius: '16px'
              }}>
                <Typography variant="h6" gutterBottom sx={{ 
                  display: 'flex', 
                  alignItems: 'center',
                  gap: 1,
                  color: '#1976d2'
                }}>
                  <PersonIcon /> Személyes Információk
                </Typography>
                <Divider sx={{ my: 2 }} />
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle2" sx={{ color: darkMode ? '#aaa' : '#666' }}>
                      Felhasználónév
                    </Typography>
                    <Typography variant="body1" sx={{ mt: 1 }}>
                      {userData?.username || 'Nincs megadva'}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle2" sx={{ color: darkMode ? '#aaa' : '#666' }}>
                      Email Cím
                    </Typography>
                    <Typography variant="body1" sx={{ mt: 1 }}>
                      {userData?.email || 'Nincs megadva'}
                    </Typography>
                  </Grid>
                </Grid>
              </Paper>

              <Paper sx={{
  p: 3,
  backgroundColor: darkMode ? '#1c1c1c' : 'white',
  color: darkMode ? 'white' : 'black',
  borderRadius: '16px'
}}>
  <Typography variant="h6" gutterBottom sx={{
    display: 'flex',
    alignItems: 'center',
    gap: 1,
    color: '#1976d2'
  }}>
    <SecurityIcon /> Fiók Statisztika
  </Typography>
  <Divider sx={{ my: 2 }} />
  <Grid container spacing={3}>
  <Grid item xs={6} md={4}>
  <Box sx={{ textAlign: 'center' }}>
    <LocalShippingIcon sx={{ fontSize: 40, color: '#1976d2', mb: 1 }} />
    <Typography variant="h6">{orderStats.totalOrders} db</Typography>
    <Typography variant="body2">Leadott rendelések</Typography>
  </Box>
</Grid>

<Grid item xs={6} md={4}>
  <Box sx={{ textAlign: 'center' }}>
    <AttachMoneyIcon sx={{ fontSize: 40, color: '#1976d2', mb: 1 }} />
    <Typography variant="h6">
      {typeof orderStats.totalAmount === 'number' ? orderStats.totalAmount.toLocaleString() : '0'} Ft
    </Typography>
    <Typography variant="body2">Összes rendelés értéke</Typography>
  </Box>
</Grid>


<Grid item xs={6} md={4}>
  <Box sx={{ textAlign: 'center' }}>
    <CalendarTodayIcon sx={{ fontSize: 40, color: '#1976d2', mb: 1 }} />
    <Typography variant="h6">
      {orderStats.lastOrderDate ? new Date(orderStats.lastOrderDate).toLocaleDateString() : '-'}
    </Typography>
    <Typography variant="body2">Utolsó rendelés dátuma</Typography>
  </Box>
</Grid>

</Grid>
</Paper>
            </Stack>
          </Grid>
          
        </Grid>
        
      </Container>
    </Box>
    
  );
}