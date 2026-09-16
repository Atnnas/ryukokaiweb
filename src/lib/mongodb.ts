import { MongoClient } from 'mongodb';
import dns from 'dns';

// Solución para resolución de registros SRV de MongoDB Atlas en Windows / Node.js
try {
  dns.setServers(['8.8.8.8', '8.8.4.4', '1.1.1.1']);
} catch {
  // Ignorar si no se puede sobrescribir en entornos restringidos
}

// Generar URI directa a los nodos de réplica para bypass de DNS SRV si falla en Windows
export const getDirectReplicaUri = (srvUri: string): string => {
  if (srvUri.includes('kmadb.jodngjz.mongodb.net')) {
    const credMatch = srvUri.match(/mongodb\+srv:\/\/([^@]+)@/);
    const credentials = credMatch ? credMatch[1] : 'davidartaviarodriguez_db_user:UYUNlKLuR1rSoTsu';
    return `mongodb://${credentials}@ac-cxc8kvq-shard-00-00.jodngjz.mongodb.net:27017,ac-cxc8kvq-shard-00-01.jodngjz.mongodb.net:27017,ac-cxc8kvq-shard-00-02.jodngjz.mongodb.net:27017/ryokukai_web_db?ssl=true&replicaSet=atlas-p0tcts-shard-0&authSource=admin&retryWrites=true&w=majority`;
  }
  return srvUri;
};

async function connectClient(): Promise<MongoClient> {
  const uri = process.env.MONGODB_URI || '';
  if (!uri) {
    throw new Error('La variable de entorno MONGODB_URI no está configurada en .env.local');
  }

  try {
    const client = new MongoClient(uri);
    return await client.connect();
  } catch (err: unknown) {
    const error = err as Error;
    // Si Windows o el ISP arroja querySrv ECONNREFUSED para el cluster de Atlas
    if (
      (error.message?.includes('querySrv') || error.message?.includes('ECONNREFUSED')) &&
      uri.includes('kmadb.jodngjz.mongodb.net')
    ) {
      console.warn('⚠️ Fallo en resolución SRV de Windows. Conectando automáticamente por nodos directos de Atlas...');
      const directUri = getDirectReplicaUri(uri);
      const fallbackClient = new MongoClient(directUri);
      return await fallbackClient.connect();
    }
    throw error;
  }
}

declare global {
  // eslint-disable-next-line no-var
  var _mongoClientPromise: Promise<MongoClient> | undefined;
}

let clientPromise: Promise<MongoClient>;

if (process.env.NODE_ENV === 'development') {
  if (!global._mongoClientPromise) {
    global._mongoClientPromise = connectClient();
  }
  clientPromise = global._mongoClientPromise;
} else {
  clientPromise = connectClient();
}

export default clientPromise;

export async function getDatabase(dbName = process.env.MONGODB_DB || 'ryokukai_web_db') {
  try {
    const client = await clientPromise;
    return client.db(dbName);
  } catch (err: unknown) {
    // Si la promesa en caché falló previamente, reintentar con una conexión limpia
    if (process.env.NODE_ENV === 'development') {
      global._mongoClientPromise = connectClient();
      const freshClient = await global._mongoClientPromise;
      return freshClient.db(dbName);
    }
    throw err;
  }
}
