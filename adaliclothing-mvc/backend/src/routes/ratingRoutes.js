import express from 'express';

const router = express.Router();

export default (ratingController) => {
 
  router.get('/get-all-ratings', ratingController.getAllRatings.bind(ratingController));
  
  
  router.post('/save-rating', ratingController.saveRating.bind(ratingController));
  
  
  router.post('/add-rating', ratingController.addRating.bind(ratingController));
  
 
  router.put('/update-rating/:id', ratingController.updateRating.bind(ratingController));
  
  
  router.delete('/delete-rating/:id', ratingController.deleteRating.bind(ratingController));

  return router;
};
