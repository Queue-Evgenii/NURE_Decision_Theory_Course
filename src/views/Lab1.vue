<script setup lang="ts">
import AlternativesTable from '@/components/AlternativesTable.vue';
import { loadFile } from '@/helpers/browser/loadFile';
import { criteriasMapper } from '@/helpers/mappers/criteriasMapper';
import { Alternative } from '@/models/Alternative';
import { AlternativeClassifier } from '@/models/AlternativeClassifier';
import { type AlternativeGenerator } from '@/models/AlternativeGenerator';
import { CartesianAlternativeGenerator } from '@/models/CartesianAlternativeGenerator';
import { Criteria } from '@/models/Criteria';
import { type DecisionSupport } from '@/models/DecisionSupport';
import { DecisionSupporter } from '@/models/DecisionSupporter';
import { ref } from 'vue';

const criterias = ref<Array<Criteria>>();
const alternatives = ref<ReadonlyArray<Alternative>>();
const bestAlternative = ref<Alternative>({});
const worstAlternative = ref<Alternative>({});
const selectedAlternative = ref<Alternative | undefined>(undefined);
const betterThanSelectedAlternative = ref<ReadonlyArray<Alternative>>();
const worseThanSelectedAlternative = ref<ReadonlyArray<Alternative>>();
const incomparableThanSelectedAlternative = ref<ReadonlyArray<Alternative>>();

const handleFilepickerChange = async (event: Event) => {
  const input = event.target as HTMLInputElement;

  if (!input.files || input.files.length === 0) return;

  const file = input.files[0];
  const rawData = await loadFile<Array<Criteria>>(file);
  criterias.value = undefined;

  criterias.value = criteriasMapper(rawData);
  alternatives.value = undefined;
}

const process = () => {
  if (!criterias.value) return;

  const alternativeGenerator: AlternativeGenerator = new CartesianAlternativeGenerator();
  alternatives.value = alternativeGenerator.generateAlternatives(criterias.value);
  const decisionSupporter: DecisionSupport = new DecisionSupporter(alternatives.value);

  bestAlternative.value = decisionSupporter.getBestAlternative();
  worstAlternative.value = decisionSupporter.getWorstAlternative();
}


const handleAlternativeSelection = (alternativeIndex: number) => {
  if (!alternatives.value || !criterias.value) return;
  selectedAlternative.value = alternatives.value[alternativeIndex];

  const classifier = new AlternativeClassifier(alternatives.value, selectedAlternative.value, criterias.value);

  betterThanSelectedAlternative.value = classifier.getBetterAlternatives();
  worseThanSelectedAlternative.value = classifier.getWorseAlternatives();
  incomparableThanSelectedAlternative.value = classifier.getIncomparableAlternatives();

  const container = document.querySelector(".alternatives-by-target");
  container?.scrollIntoView({ behavior: "smooth", block: "start" });
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

    <section v-if="alternatives !== undefined" class="alternatives">
      <div v-if="alternatives.length === 0">Set is empty!</div>
      <template v-else>
        <div>
          <h2>Alternatives amount: {{ alternatives.length }}</h2>
        </div>
        <div>
          <h2>Alternatives</h2>
          <AlternativesTable :alternatives="alternatives" :clickable="true"
            @alternativeSelected="handleAlternativeSelection" :scrollable="true" />
        </div>
        <div>
          <h2>Best alternative</h2>
          <AlternativesTable :alternatives="[bestAlternative]" :scrollable="true" />
        </div>
        <div>
          <h2>Worst alternative</h2>
          <AlternativesTable :alternatives="[worstAlternative]" :scrollable="true" />
        </div>
      </template>

    </section>

    <section v-if="alternatives !== undefined
      && selectedAlternative !== undefined
      && betterThanSelectedAlternative !== undefined
      && worseThanSelectedAlternative !== undefined
      && incomparableThanSelectedAlternative !== undefined" class="alternatives-by-target">
      <div>
        <h2>Selected alternative</h2>
        <AlternativesTable :alternatives="[selectedAlternative]" :scrollable="true" />
      </div>
      <ul>
        <li>
          <h2>Alternatives amount: {{ alternatives.length }}</h2>
        </li>
        <li>
          <h2>Better than selected alternative amount: {{ betterThanSelectedAlternative.length }}</h2>
        </li>
        <li>
          <h2>Worse than selected alternative amount: {{ worseThanSelectedAlternative.length }}</h2>
        </li>
        <li>
          <h2>Non-comparative than selected alternative amount: {{ incomparableThanSelectedAlternative.length }}</h2>
        </li>
      </ul>
      <div>
        <h2>Better then selected alternative</h2>
        <AlternativesTable :alternatives="betterThanSelectedAlternative" :scrollable="true" />
      </div>
      <div>
        <h2>Worse then selected alternative</h2>
        <AlternativesTable :alternatives="worseThanSelectedAlternative" :scrollable="true" />
      </div>
      <div>
        <h2>Non-comparative alternatives</h2>
        <AlternativesTable :alternatives="incomparableThanSelectedAlternative" :scrollable="true" />
      </div>
    </section>
  </main>
</template>
