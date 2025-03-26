import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  IconButton,
  FormGroup,
  FormControlLabel,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Switch,
  Popper,
  Grow,
  Paper,
  ClickAwayListener,
  MenuList,
  Grid,
  Badge,
  FormHelperText
} from '@mui/material';
import { Link } from 'react-router-dom';
import MenuIcon from '@mui/icons-material/Menu';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import Footer from './footer';
import Menu from './menu2';
import PersonIcon from '@mui/icons-material/Person';

const imageMap = {};
const images = require.context('../../adaliclothing-mvc/backend/kep', false, /\.(png|jpg|jpeg)$/);
    images.keys().forEach((key) => {
      const imageName = key.replace('./', '');
      imageMap[imageName] = images(key);
    });
    

export default function TermekReszletek() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [darkMode, setDarkMode] = useState(true);
  const [loginAlert, setLoginAlert] = useState(false);
  const [sideMenuActive, setSideMenuActive] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [open, setOpen] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  const [showLogoutAlert, setShowLogoutAlert] = useState(false);
  const [userName, setUserName] = useState('');
  const anchorRef = useRef(null);
  const [cartAlert, setCartAlert] = useState(false);
  const cartItems = JSON.parse(localStorage.getItem('cartItems')) || [];
  const cartItemCount = cartItems.reduce((total, item) => total + item.mennyiseg, 0);
  const [selectedSize, setSelectedSize] = useState('');
  const [sizeError, setSizeError] = useState('');

 
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await fetch(`http://localhost:5000/termekek/${id}`);
        const data = await response.json();
        setProduct(data);
      } catch (error) {
        console.log('Hiba a termék betöltésekor:', error);
      }
    };
    fetchProduct();
  }, [id]);

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

  const getSizeOptions = (product) => {
   
    if (product.imageUrl.toLowerCase().includes('zokni') || 
        product.nev.toLowerCase().includes('zokni') || 
        product.kategoriaId === 3) {
      return ['36-39', '40-44', '45-50'];
    }
    return ['S', 'M', 'L', 'XL', 'XXL'];
  };
  

  const handleAddToCart = () => {
    if (!selectedSize) {
      setSizeError('Kérlek válassz méretet!');
      return;
    }
    setSizeError('');
    
    const userData = localStorage.getItem('user');
    if (!userData) {
      setLoginAlert(true);
      setTimeout(() => {
        setLoginAlert(false);
        navigate('/sign');
      }, 2000);
      return;
    }
  
    const cartItems = JSON.parse(localStorage.getItem('cartItems')) || [];
    const existingItem = cartItems.find(item => item.id === product.id && item.size === selectedSize);
  
    if (existingItem) {
      existingItem.mennyiseg += 1;
      localStorage.setItem('cartItems', JSON.stringify(cartItems));
    } else {
      const newItem = {
        ...product,
        size: selectedSize,
        mennyiseg: 1
      };
      cartItems.push(newItem);
      localStorage.setItem('cartItems', JSON.stringify(cartItems));
    }
    
    setCartAlert(true);
  };

  if (!product) return <div>Loading...</div>;

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
                        <IconButton
                                                      ref={anchorRef}
                                                      onClick={handleToggle}
                                                      sx={{
                                                        color: '#fff',
                                                        zIndex: 1300,
                                                        backgroundColor: 'rgba(255, 255, 255, 0.1)',
                                                        border: '1px solid rgba(255, 255, 255, 0.3)',
                                                        borderRadius: '50%',
                                                        padding: '8px',
                                                        transition: 'all 0.3s ease',
                                                        '&:hover': {
                                                          backgroundColor: 'rgba(255, 255, 255, 0.2)',
                                                          transform: 'scale(1.05)',
                                                          boxShadow: '0 0 10px rgba(255, 255, 255, 0.2)'
                                                        }
                                                      }}
                                                    >
                                                      <PersonIcon fontSize="medium" />
                                                    </IconButton>
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
                                                <Typography variant="body1">
                                                  {(() => {
                                                    const user = JSON.parse(localStorage.getItem('user') || '{}');
                                                    if (user.kupon) {
                                                      if (user.kupon_hasznalva) {
                                                        return `Kupon: ${user.kupon} (Felhasználva)`;
                                                      } else {
                                                        return `Kupon: ${user.kupon} (Aktív)`;
                                                      }
                                                    } else {
                                                      return 'Nincs kuponod';
                                                    }
                                                  })()}
                                                </Typography>
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
                       <Box sx={{ 
                         display: 'flex', 
                         justifyContent: {
                           xs: 'flex-end',  
                           sm: 'flex-end'
                         },
                         gap: {
                           xs: '5px',     
                           sm: '10px'       
                         }
                       }}>
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
                       </Box>
                      </>
                    )}
                  </Box>
      </div>

      <Box sx={{
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

      <div style={{
  backgroundColor: darkMode ? '#333' : '#f5f5f5',
  backgroundImage: darkMode 
    ? 'radial-gradient(#444 1px, transparent 1px)'
    : 'radial-gradient(#e0e0e0 1px, transparent 1px)',
  backgroundSize: '20px 20px',
  minHeight: '100%',  
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  padding: '1rem',   
  gap: '1rem',       
  transition: 'all 0.3s ease-in-out'
}}>
<Card
  sx={{
    width: { xs: '100%', sm: '90%', md: '1000px' },
    maxWidth: '100%',
    margin: '0 auto', 
    background: darkMode
      ? 'linear-gradient(145deg, rgba(51, 51, 51, 0.9), rgba(68, 68, 68, 0.9))'
      : 'linear-gradient(145deg, rgba(255, 255, 255, 0.9), rgba(245, 245, 245, 0.9))',
    backdropFilter: 'blur(8px)',
    borderRadius: { xs: '12px', sm: '16px' },
    overflow: 'hidden',
    boxShadow: darkMode
      ? '0 8px 32px rgba(0, 0, 0, 0.4), inset 0 0 0 1px rgba(255, 255, 255, 0.1)'
      : '0 8px 32px rgba(0, 0, 0, 0.1), inset 0 0 0 1px rgba(0, 0, 0, 0.05)',
    animation: 'fadeIn 0.6s ease-out',
    transform: 'translateY(0)',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    '&:hover': {
      transform: { xs: 'none', md: 'translateY(-4px)' },
      boxShadow: darkMode
        ? '0 12px 40px rgba(0, 0, 0, 0.5), inset 0 0 0 1px rgba(255, 255, 255, 0.15)'
        : '0 12px 40px rgba(0, 0, 0, 0.15), inset 0 0 0 1px rgba(0, 0, 0, 0.08)'
    }
  }}
>
  <CardContent sx={{ p: { xs: 2, sm: 3 } }}> 
    <Box sx={{
      display: 'flex',
      flexDirection: { xs: 'column', md: 'row' },
      gap: { xs: 2, sm: 3 },
      alignItems: 'center'
    }}>
      <Box sx={{
  width: { xs: '100%', sm: '250px', md: '300px' },
  height: { xs: '250px', sm: '250px', md: '300px' },
  borderRadius: { xs: '8px', sm: '12px' },
  overflow: 'hidden',
  background: darkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)',
  padding: { xs: '4px', sm: '8px' },
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  alignSelf: { xs: 'center', md: 'flex-start' }
}}>
  <img
    src={imageMap[product.imageUrl]}
    alt={product.nev}
    style={{
      width: '100%',
      height: '100%',
      objectFit: 'contain',
      borderRadius: '8px',
      transition: 'transform 0.3s ease',
    }}
  />
</Box>

<Box sx={{
  flex: 1,
  display: 'flex',
  flexDirection: 'column',
  gap: { xs: 1.5, sm: 2, md: 2.5 },
  width: { xs: '100%', md: 'auto' }
}}>
  <Typography
    variant="h5"
    sx={{
      fontWeight: 600,
      fontSize: { xs: '1.2rem', sm: '1.5rem', md: '1.8rem' },
      background: darkMode
        ? 'linear-gradient(45deg, #fff, #ccc)'
        : 'linear-gradient(45deg, #333, #666)',
      backgroundClip: 'text',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
      textAlign: { xs: 'center', md: 'left' }
    }}
  >
    {product.nev}
  </Typography>

  <Typography
    variant="h6"
    sx={{
      color: darkMode ? '#90caf9' : '#1976d2',
      fontWeight: 600,
      display: 'flex',
      alignItems: 'center',
      gap: 1,
      fontSize: { xs: '1.1rem', sm: '1.3rem', md: '1.5rem' },
      justifyContent: { xs: 'center', md: 'flex-start' }
    }}
  >
    {product.ar.toLocaleString()} Ft
  </Typography>

  <Typography
    variant="body1"
    sx={{
      color: darkMode ? '#fff' : '#666',
      background: darkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)',
      p: { xs: 1.5, sm: 2 },
      borderRadius: '8px',
      lineHeight: 1.6,
      fontSize: { xs: '0.9rem', sm: '1rem' },
      maxHeight: { xs: '100px', sm: '150px', md: 'none' },
      overflow: { xs: 'auto', md: 'visible' }
    }}
  >
    {product.termekleiras}
  </Typography>
 
  <FormControl fullWidth error={!!sizeError}>
    <InputLabel sx={{
      color: darkMode ? '#fff' : 'inherit',
      fontSize: { xs: '0.9rem', sm: '1rem' }
    }}>
      Válassz méretet
    </InputLabel>
    <Select
      value={selectedSize}
      onChange={(e) => {
        setSelectedSize(e.target.value);
        setSizeError('');
      }}
      sx={{
        backgroundColor: darkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)',
        borderRadius: '8px',
        color: darkMode ? '#fff' : 'inherit',
        fontSize: { xs: '0.9rem', sm: '1rem' },
        height: { xs: '45px', sm: '56px' },
        '& .MuiOutlinedInput-notchedOutline': {
          borderColor: darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'
        },
        '& .MuiSvgIcon-root': {
          color: darkMode ? '#fff' : 'inherit'
        }
      }}
    >
      {getSizeOptions(product).map((size) => (
        <MenuItem key={size} value={size}>{size}</MenuItem>
      ))}
    </Select>
    {sizeError && <FormHelperText>{sizeError}</FormHelperText>}
  </FormControl>

  <Button
    onClick={handleAddToCart}
    sx={{
      mt: { xs: 0.5, sm: 1 },
      py: { xs: 1, sm: 1.5 },
      px: { xs: 2, sm: 3 },
      borderRadius: '10px',
      background: darkMode
        ? 'linear-gradient(45deg, #90caf9, #42a5f5)'
        : 'linear-gradient(45deg, #1976d2, #1565c0)',
      color: '#fff',
      fontWeight: 600,
      letterSpacing: '0.5px',
      fontSize: { xs: '0.9rem', sm: '1rem' },
      transition: 'all 0.2s ease',
      '&:hover': {
        transform: { xs: 'none', md: 'translateY(-2px)' },
        boxShadow: { xs: 'none', md: '0 5px 15px rgba(0,0,0,0.3)' }
      }
    }}
  >
    Kosárba
  </Button>
