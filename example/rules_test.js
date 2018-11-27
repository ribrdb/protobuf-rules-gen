const child_process = require('child_process');
const firebase = require('@firebase/testing');
const fs = require('fs');

/*
 * ============
 *    Setup
 * ============
 */
const projectIdBase = 'firestore-emulator-example-' + Date.now();

const rules = fs.readFileSync('example/example.rules', 'utf8');

// Run each test in its own project id to make it independent.
let testNumber = 0;

/**
 * Returns the project ID for the current test
 *
 * @return {string} the project ID for the current test.
 */
function getProjectId() {
  return `${projectIdBase}-${testNumber}`;
}

/**
 * Creates a new app with authentication data matching the input.
 *
 * @param {object} auth the object to use for authentication (typically {uid:
 * some-uid})
 * @return {object} the app.
 */
function authedApp(auth) {
  return firebase
      .initializeTestApp({
        projectId: getProjectId(),
        auth: auth,
      })
      .firestore();
}

let emulator;

/*
 * ============
 *  Test Cases
 * ============
 */

function emulatorLog(data, level) {
  const lines = `${data}`.split('\n');
  if (lines.length > 1 && lines[lines.length-1] == '') {
    lines.pop();
  }
  lines.forEach((l)=>console[level||'log'](`emulator: ${l}`));
}

beforeAll(async () => {
  return new Promise((resolve) => {
    console.error('Starting firestore emulator...');
    const child = child_process.spawn('java', [
      '-jar',
      '../com_google_cloud_firestore_emulator/jar/cloud-firestore-emulator-v1.2.1.jar'
    ]);
    child.stdout.on('data', (data) => {
      emulatorLog(data);
      if (/localhost:8080/.test(data)) {
        console.error('Emulator alive!');
        resolve();
      }
    });

    child.stderr.on('data', (data) => {
      emulatorLog(data, 'error');
    });
    emulator = child;
  });
});
afterAll(() => {
  emulator.kill();
});


describe('My app', () => {

  beforeEach(async () => {
    // Create new project ID for each test.
    testNumber++;
    await firebase.loadFirestoreRules({
      projectId: getProjectId(),
      rules: rules,
    });
  });
  
  afterEach(async () => {
    await Promise.all(firebase.apps().map((app) => app.delete()));
  });

  it('requires users to log in before creating a profile', async () => {
    const db = authedApp(null);
    const profile = db.collection('users').doc('alice');
    await firebase.assertFails(profile.set({ email: 'alice@example.com' }));
  });

  it('should let anyone create their own profile', async () => {
    const db = authedApp({ uid: 'alice' });
    const profile = db.collection('users').doc('alice');
    console.error('email')
    await firebase.assertSucceeds(profile.set({ email: 'alice@example.com' }));
  });

  // Disabled for now. The emulator blows up if we run these tests
  // together, even though they pass individually.
  xit('should allow all valid fields', async () => {
    const db = authedApp({ uid: 'alice' });
    const profile = db.collection('users').doc('alice');
    console.error('phone');
    await firebase.assertSucceeds(profile.set({
        name: 'Alice',
        email: 'alice@example.com',
        phone: {
            type: 0,
            number: '5551212',
        },
    }));
  });

  xit('should not allow unknown fields', async () => {
    const db = authedApp({ uid: 'alice' });
    const profile = db.collection('users').doc('alice');
    console.error('unknown');
    await firebase.assertFails(profile.set({
        name: 'Alice',
        email: 'alice@example.com',
        foo: 'bar',
    }));
  });
});
