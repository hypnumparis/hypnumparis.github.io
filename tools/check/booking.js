// Daily check of hypnum.fr: home page loads, booking form can be filled and sent.
// The real send is intercepted (no e-mail, no payment), so nothing reaches anyone.
// Run: node tools/check/booking.js [url]
const { chromium, devices } = require('playwright');
const URL = process.argv[2] || 'https://hypnum.fr/';

(async () => {
  const b = await chromium.launch();
  const c = await b.newContext({ ...devices['iPhone 13'] });
  const p = await c.newPage();
  const errs = [], fails = [];
  p.on('pageerror', e => errs.push(e.message));
  let sent = null;
  await p.route('https://api.web3forms.com/**', r => {
    try { sent = JSON.parse(r.request().postData() || '{}'); } catch (e) { sent = {}; }
    r.fulfill({ contentType: 'application/json', body: '{"success":true}' });
  });
  await p.route(/buy\.stripe\.com|checkout\.stripe\.com|static\.cloudflareinsights\.com/, r => r.abort());
  const step = async (name, fn) => {
    try { await fn(); console.log('ok  ', name); }
    catch (e) { fails.push(name + ': ' + String(e.message || e).split('\n')[0]); console.log('FAIL', name); }
  };

  await step('home page opens', async () => {
    const res = await p.goto(URL + '?moi=1', { waitUntil: 'domcontentloaded', timeout: 60000 });
    if (!res || res.status() >= 400) throw new Error('HTTP ' + (res && res.status()));
    await p.waitForSelector('.ap-strip img', { timeout: 30000 });
  });
  await step('booking form opens', async () => {
    await p.goto(URL + '#reservation', { waitUntil: 'domcontentloaded' });
    await p.waitForSelector('#resaForm', { state: 'visible', timeout: 30000 });
    await p.waitForTimeout(3000);
  });
  await step('pick a flash', async () => {
    await p.click('#resaForm label:has(input[name=type][value=flash])');
    await p.waitForSelector('#flashGrid .fg-it', { state: 'visible', timeout: 10000 });
    const n = await p.locator('#flashGrid .fg-it').count();
    if (n < 1) throw new Error('no flash in grid');
    await p.locator('#flashGrid .fg-it').first().click();
    await p.waitForSelector('#flashSz', { state: 'visible', timeout: 10000 });
  });
  await step('pick a date', async () => {
    for (let i = 0; i < 6; i++) {
      const d = p.locator('#resaCal button.cal-d:not([disabled])');
      if (await d.count()) { await d.first().click(); return; }
      await p.click('#resaCal [data-mv="1"]');
      await p.waitForTimeout(200);
    }
    throw new Error('no free day in the next 6 months');
  });
  await step('fill and send', async () => {
    await p.fill('#placement', 'avant-bras');
    await p.fill('#name', 'Test automatique');
    await p.fill('#email', 'test@example.com');
    const ct = p.locator('#resaForm label:has(input[name=ctWay][value="E-mail"])');
    if (await ct.count()) await ct.first().click();
    await p.check('#age', { force: true });
    await p.check('#terms', { force: true });
    await p.evaluate(() => { window.HYP_SEND = true; });
    await p.click('#resaForm button[type=submit]');
    for (let i = 0; i < 40 && !sent; i++) await p.waitForTimeout(250);
    if (!sent) {
      const bad = await p.evaluate(() => { const e = document.getElementById('resaError'); return e && !e.hidden ? e.textContent.trim() : ''; });
      throw new Error('form did not send' + (bad ? ' (message shown: ' + bad + ')' : ''));
    }
    if (!sent.access_key) throw new Error('send has no form key');
    if (!JSON.stringify(sent).includes('Test automatique')) throw new Error('name missing from the letter');
  });
  if (errs.length) fails.push('page errors: ' + errs.slice(0, 3).join(' | '));
  await b.close();
  if (fails.length) { console.log('\nProblems:\n- ' + fails.join('\n- ')); process.exit(1); }
  console.log('\nAll good.');
})();
