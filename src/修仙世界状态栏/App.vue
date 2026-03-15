<template>
  <div class="cw-root" :class="`cw-root--${layout}`">
    <div class="cw-anchor" aria-hidden="true"></div>

    <button
      v-if="layout === 'fab'"
      class="cw-fab"
      type="button"
      :title="`展开${hero.姓名 || '修仙状态栏'}`"
      @click="layout = 'floating'"
    >
      <span class="cw-fab__halo"></span>
      <span class="cw-fab__moon"></span>
      <span class="cw-fab__label">{{ hero.姓名 || '修仙状态栏' }}</span>
      <span class="cw-fab__sub">{{ hero.修为境界 || '未入道' }}</span>
    </button>

    <section v-else class="cw-panel" :class="panelClasses" :style="panelStyle">
      <header class="cw-panel__header" @mousedown="startDrag">
        <div class="cw-header__brand">
          <div class="cw-header__moon"></div>
          <div>
            <p class="cw-panel__eyebrow">Moon Phase Cultivation</p>
            <h1 class="cw-panel__title">修仙世界状态栏</h1>
          </div>
        </div>

        <div class="cw-header__actions">
          <button class="cw-icon-btn" type="button" :title="layoutToggleTitle" @click="toggleLayoutMode">
            {{ layout === 'inline' ? '浮' : '嵌' }}
          </button>
          <button class="cw-icon-btn" type="button" title="收起为悬浮球" @click="layout = 'fab'">藏</button>
        </div>
      </header>

      <div class="cw-world-strip">
        <div v-for="item in worldMeta" :key="item.label" class="cw-world-chip">
          <span class="cw-world-chip__label">{{ item.label }}</span>
          <span class="cw-world-chip__value">{{ item.value }}</span>
        </div>
      </div>

      <section class="cw-section">
        <div class="cw-section__heading">
          <p class="cw-section__eyebrow">命格气海</p>
          <h2 class="cw-section__title">修者本相</h2>
        </div>

        <div class="cw-progress-card">
          <div>
            <p class="cw-progress-card__label">{{ hero.修为境界 || '未定境界' }}</p>
            <h3 class="cw-progress-card__title">{{ hero.姓名 || '无名修士' }}</h3>
          </div>
          <div class="cw-progress-card__value">{{ cultivationProgress }}%</div>
          <div class="cw-progress-card__bar">
            <span class="cw-progress-card__fill" :style="{ width: `${cultivationProgress}%` }"></span>
          </div>
        </div>

        <div class="cw-grid">
          <article v-for="item in profileCards" :key="item.label" class="cw-stat-card">
            <p class="cw-stat-card__label">{{ item.label }}</p>
            <p class="cw-stat-card__value">{{ item.value }}</p>
          </article>
        </div>
      </section>

      <section class="cw-section">
        <div class="cw-section__heading">
          <p class="cw-section__eyebrow">道法万千</p>
          <h2 class="cw-section__title">功法与法宝</h2>
        </div>

        <details class="cw-accordion" open>
          <summary>
            <span>主修功法</span>
            <strong>{{ mainTechnique.名称 || '暂无' }}</strong>
          </summary>
          <div class="cw-accordion__body">
            <div class="cw-split-grid">
              <article class="cw-glass-card">
                <p class="cw-mini-label">品阶</p>
                <p class="cw-mini-value">{{ mainTechnique.品阶 || '未定' }}</p>
              </article>
              <article class="cw-glass-card">
                <p class="cw-mini-label">层数</p>
                <p class="cw-mini-value">{{ techniqueLayerText }}</p>
              </article>
            </div>
            <p class="cw-description">{{ mainTechnique.描述 || '暂无描述。' }}</p>
          </div>
        </details>

        <details class="cw-accordion">
          <summary>
            <span>旁支修法</span>
            <strong>{{ sideTechniqueSummary }}</strong>
          </summary>
          <div class="cw-accordion__body">
            <div class="cw-tag-list">
              <span v-for="item in sideTechniques" :key="item" class="cw-tag">{{ item }}</span>
              <span v-if="sideTechniques.length === 0" class="cw-empty">暂无辅修功法</span>
            </div>
          </div>
        </details>

        <details class="cw-accordion">
          <summary>
            <span>术法与灵兽</span>
            <strong>{{ spellSummary }}</strong>
          </summary>
          <div class="cw-accordion__body cw-split-grid">
            <article class="cw-glass-card">
              <p class="cw-mini-label">术法</p>
              <div class="cw-tag-list">
                <span v-for="item in spells" :key="item" class="cw-tag">{{ item }}</span>
                <span v-if="spells.length === 0" class="cw-empty">暂无术法</span>
              </div>
            </article>
            <article class="cw-glass-card">
              <p class="cw-mini-label">灵兽</p>
              <div class="cw-tag-list">
                <span v-for="item in spiritBeasts" :key="item" class="cw-tag">{{ item }}</span>
                <span v-if="spiritBeasts.length === 0" class="cw-empty">暂无灵兽</span>
              </div>
            </article>
          </div>
        </details>

        <div class="cw-split-grid cw-split-grid--treasures">
          <article class="cw-glass-card">
            <p class="cw-mini-label">本命法宝</p>
            <h3 class="cw-glass-card__title">{{ natalTreasure.名称 || '未认主' }}</h3>
            <p class="cw-mini-value">{{ natalTreasure.品阶 || '无品阶' }}</p>
            <p class="cw-description">{{ natalTreasure.描述 || '暂无描述。' }}</p>
          </article>
          <article class="cw-glass-card">
            <p class="cw-mini-label">防御法宝</p>
            <h3 class="cw-glass-card__title">{{ defenseTreasure.名称 || '暂无' }}</h3>
            <p class="cw-mini-value">{{ defenseTreasure.品阶 || '无品阶' }}</p>
            <p class="cw-description">{{ defenseTreasure.描述 || '暂无描述。' }}</p>
          </article>
        </div>
      </section>

      <section class="cw-section">
        <div class="cw-section__heading">
          <p class="cw-section__eyebrow">须弥芥子</p>
          <h2 class="cw-section__title">背包清点</h2>
        </div>

        <div class="cw-inventory-grid">
          <article v-for="item in inventoryPanels" :key="item.label" class="cw-inventory-card" :title="item.tooltip">
            <p class="cw-mini-label">{{ item.label }}</p>
            <p class="cw-inventory-card__value">{{ item.value }}</p>
            <p class="cw-inventory-card__meta">{{ item.meta }}</p>
          </article>
        </div>
      </section>

      <section class="cw-section">
        <div class="cw-section__heading">
          <p class="cw-section__eyebrow">红尘因果</p>
          <h2 class="cw-section__title">人物与羁绊</h2>
        </div>

        <div class="cw-action-row">
          <button class="cw-action-btn" type="button" @click="activeModal = 'characters'">
            查看在场人物
            <span>{{ presentCharacters.length }}</span>
          </button>
          <button class="cw-action-btn" type="button" @click="activeModal = 'relations'">
            查看角色羁绊
            <span>{{ relationEntries.length }}</span>
          </button>
        </div>
      </section>
    </section>

    <div v-if="activeModal" class="cw-modal" @click.self="activeModal = null">
      <div class="cw-modal__card">
        <div class="cw-modal__header">
          <div>
            <p class="cw-section__eyebrow">High Dimension Modal</p>
            <h3 class="cw-modal__title">{{ activeModal === 'characters' ? '在场人物' : '红尘羁绊' }}</h3>
          </div>
          <button class="cw-icon-btn" type="button" title="关闭弹窗" @click="activeModal = null">闭</button>
        </div>

        <div v-if="activeModal === 'characters'" class="cw-character-list">
          <article v-for="item in presentCharacters" :key="item.name" class="cw-character-card">
            <div class="cw-character-card__header">
              <h4>{{ item.name }}</h4>
              <span>{{ item.summary }}</span>
            </div>
            <p>{{ item.description }}</p>
            <div class="cw-tag-list">
              <span v-for="tag in item.tags" :key="tag" class="cw-tag">{{ tag }}</span>
              <span v-if="item.tags.length === 0" class="cw-empty">无额外标签</span>
            </div>
          </article>
          <div v-if="presentCharacters.length === 0" class="cw-empty-state">当前场景空无一人。</div>
        </div>

        <div v-else class="cw-relation-grid">
          <section class="cw-relation-column">
            <div class="cw-relation-column__header">
              <h4>男性好感度</h4>
              <span>{{ maleRelations.length }}</span>
            </div>
            <article v-for="item in maleRelations" :key="`male-${item.name}`" class="cw-relation-row">
              <div>
                <strong>{{ item.name }}</strong>
                <p>{{ item.description }}</p>
              </div>
              <span>{{ item.score }}</span>
            </article>
            <div v-if="maleRelations.length === 0" class="cw-empty-state">暂无男性羁绊数据。</div>
          </section>

          <section class="cw-relation-column">
            <div class="cw-relation-column__header">
              <h4>女性好感度</h4>
              <span>{{ femaleRelations.length }}</span>
            </div>
            <article v-for="item in femaleRelations" :key="`female-${item.name}`" class="cw-relation-row">
              <div>
                <strong>{{ item.name }}</strong>
                <p>{{ item.description }}</p>
              </div>
              <span>{{ item.score }}</span>
            </article>
            <div v-if="femaleRelations.length === 0" class="cw-empty-state">暂无女性羁绊数据。</div>
          </section>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useDataStore } from './store';

