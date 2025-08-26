import { app } from "./app.js";
import ConnectDB from "./DB/DBconnect.js";


const PORT = process.env.PORT || 3000;


ConnectDB().then(() => {
  app.get('/', (req, res) => {
  res.send('Hello from Express!');
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
}).catch((error) => {
 console.log('error comes when connect database :- ', error);
})
