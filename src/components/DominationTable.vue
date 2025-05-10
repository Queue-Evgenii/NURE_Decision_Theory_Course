<script setup lang="ts">
import type { Alternative } from '@/models/Alternative';
import type { Criteria } from '@/models/Criteria';
import { DominationTable } from '@/models/DominationTable';
import { DominationTableSupporter } from '@/models/DominationTableSupporter';
import { ComparisonValues } from '@/models/enums/ComparisonValues';
import { computed, onMounted, reactive, ref, watchEffect } from 'vue';

const props = defineProps({
  criterias: {
    type: Array as () => ReadonlyArray<Criteria>,
    required: true,
  },
  alternatives: {
    type: Array as () => ReadonlyArray<Alternative>,
    required: true,
  },
});

const emits = defineEmits(['alternativeSelected']);

const initMatrix = ref<Array<Array<number>>>();
const tables = reactive<Array<DominationTable>>([]);
const fabric = new DominationTableSupporter(props.alternatives, props.criterias);

const updateMatrix = (tableId: number, cellIndex: { i: number, j: number }, value: number) => {
  const table = tables.find(t => t.id === tableId);

  if (table === undefined) {
    console.log("ERROR! id: ", tableId);
    return;
  }

  table.matrix[cellIndex.i][cellIndex.j] = value;
  table.matrix[cellIndex.j][cellIndex.i] = (
    value === ComparisonValues.ROW_BETTER
      ? ComparisonValues.COLUMN_BETTER
      : value === ComparisonValues.COLUMN_BETTER
        ? ComparisonValues.ROW_BETTER
        : ComparisonValues.UNCOMPARABLE
  );

  const len = table.matrix.length;
  for (let k = 0; k < len; k++) {
    for (let i = 0; i < len; i++) {
      for (let j = 0; j < len; j++) {
        if (
          table.matrix[i][k] === ComparisonValues.ROW_BETTER &&
          table.matrix[k][j] === ComparisonValues.ROW_BETTER &&
          table.matrix[i][j] !== ComparisonValues.ROW_BETTER
        ) {
          table.matrix[i][j] = ComparisonValues.ROW_BETTER;
          table.matrix[j][i] = ComparisonValues.COLUMN_BETTER;
        }
      }
    }
  }


  table.isCurrent = false;
  for (let i = 0; i < len; i++) {
    for (let j = i + 1; j < len; j++) {
      if (table.matrix[i][j] === ComparisonValues.UNCOMPARABLE) {
        const newTable = new DominationTable(table.matrix);
        tables.push(newTable);
        return;
      }
    }
  }
}

onMounted(() => {
  initMatrix.value = fabric.initializeMatrix();
  tables.push(new DominationTable(initMatrix.value));
})
</script>

<template>
  <div v-if="initMatrix">
    <h2>Initial table</h2>
    <table>
      <thead>
        <tr>
          <th></th>
          <th v-for="(value, index) in alternatives" :key="index">
            {{ Object.values(value).join("") }}
          </th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(alt, altIndex) in alternatives" :key="altIndex">
          <th>{{ Object.values(alt).join("") }}</th>
          <td v-for="(value, index) in initMatrix[altIndex]" :key="index">
            <div v-if="index >= altIndex">{{ value }}</div>
            <div v-else></div>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
  <ul v-if="tables.length > 0">
    <li v-for="table in tables" :key="table.id">
      <h2>Step {{ table.id + 1 }}</h2>
      <table>
        <thead>
          <tr>
            <th></th>
            <th v-for="(value, index) in alternatives" :key="index">
              {{ Object.values(value).join("") }}
            </th>
          </tr>
        </thead>
        <tbody v-if="table.isCurrent">
          <tr v-for="(alt, altIndex) in alternatives" :key="altIndex">
            <th>{{ Object.values(alt).join("") }}</th>
            <td v-for="(value, index) in table.matrix[altIndex]" :key="index">
              <div v-if="index >= altIndex">
                <span v-if="value === ComparisonValues.SAME">{{ value }}</span>
                <select v-else :id="Object.values(alt).join('')"
                  @change="e => updateMatrix(table.id, { i: altIndex, j: index }, parseInt(e.target?.value))">
                  <option :value="ComparisonValues.UNCOMPARABLE" :selected="value === ComparisonValues.UNCOMPARABLE">
                    {{ ComparisonValues.UNCOMPARABLE }}
                  </option>
                  <option :value="ComparisonValues.ROW_BETTER" :selected="value === ComparisonValues.ROW_BETTER">
                    {{ ComparisonValues.ROW_BETTER }}
                  </option>
                  <option :value="ComparisonValues.COLUMN_BETTER" :selected="value === ComparisonValues.COLUMN_BETTER">
                    {{ ComparisonValues.COLUMN_BETTER }}
                  </option>
                </select>
              </div>
              <div v-else></div>
            </td>
          </tr>
        </tbody>
        <tbody v-else>
          <tr v-for="(alt, altIndex) in alternatives" :key="altIndex">
            <th>{{ Object.values(alt).join("") }}</th>
            <td v-for="(value, index) in table.matrix[altIndex]" :key="index">
              <div v-if="index >= altIndex">{{ value }}</div>
              <div v-else></div>
            </td>
          </tr>
        </tbody>
      </table>
    </li>

  </ul>
</template>