type LayoutMode = 'fab' | 'floating' | 'inline';
type ActiveModal = 'characters' | 'relations' | null;

type NamedEntry = {
  name: string;
  score: number;
  description: string;
};

const store = useDataStore();

const layout = useLocalStorage<LayoutMode>('cultivation-world:layout', 'fab');
const floatingPosition = useLocalStorage<{ x: number; y: number }>('cultivation-world:position', { x: 24, y: 110 });
const activeModal = ref<ActiveModal>(null);

const dragging = ref(false);
const dragPointer = reactive({ startX: 0, startY: 0, originX: 0, originY: 0 });

const data = computed(() => store.data);
const hero = computed(() => data.value.用户信息);
const world = computed(() => data.value.世界定位);
const cultivationProgress = computed(() => _.clamp(Number(hero.value.修炼进度) || 0, 0, 100));
const mainTechnique = computed(() => hero.value.功法.主修功法);
const natalTreasure = computed(() => hero.value.法宝.本命法宝);
const defenseTreasure = computed(() => hero.value.法宝.防御法宝);

const worldMeta = computed(() => [
  { label: '大域', value: displayText(world.value.当前大域) },
  { label: '区域', value: displayText(world.value.当前区域) },
  { label: '场景', value: displayText(world.value.当前场景) },
  { label: '事件', value: displayText(world.value.当前事件) },
  { label: '日期', value: displayText(world.value.日期) },
  { label: '天气', value: displayText(world.value.天气) },
]);

