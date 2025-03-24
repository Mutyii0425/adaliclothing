import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Box, 
  Typography, 
  Button, 
  CircularProgress, 
  Paper, 
  Grid, 
  Card, 
  CardContent,
  Divider,
  Alert,
  Snackbar,
  IconButton,
  Tooltip,
  Container,
  useTheme,
  useMediaQuery,
  Dialog,
  DialogContent,
  DialogTitle,
  FormGroup,
  FormControlLabel,
  Switch,
  ClickAwayListener,
  Grow,
  Popper,
  MenuItem,
  MenuList,
  Badge
} from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';
import CloseIcon from '@mui/icons-material/Close';
import InfoIcon from '@mui/icons-material/Info';
import ColorLensIcon from '@mui/icons-material/ColorLens';
import StyleIcon from '@mui/icons-material/Style';
import AccessibilityNewIcon from '@mui/icons-material/AccessibilityNew';
import FaceIcon from '@mui/icons-material/Face';
import MenuIcon from '@mui/icons-material/Menu';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import { styled } from '@mui/material/styles';
import { motion } from 'framer-motion';
import Menu from './menu2';
import Footer from './footer';

const Input = styled('input')({
  display: 'none',
});

const ColorSwatch = styled(Box)(({ color }) => ({
  width: 30,
  height: 30,
  backgroundColor: color,
  borderRadius: 4,
  border: '1px solid rgba(0, 0, 0, 0.12)',
  boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
}));

const MotionBox = styled(motion.div)({
  width: '100%'
});

