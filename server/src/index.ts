import dotenv from "dotenv";
dotenv.config();

import app from "./app";

const port = process.env.PORT || 3000;

app.listen(port, () => {
  console.log(`BOSM Server is running on Port: ${port}`);
});

/*
Don't change anything in this file. This is the entry point of the application.
*/