const profileCards = computed(() => [
  { label: '性别', value: displayText(hero.value.性别) },
  { label: '年龄', value: `${Number(hero.value.年龄) || 0} 岁` },
  { label: '灵根', value: displayText(hero.value.灵根) },
  { label: '体质', value: displayText(hero.value.体质) },
  { label: '称号', value: displayText(hero.value.称号) },
  { label: '所属势力', value: displayText(hero.value.所属势力) },
  { label: '当前状态', value: displayText(hero.value.当前状态) },
  { label: '剑心', value: displayText(hero.value.剑心境界) },
  { label: '丹道', value: displayText(hero.value.丹道境界) },
  { label: '宗门贡献', value: formatNumber(hero.value.宗门贡献) },
  {
    label: '修真百艺',
    value: hero.value.修真百艺.length > 0 ? hero.value.修真百艺.join(' / ') : '暂无专精',
  },
]);

const sideTechniques = computed(() => extractRecordPreview(hero.value.功法.辅修功法));
const spells = computed(() => extractRecordPreview(hero.value.功法.术法));
const spiritBeasts = computed(() => extractRecordPreview(hero.value.灵兽));

const sideTechniqueSummary = computed(() => summarizeList(sideTechniques.value, '暂无辅修'));
const spellSummary = computed(() => {
  const parts = [`术法 ${spells.value.length} 门`, `灵兽 ${spiritBeasts.value.length} 只`];
  return parts.join(' / ');
});
const techniqueLayerText = computed(() => {
  const current = Number(mainTechnique.value.当前层数) || 0;
  const total = Number(mainTechnique.value.总层数) || 0;
  return total > 0 ? `${current} / ${total}` : `${current}`;
});

