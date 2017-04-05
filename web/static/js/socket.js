// NOTE: The contents of this file will only be executed if
// you uncomment its entry in "web/static/js/app.js".

// To use Phoenix channels, the first step is to import Socket
// and connect at the socket path in "lib/my_app/endpoint.ex":
import {Socket} from "phoenix"

let socket = new Socket("/socket", {params: {token: window.userToken}})

// When you connect, you'll often need to authenticate the client.
// For example, imagine you have an authentication plug, `MyAuth`,
// which authenticates the session and assigns a `:current_user`.
// If the current user exists you can assign the user's token in
// the connection for use in the layout.
//
// In your "web/router.ex":
//
//     pipeline :browser do
//       ...
//       plug MyAuth
//       plug :put_user_token
//     end
//
//     defp put_user_token(conn, _) do
//       if current_user = conn.assigns[:current_user] do
//         token = Phoenix.Token.sign(conn, "user socket", current_user.id)
//         assign(conn, :user_token, token)
//       else
//         conn
//       end
//     end
// Now you need to pass this token to JavaScript. You can do so
// inside a script tag in "web/templates/layout/app.html.eex":
//
//     <script>window.userToken = "<%= assigns[:user_token] %>";</script>
//
// You will need to verify the user token in the "connect/2" function
// in "web/channels/user_socket.ex":
//
//     def connect(%{"token" => token}, socket) do
//       # max_age: 1209600 is equivalent to two weeks in seconds
//       case Phoenix.Token.verify(socket, "user socket", token, max_age: 1209600) do
//         {:ok, user_id} ->
//           {:ok, assign(socket, :user, user_id)}
//         {:error, reason} ->
//           :error
//       end
//     end
//
// Finally, pass the token on connect as below. Or remove it
// from connect if you don't care about authentication.

const statusToClass = {
  'green': 'bg-success',
  'red': 'bg-danger',
};

const statNameMap = {
  'push_queue_length': 'Push queue length',
  'byte_size': 'Size',
  'db_fetch_count': 'Query count',
  'db_fetch_duration': 'Total query duration',
  'db_fetch_mean_duration': 'Mean query duration',
};

const byteSizes = {};
byteSizes.b = 1;
byteSizes.k = byteSizes.b * 1024;
byteSizes.m = byteSizes.k * 1024;
byteSizes.g = byteSizes.m * 1024;
byteSizes.t = byteSizes.g * 1024;
byteSizes.p = byteSizes.t * 1024;
byteSizes.e = byteSizes.p * 1024;
byteSizes.z = byteSizes.e * 1024;
byteSizes.y = byteSizes.z * 1024;
const byteSizeNames = ['y', 'z', 'e', 'p', 't', 'g', 'm', 'k', 'b'];

function getByteSizeDescription(byteSize) {
  const byteSizePerKind = byteSizeNames.reduce((acc, val) => {
    const count = Math.floor(byteSize / byteSizes[val]);
    acc[val] = count;
    byteSize = byteSize - (count * byteSizes[val]);
    return acc;
  }, {});
  return byteSizeNames
    .filter(bsn => byteSizePerKind[bsn])
    .map(bsn => `${byteSizePerKind[bsn]}${bsn.toUpperCase()}`)
    .join('+');
};

function getDurationDescription(milliseconds) {
  const x = new Date(0);
  x.setTime(x.getTime() + (x.getTimezoneOffset() * 60000));
  x.setTime(x.getTime() + milliseconds);
  return [
    x.getFullYear() != 1970 ? `${x.getFullYear() - 1970}Y` : '',
    x.getMonth() != 0 ? `${x.getMonth()}M` : '',
    x.getDate() != 1 ? `${x.getDate() - 1}D` : '',
    x.getHours() != 0 ? `${x.getHours()}H` : '',
    x.getMinutes() != 0 ? `${x.getMinutes()}m` : '',
    x.getSeconds() != 0 ? `${x.getSeconds()}s` : '',
    x.getMilliseconds() != 0 ? `${x.getMilliseconds()}ms` : '',
  ].filter(x => x).join('+');
}

window.foo = getDurationDescription;

