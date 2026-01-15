import express from 'express';

const app = express();
const PORT = 3000;

app.use(express.json());

const IRIS_URL = process.env.IRIS_URL;

app.post('/tools/create_case', async (req, res) => {
    const { title, description, ioc_list } = req.body;
    console.log(`Creating case: ${title}`);

    // Logic to call DFIR IRIS API
    res.json({
        case_id: 101,
        title: title,
        status: "Open",
        link: `${IRIS_URL}/case/101`
    });
});

app.post('/tools/add_evidence', async (req, res) => {
    // Logic to add evidence
    res.json({ status: "success", evidence_id: 55 });
});

app.listen(PORT, () => {
    console.log(`DFIR IRIS MCP Adapter listening on port ${PORT}`);
});
