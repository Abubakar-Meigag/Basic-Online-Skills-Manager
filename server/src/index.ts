import dotenv from 'dotenv';
import app from './app';

// dotenv.config();

const port = process.env.PORT || 3000;

app.listen(port, () => {
      console.log(`BOSM Server is running on Port: ${port}`);
});

/*
Don't change anything in this file. This is the entry point of the application.
*/
