import app from "./app"
import { log } from "./utils"

const PORT = 8085

const server = app.listen(PORT, "0.0.0.0")
log("Server running on port " + PORT)

export default server