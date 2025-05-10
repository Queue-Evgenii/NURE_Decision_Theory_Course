<script setup lang="ts">
import { loadFile } from '@/helpers/browser/loadFile';
import { criteriasMapper } from '@/helpers/mappers/criteriasMapper';
import type { Alternative, ClassifiedAlternative } from '@/models/Alternative';
import type { AlternativeGenerator } from '@/models/AlternativeGenerator';
import { CartesianAlternativeGenerator } from '@/models/CartesianAlternativeGenerator';
import type { Classification } from '@/models/Classification';
import type { Criteria } from '@/models/Criteria';
import { OrdinalClassifier } from '@/models/OrdinalClissifier';
import { ref } from 'vue';

const criterias = ref<Array<Criteria>>();
const grades = ref<ReadonlyArray<number>>();
const alternatives = ref<ReadonlyArray<Alternative>>([]);
const classification = ref<Classification>();

const handleFilepickerChange = async (event: Event) => {
  const input = event.target as HTMLInputElement;

  if (!input.files || input.files.length === 0) return;

  const file = input.files[0];
  const rawData = await loadFile<{ criterias: Array<Criteria>, grades: ReadonlyArray<number> }>(file);
  criterias.value = undefined;

  criterias.value = criteriasMapper(rawData.criterias);
  grades.value = rawData.grades;
  alternatives.value = [];
}

const process = () => {
  if (!criterias.value || !grades.value) return;

  const alternativeGenerator: AlternativeGenerator = new CartesianAlternativeGenerator();
  alternatives.value = alternativeGenerator.generateAlternatives(criterias.value);

  const classifiedAlternatives = alternatives.value.map((alternative, index): ClassifiedAlternative => {
    if (index === 0) {
      return {
        alternative,
        grade: 1,
      };
    }
    if (index === alternatives.value.length - 1) {
      return {
        alternative,
        grade: 2,
      };
    }
    return {
      alternative,
      grade: [1, 2],
    };
  });

  const ordinalClassifier = new OrdinalClassifier();
  classification.value = ordinalClassifier.classify(classifiedAlternatives, criterias.value, grades.value);
}
</script>

<template>
  <main class="_container">
    <section class="criterias">
      <h2>Criterias</h2>
      <ul v-if="criterias">
        <li v-for="(criteria, index) in criterias" :key="index">
          Criteria {{ index + 1 }}: {{ criteria.name }} = {
          {{
            criteria.variants.map(e => e.name).join(", ")
          }}
          }
        </li>
      </ul>
      <div>
        <label for="filepicker">Select JSON file.</label>
        <input id="filepicker" type="file" accept=".json" @change="handleFilepickerChange">
      </div>
      <button id="processButton" @click="process">Process</button>
    </section>

    <section v-if="alternatives !== undefined && classification !== undefined">
      <table v-for="step in classification.steps" :key="step.iteration">
        <thead>
          <tr>
            <th>{{ step.iteration + 1 }}</th>
          </tr>
          <tr>
            <th>№</th>

            <th v-for="key in Object.keys(step.alternatives[0].alternative)" :key="key">{{ key }}</th>

            <th>G</th>

            <th>d1</th>
            <th>d2</th>

            <th>p1</th>
            <th>p2</th>

            <th>g1</th>
            <th>g2</th>

            <th>F1</th>
            <th>F2</th>
            <th>F</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(row, index) in step.alternatives" :key="index"
            :class="[row.grade === 2 ? 'red' : '', row.grade === 1 ? 'green' : '',]">
            <td>{{ index + 1 }}</td>

            <td v-for="key in Object.keys(row.alternative)" :key="key">{{ row.alternative[key] }}</td>

            <td>{{ row.grade }}</td>

            <td>{{ row.distanceToGood }}</td>
            <td>{{ row.distanceToBad }}</td>

            <td>{{ row.closenessToGood }}</td>
            <td>{{ row.closenessToBad }}</td>

            <td>{{ row.amountBetter }}</td>
            <td>{{ row.amountWorse }}</td>

            <td>{{ row.informativenessForGood }}</td>
            <td>{{ row.informativenessForBad }}</td>
            <td>{{ row.informativeness }}</td>
          </tr>
        </tbody>
      </table>
    </section>
  </main>
</template>
