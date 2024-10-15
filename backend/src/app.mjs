import express from "express";
import cookieParser from "cookie-parser";

const app = express();

app.use(express.json());
app.use(express.urlencoded({extended:true}));
app.use(cookieParser());

import router from "./routes/user.route.mjs";

app.use("/api/user",router);


export default app;