const PersonalStyleAdvisor = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [darkMode, setDarkMode] = useState(true);
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [cameraActive, setCameraActive] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' });
  const [infoDialogOpen, setInfoDialogOpen] = useState(false);
  const [resultDialogOpen, setResultDialogOpen] = useState(false);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const fileInputRef = useRef(null);
  const [sideMenuActive, setSideMenuActive] = useState(false);
  const cartItems = JSON.parse(localStorage.getItem('cartItems')) || [];
  const cartItemCount = cartItems.reduce((total, item) => total + item.mennyiseg, 0);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [open, setOpen] = useState(false);
  const anchorRef = useRef(null);
  const [userName, setUserName] = useState('');
  const [showLogoutAlert, setShowLogoutAlert] = useState(false);

  // Sötét mód beállítása a localStorage alapján
  useEffect(() => {
    const savedDarkMode = localStorage.getItem('darkMode');
    if (savedDarkMode !== null) {
      setDarkMode(savedDarkMode === 'true');
    }
  }, []);

  // Bejelentkezési állapot ellenőrzése
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

  // Oldalsó menü kezelése
  useEffect(() => {
    if (sideMenuActive) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
  }, [sideMenuActive]);

  // Első betöltéskor mutassunk egy rövid útmutatót
  useEffect(() => {
    setTimeout(() => {
      setInfoDialogOpen(true);
    }, 500);
  }, []);

  // Fejléc függvények
  const toggleSideMenu = () => {
    setSideMenuActive((prev) => !prev);
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

  const handleCartClick = () => {
    navigate('/kosar');
  };

  // Fájl kiválasztása
  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setSnackbar({
          open: true,
          message: 'A fájl mérete nem lehet nagyobb 5MB-nál',
          severity: 'error'
        });
        return;
      }
      
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setResult(null);
      setError('');
      
      // Ha a kamera aktív, leállítjuk
      if (cameraActive) {
        stopCamera();
      }
      
      setSnackbar({
        open: true,
        message: 'Kép sikeresen kiválasztva!',
        severity: 'success'
      });
    }
  };

  // Kamera indítása
  const startCamera = async () => {
    try {
      setCameraActive(true);
      setSelectedFile(null);
      setPreviewUrl('');
      setResult(null);
      setError('');
      
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' } 
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      
      setSnackbar({
        open: true,
        message: 'Kamera aktiválva. Készíts egy képet!',
        severity: 'info'
      });
    } catch (err) {
      console.error('Kamera hiba:', err);
      setError('Nem sikerült hozzáférni a kamerához: ' + err.message);
      setCameraActive(false);
      
      setSnackbar({
        open: true,
        message: 'Nem sikerült hozzáférni a kamerához',
        severity: 'error'
      });
    }
  };

  // Kamera leállítása
  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const tracks = videoRef.current.srcObject.getTracks();
      tracks.forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
    setCameraActive(false);
  };

  // Kép készítése a kamerával
  const captureImage = () => {
    if (!videoRef.current || !canvasRef.current) return;
    
    const video = videoRef.current;
    const canvas = canvasRef.current;
    
    // Canvas méretének beállítása a videó méretére
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    // Kép rajzolása a canvas-ra
    const context = canvas.getContext('2d');
    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    
    // Canvas konvertálása base64 képpé
    const imageDataUrl = canvas.toDataURL('image/jpeg');
    setPreviewUrl(imageDataUrl);
    
    // Kamera leállítása
    stopCamera();
    
    // Eredmények törlése
    setResult(null);
    
    setSnackbar({
      open: true,
      message: 'Kép sikeresen elkészítve!',
      severity: 'success'
    });
  };

  // Kép elemzése
  const analyzeImage = async () => {
    console.log('Kép elemzése kezdődik a frontend oldalon...');
    
    if (!selectedFile && !previewUrl) {
      setSnackbar({
        open: true,
        message: 'Kérlek válassz ki vagy készíts egy képet',
        severity: 'warning'
      });
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      let response;
      
      if (selectedFile) {
        console.log('Fájl feltöltése:', selectedFile.name);
        const formData = new FormData();
        formData.append('image', selectedFile);
        
        response = await fetch('http://localhost:5000/api/style/analyze-person', {
          method: 'POST',
          body: formData
        });
      } else if (previewUrl) {
        console.log('Base64 kép küldése');
        response = await fetch('http://localhost:5000/api/style/analyze-base64', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ image: previewUrl })
        });
      }
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Hiba történt a kép elemzése során');
      }
      
      const data = await response.json();
      console.log('API válasz:', data);
    
      setResult(data);
      
      setSnackbar({
        open: true,
        message: 'Stíluselemzés sikeresen elkészült!',
        severity: 'success'
      });
      
      // Nyissuk meg az eredmény dialógust
      setResultDialogOpen(true);
    } catch (err) {
      console.error('Elemzési hiba:', err);
      setError(err.message || 'Hiba történt a kép elemzése során');
      
      setSnackbar({
        open: true,
        message: err.message || 'Hiba történt a kép elemzése során',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  // Új kép választása
  const handleNewImage = () => {
    setSelectedFile(null);
    setPreviewUrl('');
    setResult(null);
    setError('');
    
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Snackbar bezárása
  const handleCloseSnackbar = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setSnackbar({ ...snackbar, open: false });
  };

  // Fő háttérszín és szövegszín a sötét/világos mód alapján
  const mainBgColor = darkMode ? '#121212' : '#f5f5f5';
  const mainTextColor = darkMode ? '#ffffff' : '#333333';
  const primaryColor = darkMode ? '#90caf9' : '#1976d2';
  const secondaryColor = darkMode ? '#f48fb1' : '#dc004e';
  const paperBgColor = darkMode ? '#1e1e1e' : '#ffffff';
  const borderColor = darkMode ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.12)';

  const colors = {
    dark: {
      background: '#121212',
      paper: '#1e1e1e',
      text: {
        primary: '#ffffff',
        secondary: '#b0b0b0',
        disabled: '#6c6c6c'
      },
      primary: '#90caf9',
      secondary: '#f48fb1',
      border: 'rgba(255, 255, 255, 0.12)',
      divider: 'rgba(255, 255, 255, 0.12)',
      action: {
        hover: 'rgba(255, 255, 255, 0.08)',
        selected: 'rgba(255, 255, 255, 0.16)'
      }
    },
    light: {
      background: '#f5f5f5',
      paper: '#ffffff',
      text: {
        primary: '#333333',
        secondary: '#666666',
        disabled: '#999999'
      },
      primary: '#1976d2',
      secondary: '#dc004e',
      border: 'rgba(0, 0, 0, 0.12)',
      divider: 'rgba(0, 0, 0, 0.12)',
      action: {
        hover: 'rgba(0, 0, 0, 0.04)',
        selected: 'rgba(0, 0, 0, 0.08)'
      }
    }
  };
  
  // Aktuális színséma kiválasztása
  const currentColors = darkMode ? colors.dark : colors.light;
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
   
         <FormGroup
           sx={{
             position: 'absolute',
             top: 60,
             right: 20,
           }}
         >
           <FormControlLabel
             control={
               <Switch
              
                 color="default"
                 sx={{
                   color: 'black',
                 }}
                 checked={darkMode}
                 onChange={() => setDarkMode((prev) => !prev)}
               />
             }
             label="Dark Mode"
           />
         </FormGroup>

      <Container maxWidth="xl" sx={{ py: 4 }}>
        <MotionBox
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Box sx={{ mb: 4, display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
            <Typography 
              variant={isMobile ? "h5" : "h4"} 
              component="h1"
              sx={{ 
                fontWeight: 600,
                color: mainTextColor,
                flexGrow: 1,
                textAlign: isMobile ? 'center' : 'center',
              }}
            >
              Személyes Stílustanácsadó
              <Tooltip title="Információ a szolgáltatásról">
                <IconButton 
                  size="small" 
                  sx={{ ml: 1, color: primaryColor }}
                  onClick={() => setInfoDialogOpen(true)}
                >
                  <InfoIcon />
                </IconButton>
              </Tooltip>
            </Typography>
          </Box>
          
          <Typography 
            variant="body1" 
            paragraph 
            align="center" 
            sx={{ 
              mb: 4,
              maxWidth: 800,
              mx: 'auto',
              color: darkMode ? '#ccc' : '#555',
              lineHeight: 1.6
            }}
          >
            Tölts fel egy képet magadról, és az AI segít meghatározni a személyes stílusodat,
            színtípusodat, és személyre szabott öltözködési tanácsokat ad.
          </Typography>

          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <MotionBox
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <Paper 
                  elevation={darkMode ? 4 : 2} 
                  sx={{ 
                    p: 2, 
                    backgroundColor: paperBgColor,
                    border: darkMode ? 'none' : '1px solid #000000',
                    borderRadius: 2,
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column'
                  }}
                >
                  <Typography 
                    variant="h6" 
                    gutterBottom
                    sx={{ color: primaryColor, mb: 2 }}
                  >
                    Kép feltöltése vagy készítése
                  </Typography>

                  {!cameraActive && !previewUrl && (
                    <Box 
                      sx={{ 
                        border: '2px dashed',
                        borderColor: darkMode ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.1)',
                        borderRadius: 2,
                        p: 4,
                        textAlign: 'center',
                        mb: 3,
                        backgroundColor: darkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)',
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          borderColor: primaryColor,
                          backgroundColor: darkMode ? 'rgba(144, 202, 249, 0.1)' : 'rgba(25, 118, 210, 0.05)'
                        }
                      }}
                    >
                      <Input
                        ref={fileInputRef}
                        accept="image/*"
                        id="contained-button-file"
                        type="file"
                        onChange={handleFileChange}
                      />
                      <label htmlFor="contained-button-file">
                        <Button
                          variant="contained"
                          component="span"
                          startIcon={<CloudUploadIcon />}
                          sx={{ 
                            mb: 2,
                            backgroundColor: primaryColor,
                            '&:hover': {
                              backgroundColor: darkMode ? '#42a5f5' : '#115293'
                            }
                          }}
                        >
                          Kép feltöltése
                        </Button>
                      </label>
                      <Typography variant="body2" sx={{ color: darkMode ? '#aaa' : '#666' }}>
                        vagy
                      </Typography>
                      <Button
                        variant="outlined"
                        onClick={startCamera}
                        startIcon={<PhotoCameraIcon />}
                        sx={{ 
                          mt: 2,
                          borderColor: primaryColor,
                          color: primaryColor,
                          '&:hover': {
                            borderColor: darkMode ? '#42a5f5' : '#115293',
                            backgroundColor: darkMode ? 'rgba(144, 202, 249, 0.1)' : 'rgba(25, 118, 210, 0.05)'
                          }
                        }}
                      >
                        Kamera használata
                      </Button>
                    </Box>
                  )}

                  {cameraActive && (
                    <Box sx={{ textAlign: 'center', mb: 3 }}>
                      <video
                        ref={videoRef}
                        autoPlay
                        playsInline
                        style={{ 
                          width: '100%', 
                          maxHeight: 400, 
                          borderRadius: 8,
                          boxShadow: darkMode ? '0 4px 12px rgba(0,0,0,0.4)' : '0 4px 12px rgba(0,0,0,0.1)'
                        }}
                      />
                      <Box sx={{ mt: 2, display: 'flex', justifyContent: 'center', gap: 2 }}>
                        <Button
                          variant="contained"
                          onClick={captureImage}
                          startIcon={<PhotoCameraIcon />}
                          sx={{ 
                            backgroundColor: '#4caf50',
                            '&:hover': {
                              backgroundColor: '#388e3c'
                            }
                          }}
                        >
                          Kép készítése
                        </Button>
                        <Button
                          variant="outlined"
                          onClick={stopCamera}
                          color="error"
                        >
                          Mégse
                        </Button>
                      </Box>
                      <canvas ref={canvasRef} style={{ display: 'none' }} />
                    </Box>
                  )}

                  {previewUrl && (
                    <Box sx={{ textAlign: 'center', mb: 3 }}>
                      <Box
                        component="img"
                        src={previewUrl}
                        alt="Előnézet"
                        sx={{ 
                          width: '100%', 
                          maxHeight: 400, 
                          objectFit: 'contain',
                          borderRadius: 2,
                          boxShadow: darkMode ? '0 4px 12px rgba(0,0,0,0.4)' : '0 4px 12px rgba(0,0,0,0.1)'
                        }}
                      />
                      <Box sx={{ mt: 2, display: 'flex', justifyContent: 'center', gap: 2 }}>
                        <Button
                          variant="contained"
                          onClick={analyzeImage}
                          disabled={loading}
                          sx={{ 
                            backgroundColor: primaryColor,
                            '&:hover': {
                              backgroundColor: darkMode ? '#42a5f5' : '#115293'
                            }
                          }}
                        >
                          {loading ? (
                            <>
                              <CircularProgress size={24} sx={{ color: '#fff', mr: 1 }} />
                              Elemzés...
                            </>
                          ) : 'Stílus elemzése'}
                        </Button>
                        <Button
                          variant="outlined"
                          onClick={handleNewImage}
                          disabled={loading}
                          color="error"
                        >
                          Új kép
                        </Button>
                      </Box>
                    </Box>
                  )}

                  {error && (
                    <Alert 
                      severity="error" 
                      sx={{ 
                        mb: 2,
                        backgroundColor: darkMode ? 'rgba(211, 47, 47, 0.2)' : undefined,
                        color: darkMode ? '#f44336' : undefined,
                        '& .MuiAlert-icon': {
                          color: darkMode ? '#f44336' : undefined
                        }
                      }}
                    >
                      {error}
                    </Alert>
                  )}
                </Paper>
              </MotionBox>
            </Grid>

            <Grid item xs={12} md={6}>
              <MotionBox
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
              >
                <Paper 
                  elevation={darkMode ? 4 : 2} 
                  sx={{ 
                    p: 3, 
                    border: darkMode ? 'none' : '1px solid #000000',
                    backgroundColor: paperBgColor,
                    borderRadius: 2,
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column'
                    
                  }}
                >
                  <Typography 
                    variant="h6" 
                    gutterBottom
                    sx={{ color: primaryColor, mb: 2 }}
                  >
                    Stíluselemzés eredménye
                  </Typography>

                  {!result && !loading && (
                                       <Box 
                                       sx={{ 
                                         display: 'flex', 
                                         flexDirection: 'column', 
                                         alignItems: 'center', 
                                         justifyContent: 'center',
                                         height: '100%',
                                         minHeight: 200,
                                         color: darkMode ? '#aaa' : '#666'
                                       }}
                                     >
                                       <InfoIcon sx={{ fontSize: 48, mb: 2, opacity: 0.5 }} />
                                       <Typography variant="body1" align="center">
                                         Tölts fel egy képet és kattints a "Stílus elemzése" gombra a személyes stíluselemzés megkezdéséhez
                                       </Typography>
                                     </Box>
                                   )}
                 
                                   {loading && (
                                     <Box 
                                       sx={{ 
                                         display: 'flex', 
                                         flexDirection: 'column', 
                                         alignItems: 'center', 
                                         justifyContent: 'center',
                                         height: '100%',
                                         minHeight: 200
                                       }}
                                     >
                                       <CircularProgress size={60} sx={{ mb: 3, color: primaryColor }} />
                                       <Typography variant="h6" align="center" sx={{ mb: 1 }}>
                                         Stíluselemzés folyamatban...
                                       </Typography>
                                       <Typography variant="body2" align="center" sx={{ color: darkMode ? '#aaa' : '#666' }}>
                                         Az AI most elemzi a képet és személyre szabott stílustanácsokat készít
                                       </Typography>
                                     </Box>
                                   )}
                 
                                   {result && (
                                  <Box sx={{ mt: 1, overflowY: 'auto' }}>
                                    <Card 
                                      variant="outlined" 
                                      sx={{ 
                                        mb: 3, 
                                        backgroundColor: darkMode ? 'rgba(144, 202, 249, 0.1)' : 'rgba(25, 118, 210, 0.05)',
                                        borderColor: darkMode ? 'rgba(144, 202, 249, 0.3)' : 'rgba(25, 118, 210, 0.2)',
                                        borderRadius: 2
                                      }}
                                    >
                                      <CardContent>
                                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                          <ColorLensIcon sx={{ mr: 1, color: currentColors.primary }} />
                                          <Typography 
                                            variant="subtitle1" 
                                            sx={{ 
                                              fontWeight: 600, 
                                              color: currentColors.primary
                                            }}
                                          >
                                            Színtípus
                                          </Typography>
                                        </Box>
                                        <Typography variant="body1" sx={{ mb: 2, color: currentColors.text.primary }}>
                                          {result.colorType}
                                        </Typography>
                                        
                                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                          <AccessibilityNewIcon sx={{ mr: 1, color: currentColors.primary }} />
                                          <Typography 
                                            variant="subtitle1" 
                                            sx={{ 
                                              fontWeight: 600, 
                                              color: currentColors.primary
                                            }}
                                          >
                                            Testalkat
                                          </Typography>
                                        </Box>
                                        <Typography variant="body1" sx={{ mb: 2, color: currentColors.text.primary }}>
                                          {result.bodyType}
                                        </Typography>
                                        
                                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                          <FaceIcon sx={{ mr: 1, color: currentColors.primary }} />
                                          <Typography 
                                            variant="subtitle1" 
                                            sx={{ 
                                              fontWeight: 600, 
                                              color: currentColors.primary
                                            }}
                                          >
                                            Arcforma
                                          </Typography>
                                        </Box>
                                        <Typography variant="body1" sx={{ mb: 2, color: currentColors.text.primary }}>
                                          {result.faceShape}
                                        </Typography>
                                        
                                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                          <StyleIcon sx={{ mr: 1, color: currentColors.primary }} />
                                          <Typography 
                                            variant="subtitle1" 
                                            sx={{ 
                                              fontWeight: 600, 
                                              color: currentColors.primary
                                            }}
                                          >
                                            Javasolt stílus
                                          </Typography>
                                        </Box>
                                        <Typography variant="body1" sx={{ mb: 2, color: currentColors.text.primary }}>
                                          {result.recommendedStyle}
                                        </Typography>
                                        
                                        <Divider sx={{ my: 2 }} />
                                        
                                        <Typography 
                                          variant="subtitle1" 
                                          sx={{ 
                                            fontWeight: 600, 
                                            mb: 1,
                                            color: currentColors.primary
                                          }}
                                        >
                                          Ajánlott színek
                                        </Typography>
                                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 2 }}>
                                          {result.recommendedColors && result.recommendedColors.map((color, index) => (
                                            <Tooltip key={index} title={color.name} arrow>
                                              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                                <ColorSwatch color={color.hex} />
                                                <Typography variant="caption" sx={{ mt: 0.5, color: currentColors.text.primary }}>
                                                  {color.name}
                                                </Typography>
                                              </Box>
                                            </Tooltip>
                                          ))}
                                        </Box>
                                        
                                        <Typography 
                                          variant="subtitle1" 
                                          sx={{ 
                                            fontWeight: 600, 
                                            mb: 1,
                                            color: currentColors.primary
                                          }}
                                        >
                                          Kerülendő színek
                                        </Typography>
                                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 2 }}>
                                          {result.avoidColors && result.avoidColors.map((color, index) => (
                                            <Tooltip key={index} title={color.name} arrow>
                                              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                                <ColorSwatch color={color.hex} />
                                                <Typography variant="caption" sx={{ mt: 0.5, color: currentColors.text.primary }}>
                                                  {color.name}
                                                </Typography>
                                              </Box>
                                            </Tooltip>
                                          ))}
                                        </Box>
                                        
                                        <Divider sx={{ my: 2 }} />
                                        
                                        <Typography 
                                          variant="subtitle1" 
                                          sx={{ 
                                            fontWeight: 600, 
                                            mb: 1,
                                            color: currentColors.primary
                                          }}
                                        >
                                          Stílustanácsok
                                        </Typography>
                                        <Typography 
                                          variant="body2" 
                                          sx={{ 
                                            whiteSpace: 'pre-line',
                                            lineHeight: 1.6,
                                            color: currentColors.text.primary
                                          }}
                                        >
                                          {result.styleAdvice}
                                        </Typography>
                                      </CardContent>
                                    </Card>
                                  </Box>
                                )}

                                 </Paper>
                               </MotionBox>
                             </Grid>
                           </Grid>
                 
                           <Box sx={{ mt: 4, textAlign: 'center' }}>
                             <Divider sx={{ mb: 3 }} />
                             <Typography variant="body2" sx={{ color: darkMode ? '#aaa' : '#666' }}>
                               A Személyes Stílustanácsadó a Google Cloud Vision AI technológiáját használja.
                               A szolgáltatás pontossága a feltöltött képek minőségétől függően változhat.
                             </Typography>
                           </Box>
                         </MotionBox>
                       </Container>
                 
                       {/* Információs dialógus */}
                       <Dialog
                         open={infoDialogOpen}
                         onClose={() => setInfoDialogOpen(false)}
                         maxWidth="sm"
                         fullWidth
                         PaperProps={{
                           sx: {
                             backgroundColor: paperBgColor,
                             borderRadius: 2,
                             boxShadow: darkMode 
                               ? '0 8px 32px rgba(0,0,0,0.5)' 
                               : '0 8px 32px rgba(0,0,0,0.1)',
                           }
                         }}
                       >
                         <DialogTitle sx={{ 
                           color: primaryColor,
                           borderBottom: '1px solid',
                           borderColor: darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
                           pb: 2
                         }}>
                           Személyes Stílustanácsadó - Útmutató
                           <IconButton
                             onClick={() => setInfoDialogOpen(false)}
                             sx={{
                               position: 'absolute',
                               top: 8,
                               right: 8,
                               color: darkMode ? '#aaa' : '#666'
                             }}
                           >
                             <CloseIcon />
                           </IconButton>
                         </DialogTitle>
                         
                         <DialogContent sx={{ py: 3 }}>
                        <Typography variant="body1" paragraph sx={{ color: '#ffffff' }}>
                          Üdvözöljük a Személyes Stílustanácsadó szolgáltatásban! Ez a funkció segít meghatározni a személyes stílusodat és színtípusodat.
                        </Typography>
                        
                        <Typography variant="subtitle1" sx={{ fontWeight: 600, mt: 2, mb: 1, color: '#ffffff' }}>
                          Hogyan működik?
                        </Typography>
                        
                        <Typography variant="body2" paragraph sx={{ color: '#ffffff' }}>
                          1. Tölts fel egy képet magadról vagy készíts egy fotót a kamerával
                        </Typography>
                        
                        <Typography variant="body2" paragraph sx={{ color: '#ffffff' }}>
                          2. Kattints a "Stílus elemzése" gombra
                        </Typography>
                        
                        <Typography variant="body2" paragraph sx={{ color: '#ffffff' }}>
                          3. Az AI elemzi a képet és meghatározza a színtípusodat, testakatodat, arcformádat és javasolt stílusodat
                        </Typography>
                        
                        <Typography variant="body2" paragraph sx={{ color: '#ffffff' }}>
                          4. Az eredmények alapján személyre szabott öltözködési tanácsokat kapsz
                        </Typography>
                        
                        <Typography variant="subtitle1" sx={{ fontWeight: 600, mt: 2, mb: 1, color: '#ffffff' }}>
                          Tippek a legjobb eredményekért:
                        </Typography>
                        
                        <Typography variant="body2" paragraph sx={{ color: '#ffffff' }}>
                          • Használj természetes fényt a képek készítésekor
                        </Typography>
                        
                        <Typography variant="body2" paragraph sx={{ color: '#ffffff' }}>
                          • A kép lehetőleg az egész alakodat vagy legalább az arcodat és vállaidat mutassa
                        </Typography>
                        
                        <Typography variant="body2" paragraph sx={{ color: '#ffffff' }}>
                          • Kerüld az erős szűrőket és a túlzott képszerkesztést
                        </Typography>
                        
                        <Button
                          variant="contained"
                          onClick={() => setInfoDialogOpen(false)}
                          fullWidth
                          sx={{ 
                            mt: 2,
                            backgroundColor: primaryColor,
                            '&:hover': {
                              backgroundColor: darkMode ? '#42a5f5' : '#115293'
                            }
                          }}
                        >
                          Értettem
                        </Button>
                      </DialogContent>
                       </Dialog>
                 
                       {/* Eredmény dialógus */}
                       <Dialog
                         open={resultDialogOpen}
                         onClose={() => setResultDialogOpen(false)}
                         maxWidth="md"
                         fullWidth
                         PaperProps={{
                           sx: {
                             backgroundColor: paperBgColor,
                             borderRadius: 2,
                             boxShadow: darkMode 
                               ? '0 8px 32px rgba(0,0,0,0.5)' 
                               : '0 8px 32px rgba(0,0,0,0.1)',
                           }
                         }}
                       >
                         <DialogTitle sx={{ 
                           color: '#4caf50',
                           borderBottom: '1px solid',
                           borderColor: darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
                           pb: 2
                         }}>
                           Stíluselemzés elkészült!
                           <IconButton
                             onClick={() => setResultDialogOpen(false)}
                             sx={{
                               position: 'absolute',
                               top: 8,
                               right: 8,
                               color: darkMode ? '#aaa' : '#666'
                             }}
                           >
                             <CloseIcon />
                           </IconButton>
                         </DialogTitle>
                         
                         <DialogContent sx={{ py: 3 }}>
  <Grid container spacing={3}>
    <Grid item xs={12} sm={5}>
      <Box
        component="img"
        src={previewUrl}
        alt="Elemzett kép"
        sx={{ 
          width: '100%', 
          borderRadius: 2,
          boxShadow: darkMode ? '0 4px 12px rgba(0,0,0,0.4)' : '0 4px 12px rgba(0,0,0,0.1)'
        }}
      />
    </Grid>
    
    <Grid item xs={12} sm={7}>
      <Typography variant="h6" gutterBottom sx={{ color: currentColors.primary }}>
        Személyes stíluselemzés
      </Typography>
      
      <Box sx={{ mb: 2 }}>
        <Typography variant="subtitle2" sx={{ color: currentColors.text.secondary }}>
          Színtípus:
        </Typography>
        <Typography variant="body1" sx={{ fontWeight: 500, color: currentColors.text.primary }}>
          {result?.colorType}
        </Typography>
      </Box>
      
      <Box sx={{ mb: 2 }}>
        <Typography variant="subtitle2" sx={{ color: currentColors.text.secondary }}>
          Testalkat:
        </Typography>
        <Typography variant="body1" sx={{ fontWeight: 500, color: currentColors.text.primary }}>
          {result?.bodyType}
        </Typography>
      </Box>
      
      <Box sx={{ mb: 2 }}>
        <Typography variant="subtitle2" sx={{ color: currentColors.text.secondary }}>
          Arcforma:
        </Typography>
        <Typography variant="body1" sx={{ fontWeight: 500, color: currentColors.text.primary }}>
          {result?.faceShape}
        </Typography>
      </Box>
      
      <Box sx={{ mb: 2 }}>
        <Typography variant="subtitle2" sx={{ color: currentColors.text.secondary }}>
          Javasolt stílus:
        </Typography>
        <Typography variant="body1" sx={{ fontWeight: 500, color: currentColors.text.primary }}>
          {result?.recommendedStyle}
        </Typography>
      </Box>
      
      <Box sx={{ mb: 2 }}>
        <Typography variant="subtitle2" sx={{ color: currentColors.text.secondary }}>
          Ajánlott színek:
        </Typography>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1 }}>
          {result?.recommendedColors && result.recommendedColors.map((color, index) => (
            <Tooltip key={index} title={color.name} arrow>
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mr: 1 }}>
                <ColorSwatch color={color.hex} />
                <Typography variant="caption" sx={{ mt: 0.5, color: currentColors.text.primary }}>
                  {color.name}
                </Typography>
              </Box>
            </Tooltip>
                  ))}
                </Box>
              </Box>
              
              <Box sx={{ mt: 3 }}>
                <Button
                  variant="contained"
                  color="success"
                  onClick={() => setResultDialogOpen(false)}
                  fullWidth
                  sx={{ 
                    py: 1.5,
                    backgroundColor: '#4caf50',
                    '&:hover': {
                      backgroundColor: '#388e3c'
                    }
                  }}
                >
                  Értettem
                </Button>
              </Box>
            </Grid>
          </Grid>
        </DialogContent>
      </Dialog>

      {/* Kijelentkezés megerősítő dialógus */}
      <Dialog
        open={showLogoutAlert}
        onClose={() => setShowLogoutAlert(false)}
        PaperProps={{
          sx: {
            backgroundColor: paperBgColor,
            color: mainTextColor
          }
        }}
      >
        <DialogTitle>Kijelentkezés</DialogTitle>
        <DialogContent>
          <Typography>Biztosan ki szeretnél jelentkezni?</Typography>
        </DialogContent>
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', p: 2 }}>
          <Button 
            onClick={() => setShowLogoutAlert(false)} 
            sx={{ mr: 1, color: mainTextColor }}
          >
            Mégse
          </Button>
          <Button 
            variant="contained" 
            color="primary" 
            onClick={confirmLogout}
          >
            Kijelentkezés
          </Button>
        </Box>
      </Dialog>

      {/* Snackbar értesítések */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={handleCloseSnackbar} 
          severity={snackbar.severity} 
          variant="filled"
          sx={{ 
            width: '100%',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
          }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
      <Box sx={{ 
            backgroundColor: darkMode ? '#333' : '#f5f5f5',
            backgroundImage: darkMode 
              ? 'radial-gradient(#444 1px, transparent 1px)'
              : 'radial-gradient(#e0e0e0 1px, transparent 1px)',
            backgroundSize: '20px 20px',
            pb: 8 
          }}>
          </Box>
      <Footer />
    </div>
  );
};

// Segédfüggvény a megbízhatósági szín meghatározásához
const getConfidenceColor = (confidence, darkMode) => {
  if (confidence >= 0.8) {
    return darkMode ? '#4caf50' : '#4caf50';
  } else if (confidence >= 0.6) {
    return darkMode ? '#ffb74d' : '#ff9800';
  } else {
    return darkMode ? '#f44336' : '#f44336';
  }
};

export default PersonalStyleAdvisor;

                 

