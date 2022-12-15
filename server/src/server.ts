import express from "express"
import morgan from "morgan"
import { AppDataSource } from "./data-source"
import authRoutes from "./routes/auth"
import cors from "cors"
import dotenv from "dotenv";
const app = express();
const origin = "http://localhost:3000";
app.use(cors({
  origin,
  credentials: true
}))
// json 형식으로 요청오는 걸 해석해줌
app.use(express.json());
app.use(morgan("dev"));

dotenv.config()

app.get("/",(_, res) => res.send("running"));
app.use("/api/auth", authRoutes)
app.listen(process.env.PORT, async () => {
  console.log(`server running at http://localhost:${process.env.PORT}`)

  AppDataSource.initialize().then(() => {
    console.log("database initialized")
  }).catch(error => console.log(error))
})