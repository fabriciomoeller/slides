<!--
  DecoShapes.vue
  Formas decorativas SVG (pills e círculos) exibidas como background dos slides.
  Suporta temas dark/light via <LightOrDark>, com cores e opacidade configuráveis via props.
  Usado para dar textura visual sutil ao fundo dos slides sem interferir no conteúdo.

  Props:
    - darkStroke1/2/3  : cores dos traços no tema escuro (padrão: fuchsia/pink)
    - lightStroke1/2/3 : cores dos traços no tema claro (padrão: fuchsia/pink)
    - opacity          : opacidade geral do SVG (padrão: 0.10)
-->
<script setup>
const props = defineProps({
  darkStroke1: { type: String, default: '#e879f9' },
  darkStroke2: { type: String, default: '#d946ef' },
  darkStroke3: { type: String, default: '#ec4899' },
  lightStroke1: { type: String, default: '#d946ef' },
  lightStroke2: { type: String, default: '#c026d3' },
  lightStroke3: { type: String, default: '#db2777' },
  opacity: { type: String, default: '0.10' },
})
</script>

<template>
  <LightOrDark>
    <template #dark>
      <div class="slide-bg">
        <svg viewBox="-80 -65 380 330" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid slice"
          :style="{ position:'absolute', inset:'0', width:'100%', height:'100%', opacity: props.opacity }">
          <!-- Pill diagonal -->
          <rect x="44.133" y="177.143" width="26.519" height="67.13" rx="13.26"
            fill="none" :stroke="darkStroke1" stroke-width="1.3"
            transform="matrix(0.71567501,-0.69843345,0.69975812,0.71437985,0,0)"/>
          <!-- Circle top -->
          <ellipse cx="52.413" cy="-155.864" rx="13.371" ry="13.371"
            fill="none" :stroke="darkStroke1" stroke-width="1.3"
            transform="rotate(96.687843)"/>
          <!-- Circle red -->
          <ellipse cx="179.209" cy="-265.051" rx="13.371" ry="13.371"
            fill="none" :stroke="darkStroke3" stroke-width="1.3"
            transform="rotate(96.687843)"/>
          <!-- Pill upper-left #1 -->
          <rect x="-38.146" y="-136.978" width="26.819" height="45.578" rx="12.763"
            fill="none" :stroke="darkStroke2" stroke-width="1.3"
            transform="matrix(-0.71567501,0.69843345,-0.69975812,-0.71437985,0,0)"/>
          <!-- Pill upper-left #2 -->
          <rect x="-39.708" y="-297.05" width="26.819" height="45.578" rx="12.763"
            fill="none" :stroke="darkStroke2" stroke-width="1.3"
            transform="matrix(-0.71567501,0.69843345,-0.69975812,-0.71437985,0,0)"/>
          <!-- Pill far right red -->
          <rect x="202.533" y="-145.402" width="26.742" height="56.733" rx="12.763"
            fill="none" :stroke="darkStroke3" stroke-width="1.3"
            transform="matrix(0.69843345,0.71567501,-0.71437985,0.69975812,0,0)"/>
          <!-- Group: pill + circle center -->
          <g>
            <rect x="140.395" y="-137.985" width="26.742" height="56.733" rx="12.763"
              fill="none" :stroke="darkStroke2" stroke-width="1.3"
              transform="matrix(0.69843345,0.71567501,-0.71437985,0.69975812,0,0)"/>
            <ellipse cx="-0.266" cy="-197.839" rx="13.371" ry="13.371"
              fill="none" :stroke="darkStroke1" stroke-width="1.3"
              transform="rotate(96.687843)"/>
          </g>
          <!-- Group: pill + circle lower -->
          <g transform="translate(74.812,-6.624)">
            <rect x="-221.068" y="54.532" width="26.535" height="83.669" rx="12.708"
              fill="none" :stroke="darkStroke2" stroke-width="1.3"
              transform="matrix(-0.69843345,-0.71567501,0.71437985,-0.69975812,0,0)"/>
            <ellipse cx="-78.082" cy="203.983" rx="13.371" ry="13.371"
              fill="none" :stroke="darkStroke1" stroke-width="1.3"
              transform="rotate(-83.312157)"/>
          </g>
          <!-- Group: large pill + circle bottom -->
          <g>
            <rect x="-232.806" y="-82.012" width="26.601" height="104.766" rx="12.708"
              fill="none" :stroke="darkStroke2" stroke-width="1.3"
              transform="matrix(-0.69843345,-0.71567501,0.71437985,-0.69975812,0,0)"/>
            <ellipse cx="-191.728" cy="127.351" rx="13.371" ry="13.371"
              fill="none" :stroke="darkStroke1" stroke-width="1.3"
              transform="rotate(-83.312157)"/>
          </g>
        </svg>
      </div>
    </template>
    <template #light>
      <div class="slide-bg">
        <svg viewBox="-80 -65 380 330" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid slice"
          :style="{ position:'absolute', inset:'0', width:'100%', height:'100%', opacity: props.opacity }">
          <!-- Pill diagonal -->
          <rect x="44.133" y="177.143" width="26.519" height="67.13" rx="13.26"
            fill="none" :stroke="lightStroke1" stroke-width="1.3"
            transform="matrix(0.71567501,-0.69843345,0.69975812,0.71437985,0,0)"/>
          <!-- Circle top -->
          <ellipse cx="52.413" cy="-155.864" rx="13.371" ry="13.371"
            fill="none" :stroke="lightStroke1" stroke-width="1.3"
            transform="rotate(96.687843)"/>
          <!-- Circle red -->
          <ellipse cx="179.209" cy="-265.051" rx="13.371" ry="13.371"
            fill="none" :stroke="lightStroke3" stroke-width="1.3"
            transform="rotate(96.687843)"/>
          <!-- Pill upper-left #1 -->
          <rect x="-38.146" y="-136.978" width="26.819" height="45.578" rx="12.763"
            fill="none" :stroke="lightStroke2" stroke-width="1.3"
            transform="matrix(-0.71567501,0.69843345,-0.69975812,-0.71437985,0,0)"/>
          <!-- Pill upper-left #2 -->
          <rect x="-39.708" y="-297.05" width="26.819" height="45.578" rx="12.763"
            fill="none" :stroke="lightStroke2" stroke-width="1.3"
            transform="matrix(-0.71567501,0.69843345,-0.69975812,-0.71437985,0,0)"/>
          <!-- Pill far right red -->
          <rect x="202.533" y="-145.402" width="26.742" height="56.733" rx="12.763"
            fill="none" :stroke="lightStroke3" stroke-width="1.3"
            transform="matrix(0.69843345,0.71567501,-0.71437985,0.69975812,0,0)"/>
          <!-- Group: pill + circle center -->
          <g>
            <rect x="140.395" y="-137.985" width="26.742" height="56.733" rx="12.763"
              fill="none" :stroke="lightStroke2" stroke-width="1.3"
              transform="matrix(0.69843345,0.71567501,-0.71437985,0.69975812,0,0)"/>
            <ellipse cx="-0.266" cy="-197.839" rx="13.371" ry="13.371"
              fill="none" :stroke="lightStroke1" stroke-width="1.3"
              transform="rotate(96.687843)"/>
          </g>
          <!-- Group: pill + circle lower -->
          <g transform="translate(74.812,-6.624)">
            <rect x="-221.068" y="54.532" width="26.535" height="83.669" rx="12.708"
              fill="none" :stroke="lightStroke2" stroke-width="1.3"
              transform="matrix(-0.69843345,-0.71567501,0.71437985,-0.69975812,0,0)"/>
            <ellipse cx="-78.082" cy="203.983" rx="13.371" ry="13.371"
              fill="none" :stroke="lightStroke1" stroke-width="1.3"
              transform="rotate(-83.312157)"/>
          </g>
          <!-- Group: large pill + circle bottom -->
          <g>
            <rect x="-232.806" y="-82.012" width="26.601" height="104.766" rx="12.708"
              fill="none" :stroke="lightStroke2" stroke-width="1.3"
              transform="matrix(-0.69843345,-0.71567501,0.71437985,-0.69975812,0,0)"/>
            <ellipse cx="-191.728" cy="127.351" rx="13.371" ry="13.371"
              fill="none" :stroke="lightStroke1" stroke-width="1.3"
              transform="rotate(-83.312157)"/>
          </g>
        </svg>
      </div>
    </template>
  </LightOrDark>
</template>
