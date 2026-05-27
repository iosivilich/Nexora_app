// Cliente de embeddings semánticos vía Hugging Face Inference API.
// Modelo: intfloat/multilingual-e5-small (384 dimensiones, multilingüe).
// Convención del modelo: prefijar con "query: " o "passage: " según el rol del texto.

const HF_MODEL = 'intfloat/multilingual-e5-small';
// HF Inference Providers (endpoint vigente). Si tu cuenta tiene serverless
// activado, también funciona https://api-inference.huggingface.co/models/<model>.
const HF_ENDPOINT = `https://router.huggingface.co/hf-inference/models/${HF_MODEL}/pipeline/feature-extraction`;
const EMBEDDING_DIMS = 384;

export type EmbeddingKind = 'query' | 'passage';

function preprocess(text: string, kind: EmbeddingKind): string {
  const cleaned = text.replace(/\s+/g, ' ').trim();
  return `${kind}: ${cleaned || '—'}`;
}

function flatten(value: unknown): number[] | null {
  if (Array.isArray(value)) {
    if (value.length > 0 && Array.isArray(value[0])) {
      // [[..384..]] o [[..tokens.., ..hidden..]] (caso token-level no esperado aquí)
      const inner = (value as unknown[])[0];
      if (Array.isArray(inner) && inner.every((v) => typeof v === 'number')) {
        return inner as number[];
      }
    }
    if (value.every((v) => typeof v === 'number')) {
      return value as number[];
    }
  }
  return null;
}

export async function embedText(
  text: string,
  kind: EmbeddingKind = 'passage',
): Promise<number[] | null> {
  const token = process.env.HUGGINGFACE_API_TOKEN;
  if (!token) {
    console.warn('HUGGINGFACE_API_TOKEN no configurado: embeddings deshabilitados.');
    return null;
  }
  if (!text || text.trim().length === 0) {
    return null;
  }

  try {
    const response = await fetch(HF_ENDPOINT, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        inputs: preprocess(text, kind),
        options: { wait_for_model: true },
      }),
    });

    if (!response.ok) {
      const body = await response.text();
      console.warn(`HF embedding falló (${response.status}): ${body.slice(0, 200)}`);
      return null;
    }

    const payload = await response.json();
    const vector = flatten(payload);
    if (!vector || vector.length !== EMBEDDING_DIMS) {
      console.warn(`HF respondió con dimensiones inesperadas (${vector?.length ?? 'null'})`);
      return null;
    }
    return vector;
  } catch (error) {
    console.warn('HF embedding error', error);
    return null;
  }
}

export function pgVectorLiteral(vector: number[]): string {
  return `[${vector.map((v) => v.toFixed(7)).join(',')}]`;
}

export const EMBEDDING_DIMENSIONS = EMBEDDING_DIMS;