const inventoryPanels = computed(() => {
  const bag = hero.value.背包;
  const spiritStoneTotal = Object.values(bag.灵石).reduce((sum, value) => sum + (Number(value) || 0), 0);
  return [
    {
      label: '灵石',
      value: formatNumber(spiritStoneTotal),
      meta: `下 ${formatNumber(bag.灵石.下品)} / 中 ${formatNumber(bag.灵石.中品)} / 上 ${formatNumber(bag.灵石.上品)}`,
      tooltip: '三品灵石汇总',
    },
    makeInventoryPanel('丹药', bag.丹药),
    makeInventoryPanel('材料', bag.材料),
    makeInventoryPanel('杂物', bag.杂物),
  ];
});

const presentCharacters = computed(() =>
  Object.entries(data.value.在场人物)
    .map(([name, payload]) => normalizeCharacterEntry(name, payload))
    .sort((lhs, rhs) => lhs.name.localeCompare(rhs.name, 'zh-CN')),
);

const maleRelations = computed(() => normalizeRelationEntries(data.value.男性好感度));
const femaleRelations = computed(() => normalizeRelationEntries(data.value.女性好感度));
const relationEntries = computed(() => maleRelations.value.length + femaleRelations.value.length);

const layoutToggleTitle = computed(() => (layout.value === 'inline' ? '切回悬浮窗' : '吸附到底部'));
const panelClasses = computed(() => ({
  'cw-panel--inline': layout.value === 'inline',
  'cw-panel--floating': layout.value === 'floating',
  'is-dragging': dragging.value,
}));
const panelStyle = computed(() => {
  if (layout.value !== 'floating') {
    return undefined;
  }

  return {
    left: `${floatingPosition.value.x}px`,
    top: `${floatingPosition.value.y}px`,
  };
});

function toggleLayoutMode() {
  layout.value = layout.value === 'inline' ? 'floating' : 'inline';
}

function startDrag(event: MouseEvent) {
  if (layout.value !== 'floating') {
    return;
  }

  const target = event.target as HTMLElement | null;
  if (target?.closest('button')) {
    return;
  }

  dragging.value = true;
  dragPointer.startX = event.clientX;
  dragPointer.startY = event.clientY;
  dragPointer.originX = floatingPosition.value.x;
  dragPointer.originY = floatingPosition.value.y;
  window.addEventListener('mousemove', onDrag);
  window.addEventListener('mouseup', stopDrag);
}

function onDrag(event: MouseEvent) {
  if (!dragging.value) {
    return;
  }

  const nextX = dragPointer.originX + event.clientX - dragPointer.startX;
  const nextY = dragPointer.originY + event.clientY - dragPointer.startY;
  floatingPosition.value = {
    x: Math.max(12, nextX),
    y: Math.max(12, nextY),
  };
}

function stopDrag() {
  dragging.value = false;
  window.removeEventListener('mousemove', onDrag);
  window.removeEventListener('mouseup', stopDrag);
}

