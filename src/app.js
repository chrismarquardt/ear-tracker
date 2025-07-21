import { loadData, saveData, exportData, importData } from './storage.js';

window.onload = function() {
  // Load state from storage
  let state = loadData();

  // Minimal test harness for storage.js
  let testResults = [];

  // 1. Save test
  saveData({foo: 'bar'});
  testResults.push(['saveData', JSON.stringify(loadData()) === JSON.stringify({foo: 'bar'})]);

  // 2. Export test
  const exported = exportData();
  testResults.push(['exportData', exported === JSON.stringify({foo: 'bar'})]);

  // 3. Import test (valid)
  const importOk = importData('{"baz":123}');
  testResults.push(['importData valid', importOk && JSON.stringify(loadData()) === JSON.stringify({baz:123})]);

  // 4. Import test (invalid)
  const importFail = importData('not json');
  testResults.push(['importData invalid', importFail === false]);

  // Show results
  document.getElementById('app').innerHTML =
    '<div style="text-align:center;font-size:1.2rem;">Storage.js Test Results</div>' +
    '<ul style="list-style:none;padding:0;">' +
    testResults.map(([name, ok]) => `<li>${name}: <b style="color:${ok?'green':'red'}">${ok?'PASS':'FAIL'}</b></li>`).join('') +
    '</ul>';
};
