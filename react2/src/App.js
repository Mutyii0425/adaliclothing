import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './kezdolap';
import Oterm from './oterm';
import SignUp from './signup';
import SignIn from './sign';
import Kosar from './kosar';
import Add from './add';
import Vinted from './vinted';
import User from './admin/user';
import ProductDetail from './ProductDetail';
import Shipping from './shipping';
import Termekeink from './termekeink';
import Tadmin from './admin/tadmin';
import Termadmin from './admin/termadmin';
import Fadmin from './admin/fadmin';
import Admin from './admin/admin';
import Rateadmin from './admin/rateadmin';
import Fiokom from './fiokom';
import Rolunk from './rolunk';
import ApiUsage from './admin/apiusage';
import ResetPassword from './ResetPassword';

const App = () => {
  return (
    <Router>
     
      <Routes>
        <Route path="/" element={<Home />} /> 
        <Route path="/kezdolap" element={<Home />} />  
        <Route path="/oterm" element={<Oterm />} /> 
        <Route path="/signup" element={<SignUp />} />
        <Route path="/sign" element={<SignIn />} />
        <Route path="/kosar" element={<Kosar />} />
        <Route path="/add" element={<Add />} />
        <Route path="/vinted" element={<Vinted />} />
        <Route path="/user" element={<User />} />
        <Route path="/product/:id" element={<ProductDetail />} />
        <Route path="/shipping" element={< Shipping />} />
        <Route path="/termek/:id" element={<Termekeink />} />
        <Route path="/tadmin" element={<Tadmin />} />
        <Route path="/termadmin" element={<Termadmin />} />
        <Route path="/fadmin" element={<Fadmin />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="/rateadmin" element={<Rateadmin />} />
        <Route path="/fiokom" element={<Fiokom />} />
        <Route path="/rolunk" element={<Rolunk/>} />
        <Route path="/admin/apiusage" element={<ApiUsage />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />
        
        
        
      </Routes>
    </Router>
  );
};

export default App;