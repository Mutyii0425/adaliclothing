import cors from 'cors';

const corsOptions = {
  origin: 'http://localhost:3000', // Frontend URL
  optionsSuccessStatus: 200
};

export default cors(corsOptions);
