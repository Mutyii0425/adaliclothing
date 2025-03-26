import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Menu from './menu2';
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Button,
  IconButton,
  Grid,
  FormGroup,
  FormControlLabel,
  Switch,
  Popper,
  Grow,
  Paper,
  ClickAwayListener,
  MenuList,
  MenuItem,
  Badge
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import DeleteIcon from '@mui/icons-material/Delete';
import { useNavigate } from 'react-router-dom';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';

const imageMap = {};
const images = require.context('../../adaliclothing-mvc/backend/kep', false, /\.(png|jpg|jpeg)$/);
images.keys().forEach((key) => {
  const imageName = key.replace('./', '');
  imageMap[imageName] = images(key);
});

export default function Kosar() {
  const [darkMode, setDarkMode] = useState(true);
  const [sideMenuActive, setSideMenuActive] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [open, setOpen] = useState(false);
  const anchorRef = React.useRef(null);
  const [deleteAlert, setDeleteAlert] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const navigate = useNavigate();
  const [userName, setUserName] = useState('');
  const [quantityAlert, setQuantityAlert] = useState(false);
  const [showLogoutAlert, setShowLogoutAlert] = useState(false);
  const [quantityMessage, setQuantityMessage] = useState('');
  const [cartItems, setCartItems] = useState([]);
  const cartItemCount = cartItems.reduce((total, item) => total + item.mennyiseg, 0);
  const [totalPrice, setTotalPrice] = useState(0);

  useEffect(() => {    const items = JSON.parse(localStorage.getItem('cartItems')) || [];
    setCartItems(items);
  }, []);

  useEffect(() => {
    const newTotal = cartItems.reduce((sum, item) => sum + (item.ar * item.mennyiseg), 0);
    setTotalPrice(newTotal);
  }, [cartItems]);

  useEffect(() => {
    const checkLoginStatus = () => {
      const userData = localStorage.getItem('user');
      if (userData) {
        const user = JSON.parse(userData);
        setIsLoggedIn(true);
        setUserName(user.username || user.felhasznalonev || 'Felhasználó');
      }
    };
    checkLoginStatus();
  }, []);

  const handleQuantityChange = (id, increase) => {
    const updatedItems = cartItems.map(item => {
      if (item.id === id) {
        const newQuantity = increase ? item.mennyiseg + 1 : Math.max(1, item.mennyiseg - 1);
        setQuantityMessage(increase ? 'Mennyiség növelve' : 'Mennyiség csökkentve');
        setQuantityAlert(true);
        setTimeout(() => setQuantityAlert(false), 1500);
        return {
          ...item,
          mennyiseg: newQuantity
        };
      }
      return item;
    });
    setCartItems(updatedItems);
    localStorage.setItem('cartItems', JSON.stringify(updatedItems));
  };

  const handleRemoveItem = (id) => {
    setItemToDelete(id);
    setDeleteAlert(true);
  };

  const confirmDelete = () => {
    const updatedItems = cartItems.filter(item => item.id !== itemToDelete);
    setCartItems(updatedItems);
    localStorage.setItem('cartItems', JSON.stringify(updatedItems));
    setDeleteAlert(false);
  };

   
const handleCheckout = () => {
  if (cartItems.length === 0) {
   
    setQuantityMessage('A kosár üres! Kérjük, adjon hozzá termékeket a folytatáshoz.');
    setQuantityAlert(true);
    setTimeout(() => setQuantityAlert(false), 3000);
    return;
  }
  
 
  navigate('/shipping', {
    state: {
      cartItems: cartItems,
      totalPrice: totalPrice
    }
  });
};

  const handleToggle = () => {
    setOpen((prevOpen) => !prevOpen);
  };

  const handleClose = (event = {}) => {
    if (event.target && anchorRef.current && anchorRef.current.contains(event.target)) {
      return;
    }
    setOpen(false);
  };

  const handleListKeyDown = (event) => {
    if (event.key === 'Tab') {
      event.preventDefault();
      setOpen(false);
    } else if (event.key === 'Escape') {
      setOpen(false);
    }
  };

  const handleLogout = () => {
    setShowLogoutAlert(true);
    setOpen(false);
  };
  
  const confirmLogout = () => {
    localStorage.removeItem('user');
    setIsLoggedIn(false);
    setShowLogoutAlert(false);
    navigate('/sign');
  };

  const toggleSideMenu = () => {
    setSideMenuActive((prev) => !prev);
  };

  const handleCartClick = () => {
    navigate('/kosar');
  };

  const fadeInAnimation = {
    '@keyframes fadeIn': {
      '0%': { opacity: 0, transform: 'translateY(20px)' },
      '100%': { opacity: 1, transform: 'translateY(0)' }
    }
  };

  return (
   <div style={{
  backgroundColor: darkMode ? '#333' : '#f5f5f5',
  backgroundImage: darkMode 
    ? 'radial-gradient(#444 1px, transparent 1px)'
    : 'radial-gradient(#aaaaaa 1px, transparent 1px)', 
  backgroundSize: '20px 20px',
  color: darkMode ? 'white' : 'black',
  minHeight: '100vh',
  paddingBottom: '100px', 
  transition: 'all 0.3s ease-in-out'
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
          <Box sx={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          {isLoggedIn ? (
            <Box sx={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
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
            <Button
                              ref={anchorRef}
                              onClick={handleToggle}
                              sx={{
                                color: '#fff',
                                zIndex: 1300,
                                border: '1px solid #fff',
                                borderRadius: '5px',
                                padding: '5px 10px',
                              }}
                            >
                              Profil
                            </Button>
                            <Popper
              open={open}
              anchorEl={anchorRef.current}
              placement="bottom-start"
              transition
              disablePortal
              sx={{ 
                zIndex: 1300,
                mt: 1, 
                '& .MuiPaper-root': {
                  overflow: 'hidden',
                  borderRadius: '12px',
                  boxShadow: darkMode 
                    ? '0 8px 32px rgba(0, 0, 0, 0.4)'
                    : '0 8px 32px rgba(0, 0, 0, 0.1)',
                  border: darkMode 
                    ? '1px solid rgba(255, 255, 255, 0.1)'
                    : '1px solid rgba(0, 0, 0, 0.05)',
                }
              }}
            >
              {({ TransitionProps, placement }) => (
                <Grow
                  {...TransitionProps}
                  style={{
                    transformOrigin: placement === 'bottom-start' ? 'left top' : 'left bottom',
                  }}
                >
                  <Paper
                    sx={{
                      backgroundColor: darkMode ? '#2d2d2d' : '#ffffff',
                      minWidth: '200px',
                    }}
                  >
                    <ClickAwayListener onClickAway={handleClose}>
                      <MenuList 
                        autoFocusItem={open} 
                        onKeyDown={handleListKeyDown}
                        sx={{ py: 1 }}
                      >
                        <MenuItem 
                          onClick={handleClose}
                          sx={{
                            py: 1.5,
                            px: 2,
                            color: darkMode ? '#fff' : '#333',
                            '&:hover': {
                              backgroundColor: darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.04)',
                            },
                            gap: 2,
                          }}
                        >
                          <Typography variant="body1" sx={{ fontWeight: 500 }}>
                            {userName} profilja
                          </Typography>
                        </MenuItem>
            
                        <MenuItem 
                          onClick={() => {
                            handleClose();
                            navigate('/fiokom');
                          }}
                          sx={{
                            py: 1.5,
                            px: 2,
                            color: darkMode ? '#fff' : '#333',
                            '&:hover': {
                              backgroundColor: darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.04)',
                            },
                            gap: 2,
                          }}
                        >
                          <Typography variant="body1">Fiókom</Typography>
                        </MenuItem>
            
                        <MenuItem 
                          onClick={handleLogout}
                          sx={{
                            py: 1.5,
                            px: 2,
                            color: '#ff4444',
                            '&:hover': {
                              backgroundColor: 'rgba(255,68,68,0.1)',
                            },
                            gap: 2,
                            borderTop: '1px solid',
                            borderColor: darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
                            mt: 1,
                          }}
                        >
                          <Typography variant="body1">Kijelentkezés</Typography>
                        </MenuItem>
                      </MenuList>
                    </ClickAwayListener>
                  </Paper>
                </Grow>
              )}
            </Popper>
            </Box>
          ) : (
            <>
             <Button
  component={Link}
  to="/sign"
  sx={{
    color: '#fff',
    border: '1px solid #fff',
    borderRadius: '5px',
    padding: {
      xs: '2px 6px',   
      sm: '5px 10px'
    },
    fontSize: {
      xs: '0.7rem',    
      sm: '1rem'
    },
    whiteSpace: 'nowrap',
    '&:hover': {
      backgroundColor: '#fff',
      color: '#333',
    },
  }}
>
  Sign In
</Button>

<Button
  component={Link}
  to="/signup"
  sx={{
    color: '#fff',
    border: '1px solid #fff',
    borderRadius: '5px',
    padding: {
      xs: '2px 6px',   
      sm: '5px 10px'
    },
    fontSize: {
      xs: '0.7rem',  
      sm: '1rem'
    },
    whiteSpace: 'nowrap',
    '&:hover': {
      backgroundColor: '#fff',
      color: '#333',
    },
  }}
>
  Sign Up
</Button>
            </>
          )}
        </Box>
      </div>      <Box sx={{
        position: 'fixed',
        top: 0,
        left: sideMenuActive ? 0 : '-250px',
        width: '250px',
        height: '100%',
        backgroundColor: '#fff',
        boxShadow: '4px 0px 10px rgba(0, 0, 0, 0.2)',
        zIndex: 1200,
        transition: 'left 0.1s ease-in-out',
      }}>
        <Menu sideMenuActive={sideMenuActive} toggleSideMenu={toggleSideMenu} />
      </Box>

      <FormGroup sx={{ position: 'absolute', top: 60, right: 20 }}>
        <FormControlLabel
          control={
            <Switch
              color="default"
              checked={darkMode}
              onChange={() => setDarkMode((prev) => !prev)}
            />
          }
          label="Dark Mode"
        />
      </FormGroup>

      <Container 
  maxWidth="lg" 
  sx={{ 
    py: 6,
    animation: 'fadeIn 0.6s ease-out',
    ...fadeInAnimation
  }}
>
<Typography
  variant="h3"
  gutterBottom
  sx={{
    fontWeight: 600,
    fontSize: {
      xs: '1.75rem',   
      sm: '2.25rem',    
      md: '2.75rem'  
    },
    textAlign: {
      xs: 'center', 
      sm: 'left'      
    },
    background: darkMode
      ? 'linear-gradient(45deg, #fff, #ccc)'
      : 'linear-gradient(45deg, #333, #666)',
    backgroundClip: 'text',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    mb: {
      xs: 2,          
      sm: 3,        
      md: 4            
    },
    padding: {
      xs: '0 15px',     
      sm: 0           
    },
    lineHeight: {
      xs: 1.3,        
      sm: 1.4,         
      md: 1.5          
    },
    letterSpacing: {
      xs: '-0.5px',     
      sm: 'normal'      
    },
    animation: 'fadeIn 0.8s ease-out',
    '@keyframes fadeIn': {
      from: { opacity: 0, transform: 'translateY(-10px)' },
      to: { opacity: 1, transform: 'translateY(0)' }
    }
  }}
>
  Kosár tartalma
</Typography>

<Box
  sx={{
    border: '2px solid',
    borderColor: darkMode ? 'rgba(0, 0, 0, 0.2)' : 'rgba(0, 0, 0, 0.2)',

    borderRadius: '24px',
    padding: { xs: 2, sm: 3, md: 4 },
    backgroundColor: darkMode ? 'rgba(0, 0, 0, 0.2)' : 'rgba(255, 255, 255, 0.5)',
    boxShadow: darkMode 
      ? '0 8px 32px rgba(0, 0, 0, 0.3)' 
      : '0 8px 32px rgba(0, 0, 0, 0.1)',
    backdropFilter: 'blur(4px)',
    transition: 'all 0.3s ease-in-out',
    '&:hover': {
  boxShadow: darkMode
    ? '0 12px 40px rgba(0, 0, 0, 0.4)'
    : '0 12px 40px rgba(0, 0, 0, 0.15)',
  borderColor: darkMode ? 'rgba(0, 0, 0, 0.2)' : 'rgba(0, 0, 0, 0.7)',
},

    mb: 4
  }}
>


<Grid container spacing={{ xs: 2, sm: 3, md: 4 }}>
  <Grid item xs={12} md={8}>
    {cartItems.map((item, index) => (
      <Card
      key={item.id}
      sx={{
        mb: 2,
        backgroundColor: darkMode ? 'rgba(51, 51, 51, 0.9)' : 'rgba(255, 255, 255, 0.9)',
        backdropFilter: 'blur(10px)',
        borderRadius: { xs: '12px', sm: '16px' },
        border: darkMode ? 'none' : '2px solid black',
        boxShadow: darkMode
          ? '0 8px 32px rgba(0, 0, 0, 0.3)'
          : '0 8px 32px rgba(0, 0, 0, 0.1)',
        transform: 'translateY(0)',
        transition: 'all 0.3s ease',
        '&:hover': {
          transform: { xs: 'none', sm: 'translateY(-4px)' },
          boxShadow: darkMode
            ? '0 12px 40px rgba(0, 0, 0, 0.4)'
            : '0 12px 40px rgba(0, 0, 0, 0.15)'
        },
        animation: `fadeIn 0.6s ease-out ${index * 0.1}s`
      }}
    >
    
        <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
          <Box sx={{
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' }, 
            justifyContent: 'space-between',
            alignItems: { xs: 'stretch', sm: 'center' },
            gap: { xs: 2, sm: 3 }
          }}>
            <Box sx={{
              display: 'flex',
              alignItems: 'center',
              flexDirection: 'row',
              gap: { xs: 2, sm: 3 },
              flex: { xs: 1, sm: '0 1 65%' },
              width: '100%'
            }}>
              <img
                src={imageMap[item.imageUrl] || item.imageUrl}
                alt={item.nev}
                style={{
                  width: '100%',
                  maxWidth: '120px',
                  height: 'auto',
                  aspectRatio: '1/1',
                  objectFit: 'contain',
                  borderRadius: '12px',
                  backgroundColor: darkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)',
                  padding: '8px'
                }}
              />
              <Box sx={{ width: 'auto' }}>
                <Typography
                  variant="h6"
                  sx={{
                    fontWeight: 600,
                    color: darkMode ? '#fff' : '#333',
                    fontSize: { xs: '1rem', sm: '1.1rem', md: '1.25rem' }
                  }}
                >
                  {item.nev}
                </Typography>
                <Typography
                  variant="body1"
                  sx={{
                    color: darkMode ? '#aaa' : '#666',
                    mt: 1,
                    fontSize: { xs: '0.85rem', sm: '0.9rem', md: '1rem' }
                  }}
                >
                  Méret: {item.size || item.meret}
                </Typography>
                <Typography
                  variant="body1"
                  sx={{
                    color: darkMode ? '#aaa' : '#666',
                    mt: 1,
                    fontSize: { xs: '0.85rem', sm: '0.9rem', md: '1rem' }
                  }}
                >
                  Ruha ára: {item.ar.toLocaleString()} Ft
                </Typography>
              </Box>
            </Box>

           
            <Box sx={{
  display: 'flex',
  alignItems: 'center',
  justifyContent: { xs: 'space-between', sm: 'flex-end' },
  gap: { xs: 2, sm: 3, md: 4 },
  width: { xs: '100%', sm: 'auto' },
  flexWrap: { xs: 'nowrap', sm: 'nowrap' },
  flex: { xs: 1, sm: '0 1 35%' },
  minWidth: { sm: '280px' },
  pl: { sm: 2 }
}}>
  <Box sx={{
    display: 'flex',
    alignItems: 'center',
    bgcolor: darkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
    borderRadius: '30px',
    padding: { xs: '4px', sm: '2px' },
    flexShrink: 0,
    mr: { sm: 2, md: 3 },
    transform: { sm: 'scale(0.9)' }
  }}>
    <IconButton
      onClick={() => handleQuantityChange(item.id, false)}
      size="small"
      sx={{
        color: darkMode ? '#fff' : '#333',
        '&:hover': {
          bgcolor: darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'
        }
      }}
    >
      <RemoveIcon fontSize="small" />
    </IconButton>
    <Typography sx={{
      mx: { xs: 1, sm: 1 },
      color: darkMode ? '#fff' : '#333',
      fontWeight: 600,
      fontSize: { xs: '0.9rem', sm: '0.85rem' },
      padding: { xs: '0 2px', sm: '0 2px' },
      lineHeight: { xs: 1.2, sm: 1.2 },
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      minWidth: { xs: '20px', sm: '18px' }
    }}>
      {item.mennyiseg}
    </Typography>
    <IconButton
      onClick={() => handleQuantityChange(item.id, true)}
      size="small"
      sx={{
        color: darkMode ? '#fff' : '#333',
        '&:hover': {
          bgcolor: darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'
        }
      }}
    >
      <AddIcon fontSize="small" />
    </IconButton>
  </Box>

  <Typography sx={{
    minWidth: { xs: '80px', sm: '100px' },
    textAlign: 'right',
    fontWeight: 600,
    color: darkMode ? '#fff' : '#333',
    fontSize: { xs: '0.9rem', sm: '0.95rem' },
    flexGrow: { xs: 1, sm: 0 },
    display: 'flex',
    justifyContent: 'flex-end',
    alignItems: 'center',
    mr: { sm: 2 }
  }}>
    {(item.ar * item.mennyiseg).toLocaleString()} Ft
  </Typography>

  <IconButton
    onClick={() => handleRemoveItem(item.id)}
    size="small"
    sx={{
      color: '#ff4444',
      flexShrink: 0,
      '&:hover': {
        bgcolor: 'rgba(255,68,68,0.1)'
      }
    }}
  >
    <DeleteIcon fontSize="small" />
  </IconButton>
</Box>
</Box>
</CardContent>
</Card>
))}
</Grid>







    <Grid item xs={12} md={4}>
    <Card 
  sx={{
    backgroundColor: darkMode ? 'rgba(51, 51, 51, 0.9)' : 'rgba(255, 255, 255, 0.9)',
    backdropFilter: 'blur(10px)',
    borderRadius: '16px',
    position: 'sticky',
    top: '2rem',
   
    border: darkMode ? 'none' : '2px solid black',
    boxShadow: darkMode
      ? '0 8px 32px rgba(0, 0, 0, 0.3)'
      : '0 8px 32px rgba(0, 0, 0, 0.1)',
  }}
>
        <CardContent sx={{ p: 4 }}>
          <Typography 
            variant="h5" 
            sx={{ 
              fontWeight: 600,
              color: darkMode ? '#fff' : '#333',
              mb: 3
            }}
          >
            Összegzés
          </Typography>

          <Box sx={{ mb: 4 }}>
            {[
              { label: 'Részösszeg:', value: totalPrice },
              { label: 'Szállítási költség:', value: 1590 },
              { label: 'Végösszeg:', value: totalPrice + 1590, isTotal: true }
            ].map((item, index) => (
              <Box 
                key={item.label}
                sx={{ 
                  display: 'flex', 
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  py: 2,
                  borderBottom: index !== 2 ? `1px solid ${darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}` : 'none'
                }}
              >
                <Typography sx={{ 
                  color: darkMode ? '#fff' : '#333',
                  fontWeight: item.isTotal ? 600 : 400,
                  fontSize: item.isTotal ? '1.2rem' : '1rem'
                }}>
                  {item.label}
                </Typography>
                <Typography sx={{ 
                  color: darkMode ? '#fff' : '#333',
                  fontWeight: item.isTotal ? 600 : 400,
                  fontSize: item.isTotal ? '1.2rem' : '1rem'
                }}>
                  {item.value.toLocaleString()} Ft
                </Typography>
              </Box>
            ))}
          </Box>

          <Button 
            variant="contained" 
            fullWidth 
            size="large"
            onClick={handleCheckout}
            sx={{ 
              py: 2,
              backgroundColor: darkMode ? '#666' : '#333',
              borderRadius: '12px',
              fontSize: '1.1rem',
              fontWeight: 600,
              transition: 'all 0.3s ease',
              '&:hover': {
                backgroundColor: darkMode ? '#777' : '#444',
                transform: 'translateY(-2px)',
                boxShadow: '0 10px 20px rgba(0,0,0,0.2)'
              }
            }}
          >
            Megrendelés
          </Button>
        </CardContent>
      </Card>
    </Grid>
  </Grid>
        {deleteAlert && (
  <Box
    sx={{
      position: 'fixed',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      zIndex: 1400,
      animation: 'popIn 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55)',
      '@keyframes popIn': {
        '0%': {
          opacity: 0,
          transform: 'translate(-50%, -50%) scale(0.5)',
        },
        '50%': {
          transform: 'translate(-50%, -50%) scale(1.05)',
        },
        '100%': {
          opacity: 1,
          transform: 'translate(-50%, -50%) scale(1)',
        },
      },
    }}
  >
    <Card
      sx={{
        minWidth: 350,
        backgroundColor: darkMode ? 'rgba(45, 45, 45, 0.95)' : 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(10px)',
        color: darkMode ? '#fff' : '#000',
        boxShadow: darkMode 
          ? '0 8px 32px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(255, 255, 255, 0.1)' 
          : '0 8px 32px rgba(0, 0, 0, 0.1), 0 0 0 1px rgba(0, 0, 0, 0.05)',
        borderRadius: '20px',
        overflow: 'hidden',
      }}
    >
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '4px',
          background: 'linear-gradient(90deg, #FF5252, #FF1744)',
          animation: 'loadingBar 2s ease-in-out',
          '@keyframes loadingBar': {
            '0%': { width: '0%' },
            '100%': { width: '100%' }
          }
        }}
      />
      <CardContent sx={{ p: 4 }}>
        <Box sx={{ textAlign: 'center', mb: 3 }}>
          <Typography 
            variant="h5" 
            sx={{ 
              fontWeight: 600,
              mb: 1,
              background: darkMode 
                ? 'linear-gradient(45deg, #FF5252, #FF1744)' 
                : 'linear-gradient(45deg, #D32F2F, #C62828)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            Termék törlése
          </Typography>
          <Typography variant="body1" sx={{ color: darkMode ? '#aaa' : '#666' }}>
            Biztosan törölni szeretnéd ezt a terméket a kosárból?
          </Typography>
        </Box>
        <Box 
          sx={{ 
            display: 'flex', 
            gap: 2,
            justifyContent: 'space-between'
          }}
        >
          <Button
            onClick={() => setDeleteAlert(false)}
            sx={{
              flex: 1,
              py: 1.5,
              borderRadius: '12px',
              backgroundColor: darkMode ? 'rgba(144, 202, 249, 0.1)' : 'rgba(25, 118, 210, 0.1)',
              color: darkMode ? '#90caf9' : '#1976d2',
              transition: 'all 0.2s ease',
              '&:hover': {
                backgroundColor: darkMode ? 'rgba(144, 202, 249, 0.2)' : 'rgba(25, 118, 210, 0.2)',
                transform: 'translateY(-2px)',
              }
            }}
          >
            Mégse
          </Button>
          <Button
            onClick={confirmDelete}
            sx={{
              flex: 1,
              py: 1.5,
              borderRadius: '12px',
              background: darkMode 
                ? 'linear-gradient(45deg, #FF5252, #FF1744)' 
                : 'linear-gradient(45deg, #D32F2F, #C62828)',
              color: '#fff',
              transition: 'all 0.2s ease',
              '&:hover': {
                transform: 'translateY(-2px)',
                boxShadow: '0 5px 15px rgba(0,0,0,0.3)',
              }
            }}
          >
            Törlés
          </Button>
        </Box>
      </CardContent>
    </Card>
  </Box>
  
)}
</Box>
{quantityAlert && (
  <Box
    sx={{
      position: 'fixed',
      bottom: '2rem',
      right: '2rem',
      zIndex: 1400,
      animation: 'slideIn 0.3s ease-out',
      '@keyframes slideIn': {
        '0%': {
          opacity: 0,
          transform: 'translateX(100%)',
        },
        '100%': {
          opacity: 1,
          transform: 'translateX(0)',
        },
      },
    }}
  >
    <Card
      sx={{
        backgroundColor: darkMode ? 'rgba(45, 45, 45, 0.95)' : 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(10px)',
        color: darkMode ? '#fff' : '#000',
        boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
        borderRadius: '12px',
        overflow: 'hidden',
      }}
    >
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '3px',
          background: 'linear-gradient(90deg, #64B5F6, #2196F3)',
          animation: 'loadingBar 1.5s ease-in-out',
          '@keyframes loadingBar': {
            '0%': { width: '0%' },
            '100%': { width: '100%' }
          }
        }}
      />
      <CardContent sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
        <Typography 
          variant="body1" 
          sx={{ 
            fontWeight: 500,
            background: darkMode 
              ? 'linear-gradient(45deg, #64B5F6, #2196F3)' 
              : 'linear-gradient(45deg, #1976d2, #1565c0)',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          {quantityMessage}
        </Typography>
      </CardContent>
    </Card>
  </Box>
)}

{showLogoutAlert && (
  <Box
    sx={{
      position: 'fixed',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      zIndex: 1400,
      animation: 'popIn 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55)',
      '@keyframes popIn': {
        '0%': {
          opacity: 0,
          transform: 'translate(-50%, -50%) scale(0.5)',
        },
        '50%': {
          transform: 'translate(-50%, -50%) scale(1.05)',
        },
        '100%': {
          opacity: 1,
          transform: 'translate(-50%, -50%) scale(1)',
        },
      },
    }}
  >
    <Card
      sx={{
        minWidth: 350,
        backgroundColor: darkMode ? 'rgba(45, 45, 45, 0.95)' : 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(10px)',
        color: darkMode ? '#fff' : '#000',
        boxShadow: darkMode 
          ? '0 8px 32px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(255, 255, 255, 0.1)' 
          : '0 8px 32px rgba(0, 0, 0, 0.1), 0 0 0 1px rgba(0, 0, 0, 0.05)',
        borderRadius: '20px',
        overflow: 'hidden',
      }}
    >
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '4px',
          background: 'linear-gradient(90deg, #00C853, #B2FF59)',
          animation: 'loadingBar 2s ease-in-out',
          '@keyframes loadingBar': {
            '0%': { width: '0%' },
            '100%': { width: '100%' }
          }
        }}
      />
      <CardContent sx={{ p: 4 }}>
        <Box sx={{ textAlign: 'center', mb: 3 }}>
          <Typography 
            variant="h5" 
            sx={{ 
              fontWeight: 600,
              mb: 1,
              background: darkMode 
              ? 'linear-gradient(45deg, #90caf9, #42a5f5)' 
              : 'linear-gradient(45deg, #1976d2, #1565c0)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            Kijelentkezés
          </Typography>
          <Typography variant="body1" sx={{ color: darkMode ? '#aaa' : '#666' }}>
            Biztosan ki szeretnél jelentkezni?
          </Typography>
        </Box>
        <Box 
          sx={{ 
            display: 'flex', 
            gap: 2,
            justifyContent: 'space-between'
          }}
        >
          <Button
            onClick={() => setShowLogoutAlert(false)}
            sx={{
              flex: 1,
              py: 1.5,
              borderRadius: '12px',
              backgroundColor: darkMode ? 'rgba(144, 202, 249, 0.1)' : 'rgba(25, 118, 210, 0.1)',
              color: darkMode ? '#90caf9' : '#1976d2',
              transition: 'all 0.2s ease',
              '&:hover': {
                backgroundColor: darkMode ? 'rgba(144, 202, 249, 0.2)' : 'rgba(25, 118, 210, 0.2)',
                transform: 'translateY(-2px)',
              }
            }}
          >
            Mégse
          </Button>
          <Button
            onClick={confirmLogout}
            sx={{
              flex: 1,
              py: 1.5,
              borderRadius: '12px',
              background: darkMode 
              ? 'linear-gradient(45deg, #90caf9, #42a5f5)' 
              : 'linear-gradient(45deg, #1976d2, #1565c0)',
              color: '#fff',
              transition: 'all 0.2s ease',
              '&:hover': {
                transform: 'translateY(-2px)',
                boxShadow: '0 5px 15px rgba(0,0,0,0.3)',
              }
            }}
          >
            Kijelentkezés
          </Button>
        </Box>
      </CardContent>
    </Card>
  </Box>
)}

      </Container>
    </div>
  );
}