function makeInventoryPanel(label: string, record: Record<string, unknown>) {
  const names = extractRecordPreview(record);
  return {
    label,
    value: formatNumber(names.length),
    meta: names.length > 0 ? summarizeList(names, '暂无') : '暂无收藏',
    tooltip: names.join('、') || `暂无${label}`,
  };
}

function normalizeCharacterEntry(name: string, payload: unknown) {
  if (!_.isPlainObject(payload)) {
    return {
      name,
      summary: '档案未展开',
      description: displayText(payload),
      tags: [] as string[],
    };
  }

  const entries = Object.entries(payload as Record<string, unknown>);
  const primitiveEntries = entries.filter(([, value]) => isPrimitive(value));
  const tags = primitiveEntries.slice(0, 4).map(([label, value]) => `${label}:${displayText(value)}`);
  const summary = tags[0] ?? '已在场';
  const description =
    primitiveEntries
      .slice(1, 3)
      .map(([label, value]) => `${label} ${displayText(value)}`)
      .join(' · ') || '暂无进一步描述';

  return { name, summary, description, tags };
}

function normalizeRelationEntries(record: Record<string, unknown>): NamedEntry[] {
  return Object.entries(record)
    .map(([name, payload]) => {
      if (typeof payload === 'number' || typeof payload === 'string' || typeof payload === 'boolean') {
        return {
          name,
          score: toScore(payload),
          description: '直接记录值',
        };
      }

      if (_.isPlainObject(payload)) {
        const objectPayload = payload as Record<string, unknown>;
        const scoreKeys = ['好感度', '亲密度', '关系值', '数值', 'score', 'value'];
        const matchedKey = scoreKeys.find(key => key in objectPayload);
        const score = matchedKey ? toScore(objectPayload[matchedKey]) : maxNumericValue(objectPayload);
        const description = Object.entries(objectPayload)
          .filter(([key]) => key !== matchedKey)
          .slice(0, 2)
          .map(([key, value]) => `${key}:${displayText(value)}`)
          .join(' · ');

        return {
          name,
          score,
          description: description || '复合羁绊记录',
        };
      }

      return {
        name,
        score: 0,
        description: '无可解析内容',
      };
    })
    .sort((lhs, rhs) => rhs.score - lhs.score || lhs.name.localeCompare(rhs.name, 'zh-CN'));
}

function maxNumericValue(record: Record<string, unknown>) {
  return Object.values(record).reduce((max, value) => Math.max(max, toScore(value)), 0);
}

function extractRecordPreview(record: Record<string, unknown>) {
  return Object.entries(record)
    .filter(([, value]) => !isEmptyValue(value))
    .map(([key, value]) => summarizeObjectEntry(key, value));
}

function summarizeObjectEntry(key: string, value: unknown) {
  if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
    return `${key}:${displayText(value)}`;
  }
  if (Array.isArray(value)) {
    return `${key}:${value.length}项`;
  }
  if (_.isPlainObject(value)) {
    const objectValue = value as Record<string, unknown>;
    const label = ['名称', '品阶', '描述']
      .map(field => objectValue[field])
      .find(item => typeof item === 'string' && item.trim());
    return label ? `${key}:${label}` : `${key}:${Object.keys(objectValue).length}项`;
  }
  return key;
}

function summarizeList(items: string[], fallback: string) {
  return items.length > 0 ? items.slice(0, 3).join(' / ') : fallback;
}

function displayText(value: unknown) {
  if (value == null) {
    return '未记录';
  }
  if (typeof value === 'string') {
    return value.trim() || '未记录';
  }
  if (typeof value === 'number') {
    return formatNumber(value);
  }
  if (typeof value === 'boolean') {
    return value ? '是' : '否';
  }
  if (Array.isArray(value)) {
    return value.length > 0 ? value.map(item => displayText(item)).join(' / ') : '未记录';
  }
  if (_.isPlainObject(value)) {
    return `${Object.keys(value).length} 项`;
  }
  return String(value);
}

