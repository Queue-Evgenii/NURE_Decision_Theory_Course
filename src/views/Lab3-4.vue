<script setup lang="ts">
import AlternativesTable from '@/components/AlternativesTable.vue';
import DominationTable from '@/components/DominationTable.vue';
import { loadFile } from '@/helpers/browser/loadFile';
import { alternativesMapper } from '@/helpers/mappers/alternativesMapper';
import { criteriasMapper } from '@/helpers/mappers/criteriasMapper';
import { Alternative } from '@/models/Alternative';
import type { AlternativeGenerator } from '@/models/AlternativeGenerator';
import { CartesianAlternativeGenerator } from '@/models/CartesianAlternativeGenerator';
import type { Criteria } from '@/models/Criteria';
import type { Gradation } from '@/models/Gradation';
import { computed, ref } from 'vue';

const criterias = ref<Array<Criteria>>();
const alternatives = ref<ReadonlyArray<Alternative>>([]);
const sortedAlternatives = ref<ReadonlyArray<Alternative>>([]);
const ungradedAlternatives = ref<ReadonlyArray<Alternative>>([]);
const gradation = ref<ReadonlyArray<Gradation>>([]);
const bestAlternative = ref<Alternative>();
const isProcessed = ref(false);

const handleFilepickerChange = async (event: Event) => {
  const input = event.target as HTMLInputElement;

  if (!input.files || input.files.length === 0) return;

  const file = input.files[0];
  const rawData = await loadFile<{ criterias: Array<Criteria>, alternatives: Array<Alternative> }>(file);
  criterias.value = undefined;

  criterias.value = criteriasMapper(rawData.criterias);
  ungradedAlternatives.value = alternativesMapper(rawData.alternatives)
}

const process = () => {
  if (!criterias.value) return;

  const alternativeGenerator: AlternativeGenerator = new CartesianAlternativeGenerator();
  alternatives.value = alternativeGenerator.generateAlternatives(criterias.value);

  isProcessed.value = true;
}

const countMatches = (a: Alternative, b: Alternative): number => {
  return Object.keys(a).reduce((count, key) => {
    return a[key] === b[key] ? count + 1 : count;
  }, 0);
}

const handleOnFinished = (array: Array<Alternative>) => {
  array.unshift(alternatives.value[0])
  sortedAlternatives.value = array;
  const arr: Array<Gradation> = [];
  ungradedAlternatives.value.forEach(alternative => {
    const ob: Gradation = {
      alternative,
      grade1: [],
      grade2: [],
    };
    for (const key in alternative) {
      console.log(key)
      for (let index = 0; index < sortedAlternatives.value.length; index++) {
        if (sortedAlternatives.value[index][key] === alternative[key]) {
          ob.grade1.push(index + 1);
          break;
        }
      }
    }
    ob.grade2 = [...ob.grade1].sort((a, b) => a - b)
    arr.push(ob);
  });

  gradation.value = [...arr];
  bestAlternative.value = arr.sort((a, b) => {
    const sumA = a.grade2.reduce((acc, val) => acc + val, 0);
    const sumB = b.grade2.reduce((acc, val) => acc + val, 0);
    return sumA - sumB;
  })[0].alternative;
}

const pairedComparisonsAmount = computed<number>(() => {
  if (!criterias.value) return 0;

  return criterias.value.length * (criterias.value.length - 1) / 2;
});
const firstReferenceSituation = computed<Alternative | undefined>(() => {
  if (!alternatives.value) return undefined;

  return alternatives.value[0];
});
const firstReferenceSituationSet = computed<ReadonlyArray<Alternative>>(() => {
  if (!alternatives.value) return [];

  const reference = alternatives.value[0];
  const rest = alternatives.value.slice(1);

  const scored = rest.map(alt => ({
    alt,
    score: countMatches(alt, reference)
  }));

  const maxScore = Math.max(...scored.map(s => s.score));

  const filtered = scored
    .filter(s => s.score === maxScore)
    .map(s => s.alt);

  const criteriaOrder = ['K1', 'K2', 'K3', 'K4'];

  filtered.sort((a, b) => {
    for (const key of criteriaOrder) {
      const aChanged = a[key] !== reference[key];
      const bChanged = b[key] !== reference[key];

      if (aChanged && !bChanged) return -1;
      if (!aChanged && bChanged) return 1;

      if (aChanged && bChanged) {
        return Number(a[key]) - Number(b[key]);
      }
    }

    return 0;
  });

  return filtered;
});

</script>

<template>
  <main class="_container">
    <section class="criterias">
      <template v-if="criterias">
        <h2>Criterias</h2>
        <ul>
          <li v-for="(criteria, index) in criterias" :key="index">
            Criteria {{ index + 1 }}: {{ criteria.name }} = {
            {{
              criteria.variants.map(e => e.name).join(", ")
            }}
            }
          </li>
        </ul>
      </template>
      <template v-if="ungradedAlternatives.length > 0">
        <h2>Ungraded Alternatives</h2>
        <ul>
          <li v-for="(alternative, index) in ungradedAlternatives" :key="index">
            Alternative {{ index + 1 }}: = {
            {{
              Object.keys(alternative).map(k => k + ": " + alternative[k]).join(", ")
            }}
            }
          </li>
        </ul>
      </template>
      <div>
        <label for="filepicker">Select JSON file.</label>
        <input id="filepicker" type="file" accept=".json" @change="handleFilepickerChange">
      </div>
      <button id="processButton" @click="process">Process</button>
    </section>

    <template v-if="isProcessed">
      <section v-if="pairedComparisonsAmount">
        <h2>Paired comparisons amount: {{ pairedComparisonsAmount }}</h2>
      </section>

      <section v-if="firstReferenceSituation">
        <h2>The first reference situation: { {{ Object.values(firstReferenceSituation).join("") }} }</h2>
      </section>
      <section v-if="firstReferenceSituation">
        <h2>Set of alternatives of the first reference situation</h2>
        <AlternativesTable :alternatives="firstReferenceSituationSet" :clickable="false" />
      </section>

      <section v-if="firstReferenceSituation && criterias">
        <h2>Comparisons</h2>
        <DominationTable :criterias="criterias" :alternatives="firstReferenceSituationSet"
          @onFinished="handleOnFinished" />
      </section>

      <section v-if="sortedAlternatives.length > 0">
        <h2>Sorted set of alternatives of the first reference situation</h2>
        <AlternativesTable :alternatives="sortedAlternatives" :clickable="false" />
      </section>

      <section v-if="gradation.length > 0">
        <h2>Gradation</h2>
        <table>
          <thead>
            <tr>
              <th></th>
              <th>Vector primary rating</th>
              <th>Vector rating</th>
              <th>Vector rating for growth</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(item, index) in gradation" :key="index">
              <th>Alternative {{ index }}</th>
              <td>{{ Object.values(item.alternative).join("") }}</td>
              <td>{{ item.grade1.join(" ") }}</td>
              <td>{{ item.grade2.join(" ") }}</td>
            </tr>
          </tbody>
        </table>
      </section>
      <section v-if="bestAlternative">
        <h2>Best alternative</h2>
        <AlternativesTable :alternatives="[bestAlternative]" :clickable="false" />
      </section>
    </template>

  </main>
</template>
