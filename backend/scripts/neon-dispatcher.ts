import { setGlobalDispatcher, Agent } from 'undici';
import * as dns from 'dns';

// Configure Undici to filter out unreachable IPs (such as non-responsive IPs and DNS nameservers)
// and prioritize working AWS endpoint IPs for Neon database HTTP connections.
const agent = new Agent({
  connect: {
    lookup: (hostname, options, callback) => {
      dns.lookup(hostname, { all: true }, (err, addresses) => {
        if (err) return callback(err, options.all ? ([] as any) : ('' as any));
        const working = addresses.filter((a) => a.address.startsWith('52.') || a.address.startsWith('3.'));
        const chosen = working.length > 0 ? working : addresses.filter((a) => a.address !== '77.112.100.143');
        if (options.all) {
          return callback(null, chosen as any);
        }
        const fallback = chosen[0] ?? addresses[0];
        callback(null, fallback.address, fallback.family);
      });
    },
  },
});

setGlobalDispatcher(agent);