function formatNumber(value: unknown) {
  const numeric = Number(value) || 0;
  return new Intl.NumberFormat('zh-CN').format(numeric);
}

function toScore(value: unknown) {
  if (typeof value === 'boolean') {
    return value ? 1 : 0;
  }
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : 0;
}

function isPrimitive(value: unknown) {
  return value == null || ['string', 'number', 'boolean'].includes(typeof value);
}

function isEmptyValue(value: unknown) {
  if (value == null) {
    return true;
  }
  if (typeof value === 'string') {
    return value.trim().length === 0;
  }
  if (typeof value === 'number') {
    return value === 0;
  }
  if (typeof value === 'boolean') {
    return !value;
  }
  if (Array.isArray(value)) {
    return value.length === 0;
  }
  if (_.isPlainObject(value)) {
    return Object.keys(value).length === 0;
  }
  return false;
}

onBeforeUnmount(stopDrag);
</script>

<style lang="scss" scoped>
.cw-root {
  width: 100%;
  position: relative;
  color: var(--cw-text);
}

.cw-anchor {
  width: 100%;
  aspect-ratio: 16 / 1;
  opacity: 0;
  pointer-events: none;
}

.cw-panel {
  width: min(100%, 780px);
  border: 1px solid var(--cw-border);
  border-radius: 24px;
  background: var(--cw-bg);
  box-shadow: var(--cw-shadow);
  backdrop-filter: blur(20px);
  transition:
    transform var(--cw-ease),
    box-shadow var(--cw-ease),
    border-color var(--cw-ease);
  overflow: hidden;
}

.cw-panel--floating {
  position: fixed;
  z-index: 999;
}

.cw-panel--inline {
  position: relative;
  margin: 0 auto;
}

.cw-panel.is-dragging {
  box-shadow: 0 24px 60px rgba(2, 6, 23, 0.5);
  transform: scale(1.01);
}

.cw-panel__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 18px 20px 14px;
  cursor: grab;
  background: linear-gradient(180deg, rgba(251, 191, 36, 0.14), rgba(255, 255, 255, 0));
}

.cw-panel--inline .cw-panel__header {
  cursor: default;
}

.cw-header__brand,
.cw-modal__header,
.cw-character-card__header,
.cw-relation-column__header,
.cw-world-chip,
.cw-action-row,
.cw-header__actions,
.cw-split-grid,
.cw-progress-card,
.cw-grid,
.cw-inventory-grid,
.cw-tag-list,
.cw-relation-row {
  display: flex;
}

.cw-header__brand,
.cw-modal__header,
.cw-character-card__header,
.cw-relation-column__header,
.cw-world-chip,
.cw-action-row,
.cw-header__actions,
.cw-relation-row {
  align-items: center;
}

.cw-grid,
.cw-inventory-grid,
.cw-relation-grid,
.cw-character-list {
  display: grid;
}

.cw-header__brand {
  gap: 14px;
}

