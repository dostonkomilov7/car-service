import express from "express";
import apiRouter from "./routers/index.js";
import appConfig from "./configs/app.config.js";
import path from "node:path";
import cookieParser from "cookie-parser";
import expHbs from "express-handlebars"
import authRouter from "./routers/auth.route.js";
import bookingRouter from "./routers/bookings.route.js";
import methodOverride from "method-override";

const app = express();

app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));

const hbs = expHbs.create({
    defaultLayout: "main",
    extname: "hbs",
    layoutsDir: path.join(process.cwd(), "src", "views", "layouts"),
    partialsDir: path.join(process.cwd(), "src", "views", "partials"),
});

app.engine("hbs", hbs.engine);
app.set("view engine", "hbs");
app.set("views", path.join(process.cwd(), "src", "views"));

app.use("/api", apiRouter);
    
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")))
app.use(express.static(path.join(process.cwd(),"src", "public")))

app.all("*splat", (req, res) => {
    res.status(404).send({
        success: false,
        message: `Given URL : ${req.url} not found`,
    });
})

app.listen(appConfig.APP_PORT, () => {
    console.log("Listening on ", appConfig.APP_PORT )
});