<template>
  <div class="character-relation-panel">
    <section class="relation-flow-card">
      <div class="section-head">
        <div>
          <span class="eyebrow">Character Graph</span>
          <h3>角色关系图</h3>
        </div>
        <span>{{ characters.length }} 角色 / {{ relations.length }} 关系</span>
      </div>

      <div class="relation-flow">
        <VueFlow
          id="character-relation-flow"
          :nodes="flowNodes"
          :edges="flowEdges"
          :nodes-draggable="false"
          :nodes-connectable="false"
          :fit-view-on-init="true"
          :min-zoom="0.3"
          :max-zoom="1.15"
        >
          <template #node-character="{ data }">
            <article class="character-node">
              <Handle type="target" :position="Position.Left" />
              <strong>{{ data.character.name }}</strong>
              <span>{{ data.character.role }}</span>
              <p>{{ data.character.status }}</p>
              <em>压力 {{ data.pressure?.value ?? data.character.pressure }}/{{ data.pressure?.threshold ?? 100 }}</em>
              <Handle type="source" :position="Position.Right" />
            </article>
          </template>
          <Background :gap="22" :size="1" pattern-color="var(--canvas-dot)" />
          <Controls position="bottom-left" />
        </VueFlow>
      </div>
    </section>

    <aside class="relation-editor-card">
      <div class="section-head">
        <div>
          <span class="eyebrow">Relation Ledger</span>
          <h3>关系账本</h3>
        </div>
        <el-button size="small" text @click="startCreate">新增</el-button>
      </div>

      <div class="relation-list">
        <button
          v-for="relation in relations"
          :key="relation.id"
          type="button"
          :class="{ active: relation.id === form.id }"
          @click="selectRelation(relation)"
        >
          <strong>{{ relation.title }}</strong>
          <span>{{ characterName(relation.sourceCharacterId) }} → {{ characterName(relation.targetCharacterId) }}</span>
          <em>{{ characterRelationKindLabel(relation.kind) }} / 信任 {{ relation.trust }} / 张力 {{ relation.tension }}</em>
        </button>
        <div v-if="!relations.length" class="empty-mini">暂无关系记录</div>
      </div>

      <el-form label-position="top" class="relation-form">
        <el-form-item label="来源角色">
          <el-select v-model="form.sourceCharacterId">
            <el-option v-for="character in characters" :key="character.id" :label="character.name" :value="character.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="目标角色">
          <el-select v-model="form.targetCharacterId">
            <el-option v-for="character in characters" :key="character.id" :label="character.name" :value="character.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="关系类型">
          <el-select v-model="form.kind">
            <el-option v-for="item in relationKindOptions" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
        </el-form-item>
        <el-form-item label="标题">
          <el-input v-model="form.title" />
        </el-form-item>
        <el-form-item label="信任">
          <el-slider v-model="form.trust" :min="0" :max="100" />
        </el-form-item>
        <el-form-item label="张力">
          <el-slider v-model="form.tension" :min="0" :max="100" />
        </el-form-item>
        <el-form-item label="共同秘密">
          <el-switch v-model="form.secret" active-text="有" inactive-text="无" />
        </el-form-item>
        <el-form-item label="当前关系状态" class="wide">
          <el-input v-model="form.current" type="textarea" :rows="3" />
        </el-form-item>
        <el-form-item label="未来走向" class="wide">
          <el-input v-model="form.future" type="textarea" :rows="3" />
        </el-form-item>
      </el-form>

      <div class="relation-actions">
        <el-button type="primary" @click="submitRelation">保存关系</el-button>
        <el-button v-if="form.id" type="danger" text @click="deleteRelation">删除</el-button>
      </div>
    </aside>

    <section class="character-board">
      <article v-for="character in characters" :key="character.id" class="character-card">
        <div class="card-title">
          <div>
            <strong>{{ character.name }}</strong>
            <span>{{ character.role }}</span>
          </div>
          <b>{{ pressureFor(character.id)?.value ?? character.pressure }}</b>
        </div>
        <p><b>目标</b>{{ character.goal }}</p>
        <p><b>知识边界</b>{{ character.knowledge }}</p>
        <p><b>状态</b>{{ character.status }}</p>
        <p><b>语气</b>{{ dialogueFor(character.id)?.voiceRules.join(' / ') || character.voice }}</p>
        <p><b>关系备注</b>{{ relationNotes(character.id).join('；') || character.relationship }}</p>
      </article>
      <el-empty v-if="!characters.length" description="暂无角色信息" />
    </section>
  </div>