</Box>
</Box>
</CardContent>
</Card>

</div>

<Box sx={{
  width: '100%',
  maxWidth: '1000px',
  margin: '0 auto',
  px: { xs: 1, sm: 2, md: 4 },
  py: { xs: 1, sm: 2, md: 3 }
}}>
  <Typography
    variant="h5"
    gutterBottom
    sx={{
      textAlign: 'center',
      mb: { xs: 1, sm: 2, md: 3 },
      fontSize: { xs: '1rem', sm: '1.3rem', md: '1.5rem' }
    }}
  >
    Termék részletek
  </Typography>

  <Grid
    container
    spacing={{ xs: 1, sm: 2, md: 4 }}
  >
    <Grid item xs={6} md={6}>
      <Box sx={{
        p: { xs: 1, sm: 2, md: 3 },
        backgroundColor: darkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)',
        borderRadius: { xs: 1, md: 2 },
        height: '100%',
        display: 'flex',
        flexDirection: 'column'
      }}>
        <Typography
          variant="h6"
          gutterBottom
          sx={{
            fontSize: { xs: '0.75rem', sm: '0.9rem', md: '1.15rem' },
            fontWeight: 600,
            mb: { xs: 0.5, sm: 1 }
          }}
        >
          Anyagösszetétel
        </Typography>
        <Typography
          sx={{
            fontSize: { xs: '0.7rem', sm: '0.8rem', md: '1rem' },
            mb: { xs: 1, sm: 1.5 }
          }}
        >
          100% pamut
        </Typography>
       
        <Typography
          variant="h6"
          sx={{
            mt: { xs: 0.5, sm: 1, md: 2 },
            mb: { xs: 0.5, sm: 1 },
            fontSize: { xs: '0.75rem', sm: '0.9rem', md: '1.15rem' }
          }}
          gutterBottom
        >
          Mosási útmutató
        </Typography>
        <Typography
          sx={{
            fontSize: { xs: '0.7rem', sm: '0.8rem', md: '1rem' }
          }}
        >
          40 fokon mosható
        </Typography>
      </Box>
    </Grid>
   
    <Grid item xs={6} md={6}>
      <Box sx={{
        p: { xs: 1, sm: 2, md: 3 },
        backgroundColor: darkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)',
        borderRadius: { xs: 1, md: 2 },
        height: '100%',
        display: 'flex',
        flexDirection: 'column'
      }}>
        <Typography
          variant="h6"
          gutterBottom
          sx={{
            fontSize: { xs: '0.75rem', sm: '0.9rem', md: '1.15rem' },
            fontWeight: 600,
            mb: { xs: 0.5, sm: 1 }
          }}
        >
          Szállítási információk
        </Typography>
        <Typography
          sx={{
            fontSize: { xs: '0.7rem', sm: '0.8rem', md: '1rem' },
            mb: { xs: 1, sm: 1.5 }
          }}
        >
          2-3 munkanapon belül
        </Typography>
       
        <Typography
          variant="h6"
          sx={{
            mt: { xs: 0.5, sm: 1, md: 2 },
            mb: { xs: 0.5, sm: 1 },
            fontSize: { xs: '0.75rem', sm: '0.9rem', md: '1.15rem' }
          }}
          gutterBottom
        >
          Garancia
        </Typography>
        <Typography
          sx={{
            fontSize: { xs: '0.7rem', sm: '0.8rem', md: '1rem' }
          }}
        >
          30 napos pénzvisszafizetési garancia
        </Typography>
      </Box>
    </Grid>
  </Grid>
