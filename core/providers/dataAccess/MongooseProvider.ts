import { 
  connect, createConnection,
  Connection, Schema 
} from 'mongoose';

import { IMongoCredentials } from '@core/models/dataAccess/IMongoose';
import { LogProvider } from '@core/providers/LogProvider';

export abstract class MongooseProvider {
  conn: Connection;

  private log = new LogProvider('Mongoose Provider');

  constructor(private creds: IMongoCredentials, private db: string) {}

  async initDefault() {
    try {
      const { connection } = await connect(this.getNormalizeHost(), { maxPoolSize: 100 });
      this.conn = connection;
      this.dbOn(this.conn);
      this.initDefaultModels();
    } catch (err) { throw err; }
  }

  abstract initDefaultModels()

  async createNewConnection() {
    try {
      const newConn = await createConnection(this.getNormalizeHost(), this.normalizeConnOptions()).asPromise();
      this.dbOn(newConn);
      return newConn;
    } catch (err) { throw err; }
  }

  private dbOn(conn: Connection) {
    conn.on('open', () => this.log.info('Successfully made mongo connection'));
    conn.on('error', err => {
      this.log.error(err);
      
      throw err;
    });
  }

  private getNormalizeHost(): string {
    return `mongodb://${this.creds.user}:${this.creds.password}@${this.creds.host}:${this.creds.port}/${this.db}`;
  }

  private normalizeConnOptions() {
    return {
      dbName: this.db,
      autoIndex: true,
      autoCreate: true
    }
  }

  addModel<T>(conn: Connection, db: string, mongoSchema: Schema) { 
    return conn.model<T>(db, mongoSchema);
  }
}