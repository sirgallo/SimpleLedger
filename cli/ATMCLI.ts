import { LogProvider } from '@core/providers/LogProvider';
import { ATMCLIProvider } from '@cli/providers/ATMCLIProvider';

const NAME = 'ATM CLI';

export class ATMCLI {
  private cliLog: LogProvider = new LogProvider(NAME);

  constructor(private cliProv: ATMCLIProvider) {}

  async run(): Promise<boolean> {
    try {
      const resp = await this.cliProv[args[args.length - 2]](JSON.parse(args[args.length - 1]));
      
      this.cliLog.info(`Current response object for method ${args[args.length - 2]}`);
      this.cliLog.debug(JSON.stringify(resp, null, 2));

      return true;
    } catch (err) {
      throw err;
    }
  }
}

const args = process.argv;
if (args.length !== 7) throw new Error('Incorrect arguments provided');

const cli = new ATMCLIProvider(args[args.length - 4], parseInt(args[args.length - 3]));

try {
  const c = new ATMCLI(cli);
  await c.run();
} catch (err) {
  console.log(err);
}