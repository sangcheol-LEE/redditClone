import express from "express"
import morgan from "morgan"

const app = express();

// json 형식으로 요청오는 걸 해석해줌
app.use(express.json());
app.use(morgan("dev"));

app.get("/",(_, res) => res.send("running"));
let port = 4000;
app.listen(port, async () => {
  console.log(`server running at http://localhost:${port}`)
})