</Box>


      {showAlert && (
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
            Sikeres hozzáadás!
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
            onClick={() => setShowAlert(false)}
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
            Vásárlás folytatása
          </Button>
          <Button
            onClick={() => navigate('/kosar')}
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
            Rendelés leadása
          </Button>
        </Box>
      </CardContent>
    </Card>
  </Box>
)}

{cartAlert && (
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
            Sikeres hozzáadás!
          </Typography>
          <Typography variant="body1" sx={{ color: darkMode ? '#aaa' : '#666' }}>
            A termék sikeresen a kosárba került
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
            onClick={() => setCartAlert(false)}
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
            Vásárlás folytatása
          </Button>
          <Button
            onClick={() => {
              setCartAlert(false);
              navigate('/kosar');
             
            }}
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
            Rendelés leadása
          </Button>
        </Box>
      </CardContent>
    </Card>
  </Box>
)}

{loginAlert && (
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
          background: 'linear-gradient(90deg, #FF9800, #F57C00)',
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
                ? 'linear-gradient(45deg, #FF9800, #F57C00)' 
                : 'linear-gradient(45deg, #FB8C00, #EF6C00)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            Bejelentkezés szükséges!
          </Typography>
          <Typography variant="body1" sx={{ color: darkMode ? '#aaa' : '#666' }}>
            A vásárláshoz kérjük, jelentkezz be!
          </Typography>
        </Box>
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
<Box sx={{ 
      backgroundColor: darkMode ? '#333' : '#f5f5f5',
      backgroundImage: darkMode 
        ? 'radial-gradient(#444 1px, transparent 1px)'
        : 'radial-gradient(#e0e0e0 1px, transparent 1px)',
      backgroundSize: '20px 20px',
      pb: 15
    }}>
    </Box>
<Footer sx={{
  backgroundColor: darkMode ? '#333' : '#f5f5f5',
  backgroundImage: darkMode 
    ? 'radial-gradient(#444 1px, transparent 1px)'
    : 'radial-gradient(#e0e0e0 1px, transparent 1px)',
  backgroundSize: '20px 20px',
  backdropFilter: 'blur(8px)',
  borderTop: darkMode 
    ? '1px solid rgba(255, 255, 255, 0.1)'
    : '1px solid rgba(0, 0, 0, 0.1)',
  transition: 'all 0.3s ease-in-out'
}} />
    </div>
  );
}

