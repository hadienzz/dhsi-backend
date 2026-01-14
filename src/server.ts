import { envConfig } from "./config/env.config";
import app from "./app";

app.listen(3001, () => {
  console.log(`Server is running on port ${3001}`);
});
