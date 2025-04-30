// api/index.js
// Export all API services

import auth from "./auth"
import healthcare from "./healthcare"
import telemedicine from "./telemedicine"
import audit from "./audit"
import security from "./security"
import communication from "./communication"

export { auth, healthcare, telemedicine, audit, security, communication }

export default {
  auth,
  healthcare,
  telemedicine,
  audit,
  security,
  communication,
}
