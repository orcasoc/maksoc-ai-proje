import express from 'express';

const app = express();
const PORT = 3000;

app.use(express.json());

const SHUFFLE_URL = process.env.SHUFFLE_URL;

app.post('/tools/trigger_workflow', async (req, res) => {
    const { workflow_id, params } = req.body;
    console.log(`Triggering workflow ${workflow_id} with params`, params);

    // Logic to call Shuffle Webhook
    res.json({
        status: "executed",
        execution_id: "exec_12345",
        output: "Workflow started"
    });
});

app.listen(PORT, () => {
    console.log(`Shuffle MCP Adapter listening on port ${PORT}`);
});