</template>

<script setup lang="ts">
import { Background } from '@vue-flow/background'
import { Controls } from '@vue-flow/controls'
import { Handle, Position, VueFlow, type Edge, type Node } from '@vue-flow/core'
import '@vue-flow/core/dist/style.css'
import '@vue-flow/core/dist/theme-default.css'
import '@vue-flow/controls/dist/style.css'
import { ElMessage, ElMessageBox } from 'element-plus'
import { computed, reactive, watch } from 'vue'
import type { CharacterProfile, CharacterRelation, CharacterRelationGraph, CharacterRelationKind, DialogueProfile, PressureRecord } from '@/api'
import { characterRelationKindLabel } from '../labels'

type RelationDraft = Omit<CharacterRelation, 'id' | 'projectId' | 'updatedAt'> & { id?: string }

const props = defineProps<{
  graph: CharacterRelationGraph | null
}>()

const emit = defineEmits<{
  'save-relation': [payload: RelationDraft]
  'delete-relation': [relationId: string]
}>()

const relationKindOptions: Array<{ value: CharacterRelationKind; label: string }> = [
  { value: 'trust', label: '信任' },
  { value: 'conflict', label: '冲突' },
  { value: 'secret', label: '秘密' },
  { value: 'ally', label: '同盟' },
  { value: 'rival', label: '竞争' },
  { value: 'debt', label: '债务' },
  { value: 'family', label: '亲缘' },
]

const form = reactive<RelationDraft>({
  id: '',
  sourceCharacterId: '',
  targetCharacterId: '',
  kind: 'trust',
  title: '',
  tension: 50,
  trust: 50,
  secret: false,
  current: '',
  future: '',
})

const characters = computed<CharacterProfile[]>(() => props.graph?.characters ?? [])
const relations = computed<CharacterRelation[]>(() => props.graph?.relations ?? [])
const pressures = computed<PressureRecord[]>(() => props.graph?.pressures ?? [])
const dialogueProfiles = computed<DialogueProfile[]>(() => props.graph?.dialogueProfiles ?? [])

const characterName = (characterId: string) => characters.value.find((item) => item.id === characterId)?.name ?? characterId
const pressureFor = (characterId: string) => pressures.value.find((item) => item.characterId === characterId)
const dialogueFor = (characterId: string) => dialogueProfiles.value.find((item) => item.characterId === characterId)
const relationNotes = (characterId: string) =>
  relations.value
    .filter((relation) => relation.sourceCharacterId === characterId || relation.targetCharacterId === characterId)
    .map((relation) => `${relation.title}：信任 ${relation.trust} / 张力 ${relation.tension}`)

const flowNodes = computed<Node[]>(() => {
  const count = Math.max(characters.value.length, 1)
  const centerX = 360
  const centerY = 210
  const radiusX = characters.value.length <= 2 ? 230 : 290
  const radiusY = characters.value.length <= 2 ? 0 : 150
  return characters.value.map((character, index) => {
    const angle = (Math.PI * 2 * index) / count - Math.PI / 2
    return {
      id: character.id,
      type: 'character',
      position: {
        x: centerX + Math.cos(angle) * radiusX,
        y: centerY + Math.sin(angle) * radiusY,
      },
      data: {
        character,
        pressure: pressureFor(character.id),
      },
      draggable: false,
      selectable: true,
      style: { width: '210px', height: '128px' },
    }
  })
})

