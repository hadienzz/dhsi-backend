import { envConfig } from "./config/load-env";
import app from "./app";

app.listen(3001, () => {
  console.log(`Server is running on port ${3001}`);
});
