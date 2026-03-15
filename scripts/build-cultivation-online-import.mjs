import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

const rootDir = path.resolve(import.meta.dirname, '..');
const iframeSrcdocPath = path.join(rootDir, 'util', 'iframe_srcdoc.html');
const outputPath = path.join(rootDir, '修仙世界状态栏-酒馆助手脚本-在线版.json');

const scriptId = '89e4c136-2e4e-4be8-9f71-7b3fe3a4fd91';
const scriptName = '修仙世界状态栏';
const bridgeKey = '__cultivationWorldStatusBarBridge';
const frameId = 'cultivation-world-status-bar-frame';
const githubOwner = 'Youzini-afk';
const githubRepo = 'smyxiuxianshijiezhuangtailan';
const branchName = 'main';

const encodePath = targetPath =>
  targetPath
    .split('/')
    .map(part => encodeURIComponent(part))
    .join('/');

const distHtmlRelativePath = 'dist/修仙世界状态栏/index.html';
const encodedDistHtmlPath = encodePath(distHtmlRelativePath);

const remoteCandidates = [
  `https://raw.githubusercontent.com/${githubOwner}/${githubRepo}/${branchName}/${encodedDistHtmlPath}`,
  `https://testingcf.jsdelivr.net/gh/${githubOwner}/${githubRepo}@${branchName}/${encodedDistHtmlPath}`,
];

const iframeShell = await readFile(iframeSrcdocPath, 'utf8');
const normalizedIframeShell = iframeShell.replace(/<html>\s*$/i, '<body></body></html>');

if (!normalizedIframeShell.includes('</head>') || !normalizedIframeShell.includes('</body>')) {
  throw new Error('util/iframe_srcdoc.html 结构异常，未找到 </head> 或 </body>。');
}

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
</script>`.trim();

const loadingHtml = normalizedIframeShell.replace(
  '</body>',
  `<div style="display:grid;place-items:center;min-height:100vh;background:#08101f;color:#f5f7fb;font-family:'Microsoft YaHei UI','PingFang SC',sans-serif;">修仙世界状态栏加载中...</div></body>`,
);

const errorHtml = message =>
  normalizedIframeShell.replace(
    '</body>',
    `<div style="padding:20px;min-height:100vh;background:#08101f;color:#f5f7fb;font-family:'Microsoft YaHei UI','PingFang SC',sans-serif;display:flex;align-items:center;justify-content:center;text-align:center;line-height:1.6;">${message}</div></body>`,
  );

const content = `
const remoteHtmlCandidates = ${JSON.stringify(remoteCandidates)};
const frameId = ${JSON.stringify(frameId)};
const bridgeKey = ${JSON.stringify(bridgeKey)};
const loadingHtml = ${JSON.stringify(loadingHtml)};
const errorHtml = message => ${JSON.stringify(errorHtml('__MESSAGE__')).replace('__MESSAGE__', '${message}')};

const parentWindow = window.parent;
const parentDocument = parentWindow.document;

parentWindow[bridgeKey] = {
  Vue: window.Vue,
  z: window.z,
  SillyTavern: window.SillyTavern,
  waitGlobalInitialized: (...args) => waitGlobalInitialized(...args),
  getVariables: (...args) => getVariables(...args),
  updateVariablesWith: (...args) => updateVariablesWith(...args),
  errorCatched: (...args) => errorCatched(...args),
};

parentDocument.getElementById(frameId)?.remove();

const iframe = parentDocument.createElement('iframe');
iframe.id = frameId;
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
iframe.srcdoc = loadingHtml;
parentDocument.body.appendChild(iframe);

const notifyError = message => {
  console.error('[修仙世界状态栏]', message);
  if (typeof toastr !== 'undefined') {
    toastr.error(message, '修仙世界状态栏');
  }
};

const injectBridge = html => {
  const moduleScriptMatch = html.match(/<script type="module">([\\s\\S]*?)<\\/script>/i);
  const styleMatch = html.match(/<style>([\\s\\S]*?)<\\/style>/i);
  if (!moduleScriptMatch || !styleMatch) {
    throw new Error('远程页面缺少模块脚本或样式，无法挂载状态栏。');
  }

  const moduleScript = moduleScriptMatch[1].trim().replace(/<\\/script>/gi, '<\\\\/script>');
  const styleContent = styleMatch[1].trim();
  return ${JSON.stringify(normalizedIframeShell)}
    .replace('</head>', ${JSON.stringify(`${bridgeScript}\n<style>__STYLE__</style>\n</head>`)}.replace('__STYLE__', styleContent))
    .replace('</body>', '<div id="app"></div><script type="module">' + moduleScript + '</script></body>');
};

const fetchRemoteHtml = async () => {
  const failures = [];
  for (const candidate of remoteHtmlCandidates) {
    try {
      const response = await fetch(candidate + '?t=' + Date.now(), { cache: 'no-store' });
      if (!response.ok) {
        failures.push(candidate + ' => HTTP ' + response.status);
        continue;
      }
      return await response.text();
    } catch (error) {
      failures.push(candidate + ' => ' + (error instanceof Error ? error.message : String(error)));
    }
  }

  throw new Error(failures.join(' | '));
};

$(window).on('pagehide', () => {
  parentDocument.getElementById(frameId)?.remove();
  delete parentWindow[bridgeKey];
});

(async () => {
  try {
    const remoteHtml = await fetchRemoteHtml();
    iframe.srcdoc = injectBridge(remoteHtml);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    notifyError('在线加载失败：' + message);
    iframe.srcdoc = errorHtml('在线加载失败，请稍后重试。<br>' + message.replace(/</g, '&lt;').replace(/>/g, '&gt;'));
  }
})();
`.trim();

const output = {
  type: 'script',
  enabled: true,
  name: `${scriptName}-在线版`,
  id: scriptId,
  content,
  info: `从 ${githubOwner}/${githubRepo} 在线拉取最新状态栏页面，并在酒馆右上角显示。`,
  button: {
    enabled: true,
    buttons: [],
  },
  data: {},
};

await writeFile(outputPath, JSON.stringify(output, null, 2), 'utf8');
console.log(`已生成在线导入文件: ${outputPath}`);
