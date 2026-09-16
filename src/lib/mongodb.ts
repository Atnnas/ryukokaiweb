import { MongoClient } from 'mongodb';
import dns from 'dns';

// Solución para resolución de registros SRV de MongoDB Atlas en Windows / Node.js
try {
  dns.setServers(['8.8.8.8', '8.8.4.4', '1.1.1.1']);
} catch {
  // Ignorar si no se puede sobrescribir en entornos restringidos
}

const uri = process.env.MONGODB_URI || '';
const options = {};

let client: MongoClient;
let clientPromise: Promise<MongoClient>;

declare global {
  // eslint-disable-next-line no-var
  var _mongoClientPromise: Promise<MongoClient> | undefined;
}

if (!uri) {
  // Si no está definida la URI aún, creamos un placeholder para no romper la compilación
  clientPromise = Promise.reject(
    new Error('La variable de entorno MONGODB_URI no está configurada en .env.local')
  );
} else {
  if (process.env.NODE_ENV === 'development') {
    // En desarrollo usamos una variable global para preservar la conexión entre recargas HMR
    if (!global._mongoClientPromise) {
      client = new MongoClient(uri, options);
      global._mongoClientPromise = client.connect();
    }
    clientPromise = global._mongoClientPromise;
  } else {
    // En producción es mejor no usar una variable global
    client = new MongoClient(uri, options);
    clientPromise = client.connect();
  }
}

export default clientPromise;

export async function getDatabase(dbName = process.env.MONGODB_DB || 'yingyag_web_db') {
  const client = await clientPromise;
  return client.db(dbName);
}