const flowEdges = computed<Edge[]>(() =>
  relations.value.map((relation) => ({
    id: relation.id,
    source: relation.sourceCharacterId,
    target: relation.targetCharacterId,
    label: `${characterRelationKindLabel(relation.kind)} ${relation.trust}/${relation.tension}`,
    type: 'smoothstep',
    animated: relation.secret || relation.tension >= 70,
    class: relation.tension >= 70 ? 'edge-tension' : 'edge-relation',
  })),
)

const assignForm = (relation?: CharacterRelation) => {
  const first = characters.value[0]?.id ?? ''
  const second = characters.value[1]?.id ?? first
  form.id = relation?.id ?? ''
  form.sourceCharacterId = relation?.sourceCharacterId ?? first
  form.targetCharacterId = relation?.targetCharacterId ?? second
  form.kind = relation?.kind ?? 'trust'
  form.title = relation?.title ?? ''
  form.tension = relation?.tension ?? 50
  form.trust = relation?.trust ?? 50
  form.secret = relation?.secret ?? false
  form.current = relation?.current ?? ''
  form.future = relation?.future ?? ''
}

const selectRelation = (relation: CharacterRelation) => assignForm(relation)

const startCreate = () => assignForm()

const submitRelation = () => {
  if (!form.sourceCharacterId || !form.targetCharacterId) {
    ElMessage.warning('请先选择两个角色')
    return
  }
  if (form.sourceCharacterId === form.targetCharacterId) {
    ElMessage.warning('来源角色和目标角色不能相同')
    return
  }
  if (!form.title.trim()) {
    ElMessage.warning('请填写关系标题')
    return
  }
  emit('save-relation', {
    ...form,
    id: form.id || undefined,
    title: form.title.trim(),
    current: form.current.trim(),
    future: form.future.trim(),
  })
}

const deleteRelation = async () => {
  if (!form.id) return
  try {
    await ElMessageBox.confirm('确认删除这条角色关系？', '删除角色关系', { type: 'warning' })
  } catch {
    return
  }
  emit('delete-relation', form.id)
  startCreate()
}

watch(
  () => props.graph,
  () => {
    const current = relations.value.find((relation) => relation.id === form.id)
    assignForm(current ?? relations.value[0])
  },
  { immediate: true },
)
</script>

<style scoped lang="scss">
.character-relation-panel {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 360px;
  gap: 12px;
}

.relation-flow-card,
.relation-editor-card,
.character-card {
  min-width: 0;
  overflow: hidden;
  border: 1px solid var(--bd-line);
  border-radius: 10px;
  background: color-mix(in srgb, var(--surface-raised) 94%, transparent);
  box-shadow: var(--sh-edge);
}

.section-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 10px;
  padding: 11px 12px;
  border-bottom: 1px solid var(--bd-line);
  background: var(--surface-field);

  h3 {
    margin: 3px 0 0;
    color: var(--t2);
    font-size: 13px;
    font-weight: 950;
  }

  > span {
    color: var(--t5);
    font-size: 11px;
    font-weight: 850;
  }
}

