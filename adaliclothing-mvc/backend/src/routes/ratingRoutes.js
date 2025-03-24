import express from 'express';

const router = express.Router();

export default (ratingController) => {
  // Értékelések lekérése
  router.get('/get-all-ratings', ratingController.getAllRatings.bind(ratingController));
  
  // Értékelés mentése
  router.post('/save-rating', ratingController.saveRating.bind(ratingController));
  
  // Értékelés hozzáadása
  router.post('/add-rating', ratingController.addRating.bind(ratingController));
  
  // Értékelés frissítése
  router.put('/update-rating/:id', ratingController.updateRating.bind(ratingController));
  
  // Értékelés törlése
  router.delete('/delete-rating/:id', ratingController.deleteRating.bind(ratingController));

  return router;
};
