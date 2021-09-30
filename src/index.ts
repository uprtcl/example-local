import {
  ClientRemoteLocal,
  EntityRemoteLocal,
  EntityResolverBase,
  LocalExplore,
  PerspectivesStoreDB,
  RouterEntityResolver,
} from '@uprtcl/evees';
import { initDefault, MultiContainer } from '@uprtcl/evees-ui';
import { App } from './app';

(async function () {
  console.log('Initializing App');

  /** The goal is to initialize the EveesService and store it into app-container element. */

  /** We first need to instantiate an EntityResolver, which will resolve hashes into their
   * corresponding entities */
  const entityRemote = new EntityRemoteLocal();
  const entityRouter = new RouterEntityResolver([entityRemote]);
  const entityResolver = new EntityResolverBase(entityRouter);

  /** We then instantiate a PerspectiveStoreDB using IndexedDB to serve as our "local" Remote */
  const perspectiveStoreDB = new PerspectivesStoreDB();

  /** The local explore service receives the local PerspectiveStoreDB to query for perspectives */
  const exploreService = new LocalExplore(perspectiveStoreDB);

  /** The EveesRemote is a local remote that needs the EntityResolver, to resolve entities during
   * its operations, the perspectiveStoreDB, to create and update perspectives, the entityRemote,
   * to persist entities, and the ExploreService, to query perspectives */
  const eveesRemote = new ClientRemoteLocal(
    entityResolver,
    perspectiveStoreDB,
    entityRemote,
    exploreService
  );

  /** the initDefault function build the stack of Clients, with a top-layer Client that
   * mutations in-memory, a persistent temporary layer that stores mutations locally in IndexedDB,
   * and the EveesRemotes, which in this case is also storing evees heads in IndexedDB.
   *
   * When we replace the EveesRemote with a real remote, like a web server, the intermediate
   * persisten layer will provide local-first functionalities.
   */
  const evees = initDefault([eveesRemote], entityResolver);

  customElements.define('app-container', MultiContainer(evees));

  customElements.define('uprtcl-sample-app', App);
})();