function updateTime() {
  document.getElementById('time').textContent = new Date().toISOString();
}

function updateStatus(status) {
  const statusElement = document.getElementById('status');
  Array.from(statusElement.classList)
    .filter(klass => /^bg-/.test(klass))
    .forEach(klass => statusElement.classList.remove(klass));
  statusElement.classList.add(statusToClass[status.status]);

  const versionElement = document.getElementById('cache-version');
  const version = (status.heartbeat || {}).version;
  versionElement.textContent = version ? `v${version}` : '-';
}

function makeCacheRow(cacheName, cache) {
  const tplt = document
    .querySelector('[data-template="cache-row-template"]')
    .cloneNode(true);
  tplt.removeAttribute('data-template');

  const header = tplt.querySelector('[data-template-role="header"]');
  header.removeAttribute('data-template-role');
  header.innerHTML = `${cacheName} (pid: <em>${cache.pid}</em>)`;

  const keys = tplt.querySelector('[data-template-role="keys"]');
  keys.removeAttribute('data-template-role');
  Object.keys(cache.keys || {}).forEach(key => {
    const tr = document.createElement('tr');
    const tdCacheKey = document.createElement('td');
    const tdCacheKeyClientsCount = document.createElement('td');
    tdCacheKey.textContent = key;
    tdCacheKeyClientsCount.textContent = cache.keys[key];
    tr.appendChild(tdCacheKey);
    tr.appendChild(tdCacheKeyClientsCount);
    keys.appendChild(tr);
  });

  const stats = tplt.querySelector('[data-template-role="stats"]');
  keys.removeAttribute('data-template-role');
  const statKeys = Object.keys(cache.stats || {});
  statKeys.sort();
  statKeys.forEach(statKey => {
    const tr = document.createElement('tr');
    const tdKey = document.createElement('td');
    const tdValue = document.createElement('td');
    tdKey.textContent = statNameMap[statKey];
    if (statKey === 'byte_size') {
      tdValue.textContent = getByteSizeDescription(cache.stats[statKey]);
    } else if (statKey === 'db_fetch_duration' || statKey === 'db_fetch_mean_duration') {
      tdValue.textContent = getDurationDescription(Math.round(cache.stats[statKey]));
    } else {
      tdValue.textContent = cache.stats[statKey];
    }
    tr.appendChild(tdKey);
    tr.appendChild(tdValue);
    stats.appendChild(tr);
  });

  return tplt;
}

socket.connect()

// Now that you are connected, you can join channels with a topic:
const statsChannel = socket.channel("stats:all", null);

statsChannel
  .join()
  .receive("ok", _ => console.log('joined the stats channel successfully'))
  .receive("error", _ => console.error('unable to join the stats channel'))

statsChannel.on("heartbeat", heartbeat => {
  updateTime();
  updateStatus(heartbeat);
});

statsChannel.on("stats", stats => {
  updateTime();

  const statsFailed = document.getElementById('statsFailed');

  if (stats.status !== 'green') {
    statsFailed.style.display = '';
    return;
  }

  statsFailed.style.display = 'none';

  stats = stats.stats;

  const pushQueueLength = document.getElementById('pushQueueLength');
  pushQueueLength.textContent = stats.push_queue_length;

  const cacheStatsLayout = {};
  const cacheNames = Object.keys(stats.caches);

  cacheNames.sort();

  cacheNames.forEach(cacheName => {
    const cache = stats.caches[cacheName];
    const statNames = Object.keys(cache);
    statNames.sort();

    cacheStatsLayout[cacheName] = statNames;
  });

  const cacheStatsDomElements = [];

  Object.keys(cacheStatsLayout).forEach(cacheName => {
    const cacheStatsDomElement = makeCacheRow(cacheName, stats.caches[cacheName]);
    cacheStatsDomElements.push(cacheStatsDomElement);
  });

  const statsElement = document.getElementById('stats');
  Array.from(statsElement.children).forEach(child => child.remove());
  cacheStatsDomElements.forEach(node => {
    node.style.display = '';
    statsElement.appendChild(node);
  });
});

statsChannel.push('poll', null);

export default socket
