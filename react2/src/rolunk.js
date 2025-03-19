import React, { useRef, useState, useEffect } from 'react';
import { 
  Typography, 
  Box, 
  Container, 
  Grid, 
  Card, 
  CardContent, 
  Avatar, 
  IconButton,
  Button,
  Paper,
  Badge,
  Popper,
  Grow,
  ClickAwayListener,
  FormGroup, 
  FormControlLabel, 
  Switch,  
  MenuList,
  MenuItem
  
  
  

} from '@mui/material';
import { styled } from '@mui/material/styles';
import MenuIcon from '@mui/icons-material/Menu';
import CloseIcon from '@mui/icons-material/Close';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import FacebookIcon from '@mui/icons-material/Facebook';
import InstagramIcon from '@mui/icons-material/Instagram';
import TwitterIcon from '@mui/icons-material/Twitter';
import LinkedInIcon from '@mui/icons-material/LinkedIn';
import { useNavigate, Link } from 'react-router-dom';
import Footer from './footer';
import Menu from './menu2';
import logo2 from './logo2.png';
import mutyImage from './muty.jpeg';
import adamImage from './adam.jpeg';

const StyledSection = styled(Box, {
  shouldForwardProp: (prop) => prop !== 'darkMode'
})(({ theme, darkMode }) => ({
  padding: theme.spacing(8, 0),
  backgroundColor: darkMode ? '#333' : '#f5f5f5',
  backgroundImage: darkMode 
    ? 'radial-gradient(#444 1px, transparent 1px)'
    : 'radial-gradient(#e0e0e0 1px, transparent 1px)',
  backgroundSize: '20px 20px',
  transition: 'all 0.3s ease-in-out',
}));





const StyledCard = styled(Card, {
  shouldForwardProp: (prop) => prop !== 'darkMode'
})(({ theme, darkMode }) => ({
  backgroundColor: darkMode ? 'rgba(51, 51, 51, 0.9)' : 'rgba(255, 255, 255, 0.9)',
  backdropFilter: 'blur(10px)',
  borderRadius: '16px',
  boxShadow: darkMode
    ? '0 8px 32px rgba(0, 0, 0, 0.3)'
    : '0 8px 32px rgba(0, 0, 0, 0.1)',
  transform: 'translateY(0)',
  transition: 'all 0.3s ease',
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: darkMode
      ? '0 12px 40px rgba(0, 0, 0, 0.4)'
      : '0 12px 40px rgba(0, 0, 0, 0.15)'
  },
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
}));

const TeamMember = styled(Box, {
  shouldForwardProp: (prop) => prop !== 'darkMode'
})(({ theme, darkMode }) => ({
  textAlign: 'center',
  padding: theme.spacing(3),
  transition: 'transform 0.3s ease',
  '&:hover': {
    transform: 'translateY(-8px)',
  }
}));

