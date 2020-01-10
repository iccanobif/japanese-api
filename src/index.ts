import app from "./app"
import { log } from "./utils"
import { environment } from "./environment"

const server = app.listen(environment.httpPort, "0.0.0.0")
log("Server running on port " + environment.httpPort)

export default server