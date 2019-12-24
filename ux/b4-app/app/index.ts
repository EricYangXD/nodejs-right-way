// Full version.
import '../node_modules/bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap';
import * as templates from './templates.ts';

// Page setup.
document.body.innerHTML = templates.main();
const mainElement = document.body.querySelector('.b4-main');
const alertsElement = document.body.querySelector('.b4-alerts');

const getBundles = async () => {
  const esRes = await fetch('/es/b4/bundle/_search?size=1000');

  const esResBody = await esRes.json();

  return esResBody.hits.hits.map(hit => ({
    id: hit._id,
    name: hit._source.name,
  }));
};

const listBundles = bundles => {
  mainElement.innerHTML =
    templates.addBundleForm() + templates.listBundles({bundles});

  const form = mainElement.querySelector('form');
  form.addEventListener('submit', event => {
    event.preventDefault();
    const name = form.querySelector('input').value;
    addBundle(name);
  });

  const deleteButtons = mainElement.querySelectorAll('button.delete');
  for (let i = 0; i < deleteButtons.length; i++) {
    const deleteButton = deleteButtons[i];
    deleteButton.addEventListener('click', event => {
      deleteBundle(deleteButton.getAttribute('data-bundle-id'));
    });
  }
};

/**
 * Delete the bundle with the specified ID, then list bundles.
 */
const deleteBundle = async (bundleId) => {
  try {
    // Delete the bundle, then render the updated list with listBundles().

    const bundles = await getBundles();

    const idx = bundles.findIndex(bundle => bundle.id === bundleId);
    if (idx === -1) {
      throw Error(`No bundle with id "${bundleId}" was found.`);
    }

    const url = `/api/bundle/${encodeURIComponent(bundleId)}`;
    await fetch(url, {method: 'DELETE'});

    bundles.splice(idx, 1);

    listBundles(bundles);

    showAlert(`Bundle deleted!`, 'success');
  } catch (err) {
    showAlert(err);
  }
};

/**
 * Show an alert to the user.
 */
const showAlert = (message, type = 'danger') => {
  const html = templates.alert({type, message});
  alertsElement.insertAdjacentHTML('beforeend', html);
};

/**
 * Create a new bundle with the given name, then list bundles.
 */
const addBundle = async (name) => {
  try {
    // Grab the list of bundles already created.
    const bundles = await getBundles();

    // Add the new bundle.
    const url = `/api/bundle?name=${encodeURIComponent(name)}`;
    const res = await fetch(url, {method: 'POST'});
    const resBody = await res.json();

    // Merge the new bundle into the original results and show them.
    bundles.push({id: resBody._id, name});
    listBundles(bundles);

    showAlert(`Bundle "${name}" created!`, 'success');
  } catch (err) {
    showAlert(err);
  }
};

/*
// BAD IMPLEMENTATION! Subject to stale data due to eventual consistency.
const addBundle = async (name) => {
  try {
    // Add the new bundle.
    const url = `/api/bundle?name=${encodeURIComponent(name)}`;
    const res = await fetch(url, {method: 'POST'});
    const resBody = await res.json();

    // Grab the list of all bundles, expecting the new one to be in the list.
    // Due to eventual consistency, the new bundle may be missing!
    const bundles = await getBundles();
    listBundles(bundles);

    showAlert(`Bundle "${name}" created!`, 'success');
  } catch (err) {
    showAlert(err);
  }
};
*/

/*
// Initial listBundles shell.
const listBundles = bundles => {
  mainElement.innerHTML = templates.listBundles({bundles});
};
*/

/**
 * Use Window location hash to show the specified view.
 */
const showView = async () => {
  const [view, ...params] = window.location.hash.split('/');

  switch (view) {
    case '#welcome':
      mainElement.innerHTML = templates.welcome();
      break;
    case '#list-bundles':
      const bundles = await getBundles();
      listBundles(bundles);
      break;
    default:
      // Unrecognized view.
      throw Error(`Unrecognized view: ${view}`);
  }
};

window.addEventListener('hashchange', showView);

showView().catch(err => window.location.hash = '#welcome');

/*
// Version using Handlebars.
import '../node_modules/bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap';
import * as templates from './templates.ts';

// Page setup.
document.body.innerHTML = templates.main();
const mainElement = document.body.querySelector('.b4-main');
const alertsElement = document.body.querySelector('.b4-alerts');

mainElement.innerHTML = templates.welcome();
alertsElement.innerHTML = templates.alert({
  type: 'info',
  message: 'Handlebars is working!',
});
 */

/*
// Initial version.
import '../node_modules/bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap';
import * as templates from './templates.ts';

document.body.innerHTML = templates.main;

const mainElement = document.body.querySelector('.b4-main');
const alertsElement = document.body.querySelector('.b4-alerts');

mainElement.innerHTML = templates.welcome;
alertsElement.innerHTML = templates.alert;
 */
