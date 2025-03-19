import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Box, Typography, Card, CardContent, IconButton, Button,
  Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, Rating as MuiRating
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import AddIcon from '@mui/icons-material/Add';
import MenuIcon from '@mui/icons-material/Menu';
import Menu from '../menu2';

const RateAdmin = () => {
  const [ratings, setRatings] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingRating, setEditingRating] = useState(null);
  const [sideMenuActive, setSideMenuActive] = useState(false);
   const navigate = useNavigate();
  const [formData, setFormData] = useState({
    felhasznalonev: '',
    rating: 0,
    velemeny: ''
  });

  const fetchRatings = async () => {
    try {
      const response = await fetch('http://localhost:5000/get-all-ratings');
      const data = await response.json();
      setRatings(data);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  useEffect(() => {
    fetchRatings();
  }, []);

  const handleEdit = (rating) => {
    setEditingRating(rating);
    setFormData({
      felhasznalonev: rating.felhasznalonev,
      rating: rating.rating,
      velemeny: rating.velemeny
    });
    setOpenDialog(true);
  };

  const handleSave = async () => {
    try {
      const checkUserResponse = await fetch(`http://localhost:5000/check-user/${formData.felhasznalonev}`);
      const userData = await checkUserResponse.json();
  
      if (userData.exists) {
        const response = await fetch('http://localhost:5000/save-rating', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            email: userData.email,
            rating: parseInt(formData.rating),
            velemeny: formData.velemeny
          })
        });
  
        if (response.ok) {
          await fetchRatings();
          setOpenDialog(false);
          setFormData({
            felhasznalonev: '',
            rating: 0,
            velemeny: ''
          });
        }
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Biztosan törölni szeretnéd ezt az értékelést?')) {
      try {
        const response = await fetch(`http://localhost:5000/delete-rating/${id}`, {
          method: 'DELETE'
        });
        if (response.ok) {
          fetchRatings();
        }
      } catch (error) {
        console.error('Error:', error);
      }
    }
  };

  return (
    <Box sx={{ 
      backgroundColor:  '#333' ,
      minHeight: '100vh',
      transition: 'all 0.3s ease-in-out'
    }}>
      {/* Header */}
      <Box sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#333',
        padding: '10px 20px',
        position: 'relative',
        width: '100%',
        boxSizing: 'border-box',
      }}>
        <IconButton
          onClick={() => setSideMenuActive(true)}
          sx={{ color: 'white' }}
        >
          <MenuIcon />
        </IconButton>

            <Typography variant="h1" sx={{
          position: 'absolute',
          left: '50%',
          transform: 'translateX(-50%)',
          fontWeight: 'bold',
          color: 'white',
          fontSize: {
            xs: '1.2rem',
            sm: '1.5rem', 
            md: '2rem'
          },
          textAlign: 'center',
          whiteSpace: 'nowrap'
        }}>
          Adali Clothing
        </Typography>
      </Box>

      {/* Side Menu */}
      <Box sx={{
        position: 'fixed',
        top: 0,
        left: sideMenuActive ? 0 : '-250px',
        width: '250px',
        height: '100%',
        backgroundColor: '#fff',
        boxShadow: '4px 0px 10px rgba(0, 0, 0, 0.2)',
        zIndex: 1200,
        transition: 'left 0.3s ease-in-out',
      }}>
        <Menu sideMenuActive={sideMenuActive} toggleSideMenu={() => setSideMenuActive(false)} />
      </Box>

    

      {/* Main Content */}
      <Box sx={{ p: 4, mt: 4 }}>
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          mb: 4 
        }}>
          <Typography variant="h4" sx={{ 
            color:  '#fff' ,
            fontWeight: 'bold' 
          }}>
            Értékelések kezelése
          </Typography>
          <Button
            startIcon={<AddIcon />}
            onClick={() => {
              setEditingRating(null);
              setFormData({
                felhasznalonev: '',
                rating: 0,
                velemeny: ''
              });
              setOpenDialog(true);
            }}
            variant="contained"
            sx={{
              backgroundColor: '#60BA97',
              '&:hover': {
                backgroundColor: '#4e9d7e'
              }
            }}
          >
            Új értékelés
          </Button>
        </Box>

        {/* Ratings Grid */}
        <Box sx={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
          gap: 3 
        }}>
          {ratings.map((rating) => (
            <Card 
              key={rating.rating_id} 
              sx={{ 
                backgroundColor:  '#444' ,
                color:  '#fff',
                transition: 'transform 0.2s ease-in-out',
                '&:hover': {
                  transform: 'translateY(-5px)'
                }
              }}
            >
              <CardContent>
                <Typography variant="h6" sx={{ mb: 1 }}>
                  {rating.felhasznalonev}
                </Typography>
                <MuiRating 
                  value={Number(rating.rating)} 
                  readOnly 
                  sx={{ mb: 2 }}
                />
                <Typography sx={{ mb: 2, minHeight: '60px' }}>
                  {rating.velemeny}
                </Typography>
                <Box sx={{ 
                  display: 'flex', 
                  justifyContent: 'space-between',
                  alignItems: 'center' 
                }}>
                  <Typography variant="caption" sx={{ color:  '#aaa'  }}>
                    {new Date(rating.date).toLocaleDateString()}
                  </Typography>
                  <Box>
                    <IconButton 
                      onClick={() => handleEdit(rating)}
                      sx={{ 
                        color:  '#60BA97' ,
                        '&:hover': { backgroundColor: 'rgba(96, 186, 151, 0.1)' }
                      }}
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton 
                      onClick={() => handleDelete(rating.rating_id)}
                      sx={{ 
                        color:  '#ff4444' ,
                        '&:hover': { backgroundColor: 'rgba(255, 68, 68, 0.1)' }
                      }}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          ))}
        </Box>

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
        <DialogTitle>
          {editingRating ? 'Értékelés szerkesztése' : 'Új értékelés'}
        </DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Felhasználónév"
            value={formData.felhasznalonev}
            onChange={(e) => setFormData({...formData, felhasznalonev: e.target.value})}
            margin="normal"
          />
          <Box sx={{ my: 2 }}>
            <Typography>Értékelés:</Typography>
            <MuiRating
              value={formData.rating}
              onChange={(e, newValue) => setFormData({...formData, rating: newValue})}
            />
          </Box>
          <TextField
            fullWidth
            multiline
            rows={4}
            label="Vélemény"
            value={formData.velemeny}
            onChange={(e) => setFormData({...formData, velemeny: e.target.value})}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Mégse</Button>
          <Button onClick={handleSave} variant="contained" color="primary">
            Mentés
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
      <Button
      onClick={() => navigate('/admin')}
      variant="contained"
      sx={{ 
        left: 30,
        mb: 3,
        backgroundColor: '#333',
        '&:hover': {
          backgroundColor: '#555'
        }
      }}
    >
      Vissza az admin felületre
    </Button>
    </Box>
    
  );
};

export default RateAdmin;
