<script setup lang="ts">
import { use } from "echarts/core";
import { CanvasRenderer } from "echarts/renderers";
import {
  LineChart,
} from "echarts/charts";
import {
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  DataZoomComponent,
  GridComponent,
  ToolboxComponent,
} from "echarts/components";
import VChart, { THEME_KEY } from "vue-echarts";
import { ref, provide, onMounted, watch } from "vue";
import { initializeApp } from "firebase/app";
import { getFirestore, collection, query, where, onSnapshot } from "firebase/firestore";
// import { getAnalytics } from "firebase/analytics";
import { getAuth, signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { whenever } from "@vueuse/core";
import type { ECBasicOption } from "echarts/types/dist/shared";

const firebaseConfig = {
  apiKey: "AIzaSyAUfg-GWp2g5dHfpY4Bx4x1piTwWb2TNUk",
  authDomain: "n8n-auth-463006.firebaseapp.com",
  projectId: "n8n-auth-463006",
  storageBucket: "n8n-auth-463006.firebasestorage.app",
  messagingSenderId: "155426998560",
  appId: "1:155426998560:web:dce77225e2bff9b2f56f45",
  measurementId: "G-9FC1K3YX60"
};

type Telemetry = {
  createdAt: number;
  humidity: number;
  temperature: number;
}

const app = initializeApp(firebaseConfig);

// const analytics = getAnalytics(app);

const provider = new GoogleAuthProvider();
const auth = getAuth();
const currentUser = ref<typeof auth.currentUser>(null);
auth.onAuthStateChanged((user) => {
  currentUser.value = user;
  if (user) {
    console.log("User is signed in:", user);
  } else {
    console.log("No user is signed in.");
  }
});


onMounted(async () => {
  await auth.authStateReady()

  if (auth.currentUser) {
    console.log("User is already signed in:", auth.currentUser);
    return;
  }

  await signInWithPopup(auth, provider)
    .then((result) => {
      console.log("User signed in successfully:", result);
    }).catch((error) => {
      console.error("Error signing in:", error);
    });
})

const db = getFirestore(app);
const telemetryCollection = collection(db, "telemetry");
const telemetryQuery = query(telemetryCollection, where("createdAt", ">=", Date.now() - 8 * 60 * 60 * 1000));



const telemetries = ref<Telemetry[]>([]);
whenever(currentUser, () => {
  onSnapshot(telemetryQuery, (querySnapshot) => {
    telemetries.value = querySnapshot.docs.map(doc => doc.data() as Telemetry)
    console.log("Telemetry data updated:", telemetries.value);
  })
}, { once: true, immediate: true })


// 

use([
  CanvasRenderer,
  LineChart,
  DataZoomComponent,
  GridComponent,
  ToolboxComponent,
  TitleComponent,
  TooltipComponent,
  LegendComponent
]);

provide(THEME_KEY, "dark");

const option = ref<ECBasicOption>({
  tooltip: {
    trigger: 'axis',
    position: function (pt: any) {
      // pt is an array with [x, y] coordinates
      const chartWidth = document.querySelector('.chart')?.clientWidth || 800;
      const x = pt[0];
      // If the x coordinate is more than 80% of the chart width, position tooltip to the left
      if (x > chartWidth - 200) {
        return [chartWidth - 200, '10%'];
      }

      return [pt[0], '10%'];
    }
  },
  title: {
    left: 'center',
    text: 'Temperature'
  },
  toolbox: {
    feature: {
      dataZoom: {
        yAxisIndex: 'none'
      },
      restore: {},
      saveAsImage: {}
    }
  },
  xAxis: {
    type: 'time',
    boundaryGap: false
  },
  yAxis: [
    {
      type: 'value',
      name: 'Temperature (°C)',
      boundaryGap: ['-10%', '10%'],
      min: function (value: any) {
        return value.min - 0.5;
      },
    },
    {
      type: 'value',
      name: 'Humidity (%)',
      position: 'right',
      boundaryGap: ['-10%', '10%'],
      min: function (value: any) {
        return value.min - 0.5;
      },
    },
  ],
  dataZoom: [
    {
      type: 'inside',
      start: 0,
      end: 100
    },
    {
      start: 0,
      end: 100
    }
  ],
  series: [
    {
      name: 'Temperature',
      type: 'line',
      symbol: 'none',
      areaStyle: {},
      yAxisIndex: 0,
      data: [] as [number, number][]
    },
    {
      name: 'Humidity',
      type: 'line',
      symbol: 'none',
      yAxisIndex: 1,
      data: [] as [number, number][]
    }
  ]
});

watch(telemetries, (newTelemetries) => {
  const series = option.value.series as any;
  series[0].data = newTelemetries.map<[number, number]>(t => [+new Date(t.createdAt), t.temperature]);
  series[1].data = newTelemetries.map<[number, number]>(t => [+new Date(t.createdAt), t.humidity]);
}, { immediate: true });

</script>

<template>
  <v-chart class="chart" :option="option" autoresize />
</template>

<style scoped>
.chart {
  height: 100vh;
  width: 100%;
}
</style>