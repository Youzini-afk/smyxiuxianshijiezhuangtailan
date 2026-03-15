import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

const rootDir = path.resolve(import.meta.dirname, '..');
const distHtmlPath = path.join(rootDir, 'dist', '修仙世界状态栏', 'index.html');
const iframeSrcdocPath = path.join(rootDir, 'util', 'iframe_srcdoc.html');
const outputPath = path.join(rootDir, '修仙世界状态栏-酒馆助手脚本.json');

const scriptId = '89e4c136-2e4e-4be8-9f71-7b3fe3a4fd91';
const scriptName = '修仙世界状态栏';
const bridgeKey = '__cultivationWorldStatusBarBridge';
const frameId = 'cultivation-world-status-bar-frame';

const html = await readFile(distHtmlPath, 'utf8');
const iframeShell = await readFile(iframeSrcdocPath, 'utf8');

const moduleScriptMatch = html.match(/<script type="module">([\s\S]*?)<\/script>/i);
const styleMatch = html.match(/<style>([\s\S]*?)<\/style>/i);

if (!moduleScriptMatch || !styleMatch) {
  throw new Error('未能从 dist/修仙世界状态栏/index.html 中提取脚本或样式。请先执行 pnpm build。');
}

const moduleScript = moduleScriptMatch[1].trim();
const styleContent = styleMatch[1].trim();

const bridgeScript = `
<script>
(() => {
  const bridge = window.parent.${bridgeKey};
  if (!bridge) {
    throw new Error('修仙世界状态栏桥接对象不存在。');
  }

  window.Vue = bridge.Vue;
  window.z = bridge.z;
  window.SillyTavern = bridge.SillyTavern;
  window.waitGlobalInitialized = (...args) => bridge.waitGlobalInitialized(...args);
  window.getVariables = (...args) => bridge.getVariables(...args);
  window.updateVariablesWith = (...args) => bridge.updateVariablesWith(...args);
  window.errorCatched = (...args) => bridge.errorCatched(...args);
  window.getCurrentMessageId = () => 'latest';
})();
</script>`;

const normalizedIframeShell = iframeShell.replace(/<html>\s*$/i, '<body></body></html>');

if (!normalizedIframeShell.includes('</head>') || !normalizedIframeShell.includes('</body>')) {
  throw new Error('util/iframe_srcdoc.html 结构异常，未找到 </head> 或 </body>。');
}

const iframeHtml = normalizedIframeShell
  .replace('</head>', `${bridgeScript}\n<style>${styleContent}</style>\n</head>`)
  .replace(
    '</body>',
    `<div id="app"></div><script type="module">${moduleScript.replace(/<\/script>/gi, '<\\/script>')}</script></body>`,
  );

const content = `
const parentWindow = window.parent;
const parentDocument = parentWindow.document;

parentWindow.${bridgeKey} = {
  Vue: window.Vue,
  z: window.z,
  SillyTavern: window.SillyTavern,
  waitGlobalInitialized: (...args) => waitGlobalInitialized(...args),
  getVariables: (...args) => getVariables(...args),
  updateVariablesWith: (...args) => updateVariablesWith(...args),
  errorCatched: (...args) => errorCatched(...args),
};

parentDocument.getElementById(${JSON.stringify(frameId)})?.remove();

const iframe = parentDocument.createElement('iframe');
iframe.id = ${JSON.stringify(frameId)};
iframe.setAttribute('script_id', typeof getScriptId === 'function' ? getScriptId() : ${JSON.stringify(scriptId)});
iframe.setAttribute('title', ${JSON.stringify(scriptName)});
iframe.setAttribute('frameborder', '0');
iframe.setAttribute('allowtransparency', 'true');
iframe.style.cssText = [
  'position:fixed',
  'top:0',
  'right:0',
  'width:min(860px, 100vw)',
  'height:min(780px, 100vh)',
  'border:0',
  'background:transparent',
  'z-index:9999',
].join(';');
iframe.srcdoc = ${JSON.stringify(iframeHtml)};

parentDocument.body.appendChild(iframe);
`.trim();

const output = {
  type: 'script',
  enabled: true,
  name: scriptName,
  id: scriptId,
  content,
  info: '读取最新消息楼层的 stat_data，并在酒馆右上角显示修仙世界状态栏。',
  button: {
    enabled: true,
    buttons: [],
  },
  data: {},
};

await writeFile(outputPath, JSON.stringify(output, null, 2), 'utf8');
console.log(`已生成导入文件: ${outputPath}`);
