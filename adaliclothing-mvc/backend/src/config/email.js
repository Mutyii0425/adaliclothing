import sgMail from '@sendgrid/mail';
import dotenv from 'dotenv';

dotenv.config({ path: './backend.env' });

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

export default sgMail;