const AboutUs = () => {
  const [darkMode, setDarkMode] = useState(true);
  const [sideMenuActive, setSideMenuActive] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName, setUserName] = useState('');
  const navigate = useNavigate();
  const cartItems = JSON.parse(localStorage.getItem('cartItems')) || [];
    const cartItemCount = cartItems.reduce((total, item) => total + item.mennyiseg, 0);
    const anchorRef = useRef(null);
    const [open, setOpen] = useState(false);

    const handleClose = (event = {}) => {
      if (event.target && anchorRef.current && anchorRef.current.contains(event.target)) {
        return;
      }
      setOpen(false);
    };
    const handleToggle = () => {
      setOpen((prevOpen) => !prevOpen);
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

    const handleListKeyDown = (event) => {
      if (event.key === 'Tab') {
        event.preventDefault();
        setOpen(false);
      } else if (event.key === 'Escape') {
        setOpen(false);
      }
    };
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

  const toggleSideMenu = () => {
    setSideMenuActive((prev) => !prev);
  };

  const handleCartClick = () => {
    navigate('/kosar');
  };
  const [showLogoutAlert, setShowLogoutAlert] = useState(false);

  // Animált megjelenés
  const fadeIn = {
    opacity: 0,
    animation: 'fadeIn 0.8s forwards',
    '@keyframes fadeIn': {
      from: { opacity: 0, transform: 'translateY(20px)' },
      to: { opacity: 1, transform: 'translateY(0)' }
    }
  };

  return (
    <Box sx={{
      backgroundColor: darkMode ? '#333' : '#f5f5f5',
      backgroundImage: darkMode 
        ? 'radial-gradient(#444 1px, transparent 1px)'
        : 'radial-gradient(#e0e0e0 1px, transparent 1px)',
      backgroundSize: '20px 20px',
      color: darkMode ? 'white' : 'black',
      minHeight: '100vh',
      transition: 'all 0.3s ease-in-out'
    }}>
      {/* Side Menu */}
      <Box
        sx={{
          position: 'fixed',
          top: 0,
          left: sideMenuActive ? 0 : '-250px',
          width: '250px',
          height: '100%',
          backgroundColor: '#fff',
          boxShadow: '4px 0px 10px rgba(0, 0, 0, 0.2)',
          zIndex: 1200,
          transition: 'left 0.1s ease-in-out',
        }}
      >
        <IconButton
          onClick={toggleSideMenu}
          sx={{
            position: 'absolute',
            zIndex: 1300,
            top: '10px',
            right: '10px',
          }}
        >
          <CloseIcon />
        </IconButton>
        <Menu sideMenuActive={sideMenuActive} toggleSideMenu={toggleSideMenu} />
      </Box>
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
        borderBottom: '3px solid #ffffff', // Add this border style
        boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)', // Add shadow for better separation
        marginBottom: '10px', // Add some space below the header
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
              xs: '1.1rem',    // Increased size for mobile
              sm: '1.5rem',    // Tablet size stays the same
              md: '2rem'       // Desktop size stays the same
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
    mt: 1, // Margin top for spacing
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
<Box sx={{ 
  display: 'flex', 
  justifyContent: {
    xs: 'flex-end',  // Telefonos nézetben jobbra igazítás
    sm: 'flex-end'   // Nagyobb képernyőkön is jobbra igazítás
  },
  gap: {
    xs: '5px',       // Telefonos nézetben kisebb távolság a gombok között
    sm: '10px'       // Nagyobb képernyőkön nagyobb távolság
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
        xs: '2px 6px',    // Telefonos nézetben még kisebb padding
        sm: '4px 9px',    // Tablet nézeten közepes padding
        md: '5px 10px'    // Asztali nézeten eredeti padding
      },
      fontSize: {
        xs: '0.65rem',    // Telefonos nézetben még kisebb betűméret
        sm: '0.85rem',    // Tablet nézeten közepes betűméret
        md: '0.875rem'    // Asztali nézeten eredeti betűméret
      },
      margin: {
        xs: '0 2px',      // Telefonos nézetben még kisebb margó
        sm: '0 7px',      // Tablet nézeten közepes margó
        md: '0 10px'      // Asztali nézeten nagyobb margó
      },
      minWidth: {
        xs: '50px',       // Telefonos nézetben még kisebb minimum szélesség
        sm: '80px',       // Tablet nézeten közepes minimum szélesség
        md: '90px'        // Asztali nézeten nagyobb minimum szélesség
      },
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
        xs: '2px 6px',    // Telefonos nézetben még kisebb padding
        sm: '4px 9px',    // Tablet nézeten közepes padding
        md: '5px 10px'    // Asztali nézeten eredeti padding
      },
      fontSize: {
        xs: '0.65rem',    // Telefonos nézetben még kisebb betűméret
        sm: '0.85rem',    // Tablet nézeten közepes betűméret
        md: '0.875rem'    // Asztali nézeten eredeti betűméret
      },
      margin: {
        xs: '0 2px',      // Telefonos nézetben még kisebb margó
        sm: '0 7px',      // Tablet nézeten közepes margó
        md: '0 10px'      // Asztali nézeten nagyobb margó
      },
      minWidth: {
        xs: '50px',       // Telefonos nézetben még kisebb minimum szélesség
        sm: '80px',       // Tablet nézeten közepes minimum szélesség
        md: '90px'        // Asztali nézeten nagyobb minimum szélesség
      },
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
        <FormGroup
        sx={{
          position: 'absolute',
          top: 60,
          right: 20,
          zIndex: 1100
        }}
      >
        <FormControlLabel
          control={
            <Switch
              color="default"
              sx={{
                color: darkMode ? 'white' : 'black',
              }}
              checked={darkMode}
              onChange={() => setDarkMode((prev) => !prev)}
            />
          }
          label="Dark Mode"
          sx={{ color: darkMode ? 'white' : 'black' }}
        />
      </FormGroup>
      {/* Hero Section */}
      <StyledSection darkMode={darkMode}>
        <Container maxWidth="lg">
          <Box sx={{ 
            textAlign: 'center', 
            mb: 6,
            ...fadeIn,
            animationDelay: '0.1s'
          }}>
            <Typography 
              variant="h2" 
              sx={{ 
                fontWeight: 'bold',
                fontSize: {
                  xs: '2rem',
                  sm: '2.5rem',
                  md: '3rem'
                },
                mb: 2,
                background: darkMode
                  ? 'linear-gradient(45deg, #fff, #ccc)'
                  : 'linear-gradient(45deg, #333, #666)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              Rólunk
            </Typography>
            <Typography 
              variant="h5" 
              sx={{ 
                color: darkMode ? '#ccc' : '#666',
                maxWidth: '800px',
                margin: '0 auto',
                fontSize: {
                  xs: '1rem',
                  sm: '1.25rem',
                  md: '1.5rem'
                },
              }}
            >
              Ismerd meg az Adali Clothing történetét és küldetését
            </Typography>
          </Box>

          <Grid container spacing={4}>
            <Grid item xs={12} md={6} sx={{ ...fadeIn, animationDelay: '0.3s' }}>
              <Box 
                component="img" 
                src={logo2} 
                alt="Adali Clothing" 
                sx={{ 
                  width: '100%', 
                  height: 'auto',
                  borderRadius: '16px',
                  boxShadow: darkMode
                    ? '0 10px 30px rgba(0, 0, 0, 0.3)'
                    : '0 10px 30px rgba(0, 0, 0, 0.1)',
                }}
              />
            </Grid>
            <Grid item xs={12} md={6} sx={{ ...fadeIn, animationDelay: '0.5s' }}>
              <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                <Typography 
                  variant="h4" 
                  sx={{ 
                    mb: 3,
                    fontWeight: 600,
                    color: darkMode ? '#fff' : '#333',
                    fontSize: {
                      xs: '1.5rem',
                      sm: '1.75rem',
                      md: '2rem'
                    },
                  }}
                >
                  Történetünk
                </Typography>
                <Typography 
                  variant="body1" 
                  sx={{ 
                    mb: 3,
                    color: darkMode ? '#ccc' : '#666',
                    fontSize: {
                      xs: '1rem',
                      sm: '1.1rem',
                      md: '1.2rem'
                    },
                    lineHeight: 1.8
                  }}
                >
                  Az Adali Clothing 2024-ban indult, amikor alapítóink felismerték, hogy a divatipar fenntarthatóbb és etikusabb megközelítést igényel. Célunk kezdettől fogva az volt, hogy olyan ruhákat kínáljunk, amelyek nem csak stílusosak, hanem környezetbarát anyagokból készülnek és fair trade elvek mentén gyártjuk őket.
                </Typography>
                <Typography 
                  variant="body1" 
                  sx={{ 
                    color: darkMode ? '#ccc' : '#666',
                    fontSize: {
                      xs: '1rem',
                      sm: '1.1rem',
                      md: '1.2rem'
                    },
                    lineHeight: 1.8
                  }}
                >
                  Az évek során kis vállalkozásból országos ismertségű márkává nőttünk, de alapértékeink változatlanok maradtak: minőség, fenntarthatóság és a vásárlóink elégedettsége.
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </Container>
      </StyledSection>

    
      <Box sx={{ 
        backgroundColor: darkMode ? '#2d2d2d' : '#fff',
        py: 8,
        transition: 'all 0.3s ease-in-out'
      }}>
        <Container maxWidth="lg">
          <Box sx={{ 
            textAlign: 'center', 
            mb: 6,
            ...fadeIn,
            animationDelay: '0.7s'
          }}>
            <Typography 
              variant="h3" 
              sx={{ 
                fontWeight: 'bold',
                mb: 4,
                color: darkMode ? '#fff' : '#333',
                fontSize: {
                  xs: '1.75rem',
                  sm: '2.25rem',
                  md: '2.5rem'
                },
              }}
              >
              Küldetésünk és Értékeink
            </Typography>
          </Box>

          <Grid container spacing={4}>
            <Grid item xs={12} md={4} sx={{ ...fadeIn, animationDelay: '0.9s' }}>
              <StyledCard darkMode={darkMode}>
                <CardContent sx={{ p: 4, flex: 1, display: 'flex', flexDirection: 'column' }}>
                  <Typography 
                    variant="h5" 
                    sx={{ 
                      mb: 2, 
                      fontWeight: 600,
                      color: darkMode ? '#fff' : '#333',
                      fontSize: {
                        xs: '1.25rem',
                        sm: '1.5rem'
                      },
                    }}
                  >
                    Fenntarthatóság
                  </Typography>
                  <Typography 
                    variant="body1" 
                    sx={{ 
                      color: darkMode ? '#ccc' : '#666',
                      fontSize: {
                        xs: '0.9rem',
                        sm: '1rem'
                      },
                      lineHeight: 1.7,
                      flex: 1
                    }}
                  >
                    Elkötelezettek vagyunk a környezetvédelem mellett. Ruháink nagy része újrahasznosított vagy organikus anyagokból készül, és folyamatosan dolgozunk azon, hogy csökkentsük ökológiai lábnyomunkat a gyártási folyamat minden szakaszában.
                  </Typography>
                </CardContent>
              </StyledCard>
            </Grid>
            
            <Grid item xs={12} md={4} sx={{ ...fadeIn, animationDelay: '1.1s' }}>
              <StyledCard darkMode={darkMode}>
                <CardContent sx={{ p: 4, flex: 1, display: 'flex', flexDirection: 'column' }}>
                  <Typography 
                    variant="h5" 
                    sx={{ 
                      mb: 2, 
                      fontWeight: 600,
                      color: darkMode ? '#fff' : '#333',
                      fontSize: {
                        xs: '1.25rem',
                        sm: '1.5rem'
                      },
                    }}
                  >
                    Minőség
                  </Typography>
                  <Typography 
                    variant="body1" 
                    sx={{ 
                      color: darkMode ? '#ccc' : '#666',
                      fontSize: {
                        xs: '0.9rem',
                        sm: '1rem'
                      },
                      lineHeight: 1.7,
                      flex: 1
                    }}
                  >
                    Minden termékünket gondosan tervezzük és készítjük, hogy tartós és időtálló legyen. Hisszük, hogy a minőségi ruhadarabok nemcsak jobban néznek ki, de hosszabb élettartamuk révén környezetbarátabbak is.
                  </Typography>
                </CardContent>
              </StyledCard>
            </Grid>
            
            <Grid item xs={12} md={4} sx={{ ...fadeIn, animationDelay: '1.3s' }}>
              <StyledCard darkMode={darkMode}>
                <CardContent sx={{ p: 4, flex: 1, display: 'flex', flexDirection: 'column' }}>
                  <Typography 
                    variant="h5" 
                    sx={{ 
                      mb: 2, 
                      fontWeight: 600,
                      color: darkMode ? '#fff' : '#333',
                      fontSize: {
                        xs: '1.25rem',
                        sm: '1.5rem'
                      },
                    }}
                  >
                    Közösség
                  </Typography>
                  <Typography 
                    variant="body1" 
                    sx={{ 
                      color: darkMode ? '#ccc' : '#666',
                      fontSize: {
                        xs: '0.9rem',
                        sm: '1rem'
                      },
                      lineHeight: 1.7,
                      flex: 1
                    }}
                  >
                    Az Adali Clothing több mint egy ruhamárka - egy közösség vagyunk. Támogatjuk a helyi kezdeményezéseket, és bevételeink egy részét jótékonysági szervezeteknek adományozzuk, hogy pozitív változást hozzunk a világba.
                  </Typography>
                </CardContent>
              </StyledCard>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Team Section */}
      <StyledSection darkMode={darkMode}>
        <Container maxWidth="lg">
          <Box sx={{ 
            textAlign: 'center', 
            mb: 6,
            ...fadeIn,
            animationDelay: '1.5s'
          }}>
            <Typography 
              variant="h3" 
              sx={{ 
                fontWeight: 'bold',
                mb: 4,
                color: darkMode ? '#fff' : '#333',
                fontSize: {
                  xs: '1.75rem',
                  sm: '2.25rem',
                  md: '2.5rem'
                },
              }}
            >
              Csapatunk
            </Typography>
            <Typography 
              variant="h6" 
              sx={{ 
                color: darkMode ? '#ccc' : '#666',
                maxWidth: '800px',
                margin: '0 auto',
                fontSize: {
                  xs: '0.9rem',
                  sm: '1rem',
                  md: '1.1rem'
                },
              }}
            >
              Ismerd meg a szenvedélyes szakembereket, akik az Adali Clothing mögött állnak
            </Typography>
          </Box>

          <Grid 
  container 
  spacing={2} 
  sx={{ 
    justifyContent: 'center', 
    mb: 4 
  }}
>
  <Grid item xs={12} sm={6} md={3} sx={{ ...fadeIn, animationDelay: '1.9s' }}>
    <TeamMember darkMode={darkMode}>
      <Avatar
        sx={{
          width: 120,
          height: 120,
          margin: '0 auto 16px',
          border: darkMode ? '4px solid rgba(255,255,255,0.1)' : '4px solid rgba(0,0,0,0.05)'
        }}
        alt="Réfi Ádám"
        src={adamImage} 
      />
      <Typography
        variant="h6"
        sx={{
          fontWeight: 600,
          color: darkMode ? '#fff' : '#333',
          mb: 1
        }}
      >
        Réfi Ádám
      </Typography>
      <Typography
        variant="body2"
        sx={{
          color: darkMode ? '#aaa' : '#666',
          mb: 2
        }}
      >
        Üzleti Igazgató
      </Typography>
      
    </TeamMember>
  </Grid>

  <Grid item xs={12} sm={6} md={3} sx={{ ...fadeIn, animationDelay: '2.1s' }}>
    <TeamMember darkMode={darkMode}>
      <Avatar
        sx={{
          width: 120,
          height: 120,
          margin: '0 auto 16px',
          border: darkMode ? '4px solid rgba(255,255,255,0.1)' : '4px solid rgba(0,0,0,0.05)'
        }}
        alt="Csali Máté"
        src={mutyImage} 
      />
      <Typography
        variant="h6"
        sx={{
          fontWeight: 600,
          color: darkMode ? '#fff' : '#333',
          mb: 1
        }}
      >
        Csali Máté
      </Typography>
      <Typography
        variant="body2"
        sx={{
          color: darkMode ? '#aaa' : '#666',
          mb: 2
        }}
      >
        Technológiai Vezető
      </Typography>
      
    </TeamMember>
  </Grid>
</Grid>

        </Container>
      </StyledSection>

    
      <Box sx={{ 
        backgroundColor: darkMode ? '#2d2d2d' : '#fff',
        py: 8,
        transition: 'all 0.3s ease-in-out'
      }}>
        <Container maxWidth="lg">
          <Box sx={{ 
            textAlign: 'center', 
            mb: 6,
            ...fadeIn,
            animationDelay: '2.5s'
          }}>
            <Typography 
              variant="h3" 
              sx={{ 
                fontWeight: 'bold',
                mb: 4,
                color: darkMode ? '#fff' : '#333',
                fontSize: {
                  xs: '1.75rem',
                  sm: '2.25rem',
                  md: '2.5rem'
                },
              }}
            >
              Mérföldköveink
            </Typography>
          </Box>

          <Box sx={{ 
            position: 'relative',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0,
              bottom: 0,
              left: { xs: '20px', md: '50%' },
              width: '4px',
              backgroundColor: darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
              transform: { md: 'translateX(-50%)' }
            }
          }}>
           
            <Box sx={{ 
              display: 'flex',
              flexDirection: { xs: 'column', md: 'row' },
              mb: 6,
              position: 'relative',
              ...fadeIn,
              animationDelay: '2.7s'
            }}>
                          <Box sx={{
                flex: { xs: '1', md: '0 0 50%' },
                textAlign: { xs: 'left', md: 'right' },
                pr: { md: 4 },
                pl: { xs: 5, md: 0 },
                position: 'relative'
              }}>
                <Typography 
                  variant="h5" 
                  sx={{ 
                    fontWeight: 600,
                    color: darkMode ? '#fff' : '#333',
                    mb: 1,
                    fontSize: {
                      xs: '1.25rem',
                      sm: '1.5rem'
                    },
                  }}
                >
                2024 Ősz
                </Typography>
                <Typography 
                  variant="body1" 
                  sx={{ 
                    color: darkMode ? '#ccc' : '#666',
                    fontSize: {
                      xs: '0.9rem',
                      sm: '1rem'
                    },
                    lineHeight: 1.7
                  }}
                >
                  Az Adali Clothing megalapítása. Első kollekciónk bemutatása, amely 15 fenntartható alapdarabból állt.
                </Typography>
                <Box sx={{
                  position: 'absolute',
                  left: { xs: '-40px', md: 'auto' },
                  right: { md: '-52px' },
                  top: '0',
                  width: '24px',
                  height: '24px',
                  borderRadius: '50%',
                  backgroundColor: darkMode ? '#fff' : '#333',
                  border: darkMode ? '4px solid #333' : '4px solid #fff',
                  zIndex: 1
                }} />
              </Box>
              <Box sx={{ 
                flex: { xs: '1', md: '0 0 50%' },
                pl: { md: 4 },
                pl: { xs: 5, md: 4 },
                display: { xs: 'none', md: 'block' }
              }} />
            </Box>

            
            <Box sx={{ 
              display: 'flex',
              flexDirection: { xs: 'column', md: 'row' },
              mb: 6,
              position: 'relative',
              ...fadeIn,
              animationDelay: '2.9s'
            }}>
              <Box sx={{ 
                flex: { xs: '1', md: '0 0 50%' },
                pr: { md: 4 },
                pl: { xs: 5, md: 0 },
                display: { xs: 'none', md: 'block' }
              }} />
              <Box sx={{
                flex: { xs: '1', md: '0 0 50%' },
                textAlign: { xs: 'left', md: 'left' },
                pl: { md: 4 },
                pl: { xs: 5, md: 4 },
                position: 'relative'
              }}>
                <Typography 
                  variant="h5" 
                  sx={{ 
                    fontWeight: 600,
                    color: darkMode ? '#fff' : '#333',
                    mb: 1,
                    fontSize: {
                      xs: '1.25rem',
                      sm: '1.5rem'
                    },
                  }}
                >
                2024 November
                </Typography>
                <Typography 
                  variant="body1" 
                  sx={{ 
                    color: darkMode ? '#ccc' : '#666',
                    fontSize: {
                      xs: '0.9rem',
                      sm: '1rem'
                    },
                    lineHeight: 1.7
                  }}
                >
                  Első üzletünk megnyitása Keszthelyen. Elindítottuk online webáruházunkat, hogy országszerte elérhetővé tegyük termékeinket.
                </Typography>
                <Box sx={{
                  position: 'absolute',
                  left: { xs: '-40px', md: '-52px' },
                  top: '0',
                  width: '24px',
                  height: '24px',
                  borderRadius: '50%',
                  backgroundColor: darkMode ? '#fff' : '#333',
                  border: darkMode ? '4px solid #333' : '4px solid #fff',
                  zIndex: 1
                }} />
              </Box>
            </Box>

          
            <Box sx={{ 
              display: 'flex',
              flexDirection: { xs: 'column', md: 'row' },
              mb: 6,
              position: 'relative',
              ...fadeIn,
              animationDelay: '3.1s'
            }}>
              <Box sx={{
                flex: { xs: '1', md: '0 0 50%' },
                textAlign: { xs: 'left', md: 'right' },
                pr: { md: 4 },
                pl: { xs: 5, md: 0 },
                position: 'relative'
              }}>
                <Typography 
                  variant="h5" 
                  sx={{ 
                    fontWeight: 600,
                    color: darkMode ? '#fff' : '#333',
                    mb: 1,
                    fontSize: {
                      xs: '1.25rem',
                      sm: '1.5rem'
                    },
                  }}
                >
                 2024 December
                </Typography>
                <Typography 
                  variant="body1" 
                  sx={{ 
                    color: darkMode ? '#ccc' : '#666',
                    fontSize: {
                      xs: '0.9rem',
                      sm: '1rem'
                    },
                    lineHeight: 1.7
                  }}
                >
                  Elnyertük az "Év Fenntartható Divatmárkája" díjat. Kollekciónk kibővült, és megkezdtük a nemzetközi terjeszkedést.
                </Typography>
                <Box sx={{
                  position: 'absolute',
                  left: { xs: '-40px', md: 'auto' },
                  right: { md: '-52px' },
                  top: '0',
                  width: '24px',
                  height: '24px',
                  borderRadius: '50%',
                  backgroundColor: darkMode ? '#fff' : '#333',
                  border: darkMode ? '4px solid #333' : '4px solid #fff',
                  zIndex: 1
                }} />
              </Box>
              <Box sx={{ 
                flex: { xs: '1', md: '0 0 50%' },
                pl: { md: 4 },
                pl: { xs: 5, md: 4 },
                display: { xs: 'none', md: 'block' }
              }} />
            </Box>

          
            <Box sx={{ 
              display: 'flex',
              flexDirection: { xs: 'column', md: 'row' },
              mb: 6,
              position: 'relative',
              ...fadeIn,
              animationDelay: '3.3s'
            }}>
              <Box sx={{ 
                flex: { xs: '1', md: '0 0 50%' },
                pr: { md: 4 },
                pl: { xs: 5, md: 0 },
                display: { xs: 'none', md: 'block' }
              }} />
              <Box sx={{
                flex: { xs: '1', md: '0 0 50%' },
                textAlign: { xs: 'left', md: 'left' },
                pl: { md: 4 },
                pl: { xs: 5, md: 4 },
                position: 'relative'
              }}>
                <Typography 
                  variant="h5" 
                  sx={{ 
                    fontWeight: 600,
                    color: darkMode ? '#fff' : '#333',
                    mb: 1,
                    fontSize: {
                      xs: '1.25rem',
                      sm: '1.5rem'
                    },
                  }}
                >
                 2025 Január
                </Typography>
                <Typography 
                  variant="body1" 
                  sx={{ 
                    color: darkMode ? '#ccc' : '#666',
                    fontSize: {
                      xs: '0.9rem',
                      sm: '1rem'
                    },
                    lineHeight: 1.7
                  }}
                >
                  Elindítottuk "Zöld Jövő" programunkat, amelynek keretében minden eladott termék után egy fát ültetünk. Megnyitottuk második üzletünket Balatonederics.
                </Typography>
                <Box sx={{
                  position: 'absolute',
                  left: { xs: '-40px', md: '-52px' },
                  top: '0',
                  width: '24px',
                  height: '24px',
                  borderRadius: '50%',
                  backgroundColor: darkMode ? '#fff' : '#333',
                  border: darkMode ? '4px solid #333' : '4px solid #fff',
                  zIndex: 1
                }} />
              </Box>
            </Box>

          
            <Box sx={{ 
              display: 'flex',
              flexDirection: { xs: 'column', md: 'row' },
              position: 'relative',
              ...fadeIn,
              animationDelay: '3.5s'
            }}>
              <Box sx={{
                flex: { xs: '1', md: '0 0 50%' },
                textAlign: { xs: 'left', md: 'right' },
                pr: { md: 4 },
                pl: { xs: 5, md: 0 },
                position: 'relative'
              }}>
                <Typography 
                  variant="h5" 
                  sx={{ 
                    fontWeight: 600,
                    color: darkMode ? '#fff' : '#333',
                    mb: 1,
                    fontSize: {
                      xs: '1.25rem',
                      sm: '1.5rem'
                    },
                  }}
                >
                    2025 Tavasz
                </Typography>
                <Typography 
                  variant="body1" 
                  sx={{ 
                    color: darkMode ? '#ccc' : '#666',
                    fontSize: {
                      xs: '0.9rem',
                      sm: '1rem'
                    },
                    lineHeight: 1.7
                  }}
                >
                  Jelenleg azon dolgozunk, hogy 2025-re teljesen karbonsemlegessé váljunk. Új, innovatív anyagokkal kísérletezünk, és bővítjük termékpalettánkat.
                </Typography>
                <Box sx={{
                  position: 'absolute',
                  left: { xs: '-40px', md: 'auto' },
                  right: { md: '-52px' },
                  top: '0',
                  width: '24px',
                  height: '24px',
                  borderRadius: '50%',
                  backgroundColor: darkMode ? '#fff' : '#333',
                  border: darkMode ? '4px solid #333' : '4px solid #fff',
                  zIndex: 1
                }} />
              </Box>
              <Box sx={{ 
                flex: { xs: '1', md: '0 0 50%' },
                pl: { md: 4 },
                pl: { xs: 5, md: 4 },
                display: { xs: 'none', md: 'block' }
              }} />
            </Box>
          </Box>
        </Container>
      </Box>

      {/* Testimonials Section */}
      <StyledSection darkMode={darkMode}>
        <Container maxWidth="lg">
          <Box sx={{ 
            textAlign: 'center', 
            mb: 6,
            ...fadeIn,
            animationDelay: '3.7s'
          }}>
            <Typography 
              variant="h3" 
              sx={{ 
                fontWeight: 'bold',
                mb: 4,
                color: darkMode ? '#fff' : '#333',
                fontSize: {
                  xs: '1.75rem',
                  sm: '2.25rem',
                  md: '2.5rem'
                },
              }}
            >
              Vásárlóink Mondták
            </Typography>
          </Box>

          <Grid container spacing={4}>
            <Grid item xs={12} md={4} sx={{ ...fadeIn, animationDelay: '3.9s' }}>
              <Paper
                elevation={0}
                sx={{
                  p: 3,
                  borderRadius: '16px',
                  backgroundColor: darkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)',
                  height: '100%',
                  position: 'relative',
                  '&::before': {
                    content: '"-"',
                    position: 'absolute',
                    top: '10px',
                    left: '15px',
                    fontSize: '60px',
                    color: darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
                    fontFamily: 'Georgia, serif',
                    lineHeight: 1
                  }
                }}
              >
                <Box sx={{ pl: 4, pt: 3 }}>
                  <Typography 
                    variant="body1" 
                    sx={{ 
                      color: darkMode ? '#ccc' : '#666',
                      fontSize: {
                        xs: '0.9rem',
                        sm: '1rem'
                      },
                      lineHeight: 1.7,
                      mb: 2,
                      fontStyle: 'italic'
                    }}
                  >
                    "Az Adali Clothing ruhái nemcsak gyönyörűek, hanem rendkívül kényelmesek is. Szeretem, hogy vásárlásommal a környezetet is támogatom."
                  </Typography>
                  <Typography 
                    variant="subtitle1" 
                    sx={{ 
                      fontWeight: 600,
                      color: darkMode ? '#fff' : '#333'
                    }}
                  >
                    Horváth Júlia
                  </Typography>
                  <Typography 
                    variant="body2" 
                    sx={{ 
                      color: darkMode ? '#aaa' : '#888'
                    }}
                  >
                    Törzsvásárló
                  </Typography>
                </Box>
              </Paper>
            </Grid>

            <Grid item xs={12} md={4} sx={{ ...fadeIn, animationDelay: '4.1s' }}>
              <Paper
                elevation={0}
                sx={{
                  p: 3,
                  borderRadius: '16px',
                  backgroundColor: darkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)',
                  height: '100%',
                  position: 'relative',
                  '&::before': {
                    content: '"-"',
                    position: 'absolute',
                    top: '10px',
                    left: '15px',
                    fontSize: '60px',
                    color: darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
                    fontFamily: 'Georgia, serif',
                    lineHeight: 1
                  }
                }}
              >
                <Box sx={{ pl: 4, pt: 3 }}>
                  <Typography 
                    variant="body1" 
                    sx={{ 
                      color: darkMode ? '#ccc' : '#666',
                      fontSize: {
                        xs: '0.9rem',
                        sm: '1rem'
                      },
                      lineHeight: 1.7,
                      mb: 2,
                      fontStyle: 'italic'
                    }}
                  >
                    "Imádom az Adali Clothing filozófiáját és termékeiket. A pulóverek minősége kiemelkedő, és már három éve hordom őket, még mindig úgy néznek ki, mint újkorukban."
                  </Typography>
                  <Typography 
                    variant="subtitle1" 
                    sx={{ 
                      fontWeight: 600,
                      color: darkMode ? '#fff' : '#333'
                    }}
                  >
                    Molnár Gábor
                  </Typography>
                  <Typography 
                    variant="body2" 
                    sx={{ 
                      color: darkMode ? '#aaa' : '#888'
                    }}
                  >
                    Divattervező
                  </Typography>
                </Box>
              </Paper>
            </Grid>

            <Grid item xs={12} md={4} sx={{ ...fadeIn, animationDelay: '4.3s' }}>
              <Paper
                elevation={0}
                sx={{
                  p: 3,
                  borderRadius: '16px',
                  backgroundColor: darkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)',
                  height: '100%',
                  position: 'relative',
                  '&::before': {
                    content: '"-"',
                    position: 'absolute',
                    top: '10px',
                    left: '15px',
                    fontSize: '60px',
                    color: darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
                    fontFamily: 'Georgia, serif',
                    lineHeight: 1
                  }
                }}
              >
                <Box sx={{ pl: 4, pt: 3 }}>
                  <Typography 
                    variant="body1" 
                    sx={{ 
                      color: darkMode ? '#ccc' : '#666',
                      fontSize: {
                        xs: '0.9rem',
                        sm: '1rem'
                      },
                      lineHeight: 1.7,
                      mb: 2,
                      fontStyle: 'italic'
                    }}
                  >
                    "Az Adali Clothing ügyfélszolgálata kiváló. Amikor problémám volt egy rendeléssel, azonnal segítettek és megoldották. Ritka az ilyen odafigyelés manapság."
                  </Typography>
                  <Typography 
                    variant="subtitle1" 
                    sx={{ 
                      fontWeight: 600,
                      color: darkMode ? '#fff' : '#333'
                    }}
                  >
                    Kiss Bence
                  </Typography>
                  <Typography 
                    variant="body2" 
                    sx={{ 
                      color: darkMode ? '#aaa' : '#888'
                    }}
                  >
                    Marketing szakember
                  </Typography>
                </Box>
              </Paper>
            </Grid>
          </Grid>
        </Container>
      </StyledSection>

      {/* Contact Section */}
      <Box sx={{ 
        backgroundColor: darkMode ? '#2d2d2d' : '#fff',
        py: 8,
        transition: 'all 0.3s ease-in-out'
      }}>
        <Container maxWidth="lg">
          <Box sx={{ 
            textAlign: 'center', 
            mb: 6,
            ...fadeIn,
            animationDelay: '4.5s'
          }}>
            <Typography 
              variant="h3" 
              sx={{ 
                fontWeight: 'bold',
                mb: 4,
                color: darkMode ? '#fff' : '#333',
                fontSize: {
                  xs: '1.75rem',
                  sm: '2.25rem',
                  md: '2.5rem'
                },
              }}
            >
              Kapcsolat
            </Typography>
            <Typography 
              variant="h6" 
              sx={{ 
                color: darkMode ? '#ccc' : '#666',
                maxWidth: '800px',
                margin: '0 auto',
                fontSize: {
                  xs: '0.9rem',
                  sm: '1rem',
                  md: '1.1rem'
                },
              }}
            >
              Kérdésed van? Vedd fel velünk a kapcsolatot!
            </Typography>
          </Box>

          <Grid container spacing={4}>
            <Grid item xs={12} md={6} sx={{ ...fadeIn, animationDelay: '4.7s' }}>
              <StyledCard darkMode={darkMode}>
                <CardContent sx={{ p: 4 }}>
                  <Typography 
                    variant="h5" 
                    sx={{ 
                      mb: 3, 
                      fontWeight: 600,
                      color: darkMode ? '#fff' : '#333',
                      fontSize: {
                        xs: '1.25rem',
                        sm: '1.5rem'
                      },
                    }}
                  >
                    Elérhetőségeink
                  </Typography>
                  
                  <Box sx={{ mb: 3 }}>
                    <Typography 
                      variant="subtitle1" 
                      sx={{ 
                        fontWeight: 600,
                        color: darkMode ? '#fff' : '#333',
                        mb: 1
                      }}
                    >
                      Központi Iroda
                    </Typography>
                    <Typography 
                      variant="body1" 
                      sx={{ 
                        color: darkMode ? '#ccc' : '#666',
                        fontSize: {
                          xs: '0.9rem',
                          sm: '1rem'
                        },
                        lineHeight: 1.7
                      }}
                    >
                     8360 Keszthely, főtér 10.
                    </Typography>
                  </Box>
                  
                  <Box sx={{ mb: 3 }}>
                    <Typography 
                      variant="subtitle1" 
                      sx={{ 
                        fontWeight: 600,
                        color: darkMode ? '#fff' : '#333',
                        mb: 1
                      }}
                    >
                      Üzleteink
                    </Typography>
                    <Typography 
                      variant="body1" 
                      sx={{ 
                        color: darkMode ? '#ccc' : '#666',
                        fontSize: {
                          xs: '0.9rem',
                          sm: '1rem'
                        },
                        lineHeight: 1.7,
                        mb: 1
                      }}
                    >
                      Keszthely: 8360 Keszthely, főtér 10.
                      
                    </Typography>
                    <Typography 
                      variant="body1" 
                      sx={{ 
                        color: darkMode ? '#ccc' : '#666',
                        fontSize: {
                          xs: '0.9rem',
                          sm: '1rem'
                        },
                        lineHeight: 1.7
                      }}
                    >
                     Balatonederics:8312 Balatonederics, petőfi útca 1.
                    </Typography>
                  </Box>
                  
                  <Box sx={{ mb: 3 }}>
                    <Typography 
                      variant="subtitle1" 
                      sx={{ 
                        fontWeight: 600,
                        color: darkMode ? '#fff' : '#333',
                        mb: 1
                      }}
                    >
                      Ügyfélszolgálat
                    </Typography>
                    <Typography 
                      variant="body1" 
                      sx={{ 
                        color: darkMode ? '#ccc' : '#666',
                        fontSize: {
                          xs: '0.9rem',
                          sm: '1rem'
                        },
                        lineHeight: 1.7,
                        mb: 1
                      }}
                    >
                      Telefon: +36306456285
                    </Typography>
                    <Typography 
                      variant="body1" 
                      sx={{ 
                        color: darkMode ? '#ccc' : '#666',
                        fontSize: {
                          xs: '0.9rem',
                          sm: '1rem'
                        },
                        lineHeight: 1.7
                      }}
                    >
                      Email: adaliclothing@gmail.com
                    </Typography>
                  </Box>
                  
                  
                </CardContent>
              </StyledCard>
            </Grid>

            <Grid item xs={12} md={6} sx={{ ...fadeIn, animationDelay: '4.9s' }}>
              <Box
                component="iframe"
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2734.5982825491097!2d17.24551931560868!3d46.76073597913761!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x476916b33de9c23d%3A0x5f59641018806ac5!2zS2VzenRoZWx5LCBGxZF0w6lyIDEwLCA4MzYw!5e0!3m2!1shu!2shu!4v1680000000000!5m2!1shu!2shu"
                sx={{
                  width: '100%',
                  height: '400px',
                  border: 0,
                  borderRadius: '16px',
                  boxShadow: darkMode
                    ? '0 8px 32px rgba(0, 0, 0, 0.3)'
                    : '0 8px 32px rgba(0, 0, 0, 0.1)',
                }}
                allowFullScreen=""
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </Grid>
          </Grid>
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
      </Box>

    
      <Footer />
    </Box>
  );
};

export default AboutUs;