.eyebrow {
  color: var(--brand-copper);
  font-size: 10px;
  font-weight: 900;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

.relation-flow {
  height: 460px;
  background:
    linear-gradient(color-mix(in srgb, var(--paper-surface) 70%, transparent), color-mix(in srgb, var(--surface-soft) 66%, transparent)),
    var(--app-bg);
}

.character-node {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 5px;
  width: 100%;
  height: 100%;
  padding: 12px;
  border: 1px solid color-mix(in srgb, var(--brand-moss) 34%, var(--bd-line));
  border-radius: 10px;
  background: color-mix(in srgb, var(--paper-surface) 90%, transparent);
  box-shadow: 0 14px 30px color-mix(in srgb, var(--shadow-color) 12%, transparent);

  strong,
  span,
  p,
  em {
    display: block;
    min-width: 0;
    margin: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  strong {
    color: var(--t1);
    font-size: 14px;
    font-weight: 950;
  }

  span,
  p,
  em {
    color: var(--t5);
    font-size: 11px;
    font-style: normal;
    font-weight: 750;
  }

  p {
    white-space: normal;
    display: -webkit-box;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 2;
  }

  em {
    margin-top: auto;
    color: var(--brand-copper);
    font-weight: 900;
  }
}

.relation-editor-card {
  grid-row: span 2;
}

.relation-list {
  display: grid;
  gap: 6px;
  max-height: 190px;
  overflow: auto;
  padding: 8px;

  button {
    min-width: 0;
    padding: 8px 9px;
    border: 1px solid var(--bd-line);
    border-radius: 8px;
    color: inherit;
    background: color-mix(in srgb, var(--paper-surface) 74%, transparent);
    text-align: left;
    cursor: pointer;

    &.active,
    &:hover {
      border-color: color-mix(in srgb, var(--brand-moss) 34%, var(--bd-line));
      background: color-mix(in srgb, var(--brand-moss) 7%, var(--surface-field));
    }
  }

  strong,
  span,
  em {
    display: block;
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  strong {
    color: var(--t2);
    font-size: 12px;
    font-weight: 950;
  }

  span,
  em {
    margin-top: 3px;
    color: var(--t5);
    font-size: 10px;
    font-style: normal;
    font-weight: 750;
  }
}

.relation-form {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0 9px;
  padding: 9px 10px 0;

  .wide {
    grid-column: 1 / -1;
  }
}

.relation-actions {
  display: flex;
  gap: 8px;
  padding: 0 10px 12px;
}

.character-board {
  display: grid;
  grid-column: 1;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 9px;
}

.character-card {
  padding: 11px 12px;

  p {
    display: grid;
    grid-template-columns: 68px minmax(0, 1fr);
    gap: 8px;
    margin: 9px 0 0;
    color: var(--t5);
    font-size: 11px;
    font-weight: 750;
    line-height: 1.55;
  }

  p b {
    color: var(--t4);
    font-weight: 950;
  }
}

.card-title {
  display: flex;
  justify-content: space-between;
  gap: 8px;
  padding-bottom: 8px;
  border-bottom: 1px solid var(--bd-line);

  strong,
  span {
    display: block;
  }

  strong {
    color: var(--t1);
    font-size: 14px;
    font-weight: 950;
  }

  span {
    margin-top: 3px;
    color: var(--t5);
    font-size: 11px;
    font-weight: 800;
  }

  b {
    display: grid;
    place-items: center;
    width: 34px;
    height: 34px;
    border: 1px solid color-mix(in srgb, var(--brand-copper) 34%, var(--bd-line));
    border-radius: 999px;
    color: var(--brand-copper);
    background: color-mix(in srgb, var(--brand-copper) 8%, transparent);
    font-size: 12px;
  }
}

.empty-mini {
  display: grid;
  place-items: center;
  min-height: 54px;
  border: 1px dashed color-mix(in srgb, var(--brand-moss) 28%, var(--bd-line));
  border-radius: 8px;
  color: var(--t5);
  font-size: 12px;
  font-weight: 850;
}

:deep(.vue-flow__edge.edge-relation path) {
  stroke: color-mix(in srgb, var(--brand-moss) 58%, transparent);
  stroke-width: 1.8;
}

:deep(.vue-flow__edge.edge-tension path) {
  stroke: color-mix(in srgb, var(--brand-copper) 78%, transparent);
  stroke-width: 2.2;
}

:deep(.vue-flow__edge-textbg) {
  fill: var(--surface-raised);
}

:deep(.vue-flow__edge-text) {
  fill: var(--t4);
  font-size: 10px;
  font-weight: 800;
}

@media (max-width: 1180px) {
  .character-relation-panel,
  .character-board {
    grid-template-columns: 1fr;
  }

  .relation-editor-card,
  .character-board {
    grid-column: 1;
  }
}
</style>
