import express, { type Express, type Request, type Response } from 'express';

const app: Express = express();
const port: number = 3900;

app.get('/', (req: Request, res: Response) => {
    res.send('Hello World!!!');
});

app.listen(port, () => {
    console.log(`Listening on http://localhost:${port}`);
}); 