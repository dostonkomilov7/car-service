import express from "express";
import apiRouter from "./routers/index.js";
import appConfig from "./configs/app.config.js";

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api", apiRouter);

app.use("/uploads", express.static(path.join(process.cwd(), "uploads")))

app.all("*splat", (req, res) => {
    res.status(404).send({
        success: false,
        message: `Given URL : ${req.url} not found`,
    });
})

app.listen(appConfig.APP_PORT, () => {
    console.log("Listening on ", appConfig.APP_PORT )
});