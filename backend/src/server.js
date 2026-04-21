require("dotenv").config();
const app = require("./app");
const {retryFailedEvents} = require('./services/retryService')

const PORT = process.env.PORT || 3000;

setInterval(()=>{
  retryFailedEvents()
},30000)

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});