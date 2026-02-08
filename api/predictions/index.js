import Replicate from "replicate";

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN,
});

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  try {
    const { input, version } = req.body;

    // Use provided version or default to OpenAI Whisper
    const modelVersion = version || "openai/whisper:8099696689d249cf8b122d833c36ac3f75505c666a395ca40ef26f68e7d3d16e";

    const output = await replicate.run(
      modelVersion,
      {
        input: input
      }
    );

    res.status(200).json(output);
  } catch (error) {
    console.error('Error running Whisper:', error);
    res.status(500).json({ error: error.message || 'Internal Server Error' });
  }
}