.cw-header__moon,
.cw-fab__moon {
  border-radius: 999px;
  background: radial-gradient(circle at 30% 30%, #fff7d2, #fbbf24 45%, #7c5b13 100%);
  box-shadow:
    0 0 22px rgba(251, 191, 36, 0.55),
    inset -8px -6px 10px rgba(0, 0, 0, 0.35);
}

.cw-header__moon {
  width: 46px;
  aspect-ratio: 1;
}

.cw-panel__eyebrow,
.cw-section__eyebrow,
.cw-mini-label,
.cw-world-chip__label,
.cw-stat-card__label,
.cw-progress-card__label,
.cw-fab__sub {
  margin: 0;
  color: var(--cw-text-soft);
  letter-spacing: 0.12em;
  text-transform: uppercase;
  font-size: 11px;
}

.cw-panel__title,
.cw-section__title,
.cw-modal__title,
.cw-progress-card__title,
.cw-glass-card__title {
  margin: 0;
  font-family: var(--cw-font-display);
}

.cw-panel__title {
  font-size: 25px;
}

.cw-header__actions {
  gap: 10px;
}

.cw-icon-btn,
.cw-action-btn {
  border: 1px solid var(--cw-border);
  color: var(--cw-text);
  background: rgba(8, 15, 29, 0.54);
  transition:
    transform var(--cw-ease),
    background var(--cw-ease),
    border-color var(--cw-ease);
}

.cw-icon-btn {
  width: 40px;
  aspect-ratio: 1;
  border-radius: 14px;
  cursor: pointer;
}

.cw-icon-btn:hover,
.cw-action-btn:hover,
.cw-fab:hover {
  transform: translateY(-1px);
  background: rgba(251, 191, 36, 0.18);
  border-color: rgba(251, 191, 36, 0.5);
}

.cw-world-strip,
.cw-section {
  padding: 0 20px 20px;
}

.cw-world-strip {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 10px;
}

.cw-world-chip {
  justify-content: space-between;
  gap: 12px;
  border: 1px solid var(--cw-border-soft);
  background: rgba(255, 255, 255, 0.04);
  border-radius: 16px;
  padding: 10px 12px;
}

.cw-world-chip__value,
.cw-stat-card__value,
.cw-progress-card__value,
.cw-mini-value,
.cw-inventory-card__value,
.cw-action-btn span,
.cw-relation-row span {
  color: var(--cw-accent-soft);
}

.cw-world-chip__value,
.cw-stat-card__value,
.cw-progress-card__value,
.cw-mini-value,
.cw-inventory-card__value {
  font-weight: 600;
}

.cw-section {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.cw-section__heading {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 12px;
}

.cw-progress-card {
  flex-wrap: wrap;
  align-items: center;
  gap: 14px;
  padding: 18px;
  border-radius: 20px;
  background: linear-gradient(135deg, rgba(125, 211, 252, 0.12), rgba(251, 191, 36, 0.16));
  border: 1px solid rgba(125, 211, 252, 0.28);
}

.cw-progress-card__title {
  font-size: 24px;
}

.cw-progress-card__value {
  margin-left: auto;
  font-size: 28px;
}

.cw-progress-card__bar {
  width: 100%;
  height: 10px;
  overflow: hidden;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.14);
}

.cw-progress-card__fill {
  display: block;
  height: 100%;
  border-radius: inherit;
  background: linear-gradient(90deg, var(--cw-cyan), var(--cw-accent));
}

.cw-grid {
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px;
}

.cw-stat-card,
.cw-glass-card,
.cw-inventory-card,
.cw-character-card,
.cw-relation-column,
.cw-modal__card {
  border-radius: 20px;
  border: 1px solid var(--cw-border-soft);
  background: rgba(6, 12, 24, 0.56);
  backdrop-filter: blur(16px);
}

.cw-stat-card,
.cw-glass-card,
.cw-inventory-card,
.cw-character-card,
.cw-relation-column {
  padding: 14px;
}

.cw-stat-card__value {
  margin: 6px 0 0;
  font-size: 16px;
  color: var(--cw-text);
}

.cw-accordion {
  border: 1px solid var(--cw-border-soft);
  border-radius: 20px;
  background: rgba(6, 12, 24, 0.42);
}

.cw-accordion summary {
  list-style: none;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 16px;
  cursor: pointer;
}

.cw-accordion summary::-webkit-details-marker {
  display: none;
}

.cw-accordion__body {
  padding: 0 16px 16px;
}

.cw-split-grid {
  gap: 12px;
}

.cw-split-grid > * {
  flex: 1 1 0;
}

.cw-split-grid--treasures {
  align-items: stretch;
}

.cw-description,
.cw-inventory-card__meta,
.cw-character-card p,
.cw-relation-row p,
.cw-empty,
.cw-empty-state {
  margin: 8px 0 0;
  color: var(--cw-text-soft);
  line-height: 1.5;
}

.cw-tag-list {
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 8px;
}

.cw-tag {
  padding: 6px 10px;
  border-radius: 999px;
  border: 1px solid rgba(125, 211, 252, 0.18);
  background: rgba(125, 211, 252, 0.09);
  color: var(--cw-text);
  font-size: 12px;
}

.cw-inventory-grid {
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 12px;
}

.cw-inventory-card__value {
  margin: 8px 0 0;
  font-size: 26px;
}

.cw-action-row {
  gap: 12px;
}

.cw-action-btn {
  flex: 1 1 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 14px 16px;
  border-radius: 18px;
  cursor: pointer;
}

.cw-action-btn span,
.cw-relation-row span {
  font-weight: 700;
}

.cw-modal {
  position: fixed;
  inset: 0;
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  background: rgba(2, 6, 23, 0.48);
  backdrop-filter: blur(12px);
}

.cw-modal__card {
  width: min(100%, 920px);
  padding: 18px;
}

.cw-modal__header {
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 14px;
}

.cw-character-list {
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
}

.cw-character-card__header,
.cw-relation-column__header,
.cw-relation-row {
  justify-content: space-between;
  gap: 12px;
}

.cw-character-card__header h4,
.cw-relation-column h4 {
  margin: 0;
  font-size: 16px;
}

.cw-character-card__header span,
.cw-relation-column__header span {
  color: var(--cw-accent-soft);
  font-size: 13px;
}

.cw-relation-grid {
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
}

.cw-relation-column {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.cw-relation-row {
  padding: 12px 0;
  border-top: 1px solid rgba(148, 163, 184, 0.12);
}

.cw-relation-row:first-of-type {
  border-top: none;
}

.cw-fab {
  position: fixed;
  right: 22px;
  top: 110px;
  z-index: 999;
  width: 88px;
  aspect-ratio: 1;
  border-radius: 999px;
  border: 1px solid rgba(251, 191, 36, 0.45);
  background: radial-gradient(circle at 30% 30%, rgba(255, 255, 255, 0.2), rgba(15, 23, 42, 0.92));
  box-shadow:
    0 0 28px rgba(251, 191, 36, 0.28),
    0 18px 30px rgba(2, 6, 23, 0.4);
  color: var(--cw-text);
  cursor: pointer;
  overflow: hidden;
}

.cw-fab__halo {
  position: absolute;
  inset: 12px;
  border-radius: inherit;
  border: 1px solid rgba(125, 211, 252, 0.26);
  animation: haloPulse 2.8s ease-in-out infinite;
}

.cw-fab__moon {
  position: absolute;
  top: 16px;
  left: 50%;
  width: 28px;
  aspect-ratio: 1;
  transform: translateX(-50%);
}

.cw-fab__label,
.cw-fab__sub {
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  width: calc(100% - 20px);
  text-align: center;
}

.cw-fab__label {
  bottom: 24px;
  font-size: 13px;
  font-weight: 700;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.cw-fab__sub {
  bottom: 10px;
  font-size: 10px;
}

@keyframes haloPulse {
  0%,
  100% {
    transform: scale(0.92);
    opacity: 0.45;
  }

  50% {
    transform: scale(1);
    opacity: 0.9;
  }
}

@media (max-width: 900px) {
  .cw-panel {
    width: min(100%, calc(100% - 24px));
  }

  .cw-world-strip,
  .cw-grid,
  .cw-inventory-grid,
  .cw-character-list,
  .cw-relation-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .cw-action-row,
  .cw-split-grid,
  .cw-panel__header {
    flex-direction: column;
    align-items: stretch;
  }

  .cw-progress-card__value {
    margin-left: 0;
  }
}

@media (max-width: 640px) {
  .cw-world-strip,
  .cw-grid,
  .cw-inventory-grid,
  .cw-character-list,
  .cw-relation-grid {
    grid-template-columns: minmax(0, 1fr);
  }

  .cw-panel__title {
    font-size: 22px;
  }

  .cw-fab {
    width: 74px;
    right: 14px;
    top: 86px;
  }
}
</style>
